import hashlib
import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import Patch
from app.schemas import PatchCreate, PatchRead

router = APIRouter(prefix="/api/v1/patches", tags=["patches"])


@router.get("", response_model=list[PatchRead])
def list_patches(db: Session = Depends(get_db)) -> list[Patch]:
    return list(db.scalars(select(Patch).order_by(Patch.id.desc())))


@router.post("", response_model=PatchRead)
def create_patch(payload: PatchCreate, db: Session = Depends(get_db)) -> Patch:
    snapshot_bytes = json.dumps(payload.snapshot, sort_keys=True, separators=(",", ":")).encode("utf-8")
    checksum = hashlib.sha256(snapshot_bytes).hexdigest()
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
