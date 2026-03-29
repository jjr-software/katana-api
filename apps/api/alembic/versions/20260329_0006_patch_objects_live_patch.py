"""patch objects and live patch state

Revision ID: 20260329_0006
Revises: 20260327_0005
Create Date: 2026-03-29
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260329_0006"
down_revision: Union[str, None] = "20260327_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "patch_objects",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("patch_json", sa.dialects.postgresql.JSONB(), nullable=False),
        sa.Column("source_type", sa.String(length=32), nullable=False),
        sa.Column("source_prompt", sa.Text(), nullable=True),
        sa.Column("parent_patch_object_id", sa.BigInteger(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["parent_patch_object_id"], ["patch_objects.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_patch_objects_name", "patch_objects", ["name"], unique=True)
    op.create_index("ix_patch_objects_source_type", "patch_objects", ["source_type"], unique=False)
    op.create_index("ix_patch_objects_parent_patch_object_id", "patch_objects", ["parent_patch_object_id"], unique=False)
    op.create_index("ix_patch_objects_created_at", "patch_objects", ["created_at"], unique=False)

    op.create_table(
        "patch_object_groups",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_patch_object_groups_name", "patch_object_groups", ["name"], unique=True)
    op.create_index("ix_patch_object_groups_created_at", "patch_object_groups", ["created_at"], unique=False)

    op.create_table(
        "patch_object_group_members",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("group_id", sa.BigInteger(), nullable=False),
        sa.Column("patch_object_id", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["group_id"], ["patch_object_groups.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["patch_object_id"], ["patch_objects.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("group_id", "patch_object_id", name="uq_patch_object_group_members"),
    )
    op.create_index("ix_patch_object_group_members_group_id", "patch_object_group_members", ["group_id"], unique=False)
    op.create_index("ix_patch_object_group_members_patch_object_id", "patch_object_group_members", ["patch_object_id"], unique=False)
    op.create_index("ix_patch_object_group_members_created_at", "patch_object_group_members", ["created_at"], unique=False)

    op.create_table(
        "live_patch_state",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("patch_json", sa.dialects.postgresql.JSONB(), nullable=False),
        sa.Column("active_slot", sa.Integer(), nullable=True),
        sa.Column("amp_confirmed_at", sa.String(length=32), nullable=False),
        sa.Column("source_type", sa.String(length=32), nullable=False),
        sa.Column("last_known_exact_patch_object_id", sa.BigInteger(), nullable=True),
        sa.Column("last_known_exact_slot", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["last_known_exact_patch_object_id"], ["patch_objects.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_live_patch_state_amp_confirmed_at", "live_patch_state", ["amp_confirmed_at"], unique=False)
    op.create_index("ix_live_patch_state_source_type", "live_patch_state", ["source_type"], unique=False)
    op.create_index("ix_live_patch_state_last_known_exact_patch_object_id", "live_patch_state", ["last_known_exact_patch_object_id"], unique=False)
    op.create_index("ix_live_patch_state_created_at", "live_patch_state", ["created_at"], unique=False)

    op.create_table(
        "amp_slot_snapshots",
        sa.Column("slot", sa.Integer(), primary_key=True),
        sa.Column("patch_name", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("patch_json", sa.dialects.postgresql.JSONB(), nullable=False),
        sa.Column("amp_confirmed_at", sa.String(length=32), nullable=False),
        sa.Column("exact_patch_object_id", sa.BigInteger(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["exact_patch_object_id"], ["patch_objects.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_amp_slot_snapshots_amp_confirmed_at", "amp_slot_snapshots", ["amp_confirmed_at"], unique=False)
    op.create_index("ix_amp_slot_snapshots_exact_patch_object_id", "amp_slot_snapshots", ["exact_patch_object_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_amp_slot_snapshots_exact_patch_object_id", table_name="amp_slot_snapshots")
    op.drop_index("ix_amp_slot_snapshots_amp_confirmed_at", table_name="amp_slot_snapshots")
    op.drop_table("amp_slot_snapshots")

    op.drop_index("ix_live_patch_state_created_at", table_name="live_patch_state")
    op.drop_index("ix_live_patch_state_last_known_exact_patch_object_id", table_name="live_patch_state")
    op.drop_index("ix_live_patch_state_source_type", table_name="live_patch_state")
    op.drop_index("ix_live_patch_state_amp_confirmed_at", table_name="live_patch_state")
    op.drop_table("live_patch_state")

    op.drop_index("ix_patch_object_group_members_created_at", table_name="patch_object_group_members")
    op.drop_index("ix_patch_object_group_members_patch_object_id", table_name="patch_object_group_members")
    op.drop_index("ix_patch_object_group_members_group_id", table_name="patch_object_group_members")
    op.drop_table("patch_object_group_members")

    op.drop_index("ix_patch_object_groups_created_at", table_name="patch_object_groups")
    op.drop_index("ix_patch_object_groups_name", table_name="patch_object_groups")
    op.drop_table("patch_object_groups")

    op.drop_index("ix_patch_objects_created_at", table_name="patch_objects")
    op.drop_index("ix_patch_objects_parent_patch_object_id", table_name="patch_objects")
    op.drop_index("ix_patch_objects_source_type", table_name="patch_objects")
    op.drop_index("ix_patch_objects_name", table_name="patch_objects")
    op.drop_table("patch_objects")
