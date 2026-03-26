"""add patch catalog tables

Revision ID: 20260326_0002
Revises: 20260325_0001
Create Date: 2026-03-26
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260326_0002"
down_revision: Union[str, None] = "20260325_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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


def downgrade() -> None:
    op.drop_index("ix_patch_set_members_hash_id", table_name="patch_set_members")
    op.drop_index("ix_patch_set_members_patch_set_id", table_name="patch_set_members")
    op.drop_table("patch_set_members")

    op.drop_index("ix_patch_sets_name", table_name="patch_sets")
    op.drop_table("patch_sets")

    op.drop_table("patch_configs")
