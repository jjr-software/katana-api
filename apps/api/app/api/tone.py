from __future__ import annotations

import asyncio
import json
from datetime import datetime
from typing import Any
from urllib import error as urllib_error
from urllib import request as urllib_request

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.amp_queue import amp_job_queue
from app.api.ai import _extract_refusal_text, _extract_response_text
from app.deps import get_amp_client, get_db
from app.katana import AmpClient, slot_label
from app.live_patch_state import live_patch_status_payload, upsert_amp_slot_snapshot, upsert_live_patch_state
from app.models import (
    LivePatchState,
    PatchObject,
    PatchObjectGroup,
    PatchObjectGroupMember,
    PatchObjectSet,
    PatchObjectSetSlot,
)
from app.patch_objects import (
    ALLOWED_BLOCKS,
    extract_patch_object,
    merge_patch_object_into_full_patch,
    normalize_patch_object,
    patch_object_block_names,
)
from app.settings import Settings, get_settings

router = APIRouter(prefix="/api/v1", tags=["tone"])

AI_SET_SYSTEM_PROMPT = """You are a BOSS Katana Gen 3 tone-set designer.

You are generating sparse patch objects for tone exploration, not full arbitrary prose advice.

Rules:
- Return JSON only.
- Generate exactly the requested number of candidates.
- Each candidate must contain only the requested top-level blocks.
- A present top-level block means this candidate owns that block.
- Absent blocks mean do not care.
- Do not include unrelated blocks.
- Prefer sparse 1-4 block outputs.
- Use only controls already shown in the provided live-patch reference blocks.
- Keep candidates audibly distinct and useful for A/B testing.
- Give each candidate a short unique name and one short description.
- If a stage should be off, include that stage block and set `on` to false.
- Use compact fields when possible, for example `amp.gain`, `booster.drive`, `booster.tone`, `booster.effect_level`, `eq1.position`, `eq1.type`, `eq1.ge10_raw`.
- For EQ blocks, `ge10_raw` or `peq_raw` arrays are allowed and expected when needed.
- For color stages, `color_index` may be set to 0, 1, or 2 when relevant.
- Do not invent unsupported blocks, controls, or arbitrary metadata fields inside the patch objects.
"""

JSON_INTEGER_SCHEMA = {"type": "integer"}
JSON_BOOLEAN_SCHEMA = {"type": "boolean"}
JSON_NULL_SCHEMA = {"type": "null"}
JSON_INT_ARRAY_SCHEMA = {"type": "array", "items": JSON_INTEGER_SCHEMA}


class PatchObjectCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    patch_json: dict
    source_type: str = Field(min_length=1, max_length=32)
    source_prompt: str | None = None
    parent_patch_object_id: int | None = None


class PatchObjectGroupRefResponse(BaseModel):
    id: int
    name: str


class PatchObjectReadResponse(BaseModel):
    id: int
    name: str
    description: str
    patch_json: dict
    source_type: str
    source_prompt: str | None = None
    parent_patch_object_id: int | None = None
    blocks: list[str]
    groups: list[PatchObjectGroupRefResponse]
    created_at: str
    updated_at: str


class PatchObjectDuplicateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


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


class PatchLiveBlockRequest(BaseModel):
    patch_block: dict


class StoreLivePatchToSlotRequest(BaseModel):
    slot: int = Field(ge=1, le=8)


class PatchObjectSetSlotReadResponse(BaseModel):
    slot: int
    patch_object_id: int
    patch_object_name: str
    blocks: list[str]


class PatchObjectSetReadResponse(BaseModel):
    id: int
    name: str
    description: str
    source_prompt: str | None = None
    slots: list[PatchObjectSetSlotReadResponse]
    created_at: str
    updated_at: str


class PatchObjectSetCreateItem(BaseModel):
    slot: int = Field(ge=1, le=8)
    patch_object_id: int


class PatchObjectSetCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    source_prompt: str | None = None
    slots: list[PatchObjectSetCreateItem] = Field(min_length=1, max_length=8)


class ProgramPatchObjectSetRequest(BaseModel):
    start_slot: int = Field(ge=1, le=8)


class ProgrammedSlotResponse(BaseModel):
    slot: int
    slot_label: str
    patch_object_id: int
    patch_object_name: str
    synced_at: str


class ProgramPatchObjectSetResponse(BaseModel):
    set_id: int
    set_name: str
    programmed_slots: list[ProgrammedSlotResponse]


class AiGeneratePatchObjectSetRequest(BaseModel):
    set_name: str = Field(min_length=1, max_length=255)
    description: str = ""
    prompt: str = Field(min_length=1, max_length=2000)
    blocks: list[str] = Field(min_length=1, max_length=8)
    count: int = Field(default=8, ge=1, le=8)


class AiGeneratedCandidate(BaseModel):
    name: str
    description: str
    patch_json: dict


class AiGeneratePatchObjectSetResponse(BaseModel):
    summary: str
    set: PatchObjectSetReadResponse


class AiGeneratePatchObjectsRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)
    count: int = Field(default=4, ge=1, le=8)
    preferred_blocks: list[str] = Field(default_factory=list, max_length=8)
    reference_patch_object_id: int | None = None
    use_live_patch_as_context: bool = True
    name_prefix: str | None = Field(default=None, max_length=255)


@router.get("/patch-objects", response_model=list[PatchObjectReadResponse])
def list_patch_objects(
    blocks: list[str] = Query(default=[]),
    source_type: str | None = None,
    group_id: int | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
) -> list[PatchObjectReadResponse]:
    rows = list(db.scalars(select(PatchObject).order_by(PatchObject.id.desc())))
    filtered: list[PatchObject] = []
    selected_blocks = _validated_blocks(blocks) if blocks else []
    allowed_group_members = _group_member_patch_object_ids(db, group_id) if group_id is not None else None
    query_text = (q or "").strip().lower()
    for row in rows:
        if source_type is not None and row.source_type != source_type:
            continue
        if allowed_group_members is not None and row.id not in allowed_group_members:
            continue
        if selected_blocks and not all(block in row.patch_json for block in selected_blocks):
            continue
        if query_text:
            haystack = f"{row.name}\n{row.description or ''}".lower()
            if query_text not in haystack:
                continue
        filtered.append(row)
    rows = filtered
    groups_by_patch_object_id = _group_refs_by_patch_object_ids(db, [row.id for row in rows])
    return [_patch_object_response(db, row, groups=groups_by_patch_object_id.get(row.id, [])) for row in rows]


@router.post("/patch-objects", response_model=PatchObjectReadResponse)
def create_patch_object(payload: PatchObjectCreateRequest, db: Session = Depends(get_db)) -> PatchObjectReadResponse:
    _assert_patch_object_name_available(db, payload.name)
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
    return _patch_object_response(db, row)


@router.get("/patch-objects/{patch_object_id:int}", response_model=PatchObjectReadResponse)
def get_patch_object(patch_object_id: int, db: Session = Depends(get_db)) -> PatchObjectReadResponse:
    row = db.get(PatchObject, patch_object_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"message": "Patch object not found", "patch_object_id": patch_object_id})
    return _patch_object_response(db, row)


@router.post("/patch-objects/{patch_object_id:int}/duplicate", response_model=PatchObjectReadResponse)
def duplicate_patch_object(
    patch_object_id: int,
    payload: PatchObjectDuplicateRequest,
    db: Session = Depends(get_db),
) -> PatchObjectReadResponse:
    row = db.get(PatchObject, patch_object_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"message": "Patch object not found", "patch_object_id": patch_object_id})
    _assert_patch_object_name_available(db, payload.name)
    duplicate = PatchObject(
        name=payload.name,
        description=row.description,
        patch_json=row.patch_json,
        source_type=row.source_type,
        source_prompt=row.source_prompt,
        parent_patch_object_id=row.id,
    )
    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)
    return _patch_object_response(db, duplicate)


@router.post("/patch-objects/save-from-live", response_model=PatchObjectReadResponse)
async def save_patch_object_from_live(
    payload: SaveFromLiveRequest,
    db: Session = Depends(get_db),
    client: AmpClient = Depends(get_amp_client),
) -> PatchObjectReadResponse:
    _assert_patch_object_name_available(db, payload.name)
    blocks = _validated_blocks(payload.blocks)
    live_row = await _resolve_live_patch_row(db, client)
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
    return _patch_object_response(db, row)


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


@router.delete("/groups/{group_id:int}/patch-objects/{patch_object_id:int}")
def remove_patch_object_from_group(group_id: int, patch_object_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    membership = db.scalar(
        select(PatchObjectGroupMember).where(
            PatchObjectGroupMember.group_id == group_id,
            PatchObjectGroupMember.patch_object_id == patch_object_id,
        )
    )
    if membership is None:
        raise HTTPException(
            status_code=404,
            detail={"message": "Patch object group membership not found", "group_id": group_id, "patch_object_id": patch_object_id},
        )
    db.delete(membership)
    db.commit()
    return {"ok": True}


@router.get("/sets", response_model=list[PatchObjectSetReadResponse])
def list_patch_object_sets(db: Session = Depends(get_db)) -> list[PatchObjectSetReadResponse]:
    rows = list(db.scalars(select(PatchObjectSet).order_by(PatchObjectSet.id.desc())))
    return [_patch_object_set_response(db, row) for row in rows]


@router.post("/sets", response_model=PatchObjectSetReadResponse)
def create_patch_object_set(payload: PatchObjectSetCreateRequest, db: Session = Depends(get_db)) -> PatchObjectSetReadResponse:
    row = _create_patch_object_set(
        db=db,
        name=payload.name,
        description=payload.description,
        source_prompt=payload.source_prompt,
        slot_items=[{"slot": item.slot, "patch_object_id": item.patch_object_id} for item in payload.slots],
    )
    return _patch_object_set_response(db, row)


@router.get("/sets/{patch_object_set_id:int}", response_model=PatchObjectSetReadResponse)
def get_patch_object_set(patch_object_set_id: int, db: Session = Depends(get_db)) -> PatchObjectSetReadResponse:
    row = db.get(PatchObjectSet, patch_object_set_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"message": "Patch object set not found", "patch_object_set_id": patch_object_set_id})
    return _patch_object_set_response(db, row)


@router.put("/sets/{patch_object_set_id:int}/slots/{slot:int}", response_model=PatchObjectSetReadResponse)
def update_patch_object_set_slot(
    patch_object_set_id: int,
    slot: int,
    payload: ApplyPatchObjectRequest,
    db: Session = Depends(get_db),
) -> PatchObjectSetReadResponse:
    row = db.get(PatchObjectSet, patch_object_set_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"message": "Patch object set not found", "patch_object_set_id": patch_object_set_id})
    if slot < 1 or slot > 8:
        raise HTTPException(status_code=400, detail={"message": "Set slots must be 1..8", "slot": slot})
    patch_object = db.get(PatchObject, payload.patch_object_id)
    if patch_object is None:
        raise HTTPException(status_code=404, detail={"message": "Patch object not found", "patch_object_id": payload.patch_object_id})
    existing = db.scalar(
        select(PatchObjectSetSlot).where(
            PatchObjectSetSlot.patch_object_set_id == patch_object_set_id,
            PatchObjectSetSlot.slot == slot,
        )
    )
    if existing is None:
        existing = PatchObjectSetSlot(patch_object_set_id=patch_object_set_id, slot=slot, patch_object_id=patch_object.id)
        db.add(existing)
    else:
        existing.patch_object_id = patch_object.id
    db.commit()
    db.refresh(row)
    return _patch_object_set_response(db, row)


@router.post("/sets/{patch_object_set_id:int}/program-amp", response_model=ProgramPatchObjectSetResponse)
async def program_patch_object_set_to_amp(
    patch_object_set_id: int,
    payload: ProgramPatchObjectSetRequest,
    db: Session = Depends(get_db),
    client: AmpClient = Depends(get_amp_client),
) -> ProgramPatchObjectSetResponse:
    row = db.get(PatchObjectSet, patch_object_set_id)
    if row is None:
        raise HTTPException(status_code=404, detail={"message": "Patch object set not found", "patch_object_set_id": patch_object_set_id})
    slots = _load_patch_object_set_slots(db, row.id)
    if not slots:
        raise HTTPException(status_code=400, detail={"message": "Patch object set has no slots", "patch_object_set_id": row.id})
    max_slot = payload.start_slot + len(slots) - 1
    if max_slot > 8:
        raise HTTPException(
            status_code=400,
            detail={"message": "Patch object set does not fit starting at this slot", "start_slot": payload.start_slot, "count": len(slots)},
        )
    live_row = await _resolve_live_patch_row(db, client)
    programmed: list[ProgrammedSlotResponse] = []
    for index, slot_item in enumerate(slots):
        target_slot = payload.start_slot + index
        patch_object = db.get(PatchObject, slot_item.patch_object_id)
        if patch_object is None:
            raise HTTPException(status_code=404, detail={"message": "Patch object not found", "patch_object_id": slot_item.patch_object_id})
        rendered = merge_patch_object_into_full_patch(live_row.patch_json, patch_object.patch_json)
        rendered["patch_name"] = patch_object.name[:16]
        job = await amp_job_queue.enqueue_slot_write(slot=target_slot, patch=rendered)
        settled = await _await_terminal_job(job.job_id, timeout_seconds=120.0)
        if settled.status != "succeeded" or settled.result_slot is None:
            raise HTTPException(
                status_code=502,
                detail={
                    "message": "Failed to program patch object set slot",
                    "set_id": row.id,
                    "target_slot": target_slot,
                    "error": settled.error,
                },
            )
        result_slot = settled.result_slot
        upsert_amp_slot_snapshot(
            db,
            slot=target_slot,
            patch_name=result_slot.patch_name,
            full_patch=result_slot.payload or rendered,
            amp_confirmed_at=result_slot.synced_at,
        )
        programmed.append(
            ProgrammedSlotResponse(
                slot=target_slot,
                slot_label=slot_label(target_slot),
                patch_object_id=patch_object.id,
                patch_object_name=patch_object.name,
                synced_at=result_slot.synced_at,
            )
    )
    return ProgramPatchObjectSetResponse(set_id=row.id, set_name=row.name, programmed_slots=programmed)


@router.post("/sets/{patch_object_set_id:int}/apply", response_model=ProgramPatchObjectSetResponse)
async def apply_patch_object_set_to_amp(
    patch_object_set_id: int,
    payload: ProgramPatchObjectSetRequest,
    db: Session = Depends(get_db),
    client: AmpClient = Depends(get_amp_client),
) -> ProgramPatchObjectSetResponse:
    return await program_patch_object_set_to_amp(
        patch_object_set_id=patch_object_set_id,
        payload=payload,
        db=db,
        client=client,
    )


@router.post("/sets/ai-generate", response_model=AiGeneratePatchObjectSetResponse)
async def ai_generate_patch_object_set(
    payload: AiGeneratePatchObjectSetRequest,
    db: Session = Depends(get_db),
    client: AmpClient = Depends(get_amp_client),
    settings: Settings = Depends(get_settings),
) -> AiGeneratePatchObjectSetResponse:
    blocks = _validated_blocks(payload.blocks)
    live_row = await _resolve_live_patch_row(db, client)
    result = await asyncio.to_thread(_call_openai_patch_set_designer, settings, live_row.patch_json, payload, blocks)

    slot_items: list[dict[str, int]] = []
    for index, candidate in enumerate(result["candidates"], start=1):
        normalized = _validated_ai_candidate_patch_json(candidate.patch_json, blocks)
        patch_object_name = _make_unique_patch_object_name(db, f"{payload.set_name} {index}: {candidate.name}")
        row = PatchObject(
            name=patch_object_name,
            description=candidate.description,
            patch_json=normalized,
            source_type="ai",
            source_prompt=payload.prompt,
        )
        db.add(row)
        db.flush()
        slot_items.append({"slot": index, "patch_object_id": row.id})

    patch_object_set = _create_patch_object_set(
        db=db,
        name=payload.set_name,
        description=payload.description,
        source_prompt=payload.prompt,
        slot_items=slot_items,
        commit=False,
    )
    db.commit()
    db.refresh(patch_object_set)
    return AiGeneratePatchObjectSetResponse(summary=str(result["summary"]), set=_patch_object_set_response(db, patch_object_set))


@router.post("/ai/generate/patch-objects", response_model=list[PatchObjectReadResponse])
async def ai_generate_patch_objects(
    payload: AiGeneratePatchObjectsRequest,
    db: Session = Depends(get_db),
    client: AmpClient = Depends(get_amp_client),
    settings: Settings = Depends(get_settings),
) -> list[PatchObjectReadResponse]:
    blocks = _validated_blocks(payload.preferred_blocks) if payload.preferred_blocks else ["amp", "booster", "eq1"]
    if payload.reference_patch_object_id is not None:
        reference_patch_object = db.get(PatchObject, payload.reference_patch_object_id)
        if reference_patch_object is None:
            raise HTTPException(
                status_code=404,
                detail={"message": "Reference patch object not found", "patch_object_id": payload.reference_patch_object_id},
            )
        context_patch = merge_patch_object_into_full_patch({}, reference_patch_object.patch_json)
    elif payload.use_live_patch_as_context:
        context_patch = (await _resolve_live_patch_row(db, client)).patch_json
    else:
        context_patch = {}

    result = await asyncio.to_thread(
        _call_openai_patch_objects_designer,
        settings,
        context_patch,
        payload.prompt,
        payload.count,
        blocks,
    )
    created: list[PatchObjectReadResponse] = []
    for index, candidate in enumerate(result["candidates"], start=1):
        normalized = _validated_ai_candidate_patch_json(candidate.patch_json, blocks)
        base_name = f"{payload.name_prefix.strip()} {index}: {candidate.name}" if payload.name_prefix else candidate.name
        row = PatchObject(
            name=_make_unique_patch_object_name(db, base_name),
            description=candidate.description,
            patch_json=normalized,
            source_type="ai",
            source_prompt=payload.prompt,
            parent_patch_object_id=payload.reference_patch_object_id,
        )
        db.add(row)
        db.flush()
        created.append(_patch_object_response(db, row))
    db.commit()
    return created


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
    live_row = await _resolve_live_patch_row(db, client)
    merged = merge_patch_object_into_full_patch(live_row.patch_json, patch_object.patch_json)
    merged["patch_name"] = patch_object.name[:16]
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


@router.patch("/live-patch/blocks/{block_name}", response_model=LivePatchReadResponse)
async def patch_live_patch_block(
    block_name: str,
    payload: PatchLiveBlockRequest,
    db: Session = Depends(get_db),
    client: AmpClient = Depends(get_amp_client),
) -> LivePatchReadResponse:
    if block_name not in ALLOWED_BLOCKS:
        raise HTTPException(status_code=400, detail={"message": "Unknown block", "block": block_name})
    live_row = await _resolve_live_patch_row(db, client)
    sparse_patch_object = normalize_patch_object({block_name: payload.patch_block})
    if block_name not in sparse_patch_object:
        raise HTTPException(status_code=400, detail={"message": "Block payload did not normalize to a valid patch block", "block": block_name})
    merged = merge_patch_object_into_full_patch(live_row.patch_json, sparse_patch_object)
    applied = await _queued_apply_current_patch(merged)
    applied_at = datetime.now().isoformat(timespec="seconds")
    row = upsert_live_patch_state(
        db,
        full_patch=applied,
        active_slot=live_row.active_slot,
        amp_confirmed_at=applied_at,
        source_type="manual_apply",
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


def _patch_object_response(
    db: Session,
    row: PatchObject,
    *,
    groups: list[PatchObjectGroupRefResponse] | None = None,
) -> PatchObjectReadResponse:
    return PatchObjectReadResponse(
        id=row.id,
        name=row.name,
        description=row.description,
        patch_json=row.patch_json,
        source_type=row.source_type,
        source_prompt=row.source_prompt,
        parent_patch_object_id=row.parent_patch_object_id,
        blocks=patch_object_block_names(row.patch_json),
        groups=groups if groups is not None else _group_refs_by_patch_object_ids(db, [row.id]).get(row.id, []),
        created_at=row.created_at.isoformat(timespec="seconds"),
        updated_at=row.updated_at.isoformat(timespec="seconds"),
    )


def _patch_object_set_response(db: Session, row: PatchObjectSet) -> PatchObjectSetReadResponse:
    slots = _load_patch_object_set_slots(db, row.id)
    patch_object_ids = [item.patch_object_id for item in slots]
    patch_objects = {
        item.id: item
        for item in db.scalars(select(PatchObject).where(PatchObject.id.in_(patch_object_ids))).all()
    } if patch_object_ids else {}
    return PatchObjectSetReadResponse(
        id=row.id,
        name=row.name,
        description=row.description,
        source_prompt=row.source_prompt,
        slots=[
            PatchObjectSetSlotReadResponse(
                slot=item.slot,
                patch_object_id=item.patch_object_id,
                patch_object_name=patch_objects[item.patch_object_id].name,
                blocks=patch_object_block_names(patch_objects[item.patch_object_id].patch_json),
            )
            for item in slots
            if item.patch_object_id in patch_objects
        ],
        created_at=row.created_at.isoformat(timespec="seconds"),
        updated_at=row.updated_at.isoformat(timespec="seconds"),
    )


def _load_patch_object_set_slots(db: Session, patch_object_set_id: int) -> list[PatchObjectSetSlot]:
    return list(
        db.scalars(
            select(PatchObjectSetSlot)
            .where(PatchObjectSetSlot.patch_object_set_id == patch_object_set_id)
            .order_by(PatchObjectSetSlot.slot.asc())
        )
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


def _group_member_patch_object_ids(db: Session, group_id: int | None) -> set[int] | None:
    if group_id is None:
        return None
    if db.get(PatchObjectGroup, group_id) is None:
        raise HTTPException(status_code=404, detail={"message": "Group not found", "group_id": group_id})
    rows = db.scalars(select(PatchObjectGroupMember.patch_object_id).where(PatchObjectGroupMember.group_id == group_id)).all()
    return {int(item) for item in rows}


def _group_refs_by_patch_object_ids(db: Session, patch_object_ids: list[int]) -> dict[int, list[PatchObjectGroupRefResponse]]:
    if not patch_object_ids:
        return {}
    memberships = list(
        db.execute(
            select(PatchObjectGroupMember.patch_object_id, PatchObjectGroup.id, PatchObjectGroup.name)
            .join(PatchObjectGroup, PatchObjectGroup.id == PatchObjectGroupMember.group_id)
            .where(PatchObjectGroupMember.patch_object_id.in_(patch_object_ids))
            .order_by(PatchObjectGroup.name.asc())
        )
    )
    grouped: dict[int, list[PatchObjectGroupRefResponse]] = {patch_object_id: [] for patch_object_id in patch_object_ids}
    for patch_object_id, group_id, group_name in memberships:
        grouped.setdefault(int(patch_object_id), []).append(PatchObjectGroupRefResponse(id=int(group_id), name=str(group_name)))
    return grouped


def _assert_patch_object_name_available(db: Session, name: str) -> None:
    existing = db.scalar(select(PatchObject).where(PatchObject.name == name))
    if existing is not None:
        raise HTTPException(status_code=409, detail={"message": "Patch object already exists", "name": name})


def _make_unique_patch_object_name(db: Session, base_name: str) -> str:
    trimmed = base_name.strip()[:255] or "Patch Object"
    candidate = trimmed
    suffix = 2
    while db.scalar(select(PatchObject).where(PatchObject.name == candidate)) is not None:
        trailer = f" ({suffix})"
        candidate = f"{trimmed[: max(1, 255 - len(trailer))]}{trailer}"
        suffix += 1
    return candidate


def _create_patch_object_set(
    *,
    db: Session,
    name: str,
    description: str,
    source_prompt: str | None,
    slot_items: list[dict[str, int]],
    commit: bool = True,
) -> PatchObjectSet:
    existing = db.scalar(select(PatchObjectSet).where(PatchObjectSet.name == name))
    if existing is not None:
        raise HTTPException(status_code=409, detail={"message": "Patch object set already exists", "name": name})
    seen_slots: set[int] = set()
    for item in slot_items:
        slot = int(item["slot"])
        patch_object_id = int(item["patch_object_id"])
        if slot in seen_slots:
            raise HTTPException(status_code=400, detail={"message": "Duplicate set slot", "slot": slot})
        seen_slots.add(slot)
        if slot < 1 or slot > 8:
            raise HTTPException(status_code=400, detail={"message": "Set slots must be 1..8", "slot": slot})
        if db.get(PatchObject, patch_object_id) is None:
            raise HTTPException(status_code=404, detail={"message": "Patch object not found", "patch_object_id": patch_object_id})
    row = PatchObjectSet(name=name, description=description, source_prompt=source_prompt)
    db.add(row)
    db.flush()
    for item in slot_items:
        db.add(
            PatchObjectSetSlot(
                patch_object_set_id=row.id,
                slot=int(item["slot"]),
                patch_object_id=int(item["patch_object_id"]),
            )
        )
    if commit:
        db.commit()
        db.refresh(row)
    return row


def _validated_ai_candidate_patch_json(patch_json: dict[str, Any], selected_blocks: list[str]) -> dict[str, Any]:
    if not isinstance(patch_json, dict):
        raise HTTPException(status_code=502, detail={"message": "AI returned invalid patch_json", "patch_json": patch_json})
    cleaned = _strip_nulls(patch_json)
    for key in cleaned.keys():
        if key not in selected_blocks:
            raise HTTPException(status_code=502, detail={"message": "AI returned block outside requested scope", "block": key})
    normalized = normalize_patch_object(cleaned)
    if not normalized:
        raise HTTPException(status_code=502, detail={"message": "AI returned empty sparse patch object", "patch_json": cleaned})
    return normalized


def _build_ai_patch_object_list_schema(count: int, blocks: list[str]) -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["summary", "candidates"],
        "properties": {
            "summary": {"type": "string"},
            "candidates": {
                "type": "array",
                "minItems": count,
                "maxItems": count,
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["name", "description", "patch_json"],
                    "properties": {
                        "name": {"type": "string"},
                        "description": {"type": "string"},
                        "patch_json": _build_ai_patch_json_schema(blocks),
                    },
                },
            },
        },
    }


def _build_ai_patch_json_schema(blocks: list[str]) -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": blocks,
        "properties": {block: _build_ai_block_schema(block) for block in blocks},
    }


def _build_ai_block_schema(block_name: str) -> dict[str, Any]:
    if block_name not in ALLOWED_BLOCKS:
        raise ValueError(f"Unsupported AI schema block: {block_name}")

    if block_name == "routing":
        return _object_schema(
            chain_pattern=JSON_INTEGER_SCHEMA,
            cabinet_resonance=JSON_INTEGER_SCHEMA,
            master_key=JSON_INTEGER_SCHEMA,
        )

    if block_name == "amp":
        return _object_schema(
            raw=JSON_INT_ARRAY_SCHEMA,
            gain=JSON_INTEGER_SCHEMA,
            volume=JSON_INTEGER_SCHEMA,
            bass=JSON_INTEGER_SCHEMA,
            middle=JSON_INTEGER_SCHEMA,
            treble=JSON_INTEGER_SCHEMA,
            presence=JSON_INTEGER_SCHEMA,
            poweramp_variation=JSON_INTEGER_SCHEMA,
            amp_type=JSON_INTEGER_SCHEMA,
            resonance=JSON_INTEGER_SCHEMA,
            preamp_variation=JSON_INTEGER_SCHEMA,
        )

    if block_name in {"booster", "mod", "fx", "delay", "reverb"}:
        properties: dict[str, Any] = {
            "color_index": JSON_INTEGER_SCHEMA,
            "on": JSON_BOOLEAN_SCHEMA,
            "raw": JSON_INT_ARRAY_SCHEMA,
            "type": JSON_INTEGER_SCHEMA,
        }
        if block_name == "booster":
            properties.update(
                drive=JSON_INTEGER_SCHEMA,
                bottom=JSON_INTEGER_SCHEMA,
                tone=JSON_INTEGER_SCHEMA,
                solo_level=JSON_INTEGER_SCHEMA,
                effect_level=JSON_INTEGER_SCHEMA,
                direct_mix=JSON_INTEGER_SCHEMA,
            )
        elif block_name == "delay":
            properties.update(
                delay2_on=JSON_BOOLEAN_SCHEMA,
                delay2_raw=JSON_INT_ARRAY_SCHEMA,
                time_raw=JSON_INT_ARRAY_SCHEMA,
                feedback=JSON_INTEGER_SCHEMA,
                high_cut=JSON_INTEGER_SCHEMA,
                effect_level=JSON_INTEGER_SCHEMA,
                direct_level=JSON_INTEGER_SCHEMA,
            )
        elif block_name == "reverb":
            properties.update(
                layer_mode=JSON_INTEGER_SCHEMA,
                time=JSON_INTEGER_SCHEMA,
                pre_delay=JSON_INTEGER_SCHEMA,
                low_cut=JSON_INTEGER_SCHEMA,
                high_cut=JSON_INTEGER_SCHEMA,
                effect_level=JSON_INTEGER_SCHEMA,
                direct_level=JSON_INTEGER_SCHEMA,
            )
        return _object_schema(**properties)

    if block_name in {"eq1", "eq2"}:
        return _object_schema(
            position=JSON_INTEGER_SCHEMA,
            on=JSON_BOOLEAN_SCHEMA,
            type=JSON_INTEGER_SCHEMA,
            peq_raw=JSON_INT_ARRAY_SCHEMA,
            ge10_raw=JSON_INT_ARRAY_SCHEMA,
        )

    if block_name in {"ns", "send_return", "solo"}:
        return _object_schema(
            on=JSON_BOOLEAN_SCHEMA,
            raw=JSON_INT_ARRAY_SCHEMA,
            threshold=JSON_INTEGER_SCHEMA,
            release=JSON_INTEGER_SCHEMA,
            position=JSON_INTEGER_SCHEMA,
            mode=JSON_INTEGER_SCHEMA,
            send_level=JSON_INTEGER_SCHEMA,
            return_level=JSON_INTEGER_SCHEMA,
            effect_level=JSON_INTEGER_SCHEMA,
        )

    if block_name == "pedalfx":
        return _object_schema(
            raw_com=JSON_INT_ARRAY_SCHEMA,
            raw=JSON_INT_ARRAY_SCHEMA,
            position=JSON_INTEGER_SCHEMA,
            on=JSON_BOOLEAN_SCHEMA,
            type=JSON_INTEGER_SCHEMA,
        )

    raise ValueError(f"Unhandled AI schema block: {block_name}")


def _object_schema(**properties: Any) -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": list(properties.keys()),
        "properties": {key: _nullable_schema(value) for key, value in properties.items()},
    }


def _nullable_schema(schema: dict[str, Any]) -> dict[str, Any]:
    return {"anyOf": [schema, JSON_NULL_SCHEMA]}


def _strip_nulls(value: Any) -> Any:
    if isinstance(value, dict):
        cleaned: dict[str, Any] = {}
        for key, item in value.items():
            pruned = _strip_nulls(item)
            if pruned is None:
                continue
            if isinstance(pruned, dict) and not pruned:
                continue
            cleaned[key] = pruned
        return cleaned
    if isinstance(value, list):
        return [_strip_nulls(item) for item in value]
    return value


def _call_openai_sparse_patch_candidates(
    *,
    settings: Settings,
    live_patch: dict[str, Any],
    prompt: str,
    count: int,
    blocks: list[str],
    mode: str,
) -> dict[str, Any]:
    user_payload = {
        "mode": mode,
        "prompt": prompt,
        "count": count,
        "blocks": blocks,
        "live_patch_reference_blocks": extract_patch_object(live_patch, blocks),
        "live_patch_patch_name": str(live_patch.get("patch_name", "")),
    }
    body = {
        "model": settings.openai_model,
        "input": [
            {"role": "system", "content": [{"type": "input_text", "text": AI_SET_SYSTEM_PROMPT}]},
            {"role": "user", "content": [{"type": "input_text", "text": json.dumps(user_payload, separators=(",", ":"))}]},
        ],
        "max_output_tokens": 6000,
        "reasoning": {"effort": "minimal"},
        "text": {
            "verbosity": "low",
            "format": {
                "type": "json_schema",
                "name": "katana_sparse_patch_candidates",
                "strict": True,
                "schema": _build_ai_patch_object_list_schema(count, blocks),
            },
        },
    }
    req = urllib_request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib_request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
    except urllib_error.HTTPError as exc:
        response_text = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(status_code=502, detail={"message": "OpenAI request failed", "status": exc.code, "response": response_text}) from exc
    except urllib_error.URLError as exc:
        raise HTTPException(status_code=502, detail={"message": "OpenAI network request failed", "error": str(exc)}) from exc

    response_payload = json.loads(raw)
    refusal_text = _extract_refusal_text(response_payload)
    if refusal_text is not None:
        raise HTTPException(status_code=502, detail={"message": "OpenAI refused generation request", "refusal": refusal_text})
    response_text = _extract_response_text(response_payload)
    try:
        generated = json.loads(response_text)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail={"message": "OpenAI returned non-JSON generation output", "output_text": response_text}) from exc
    candidates_payload = generated.get("candidates")
    if not isinstance(candidates_payload, list):
        raise HTTPException(status_code=502, detail={"message": "OpenAI returned invalid candidate payload", "payload": generated})
    try:
        candidates = [AiGeneratedCandidate.model_validate(item) for item in candidates_payload]
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail={"message": "OpenAI returned invalid candidate payload", "errors": exc.errors(), "payload": generated},
        ) from exc
    if len(candidates) != count:
        raise HTTPException(status_code=502, detail={"message": "OpenAI returned the wrong candidate count", "expected": count, "actual": len(candidates)})
    return {"summary": str(generated.get("summary", "")).strip(), "candidates": candidates}


def _call_openai_patch_set_designer(
    settings: Settings,
    live_patch: dict[str, Any],
    payload: AiGeneratePatchObjectSetRequest,
    blocks: list[str],
) -> dict[str, Any]:
    return _call_openai_sparse_patch_candidates(
        settings=settings,
        live_patch=live_patch,
        prompt=payload.prompt,
        count=payload.count,
        blocks=blocks,
        mode="set",
    )


def _call_openai_patch_objects_designer(
    settings: Settings,
    live_patch: dict[str, Any],
    prompt: str,
    count: int,
    blocks: list[str],
) -> dict[str, Any]:
    return _call_openai_sparse_patch_candidates(
        settings=settings,
        live_patch=live_patch,
        prompt=prompt,
        count=count,
        blocks=blocks,
        mode="patch_objects",
    )


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


async def _resolve_live_patch_row(db: Session, client: AmpClient) -> LivePatchState:
    live_row = db.get(LivePatchState, 1)
    if live_row is not None:
        return live_row
    synced_at = datetime.now().isoformat(timespec="seconds")
    patch = await _read_live_patch_from_amp(client)
    active = await client.read_active_slot()
    return upsert_live_patch_state(
        db,
        full_patch=patch,
        active_slot=active.slot,
        amp_confirmed_at=synced_at,
        source_type="amp_sync",
    )


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
