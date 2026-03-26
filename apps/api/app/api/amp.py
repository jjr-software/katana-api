from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.amp_queue import amp_job_queue
from app.deps import get_amp_client, get_db
from app.katana import AmpClient, AmpClientError, SlotDump, SlotPatchSummary
from app.models import PatchSet, PatchSetMember

router = APIRouter(prefix="/api/v1/amp", tags=["amp"])


class AmpConnectionTestResponse(BaseModel):
    ok: bool
    midi_port: str
    request_hex: str
    response_hex: str


class CurrentPatchResponse(BaseModel):
    created_at: str
    patch: dict


class SlotPatchSummaryResponse(BaseModel):
    slot: int
    slot_label: str
    patch_name: str
    config_hash_sha256: str
    synced_at: str
    slot_sync_ms: int
    curated: list[dict]


class SlotsStateResponse(BaseModel):
    synced_at: str
    amp_state_hash_sha256: str
    total_sync_ms: int
    slots: list[SlotPatchSummaryResponse]


class FullDumpSlotResponse(BaseModel):
    slot: int
    slot_label: str
    synced_at: str
    slot_sync_ms: int
    patch: dict
    curated: list[dict]


class FullAmpDumpResponse(BaseModel):
    synced_at: str
    amp_state_hash_sha256: str
    total_sync_ms: int
    slots: list[FullDumpSlotResponse]


class AmpDeviceStatusResponse(BaseModel):
    midi_port: str
    busy: bool
    available: bool
    concurrency_supported: bool
    detail: str
    checked_at: str


class SlotsSyncEnqueueResponse(BaseModel):
    job_id: str
    status: str
    created_at: str


class SlotsSyncJobResponse(BaseModel):
    job_id: str
    status: str
    created_at: str
    started_at: str | None = None
    finished_at: str | None = None
    error: str | None = None
    result: SlotsStateResponse | None = None


@router.get("/test-connection", response_model=AmpConnectionTestResponse)
async def test_connection(client: AmpClient = Depends(get_amp_client)) -> AmpConnectionTestResponse:
    try:
        result = await client.test_connection()
    except AmpClientError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to query amp identity",
                "error": str(exc),
                "midi_port": client.midi_port,
            },
        ) from exc

    return AmpConnectionTestResponse(
        ok=True,
        midi_port=result.midi_port,
        request_hex=result.request_hex,
        response_hex=result.response_hex,
    )


@router.get("/device-status", response_model=AmpDeviceStatusResponse)
async def device_status(client: AmpClient = Depends(get_amp_client)) -> AmpDeviceStatusResponse:
    status = await client.read_device_status()
    return AmpDeviceStatusResponse(
        midi_port=status.midi_port,
        busy=status.busy,
        available=status.available,
        concurrency_supported=False,
        detail=status.detail,
        checked_at=datetime.now().isoformat(timespec="seconds"),
    )


@router.get("/current-patch", response_model=CurrentPatchResponse)
async def current_patch(client: AmpClient = Depends(get_amp_client)) -> CurrentPatchResponse:
    try:
        snapshot = await client.read_current_patch()
    except AmpClientError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to read current patch from amp",
                "error": str(exc),
                "midi_port": client.midi_port,
            },
        ) from exc

    return CurrentPatchResponse(
        created_at=datetime.now().isoformat(timespec="seconds"),
        patch=snapshot.payload,
    )


@router.get("/slots", response_model=SlotsStateResponse)
async def slots_state(
    client: AmpClient = Depends(get_amp_client),
    db: Session = Depends(get_db),
) -> SlotsStateResponse:
    synced_at = datetime.now().isoformat(timespec="seconds")
    try:
        state = await client.read_slots_state(synced_at=synced_at)
    except AmpClientError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to read amp slots",
                "error": str(exc),
                "midi_port": client.midi_port,
            },
        ) from exc

    curated_by_hash = _load_curation_by_hash(db, [slot.config_hash_sha256 for slot in state.slots])
    return SlotsStateResponse(
        synced_at=state.synced_at,
        amp_state_hash_sha256=state.amp_state_hash_sha256,
        total_sync_ms=state.total_sync_ms,
        slots=[SlotPatchSummaryResponse(**_slot_to_dict(slot, curated_by_hash)) for slot in state.slots],
    )


@router.post("/slots/sync", response_model=SlotsSyncEnqueueResponse)
async def enqueue_slots_sync() -> SlotsSyncEnqueueResponse:
    job = await amp_job_queue.enqueue_slots_sync()
    return SlotsSyncEnqueueResponse(
        job_id=job.job_id,
        status=job.status,
        created_at=job.created_at,
    )


@router.get("/slots/sync/{job_id}", response_model=SlotsSyncJobResponse)
async def get_slots_sync_job(job_id: str, db: Session = Depends(get_db)) -> SlotsSyncJobResponse:
    job = await amp_job_queue.get_job(job_id)
    if job is None:
        raise HTTPException(
            status_code=404,
            detail={"message": "Slots sync job not found", "job_id": job_id},
        )

    result: SlotsStateResponse | None = None
    if job.result is not None:
        curated_by_hash = _load_curation_by_hash(
            db,
            [slot.config_hash_sha256 for slot in job.result.slots],
        )
        result = SlotsStateResponse(
            synced_at=job.result.synced_at,
            amp_state_hash_sha256=job.result.amp_state_hash_sha256,
            total_sync_ms=job.result.total_sync_ms,
            slots=[SlotPatchSummaryResponse(**_slot_to_dict(slot, curated_by_hash)) for slot in job.result.slots],
        )

    return SlotsSyncJobResponse(
        job_id=job.job_id,
        status=job.status,
        created_at=job.created_at,
        started_at=job.started_at,
        finished_at=job.finished_at,
        error=job.error,
        result=result,
    )


def _slot_to_dict(slot: SlotPatchSummary, curated_by_hash: dict[str, list[dict]]) -> dict:
    return {
        "slot": slot.slot,
        "slot_label": slot.slot_label,
        "patch_name": slot.patch_name,
        "config_hash_sha256": slot.config_hash_sha256,
        "synced_at": slot.synced_at,
        "slot_sync_ms": slot.slot_sync_ms,
        "curated": curated_by_hash.get(slot.config_hash_sha256, []),
    }


@router.get("/full-dump", response_model=FullAmpDumpResponse)
async def full_amp_dump(
    client: AmpClient = Depends(get_amp_client),
    db: Session = Depends(get_db),
) -> FullAmpDumpResponse:
    synced_at = datetime.now().isoformat(timespec="seconds")
    try:
        dump = await client.full_amp_dump(synced_at=synced_at)
    except AmpClientError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to read full amp dump",
                "error": str(exc),
                "midi_port": client.midi_port,
            },
        ) from exc
    curated_by_hash = _load_curation_by_hash(
        db,
        [str(item.payload.get("config_hash_sha256", "")) for item in dump.slots],
    )
    return FullAmpDumpResponse(
        synced_at=dump.synced_at,
        amp_state_hash_sha256=dump.amp_state_hash_sha256,
        total_sync_ms=dump.total_sync_ms,
        slots=[FullDumpSlotResponse(**_slot_dump_to_dict(item, curated_by_hash)) for item in dump.slots],
    )


def _slot_dump_to_dict(slot: SlotDump, curated_by_hash: dict[str, list[dict]]) -> dict:
    hash_id = str(slot.payload.get("config_hash_sha256", ""))
    return {
        "slot": slot.slot,
        "slot_label": slot.slot_label,
        "synced_at": slot.synced_at,
        "slot_sync_ms": slot.slot_sync_ms,
        "patch": slot.payload,
        "curated": curated_by_hash.get(hash_id, []),
    }


def _load_curation_by_hash(db: Session, hash_ids: list[str]) -> dict[str, list[dict]]:
    clean_hashes = [item for item in hash_ids if item]
    if not clean_hashes:
        return {}
    rows = db.execute(
        select(
            PatchSetMember.hash_id,
            PatchSet.id,
            PatchSet.name,
            PatchSet.notes,
            PatchSetMember.variation_note,
        )
        .join(PatchSet, PatchSet.id == PatchSetMember.patch_set_id)
        .where(PatchSetMember.hash_id.in_(clean_hashes))
        .order_by(PatchSet.name.asc(), PatchSetMember.id.asc())
    ).all()
    out: dict[str, list[dict]] = {}
    for hash_id, set_id, set_name, set_notes, variation_note in rows:
        out.setdefault(hash_id, []).append(
            {
                "patch_set_id": set_id,
                "patch_set_name": set_name,
                "patch_set_notes": set_notes or "",
                "variation_note": variation_note or "",
            }
        )
    return out
