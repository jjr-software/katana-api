"""add audio level marker flag

Revision ID: 20260326_0003
Revises: 20260326_0002
Create Date: 2026-03-26
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260326_0003"
down_revision: Union[str, None] = "20260326_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "audio_samples",
        sa.Column("is_level_marker", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.create_index("ix_audio_samples_is_level_marker", "audio_samples", ["is_level_marker"], unique=False)
    op.alter_column("audio_samples", "is_level_marker", server_default=None)


def downgrade() -> None:
    op.drop_index("ix_audio_samples_is_level_marker", table_name="audio_samples")
    op.drop_column("audio_samples", "is_level_marker")
