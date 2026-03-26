from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Patch(Base):
    __tablename__ = "patches"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[str] = mapped_column(String(64), nullable=False)
    tags: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PatchConfig(Base):
    __tablename__ = "patch_configs"

    hash_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PatchSet(Base):
    __tablename__ = "patch_sets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PatchSetMember(Base):
    __tablename__ = "patch_set_members"
    __table_args__ = (UniqueConstraint("patch_set_id", "hash_id", name="uq_patch_set_members_set_hash"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    patch_set_id: Mapped[int] = mapped_column(ForeignKey("patch_sets.id", ondelete="CASCADE"), nullable=False, index=True)
    hash_id: Mapped[str] = mapped_column(ForeignKey("patch_configs.hash_id", ondelete="CASCADE"), nullable=False, index=True)
    variation_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AmpSyncHistory(Base):
    __tablename__ = "amp_sync_history"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    job_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True, index=True)
    operation: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    synced_at: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    amp_state_hash_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    total_sync_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    slot_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    result_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AudioSample(Base):
    __tablename__ = "audio_samples"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    patch_hash: Mapped[str | None] = mapped_column(ForeignKey("patch_configs.hash_id", ondelete="SET NULL"), nullable=True, index=True)
    slot: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    duration_sec: Mapped[int] = mapped_column(Integer, nullable=False)
    rate: Mapped[int] = mapped_column(Integer, nullable=False)
    channels: Mapped[int] = mapped_column(Integer, nullable=False)
    rms_dbfs: Mapped[float] = mapped_column(Float, nullable=False)
    peak_dbfs: Mapped[float] = mapped_column(Float, nullable=False)
    sample_count: Mapped[int] = mapped_column(Integer, nullable=False)
    is_level_marker: Mapped[bool] = mapped_column(nullable=False, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
