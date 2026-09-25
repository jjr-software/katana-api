"""Store continuous song takes.

Revision ID: 20260925_0012
Revises: 20260422_0011
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "20260925_0012"
down_revision: str | None = "20260422_0011"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "song_takes",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("source", sa.String(length=255), nullable=False),
        sa.Column("duration_sec", sa.Float(), nullable=False),
        sa.Column("waveform", postgresql.JSONB(), nullable=False),
        sa.Column("audio_wav", sa.LargeBinary(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("song_takes")
