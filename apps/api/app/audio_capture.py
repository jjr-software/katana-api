import asyncio
import io
import math
import struct
import wave
from dataclasses import dataclass

KATANA_USB_SOURCE = "alsa_input.usb-Roland_KATANA3-01.analog-surround-40"
KATANA_CAPTURE_RATE = 48_000
KATANA_CAPTURE_CHANNELS = 1


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


@dataclass(frozen=True)
class LiveAudioMetrics:
    rms_dbfs: float
    peak_dbfs: float
    sample_count: int


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


def analyze_f32le_metrics(raw: bytes) -> LiveAudioMetrics | None:
    samples = _decode_f32le_samples(raw)
    if not samples:
        return None
    s2 = 0.0
    peak = 0.0
    for value in samples:
        amp = abs(value)
        s2 += value * value
        if amp > peak:
            peak = amp
    rms = math.sqrt(s2 / len(samples))
    return LiveAudioMetrics(
        rms_dbfs=round(_linear_to_dbfs(rms), 3),
        peak_dbfs=round(_linear_to_dbfs(peak), 3),
        sample_count=len(samples),
    )


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


def _channel_map_for_count(channels: int) -> str:
    if channels == 1:
        return "FL"
    if channels == 2:
        return "FL,FR"
    raise RuntimeError("Katana capture supports only 1 or 2 channels")


def _pw_record_args(source: str, rate: int, channels: int) -> list[str]:
    if channels <= 0:
        raise RuntimeError("channels must be > 0")
    return [
        "pw-record",
        "--target",
        source,
        "--rate",
        str(rate),
        "--channels",
        str(channels),
        "--channel-map",
        _channel_map_for_count(channels),
        "--format",
        "f32",
        "--latency",
        "256",
        "-",
    ]


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
        *_pw_record_args(source=source, rate=rate, channels=channels),
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
    analyzed = analyze_f32le_metrics(stdout_bytes)
    if analyzed is None:
        raise RuntimeError("no audio samples captured")
    metrics = AudioSampleMetrics(
        rms_dbfs=analyzed.rms_dbfs,
        peak_dbfs=analyzed.peak_dbfs,
        sample_count=analyzed.sample_count,
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


class PipeWireLiveMeter:
    def __init__(self, source: str, rate: int, channels: int, window_sec: float) -> None:
        self.source = source
        self.rate = int(rate)
        self.channels = int(channels)
        self.window_sec = float(window_sec)
        self._proc: asyncio.subprocess.Process | None = None
        self._bytes_per_window = int(self.rate * self.channels * self.window_sec * 4)

    async def start(self) -> None:
        if self._bytes_per_window <= 0:
            raise RuntimeError("window size must produce >0 bytes")
        if self._proc is not None and self._proc.returncode is None:
            return
        self._proc = await asyncio.create_subprocess_exec(
            "timeout",
            "365d",
            *_pw_record_args(source=self.source, rate=self.rate, channels=self.channels),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        if self._proc.stdout is None:
            raise RuntimeError("failed to start persistent pw-record stream")

    async def close(self) -> None:
        if self._proc is None:
            return
        if self._proc.returncode is None:
            self._proc.terminate()
            try:
                await asyncio.wait_for(self._proc.wait(), timeout=1.5)
            except asyncio.TimeoutError:
                self._proc.kill()
                await self._proc.wait()
        self._proc = None

    async def _read_exact(self, total: int) -> bytes:
        if self._proc is None or self._proc.stdout is None:
            raise RuntimeError("live meter is not started")
        buf = bytearray()
        while len(buf) < total:
            chunk = await self._proc.stdout.read(total - len(buf))
            if not chunk:
                break
            buf.extend(chunk)
        return bytes(buf)

    async def read_window(self) -> LiveAudioMetrics:
        raw = await self._read_exact(self._bytes_per_window)
        analyzed = analyze_f32le_metrics(raw)
        if analyzed is None:
            raise RuntimeError("no audio samples captured from persistent stream")
        return analyzed
