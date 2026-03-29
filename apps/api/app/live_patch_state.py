from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AmpSlotSnapshot, LivePatchState, PatchObject
from app.patch_objects import (
    extract_patch_object,
    patch_object_exact_hash,
    patch_object_hash_for_full_snapshot_compat,
    patch_object_partially_matches_full_patch,
)


def find_matching_patch_objects(db: Session, full_patch: dict[str, Any]) -> tuple[PatchObject | None, list[PatchObject]]:
    rows = list(db.scalars(select(PatchObject).order_by(PatchObject.id.desc())))
    live_sparse = extract_patch_object(full_patch)
    live_exact_hash = patch_object_exact_hash(live_sparse)

    exact: PatchObject | None = None
    partial: list[PatchObject] = []
    for row in rows:
        row_hash = patch_object_exact_hash(row.patch_json)
        if row_hash == live_exact_hash:
            exact = row
            continue
        if patch_object_partially_matches_full_patch(row.patch_json, full_patch):
            partial.append(row)
    return exact, partial


def upsert_live_patch_state(
    db: Session,
    *,
    full_patch: dict[str, Any],
    active_slot: int | None,
    amp_confirmed_at: str,
    source_type: str,
) -> LivePatchState:
    exact, _ = find_matching_patch_objects(db, full_patch)
    row = db.get(LivePatchState, 1)
    if row is None:
        row = LivePatchState(
            id=1,
            patch_json=full_patch,
            active_slot=active_slot,
            amp_confirmed_at=amp_confirmed_at,
            source_type=source_type,
            last_known_exact_patch_object_id=exact.id if exact is not None else None,
            last_known_exact_slot=active_slot,
        )
        db.add(row)
    else:
        row.patch_json = full_patch
        row.active_slot = active_slot
        row.amp_confirmed_at = amp_confirmed_at
        row.source_type = source_type
        row.last_known_exact_patch_object_id = exact.id if exact is not None else None
        row.last_known_exact_slot = active_slot
    db.commit()
    db.refresh(row)
    return row


def upsert_amp_slot_snapshot(
    db: Session,
    *,
    slot: int,
    patch_name: str,
    full_patch: dict[str, Any],
    amp_confirmed_at: str,
) -> AmpSlotSnapshot:
    exact, _ = find_matching_patch_objects(db, full_patch)
    row = db.get(AmpSlotSnapshot, slot)
    if row is None:
        row = AmpSlotSnapshot(
            slot=slot,
            patch_name=patch_name,
            patch_json=full_patch,
            amp_confirmed_at=amp_confirmed_at,
            exact_patch_object_id=exact.id if exact is not None else None,
        )
        db.add(row)
    else:
        row.patch_name = patch_name
        row.patch_json = full_patch
        row.amp_confirmed_at = amp_confirmed_at
        row.exact_patch_object_id = exact.id if exact is not None else None
    db.commit()
    db.refresh(row)
    return row


def live_patch_status_payload(db: Session, row: LivePatchState) -> dict[str, Any]:
    exact, partial = find_matching_patch_objects(db, row.patch_json)
    slot_rows = list(db.scalars(select(AmpSlotSnapshot).order_by(AmpSlotSnapshot.slot.asc())))

    exact_slot: AmpSlotSnapshot | None = None
    partial_slots: list[AmpSlotSnapshot] = []
    live_sparse = extract_patch_object(row.patch_json)
    live_exact_hash = patch_object_exact_hash(live_sparse)
    for slot_row in slot_rows:
        slot_sparse = extract_patch_object(slot_row.patch_json)
        slot_hash = patch_object_exact_hash(slot_sparse)
        if slot_hash == live_exact_hash:
            exact_slot = slot_row
            continue
        if patch_object_partially_matches_full_patch(live_sparse, slot_row.patch_json):
            partial_slots.append(slot_row)

    return {
        "patch_json": row.patch_json,
        "active_slot": row.active_slot,
        "amp_confirmed_at": row.amp_confirmed_at,
        "source_type": row.source_type,
        "exact_patch_object": None if exact is None else {"id": exact.id, "name": exact.name},
        "partial_patch_objects": [{"id": item.id, "name": item.name} for item in partial[:20]],
        "exact_amp_slot": None if exact_slot is None else {"slot": exact_slot.slot, "patch_name": exact_slot.patch_name},
        "partial_amp_slots": [{"slot": item.slot, "patch_name": item.patch_name} for item in partial_slots[:8]],
        "compat_hash_sha256": patch_object_hash_for_full_snapshot_compat(live_sparse),
    }
