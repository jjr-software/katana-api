"""Continuous Katana capture, independent of HTTP request lifetimes."""

import asyncio
import math
import tempfile
import wave
from dataclasses import dataclass
from typing import BinaryIO
from uuid import uuid4

import numpy as np

from app.audio_capture import KATANA_CAPTURE_RATE, _pw_record_args, resolve_katana_pipewire_source

WAVEFORM_WINDOW_FRAMES = KATANA_CAPTURE_RATE // 4


@dataclass(frozen=True)
class WaveformPoint:
    time_sec: float
    rms_dbfs: float


@dataclass(frozen=True)
class CompletedTake:
    id: str
    source: str
    duration_sec: float
    waveform: list[WaveformPoint]
    wav_bytes: bytes


@dataclass
class _ActiveTake:
    id: str
    source: str
    process: asyncio.subprocess.Process
    file: BinaryIO
    task: asyncio.Task[tuple[int, list[WaveformPoint]]]
    stop_requested: asyncio.Event


def _window_point(samples: np.ndarray, first_frame: int) -> WaveformPoint:
    rms = math.sqrt(float(np.mean(np.square(samples.astype(np.float64)))))
    dbfs = max(-120.0, 20.0 * math.log10(rms)) if rms > 1e-12 else -120.0
    return WaveformPoint(round(first_frame / KATANA_CAPTURE_RATE, 3), round(dbfs, 2))


class SongTakeRecorder:
    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._active: _ActiveTake | None = None

    async def start(self) -> str:
        async with self._lock:
            if self._active is not None:
                raise RuntimeError("a song take is already active")
            source = await resolve_katana_pipewire_source()
            file = tempfile.SpooledTemporaryFile(max_size=1024 * 1024, mode="w+b")
            try:
                process = await asyncio.create_subprocess_exec(
                    *_pw_record_args(source, KATANA_CAPTURE_RATE, 1),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
            except BaseException:
                file.close()
                raise
            take_id = str(uuid4())
            stop_requested = asyncio.Event()
            task = asyncio.create_task(self._record(process, file, stop_requested), name=f"song-take-{take_id}")
            self._active = _ActiveTake(take_id, source, process, file, task, stop_requested)
            return take_id

    async def stop(self) -> CompletedTake:
        async with self._lock:
            active = self._active
            if active is None:
                raise RuntimeError("no song take is active")
            active.stop_requested.set()
            if active.process.returncode is None:
                active.process.terminate()
            try:
                try:
                    frames, waveform = await asyncio.shield(active.task)
                except asyncio.CancelledError:
                    await active.task
                    raise
                active.file.seek(0)
                wav_bytes = active.file.read()
                return CompletedTake(
                    active.id,
                    active.source,
                    frames / KATANA_CAPTURE_RATE,
                    waveform,
                    wav_bytes,
                )
            finally:
                active.file.close()
                self._active = None

    async def close(self) -> None:
        async with self._lock:
            active = self._active
            if active is None:
                return
            active.stop_requested.set()
            if active.process.returncode is None:
                active.process.terminate()
            try:
                try:
                    await asyncio.shield(active.task)
                except asyncio.CancelledError:
                    await active.task
                    raise
            finally:
                active.file.close()
                self._active = None

    async def _record(
        self, process: asyncio.subprocess.Process, file: BinaryIO, stop_requested: asyncio.Event
    ) -> tuple[int, list[WaveformPoint]]:
        assert process.stdout is not None and process.stderr is not None
        stderr_task = asyncio.create_task(self._read_stderr_tail(process.stderr))
        frame_count = 0
        window_start = 0
        window_parts: list[np.ndarray] = []
        window_frames = 0
        waveform: list[WaveformPoint] = []
        remainder = b""
        try:
            with wave.open(file, "wb") as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(KATANA_CAPTURE_RATE)
                while raw := await process.stdout.read(64 * 1024):
                    data = remainder + raw
                    usable = len(data) - len(data) % 4
                    remainder = data[usable:]
                    if not usable:
                        continue
                    samples = np.frombuffer(data[:usable], dtype="<f4")
                    pcm = np.rint(np.clip(samples, -1.0, 1.0) * 32767).astype("<i2")
                    wav.writeframes(pcm.tobytes())
                    frame_count += len(samples)
                    offset = 0
                    while offset < len(samples):
                        count = min(WAVEFORM_WINDOW_FRAMES - window_frames, len(samples) - offset)
                        window_parts.append(samples[offset:offset + count])
                        window_frames += count
                        offset += count
                        if window_frames == WAVEFORM_WINDOW_FRAMES:
                            waveform.append(_window_point(np.concatenate(window_parts), window_start))
                            window_start += window_frames
                            window_parts = []
                            window_frames = 0
            returncode = await process.wait()
            stderr = (await stderr_task).decode("utf-8", errors="replace").strip()
            if returncode != 0 and not (returncode == -15 and stop_requested.is_set()):
                raise RuntimeError(f"pw-record failed (exit {returncode}): {stderr or 'unknown error'}")
            if frame_count == 0:
                raise RuntimeError("no audio samples captured")
            if window_frames:
                waveform.append(_window_point(np.concatenate(window_parts), window_start))
            return frame_count, waveform
        finally:
            if process.returncode is None:
                process.terminate()
                try:
                    await asyncio.wait_for(process.wait(), timeout=2.0)
                except asyncio.TimeoutError:
                    process.kill()
                    await process.wait()
            await stderr_task

    @staticmethod
    async def _read_stderr_tail(stream: asyncio.StreamReader) -> bytes:
        tail = b""
        while chunk := await stream.read(4096):
            tail = (tail + chunk)[-4096:]
        return tail


song_take_recorder = SongTakeRecorder()
