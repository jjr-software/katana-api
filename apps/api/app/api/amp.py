from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.deps import get_amp_client
from app.katana import AmpClient, AmpClientError

router = APIRouter(prefix="/api/v1/amp", tags=["amp"])


class AmpConnectionTestResponse(BaseModel):
    ok: bool
    midi_port: str
    request_hex: str
    response_hex: str


class CurrentPatchResponse(BaseModel):
    created_at: str
    amp: list[int]
    booster: list[int]
    ge10_raw: list[int]
    ge10_db: list[int]
    ns: list[int]
    metadata: dict


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
        amp=snapshot.amp,
        booster=snapshot.booster,
        ge10_raw=snapshot.ge10_raw,
        ge10_db=[value - 24 for value in snapshot.ge10_raw],
        ns=snapshot.ns,
        metadata={"eq_switch": snapshot.eq_switch},
    )
