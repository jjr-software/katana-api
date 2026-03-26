"""base schema

Revision ID: 20260326_0001
Revises:
Create Date: 2026-03-26
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260326_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "patches",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("tags", sa.dialects.postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("snapshot", sa.dialects.postgresql.JSONB(), nullable=False),
        sa.Column("checksum", sa.String(length=64), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_patches_checksum", "patches", ["checksum"], unique=False)

    op.create_table(
        "patch_configs",
        sa.Column("hash_id", sa.String(length=64), primary_key=True),
        sa.Column("snapshot", sa.dialects.postgresql.JSONB(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )

    op.create_table(
        "patch_sets",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_patch_sets_name", "patch_sets", ["name"], unique=True)

    op.create_table(
        "patch_set_members",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("patch_set_id", sa.BigInteger(), nullable=False),
        sa.Column("hash_id", sa.String(length=64), nullable=False),
        sa.Column("variation_note", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.ForeignKeyConstraint(["patch_set_id"], ["patch_sets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["hash_id"], ["patch_configs.hash_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("patch_set_id", "hash_id", name="uq_patch_set_members_set_hash"),
    )
    op.create_index("ix_patch_set_members_patch_set_id", "patch_set_members", ["patch_set_id"], unique=False)
    op.create_index("ix_patch_set_members_hash_id", "patch_set_members", ["hash_id"], unique=False)

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

    op.drop_index("ix_patch_set_members_hash_id", table_name="patch_set_members")
    op.drop_index("ix_patch_set_members_patch_set_id", table_name="patch_set_members")
    op.drop_table("patch_set_members")

    op.drop_index("ix_patch_sets_name", table_name="patch_sets")
    op.drop_table("patch_sets")

    op.drop_table("patch_configs")

    op.drop_index("ix_patches_checksum", table_name="patches")
    op.drop_table("patches")
