"""add patch config measurements

Revision ID: 20260327_0004
Revises: 20260326_0003
Create Date: 2026-03-27
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260327_0004"
down_revision: Union[str, None] = "20260326_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("patch_configs", sa.Column("measured_rms_dbfs", sa.Float(), nullable=True))
    op.add_column("patch_configs", sa.Column("measured_peak_dbfs", sa.Float(), nullable=True))
    op.add_column("patch_configs", sa.Column("measured_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("patch_configs", "measured_at")
    op.drop_column("patch_configs", "measured_peak_dbfs")
    op.drop_column("patch_configs", "measured_rms_dbfs")
