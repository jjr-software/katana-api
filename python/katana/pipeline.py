from __future__ import annotations

import hashlib
import json
import os
import sys
from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from .decode import decode_choice, load_decode_tables
from .midi import AmidiTransport


@dataclass
class PipelineReport:
    slot: int | None
    slot_label: str
    payload: dict[str, Any]


def slot_label(slot: int) -> str:
    slot_val = max(1, min(8, int(slot)))
    bank = "A" if slot_val <= 4 else "B"
    channel = ((slot_val - 1) % 4) + 1
    return f"{bank}:{channel}"


def _addr_to_int(addr: tuple[int, int, int, int]) -> int:
    return (addr[0] << 24) | (addr[1] << 16) | (addr[2] << 8) | addr[3]


def _int_to_addr(value: int) -> tuple[int, int, int, int]:
    return ((value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF)


def _addr_add(addr: tuple[int, int, int, int], offset: int) -> tuple[int, int, int, int]:
    return _int_to_addr(_addr_to_int(addr) + int(offset))


ADDR_PATCH_OTHER = (0x20, 0x00, 0x02, 0x00)
ADDR_PATCH_COM = (0x20, 0x00, 0x00, 0x00)
ADDR_PATCH_COLOR = (0x20, 0x00, 0x04, 0x00)
ADDR_PATCH_AMP = (0x20, 0x00, 0x06, 0x00)
ADDR_PATCH_SW = (0x20, 0x00, 0x08, 0x00)
ADDR_PATCH_BOOSTER_1 = (0x20, 0x00, 0x0A, 0x00)
ADDR_PATCH_FX_1 = (0x20, 0x00, 0x10, 0x00)
ADDR_PATCH_FX_4 = (0x20, 0x00, 0x16, 0x00)
ADDR_PATCH_FX_DETAIL_1 = (0x20, 0x00, 0x1C, 0x00)
ADDR_PATCH_FX_DETAIL_4 = (0x20, 0x00, 0x22, 0x00)
ADDR_PATCH_DELAY_1 = (0x20, 0x00, 0x28, 0x00)
ADDR_PATCH_DELAY_4 = (0x20, 0x00, 0x2E, 0x00)
ADDR_PATCH_REVERB_1 = (0x20, 0x00, 0x34, 0x00)
ADDR_PATCH_SOLO_COM = (0x20, 0x00, 0x3A, 0x00)
ADDR_PATCH_PEDALFX_COM = (0x20, 0x00, 0x48, 0x00)
ADDR_PATCH_PEDALFX = (0x20, 0x00, 0x4A, 0x00)
ADDR_PATCH_EQ_EACH_1 = (0x20, 0x00, 0x4C, 0x00)
ADDR_PATCH_EQ_EACH_2 = (0x20, 0x00, 0x4E, 0x00)
ADDR_PATCH_EQ_PEQ_1 = (0x20, 0x00, 0x50, 0x00)
ADDR_PATCH_EQ_PEQ_2 = (0x20, 0x00, 0x52, 0x00)
ADDR_PATCH_EQ_GE10_1 = (0x20, 0x00, 0x54, 0x00)
ADDR_PATCH_EQ_GE10_2 = (0x20, 0x00, 0x56, 0x00)
ADDR_PATCH_NS = (0x20, 0x00, 0x58, 0x00)
ADDR_PATCH_SENDRETURN = (0x20, 0x00, 0x5A, 0x00)
FX_DETAIL_SIZE = 225


async def _read_block(transport: AmidiTransport, addr: tuple[int, int, int, int], size: int) -> list[int]:
    return await transport.read_rq1(addr, size)


ProgressFn = Callable[[str], None | Awaitable[None]]


async def _emit_progress(progress: ProgressFn | None, message: str) -> None:
    if progress is None:
        return
    ret = progress(message)
    if ret is not None and hasattr(ret, "__await__"):
        await ret


def _color_name(value: int) -> str:
    return {0: "green", 1: "red", 2: "yellow"}.get(int(value), f"unknown({value})")


def _bool_flag(value: int) -> bool:
    return int(value) != 0


def _selected_variant(variants: list[list[int]], idx: int) -> list[int]:
    if 0 <= idx < len(variants):
        return variants[idx]
    return variants[0]


def _use_color(mode: str = "auto") -> bool:
    m = str(mode).strip().lower()
    if m == "always":
        return True
    if m == "never":
        return False
    if os.environ.get("NO_COLOR"):
        return False
    if os.environ.get("FORCE_COLOR"):
        return True
    return bool(getattr(sys.stdout, "isatty", lambda: False)())


def _c(text: str, code: str, enabled: bool) -> str:
    if not enabled:
        return text
    return f"\x1b[{code}m{text}\x1b[0m"


def _state_text(on: bool, enabled: bool) -> str:
    return _c("ON", "1;32", enabled) if on else _c("OFF", "1;31", enabled)


def _variant_index(name: str) -> int:
    return {"green": 0, "red": 1, "yellow": 2}.get(str(name).lower(), 0)


def _fmt_color_name(name: str, enabled: bool) -> str:
    n = str(name).lower()
    if n == "green":
        return _c(name, "1;32", enabled)
    if n == "red":
        return _c(name, "1;31", enabled)
    if n == "yellow":
        return _c(name, "1;33", enabled)
    return name


def _fmt_block_values(raw: list[int], labels: dict[int, str] | None = None) -> str:
    labels = labels or {}
    parts: list[str] = []
    for idx, val in enumerate(raw):
        key = labels.get(idx, f"p{idx}")
        parts.append(f"{key}={val}")
    return " ".join(parts)


def _fmt_block_values_decoded(
    raw: list[int],
    labels: dict[int, str] | None = None,
    decoders: dict[int, Callable[[int], str]] | None = None,
) -> str:
    labels = labels or {}
    decoders = decoders or {}
    parts: list[str] = []
    for idx, val in enumerate(raw):
        key = labels.get(idx, f"p{idx}")
        if idx in decoders:
            decoded = decoders[idx](val)
            parts.append(f"{key}={decoded}({val})")
        else:
            parts.append(f"{key}={val}")
    return " ".join(parts)


def _block_value_lines(
    raw: list[int],
    labels: dict[int, str] | None = None,
    decoders: dict[int, Callable[[int], str]] | None = None,
) -> list[str]:
    labels = labels or {}
    decoders = decoders or {}
    out: list[str] = []
    for idx, val in enumerate(raw):
        key = labels.get(idx, f"p{idx}")
        if idx in decoders:
            decoded = decoders[idx](val)
            out.append(f"{key}: {decoded} ({val})")
        else:
            out.append(f"{key}: {val}")
    return out


def _fmt_ge10_offsets(raw: list[int]) -> str:
    bands = ["31", "62", "125", "250", "500", "1k", "2k", "4k", "8k", "16k", "level"]
    parts: list[str] = []
    for idx, val in enumerate(raw[:11]):
        label = bands[idx] if idx < len(bands) else f"b{idx}"
        parts.append(f"{label}={val-24:+d}")
    return " ".join(parts)


def _decode_opt(choices: list[str], value: Any) -> str:
    try:
        return decode_choice(choices, int(value))
    except Exception:
        return "unknown"


def _decode_patch_name(raw: list[int]) -> str:
    chars: list[str] = []
    for v in raw:
        iv = int(v)
        if iv == 0:
            break
        if 32 <= iv <= 126:
            chars.append(chr(iv))
        else:
            chars.append("?")
    return "".join(chars).rstrip()


def config_hash_for_payload(payload: dict[str, Any]) -> str:
    base = {k: v for k, v in payload.items() if k not in {"patch_name", "config_hash_sha256"}}
    blob = json.dumps(base, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


async def _inspect_pipeline_selected_slot(
    transport: AmidiTransport,
    slot: int | None,
    progress: ProgressFn | None = None,
    progress_prefix: str = "",
) -> PipelineReport:
    def _p(msg: str) -> str:
        return f"{progress_prefix}{msg}" if progress_prefix else msg

    if slot is not None:
        await _emit_progress(progress, _p(f"select patch {slot_label(slot)}"))
        await transport.select_patch(slot)

    await _emit_progress(progress, _p("read patch name"))
    patch_com = await _read_block(transport, ADDR_PATCH_COM, 16)
    await _emit_progress(progress, _p("read routing block"))
    other = await _read_block(transport, ADDR_PATCH_OTHER, 3)
    await _emit_progress(progress, _p("read color block"))
    color = await _read_block(transport, ADDR_PATCH_COLOR, 5)
    await _emit_progress(progress, _p("read amp block"))
    amp = await _read_block(transport, ADDR_PATCH_AMP, 10)
    await _emit_progress(progress, _p("read stage switches"))
    sw = await _read_block(transport, ADDR_PATCH_SW, 6)

    await _emit_progress(progress, _p("read booster variants"))
    booster_variants = [
        await _read_block(transport, _addr_add(ADDR_PATCH_BOOSTER_1, 0x200 * i), 8) for i in range(3)
    ]
    await _emit_progress(progress, _p("read mod variants"))
    mod_variants = [
        (await _read_block(transport, _addr_add(ADDR_PATCH_FX_1, 0x200 * i), 1))
        + (await _read_block(transport, _addr_add(ADDR_PATCH_FX_DETAIL_1, 0x200 * i), FX_DETAIL_SIZE))
        for i in range(3)
    ]
    await _emit_progress(progress, _p("read fx variants"))
    fx_variants = [
        (await _read_block(transport, _addr_add(ADDR_PATCH_FX_4, 0x200 * i), 1))
        + (await _read_block(transport, _addr_add(ADDR_PATCH_FX_DETAIL_4, 0x200 * i), FX_DETAIL_SIZE))
        for i in range(3)
    ]
    await _emit_progress(progress, _p("read delay variants"))
    delay_variants = [await _read_block(transport, _addr_add(ADDR_PATCH_DELAY_1, 0x200 * i), 17) for i in range(3)]
    await _emit_progress(progress, _p("read delay2 variants"))
    delay2_variants = [await _read_block(transport, _addr_add(ADDR_PATCH_DELAY_4, 0x200 * i), 17) for i in range(3)]
    await _emit_progress(progress, _p("read reverb variants"))
    reverb_variants = [await _read_block(transport, _addr_add(ADDR_PATCH_REVERB_1, 0x200 * i), 13) for i in range(3)]

    await _emit_progress(progress, _p("read solo/pedalfx"))
    solo_com = await _read_block(transport, ADDR_PATCH_SOLO_COM, 2)
    pedalfx_com = await _read_block(transport, ADDR_PATCH_PEDALFX_COM, 3)
    pedalfx = await _read_block(transport, ADDR_PATCH_PEDALFX, 15)
    await _emit_progress(progress, _p("read eq blocks"))
    eq_each_1 = await _read_block(transport, ADDR_PATCH_EQ_EACH_1, 3)
    eq_each_2 = await _read_block(transport, ADDR_PATCH_EQ_EACH_2, 3)
    eq_peq_1 = await _read_block(transport, ADDR_PATCH_EQ_PEQ_1, 11)
    eq_peq_2 = await _read_block(transport, ADDR_PATCH_EQ_PEQ_2, 11)
    eq_ge10_1 = await _read_block(transport, ADDR_PATCH_EQ_GE10_1, 11)
    eq_ge10_2 = await _read_block(transport, ADDR_PATCH_EQ_GE10_2, 11)
    await _emit_progress(progress, _p("read ns/send-return"))
    ns = await _read_block(transport, ADDR_PATCH_NS, 3)
    send_return = await _read_block(transport, ADDR_PATCH_SENDRETURN, 5)

    boost_color = int(color[0]) if len(color) >= 1 else 0
    mod_color = int(color[1]) if len(color) >= 2 else 0
    fx_color = int(color[2]) if len(color) >= 3 else 0
    delay_color = int(color[3]) if len(color) >= 4 else 0
    reverb_color = int(color[4]) if len(color) >= 5 else 0

    selected_booster = _selected_variant(booster_variants, boost_color)
    selected_mod = _selected_variant(mod_variants, mod_color)
    selected_fx = _selected_variant(fx_variants, fx_color)
    selected_delay = _selected_variant(delay_variants, delay_color)
    selected_delay2 = _selected_variant(delay2_variants, delay_color)
    selected_reverb = _selected_variant(reverb_variants, reverb_color)

    payload: dict[str, Any] = {
        "patch_name": _decode_patch_name(patch_com),
        "routing": {
            "chain_pattern": other[0] if len(other) >= 1 else None,
            "cabinet_resonance": other[1] if len(other) >= 2 else None,
            "master_key": other[2] if len(other) >= 3 else None,
        },
        "colors": {
            "booster": {"index": boost_color, "name": _color_name(boost_color)},
            "mod": {"index": mod_color, "name": _color_name(mod_color)},
            "fx": {"index": fx_color, "name": _color_name(fx_color)},
            "delay": {"index": delay_color, "name": _color_name(delay_color)},
            "reverb": {"index": reverb_color, "name": _color_name(reverb_color)},
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
                "on": _bool_flag(sw[0]) if len(sw) >= 1 else False,
                "color": _color_name(boost_color),
                "type": selected_booster[0] if len(selected_booster) >= 1 else None,
                "drive": selected_booster[1] if len(selected_booster) >= 2 else None,
                "tone": selected_booster[3] if len(selected_booster) >= 4 else None,
                "effect_level": selected_booster[6] if len(selected_booster) >= 7 else None,
                "direct_mix": selected_booster[7] if len(selected_booster) >= 8 else None,
                "raw": selected_booster,
                "variants_raw": booster_variants,
            },
            "mod": {
                "on": _bool_flag(sw[1]) if len(sw) >= 2 else False,
                "color": _color_name(mod_color),
                "type": selected_mod[0] if selected_mod else None,
                "raw": selected_mod,
                "variants_raw": mod_variants,
            },
            "fx": {
                "on": _bool_flag(sw[2]) if len(sw) >= 3 else False,
                "color": _color_name(fx_color),
                "type": selected_fx[0] if selected_fx else None,
                "raw": selected_fx,
                "variants_raw": fx_variants,
            },
            "delay": {
                "on": _bool_flag(sw[3]) if len(sw) >= 4 else False,
                "delay2_on": _bool_flag(sw[4]) if len(sw) >= 5 else False,
                "color": _color_name(delay_color),
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
                "on": _bool_flag(sw[5]) if len(sw) >= 6 else False,
                "color": _color_name(reverb_color),
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
                "on": _bool_flag(eq_each_1[1]) if len(eq_each_1) >= 2 else False,
                "type": eq_each_1[2] if len(eq_each_1) >= 3 else None,
                "peq_raw": eq_peq_1,
                "ge10_raw": eq_ge10_1,
            },
            "eq2": {
                "position": eq_each_2[0] if len(eq_each_2) >= 1 else None,
                "on": _bool_flag(eq_each_2[1]) if len(eq_each_2) >= 2 else False,
                "type": eq_each_2[2] if len(eq_each_2) >= 3 else None,
                "peq_raw": eq_peq_2,
                "ge10_raw": eq_ge10_2,
            },
            "ns": {
                "on": _bool_flag(ns[0]) if len(ns) >= 1 else False,
                "threshold": ns[1] if len(ns) >= 2 else None,
                "release": ns[2] if len(ns) >= 3 else None,
                "raw": ns,
            },
            "send_return": {
                "on": _bool_flag(send_return[0]) if len(send_return) >= 1 else False,
                "position": send_return[1] if len(send_return) >= 2 else None,
                "mode": send_return[2] if len(send_return) >= 3 else None,
                "send_level": send_return[3] if len(send_return) >= 4 else None,
                "return_level": send_return[4] if len(send_return) >= 5 else None,
                "raw": send_return,
            },
            "solo": {
                "on": _bool_flag(solo_com[0]) if len(solo_com) >= 1 else False,
                "effect_level": solo_com[1] if len(solo_com) >= 2 else None,
                "raw": solo_com,
            },
            "pedalfx": {
                "position": pedalfx_com[0] if len(pedalfx_com) >= 1 else None,
                "on": _bool_flag(pedalfx_com[1]) if len(pedalfx_com) >= 2 else False,
                "type": pedalfx_com[2] if len(pedalfx_com) >= 3 else None,
                "raw_com": pedalfx_com,
                "raw": pedalfx,
            },
        },
    }
    payload["config_hash_sha256"] = config_hash_for_payload(payload)
    return PipelineReport(slot=slot, slot_label=slot_label(slot) if slot is not None else "current", payload=payload)


async def inspect_pipeline(
    transport: AmidiTransport,
    slot: int | None = None,
    progress: ProgressFn | None = None,
) -> PipelineReport:
    await _emit_progress(progress, "set editor mode ON")
    await transport.set_editor_mode(True)
    return await _inspect_pipeline_selected_slot(transport=transport, slot=slot, progress=progress)


async def inspect_pipeline_all_slots(
    transport: AmidiTransport,
    slots: list[int] | None = None,
    progress: ProgressFn | None = None,
) -> list[PipelineReport]:
    slot_list = slots if slots else list(range(1, 9))
    await _emit_progress(progress, "set editor mode ON")
    await transport.set_editor_mode(True)
    out: list[PipelineReport] = []
    for slot in slot_list:
        prefix = f"[{slot_label(slot)}] "
        rep = await _inspect_pipeline_selected_slot(
            transport=transport,
            slot=slot,
            progress=progress,
            progress_prefix=prefix,
        )
        out.append(rep)
    return out


def format_pipeline(report: PipelineReport, color: str = "auto", show_off: bool = False) -> str:
    use_color = _use_color(color)
    tables = load_decode_tables()
    p = report.payload
    s = p["stages"]
    booster_color = s["booster"]["color"]
    mod_color = s["mod"]["color"]
    fx_color = s["fx"]["color"]
    delay_color = s["delay"]["color"]
    reverb_color = s["reverb"]["color"]

    booster_raw = s["booster"]["raw"]
    mod_raw = s["mod"]["raw"]
    fx_raw = s["fx"]["raw"]
    delay_raw = s["delay"]["raw"]
    delay2_raw = s["delay"]["delay2_raw"]
    reverb_raw = s["reverb"]["raw"]
    eq1_peq = s["eq1"]["peq_raw"]
    eq1_ge10 = s["eq1"]["ge10_raw"]
    eq2_peq = s["eq2"]["peq_raw"]
    eq2_ge10 = s["eq2"]["ge10_raw"]
    ns_raw = s["ns"]["raw"]
    send_return_raw = s["send_return"]["raw"]
    solo_raw = s["solo"]["raw"]
    pedalfx_raw = s["pedalfx"]["raw"]

    booster_labels = {0: "type", 1: "drive", 2: "bottom", 3: "tone", 4: "solo_sw", 5: "solo_lvl", 6: "effect_level", 7: "direct_mix"}
    delay_labels = {
        0: "type",
        1: "time_b0",
        2: "time_b1",
        3: "time_b2",
        4: "time_b3",
        5: "feedback",
        6: "hf_damp",
        7: "effect_level",
        8: "direct_level",
        9: "mod_rate",
        10: "mod_depth",
        11: "duck_sens",
        12: "duck_pre",
        13: "duck_post",
        14: "tap_div",
        15: "carryover",
        16: "filter",
    }
    reverb_labels = {
        0: "type",
        1: "layer_mode",
        2: "time",
        3: "pre_delay",
        4: "low_cut",
        5: "high_cut",
        6: "density",
        7: "effect_tone",
        8: "mod_depth",
        9: "mod_rate",
        10: "effect_level",
        11: "direct_level",
        12: "carryover",
    }
    ns_labels = {0: "switch", 1: "threshold", 2: "release"}
    send_return_labels = {0: "switch", 1: "position", 2: "mode", 3: "send_level", 4: "return_level"}
    solo_labels = {0: "switch", 1: "effect_level"}
    pedalfx_com_labels = {0: "position", 1: "switch", 2: "type"}

    amp_raw = p["amp"]["raw"]
    amp_labels = {
        0: "gain",
        1: "volume",
        2: "bass",
        3: "middle",
        4: "treble",
        5: "presence",
        6: "poweramp_variation",
        7: "amp_type",
        8: "resonance",
        9: "preamp_variation",
    }

    title = _c(f"Pipeline [{report.slot_label}]", "1;36", use_color)
    chain_decoded = _decode_opt(tables.chain_pattern, p["routing"]["chain_pattern"])
    lines: list[str] = [title, ""]
    lines.append(f"Patch Name: {p.get('patch_name', '')}")
    lines.append(f"Config Hash: {p.get('config_hash_sha256', '')}")
    lines.append("")

    lines.append("Routing")
    lines.append(f"  chain_pattern: {chain_decoded} ({p['routing']['chain_pattern']})")
    lines.append(f"  cabinet_resonance: {p['routing']['cabinet_resonance']}")
    lines.append(f"  master_key: {p['routing']['master_key']}")
    lines.append("")

    lines.append("Colors")
    lines.append(f"  booster: {_fmt_color_name(p['colors']['booster']['name'], use_color)}")
    lines.append(f"  mod: {_fmt_color_name(p['colors']['mod']['name'], use_color)}")
    lines.append(f"  fx: {_fmt_color_name(p['colors']['fx']['name'], use_color)}")
    lines.append(f"  delay: {_fmt_color_name(p['colors']['delay']['name'], use_color)}")
    lines.append(f"  reverb: {_fmt_color_name(p['colors']['reverb']['name'], use_color)}")
    lines.append("")

    lines.append("Amp")
    for item in _block_value_lines(amp_raw, amp_labels, {7: lambda v: _decode_opt(tables.amp_type, v)}):
        lines.append(f"  {item}")
    lines.append("")

    if show_off or bool(s["booster"]["on"]):
        lines.append("Booster")
        lines.append(f"  state: {_state_text(bool(s['booster']['on']), use_color)}")
        lines.append(f"  color: {_fmt_color_name(booster_color, use_color)} (variant {_variant_index(booster_color)})")
        for item in _block_value_lines(booster_raw, booster_labels, {0: lambda v: _decode_opt(tables.booster_type, v)}):
            lines.append(f"  {item}")
        lines.append("")

    if show_off or bool(s["mod"]["on"]):
        lines.append("Mod")
        lines.append(f"  state: {_state_text(bool(s['mod']['on']), use_color)}")
        lines.append(f"  color: {_fmt_color_name(mod_color, use_color)} (variant {_variant_index(mod_color)})")
        for item in _block_value_lines(mod_raw, {0: "type"}, {0: lambda v: _decode_opt(tables.fx_type, v)}):
            lines.append(f"  {item}")
        lines.append("")

    if show_off or bool(s["fx"]["on"]):
        lines.append("FX")
        lines.append(f"  state: {_state_text(bool(s['fx']['on']), use_color)}")
        lines.append(f"  color: {_fmt_color_name(fx_color, use_color)} (variant {_variant_index(fx_color)})")
        for item in _block_value_lines(fx_raw, {0: "type"}, {0: lambda v: _decode_opt(tables.fx_type, v)}):
            lines.append(f"  {item}")
        lines.append("")

    if show_off or bool(s["delay"]["on"]):
        lines.append("Delay")
        lines.append(f"  state: {_state_text(bool(s['delay']['on']), use_color)}")
        lines.append(f"  delay2_state: {_state_text(bool(s['delay']['delay2_on']), use_color)}")
        lines.append(f"  color: {_fmt_color_name(delay_color, use_color)} (variant {_variant_index(delay_color)})")
        for item in _block_value_lines(delay_raw, delay_labels, {0: lambda v: _decode_opt(tables.delay_type, v)}):
            lines.append(f"  {item}")
        lines.append("")

    if show_off or bool(s["delay"]["delay2_on"]):
        lines.append("Delay2")
        for item in _block_value_lines(delay2_raw, delay_labels, {0: lambda v: _decode_opt(tables.delay_type, v)}):
            lines.append(f"  {item}")
        lines.append("")

    if show_off or bool(s["reverb"]["on"]):
        lines.append("Reverb")
        lines.append(f"  state: {_state_text(bool(s['reverb']['on']), use_color)}")
        lines.append(f"  color: {_fmt_color_name(reverb_color, use_color)} (variant {_variant_index(reverb_color)})")
        for item in _block_value_lines(
            reverb_raw,
            reverb_labels,
            {0: lambda v: _decode_opt(tables.reverb_type, v), 1: lambda v: _decode_opt(tables.reverb_layer_mode, v)},
        ):
            lines.append(f"  {item}")
        lines.append("")

    if show_off or bool(s["eq1"]["on"]):
        lines.append("EQ1")
        lines.append(f"  state: {_state_text(bool(s['eq1']['on']), use_color)}")
        lines.append(f"  position: {s['eq1']['position']}")
        lines.append(f"  type: {_decode_opt(tables.eq_type, s['eq1']['type'])} ({s['eq1']['type']})")
        lines.append("  peq:")
        for item in _block_value_lines(eq1_peq):
            lines.append(f"    {item}")
        lines.append(f"  ge10_steps: {_fmt_ge10_offsets(eq1_ge10)}")
        lines.append("")

    if show_off or bool(s["eq2"]["on"]):
        lines.append("EQ2")
        lines.append(f"  state: {_state_text(bool(s['eq2']['on']), use_color)}")
        lines.append(f"  position: {s['eq2']['position']}")
        lines.append(f"  type: {_decode_opt(tables.eq_type, s['eq2']['type'])} ({s['eq2']['type']})")
        lines.append("  peq:")
        for item in _block_value_lines(eq2_peq):
            lines.append(f"    {item}")
        lines.append(f"  ge10_steps: {_fmt_ge10_offsets(eq2_ge10)}")
        lines.append("")

    if show_off or bool(s["ns"]["on"]):
        lines.append("NS")
        lines.append(f"  state: {_state_text(bool(s['ns']['on']), use_color)}")
        for item in _block_value_lines(ns_raw, ns_labels):
            lines.append(f"  {item}")
        lines.append("")

    if show_off or bool(s["send_return"]["on"]):
        lines.append("Send/Return")
        lines.append(f"  state: {_state_text(bool(s['send_return']['on']), use_color)}")
        for item in _block_value_lines(
            send_return_raw,
            send_return_labels,
            {1: lambda v: _decode_opt(tables.send_return_position, v), 2: lambda v: _decode_opt(tables.send_return_mode, v)},
        ):
            lines.append(f"  {item}")
        lines.append("")

    if show_off or bool(s["solo"]["on"]):
        lines.append("Solo")
        lines.append(f"  state: {_state_text(bool(s['solo']['on']), use_color)}")
        for item in _block_value_lines(solo_raw, solo_labels):
            lines.append(f"  {item}")
        lines.append("")

    if show_off or bool(s["pedalfx"]["on"]):
        lines.append("Pedal FX")
        lines.append(f"  state: {_state_text(bool(s['pedalfx']['on']), use_color)}")
        for item in _block_value_lines(
            s["pedalfx"]["raw_com"],
            pedalfx_com_labels,
            {2: lambda v: _decode_opt(tables.pedalfx_type, v)},
        ):
            lines.append(f"  {item}")
        lines.append("  detail:")
        for item in _block_value_lines(pedalfx_raw):
            lines.append(f"    {item}")
    return "\n".join(lines)
