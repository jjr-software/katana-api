"""migrate legacy saved patches into patch objects

Revision ID: 20260330_0009
Revises: 20260329_0008
Create Date: 2026-03-30 09:05:00.000000
"""

from collections.abc import Sequence
from typing import Any

import sqlalchemy as sa
from alembic import op

from app.patch_objects import extract_patch_object

# revision identifiers, used by Alembic.
revision: str = "20260330_0009"
down_revision: str | None = "20260329_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    metadata = sa.MetaData()
    patches = sa.Table("patches", metadata, autoload_with=bind)
    patch_configs = sa.Table("patch_configs", metadata, autoload_with=bind)
    patch_objects = sa.Table("patch_objects", metadata, autoload_with=bind)

    existing_names = {str(name) for name in bind.execute(sa.select(patch_objects.c.name)).scalars()}
    covered_hashes: set[str] = set()

    patch_rows = bind.execute(
        sa.select(
            patches.c.id,
            patches.c.name,
            patches.c.source,
            patches.c.tags,
            patches.c.snapshot,
            patches.c.checksum,
        ).order_by(patches.c.id.asc())
    ).mappings()
    for row in patch_rows:
        snapshot = _as_snapshot(row["snapshot"])
        patch_json = extract_patch_object(snapshot)
        if not patch_json:
            continue
        bind.execute(
            sa.insert(patch_objects).values(
                name=_unique_name(str(row["name"] or f"Imported Patch {row['id']}"), existing_names),
                description="",
                patch_json=patch_json,
                source_type="imported",
                source_prompt=None,
                parent_patch_object_id=None,
            )
        )
        checksum = row["checksum"]
        if isinstance(checksum, str) and checksum.strip():
            covered_hashes.add(checksum.strip())

    config_rows = bind.execute(
        sa.select(
            patch_configs.c.hash_id,
            patch_configs.c.snapshot,
            patch_configs.c.created_at,
        ).order_by(patch_configs.c.created_at.asc(), patch_configs.c.hash_id.asc())
    ).mappings()
    for row in config_rows:
        hash_id = str(row["hash_id"])
        if hash_id in covered_hashes:
            continue
        snapshot = _as_snapshot(row["snapshot"])
        patch_json = extract_patch_object(snapshot)
        if not patch_json:
            continue
        bind.execute(
            sa.insert(patch_objects).values(
                name=_unique_name(_legacy_config_name(snapshot, hash_id), existing_names),
                description="",
                patch_json=patch_json,
                source_type="imported",
                source_prompt=None,
                parent_patch_object_id=None,
            )
        )


def downgrade() -> None:
    # No-op: this revision migrates user data into the canonical patch_objects table.
    pass


def _unique_name(base: str, existing_names: set[str]) -> str:
    candidate = (base or "Imported Patch").strip() or "Imported Patch"
    if candidate not in existing_names:
        existing_names.add(candidate)
        return candidate
    index = 2
    while True:
        numbered = f"{candidate} ({index})"
        if numbered not in existing_names:
            existing_names.add(numbered)
            return numbered
        index += 1


def _as_snapshot(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}
def _legacy_config_name(snapshot: dict[str, Any], hash_id: str) -> str:
    patch_name = snapshot.get("patch_name")
    if isinstance(patch_name, str) and patch_name.strip():
        return patch_name.strip()
    return f"Imported {hash_id[:8]}"
