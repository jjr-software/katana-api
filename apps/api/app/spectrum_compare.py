import asyncio
from datetime import datetime
from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field

from app.amp_queue import amp_job_queue
from app.audio_capture import (
    KATANA_CAPTURE_CHANNELS,
    KATANA_CAPTURE_RATE,
    SPECTRUM_COMPARE_BANDS,
    capture_audio_sample,
    spectrum_compare_band_energies,
)

SPECTRUM_CAPTURE_SETTLE_SEC = 0.5
SPECTRUM_CAPTURE_DURATION_SEC = 4.0

class SpectrumBandResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    label: str
    low_hz: int = Field(ge=0)
    high_hz: int = Field(gt=0)
    energy_dbfs: float = Field(ge=-120, le=0)


class SpectrumStageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    label: str
    active: bool
    detail: str | None = None


class SpectrumMeasurementResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    captured_at: str
    prompt: str
    capture_duration_sec: float
    rms_dbfs: float = Field(ge=-120, le=0)
    peak_dbfs: float = Field(ge=-120, le=0)
    patch_name: str
    active_slot_label: str
    bands: list[SpectrumBandResponse] = Field(min_length=8, max_length=8)
    stages: list[SpectrumStageResponse]


async def capture_spectrum_measurement() -> SpectrumMeasurementResponse:
    job = await amp_job_queue.enqueue_current_patch()
    patch = await _await_current_patch(job.job_id)

    await asyncio.sleep(SPECTRUM_CAPTURE_SETTLE_SEC)
    captured = await capture_audio_sample(
        source=None,
        duration_sec=SPECTRUM_CAPTURE_DURATION_SEC,
        rate=KATANA_CAPTURE_RATE,
        channels=KATANA_CAPTURE_CHANNELS,
    )
    energies = spectrum_compare_band_energies(captured.samples, rate=captured.metrics.rate)
    bands = [
        SpectrumBandResponse(id=band_id, label=label, low_hz=low_hz, high_hz=high_hz, energy_dbfs=energy)
        for (band_id, label, low_hz, high_hz), energy in zip(SPECTRUM_COMPARE_BANDS, energies, strict=True)
    ]
    return SpectrumMeasurementResponse(
        captured_at=datetime.now().isoformat(timespec="seconds"),
        prompt="Play now — capturing four seconds.",
        capture_duration_sec=SPECTRUM_CAPTURE_DURATION_SEC,
        rms_dbfs=captured.metrics.rms_dbfs,
        peak_dbfs=captured.metrics.peak_dbfs,
        patch_name=_display_patch_name(patch),
        active_slot_label=_active_slot_label(patch),
        bands=bands,
        stages=_stage_summaries(patch),
    )


async def _await_current_patch(job_id: str) -> dict[str, Any]:
    deadline = asyncio.get_running_loop().time() + 60.0
    while True:
        job = await amp_job_queue.get_job(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail={"message": "Amp read job was not found"})
        if job.status == "succeeded" and job.result_current_patch is not None:
            return job.result_current_patch
        if job.status == "failed":
            raise HTTPException(status_code=502, detail={"message": "Failed to read current patch", "error": job.error})
        if asyncio.get_running_loop().time() >= deadline:
            raise HTTPException(status_code=504, detail={"message": "Timed out reading current patch"})
        await asyncio.sleep(0.1)


def _display_patch_name(patch: dict[str, Any]) -> str:
    name = patch.get("patch_name")
    return name.strip() if isinstance(name, str) and name.strip() else "Live Patch"


def _active_slot_label(patch: dict[str, Any]) -> str:
    active_slot = patch.get("active_slot")
    if isinstance(active_slot, dict):
        label = active_slot.get("label")
        if isinstance(label, str) and label:
            return label
    return "Live"


def _stage_summaries(patch: dict[str, Any]) -> list[SpectrumStageResponse]:
    stages = patch.get("stages")
    stage_data = stages if isinstance(stages, dict) else {}
    summaries = [SpectrumStageResponse(id="amp", label="Amp", active=True)]
    definitions = (
        ("booster", "Booster", "on"),
        ("mod", "Mod", "on"),
        ("fx", "FX", "on"),
        ("delay", "Delay", "on"),
        ("delay2", "Delay 2", "delay2_on"),
        ("reverb", "Reverb", "on"),
        ("eq1", "EQ 1", "on"),
        ("eq2", "EQ 2", "on"),
        ("ns", "Noise Suppressor", "on"),
        ("send_return", "Send/Return", "on"),
        ("solo", "Solo", "on"),
        ("pedalfx", "Pedal FX", "on"),
    )
    for stage_id, label, active_key in definitions:
        source_id = "delay" if stage_id == "delay2" else stage_id
        stage = stage_data.get(source_id)
        payload = stage if isinstance(stage, dict) else {}
        summaries.append(SpectrumStageResponse(id=stage_id, label=label, active=payload.get(active_key) is True))
    return summaries
