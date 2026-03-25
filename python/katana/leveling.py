from __future__ import annotations

import asyncio
import math
import struct
from dataclasses import dataclass
from datetime import datetime, timezone

from .midi import AmidiTransport
from .model import KatanaPatch
from .patch_ops import (
    ADDR_AMP,
    apply_patch,
    bypassed_stage_state,
    read_leveling_stage_state,
    stage_active_order,
    state_with_enabled_stages,
    write_leveling_stage_state,
)


def linear_to_dbfs(value: float) -> float:
    if value <= 0.0:
        return -120.0
    return 20.0 * math.log10(value)


def _analyze_f32le(raw: bytes) -> tuple[float, float, float, float, int] | None:
    usable = (len(raw) // 4) * 4
    if usable <= 0:
        return None
    vals = struct.unpack("<" + "f" * (usable // 4), raw[:usable])
    if not vals:
        return None
    s2 = 0.0
    peak = 0.0
    for value in vals:
        amp = abs(value)
        s2 += value * value
        if amp > peak:
            peak = amp
    rms = math.sqrt(s2 / len(vals))
    return rms, peak, linear_to_dbfs(rms), linear_to_dbfs(peak), len(vals)


@dataclass
class LevelSample:
    timestamp_utc: str
    rms_dbfs: float
    peak_dbfs: float
    sample_count: int


class PipeWireSampler:
    def __init__(
        self,
        source: str = "alsa_input.usb-Roland_KATANA3-01.analog-surround-40",
        rate: int = 48000,
        channels: int = 2,
        window_sec: float = 1.0,
    ) -> None:
        self.source = source
        self.rate = int(rate)
        self.channels = int(channels)
        self.window_sec = float(window_sec)
        self._proc: asyncio.subprocess.Process | None = None
        self._bytes_per_window = int(self.rate * self.channels * self.window_sec * 4)

    async def start(self) -> None:
        if self._proc is not None and self._proc.returncode is None:
            return
        self._proc = await asyncio.create_subprocess_exec(
            "timeout",
            "365d",
            "pw-record",
            "--target",
            self.source,
            "--rate",
            str(self.rate),
            "--channels",
            str(self.channels),
            "--format",
            "f32",
            "-",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        if self._proc.stdout is None:
            raise RuntimeError("failed to start pw-record stream")

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
            raise RuntimeError("sampler is not started")
        buf = bytearray()
        while len(buf) < total:
            chunk = await self._proc.stdout.read(total - len(buf))
            if not chunk:
                break
            buf.extend(chunk)
        return bytes(buf)

    async def sample_one(self) -> LevelSample | None:
        if self._bytes_per_window <= 0:
            raise ValueError("window size must produce >0 bytes")
        raw = await self._read_exact(self._bytes_per_window)
        result = _analyze_f32le(raw)
        if result is None:
            return None
        _rms, _peak, rms_dbfs, peak_dbfs, n = result
        return LevelSample(
            timestamp_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"),
            rms_dbfs=round(rms_dbfs, 3),
            peak_dbfs=round(peak_dbfs, 3),
            sample_count=n,
        )

    async def sample_window(self, seconds: float = 6.0, active_floor_dbfs: float = -45.0) -> list[LevelSample]:
        windows = max(1, int(round(seconds / self.window_sec)))
        out: list[LevelSample] = []
        for _ in range(windows):
            item = await self.sample_one()
            if item is None:
                continue
            if item.rms_dbfs >= active_floor_dbfs:
                out.append(item)
        return out


def _compute_step(error_db: float, scale: float = 2.0, max_step: int = 8) -> int:
    step = int(round(error_db * scale))
    step = max(-max_step, min(max_step, step))
    if step == 0:
        step = 1 if error_db > 0 else -1
    return step


async def auto_level_patch(
    transport: AmidiTransport,
    sampler: PipeWireSampler,
    patch: KatanaPatch,
    target_dbfs: float,
    measure_seconds: float = 6.0,
    max_iters: int = 4,
    tolerance_db: float = 0.7,
    active_floor_dbfs: float = -45.0,
    slot: int = 4,
    bypass_stomps: bool = True,
    progressive_restore: bool = True,
) -> tuple[KatanaPatch, list[dict[str, float | int | str]]]:
    async def _measure_mean() -> tuple[float | None, int]:
        samples = await sampler.sample_window(seconds=measure_seconds, active_floor_dbfs=active_floor_dbfs)
        if len(samples) < 1:
            return None, 0
        mean_rms = sum(s.rms_dbfs for s in samples) / len(samples)
        return mean_rms, len(samples)

    async def _trim_once(iter_idx: int, phase: str, tol: float, step_scale: float, step_max: int) -> dict[str, float | int | str]:
        await transport.send_dt1(ADDR_AMP, patch.amp)
        mean_rms, n = await _measure_mean()
        if mean_rms is None:
            return {"iter": iter_idx, "phase": phase, "status": "insufficient", "samples": 0}
        err = target_dbfs - mean_rms
        rec: dict[str, float | int | str] = {
            "iter": iter_idx,
            "phase": phase,
            "samples": n,
            "mean_rms_dbfs": round(mean_rms, 3),
            "error_db": round(err, 3),
            "amp_volume": patch.amp_volume,
        }
        if abs(err) <= tol:
            rec["status"] = "within_tolerance"
            return rec
        step = _compute_step(err, scale=step_scale, max_step=step_max)
        patch.amp_volume = patch.amp_volume + step
        rec["status"] = "adjusted"
        rec["adjust_step"] = step
        rec["new_amp_volume"] = patch.amp_volume
        return rec

    history: list[dict[str, float | int | str]] = []
    await apply_patch(transport, patch, slot=slot)

    orig_state = await read_leveling_stage_state(transport)
    off_state = bypassed_stage_state(orig_state)
    if bypass_stomps:
        await write_leveling_stage_state(transport, off_state)
        history.append({"phase": "pre", "status": "stomps_bypassed"})

    for idx in range(1, max_iters + 1):
        rec = await _trim_once(
            iter_idx=idx,
            phase="main_bypass" if bypass_stomps else "main_fullchain",
            tol=tolerance_db,
            step_scale=2.0,
            step_max=8,
        )
        history.append(rec)
        if rec.get("status") == "within_tolerance":
            break

    if bypass_stomps:
        active = stage_active_order(orig_state)
        if active and progressive_restore:
            enabled: set[str] = set()
            for stage_name in active:
                enabled.add(stage_name)
                staged = state_with_enabled_stages(off_state, orig_state, enabled)
                await write_leveling_stage_state(transport, staged)
                rec = await _trim_once(
                    iter_idx=len(history) + 1,
                    phase=f"restore_{stage_name}",
                    tol=max(0.4, tolerance_db * 0.85),
                    step_scale=1.25,
                    step_max=4,
                )
                history.append(rec)
        else:
            await write_leveling_stage_state(transport, orig_state)
            rec = await _trim_once(
                iter_idx=len(history) + 1,
                phase="restore_all",
                tol=max(0.4, tolerance_db * 0.85),
                step_scale=1.25,
                step_max=4,
            )
            history.append(rec)

        # Ensure the final stage state is back to original.
        await write_leveling_stage_state(transport, orig_state)
        history.append({"phase": "post", "status": "stages_restored"})

    await transport.send_dt1(ADDR_AMP, patch.amp)
    return patch, history
