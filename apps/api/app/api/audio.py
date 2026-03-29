import asyncio
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import Response, StreamingResponse

from app.audio_capture import (
    KATANA_CAPTURE_CHANNELS,
    KATANA_CAPTURE_RATE,
    KATANA_USB_SOURCE,
    PipeWireLiveMeter,
    capture_audio_sample,
)
from app.deps import get_db
from app.models import AudioSample, PatchConfig, PatchObject

router = APIRouter(prefix="/api/v1/audio", tags=["audio"])


class AudioSampleCreateRequest(BaseModel):
    patch_hash: str | None = Field(default=None, min_length=64, max_length=64)
    patch_object_id: int | None = Field(default=None, ge=1)
    slot: int | None = Field(default=None, ge=1, le=8)
    source: str = Field(default=KATANA_USB_SOURCE, min_length=1, max_length=255)
    duration_sec: float = Field(default=2.0, gt=0.2, le=30.0)
    rate: int = Field(default=KATANA_CAPTURE_RATE, ge=8_000, le=192_000)
    channels: int = Field(default=KATANA_CAPTURE_CHANNELS, ge=1, le=2)


class AudioSampleResponse(BaseModel):
    id: int
    patch_hash: str | None = None
    patch_name: str | None = None
    patch_object_id: int | None = None
    patch_object_name: str | None = None
    slot: int | None = None
    slot_label: str | None = None
    source: str
    duration_sec: int
    rate: int
    channels: int
    rms_dbfs: float
    peak_dbfs: float
    sample_count: int
    has_audio: bool
    playback_url: str | None = None
    is_level_marker: bool = False
    created_at: str


@router.post("/measure", response_model=AudioSampleResponse)
async def create_audio_measurement(
    payload: AudioSampleCreateRequest,
    db: Session = Depends(get_db),
) -> AudioSampleResponse:
    if payload.patch_hash:
        exists = db.get(PatchConfig, payload.patch_hash)
        if exists is None:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "patch_hash is not in patch library; save patch first or omit hash linkage",
                    "patch_hash": payload.patch_hash,
                },
            )
    if payload.patch_object_id is not None and db.get(PatchObject, payload.patch_object_id) is None:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "patch_object_id is not in tone library",
                "patch_object_id": payload.patch_object_id,
            },
        )
    sample = await capture_audio_sample(
        source=payload.source,
        duration_sec=payload.duration_sec,
        rate=payload.rate,
        channels=payload.channels,
    )
    row = AudioSample(
        patch_hash=payload.patch_hash,
        patch_object_id=payload.patch_object_id,
        slot=payload.slot,
        source=sample.metrics.source,
        duration_sec=int(round(sample.metrics.duration_sec)),
        rate=sample.metrics.rate,
        channels=sample.metrics.channels,
        rms_dbfs=sample.metrics.rms_dbfs,
        peak_dbfs=sample.metrics.peak_dbfs,
        sample_count=sample.metrics.sample_count,
        audio_wav=sample.wav_bytes,
        is_level_marker=False,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    if payload.patch_hash:
        config = db.get(PatchConfig, payload.patch_hash)
        if config is None:
            raise HTTPException(
                status_code=500,
                detail={
                    "message": "Patch config disappeared before measurement metadata update",
                    "patch_hash": payload.patch_hash,
                },
            )
        config.measured_rms_dbfs = row.rms_dbfs
        config.measured_peak_dbfs = row.peak_dbfs
        config.measured_at = row.created_at
        db.commit()
    return _audio_sample_response(row, db)


@router.get("/measures", response_model=list[AudioSampleResponse])
def list_audio_measurements(
    limit: int = 50,
    patch_hash: str | None = None,
    patch_object_id: int | None = None,
    db: Session = Depends(get_db),
) -> list[AudioSampleResponse]:
    bounded = max(1, min(limit, 200))
    query = select(AudioSample)
    if patch_hash:
        query = query.where(AudioSample.patch_hash == patch_hash)
    if patch_object_id is not None:
        query = query.where(AudioSample.patch_object_id == patch_object_id)
    rows = list(db.scalars(query.order_by(AudioSample.id.desc()).limit(bounded)))
    return [_audio_sample_response(row, db) for row in rows]


class AudioLevelMarkerCaptureRequest(BaseModel):
    source: str = Field(default=KATANA_USB_SOURCE, min_length=1, max_length=255)
    duration_sec: float = Field(default=2.0, gt=0.2, le=30.0)
    rate: int = Field(default=KATANA_CAPTURE_RATE, ge=8_000, le=192_000)
    channels: int = Field(default=KATANA_CAPTURE_CHANNELS, ge=1, le=2)


def _sse_event(payload: dict) -> str:
    return f"data: {json.dumps(payload, separators=(',', ':'))}\n\n"


def _audio_sample_response(row: AudioSample, db: Session) -> AudioSampleResponse:
    patch_name: str | None = None
    patch_object_name: str | None = None
    if row.patch_hash:
        config = db.get(PatchConfig, row.patch_hash)
        if config is not None:
            patch_name_raw = config.snapshot.get("patch_name")
            if isinstance(patch_name_raw, str) and patch_name_raw.strip():
                patch_name = patch_name_raw.strip()
    if row.patch_object_id:
        patch_object = db.get(PatchObject, row.patch_object_id)
        if patch_object is not None:
            patch_object_name = patch_object.name
            if patch_name is None:
                patch_name = patch_object.name
    slot_label: str | None = None
    if row.slot is not None and 1 <= row.slot <= 8:
        bank = "A" if row.slot <= 4 else "B"
        channel = row.slot if row.slot <= 4 else row.slot - 4
        slot_label = f"{bank}:{channel}"
    return AudioSampleResponse(
        id=row.id,
        patch_hash=row.patch_hash,
        patch_name=patch_name,
        patch_object_id=row.patch_object_id,
        patch_object_name=patch_object_name,
        slot=row.slot,
        slot_label=slot_label,
        source=row.source,
        duration_sec=row.duration_sec,
        rate=row.rate,
        channels=row.channels,
        rms_dbfs=row.rms_dbfs,
        peak_dbfs=row.peak_dbfs,
        sample_count=row.sample_count,
        has_audio=row.audio_wav is not None,
        playback_url=f"/api/v1/audio/measures/{row.id}/wav" if row.audio_wav is not None else None,
        is_level_marker=row.is_level_marker,
        created_at=row.created_at.isoformat(timespec="seconds"),
    )


@router.post("/marker/capture", response_model=AudioSampleResponse)
async def capture_audio_level_marker(
    payload: AudioLevelMarkerCaptureRequest,
    db: Session = Depends(get_db),
) -> AudioSampleResponse:
    sample = await capture_audio_sample(
        source=payload.source,
        duration_sec=payload.duration_sec,
        rate=payload.rate,
        channels=payload.channels,
    )
    db.execute(update(AudioSample).where(AudioSample.is_level_marker.is_(True)).values(is_level_marker=False))
    row = AudioSample(
        patch_hash=None,
        slot=None,
        source=sample.metrics.source,
        duration_sec=int(round(sample.metrics.duration_sec)),
        rate=sample.metrics.rate,
        channels=sample.metrics.channels,
        rms_dbfs=sample.metrics.rms_dbfs,
        peak_dbfs=sample.metrics.peak_dbfs,
        sample_count=sample.metrics.sample_count,
        audio_wav=sample.wav_bytes,
        is_level_marker=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _audio_sample_response(row, db)


@router.get("/marker", response_model=AudioSampleResponse)
def get_audio_level_marker(db: Session = Depends(get_db)) -> AudioSampleResponse:
    row = db.scalar(
        select(AudioSample)
        .where(AudioSample.is_level_marker.is_(True))
        .order_by(AudioSample.id.desc())
        .limit(1)
    )
    if row is None:
        raise HTTPException(
            status_code=404,
            detail={"message": "Audio level marker not set"},
        )
    return _audio_sample_response(row, db)


@router.get("/measures/{sample_id:int}/wav")
def get_audio_measurement_wav(
    sample_id: int,
    db: Session = Depends(get_db),
) -> Response:
    row = db.get(AudioSample, sample_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"message": "Audio sample not found", "sample_id": sample_id})
    if row.audio_wav is None:
        raise HTTPException(status_code=404, detail={"message": "Audio sample has no stored audio", "sample_id": sample_id})
    return Response(
        content=row.audio_wav,
        media_type="audio/wav",
        headers={"Content-Disposition": f'inline; filename="audio-sample-{sample_id}.wav"'},
    )


@router.get("/live/sse")
async def stream_live_audio_measurement_sse(
    request: Request,
    source: str = KATANA_USB_SOURCE,
    window_sec: float = 0.5,
    rate: int = KATANA_CAPTURE_RATE,
    channels: int = KATANA_CAPTURE_CHANNELS,
) -> StreamingResponse:
    bounded_window = max(0.2, min(window_sec, 5.0))
    bounded_rate = max(8_000, min(rate, 192_000))
    bounded_channels = max(1, min(channels, 2))
    meter = PipeWireLiveMeter(
        source=source,
        rate=bounded_rate,
        channels=bounded_channels,
        window_sec=bounded_window,
    )

    async def event_stream() -> object:
        await meter.start()
        try:
            yield _sse_event(
                {
                    "type": "connected",
                    "source": source,
                    "window_sec": bounded_window,
                    "rate": bounded_rate,
                    "channels": bounded_channels,
                    "ts": datetime.now().isoformat(timespec="seconds"),
                }
            )
            while True:
                if await request.is_disconnected():
                    return
                sample = await meter.read_window()
                yield _sse_event(
                    {
                        "type": "audio_metrics",
                        "rms_dbfs": sample.rms_dbfs,
                        "peak_dbfs": sample.peak_dbfs,
                        "fft_bins_db": sample.fft_bins_db,
                        "sample_count": sample.sample_count,
                        "duration_sec": bounded_window,
                        "source": source,
                        "ts": datetime.now().isoformat(timespec="seconds"),
                    }
                )
        finally:
            await meter.close()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
