"""add audio samples table

Revision ID: 20260326_0002
Revises: 20260326_0001
Create Date: 2026-03-26
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260326_0002"
down_revision: Union[str, None] = "20260326_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "audio_samples",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("patch_hash", sa.String(length=64), nullable=True),
        sa.Column("slot", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(length=255), nullable=False),
        sa.Column("duration_sec", sa.Integer(), nullable=False),
        sa.Column("rate", sa.Integer(), nullable=False),
        sa.Column("channels", sa.Integer(), nullable=False),
        sa.Column("rms_dbfs", sa.Float(), nullable=False),
        sa.Column("peak_dbfs", sa.Float(), nullable=False),
        sa.Column("sample_count", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.ForeignKeyConstraint(["patch_hash"], ["patch_configs.hash_id"], ondelete="SET NULL"),
    )
    op.create_index("ix_audio_samples_patch_hash", "audio_samples", ["patch_hash"], unique=False)
    op.create_index("ix_audio_samples_created_at", "audio_samples", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_audio_samples_created_at", table_name="audio_samples")
    op.drop_index("ix_audio_samples_patch_hash", table_name="audio_samples")
    op.drop_table("audio_samples")
