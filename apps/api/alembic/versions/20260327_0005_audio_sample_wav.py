"""add wav storage to audio samples

Revision ID: 20260327_0005
Revises: 20260327_0004
Create Date: 2026-03-27
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260327_0005"
down_revision: Union[str, None] = "20260327_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("audio_samples", sa.Column("audio_wav", sa.LargeBinary(), nullable=True))


def downgrade() -> None:
    op.drop_column("audio_samples", "audio_wav")
