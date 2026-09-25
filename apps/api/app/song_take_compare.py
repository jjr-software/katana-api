"""Measure selected passages from a stored song take's PCM WAV."""

import io
import math
import wave
from dataclasses import dataclass

import numpy as np

from app.audio_capture import k_weighted_integrated_lufs


@dataclass(frozen=True)
class PassageLevel:
    lufs: float | None
    rms_dbfs: float


def compare_passages(
    wav_bytes: bytes, clean: tuple[float, float], dirty: tuple[float, float]
) -> tuple[PassageLevel, PassageLevel, float | None]:
    with wave.open(io.BytesIO(wav_bytes), "rb") as wav:
        rate = wav.getframerate()
        frames = wav.getnframes()
        if wav.getnchannels() != 1 or wav.getsampwidth() != 2:
            raise ValueError("Song take WAV must be mono 16-bit PCM")

        def measure(bounds: tuple[float, float]) -> PassageLevel:
            start, end = bounds
            if not 0 <= start < end <= frames / rate + 1e-6:
                raise ValueError("Selected passage must be within the recorded take and have a positive duration")
            first = min(frames, round(start * rate))
            last = min(frames, round(end * rate))
            wav.setpos(first)
            samples = np.frombuffer(wav.readframes(last - first), dtype="<i2").astype(np.float64) / 32768.0
            power = float(np.mean(np.square(samples))) if len(samples) else 0.0
            rms_dbfs = round(max(-120.0, 10 * math.log10(power)), 2) if power > 1e-24 else -120.0
            # pyloudnorm needs at least one complete 400 ms gating block.
            lufs = k_weighted_integrated_lufs(samples.tolist(), rate) if len(samples) >= math.ceil(rate * 0.4) and power > 1e-24 else None
            return PassageLevel(lufs=lufs, rms_dbfs=rms_dbfs)

        clean_level = measure(clean)
        dirty_level = measure(dirty)
    delta = round(dirty_level.lufs - clean_level.lufs, 2) if clean_level.lufs is not None and dirty_level.lufs is not None else None
    return clean_level, dirty_level, delta
