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
    "gafc_exp1",
)

COLOR_BLOCKS = {"booster", "mod", "fx", "delay", "reverb"}
STAGE_BLOCKS = {"booster", "mod", "fx", "delay", "reverb", "eq1", "eq2", "ns", "send_return", "solo", "pedalfx", "gafc_exp1"}
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
        "solo_level": 4,
        "effect_level": 6,
        "direct_mix": 7,
    },
    "mod": {"type": 0},
    "fx": {"type": 0},
    "delay": {
        "type": 0,
        "feedback": 5,
        "high_cut": 6,
        "effect_level": 7,
        "direct_level": 8,
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
    "gafc_exp1": {"function": 0},
}
DELAY_TIME_RAW_START = 1
DELAY_TIME_RAW_END = 5


def patch_object_block_names(patch_object: dict[str, Any]) -> list[str]:
    return [name for name in ALLOWED_BLOCKS if isinstance(patch_object.get(name), dict)]


def normalize_patch_object(patch_object: dict[str, Any]) -> dict[str, Any]:
    return extract_patch_object(patch_object, ALLOWED_BLOCKS)


def patch_object_exact_hash(patch_object: dict[str, Any]) -> str:
    normalized = normalize_patch_object(patch_object)
    blob = json.dumps(normalized, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


def extract_patch_object(full_patch: dict[str, Any], blocks: list[str] | tuple[str, ...] | None = None) -> dict[str, Any]:
    selected = tuple(name for name in (blocks or ALLOWED_BLOCKS) if name in ALLOWED_BLOCKS)
    out: dict[str, Any] = {}

    routing = full_patch.get("routing")
    if "routing" in selected and isinstance(routing, dict):
        block = _normalize_block("routing", routing)
        if block:
            out["routing"] = block

    amp = full_patch.get("amp")
    if "amp" in selected and isinstance(amp, dict):
        block = _normalize_block("amp", amp)
        if block:
            out["amp"] = block

    stages = full_patch.get("stages")
    colors = full_patch.get("colors")
    if isinstance(stages, dict):
        for block_name in selected:
            if block_name not in STAGE_BLOCKS:
                continue
            stage = full_patch.get(block_name)
            if not isinstance(stage, dict):
                stage = stages.get(block_name)
            if not isinstance(stage, dict):
                continue
            stage_copy = deepcopy(stage)
            if block_name in COLOR_BLOCKS and isinstance(colors, dict):
                stage_color = colors.get(block_name)
                if isinstance(stage_color, dict) and isinstance(stage_color.get("index"), (int, float)):
                    stage_copy["color_index"] = int(stage_color["index"])
            block = _normalize_block(block_name, stage_copy)
            if block:
                out[block_name] = block

    return out


def merge_patch_object_into_full_patch(full_patch: dict[str, Any], patch_object: dict[str, Any]) -> dict[str, Any]:
    merged = deepcopy(full_patch)
    normalized = normalize_patch_object(patch_object)

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
    normalized = normalize_patch_object(patch_object)
    extracted = extract_patch_object(full_patch, patch_object_block_names(normalized))
    return normalize_patch_object(extracted) == normalized


def patch_object_partially_matches_patch_object(lhs: dict[str, Any], rhs: dict[str, Any]) -> bool:
    normalized_lhs = normalize_patch_object(lhs)
    normalized_rhs = normalize_patch_object(rhs)
    rhs_subset = {block_name: normalized_rhs[block_name] for block_name in patch_object_block_names(normalized_lhs) if block_name in normalized_rhs}
    return rhs_subset == normalized_lhs


def patch_object_exactly_matches_full_patch(patch_object: dict[str, Any], full_patch: dict[str, Any]) -> bool:
    return patch_object_exact_hash(patch_object) == patch_object_exact_hash(extract_patch_object(full_patch))


def patch_object_to_full_snapshot_for_hash(patch_object: dict[str, Any]) -> dict[str, Any]:
    snapshot: dict[str, Any] = {}
    normalized = normalize_patch_object(patch_object)
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


def _normalize_block(block_name: str, block: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}

    if block_name == "routing":
        for key in ("chain_pattern", "cabinet_resonance", "master_key"):
            if key in block:
                out[key] = block[key]
        return out

    if block_name == "amp":
        if isinstance(block.get("raw"), list):
            out["raw"] = list(block["raw"])
            return out
        for key in (
            "gain",
            "volume",
            "bass",
            "middle",
            "treble",
            "presence",
            "poweramp_variation",
            "amp_type",
            "resonance",
            "preamp_variation",
        ):
            if key in block:
                out[key] = block[key]
        return out

    if block_name in COLOR_BLOCKS and isinstance(block.get("color_index"), (int, float)):
        out["color_index"] = int(block["color_index"])

    if "on" in block:
        out["on"] = bool(block["on"])

    if block_name == "delay" and "delay2_on" in block:
        out["delay2_on"] = bool(block["delay2_on"])

    if block_name in {"booster", "mod", "fx", "delay", "reverb"}:
        if isinstance(block.get("raw"), list):
            out["raw"] = list(block["raw"])
        if block_name == "delay" and isinstance(block.get("delay2_raw"), list):
            out["delay2_raw"] = list(block["delay2_raw"])
        for key in (
            "type",
            "drive",
            "bottom",
            "tone",
            "solo_level",
            "feedback",
            "effect_level",
            "direct_mix",
            "direct_level",
            "layer_mode",
            "time",
            "pre_delay",
            "high_cut",
            "low_cut",
        ):
            if key in block:
                out[key] = block[key]
        if block_name == "delay" and isinstance(block.get("time_raw"), list):
            out["time_raw"] = list(block["time_raw"])
        return out

    if block_name in {"eq1", "eq2"}:
        for key in ("position", "on", "type"):
            if key in block:
                out[key] = block[key]
        if isinstance(block.get("peq_raw"), list):
            out["peq_raw"] = list(block["peq_raw"])
        if isinstance(block.get("ge10_raw"), list):
            out["ge10_raw"] = list(block["ge10_raw"])
        return out

    if block_name in {"ns", "send_return", "solo"}:
        if isinstance(block.get("raw"), list):
            out["raw"] = list(block["raw"])
        for key in ("threshold", "release", "position", "mode", "send_level", "return_level", "effect_level"):
            if key in block:
                out[key] = block[key]
        return out

    if block_name == "pedalfx":
        if isinstance(block.get("raw_com"), list):
            out["raw_com"] = list(block["raw_com"])
        if isinstance(block.get("raw"), list):
            out["raw"] = list(block["raw"])
        for key in ("position", "on", "type"):
            if key in block:
                out[key] = block[key]
        return out

    if block_name == "gafc_exp1":
        if isinstance(block.get("raw"), list):
            out["raw"] = list(block["raw"])
        if isinstance(block.get("detail_raw"), list):
            out["detail_raw"] = list(block["detail_raw"])
        if isinstance(block.get("min_raw"), list):
            out["min_raw"] = list(block["min_raw"])
        if isinstance(block.get("max_raw"), list):
            out["max_raw"] = list(block["max_raw"])
        if "function" in block:
            out["function"] = block["function"]
        return out

    return out


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
            target["solo_level"] = raw[4]
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

    if block_name == "gafc_exp1":
        raw = target.get("raw")
        if isinstance(raw, list) and len(raw) >= 1:
            target["function"] = raw[0]
