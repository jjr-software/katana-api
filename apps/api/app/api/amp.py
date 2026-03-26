import asyncio
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.amp_queue import amp_job_queue
from app.deps import get_amp_client, get_db
from app.katana import AmpClient, QuickSlotName, SlotDump, SlotPatchSummary
from app.models import AmpSyncHistory, PatchConfig, PatchSet, PatchSetMember

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


class SlotSyncResponse(BaseModel):
    synced_at: str
    slot: SlotPatchSummaryResponse


class QuickSlotSummaryResponse(BaseModel):
    slot: int
    slot_label: str
    patch_name: str
    inferred_hash_sha256: str | None = None
    candidate_hashes_sha256: list[str]
    match_count: int
    synced_at: str
    slot_sync_ms: int


class QuickSlotsStateResponse(BaseModel):
    synced_at: str
    total_sync_ms: int
    slots: list[QuickSlotSummaryResponse]


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
    operation: str
    status: str
    created_at: str


class SlotsSyncJobResponse(BaseModel):
    job_id: str
    operation: str
    status: str
    created_at: str
    started_at: str | None = None
    finished_at: str | None = None
    elapsed_ms: int
    error: str | None = None
    result: SlotsStateResponse | None = None


class QuickSyncEnqueueResponse(BaseModel):
    job_id: str
    operation: str
    status: str
    created_at: str


class QuickSyncJobResponse(BaseModel):
    job_id: str
    operation: str
    status: str
    created_at: str
    started_at: str | None = None
    finished_at: str | None = None
    elapsed_ms: int
    error: str | None = None
    result: QuickSlotsStateResponse | None = None


class BackupEnqueueResponse(BaseModel):
    job_id: str
    operation: str
    status: str
    created_at: str


class BackupJobResponse(BaseModel):
    job_id: str
    operation: str
    status: str
    created_at: str
    started_at: str | None = None
    finished_at: str | None = None
    elapsed_ms: int
    error: str | None = None
    result: FullAmpDumpResponse | None = None


class QueueJobSummaryResponse(BaseModel):
    job_id: str
    operation: str
    slot: int | None = None
    status: str
    created_at: str
    started_at: str | None = None
    finished_at: str | None = None
    elapsed_ms: int
    error: str | None = None


class QueueStateResponse(BaseModel):
    generated_at: str
    queued_count: int
    running_job_id: str | None = None
    jobs: list[QueueJobSummaryResponse]


class SyncHistoryItemResponse(BaseModel):
    id: int
    job_id: str
    operation: str
    status: str
    synced_at: str | None = None
    amp_state_hash_sha256: str | None = None
    total_sync_ms: int | None = None
    slot_count: int | None = None
    error: str | None = None
    created_at: str


@router.get("/test-connection", response_model=AmpConnectionTestResponse)
async def test_connection() -> AmpConnectionTestResponse:
    job = await amp_job_queue.enqueue_test_connection()
    settled = await _await_terminal_job(job.job_id, timeout_seconds=60.0)
    if settled.status != "succeeded" or settled.result_connection is None:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to query amp identity",
                "error": settled.error or "queued test connection failed",
                "job_id": settled.job_id,
            },
        )

    return AmpConnectionTestResponse(
        ok=True,
        midi_port=settled.result_connection.midi_port,
        request_hex=settled.result_connection.request_hex,
        response_hex=settled.result_connection.response_hex,
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
async def current_patch() -> CurrentPatchResponse:
    job = await amp_job_queue.enqueue_current_patch()
    settled = await _await_terminal_job(job.job_id, timeout_seconds=60.0)
    if settled.status != "succeeded" or settled.result_current_patch is None:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to read current patch from amp",
                "error": settled.error or "queued current patch read failed",
                "job_id": settled.job_id,
            },
        )

    return CurrentPatchResponse(
        created_at=datetime.now().isoformat(timespec="seconds"),
        patch=settled.result_current_patch,
    )


@router.get("/slots", response_model=SlotsStateResponse)
async def slots_state(
    db: Session = Depends(get_db),
) -> SlotsStateResponse:
    job = await amp_job_queue.enqueue_slots_sync()
    settled = await _await_terminal_job(job.job_id, timeout_seconds=180.0)
    if settled.status != "succeeded" or settled.result_slots is None:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to read amp slots",
                "error": settled.error or "queued slots read failed",
                "job_id": settled.job_id,
            },
        )

    state = settled.result_slots
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
        operation=job.operation,
        status=job.status,
        created_at=job.created_at,
    )


@router.post("/slots/{slot:int}/sync", response_model=SlotSyncResponse)
async def sync_single_slot(
    slot: int,
    db: Session = Depends(get_db),
) -> SlotSyncResponse:
    if slot < 1 or slot > 8:
        raise HTTPException(
            status_code=400,
            detail={"message": "slot must be in range 1..8", "slot": slot},
        )

    job = await amp_job_queue.enqueue_slot_sync(slot=slot)
    settled = await _await_terminal_job(job.job_id, timeout_seconds=90.0)
    if settled.status != "succeeded" or settled.result_slot is None:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to sync slot from amp",
                "error": settled.error or "queued slot sync failed",
                "job_id": settled.job_id,
                "slot": slot,
            },
        )

    item = settled.result_slot
    curated_by_hash = _load_curation_by_hash(db, [item.config_hash_sha256])
    return SlotSyncResponse(
        synced_at=item.synced_at,
        slot=SlotPatchSummaryResponse(**_slot_to_dict(item, curated_by_hash)),
    )


@router.post("/slots/quick/sync", response_model=QuickSyncEnqueueResponse)
async def enqueue_quick_sync() -> QuickSyncEnqueueResponse:
    job = await amp_job_queue.enqueue_quick_sync()
    return QuickSyncEnqueueResponse(
        job_id=job.job_id,
        operation=job.operation,
        status=job.status,
        created_at=job.created_at,
    )


@router.get("/slots/quick", response_model=QuickSlotsStateResponse)
async def quick_slots_state(
    db: Session = Depends(get_db),
) -> QuickSlotsStateResponse:
    job = await amp_job_queue.enqueue_quick_sync()
    settled = await _await_terminal_job(job.job_id, timeout_seconds=120.0)
    if settled.status != "succeeded" or settled.result_quick is None:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to read quick amp slot names",
                "error": settled.error or "queued quick sync failed",
                "job_id": settled.job_id,
            },
        )
    quick = settled.result_quick
    candidates_by_name = _load_hash_candidates_by_patch_name(db, [slot.patch_name for slot in quick.slots])
    slots = [
        QuickSlotSummaryResponse(**_quick_slot_to_dict(slot, candidates_by_name))
        for slot in quick.slots
    ]
    return QuickSlotsStateResponse(
        synced_at=quick.synced_at,
        total_sync_ms=quick.total_sync_ms,
        slots=slots,
    )


@router.get("/queue", response_model=QueueStateResponse)
async def queue_state() -> QueueStateResponse:
    jobs = await amp_job_queue.list_jobs(limit=50)
    running_job_id = await amp_job_queue.get_running_job_id()
    queued_count = len([job for job in jobs if job.status == "queued"])
    return QueueStateResponse(
        generated_at=datetime.now().isoformat(timespec="seconds"),
        queued_count=queued_count,
        running_job_id=running_job_id,
        jobs=[QueueJobSummaryResponse(**_queue_job_summary(job)) for job in jobs],
    )


@router.get("/sync-history", response_model=list[SyncHistoryItemResponse])
def sync_history(
    limit: int = 50,
    db: Session = Depends(get_db),
) -> list[SyncHistoryItemResponse]:
    bounded = max(1, min(limit, 200))
    rows = list(
        db.scalars(
            select(AmpSyncHistory)
            .order_by(AmpSyncHistory.id.desc())
            .limit(bounded)
        )
    )
    return [
        SyncHistoryItemResponse(
            id=item.id,
            job_id=item.job_id,
            operation=item.operation,
            status=item.status,
            synced_at=item.synced_at,
            amp_state_hash_sha256=item.amp_state_hash_sha256,
            total_sync_ms=item.total_sync_ms,
            slot_count=item.slot_count,
            error=item.error,
            created_at=item.created_at.isoformat(timespec="seconds"),
        )
        for item in rows
    ]


@router.get("/slots/sync/{job_id}", response_model=SlotsSyncJobResponse)
async def get_slots_sync_job(job_id: str, db: Session = Depends(get_db)) -> SlotsSyncJobResponse:
    job = await amp_job_queue.get_job(job_id)
    if job is None:
        raise HTTPException(
            status_code=404,
            detail={"message": "Slots sync job not found", "job_id": job_id},
        )

    result: SlotsStateResponse | None = None
    if job.result_slots is not None:
        curated_by_hash = _load_curation_by_hash(
            db,
            [slot.config_hash_sha256 for slot in job.result_slots.slots],
        )
        result = SlotsStateResponse(
            synced_at=job.result_slots.synced_at,
            amp_state_hash_sha256=job.result_slots.amp_state_hash_sha256,
            total_sync_ms=job.result_slots.total_sync_ms,
            slots=[SlotPatchSummaryResponse(**_slot_to_dict(slot, curated_by_hash)) for slot in job.result_slots.slots],
        )

    return SlotsSyncJobResponse(
        job_id=job.job_id,
        operation=job.operation,
        status=job.status,
        created_at=job.created_at,
        started_at=job.started_at,
        finished_at=job.finished_at,
        elapsed_ms=_job_elapsed_ms(job),
        error=job.error,
        result=result,
    )


@router.get("/slots/quick/sync/{job_id}", response_model=QuickSyncJobResponse)
async def get_quick_sync_job(job_id: str, db: Session = Depends(get_db)) -> QuickSyncJobResponse:
    job = await amp_job_queue.get_job(job_id)
    if job is None:
        raise HTTPException(
            status_code=404,
            detail={"message": "Quick sync job not found", "job_id": job_id},
        )

    result: QuickSlotsStateResponse | None = None
    if job.result_quick is not None:
        candidates_by_name = _load_hash_candidates_by_patch_name(
            db,
            [slot.patch_name for slot in job.result_quick.slots],
        )
        result = QuickSlotsStateResponse(
            synced_at=job.result_quick.synced_at,
            total_sync_ms=job.result_quick.total_sync_ms,
            slots=[QuickSlotSummaryResponse(**_quick_slot_to_dict(slot, candidates_by_name)) for slot in job.result_quick.slots],
        )

    return QuickSyncJobResponse(
        job_id=job.job_id,
        operation=job.operation,
        status=job.status,
        created_at=job.created_at,
        started_at=job.started_at,
        finished_at=job.finished_at,
        elapsed_ms=_job_elapsed_ms(job),
        error=job.error,
        result=result,
    )


@router.post("/backup", response_model=BackupEnqueueResponse)
async def enqueue_backup() -> BackupEnqueueResponse:
    job = await amp_job_queue.enqueue_full_dump()
    return BackupEnqueueResponse(
        job_id=job.job_id,
        operation=job.operation,
        status=job.status,
        created_at=job.created_at,
    )


@router.get("/backup/{job_id}", response_model=BackupJobResponse)
async def get_backup_job(job_id: str, db: Session = Depends(get_db)) -> BackupJobResponse:
    job = await amp_job_queue.get_job(job_id)
    if job is None:
        raise HTTPException(
            status_code=404,
            detail={"message": "Backup job not found", "job_id": job_id},
        )

    result: FullAmpDumpResponse | None = None
    if job.result_dump is not None:
        curated_by_hash = _load_curation_by_hash(
            db,
            [str(item.payload.get("config_hash_sha256", "")) for item in job.result_dump.slots],
        )
        result = FullAmpDumpResponse(
            synced_at=job.result_dump.synced_at,
            amp_state_hash_sha256=job.result_dump.amp_state_hash_sha256,
            total_sync_ms=job.result_dump.total_sync_ms,
            slots=[FullDumpSlotResponse(**_slot_dump_to_dict(item, curated_by_hash)) for item in job.result_dump.slots],
        )

    return BackupJobResponse(
        job_id=job.job_id,
        operation=job.operation,
        status=job.status,
        created_at=job.created_at,
        started_at=job.started_at,
        finished_at=job.finished_at,
        elapsed_ms=_job_elapsed_ms(job),
        error=job.error,
        result=result,
    )


def _quick_slot_to_dict(slot: QuickSlotName, candidates_by_name: dict[str, list[str]]) -> dict:
    normalized = _normalize_patch_name(slot.patch_name)
    candidates = candidates_by_name.get(normalized, [])
    inferred_hash = candidates[0] if len(candidates) == 1 else None
    return {
        "slot": slot.slot,
        "slot_label": slot.slot_label,
        "patch_name": slot.patch_name,
        "inferred_hash_sha256": inferred_hash,
        "candidate_hashes_sha256": candidates,
        "match_count": len(candidates),
        "synced_at": slot.synced_at,
        "slot_sync_ms": slot.slot_sync_ms,
    }


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


def _job_elapsed_ms(job: object) -> int:
    started = getattr(job, "started_at", None)
    finished = getattr(job, "finished_at", None)
    if not started:
        return 0
    try:
        start_dt = datetime.fromisoformat(started)
        end_dt = datetime.fromisoformat(finished) if finished else datetime.now()
    except ValueError:
        return 0
    return max(0, int(round((end_dt - start_dt).total_seconds() * 1000)))


async def _await_terminal_job(job_id: str, timeout_seconds: float) -> object:
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout_seconds
    while True:
        job = await amp_job_queue.get_job(job_id)
        if job is None:
            raise HTTPException(
                status_code=404,
                detail={"message": "Queue job not found", "job_id": job_id},
            )
        if job.status in {"succeeded", "failed"}:
            return job
        if loop.time() >= deadline:
            raise HTTPException(
                status_code=504,
                detail={"message": "Queue job timed out", "job_id": job_id},
            )
        await asyncio.sleep(0.2)


def _queue_job_summary(job: object) -> dict:
    return {
        "job_id": getattr(job, "job_id"),
        "operation": getattr(job, "operation"),
        "slot": getattr(job, "slot", None),
        "status": getattr(job, "status"),
        "created_at": getattr(job, "created_at"),
        "started_at": getattr(job, "started_at", None),
        "finished_at": getattr(job, "finished_at", None),
        "elapsed_ms": _job_elapsed_ms(job),
        "error": getattr(job, "error", None),
    }


@router.get("/full-dump", response_model=FullAmpDumpResponse)
async def full_amp_dump(
    db: Session = Depends(get_db),
) -> FullAmpDumpResponse:
    job = await amp_job_queue.enqueue_full_dump()
    settled = await _await_terminal_job(job.job_id, timeout_seconds=240.0)
    if settled.status != "succeeded" or settled.result_dump is None:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Failed to read full amp dump",
                "error": settled.error or "queued full dump failed",
                "job_id": settled.job_id,
            },
        )
    dump = settled.result_dump
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


def _load_hash_candidates_by_patch_name(db: Session, patch_names: list[str]) -> dict[str, list[str]]:
    normalized = {_normalize_patch_name(name) for name in patch_names if _normalize_patch_name(name)}
    if not normalized:
        return {}
    patch_name_expr = func.lower(PatchConfig.snapshot["patch_name"].astext)
    rows = db.execute(
        select(PatchConfig.hash_id, patch_name_expr)
        .where(patch_name_expr.in_(normalized))
        .order_by(PatchConfig.hash_id.asc())
    ).all()
    out: dict[str, list[str]] = {}
    for hash_id, name in rows:
        key = str(name or "").strip().lower()
        if not key:
            continue
        out.setdefault(key, []).append(hash_id)
    return out


def _normalize_patch_name(value: str) -> str:
    return str(value or "").strip().lower()
