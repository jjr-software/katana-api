from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class DecodeTables:
    amp_type: list[str]
    booster_type: list[str]
    fx_type: list[str]
    delay_type: list[str]
    reverb_type: list[str]
    reverb_layer_mode: list[str]
    chain_pattern: list[str]
    send_return_mode: list[str]
    eq_type: list[str]
    send_return_position: list[str]
    pedalfx_type: list[str]


RESOURCE_INDEX = {
    "amp_type": 4,
    "booster_type": 5,
    "fx_type": 8,
    "delay_type": 9,
    "reverb_type": 10,
    "reverb_layer_mode": 11,
    "chain_pattern": 13,
    "send_return_mode": 41,
    "eq_type": 43,
    "send_return_position": 44,
    "pedalfx_type": 46,
}


FALLBACK_TABLES = DecodeTables(
    amp_type=["ACOUSTIC", "CLEAN", "CRUNCH", "LEAD", "BROWN"],
    booster_type=[
        "MID BOOST", "CLEAN BOOST", "TREBLE BOOST", "CRUNCH OD", "NATURAL OD", "WARM OD", "FAT DS",
        "METAL DS", "OCT FUZZ", "BLUES DRIVE", "OVERDRIVE", "T-SCREAM", "TURBO OD", "DISTORTION",
        "RAT", "GUV DS", "DST+", "METAL ZONE", "'60S FUZZ", "MUFF FUZZ", "HM-2", "METAL CORE", "CENTA OD",
    ],
    fx_type=[
        "T.WAH", "AUTO WAH", "PEDAL WAH", "COMP", "LIMITER", "GEQ", "PEQ", "GUITAR SIM", "SLOW GEAR",
        "WAVE SYNTH", "OCTAVE", "PITCH SHIFT", "HARMONIST", "AC.PROCESS", "PHASER", "FLANGER", "TREMOLO",
        "ROTARY", "UNI-V", "SLICER", "VIBRATO", "RING MOD", "HUMANIZER", "CHORUS", "AC.GTR SIM",
        "PHASER 90E", "FLNGR 117E", "WAH 95E", "DC-30", "HEAVY OCT", "PEDAL BEND",
    ],
    delay_type=["DIGITAL", "PAN", "STEREO", "ANALOG", "TAPE ECHO", "REVERSE", "MODULATE", "SDE-3000"],
    reverb_type=["PLATE", "ROOM", "HALL", "SPRING", "MODULATE"],
    reverb_layer_mode=["NORMAL", "INVERSE"],
    chain_pattern=["CHAIN1", "CHAIN2-1", "CHAIN3-1", "CHAIN4-1", "CHAIN2-2", "CHAIN3-2", "CHAIN4-2"],
    send_return_mode=["SERIES", "PARALLEL", "BRANCH OUT"],
    eq_type=["PARAMETRIC EQ", "GE-10"],
    send_return_position=["AMP IN", "AMP OUT"],
    pedalfx_type=["PEDAL WAH", "PEDAL BEND", "WAH 95E"],
)


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _default_resource_js_path() -> Path:
    return _repo_root() / "manual-extract" / "installer_extracted" / "localappdata" / "Roland" / "BOSS TONE STUDIO for KATANA Gen 3" / "html" / "js" / "config" / "resource.js"


def _default_cache_path() -> Path:
    return _repo_root() / "python" / ".cache" / "decode_tables.json"


def _clean_item(s: str) -> str:
    return re.sub(r"\s+", " ", s.replace("<br>", " ").strip())


def _parse_resource_text_entries(resource_js: str) -> list[list[str]]:
    matches = re.findall(r'\{\s*text:\s*"([^"]*)"\s*\}', resource_js)
    out: list[list[str]] = []
    for m in matches:
        items = [_clean_item(x) for x in m.split(",")]
        out.append([x for x in items if x != ""])
    return out


def _tables_from_entries(entries: list[list[str]]) -> DecodeTables:
    def get(idx_name: str, fallback: list[str]) -> list[str]:
        idx = RESOURCE_INDEX[idx_name]
        if 0 <= idx < len(entries) and entries[idx]:
            return entries[idx]
        return fallback

    return DecodeTables(
        amp_type=get("amp_type", FALLBACK_TABLES.amp_type),
        booster_type=get("booster_type", FALLBACK_TABLES.booster_type),
        fx_type=get("fx_type", FALLBACK_TABLES.fx_type),
        delay_type=get("delay_type", FALLBACK_TABLES.delay_type),
        reverb_type=get("reverb_type", FALLBACK_TABLES.reverb_type),
        reverb_layer_mode=get("reverb_layer_mode", FALLBACK_TABLES.reverb_layer_mode),
        chain_pattern=get("chain_pattern", FALLBACK_TABLES.chain_pattern),
        send_return_mode=get("send_return_mode", FALLBACK_TABLES.send_return_mode),
        eq_type=get("eq_type", FALLBACK_TABLES.eq_type),
        send_return_position=get("send_return_position", FALLBACK_TABLES.send_return_position),
        pedalfx_type=get("pedalfx_type", FALLBACK_TABLES.pedalfx_type),
    )


def _to_json_obj(t: DecodeTables) -> dict:
    return {
        "amp_type": t.amp_type,
        "booster_type": t.booster_type,
        "fx_type": t.fx_type,
        "delay_type": t.delay_type,
        "reverb_type": t.reverb_type,
        "reverb_layer_mode": t.reverb_layer_mode,
        "chain_pattern": t.chain_pattern,
        "send_return_mode": t.send_return_mode,
        "eq_type": t.eq_type,
        "send_return_position": t.send_return_position,
        "pedalfx_type": t.pedalfx_type,
    }


def _from_json_obj(obj: dict) -> DecodeTables:
    return DecodeTables(
        amp_type=list(obj.get("amp_type", FALLBACK_TABLES.amp_type)),
        booster_type=list(obj.get("booster_type", FALLBACK_TABLES.booster_type)),
        fx_type=list(obj.get("fx_type", FALLBACK_TABLES.fx_type)),
        delay_type=list(obj.get("delay_type", FALLBACK_TABLES.delay_type)),
        reverb_type=list(obj.get("reverb_type", FALLBACK_TABLES.reverb_type)),
        reverb_layer_mode=list(obj.get("reverb_layer_mode", FALLBACK_TABLES.reverb_layer_mode)),
        chain_pattern=list(obj.get("chain_pattern", FALLBACK_TABLES.chain_pattern)),
        send_return_mode=list(obj.get("send_return_mode", FALLBACK_TABLES.send_return_mode)),
        eq_type=list(obj.get("eq_type", FALLBACK_TABLES.eq_type)),
        send_return_position=list(obj.get("send_return_position", FALLBACK_TABLES.send_return_position)),
        pedalfx_type=list(obj.get("pedalfx_type", FALLBACK_TABLES.pedalfx_type)),
    )


def load_decode_tables() -> DecodeTables:
    resource_path = _default_resource_js_path()
    cache_path = _default_cache_path()

    try:
        source_stat = resource_path.stat()
    except OSError:
        return FALLBACK_TABLES

    try:
        if cache_path.exists():
            with cache_path.open("r", encoding="utf-8") as handle:
                cache = json.load(handle)
            src = cache.get("source", {})
            if (
                src.get("path") == str(resource_path)
                and int(src.get("size", -1)) == int(source_stat.st_size)
                and float(src.get("mtime", -1.0)) == float(source_stat.st_mtime)
            ):
                return _from_json_obj(cache.get("tables", {}))
    except Exception:
        pass

    try:
        text = resource_path.read_text(encoding="utf-8")
        entries = _parse_resource_text_entries(text)
        tables = _tables_from_entries(entries)
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        with cache_path.open("w", encoding="utf-8") as handle:
            json.dump(
                {
                    "source": {
                        "path": str(resource_path),
                        "size": int(source_stat.st_size),
                        "mtime": float(source_stat.st_mtime),
                    },
                    "tables": _to_json_obj(tables),
                },
                handle,
                indent=2,
            )
            handle.write("\n")
        return tables
    except Exception:
        return FALLBACK_TABLES


def decode_choice(choices: list[str], value: int) -> str:
    idx = int(value)
    if 0 <= idx < len(choices):
        return choices[idx]
    return f"unknown({idx})"
