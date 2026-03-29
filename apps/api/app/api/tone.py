from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.amp_queue import amp_job_queue
from app.deps import get_amp_client, get_db
from app.katana import AmpClient
from app.live_patch_state import live_patch_status_payload, upsert_amp_slot_snapshot, upsert_live_patch_state
from app.models import LivePatchState, PatchObject, PatchObjectGroup, PatchObjectGroupMember
from app.patch_objects import (
    ALLOWED_BLOCKS,
    extract_patch_object,
    merge_patch_object_into_full_patch,
    normalize_patch_object,
    patch_object_block_names,
)

router = APIRouter(prefix="/api/v1", tags=["tone"])


class PatchObjectCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    patch_json: dict
    source_type: str = Field(min_length=1, max_length=32)
    source_prompt: str | None = None
    parent_patch_object_id: int | None = None


class PatchObjectReadResponse(BaseModel):
    id: int
    name: str
    description: str
    patch_json: dict
    source_type: str
    source_prompt: str | None = None
    parent_patch_object_id: int | None = None
    blocks: list[str]
    created_at: str
    updated_at: str


class SaveFromLiveRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    blocks: list[str] = Field(min_length=1)
    source_type: str = Field(default="manual", min_length=1, max_length=32)
    source_prompt: str | None = None


class GroupCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""


class GroupReadResponse(BaseModel):
    id: int
    name: str
    description: str
    created_at: str
    updated_at: str


class LivePatchReadResponse(BaseModel):
    patch_json: dict
    active_slot: int | None = None
    amp_confirmed_at: str
    source_type: str
    exact_patch_object: dict | None = None
    partial_patch_objects: list[dict]
    exact_amp_slot: dict | None = None
    partial_amp_slots: list[dict]
    compat_hash_sha256: str


class ApplyPatchObjectRequest(BaseModel):
    patch_object_id: int


class StoreLivePatchToSlotRequest(BaseModel):
    slot: int = Field(ge=1, le=8)


@router.get("/patch-objects", response_model=list[PatchObjectReadResponse])
def list_patch_objects(db: Session = Depends(get_db)) -> list[PatchObjectReadResponse]:
    rows = list(db.scalars(select(PatchObject).order_by(PatchObject.id.desc())))
    return [_patch_object_response(row) for row in rows]


@router.post("/patch-objects", response_model=PatchObjectReadResponse)
def create_patch_object(payload: PatchObjectCreateRequest, db: Session = Depends(get_db)) -> PatchObjectReadResponse:
    existing = db.scalar(select(PatchObject).where(PatchObject.name == payload.name))
    if existing is not None:
        raise HTTPException(status_code=409, detail={"message": "Patch object already exists", "name": payload.name})
    row = PatchObject(
        name=payload.name,
        description=payload.description,
        patch_json=normalize_patch_object(payload.patch_json),
        source_type=payload.source_type,
        source_prompt=payload.source_prompt,
        parent_patch_object_id=payload.parent_patch_object_id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _patch_object_response(row)


@router.get("/patch-objects/{patch_object_id:int}", response_model=PatchObjectReadResponse)
def get_patch_object(patch_object_id: int, db: Session = Depends(get_db)) -> PatchObjectReadResponse:
    row = db.get(PatchObject, patch_object_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"message": "Patch object not found", "patch_object_id": patch_object_id})
    return _patch_object_response(row)


@router.post("/patch-objects/save-from-live", response_model=PatchObjectReadResponse)
async def save_patch_object_from_live(
    payload: SaveFromLiveRequest,
    db: Session = Depends(get_db),
    client: AmpClient = Depends(get_amp_client),
) -> PatchObjectReadResponse:
    existing = db.scalar(select(PatchObject).where(PatchObject.name == payload.name))
    if existing is not None:
        raise HTTPException(status_code=409, detail={"message": "Patch object already exists", "name": payload.name})
    blocks = _validated_blocks(payload.blocks)
    live_row = db.get(LivePatchState, 1)
    if live_row is None:
        synced_at = datetime.now().isoformat(timespec="seconds")
        patch = await _read_live_patch_from_amp(client)
        active = await client.read_active_slot()
        live_row = upsert_live_patch_state(
            db,
            full_patch=patch,
            active_slot=active.slot,
            amp_confirmed_at=synced_at,
            source_type="amp_sync",
        )
    sparse = extract_patch_object(live_row.patch_json, blocks)
    row = PatchObject(
        name=payload.name,
        description=payload.description,
        patch_json=sparse,
        source_type=payload.source_type,
        source_prompt=payload.source_prompt,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _patch_object_response(row)


@router.get("/groups", response_model=list[GroupReadResponse])
def list_groups(db: Session = Depends(get_db)) -> list[GroupReadResponse]:
    rows = list(db.scalars(select(PatchObjectGroup).order_by(PatchObjectGroup.id.desc())))
    return [
        GroupReadResponse(
            id=row.id,
            name=row.name,
            description=row.description,
            created_at=row.created_at.isoformat(timespec="seconds"),
            updated_at=row.updated_at.isoformat(timespec="seconds"),
        )
        for row in rows
    ]


@router.post("/groups", response_model=GroupReadResponse)
def create_group(payload: GroupCreateRequest, db: Session = Depends(get_db)) -> GroupReadResponse:
    existing = db.scalar(select(PatchObjectGroup).where(PatchObjectGroup.name == payload.name))
    if existing is not None:
        raise HTTPException(status_code=409, detail={"message": "Group already exists", "name": payload.name})
    row = PatchObjectGroup(name=payload.name, description=payload.description)
    db.add(row)
    db.commit()
    db.refresh(row)
    return GroupReadResponse(
        id=row.id,
        name=row.name,
        description=row.description,
        created_at=row.created_at.isoformat(timespec="seconds"),
        updated_at=row.updated_at.isoformat(timespec="seconds"),
    )


@router.post("/groups/{group_id:int}/patch-objects/{patch_object_id:int}")
def add_patch_object_to_group(group_id: int, patch_object_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    group = db.get(PatchObjectGroup, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail={"message": "Group not found", "group_id": group_id})
    patch_object = db.get(PatchObject, patch_object_id)
    if patch_object is None:
        raise HTTPException(status_code=404, detail={"message": "Patch object not found", "patch_object_id": patch_object_id})
    existing = db.scalar(
        select(PatchObjectGroupMember).where(
            PatchObjectGroupMember.group_id == group_id,
            PatchObjectGroupMember.patch_object_id == patch_object_id,
        )
    )
    if existing is None:
        db.add(PatchObjectGroupMember(group_id=group_id, patch_object_id=patch_object_id))
        db.commit()
    return {"ok": True}


@router.get("/live-patch", response_model=LivePatchReadResponse)
def get_live_patch(db: Session = Depends(get_db)) -> LivePatchReadResponse:
    row = db.get(LivePatchState, 1)
    if row is None:
        raise HTTPException(status_code=404, detail={"message": "Live Patch has not been synced yet"})
    return LivePatchReadResponse(**live_patch_status_payload(db, row))


@router.post("/live-patch/sync", response_model=LivePatchReadResponse)
async def sync_live_patch(
    db: Session = Depends(get_db),
    client: AmpClient = Depends(get_amp_client),
) -> LivePatchReadResponse:
    synced_at = datetime.now().isoformat(timespec="seconds")
    patch = await _queued_current_patch()
    active = await client.read_active_slot()
    row = upsert_live_patch_state(
        db,
        full_patch=patch,
        active_slot=active.slot,
        amp_confirmed_at=synced_at,
        source_type="amp_sync",
    )
    if active.slot is not None:
        upsert_amp_slot_snapshot(
            db,
            slot=active.slot,
            patch_name=str(patch.get("patch_name", "")),
            full_patch=patch,
            amp_confirmed_at=synced_at,
        )
    return LivePatchReadResponse(**live_patch_status_payload(db, row))


@router.post("/live-patch/apply-patch-object", response_model=LivePatchReadResponse)
async def apply_patch_object_to_live_patch(
    payload: ApplyPatchObjectRequest,
    db: Session = Depends(get_db),
    client: AmpClient = Depends(get_amp_client),
) -> LivePatchReadResponse:
    patch_object = db.get(PatchObject, payload.patch_object_id)
    if patch_object is None:
        raise HTTPException(status_code=404, detail={"message": "Patch object not found", "patch_object_id": payload.patch_object_id})
    live_row = db.get(LivePatchState, 1)
    if live_row is None:
        synced_at = datetime.now().isoformat(timespec="seconds")
        patch = await _read_live_patch_from_amp(client)
        active = await client.read_active_slot()
        live_row = upsert_live_patch_state(
            db,
            full_patch=patch,
            active_slot=active.slot,
            amp_confirmed_at=synced_at,
            source_type="amp_sync",
        )
    merged = merge_patch_object_into_full_patch(live_row.patch_json, patch_object.patch_json)
    applied = await _queued_apply_current_patch(merged)
    applied_at = datetime.now().isoformat(timespec="seconds")
    row = upsert_live_patch_state(
        db,
        full_patch=applied,
        active_slot=live_row.active_slot,
        amp_confirmed_at=applied_at,
        source_type="ai_apply" if patch_object.source_type == "ai" else "manual_apply",
    )
    return LivePatchReadResponse(**live_patch_status_payload(db, row))


@router.post("/live-patch/store-to-slot", response_model=LivePatchReadResponse)
async def store_live_patch_to_slot(
    payload: StoreLivePatchToSlotRequest,
    db: Session = Depends(get_db),
) -> LivePatchReadResponse:
    live_row = db.get(LivePatchState, 1)
    if live_row is None:
        raise HTTPException(status_code=404, detail={"message": "Live Patch has not been synced yet"})
    job = await amp_job_queue.enqueue_slot_write(slot=payload.slot, patch=live_row.patch_json)
    settled = await _await_terminal_job(job.job_id, timeout_seconds=120.0)
    if settled.status != "succeeded" or settled.result_slot is None:
        raise HTTPException(
            status_code=502,
            detail={"message": "Failed to store Live Patch to slot", "error": settled.error, "slot": payload.slot},
        )
    slot_item = settled.result_slot
    upsert_amp_slot_snapshot(
        db,
        slot=payload.slot,
        patch_name=slot_item.patch_name,
        full_patch=slot_item.payload or live_row.patch_json,
        amp_confirmed_at=slot_item.synced_at,
    )
    row = upsert_live_patch_state(
        db,
        full_patch=live_row.patch_json,
        active_slot=payload.slot,
        amp_confirmed_at=slot_item.synced_at,
        source_type=live_row.source_type,
    )
    return LivePatchReadResponse(**live_patch_status_payload(db, row))


def _patch_object_response(row: PatchObject) -> PatchObjectReadResponse:
    return PatchObjectReadResponse(
        id=row.id,
        name=row.name,
        description=row.description,
        patch_json=row.patch_json,
        source_type=row.source_type,
        source_prompt=row.source_prompt,
        parent_patch_object_id=row.parent_patch_object_id,
        blocks=patch_object_block_names(row.patch_json),
        created_at=row.created_at.isoformat(timespec="seconds"),
        updated_at=row.updated_at.isoformat(timespec="seconds"),
    )


def _validated_blocks(blocks: list[str]) -> list[str]:
    out: list[str] = []
    for block in blocks:
        if block not in ALLOWED_BLOCKS:
            raise HTTPException(status_code=400, detail={"message": "Unknown block", "block": block})
        if block not in out:
            out.append(block)
    if not out:
        raise HTTPException(status_code=400, detail={"message": "At least one block is required"})
    return out


async def _queued_current_patch() -> dict[str, Any]:
    job = await amp_job_queue.enqueue_current_patch()
    settled = await _await_terminal_job(job.job_id, timeout_seconds=60.0)
    if settled.status != "succeeded" or settled.result_current_patch is None:
        raise HTTPException(status_code=502, detail={"message": "Failed to read current patch", "error": settled.error})
    return settled.result_current_patch


async def _queued_apply_current_patch(patch: dict[str, Any]) -> dict[str, Any]:
    job = await amp_job_queue.enqueue_apply_current_patch(patch)
    settled = await _await_terminal_job(job.job_id, timeout_seconds=120.0)
    if settled.status != "succeeded" or settled.result_applied_patch is None:
        raise HTTPException(status_code=502, detail={"message": "Failed to apply current patch", "error": settled.error})
    return settled.result_applied_patch


async def _read_live_patch_from_amp(client: AmpClient) -> dict[str, Any]:
    return (await client.read_current_patch()).payload


async def _await_terminal_job(job_id: str, *, timeout_seconds: float) -> Any:
    deadline = datetime.now().timestamp() + timeout_seconds
    while datetime.now().timestamp() < deadline:
        job = await amp_job_queue.get_job(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail={"message": "Amp job not found", "job_id": job_id})
        if job.status in {"succeeded", "failed"}:
            return job
        await asyncio.sleep(0.1)
    raise HTTPException(status_code=504, detail={"message": "Amp job timed out", "job_id": job_id})
