from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from typing import Any

from app.hashing import canonical_blob

ALLOWED_BLOCKS = (
    "routing",
    "amp",
    "booster",
    "mod",
    "fx",
    "delay",
    "reverb",
    "eq1",
    "eq2",
    "ns",
    "send_return",
    "solo",
    "pedalfx",
    "exp_pedal",
    "gafc_exp1",
)

COLOR_BLOCKS = {"booster", "mod", "fx", "delay", "reverb"}
STAGE_BLOCKS = {"booster", "mod", "fx", "delay", "reverb", "eq1", "eq2", "ns", "send_return", "solo", "pedalfx", "exp_pedal", "gafc_exp1"}
AMP_FIELD_TO_RAW_INDEX = {
    "gain": 0,
    "volume": 1,
    "bass": 2,
    "middle": 3,
    "treble": 4,
    "presence": 5,
    "poweramp_variation": 6,
    "amp_type": 7,
    "resonance": 8,
    "preamp_variation": 9,
}
STAGE_RAW_FIELD_MAP: dict[str, dict[str, int]] = {
    "booster": {
        "type": 0,
        "drive": 1,
        "bottom": 2,
        "tone": 3,
        "solo_sw": 4,
        "solo_level": 5,
        "effect_level": 6,
        "direct_mix": 7,
    },
    "mod": {"type": 0},
    "fx": {"type": 0},
    "delay": {
        "type": 0,
        "feedback": 4,
        "high_cut": 5,
        "effect_level": 6,
        "direct_level": 7,
    },
    "reverb": {
        "type": 0,
        "layer_mode": 1,
        "time": 2,
        "pre_delay": 3,
        "low_cut": 8,
        "high_cut": 9,
        "effect_level": 10,
        "direct_level": 11,
    },
    "ns": {"threshold": 1, "release": 2},
    "send_return": {"position": 1, "mode": 2, "send_level": 3, "return_level": 4},
    "solo": {"effect_level": 1},
    "pedalfx": {"position": 0, "type": 2},
    "exp_pedal": {"function": 0},
    "gafc_exp1": {"function": 0},
}
NUMERIC_BLOCK_FIELDS: dict[str, tuple[str, ...]] = {
    "routing": ("chain_pattern", "cabinet_resonance", "master_key"),
    "amp": ("gain", "volume", "bass", "middle", "treble", "presence", "poweramp_variation", "amp_type", "resonance", "preamp_variation"),
    "booster": ("type", "drive", "bottom", "tone", "solo_sw", "solo_level", "effect_level", "direct_mix"),
    "mod": ("type",),
    "fx": ("type",),
    "delay": ("type", "feedback", "high_cut", "effect_level", "direct_level", "layer_mode", "time", "pre_delay"),
    "reverb": ("type", "layer_mode", "time", "pre_delay", "low_cut", "high_cut", "effect_level", "direct_level"),
    "eq1": ("position", "type"),
    "eq2": ("position", "type"),
    "ns": ("threshold", "release"),
    "send_return": ("position", "mode", "send_level", "return_level"),
    "solo": ("effect_level",),
    "pedalfx": ("position", "type"),
    "exp_pedal": ("function",),
    "gafc_exp1": ("function",),
}
DELAY_TIME_RAW_START = 2
DELAY_TIME_RAW_END = 4


def patch_object_block_names(patch_object: dict[str, Any]) -> list[str]:
    return [name for name in ALLOWED_BLOCKS if isinstance(patch_object.get(name), dict)]


def canonicalize_patch_object(patch_object: dict[str, Any]) -> dict[str, Any]:
    return extract_patch_object(patch_object, ALLOWED_BLOCKS)


def patch_object_exact_hash(patch_object: dict[str, Any]) -> str:
    normalized = canonicalize_patch_object(patch_object)
    blob = json.dumps(normalized, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


def extract_patch_object(full_patch: dict[str, Any], blocks: list[str] | tuple[str, ...] | None = None) -> dict[str, Any]:
    selected = tuple(name for name in (blocks or ALLOWED_BLOCKS) if name in ALLOWED_BLOCKS)
    out: dict[str, Any] = {}

    routing = full_patch.get("routing")
    if "routing" in selected and isinstance(routing, dict):
        block = _canonicalize_block("routing", routing)
        if block:
            out["routing"] = block

    amp = full_patch.get("amp")
    if "amp" in selected and isinstance(amp, dict):
        block = _canonicalize_block("amp", amp)
        if block:
            out["amp"] = block

    colors = full_patch.get("colors")
    stages = full_patch.get("stages")
    stages_dict = stages if isinstance(stages, dict) else None
    for block_name in selected:
        if block_name not in STAGE_BLOCKS:
            continue
        stage = full_patch.get(block_name)
        if not isinstance(stage, dict) and stages_dict is not None:
            stage = stages_dict.get(block_name)
        if not isinstance(stage, dict):
            continue
        stage_copy = deepcopy(stage)
        if block_name in COLOR_BLOCKS and isinstance(colors, dict):
            stage_color = colors.get(block_name)
            if isinstance(stage_color, dict) and isinstance(stage_color.get("index"), (int, float)):
                stage_copy["color_index"] = int(stage_color["index"])
        block = _canonicalize_block(block_name, stage_copy)
        if block:
            out[block_name] = block

    return out


def merge_patch_object_into_full_patch(full_patch: dict[str, Any], patch_object: dict[str, Any]) -> dict[str, Any]:
    merged = deepcopy(full_patch)
    normalized = canonicalize_patch_object(patch_object)

    if "routing" in normalized:
        routing_target = _ensure_object(merged, "routing")
        routing_target.update(deepcopy(normalized["routing"]))
    if "amp" in normalized:
        _merge_amp_block(_ensure_object(merged, "amp"), normalized["amp"])

    stages = merged.setdefault("stages", {})
    colors = merged.setdefault("colors", {})

    for block_name in patch_object_block_names(normalized):
        if block_name in {"routing", "amp"}:
            continue
        block = deepcopy(normalized[block_name])
        color_index = block.pop("color_index", None)
        stage_target = stages.get(block_name)
        if not isinstance(stage_target, dict):
            stage_target = {}
            stages[block_name] = stage_target
        _merge_stage_block(block_name, stage_target, block)
        if block_name in COLOR_BLOCKS and isinstance(color_index, int):
            color_block = colors.setdefault(block_name, {})
            color_block["index"] = color_index

    return merged


def patch_object_partially_matches_full_patch(patch_object: dict[str, Any], full_patch: dict[str, Any]) -> bool:
    normalized = canonicalize_patch_object(patch_object)
    extracted = extract_patch_object(full_patch, patch_object_block_names(normalized))
    return canonicalize_patch_object(extracted) == normalized


def patch_object_partially_matches_patch_object(lhs: dict[str, Any], rhs: dict[str, Any]) -> bool:
    normalized_lhs = canonicalize_patch_object(lhs)
    normalized_rhs = canonicalize_patch_object(rhs)
    rhs_subset = {block_name: normalized_rhs[block_name] for block_name in patch_object_block_names(normalized_lhs) if block_name in normalized_rhs}
    return rhs_subset == normalized_lhs


def patch_object_exactly_matches_full_patch(patch_object: dict[str, Any], full_patch: dict[str, Any]) -> bool:
    return patch_object_exact_hash(patch_object) == patch_object_exact_hash(extract_patch_object(full_patch))


def patch_object_to_full_snapshot_for_hash(patch_object: dict[str, Any]) -> dict[str, Any]:
    snapshot: dict[str, Any] = {}
    normalized = canonicalize_patch_object(patch_object)
    if "routing" in normalized:
        snapshot["routing"] = deepcopy(normalized["routing"])
    if "amp" in normalized:
        snapshot["amp"] = deepcopy(normalized["amp"])
    stages: dict[str, Any] = {}
    colors: dict[str, Any] = {}
    for block_name in patch_object_block_names(normalized):
        if block_name in {"routing", "amp"}:
            continue
        block = deepcopy(normalized[block_name])
        color_index = block.pop("color_index", None)
        stages[block_name] = block
        if block_name in COLOR_BLOCKS and isinstance(color_index, int):
            colors[block_name] = {"index": color_index}
    if stages:
        snapshot["stages"] = stages
    if colors:
        snapshot["colors"] = colors
    return snapshot


def patch_object_hash_for_full_snapshot_compat(patch_object: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_blob(patch_object_to_full_snapshot_for_hash(patch_object)).encode("utf-8")).hexdigest()


def _canonicalize_block(block_name: str, block: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}

    if block_name == "routing":
        for key in NUMERIC_BLOCK_FIELDS[block_name]:
            value = block.get(key)
            if value is not None:
                out[key] = _coerce_int_value(value, f"routing.{key}")
        return out

    if block_name == "amp":
        if isinstance(block.get("raw"), list):
            out["raw"] = _coerce_int_list(block["raw"], "amp.raw")
            return out
        for key in NUMERIC_BLOCK_FIELDS[block_name]:
            value = block.get(key)
            if value is not None:
                out[key] = _coerce_int_value(value, f"amp.{key}")
        return out

    if block_name in COLOR_BLOCKS and "color_index" in block:
        out["color_index"] = _coerce_int_value(block["color_index"], f"{block_name}.color_index")

    if "on" in block:
        out["on"] = bool(block["on"])

    if block_name == "delay" and "delay2_on" in block:
        out["delay2_on"] = bool(block["delay2_on"])

    if block_name in {"booster", "mod", "fx", "delay", "reverb"}:
        if isinstance(block.get("raw"), list):
            out["raw"] = _coerce_int_list(block["raw"], f"{block_name}.raw")
        if block_name == "delay" and isinstance(block.get("delay2_raw"), list):
            out["delay2_raw"] = _coerce_int_list(block["delay2_raw"], "delay.delay2_raw")
        if block_name == "delay" and isinstance(block.get("time_raw"), list):
            out["time_raw"] = _coerce_int_list(block["time_raw"], "delay.time_raw")
        for key in NUMERIC_BLOCK_FIELDS[block_name]:
            value = block.get(key)
            if value is not None:
                out[key] = _coerce_int_value(value, f"{block_name}.{key}")
        return out

    if block_name in {"eq1", "eq2"}:
        for key in ("position", "type"):
            value = block.get(key)
            if value is not None:
                out[key] = _coerce_int_value(value, f"{block_name}.{key}")
        if "on" in block:
            out["on"] = bool(block["on"])
        if isinstance(block.get("peq_raw"), list):
            out["peq_raw"] = _coerce_int_list(block["peq_raw"], f"{block_name}.peq_raw")
        if isinstance(block.get("ge10_raw"), list):
            out["ge10_raw"] = _coerce_int_list(block["ge10_raw"], f"{block_name}.ge10_raw")
        return out

    if block_name in {"ns", "send_return", "solo"}:
        if isinstance(block.get("raw"), list):
            out["raw"] = _coerce_int_list(block["raw"], f"{block_name}.raw")
        for key in NUMERIC_BLOCK_FIELDS[block_name]:
            value = block.get(key)
            if value is not None:
                out[key] = _coerce_int_value(value, f"{block_name}.{key}")
        return out

    if block_name == "pedalfx":
        if isinstance(block.get("raw_com"), list):
            out["raw_com"] = _coerce_int_list(block["raw_com"], "pedalfx.raw_com")
        if isinstance(block.get("raw"), list):
            out["raw"] = _coerce_int_list(block["raw"], "pedalfx.raw")
        for key in ("position", "type"):
            value = block.get(key)
            if value is not None:
                out[key] = _coerce_int_value(value, f"pedalfx.{key}")
        if "on" in block:
            out["on"] = bool(block["on"])
        return out

    if block_name == "exp_pedal":
        if isinstance(block.get("raw"), list):
            out["raw"] = _coerce_int_list(block["raw"], "exp_pedal.raw")
        if isinstance(block.get("detail_raw"), list):
            out["detail_raw"] = _coerce_int_list(block["detail_raw"], "exp_pedal.detail_raw")
        if isinstance(block.get("min_raw"), list):
            out["min_raw"] = _coerce_int_list(block["min_raw"], "exp_pedal.min_raw")
        if isinstance(block.get("max_raw"), list):
            out["max_raw"] = _coerce_int_list(block["max_raw"], "exp_pedal.max_raw")
        if "function" in block:
            out["function"] = _coerce_int_value(block["function"], "exp_pedal.function")
        return out

    if block_name == "gafc_exp1":
        if isinstance(block.get("raw"), list):
            out["raw"] = _coerce_int_list(block["raw"], "gafc_exp1.raw")
        if isinstance(block.get("detail_raw"), list):
            out["detail_raw"] = _coerce_int_list(block["detail_raw"], "gafc_exp1.detail_raw")
        if isinstance(block.get("min_raw"), list):
            out["min_raw"] = _coerce_int_list(block["min_raw"], "gafc_exp1.min_raw")
        if isinstance(block.get("max_raw"), list):
            out["max_raw"] = _coerce_int_list(block["max_raw"], "gafc_exp1.max_raw")
        if "function" in block:
            out["function"] = _coerce_int_value(block["function"], "gafc_exp1.function")
        return out

    return out


def _coerce_int_list(values: list[Any], field_name: str) -> list[int]:
    out: list[int] = []
    for index, value in enumerate(values):
        out.append(_coerce_int_value(value, f"{field_name}[{index}]"))
    return out


def _coerce_int_value(value: Any, field_name: str) -> int:
    if isinstance(value, bool):
        raise ValueError(f"{field_name} must be numeric")
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        text = value.strip()
        if text:
            try:
                return int(text)
            except ValueError as exc:
                raise ValueError(f"{field_name} must be numeric") from exc
    raise ValueError(f"{field_name} must be numeric")


def _ensure_object(target: dict[str, Any], key: str) -> dict[str, Any]:
    value = target.get(key)
    if isinstance(value, dict):
        return value
    value = {}
    target[key] = value
    return value


def _merge_amp_block(target: dict[str, Any], patch_block: dict[str, Any]) -> None:
    for key, value in patch_block.items():
        if key == "raw" and isinstance(value, list):
            target["raw"] = list(value)
        elif key != "color_index":
            target[key] = deepcopy(value)
    raw = target.get("raw")
    if isinstance(raw, list):
        for key, index in AMP_FIELD_TO_RAW_INDEX.items():
            if key in patch_block and 0 <= index < len(raw):
                raw[index] = int(target[key])
    else:
        raw = [0] * 10
        for key, index in AMP_FIELD_TO_RAW_INDEX.items():
            value = target.get(key)
            if isinstance(value, (int, float)):
                raw[index] = int(value)
        target["raw"] = raw
    for key, index in AMP_FIELD_TO_RAW_INDEX.items():
        if 0 <= index < len(raw):
            target[key] = raw[index]


def _merge_stage_block(block_name: str, target: dict[str, Any], patch_block: dict[str, Any]) -> None:
    for key, value in patch_block.items():
        if isinstance(value, list):
            target[key] = list(value)
        else:
            target[key] = deepcopy(value)

    _sync_stage_raw_from_compact(block_name, target, patch_block)
    _sync_stage_compact_from_raw(block_name, target)


def _sync_stage_raw_from_compact(block_name: str, target: dict[str, Any], patch_block: dict[str, Any]) -> None:
    raw_map = STAGE_RAW_FIELD_MAP.get(block_name, {})
    raw = target.get("raw")
    if isinstance(raw, list):
        for key, index in raw_map.items():
            if key in patch_block and 0 <= index < len(raw) and isinstance(target.get(key), (int, float)):
                raw[index] = int(target[key])
        if block_name == "delay":
            time_raw = target.get("time_raw")
            if isinstance(time_raw, list) and len(raw) >= DELAY_TIME_RAW_END:
                for raw_index, value in enumerate(time_raw[: DELAY_TIME_RAW_END - DELAY_TIME_RAW_START], start=DELAY_TIME_RAW_START):
                    raw[raw_index] = int(value)
    elif block_name in {"ns", "send_return", "solo"}:
        max_index = max(raw_map.values(), default=0)
        raw = [0] * (max_index + 1)
        if isinstance(target.get("on"), bool):
            raw[0] = 1 if target["on"] else 0
        for key, index in raw_map.items():
            value = target.get(key)
            if isinstance(value, (int, float)):
                raw[index] = int(value)
        target["raw"] = raw

    if block_name == "pedalfx":
        raw_com = target.get("raw_com")
        if isinstance(raw_com, list):
            if isinstance(target.get("position"), (int, float)) and len(raw_com) >= 1:
                raw_com[0] = int(target["position"])
            if isinstance(target.get("on"), bool) and len(raw_com) >= 2:
                raw_com[1] = 1 if target["on"] else 0
            if isinstance(target.get("type"), (int, float)) and len(raw_com) >= 3:
                raw_com[2] = int(target["type"])
        else:
            raw_com = [0, 0, 0]
            if isinstance(target.get("position"), (int, float)):
                raw_com[0] = int(target["position"])
            if isinstance(target.get("on"), bool):
                raw_com[1] = 1 if target["on"] else 0
            if isinstance(target.get("type"), (int, float)):
                raw_com[2] = int(target["type"])
            target["raw_com"] = raw_com

    if block_name == "exp_pedal":
        raw = target.get("raw")
        if isinstance(raw, list):
            if isinstance(target.get("function"), (int, float)) and len(raw) >= 1:
                raw[0] = int(target["function"])
        else:
            raw = [0]
            if isinstance(target.get("function"), (int, float)):
                raw[0] = int(target["function"])
            target["raw"] = raw

        detail_raw = target.get("detail_raw")
        if isinstance(detail_raw, list) and len(detail_raw) < 34:
            target["detail_raw"] = detail_raw + [0] * (34 - len(detail_raw))
        min_raw = target.get("min_raw")
        if isinstance(min_raw, list) and len(min_raw) < 49:
            target["min_raw"] = min_raw + [0] * (49 - len(min_raw))
        max_raw = target.get("max_raw")
        if isinstance(max_raw, list) and len(max_raw) < 49:
            target["max_raw"] = max_raw + [0] * (49 - len(max_raw))

    if block_name == "gafc_exp1":
        raw = target.get("raw")
        if isinstance(raw, list):
            if isinstance(target.get("function"), (int, float)) and len(raw) >= 1:
                raw[0] = int(target["function"])
        else:
            raw = [0]
            if isinstance(target.get("function"), (int, float)):
                raw[0] = int(target["function"])
            target["raw"] = raw


def _sync_stage_compact_from_raw(block_name: str, target: dict[str, Any]) -> None:
    raw = target.get("raw")
    if block_name == "booster" and isinstance(raw, list):
        if len(raw) >= 1:
            target["type"] = raw[0]
        if len(raw) >= 2:
            target["drive"] = raw[1]
        if len(raw) >= 3:
            target["bottom"] = raw[2]
        if len(raw) >= 4:
            target["tone"] = raw[3]
        if len(raw) >= 5:
            target["solo_sw"] = raw[4]
        if len(raw) >= 6:
            target["solo_level"] = raw[5]
        if len(raw) >= 7:
            target["effect_level"] = raw[6]
        if len(raw) >= 8:
            target["direct_mix"] = raw[7]
    elif block_name in {"mod", "fx"} and isinstance(raw, list):
        if len(raw) >= 1:
            target["type"] = raw[0]
    elif block_name == "delay" and isinstance(raw, list):
        if len(raw) >= 1:
            target["type"] = raw[0]
        if len(raw) >= DELAY_TIME_RAW_END:
            target["time_raw"] = list(raw[DELAY_TIME_RAW_START:DELAY_TIME_RAW_END])
        if len(raw) >= 6:
            target["feedback"] = raw[5]
        if len(raw) >= 8:
            target["effect_level"] = raw[7]
        if len(raw) >= 9:
            target["direct_level"] = raw[8]
    elif block_name == "reverb" and isinstance(raw, list):
        if len(raw) >= 1:
            target["type"] = raw[0]
        if len(raw) >= 2:
            target["layer_mode"] = raw[1]
        if len(raw) >= 3:
            target["time"] = raw[2]
        if len(raw) >= 11:
            target["effect_level"] = raw[10]
        if len(raw) >= 12:
            target["direct_level"] = raw[11]
    elif block_name == "ns" and isinstance(raw, list):
        if len(raw) >= 1:
            target["on"] = bool(raw[0])
        if len(raw) >= 2:
            target["threshold"] = raw[1]
        if len(raw) >= 3:
            target["release"] = raw[2]
    elif block_name == "send_return" and isinstance(raw, list):
        if len(raw) >= 1:
            target["on"] = bool(raw[0])
        if len(raw) >= 2:
            target["position"] = raw[1]
        if len(raw) >= 3:
            target["mode"] = raw[2]
        if len(raw) >= 4:
            target["send_level"] = raw[3]
        if len(raw) >= 5:
            target["return_level"] = raw[4]
    elif block_name == "solo" and isinstance(raw, list):
        if len(raw) >= 1:
            target["on"] = bool(raw[0])
        if len(raw) >= 2:
            target["effect_level"] = raw[1]

    if block_name == "pedalfx":
        raw_com = target.get("raw_com")
        if isinstance(raw_com, list):
            if len(raw_com) >= 1:
                target["position"] = raw_com[0]
            if len(raw_com) >= 2:
                target["on"] = bool(raw_com[1])
            if len(raw_com) >= 3:
                target["type"] = raw_com[2]

    if block_name == "exp_pedal":
        raw = target.get("raw")
        if isinstance(raw, list) and len(raw) >= 1:
            target["function"] = raw[0]

    if block_name == "gafc_exp1":
        raw = target.get("raw")
        if isinstance(raw, list) and len(raw) >= 1:
            target["function"] = raw[0]
