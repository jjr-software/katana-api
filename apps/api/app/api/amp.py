from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.deps import get_amp_client
from app.katana import AmpClient, AmpClientError, SlotPatchSummary

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


class SlotsStateResponse(BaseModel):
    synced_at: str
    amp_state_hash_sha256: str
    slots: list[SlotPatchSummaryResponse]


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
async def slots_state(client: AmpClient = Depends(get_amp_client)) -> SlotsStateResponse:
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

    return SlotsStateResponse(
        synced_at=state.synced_at,
        amp_state_hash_sha256=state.amp_state_hash_sha256,
        slots=[SlotPatchSummaryResponse(**_slot_to_dict(slot)) for slot in state.slots],
    )


def _slot_to_dict(slot: SlotPatchSummary) -> dict:
    return {
        "slot": slot.slot,
        "slot_label": slot.slot_label,
        "patch_name": slot.patch_name,
        "config_hash_sha256": slot.config_hash_sha256,
        "synced_at": slot.synced_at,
    }
