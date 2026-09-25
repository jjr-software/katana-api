import asyncio
import io
import sys
import unittest
import wave
from unittest.mock import AsyncMock, patch

from app.song_take import SongTakeRecorder


class SongTakeRecorderTests(unittest.IsolatedAsyncioTestCase):
    async def test_five_minute_stream_produces_wav_and_downsampled_waveform(self) -> None:
        # Feed five minutes of silence rapidly through the real subprocess pipe.
        script = (
            "import sys; "
            "chunk=b'\\0' * (48000 * 4); "
            "[(sys.stdout.buffer.write(chunk)) for _ in range(300)]"
        )
        recorder = SongTakeRecorder()
        with patch("app.song_take.resolve_katana_pipewire_source", new_callable=AsyncMock, return_value="KATANA"), \
             patch("app.song_take._pw_record_args", return_value=[sys.executable, "-c", script]):
            take_id = await recorder.start()
            with self.assertRaisesRegex(RuntimeError, "already active"):
                await recorder.start()
            assert recorder._active is not None
            await recorder._active.task
            result = await recorder.stop()

        self.assertEqual(result.id, take_id)
        self.assertEqual(result.duration_sec, 300.0)
        self.assertEqual(len(result.waveform), 1200)
        self.assertEqual(result.waveform[0].time_sec, 0.0)
        self.assertEqual(result.waveform[-1].time_sec, 299.75)
        self.assertTrue(all(point.rms_dbfs == -120.0 for point in result.waveform))
        with wave.open(io.BytesIO(result.wav_bytes), "rb") as wav:
            self.assertEqual(wav.getnframes(), 48_000 * 300)
            self.assertEqual(wav.getframerate(), 48_000)
            self.assertEqual(wav.getsampwidth(), 2)
        self.assertIsNone(recorder._active)

    async def test_stop_terminates_active_capture_and_releases_session(self) -> None:
        script = (
            "import signal,sys,time; "
            "signal.signal(signal.SIGTERM, lambda *_: sys.exit(1)); "
            "sys.stdout.buffer.write(b'\\0' * 192000); sys.stdout.flush(); time.sleep(30)"
        )
        recorder = SongTakeRecorder()
        with patch("app.song_take.resolve_katana_pipewire_source", new_callable=AsyncMock, return_value="KATANA"), \
             patch("app.song_take._pw_record_args", return_value=[sys.executable, "-c", script]):
            await recorder.start()
            await asyncio.sleep(0.1)
            result = await asyncio.wait_for(recorder.stop(), timeout=5)
        self.assertGreater(result.duration_sec, 0)
        self.assertIsNone(recorder._active)

    async def test_capture_failure_is_reported_and_session_released(self) -> None:
        recorder = SongTakeRecorder()
        script = "import sys; sys.stderr.write('capture failed'); sys.exit(3)"
        with patch("app.song_take.resolve_katana_pipewire_source", new_callable=AsyncMock, return_value="KATANA"), \
             patch("app.song_take._pw_record_args", return_value=[sys.executable, "-c", script]):
            await recorder.start()
            assert recorder._active is not None
            with self.assertRaisesRegex(RuntimeError, "capture failed"):
                await recorder._active.task
            with self.assertRaisesRegex(RuntimeError, "capture failed"):
                await recorder.stop()
        self.assertIsNone(recorder._active)
