"""link audio samples to patch objects

Revision ID: 20260329_0008
Revises: 20260329_0007
Create Date: 2026-03-29 19:25:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260329_0008"
down_revision: str | None = "20260329_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("audio_samples", sa.Column("patch_object_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_audio_samples_patch_object_id"), "audio_samples", ["patch_object_id"], unique=False)
    op.create_foreign_key(
        "fk_audio_samples_patch_object_id_patch_objects",
        "audio_samples",
        "patch_objects",
        ["patch_object_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_audio_samples_patch_object_id_patch_objects", "audio_samples", type_="foreignkey")
    op.drop_index(op.f("ix_audio_samples_patch_object_id"), table_name="audio_samples")
    op.drop_column("audio_samples", "patch_object_id")
