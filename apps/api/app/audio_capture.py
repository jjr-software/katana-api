import asyncio
import io
import math
import struct
import wave
from dataclasses import dataclass


@dataclass(frozen=True)
class AudioSampleMetrics:
    rms_dbfs: float
    peak_dbfs: float
    sample_count: int
    source: str
    duration_sec: float
    rate: int
    channels: int


@dataclass(frozen=True)
class AudioCaptureResult:
    metrics: AudioSampleMetrics
    wav_bytes: bytes


def _linear_to_dbfs(value: float) -> float:
    if value <= 1e-12:
        return -120.0
    return 20.0 * math.log10(value)


def _decode_f32le_samples(raw: bytes) -> list[float]:
    usable = (len(raw) // 4) * 4
    if usable <= 0:
        return []
    vals = struct.unpack("<" + ("f" * (usable // 4)), raw[:usable])
    out: list[float] = []
    for v in vals:
        if math.isfinite(v):
            out.append(max(-1.0, min(1.0, float(v))))
    return out


def _encode_wav_bytes(samples: list[float], rate: int, channels: int) -> bytes:
    if channels <= 0:
        raise RuntimeError("channels must be > 0")
    pcm = bytearray()
    for value in samples:
        clipped = max(-1.0, min(1.0, float(value)))
        if clipped >= 1.0:
            sample_i16 = 32767
        elif clipped <= -1.0:
            sample_i16 = -32768
        else:
            sample_i16 = int(round(clipped * 32767.0))
        pcm.extend(struct.pack("<h", sample_i16))
    with io.BytesIO() as buffer:
        with wave.open(buffer, "wb") as wav:
            wav.setnchannels(int(channels))
            wav.setsampwidth(2)
            wav.setframerate(int(rate))
            wav.writeframes(bytes(pcm))
        return buffer.getvalue()


async def capture_audio_sample(
    source: str,
    duration_sec: float,
    rate: int,
    channels: int,
) -> AudioCaptureResult:
    if duration_sec <= 0:
        raise RuntimeError("duration_sec must be > 0")
    proc = await asyncio.create_subprocess_exec(
        "timeout",
        f"{duration_sec:.3f}",
        "pw-record",
        "--target",
        source,
        "--rate",
        str(rate),
        "--channels",
        str(channels),
        "--format",
        "f32",
        "--latency",
        "256",
        "-",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout_bytes, stderr_bytes = await asyncio.wait_for(proc.communicate(), timeout=max(10.0, duration_sec + 10.0))
    except Exception:
        proc.kill()
        await proc.wait()
        raise

    if proc.returncode not in (0, 124):
        stderr = stderr_bytes.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"pw-record failed: {stderr or 'unknown error'}")

    samples = _decode_f32le_samples(stdout_bytes)
    if not samples:
        raise RuntimeError("no audio samples captured")
    s2 = 0.0
    peak = 0.0
    for v in samples:
        a = abs(v)
        if a > peak:
            peak = a
        s2 += v * v
    rms = math.sqrt(s2 / len(samples))
    metrics = AudioSampleMetrics(
        rms_dbfs=round(_linear_to_dbfs(rms), 3),
        peak_dbfs=round(_linear_to_dbfs(peak), 3),
        sample_count=len(samples),
        source=source,
        duration_sec=float(duration_sec),
        rate=int(rate),
        channels=int(channels),
    )
    return AudioCaptureResult(
        metrics=metrics,
        wav_bytes=_encode_wav_bytes(samples, rate=rate, channels=channels),
    )


async def capture_audio_metrics(
    source: str,
    duration_sec: float,
    rate: int,
    channels: int,
) -> AudioSampleMetrics:
    captured = await capture_audio_sample(
        source=source,
        duration_sec=duration_sec,
        rate=rate,
        channels=channels,
    )
    return captured.metrics
