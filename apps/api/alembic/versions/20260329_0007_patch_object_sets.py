"""patch object sets

Revision ID: 20260329_0007
Revises: 20260329_0006
Create Date: 2026-03-29 18:10:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260329_0007"
down_revision: str | None = "20260329_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "patch_object_sets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("source_prompt", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_patch_object_sets_name"), "patch_object_sets", ["name"], unique=True)
    op.create_index(op.f("ix_patch_object_sets_created_at"), "patch_object_sets", ["created_at"], unique=False)

    op.create_table(
        "patch_object_set_slots",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("patch_object_set_id", sa.Integer(), nullable=False),
        sa.Column("slot", sa.Integer(), nullable=False),
        sa.Column("patch_object_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["patch_object_id"], ["patch_objects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["patch_object_set_id"], ["patch_object_sets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("patch_object_set_id", "slot", name="uq_patch_object_set_slots_set_slot"),
    )
    op.create_index(op.f("ix_patch_object_set_slots_created_at"), "patch_object_set_slots", ["created_at"], unique=False)
    op.create_index(op.f("ix_patch_object_set_slots_patch_object_id"), "patch_object_set_slots", ["patch_object_id"], unique=False)
    op.create_index(op.f("ix_patch_object_set_slots_patch_object_set_id"), "patch_object_set_slots", ["patch_object_set_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_patch_object_set_slots_patch_object_set_id"), table_name="patch_object_set_slots")
    op.drop_index(op.f("ix_patch_object_set_slots_patch_object_id"), table_name="patch_object_set_slots")
    op.drop_index(op.f("ix_patch_object_set_slots_created_at"), table_name="patch_object_set_slots")
    op.drop_table("patch_object_set_slots")

    op.drop_index(op.f("ix_patch_object_sets_created_at"), table_name="patch_object_sets")
    op.drop_index(op.f("ix_patch_object_sets_name"), table_name="patch_object_sets")
    op.drop_table("patch_object_sets")
