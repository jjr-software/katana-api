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
)

COLOR_BLOCKS = {"booster", "mod", "fx", "delay", "reverb"}
STAGE_BLOCKS = {"booster", "mod", "fx", "delay", "reverb", "eq1", "eq2", "ns", "send_return", "solo", "pedalfx"}


def patch_object_block_names(patch_object: dict[str, Any]) -> list[str]:
    return [name for name in ALLOWED_BLOCKS if isinstance(patch_object.get(name), dict)]


def normalize_patch_object(patch_object: dict[str, Any]) -> dict[str, Any]:
    normalized: dict[str, Any] = {}
    for block_name in ALLOWED_BLOCKS:
        block = patch_object.get(block_name)
        if not isinstance(block, dict):
            continue
        compact = _normalize_block(block_name, block)
        if compact:
            normalized[block_name] = compact
    return normalized


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
        merged["routing"] = deepcopy(normalized["routing"])
    if "amp" in normalized:
        merged["amp"] = deepcopy(normalized["amp"])

    stages = merged.setdefault("stages", {})
    colors = merged.setdefault("colors", {})

    for block_name in patch_object_block_names(normalized):
        if block_name in {"routing", "amp"}:
            continue
        block = deepcopy(normalized[block_name])
        color_index = block.pop("color_index", None)
        stages[block_name] = block
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

    if block_name in {"ns", "send_return", "solo"} and isinstance(block.get("raw"), list):
        out["raw"] = list(block["raw"])
        return out

    if block_name == "pedalfx":
        if isinstance(block.get("raw_com"), list):
            out["raw_com"] = list(block["raw_com"])
        if isinstance(block.get("raw"), list):
            out["raw"] = list(block["raw"])
        return out

    return out
