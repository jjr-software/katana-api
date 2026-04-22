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
