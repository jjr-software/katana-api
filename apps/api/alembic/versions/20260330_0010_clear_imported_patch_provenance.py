"""clear imported patch provenance descriptions

Revision ID: 20260330_0010
Revises: 20260330_0009
Create Date: 2026-03-30 09:20:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260330_0010"
down_revision: str | None = "20260330_0009"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    patch_objects = sa.table(
        "patch_objects",
        sa.column("source_type", sa.String()),
        sa.column("description", sa.Text()),
    )
    bind.execute(
        sa.update(patch_objects)
        .where(patch_objects.c.source_type == "imported")
        .where(
            sa.or_(
                patch_objects.c.description == "Migrated from legacy saved patch config",
                patch_objects.c.description.like("Migrated from legacy saved patch%"),
            )
        )
        .values(description="")
    )


def downgrade() -> None:
    # No-op: provenance descriptions were intentionally removed from imported patches.
    pass
