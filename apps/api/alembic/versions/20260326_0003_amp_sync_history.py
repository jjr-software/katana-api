"""add amp sync history table

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
    op.create_table(
        "amp_sync_history",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("job_id", sa.String(length=36), nullable=False),
        sa.Column("operation", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("synced_at", sa.String(length=32), nullable=True),
        sa.Column("amp_state_hash_sha256", sa.String(length=64), nullable=True),
        sa.Column("total_sync_ms", sa.Integer(), nullable=True),
        sa.Column("slot_count", sa.Integer(), nullable=True),
        sa.Column("result_json", sa.dialects.postgresql.JSONB(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_amp_sync_history_job_id", "amp_sync_history", ["job_id"], unique=True)
    op.create_index("ix_amp_sync_history_operation", "amp_sync_history", ["operation"], unique=False)
    op.create_index("ix_amp_sync_history_status", "amp_sync_history", ["status"], unique=False)
    op.create_index("ix_amp_sync_history_synced_at", "amp_sync_history", ["synced_at"], unique=False)
    op.create_index(
        "ix_amp_sync_history_amp_state_hash_sha256",
        "amp_sync_history",
        ["amp_state_hash_sha256"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_amp_sync_history_amp_state_hash_sha256", table_name="amp_sync_history")
    op.drop_index("ix_amp_sync_history_synced_at", table_name="amp_sync_history")
    op.drop_index("ix_amp_sync_history_status", table_name="amp_sync_history")
    op.drop_index("ix_amp_sync_history_operation", table_name="amp_sync_history")
    op.drop_index("ix_amp_sync_history_job_id", table_name="amp_sync_history")
    op.drop_table("amp_sync_history")
