from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import PatchObject

GE10_FLAT_PEQ_RAW = [0, 20, 13, 0, 20, 13, 0, 20, 20, 14, 20]
GE10_FLAT_BAND_RAW = [20] * 11


def _ge10_raw(bands: dict[int, int], level: int = 20) -> list[int]:
    raw = list(GE10_FLAT_BAND_RAW)
    for index, value in bands.items():
        if 0 <= index < 10:
            raw[index] = 20 + int(value)
    raw[10] = int(level)
    return raw


def _eq_block(position: int, bands: dict[int, int], level: int = 20) -> dict[str, Any]:
    return {
        "position": position,
        "on": True,
        "type": 1,
        "peq_raw": list(GE10_FLAT_PEQ_RAW),
        "ge10_raw": _ge10_raw(bands, level=level),
    }


def _raw_block(raw: list[int]) -> dict[str, Any]:
    return {"raw": list(raw)}


def _delay_block(raw: list[int], *, on: bool = True, delay2_on: bool = False) -> dict[str, Any]:
    return {
        "on": on,
        "delay2_on": delay2_on,
        "raw": list(raw),
    }


def _booster_block(raw: list[int], *, on: bool = True) -> dict[str, Any]:
    return {"on": on, "raw": list(raw)}


def _drive_patch(
    amp_raw: list[int],
    booster_raw: list[int],
    *,
    eq1_bands: dict[int, int] | None = None,
    eq2_bands: dict[int, int] | None = None,
) -> dict[str, Any]:
    patch: dict[str, Any] = {
        "amp": _raw_block(amp_raw),
        "booster": _booster_block(booster_raw),
    }
    if eq1_bands is not None:
        patch["eq1"] = _eq_block(0, eq1_bands)
    if eq2_bands is not None:
        patch["eq2"] = _eq_block(1, eq2_bands)
    return patch


ROM_PATCH_OBJECT_SPECS: list[dict[str, Any]] = [
    {
        "name": "Hendrix-Style Dynamic Crunch",
        "description": "Mid-forward GE-10 character pack for expressive crunch and vocal-like overdrive feel.",
        "patch_json": {
            "eq1": _eq_block(
                0,
                {
                    2: -4,
                    3: -3,
                    4: 6,
                    5: 5,
                    6: 4,
                },
            ),
            "eq2": _eq_block(
                1,
                {
                    1: 2,
                    3: -2,
                    6: 3,
                    7: 3,
                    8: 2,
                },
            ),
        },
    },
    {
        "name": "ZZ Top Thick Blues Honk",
        "description": "Thick low-mid push for blues-rock growl with controlled nasal edge after the amp.",
        "patch_json": {
            "eq1": _eq_block(
                0,
                {
                    2: 3,
                    3: 4,
                    4: 5,
                    5: 6,
                    6: 3,
                },
            ),
            "eq2": _eq_block(
                1,
                {
                    3: 2,
                    4: -2,
                    5: 2,
                    7: 4,
                    8: 2,
                },
            ),
        },
    },
    {
        "name": "Marshall Plexi Rock Crunch",
        "description": "Classic mid-hump pre-shape with a brighter post-EQ crunch for 70s rock punch.",
        "patch_json": {
            "eq1": _eq_block(
                0,
                {
                    2: -2,
                    4: 7,
                    5: 8,
                    6: 5,
                },
            ),
            "eq2": _eq_block(
                1,
                {
                    1: 3,
                    3: -3,
                    7: 4,
                    8: 3,
                },
            ),
        },
    },
    {
        "name": "Funky Clean Sparkle",
        "description": "Tight low-cut clean rhythm shape with bright top-end shimmer and quack.",
        "patch_json": {
            "eq1": _eq_block(
                0,
                {
                    0: -3,
                    1: -2,
                    4: -2,
                },
            ),
            "eq2": _eq_block(
                1,
                {
                    6: 5,
                    7: 7,
                    8: 8,
                    9: 6,
                },
            ),
        },
    },
    {
        "name": "Blues Lead Warmth",
        "description": "Warm lead shape with a gentle mid push and rounded top end for sustained blues phrasing.",
        "patch_json": {
            "eq1": _eq_block(
                0,
                {
                    1: 3,
                    4: 4,
                    5: 5,
                    6: 3,
                },
            ),
            "eq2": _eq_block(
                1,
                {
                    3: -2,
                    7: 3,
                    8: 2,
                    9: 1,
                },
            ),
        },
    },
    {
        "name": "High-Gain Metal Scoop",
        "description": "Tight pre-gain shape with an extreme post-EQ V for modern high-gain metal.",
        "patch_json": {
            "eq1": _eq_block(
                0,
                {
                    0: -4,
                    2: -3,
                    4: 3,
                    5: 4,
                },
            ),
            "eq2": _eq_block(
                1,
                {
                    0: 3,
                    2: -3,
                    3: -6,
                    4: -9,
                    5: -12,
                    6: -6,
                    8: 6,
                    9: 9,
                },
            ),
        },
    },
    {
        "name": "Modern Djent Tight Rhythm",
        "description": "Ultra-tight low cut and aggressive upper-mid focus for percussive modern rhythm work.",
        "patch_json": {
            "eq1": _eq_block(
                0,
                {
                    0: -6,
                    1: -3,
                    2: -2,
                    5: 5,
                    6: 4,
                },
            ),
            "eq2": _eq_block(
                1,
                {
                    1: 4,
                    3: -3,
                    4: -6,
                    5: -5,
                    7: 5,
                    8: 6,
                    9: 6,
                },
            ),
        },
    },
    {
        "name": "Lead Solo Presence Boost",
        "description": "Mid push plus air and bite for solo cut-through without changing the core tone too much.",
        "patch_json": {
            "eq1": _eq_block(
                0,
                {
                    4: 4,
                    5: 5,
                    6: 6,
                },
            ),
            "eq2": _eq_block(
                1,
                {
                    6: 4,
                    7: 6,
                    8: 5,
                    9: 4,
                },
            ),
        },
    },
    {
        "name": "Graham Coxon Brit Scratch",
        "description": "Lean lows and sharp upper-mids with a distortion booster and focused GE-10 shaping for dry 90s Brit scratch.",
        "patch_json": _drive_patch(
            [28, 78, 32, 76, 52, 30, 0, 1, 1, 0],
            [13, 74, 36, 62, 0, 50, 70, 0],
            eq1_bands={
                0: -4,
                1: -3,
                2: -1,
                4: 2,
            },
            eq2_bands={
                5: 2,
                6: 4,
                7: 5,
                8: 4,
                9: 2,
            },
        ),
    },
    {
        "name": "90s Alt RAT Lane",
        "description": "Tight lows and biting mids with a RAT booster and a pre/post EQ squeeze for angular alt-rock drive.",
        "patch_json": _drive_patch(
            [30, 78, 34, 75, 49, 27, 0, 1, 1, 0],
            [14, 76, 38, 60, 0, 50, 69, 0],
            eq1_bands={
                1: -2,
                2: -1,
                4: 3,
                5: 4,
                6: 3,
            },
            eq2_bands={
                2: -2,
                3: 2,
                6: 3,
                7: 4,
                8: 3,
            },
        ),
    },
    {
        "name": "90s Brit GUV Wall",
        "description": "Clean base with GUV DS thickness plus a thick low-mid EQ wall for mid-forward rhythm grit.",
        "patch_json": _drive_patch(
            [34, 80, 40, 70, 50, 26, 0, 1, 1, 0],
            [15, 78, 46, 52, 0, 50, 72, 0],
            eq1_bands={
                2: 2,
                3: 3,
                4: 4,
                5: 5,
            },
            eq2_bands={
                1: 2,
                3: -2,
                6: 4,
                7: 4,
                8: 3,
            },
        ),
    },
    {
        "name": "T-Scream Edge Clamp",
        "description": "Tight T-Scream edge with low-cut pre-EQ and a brighter post-EQ bite for compact drive rhythm.",
        "patch_json": _drive_patch(
            [27, 76, 31, 74, 55, 31, 0, 1, 1, 0],
            [11, 68, 36, 58, 0, 50, 68, 0],
            eq1_bands={
                0: -4,
                1: -2,
                4: 3,
                5: 4,
            },
            eq2_bands={
                2: -2,
                4: 2,
                6: 4,
                7: 4,
                8: 2,
            },
        ),
    },
    {
        "name": "Turbo OD Mid Stack",
        "description": "Turbo OD grind with a stacked mid shape and controlled top-end for punchy rock drive.",
        "patch_json": _drive_patch(
            [29, 77, 33, 73, 53, 29, 0, 1, 1, 0],
            [12, 72, 38, 60, 0, 50, 69, 0],
            eq1_bands={
                2: -3,
                3: -2,
                4: 4,
                5: 5,
            },
            eq2_bands={
                1: 2,
                3: -2,
                6: 3,
                7: 4,
                8: 3,
            },
        ),
    },
    {
        "name": "Crunch OD Garage Bite",
        "description": "Crunch OD hair and a narrow garage-band EQ contour for rough, immediate rhythm bite.",
        "patch_json": _drive_patch(
            [31, 78, 35, 72, 48, 27, 0, 1, 1, 0],
            [3, 70, 40, 55, 0, 50, 68, 0],
            eq1_bands={
                0: -3,
                1: -2,
                4: 4,
                5: 4,
            },
            eq2_bands={
                6: 3,
                7: 5,
                8: 4,
                9: 2,
            },
        ),
    },
    {
        "name": "Natural OD Smooth Lead",
        "description": "Natural OD saturation with a rounder EQ curve for smoother lead sustain and less fizz.",
        "patch_json": _drive_patch(
            [33, 79, 34, 71, 50, 28, 0, 1, 1, 0],
            [4, 66, 34, 57, 0, 50, 66, 0],
            eq1_bands={
                1: 2,
                3: 2,
                4: 3,
                5: 4,
                6: 2,
            },
            eq2_bands={
                2: -2,
                3: 1,
                6: 3,
                7: 3,
                8: 2,
            },
        ),
    },
    {
        "name": "Mild Comp Clean v02",
        "description": "Gain-floor clean patch with clean boost feel and usable loudness.",
        "patch_json": {
            "amp": _raw_block([50, 68, 42, 62, 58, 54, 1, 1, 0, 0]),
            "booster": _raw_block([1, 18, 50, 45, 0, 50, 58, 0]),
        },
    },
    {
        "name": "Delay Slapback Utility",
        "description": "Short slapback with a clear dry core for rhythm thickening and lead doubling.",
        "patch_json": {
            "delay": _delay_block([0, 0, 6, 14, 0, 12, 11, 22, 88, 0, 0, 0, 0, 0, 0, 1, 0]),
        },
    },
    {
        "name": "Delay Digital Rhythm",
        "description": "Medium digital delay with clean repeats that stays useful across most clean and edge tones.",
        "patch_json": {
            "delay": _delay_block([0, 0, 1, 2, 12, 18, 10, 26, 82, 0, 0, 0, 0, 0, 0, 1, 0]),
        },
    },
    {
        "name": "Delay Warm Analog",
        "description": "Rounder analog-style delay with softer repeats for leads and looser rhythm space.",
        "patch_json": {
            "delay": _delay_block([3, 0, 1, 4, 0, 24, 8, 24, 84, 0, 0, 0, 1, 0, 0, 1, 0]),
        },
    },
    {
        "name": "Delay Tape Echo",
        "description": "Tape echo flavour with slightly darker repeats and a gentle, musical decay.",
        "patch_json": {
            "delay": _delay_block([4, 0, 1, 7, 12, 22, 8, 22, 84, 0, 0, 0, 1, 0, 0, 1, 0]),
        },
    },
    {
        "name": "Delay Modulated Space",
        "description": "Modulated delay for wider ambient leads without becoming a special effect.",
        "patch_json": {
            "delay": _delay_block([6, 0, 1, 12, 2, 20, 9, 24, 80, 0, 16, 18, 1, 1, 0, 1, 1]),
        },
    },
]


def seed_rom_patch_objects(db: Session) -> int:
    seeded = 0
    for spec in ROM_PATCH_OBJECT_SPECS:
        existing = db.scalar(select(PatchObject).where(PatchObject.name == spec["name"]))
        if existing is None:
            db.add(
                PatchObject(
                    name=str(spec["name"]),
                    description=str(spec["description"]),
                    patch_json=spec["patch_json"],
                    source_type="rom",
                    source_prompt=None,
                )
            )
            seeded += 1
            continue
        if existing.source_type == "rom":
            existing.description = str(spec["description"])
            existing.patch_json = spec["patch_json"]
            existing.source_prompt = None
    if seeded:
        db.flush()
    return seeded
