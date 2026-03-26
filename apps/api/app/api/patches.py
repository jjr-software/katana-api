import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import Patch, PatchConfig, PatchSet, PatchSetMember
from app.schemas import (
    PatchConfigRead,
    PatchConfigUpsert,
    PatchCreate,
    PatchRead,
    PatchSetCreate,
    PatchSetMemberRead,
    PatchSetMemberUpsert,
    PatchSetRead,
)

router = APIRouter(prefix="/api/v1/patches", tags=["patches"])


@router.get("", response_model=list[PatchRead])
def list_patches(db: Session = Depends(get_db)) -> list[Patch]:
    return list(db.scalars(select(Patch).order_by(Patch.id.desc())))


@router.post("", response_model=PatchRead)
def create_patch(payload: PatchCreate, db: Session = Depends(get_db)) -> Patch:
    checksum = _snapshot_hash(payload.snapshot)
    _upsert_patch_config(db, checksum, payload.snapshot)
    patch = Patch(
        name=payload.name,
        source=payload.source,
        tags=payload.tags,
        snapshot=payload.snapshot,
        checksum=checksum,
    )
    db.add(patch)
    db.commit()
    db.refresh(patch)
    return patch


@router.post("/configs", response_model=PatchConfigRead)
def upsert_patch_config(payload: PatchConfigUpsert, db: Session = Depends(get_db)) -> PatchConfig:
    hash_id = _snapshot_hash(payload.snapshot)
    config = _upsert_patch_config(db, hash_id, payload.snapshot)
    db.commit()
    db.refresh(config)
    return config


@router.get("/configs/{hash_id}", response_model=PatchConfigRead)
def get_patch_config(hash_id: str, db: Session = Depends(get_db)) -> PatchConfig:
    config = db.get(PatchConfig, hash_id)
    if config is None:
        raise HTTPException(status_code=404, detail={"message": "Patch config not found", "hash_id": hash_id})
    return config


@router.get("/sets", response_model=list[PatchSetRead])
def list_patch_sets(db: Session = Depends(get_db)) -> list[PatchSet]:
    return list(db.scalars(select(PatchSet).order_by(PatchSet.id.desc())))


@router.post("/sets", response_model=PatchSetRead)
def create_patch_set(payload: PatchSetCreate, db: Session = Depends(get_db)) -> PatchSet:
    existing = db.scalar(select(PatchSet).where(PatchSet.name == payload.name))
    if existing is not None:
        raise HTTPException(status_code=409, detail={"message": "Patch set already exists", "name": payload.name})
    row = PatchSet(name=payload.name, notes=payload.notes)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/sets/{patch_set_id}/members", response_model=list[PatchSetMemberRead])
def list_patch_set_members(patch_set_id: int, db: Session = Depends(get_db)) -> list[PatchSetMember]:
    patch_set = db.get(PatchSet, patch_set_id)
    if patch_set is None:
        raise HTTPException(status_code=404, detail={"message": "Patch set not found", "patch_set_id": patch_set_id})
    return list(
        db.scalars(
            select(PatchSetMember)
            .where(PatchSetMember.patch_set_id == patch_set_id)
            .order_by(PatchSetMember.id.asc())
        )
    )


@router.post("/sets/{patch_set_id}/members", response_model=PatchSetMemberRead)
def upsert_patch_set_member(
    patch_set_id: int,
    payload: PatchSetMemberUpsert,
    db: Session = Depends(get_db),
) -> PatchSetMember:
    patch_set = db.get(PatchSet, patch_set_id)
    if patch_set is None:
        raise HTTPException(status_code=404, detail={"message": "Patch set not found", "patch_set_id": patch_set_id})
    config = db.get(PatchConfig, payload.hash_id)
    if config is None:
        raise HTTPException(status_code=404, detail={"message": "Patch config not found", "hash_id": payload.hash_id})

    row = db.scalar(
        select(PatchSetMember).where(
            PatchSetMember.patch_set_id == patch_set_id,
            PatchSetMember.hash_id == payload.hash_id,
        )
    )
    if row is None:
        row = PatchSetMember(
            patch_set_id=patch_set_id,
            hash_id=payload.hash_id,
            variation_note=payload.variation_note,
        )
        db.add(row)
    else:
        row.variation_note = payload.variation_note
    db.commit()
    db.refresh(row)
    return row


def _upsert_patch_config(db: Session, hash_id: str, snapshot: dict) -> PatchConfig:
    config = db.get(PatchConfig, hash_id)
    if config is not None:
        return config
    config = PatchConfig(hash_id=hash_id, snapshot=snapshot)
    db.add(config)
    return config


def _snapshot_hash(snapshot: dict) -> str:
    canonical = {key: value for key, value in snapshot.items() if key != "config_hash_sha256"}
    snapshot_bytes = json.dumps(canonical, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(snapshot_bytes).hexdigest()
