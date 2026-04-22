"""canonicalize patch object numeric fields

Revision ID: 20260422_0011
Revises: 20260330_0010
Create Date: 2026-04-22 00:11:00.000000
"""

from collections.abc import Sequence
from typing import Any

import sqlalchemy as sa
from alembic import op

from app.patch_objects import canonicalize_patch_object

# revision identifiers, used by Alembic.
revision: str = "20260422_0011"
down_revision: str | None = "20260330_0010"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    metadata = sa.MetaData()
    patch_objects = sa.Table("patch_objects", metadata, autoload_with=bind)

    rows = bind.execute(
        sa.select(patch_objects.c.id, patch_objects.c.patch_json).order_by(patch_objects.c.id.asc())
    ).mappings()
    for row in rows:
        patch_json = _as_patch_json(row["patch_json"])
        normalized = canonicalize_patch_object(patch_json)
        if normalized != patch_json:
            bind.execute(
                sa.update(patch_objects)
                .where(patch_objects.c.id == row["id"])
                .values(patch_json=normalized)
            )


def downgrade() -> None:
    # No-op: canonical patch object JSON is the desired stored form.
    pass


def _as_patch_json(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise RuntimeError(f"patch_objects.patch_json must be an object, got {type(value).__name__}")
    return value
