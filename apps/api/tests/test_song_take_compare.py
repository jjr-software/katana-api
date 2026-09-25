import io
import math
import unittest
import wave
from datetime import datetime, timezone
from types import SimpleNamespace

import numpy as np
from starlette.requests import Request

from app.song_take_compare import compare_passages
from app.api.audio import get_song_take, get_song_take_wav, recent_song_takes


def sine_take(first_amplitude: float, second_amplitude: float, rate: int = 48_000) -> bytes:
    time = np.arange(rate, dtype=np.float64) / rate
    tone = np.sin(2 * math.pi * 440 * time)
    samples = np.concatenate((first_amplitude * tone, second_amplitude * tone))
    pcm = np.rint(samples * 32767).astype('<i2')
    with io.BytesIO() as buffer:
        with wave.open(buffer, 'wb') as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(rate)
            wav.writeframes(pcm.tobytes())
        return buffer.getvalue()


class SongTakeCompareTests(unittest.TestCase):
    def test_lufs_and_rms_follow_selected_pcm_passages(self) -> None:
        wav = sine_take(0.1, 0.2)
        clean, dirty, delta = compare_passages(wav, (0, 1), (1, 2))
        self.assertIsNotNone(clean.lufs)
        self.assertIsNotNone(dirty.lufs)
        self.assertAlmostEqual(delta, 6.02, delta=0.1)
        self.assertAlmostEqual(dirty.rms_dbfs - clean.rms_dbfs, 6.02, delta=0.1)

    def test_short_and_silent_passages_report_unavailable_lufs(self) -> None:
        wav = sine_take(0.0, 0.2)
        clean, dirty, delta = compare_passages(wav, (0, 0.2), (1, 2))
        self.assertIsNone(clean.lufs)
        self.assertEqual(clean.rms_dbfs, -120.0)
        self.assertIsNotNone(dirty.lufs)
        self.assertIsNone(delta)
        silent, _, _ = compare_passages(wav, (0, 1), (1, 2))
        self.assertIsNone(silent.lufs)

    def test_range_must_fit_recorded_frames(self) -> None:
        with self.assertRaisesRegex(ValueError, 'within the recorded take'):
            compare_passages(sine_take(0.1, 0.2), (0, 1), (1, 2.1))

    def test_recent_metadata_and_reopen_return_saved_waveform(self) -> None:
        row = SimpleNamespace(
            id='saved-take', duration_sec=2.0,
            created_at=datetime(2026, 9, 25, tzinfo=timezone.utc),
            waveform=[{'time_sec': 0.0, 'rms_dbfs': -20.0}],
        )

        class FakeDb:
            def get(self, _model: object, _id: str) -> object:
                return row

            def scalars(self, _query: object) -> list[object]:
                return [row]

        recent = recent_song_takes(FakeDb())  # type: ignore[arg-type]
        opened = get_song_take('saved-take', FakeDb())  # type: ignore[arg-type]
        self.assertEqual(recent[0].id, opened.id)
        self.assertEqual(opened.audio_url, '/api/v1/audio/take/saved-take/wav')
        self.assertEqual(opened.waveform[0].rms_dbfs, -20.0)

    def test_saved_wav_supports_browser_byte_ranges(self) -> None:
        audio = sine_take(0.1, 0.2)

        class FakeDb:
            def get(self, _model: object, _id: str) -> object:
                return SimpleNamespace(audio_wav=audio)

        def request(range_header: str | None) -> Request:
            headers = [(b'range', range_header.encode())] if range_header else []
            return Request({'type': 'http', 'method': 'GET', 'path': '/take/saved-take/wav', 'headers': headers})

        full = get_song_take_wav('saved-take', request(None), FakeDb())  # type: ignore[arg-type]
        self.assertEqual(full.status_code, 200)
        self.assertEqual(full.headers['accept-ranges'], 'bytes')
        self.assertEqual(full.body, audio)

        first = get_song_take_wav('saved-take', request('bytes=0-99'), FakeDb())  # type: ignore[arg-type]
        self.assertEqual(first.status_code, 206)
        self.assertEqual(first.headers['content-range'], f'bytes 0-99/{len(audio)}')
        self.assertEqual(first.body, audio[:100])

        later = get_song_take_wav('saved-take', request('bytes=100-'), FakeDb())  # type: ignore[arg-type]
        self.assertEqual(later.status_code, 206)
        self.assertEqual(later.body, audio[100:])

        suffix = get_song_take_wav('saved-take', request('bytes=-32'), FakeDb())  # type: ignore[arg-type]
        self.assertEqual(suffix.body, audio[-32:])

        missing = get_song_take_wav('saved-take', request(f'bytes={len(audio)}-'), FakeDb())  # type: ignore[arg-type]
        self.assertEqual(missing.status_code, 416)
        self.assertEqual(missing.headers['content-range'], f'bytes */{len(audio)}')
