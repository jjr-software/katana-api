from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.audio_capture import capture_audio_metrics
from app.deps import get_db
from app.models import AudioSample, PatchConfig

router = APIRouter(prefix="/api/v1/audio", tags=["audio"])


class AudioSampleCreateRequest(BaseModel):
    patch_hash: str | None = Field(default=None, min_length=64, max_length=64)
    slot: int | None = Field(default=None, ge=1, le=8)
    source: str = Field(default="alsa_input.usb-Roland_KATANA3-01.analog-surround-40", min_length=1, max_length=255)
    duration_sec: float = Field(default=2.0, gt=0.2, le=30.0)
    rate: int = Field(default=48_000, ge=8_000, le=192_000)
    channels: int = Field(default=2, ge=1, le=8)


class AudioSampleResponse(BaseModel):
    id: int
    patch_hash: str | None = None
    slot: int | None = None
    source: str
    duration_sec: int
    rate: int
    channels: int
    rms_dbfs: float
    peak_dbfs: float
    sample_count: int
    is_level_marker: bool = False
    created_at: str


@router.post("/sample", response_model=AudioSampleResponse)
async def create_audio_sample(
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
    sample = await capture_audio_metrics(
        source=payload.source,
        duration_sec=payload.duration_sec,
        rate=payload.rate,
        channels=payload.channels,
    )
    row = AudioSample(
        patch_hash=payload.patch_hash,
        slot=payload.slot,
        source=sample.source,
        duration_sec=int(round(sample.duration_sec)),
        rate=sample.rate,
        channels=sample.channels,
        rms_dbfs=sample.rms_dbfs,
        peak_dbfs=sample.peak_dbfs,
        sample_count=sample.sample_count,
        is_level_marker=False,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return AudioSampleResponse(
        id=row.id,
        patch_hash=row.patch_hash,
        slot=row.slot,
        source=row.source,
        duration_sec=row.duration_sec,
        rate=row.rate,
        channels=row.channels,
        rms_dbfs=row.rms_dbfs,
        peak_dbfs=row.peak_dbfs,
        sample_count=row.sample_count,
        is_level_marker=row.is_level_marker,
        created_at=row.created_at.isoformat(timespec="seconds"),
    )


@router.get("/samples", response_model=list[AudioSampleResponse])
def list_audio_samples(
    limit: int = 50,
    db: Session = Depends(get_db),
) -> list[AudioSampleResponse]:
    bounded = max(1, min(limit, 200))
    rows = list(db.scalars(select(AudioSample).order_by(AudioSample.id.desc()).limit(bounded)))
    out: list[AudioSampleResponse] = []
    for row in rows:
        out.append(
            AudioSampleResponse(
                id=row.id,
                patch_hash=row.patch_hash,
                slot=row.slot,
                source=row.source,
                duration_sec=row.duration_sec,
                rate=row.rate,
                channels=row.channels,
                rms_dbfs=row.rms_dbfs,
                peak_dbfs=row.peak_dbfs,
                sample_count=row.sample_count,
                is_level_marker=row.is_level_marker,
                created_at=row.created_at.isoformat(timespec="seconds"),
            )
        )
    return out


class AudioLevelMarkerCaptureRequest(BaseModel):
    source: str = Field(default="alsa_input.usb-Roland_KATANA3-01.analog-surround-40", min_length=1, max_length=255)
    duration_sec: float = Field(default=2.0, gt=0.2, le=30.0)
    rate: int = Field(default=48_000, ge=8_000, le=192_000)
    channels: int = Field(default=2, ge=1, le=8)


@router.post("/marker/capture", response_model=AudioSampleResponse)
async def capture_audio_level_marker(
    payload: AudioLevelMarkerCaptureRequest,
    db: Session = Depends(get_db),
) -> AudioSampleResponse:
    sample = await capture_audio_metrics(
        source=payload.source,
        duration_sec=payload.duration_sec,
        rate=payload.rate,
        channels=payload.channels,
    )
    db.execute(update(AudioSample).where(AudioSample.is_level_marker.is_(True)).values(is_level_marker=False))
    row = AudioSample(
        patch_hash=None,
        slot=None,
        source=sample.source,
        duration_sec=int(round(sample.duration_sec)),
        rate=sample.rate,
        channels=sample.channels,
        rms_dbfs=sample.rms_dbfs,
        peak_dbfs=sample.peak_dbfs,
        sample_count=sample.sample_count,
        is_level_marker=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return AudioSampleResponse(
        id=row.id,
        patch_hash=row.patch_hash,
        slot=row.slot,
        source=row.source,
        duration_sec=row.duration_sec,
        rate=row.rate,
        channels=row.channels,
        rms_dbfs=row.rms_dbfs,
        peak_dbfs=row.peak_dbfs,
        sample_count=row.sample_count,
        is_level_marker=row.is_level_marker,
        created_at=row.created_at.isoformat(timespec="seconds"),
    )


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
    return AudioSampleResponse(
        id=row.id,
        patch_hash=row.patch_hash,
        slot=row.slot,
        source=row.source,
        duration_sec=row.duration_sec,
        rate=row.rate,
        channels=row.channels,
        rms_dbfs=row.rms_dbfs,
        peak_dbfs=row.peak_dbfs,
        sample_count=row.sample_count,
        is_level_marker=row.is_level_marker,
        created_at=row.created_at.isoformat(timespec="seconds"),
    )
