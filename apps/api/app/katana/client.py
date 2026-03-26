import asyncio
import json
import time
from hashlib import sha256
from dataclasses import dataclass
from typing import Any

from app.katana.protocol import (
    ADDR_PATCH_AMP,
    ADDR_PATCH_BOOSTER_1,
    ADDR_PATCH_COLOR,
    ADDR_PATCH_COM,
    ADDR_PATCH_DELAY_1,
    ADDR_PATCH_DELAY_4,
    ADDR_PATCH_EQ_EACH_1,
    ADDR_PATCH_EQ_EACH_2,
    ADDR_PATCH_EQ_GE10_1,
    ADDR_PATCH_EQ_GE10_2,
    ADDR_PATCH_EQ_PEQ_1,
    ADDR_PATCH_EQ_PEQ_2,
    ADDR_PATCH_FX_1,
    ADDR_PATCH_FX_4,
    ADDR_PATCH_NS,
    ADDR_PATCH_OTHER,
    ADDR_PATCH_PEDALFX,
    ADDR_PATCH_PEDALFX_COM,
    ADDR_PATCH_REVERB_1,
    ADDR_PATCH_SENDRETURN,
    ADDR_PATCH_SOLO_COM,
    ADDR_PATCH_SW,
    EDITOR_MODE_ON,
    IDENTITY_REQUEST_HEX,
    PATCH_SELECT_ADDR,
    addr_add,
    slot_label,
)
from app.katana.sysex import build_dt1, build_rq1, extract_hex_pairs, extract_sysex_frames, parse_dt1


class AmpClientError(RuntimeError):
    pass


@dataclass(frozen=True)
class AmpConnectionResult:
    midi_port: str
    request_hex: str
    response_hex: str


@dataclass(frozen=True)
class CurrentPatchSnapshot:
    payload: dict[str, Any]


@dataclass(frozen=True)
class SlotPatchSummary:
    slot: int
    slot_label: str
    patch_name: str
    config_hash_sha256: str
    synced_at: str
    slot_sync_ms: int


@dataclass(frozen=True)
class SlotDump:
    slot: int
    slot_label: str
    payload: dict[str, Any]
    synced_at: str
    slot_sync_ms: int


@dataclass(frozen=True)
class FullAmpDumpSnapshot:
    synced_at: str
    amp_state_hash_sha256: str
    total_sync_ms: int
    slots: list[SlotDump]


@dataclass(frozen=True)
class SlotsStateSnapshot:
    synced_at: str
    amp_state_hash_sha256: str
    total_sync_ms: int
    slots: list[SlotPatchSummary]


class AmpClient:
    def __init__(self, midi_port: str, timeout_seconds: float) -> None:
        self._midi_port = midi_port
        self._timeout_seconds = timeout_seconds

    @property
    def midi_port(self) -> str:
        return self._midi_port

    async def test_connection(self) -> AmpConnectionResult:
        output = await self._send_and_read(IDENTITY_REQUEST_HEX, timeout_seconds=self._timeout_seconds)
        hex_pairs = extract_hex_pairs(output)
        if len(hex_pairs) < 2:
            raise AmpClientError("No SysEx response bytes detected from amp")

        response_hex = " ".join(pair.upper() for pair in hex_pairs)
        if not response_hex.startswith("F0") or not response_hex.endswith("F7"):
            raise AmpClientError(f"Non-SysEx response received: {response_hex}")

        return AmpConnectionResult(
            midi_port=self._midi_port,
            request_hex=IDENTITY_REQUEST_HEX,
            response_hex=response_hex,
        )

    async def read_current_patch(self) -> CurrentPatchSnapshot:
        await self._send_only(EDITOR_MODE_ON)
        return CurrentPatchSnapshot(payload=await self._read_selected_patch_payload())

    async def read_slots_state(self, synced_at: str) -> SlotsStateSnapshot:
        dump = await self.full_amp_dump(synced_at=synced_at)
        slots: list[SlotPatchSummary] = [
            SlotPatchSummary(
                slot=item.slot,
                slot_label=item.slot_label,
                patch_name=str(item.payload.get("patch_name", "")),
                config_hash_sha256=str(item.payload["config_hash_sha256"]),
                synced_at=item.synced_at,
                slot_sync_ms=item.slot_sync_ms,
            )
            for item in dump.slots
        ]
        return SlotsStateSnapshot(
            synced_at=dump.synced_at,
            amp_state_hash_sha256=dump.amp_state_hash_sha256,
            total_sync_ms=dump.total_sync_ms,
            slots=slots,
        )

    async def full_amp_dump(self, synced_at: str) -> FullAmpDumpSnapshot:
        started = time.perf_counter()
        await self._send_only(EDITOR_MODE_ON)
        slots: list[SlotDump] = []
        slot_hash_parts: list[str] = []
        for slot in range(1, 9):
            slot_started = time.perf_counter()
            await self._select_patch(slot)
            payload = await self._read_selected_patch_payload()
            slot_hash = str(payload["config_hash_sha256"])
            slot_hash_parts.append(f"{slot}:{slot_hash}")
            slots.append(
                SlotDump(
                    slot=slot,
                    slot_label=slot_label(slot),
                    payload=payload,
                    synced_at=synced_at,
                    slot_sync_ms=int(round((time.perf_counter() - slot_started) * 1000)),
                )
            )
        amp_state_hash = sha256("|".join(slot_hash_parts).encode("utf-8")).hexdigest()
        return FullAmpDumpSnapshot(
            synced_at=synced_at,
            amp_state_hash_sha256=amp_state_hash,
            total_sync_ms=int(round((time.perf_counter() - started) * 1000)),
            slots=slots,
        )

    async def _read_selected_patch_payload(self) -> dict[str, Any]:
        patch_com = await self._read_rq1(ADDR_PATCH_COM, 16)
        other = await self._read_rq1(ADDR_PATCH_OTHER, 3)
        color = await self._read_rq1(ADDR_PATCH_COLOR, 5)
        amp = await self._read_rq1(ADDR_PATCH_AMP, 10)
        sw = await self._read_rq1(ADDR_PATCH_SW, 6)

        booster_variants = [await self._read_rq1(addr_add(ADDR_PATCH_BOOSTER_1, 0x200 * i), 8) for i in range(3)]
        mod_variants = [await self._read_rq1(addr_add(ADDR_PATCH_FX_1, 0x200 * i), 1) for i in range(3)]
        fx_variants = [await self._read_rq1(addr_add(ADDR_PATCH_FX_4, 0x200 * i), 1) for i in range(3)]
        delay_variants = [await self._read_rq1(addr_add(ADDR_PATCH_DELAY_1, 0x200 * i), 17) for i in range(3)]
        delay2_variants = [await self._read_rq1(addr_add(ADDR_PATCH_DELAY_4, 0x200 * i), 17) for i in range(3)]
        reverb_variants = [await self._read_rq1(addr_add(ADDR_PATCH_REVERB_1, 0x200 * i), 13) for i in range(3)]

        solo_com = await self._read_rq1(ADDR_PATCH_SOLO_COM, 2)
        pedalfx_com = await self._read_rq1(ADDR_PATCH_PEDALFX_COM, 3)
        pedalfx = await self._read_rq1(ADDR_PATCH_PEDALFX, 15)
        eq_each_1 = await self._read_rq1(ADDR_PATCH_EQ_EACH_1, 3)
        eq_each_2 = await self._read_rq1(ADDR_PATCH_EQ_EACH_2, 3)
        eq_peq_1 = await self._read_rq1(ADDR_PATCH_EQ_PEQ_1, 11)
        eq_peq_2 = await self._read_rq1(ADDR_PATCH_EQ_PEQ_2, 11)
        eq_ge10_1 = await self._read_rq1(ADDR_PATCH_EQ_GE10_1, 11)
        eq_ge10_2 = await self._read_rq1(ADDR_PATCH_EQ_GE10_2, 11)
        ns = await self._read_rq1(ADDR_PATCH_NS, 3)
        send_return = await self._read_rq1(ADDR_PATCH_SENDRETURN, 5)

        boost_color = int(color[0]) if len(color) >= 1 else 0
        mod_color = int(color[1]) if len(color) >= 2 else 0
        fx_color = int(color[2]) if len(color) >= 3 else 0
        delay_color = int(color[3]) if len(color) >= 4 else 0
        reverb_color = int(color[4]) if len(color) >= 5 else 0

        selected_booster = self._selected_variant(booster_variants, boost_color)
        selected_mod = self._selected_variant(mod_variants, mod_color)
        selected_fx = self._selected_variant(fx_variants, fx_color)
        selected_delay = self._selected_variant(delay_variants, delay_color)
        selected_delay2 = self._selected_variant(delay2_variants, delay_color)
        selected_reverb = self._selected_variant(reverb_variants, reverb_color)

        payload: dict[str, Any] = {
            "patch_name": self._decode_patch_name(patch_com),
            "routing": {
                "chain_pattern": other[0] if len(other) >= 1 else None,
                "cabinet_resonance": other[1] if len(other) >= 2 else None,
                "master_key": other[2] if len(other) >= 3 else None,
            },
            "colors": {
                "booster": {"index": boost_color, "name": self._color_name(boost_color)},
                "mod": {"index": mod_color, "name": self._color_name(mod_color)},
                "fx": {"index": fx_color, "name": self._color_name(fx_color)},
                "delay": {"index": delay_color, "name": self._color_name(delay_color)},
                "reverb": {"index": reverb_color, "name": self._color_name(reverb_color)},
            },
            "amp": {
                "gain": amp[0],
                "volume": amp[1],
                "bass": amp[2],
                "middle": amp[3],
                "treble": amp[4],
                "presence": amp[5],
                "poweramp_variation": amp[6],
                "amp_type": amp[7],
                "resonance": amp[8],
                "preamp_variation": amp[9],
                "raw": amp,
            },
            "stages": {
                "booster": {
                    "on": self._bool_flag(sw[0]) if len(sw) >= 1 else False,
                    "color": self._color_name(boost_color),
                    "type": selected_booster[0] if len(selected_booster) >= 1 else None,
                    "drive": selected_booster[1] if len(selected_booster) >= 2 else None,
                    "tone": selected_booster[3] if len(selected_booster) >= 4 else None,
                    "effect_level": selected_booster[6] if len(selected_booster) >= 7 else None,
                    "direct_mix": selected_booster[7] if len(selected_booster) >= 8 else None,
                    "raw": selected_booster,
                    "variants_raw": booster_variants,
                },
                "mod": {
                    "on": self._bool_flag(sw[1]) if len(sw) >= 2 else False,
                    "color": self._color_name(mod_color),
                    "type": selected_mod[0] if selected_mod else None,
                    "raw": selected_mod,
                    "variants_raw": mod_variants,
                },
                "fx": {
                    "on": self._bool_flag(sw[2]) if len(sw) >= 3 else False,
                    "color": self._color_name(fx_color),
                    "type": selected_fx[0] if selected_fx else None,
                    "raw": selected_fx,
                    "variants_raw": fx_variants,
                },
                "delay": {
                    "on": self._bool_flag(sw[3]) if len(sw) >= 4 else False,
                    "delay2_on": self._bool_flag(sw[4]) if len(sw) >= 5 else False,
                    "color": self._color_name(delay_color),
                    "type": selected_delay[0] if len(selected_delay) >= 1 else None,
                    "time_raw": selected_delay[1:5] if len(selected_delay) >= 5 else [],
                    "feedback": selected_delay[5] if len(selected_delay) >= 6 else None,
                    "effect_level": selected_delay[7] if len(selected_delay) >= 8 else None,
                    "direct_level": selected_delay[8] if len(selected_delay) >= 9 else None,
                    "raw": selected_delay,
                    "delay2_raw": selected_delay2,
                    "variants_raw": delay_variants,
                    "variants2_raw": delay2_variants,
                },
                "reverb": {
                    "on": self._bool_flag(sw[5]) if len(sw) >= 6 else False,
                    "color": self._color_name(reverb_color),
                    "type": selected_reverb[0] if len(selected_reverb) >= 1 else None,
                    "layer_mode": selected_reverb[1] if len(selected_reverb) >= 2 else None,
                    "time": selected_reverb[2] if len(selected_reverb) >= 3 else None,
                    "effect_level": selected_reverb[10] if len(selected_reverb) >= 11 else None,
                    "direct_level": selected_reverb[11] if len(selected_reverb) >= 12 else None,
                    "raw": selected_reverb,
                    "variants_raw": reverb_variants,
                },
                "eq1": {
                    "position": eq_each_1[0] if len(eq_each_1) >= 1 else None,
                    "on": self._bool_flag(eq_each_1[1]) if len(eq_each_1) >= 2 else False,
                    "type": eq_each_1[2] if len(eq_each_1) >= 3 else None,
                    "peq_raw": eq_peq_1,
                    "ge10_raw": eq_ge10_1,
                },
                "eq2": {
                    "position": eq_each_2[0] if len(eq_each_2) >= 1 else None,
                    "on": self._bool_flag(eq_each_2[1]) if len(eq_each_2) >= 2 else False,
                    "type": eq_each_2[2] if len(eq_each_2) >= 3 else None,
                    "peq_raw": eq_peq_2,
                    "ge10_raw": eq_ge10_2,
                },
                "ns": {
                    "on": self._bool_flag(ns[0]) if len(ns) >= 1 else False,
                    "threshold": ns[1] if len(ns) >= 2 else None,
                    "release": ns[2] if len(ns) >= 3 else None,
                    "raw": ns,
                },
                "send_return": {
                    "on": self._bool_flag(send_return[0]) if len(send_return) >= 1 else False,
                    "position": send_return[1] if len(send_return) >= 2 else None,
                    "mode": send_return[2] if len(send_return) >= 3 else None,
                    "send_level": send_return[3] if len(send_return) >= 4 else None,
                    "return_level": send_return[4] if len(send_return) >= 5 else None,
                    "raw": send_return,
                },
                "solo": {
                    "on": self._bool_flag(solo_com[0]) if len(solo_com) >= 1 else False,
                    "effect_level": solo_com[1] if len(solo_com) >= 2 else None,
                    "raw": solo_com,
                },
                "pedalfx": {
                    "position": pedalfx_com[0] if len(pedalfx_com) >= 1 else None,
                    "on": self._bool_flag(pedalfx_com[1]) if len(pedalfx_com) >= 2 else False,
                    "type": pedalfx_com[2] if len(pedalfx_com) >= 3 else None,
                    "raw_com": pedalfx_com,
                    "raw": pedalfx,
                },
            },
        }
        payload["config_hash_sha256"] = self._config_hash(payload)
        return payload

    async def _run_amidi(self, args: list[str], timeout_seconds: float) -> tuple[int, str, str]:
        proc = await asyncio.create_subprocess_exec(
            "amidi",
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(),
                timeout=max(5.0, timeout_seconds + 2.0),
            )
        except asyncio.TimeoutError as exc:
            proc.kill()
            await proc.wait()
            raise AmpClientError("amidi command timed out") from exc
        stdout = stdout_bytes.decode("utf-8", errors="replace")
        stderr = stderr_bytes.decode("utf-8", errors="replace")
        return proc.returncode, stdout, stderr

    async def _send_and_read(self, sysex_hex: str, timeout_seconds: float) -> str:
        returncode, stdout, stderr = await self._run_amidi(
            ["-p", self._midi_port, "-d", "-t", str(timeout_seconds), "-S", sysex_hex],
            timeout_seconds=timeout_seconds,
        )
        if returncode != 0:
            raise AmpClientError(f"amidi query failed: {(stderr.strip() or stdout.strip())}")
        return stdout

    async def _send_only(self, sysex_hex: str) -> None:
        returncode, stdout, stderr = await self._run_amidi(
            ["-p", self._midi_port, "-S", sysex_hex],
            timeout_seconds=5.0,
        )
        if returncode != 0:
            raise AmpClientError(f"amidi send failed: {(stderr.strip() or stdout.strip())}")

    async def _select_patch(self, slot: int) -> None:
        slot_val = max(1, min(8, int(slot)))
        await self._send_only(build_dt1(PATCH_SELECT_ADDR, [0x00, slot_val]))

    async def _read_rq1(self, addr: tuple[int, int, int, int], size: int) -> list[int]:
        output = await self._send_and_read(
            build_rq1(addr, size),
            timeout_seconds=self._timeout_seconds,
        )
        frames = extract_sysex_frames(output)
        for frame in frames:
            parsed = parse_dt1(frame)
            if parsed is None:
                continue
            dt1_addr, data = parsed
            if dt1_addr == addr:
                return data[:size]
        raise AmpClientError(f"No DT1 response for address {addr}")

    @staticmethod
    def _color_name(value: int) -> str:
        return {0: "green", 1: "red", 2: "yellow"}.get(int(value), f"unknown({value})")

    @staticmethod
    def _bool_flag(value: int) -> bool:
        return int(value) != 0

    @staticmethod
    def _selected_variant(variants: list[list[int]], idx: int) -> list[int]:
        if 0 <= idx < len(variants):
            return variants[idx]
        return variants[0]

    @staticmethod
    def _decode_patch_name(raw: list[int]) -> str:
        chars: list[str] = []
        for value in raw:
            ivalue = int(value)
            if ivalue == 0:
                break
            if 32 <= ivalue <= 126:
                chars.append(chr(ivalue))
            else:
                chars.append("?")
        return "".join(chars).rstrip()

    @staticmethod
    def _config_hash(payload: dict[str, Any]) -> str:
        base = {key: value for key, value in payload.items() if key != "config_hash_sha256"}
        blob = json.dumps(base, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
        return sha256(blob.encode("utf-8")).hexdigest()
