import asyncio
import json
import io
import math
import struct
import wave
from dataclasses import dataclass
from typing import Any

import numpy as np
import pyloudnorm as pyln

KATANA_CAPTURE_RATE = 48_000
KATANA_CAPTURE_CHANNELS = 1

SPECTRUM_COMPARE_BANDS: tuple[tuple[str, str, int, int], ...] = (
    ("sub", "Sub", 40, 125),
    ("bass", "Bass", 125, 250),
    ("low_mid", "Low Mid", 250, 500),
    ("mid", "Mid", 500, 1_000),
    ("upper_mid", "Upper Mid", 1_000, 2_000),
    ("presence", "Presence", 2_000, 4_000),
    ("brilliance", "Brilliance", 4_000, 8_000),
    ("air", "Air", 8_000, 16_000),
)


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
    samples: list[float]


@dataclass(frozen=True)
class LiveAudioMetrics:
    rms_dbfs: float
    peak_dbfs: float
    sample_count: int
    fft_bins_db: list[float]


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


def _power_of_two_floor(value: int) -> int:
    if value < 2:
        return 0
    return 1 << (value.bit_length() - 1)


def _fft_inplace(values: list[complex]) -> None:
    n = len(values)
    j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j ^= bit
        if i < j:
            values[i], values[j] = values[j], values[i]

    length = 2
    while length <= n:
        angle = -2.0 * math.pi / length
        wlen = complex(math.cos(angle), math.sin(angle))
        for start in range(0, n, length):
            w = 1 + 0j
            half = length // 2
            for offset in range(half):
                u = values[start + offset]
                v = values[start + offset + half] * w
                values[start + offset] = u + v
                values[start + offset + half] = u - v
                w *= wlen
        length <<= 1


def _build_fft_bins_db(samples: list[float], rate: int, bin_count: int = 64) -> list[float]:
    fft_size = min(2048, _power_of_two_floor(len(samples)))
    if fft_size < 256:
        return []
    windowed = samples[-fft_size:]
    values: list[complex] = []
    window_sum = 0.0
    denom = max(1, fft_size - 1)
    for index, sample in enumerate(windowed):
        hann = 0.5 - 0.5 * math.cos((2.0 * math.pi * index) / denom)
        window_sum += hann
        values.append(complex(sample * hann, 0.0))
    _fft_inplace(values)

    half = fft_size // 2
    magnitudes = [abs(values[index]) for index in range(1, half)]
    if not magnitudes:
        return []

    min_freq = 60.0
    max_freq = min(12_000.0, rate / 2.0)
    if max_freq <= min_freq:
        return []

    if window_sum <= 1e-12:
        return [-120.0] * bin_count

    log_min = math.log10(min_freq)
    log_max = math.log10(max_freq)
    out: list[float] = []
    for bucket in range(bin_count):
        start_freq = 10 ** (log_min + (bucket / bin_count) * (log_max - log_min))
        end_freq = 10 ** (log_min + ((bucket + 1) / bin_count) * (log_max - log_min))
        start_index = max(1, int(start_freq * fft_size / rate))
        end_index = min(half - 1, int(end_freq * fft_size / rate))
        if end_index < start_index:
            end_index = start_index
        bucket_mag = max(magnitudes[start_index - 1:end_index] or [0.0])
        if bucket_mag <= 1e-12:
            out.append(-120.0)
            continue
        bucket_amp = (2.0 * bucket_mag) / window_sum
        if bucket_amp <= 1e-12:
            out.append(-120.0)
            continue
        db = 20.0 * math.log10(bucket_amp)
        out.append(round(max(-120.0, min(0.0, db)), 2))
    return out


def spectrum_compare_band_energies(samples: list[float], rate: int) -> list[float]:
    """Return fixed-band RMS energy in dBFS over complete Hann-windowed frames."""
    fft_size = 8192
    frame_count = len(samples) // fft_size
    if frame_count == 0:
        raise RuntimeError("spectrum capture must contain at least one complete 8192-sample frame")

    window = [0.5 - 0.5 * math.cos((2.0 * math.pi * index) / (fft_size - 1)) for index in range(fft_size)]
    window_energy = sum(value * value for value in window)
    power_totals = [0.0] * len(SPECTRUM_COMPARE_BANDS)
    for frame_index in range(frame_count):
        start = frame_index * fft_size
        values = [complex(samples[start + index] * window[index], 0.0) for index in range(fft_size)]
        _fft_inplace(values)
        for band_index, (_, _, low_hz, high_hz) in enumerate(SPECTRUM_COMPARE_BANDS):
            start_bin = max(1, math.ceil(low_hz * fft_size / rate))
            end_bin = min((fft_size // 2) - 1, math.ceil(high_hz * fft_size / rate) - 1)
            power = sum(abs(values[bin_index]) ** 2 for bin_index in range(start_bin, end_bin + 1))
            power_totals[band_index] += (2.0 * power) / (fft_size * window_energy)

    return [round(_linear_to_dbfs(math.sqrt(total / frame_count)), 2) for total in power_totals]


def k_weighted_integrated_lufs(samples: list[float], rate: int) -> float | None:
    """Measure gated integrated loudness with the ITU-R BS.1770-4 K-weighted meter."""
    loudness = float(pyln.Meter(rate).integrated_loudness(np.asarray(samples, dtype=np.float64)))
    return round(loudness, 2) if math.isfinite(loudness) else None


def analyze_f32le_metrics(raw: bytes, rate: int = KATANA_CAPTURE_RATE) -> LiveAudioMetrics | None:
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
        fft_bins_db=_build_fft_bins_db(samples, rate=rate),
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


def _pipewire_entry_text(entry: dict[str, Any]) -> str:
    info = entry.get("info")
    props: dict[str, Any] = {}
    if isinstance(info, dict):
        props_obj = info.get("props")
        if isinstance(props_obj, dict):
            props = props_obj
    parts: list[str] = []
    for key in (
        "name",
        "node.name",
        "node.nick",
        "node.description",
        "device.name",
        "device.description",
        "media.class",
    ):
        value = props.get(key)
        if isinstance(value, str) and value.strip():
            parts.append(value.strip())
    return " ".join(parts).lower()


async def _read_pipewire_dump() -> list[dict[str, Any]]:
    proc = await asyncio.create_subprocess_exec(
        "pw-dump",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout_bytes, stderr_bytes = await proc.communicate()
    if proc.returncode != 0:
        stderr = stderr_bytes.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"pw-dump failed: {stderr or 'unknown error'}")
    try:
        parsed = json.loads(stdout_bytes.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError("pw-dump returned invalid JSON") from exc
    if not isinstance(parsed, list):
        raise RuntimeError("pw-dump returned unexpected payload")
    return [item for item in parsed if isinstance(item, dict)]


async def resolve_katana_pipewire_source(requested_source: str | None = None) -> str:
    if requested_source is not None:
        source = requested_source.strip()
        if not source:
            raise RuntimeError("requested PipeWire source must not be blank")
        if "katana" not in source.lower():
            raise RuntimeError("requested PipeWire source must resolve to the Katana input")
        return source

    entries = await _read_pipewire_dump()
    best_source: str | None = None
    best_score = -1
    available_sources: list[str] = []
    for entry in entries:
        info = entry.get("info")
        if not isinstance(info, dict):
            continue
        props_obj = info.get("props")
        if not isinstance(props_obj, dict):
            continue
        media_class = str(props_obj.get("media.class") or "").lower()
        if "source" not in media_class:
            continue
        node_name = props_obj.get("node.name")
        if not isinstance(node_name, str) or not node_name.strip():
            continue
        available_sources.append(node_name.strip())
        haystack = _pipewire_entry_text(entry)
        score = 0
        if "katana" in haystack:
            score += 100
        if "boss" in haystack:
            score += 20
        if "usb" in haystack:
            score += 10
        if "source" in media_class:
            score += 1
        if score > best_score:
            best_score = score
            best_source = node_name.strip()

    if best_source is None or best_score <= 0 or "katana" not in best_source.lower():
        available = ", ".join(available_sources) if available_sources else "none"
        raise RuntimeError(f"Katana PipeWire source not found; available sources: {available}")
    return best_source


async def capture_audio_sample(
    source: str | None,
    duration_sec: float,
    rate: int,
    channels: int,
) -> AudioCaptureResult:
    if duration_sec <= 0:
        raise RuntimeError("duration_sec must be > 0")
    resolved_source = await resolve_katana_pipewire_source(source)
    proc = await asyncio.create_subprocess_exec(
        "timeout",
        f"{duration_sec:.3f}",
        *_pw_record_args(source=resolved_source, rate=rate, channels=channels),
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
        source=resolved_source,
        duration_sec=float(duration_sec),
        rate=int(rate),
        channels=int(channels),
    )
    return AudioCaptureResult(
        metrics=metrics,
        wav_bytes=_encode_wav_bytes(samples, rate=rate, channels=channels),
        samples=samples,
    )


async def capture_audio_metrics(
    source: str | None,
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
    def __init__(self, source: str | None, rate: int, channels: int, window_sec: float) -> None:
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
        self.source = await resolve_katana_pipewire_source(self.source)
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
        analyzed = analyze_f32le_metrics(raw, rate=self.rate)
        if analyzed is None:
            raise RuntimeError("no audio samples captured from persistent stream")
        return analyzed
