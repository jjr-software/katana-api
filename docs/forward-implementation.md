# Katana Forward Implementation

Date: 2026-03-26  
Status: Authoritative plan (single source)

## 1) Product Direction
Build a hash-first Katana patch platform where all state, reconciliation, and sync decisions are keyed by `config_hash_sha256` at patch level.

Primary outcomes:
- reliable queued amp operations,
- clear `actual` vs `desired` slot state,
- durable local patch library with audio/measurement linkage,
- patch-set workflows for fast live tone iteration.

## 2) Rules That Must Hold
1. All amp communications run through queue operations.
2. Full amp state load uses the BTS export flow (`preview mute` + `export`) before reading all slots.
3. Patch identity is hash-based; names are metadata only.
4. Editing a patch creates a new hash row; no in-place mutation of existing hash rows.
5. Sync correctness is hash-based (`actual_hash == desired_hash`), never name-based.

## 3) Current Delivery Status
## 3.1 Done
- Queue-backed amp routes and queue monitor UI.
- `Load Amp State` action (queued) wired to backend full-dump path.
- Backend full-dump path uses export command IDs from BTS backup flow.
- Per-slot full sync, save-to-library, raw JSON modal.
- Save path checks hash first and avoids duplicate writes.
- Audio sample capture API and persistence (`audio_samples`) with patch-hash linkage validation.
- Hash canonicalization fix so amp hash and saved hash align.
- `Sync Slots` UI retired in favor of full load path.
- Bootstrap 5 migration and responsive layout cleanup.
- Queue on LHS desktop, hidden on smaller screens.
- Desktop cards set to 4-wide.
- Slot action gating:
  - unsynced slots: only `Sync` usable,
  - `Sync` + `Save` disabled when slot already synced and saved.

## 3.2 Partially Done
- Patch set schema exists (`patch_sets`, `patch_set_members`) but not yet the full desired-slot reconciliation UX.
- Measurement/audio plumbing exists, but full patch-set RMS workflow is not yet first-class in web UI.

## 3.3 Not Done Yet
- Desired slot assignment model and reconcile endpoint/UI.
- Patch library browse/search/filter UX.
- Patch set composition + reorder + apply-to-amp end-to-end UX.
- Patch edit modal with explicit `Save to Library` and `Push to Amp`.
- Full pedal/type naming coverage across all stage types and values.
- Measurement run orchestration by patch set with history/result views.

## 4) Implementation Roadmap
## Phase A: Reconciliation Core (next)
Deliver:
- `patch_set_slot_assignments` table (`patch_set_id`, `slot`, `desired_hash`).
- Reconciliation API returning per-slot:
  - `actual_hash`, `desired_hash`, `in_sync`, `drifted`, `unsynced`, `saved`.
- UI slot chips for `In Sync` / `Drifted` / `Unsynced` / `No Desired`.

Exit criteria:
- selecting a patch set immediately shows drift per slot from latest loaded amp state.

## Phase B: Patch Library + Set Operations
Deliver:
- Library list/search/filter endpoints and web screens.
- Patch set editor UI (8-slot mapping, reorder/swap, assign by hash).
- Queued `Apply Desired Set` operation with per-slot hash verification.

Exit criteria:
- user can load set, apply set, and see post-apply reconciliation as green.

## Phase C: Edit + Live Push Workflow
Deliver:
- Patch edit modal from slot/library payload.
- Actions in modal:
  - `Save to Library` (new hash),
  - `Push to Amp` (queued),
  - optional `Save + Push`.
- Dirty-state guard to prevent silent loss while editing.

Exit criteria:
- editing flow supports immediate tone audition without generating uncontrolled duplicate junk records.

## Phase D: Measurement Runs (RMS/DBFS by Set)
Deliver:
- `measurement_runs` + `measurement_results` tables.
- Queued set-level measurement pipeline.
- Web results view: per-slot RMS/peak and deltas.

Exit criteria:
- user can run RMS analysis on a selected set and compare outcomes repeatably.

## 5) Data Model Work Items
Must add:
- `patch_set_slot_assignments`
- `amp_sync_snapshots`
- `amp_sync_snapshot_slots`
- `measurement_runs`
- `measurement_results`

Keep:
- `patch_configs` as immutable hash library nucleus.
- `audio_samples` as capture log with optional patch linkage.

`patch_set_slot_assignments` is a junction table between `patch_sets` and `patch_configs`, with slot position as part of the link:
- `patch_set_id` -> `patch_sets.id`
- `desired_hash` -> `patch_configs.hash_id`
- `slot` (1..8)
- unique `(patch_set_id, slot)`

## 6) API Work Items
Planned target surface:
- `POST /api/v1/amp/full-sync` (queued)
- `GET /api/v1/amp/full-sync/{job_id}`
- `GET /api/v1/reconcile?patch_set_id=...`
- `PUT /api/v1/patch-sets/{id}/slots/{slot}`
- `POST /api/v1/patches/edit`
- `POST /api/v1/measurements/rms` (queued)
- `GET /api/v1/measurements/{run_id}`

## 7) Immediate Next Sprint (ordered)
1. Add `patch_set_slot_assignments` migration + model.
2. Add reconcile service + API endpoint.
3. Add desired-hash slot chips in web cards.
4. Add minimal patch library list endpoint/UI (hash + patch name + created date).
5. Add patch-set slot assignment API + basic web editor.

## 8) Explicitly Out
- Name-based matching logic as source-of-truth.
- Silent fallback paths when queue/hardware steps fail.
- In-place mutation of existing hash patch rows.
