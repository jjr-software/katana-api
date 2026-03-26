# Hash-First Patch Platform Design

Date: 2026-03-26  
Status: Draft (implementation contract)

## 1. Purpose
Define a single source-of-truth design for Katana patch management where all core operations are keyed by patch content hash (`config_hash_sha256`), not patch names.

This doc captures:
- full amp sync behavior,
- reconciliation rules (`actual` vs `desired`),
- patch library and patch-set workflows,
- patch editing semantics,
- RMS/DBFS measurement workflows.

## 2. Core Principle
All durable identity is hash-based.

- Patch identity: `patch_hash = SHA256(normalized_patch_payload)`
- Slot identity at time T: hash present in amp slot payload.
- Desired slot state: hash assignment from selected patch set.
- Reconciliation: compare hashes only.

Patch names are metadata only and never authoritative for matching.

## 3. Required Invariants
1. Every full amp sync returns all 8 slots with full payload and per-slot hash.
2. Every slot returned from sync has a deterministic `config_hash_sha256`.
3. Patch library rows are immutable by hash.
4. Editing a patch creates a new hash (new library row), never mutates an existing hash row.
5. Slot sync success criteria is hash-based verification after write/apply.
6. UI sync state is derived from hash comparison, not string name comparison.
7. Full sync snapshots are timestamped and retained as history.

## 4. Terminology
- `actual_hash`: current hash read from amp slot.
- `desired_hash`: target hash assigned by selected patch set.
- `in_sync`: `actual_hash == desired_hash`.
- `saved`: hash exists in local patch library.
- `drifted`: `actual_hash != desired_hash` while desired exists.
- `unsynced`: no recent actual slot read for current view/snapshot.

## 5. Data Model (Hash-Centric)
## 5.1 Existing
- `patch_configs(hash_id PK, snapshot, created_at)` (library nucleus)
- `patch_sets`
- `patch_set_members` (membership by hash)
- `amp_sync_history` (job-level sync history)

## 5.2 Additions
1. `amp_sync_snapshots`
- `id PK`
- `job_id UNIQUE`
- `synced_at`
- `amp_state_hash_sha256`
- `source_operation` (`full_dump`, `full_sync_slots`, etc.)
- `created_at`

2. `amp_sync_snapshot_slots`
- `id PK`
- `snapshot_id FK -> amp_sync_snapshots`
- `slot` (1..8)
- `slot_label` (`A:1`..`B:4`)
- `patch_hash` (nullable if read failed)
- `patch_name`
- `payload_json` (full patch payload)
- `slot_sync_ms`
- unique `(snapshot_id, slot)`

3. `patch_set_slot_assignments`
- `id PK`
- `patch_set_id FK`
- `slot` (1..8)
- `desired_hash FK -> patch_configs.hash_id`
- `updated_at`
- unique `(patch_set_id, slot)`

4. `patch_audio_recordings`
- `id PK`
- `storage_uri/path`
- `captured_at`
- `duration_ms`
- `sample_rate`
- `channels`
- metadata json

5. `patch_recording_links`
- `id PK`
- `patch_hash FK -> patch_configs.hash_id`
- `recording_id FK -> patch_audio_recordings.id`
- optional `slot`, optional `patch_set_id`

6. `measurement_runs`
- `id PK`
- `run_type` (`set_rms_dbfs`, `set_ab`, etc.)
- `patch_set_id FK`
- `started_at`, `finished_at`
- config json (window size, source, settle timing, etc.)
- status/error

7. `measurement_results`
- `id PK`
- `run_id FK -> measurement_runs`
- `slot`
- `patch_hash`
- numeric metrics (`rms_dbfs`, `peak_dbfs`, `crest_db`, etc.)
- analysis json

## 6. Sync and Reconciliation Flows
## 6.1 Full Amp Sync
1. Queue operation starts.
2. Execute export command flow (`CMDID_PREVIEW_MUTE`, `CMDID_EXPORT`) and read all 8 slot payloads.
3. Compute hash per slot from normalized payload.
4. Upsert hash into `patch_configs` if unknown.
5. Persist one `amp_sync_snapshots` row + 8 `amp_sync_snapshot_slots` rows.
6. Return snapshot + slot data to UI.

## 6.2 Per-Slot Sync
1. Queue operation reads one slot full payload.
2. Compute slot hash.
3. Upsert hash in library if unknown.
4. Persist a minimal snapshot record or slot-event record (implementation choice; must remain timestamped).
5. Return slot payload + hash.

## 6.3 Reconciliation
Given:
- selected patch set,
- latest actual slot hashes (from latest full snapshot or explicit refresh),

for each slot:
- `desired_hash` from `patch_set_slot_assignments`
- `actual_hash` from latest snapshot slot
- derive status:
  - `in_sync`: both exist and equal
  - `drifted`: both exist and differ
  - `missing_desired`: no desired assignment
  - `unsynced`: no actual hash yet
- derive `saved` from existence in `patch_configs` for `actual_hash`.

## 7. UI State Contract
Each slot card displays:
- slot label
- patch name (actual payload name)
- `actual_hash` (shortened)
- `desired_hash` (shortened)
- status chips:
  - sync chip (`In Sync`, `Drifted`, `Unsynced`, `No Desired`)
  - library chip (`Saved`, `Not Saved`)
- concise amp/stage summary fields
- actions:
  - `Sync Slot` (full slot read)
  - `Raw` (modal pretty JSON)
  - future: `Apply Desired To Slot`

Global header displays:
- active patch set
- latest full snapshot timestamp/hash
- queue status

## 8. Patch Library and Set Workflows
## 8.1 Library
- Add/import patch by payload -> hash calculated -> stored once.
- Duplicate content is deduplicated naturally by hash.
- Metadata/tag tables can be many-to-many and mutable without changing patch hash.

## 8.2 Patch Set
- A set is an 8-slot mapping of `slot -> desired_hash`.
- Swap in/out means changing desired assignment rows, not modifying patch rows.
- “Sync set to amp” writes desired hashes slot-by-slot and verifies readback hash.

## 9. Patch Editing Model
Editing creates a new patch:
1. Load source payload.
2. Apply edits.
3. Recompute hash.
4. Insert as new `patch_configs` row if not present.
5. Optionally update patch-set slot assignment to new hash.

No in-place mutation of existing hash rows.

## 10. RMS/DBFS on Patch Set
Goal: fast, repeatable loudness/analysis per set.

Workflow:
1. Create `measurement_run` linked to patch set.
2. Iterate assigned slots in deterministic order.
3. Apply/switch slot as needed, settle, capture audio window(s).
4. Compute metrics (RMS dBFS mandatory; optional peak/crest/spectral).
5. Store one `measurement_results` row per slot keyed by `patch_hash`.
6. UI shows per-slot metrics and set-level deltas.

## 11. API Surface (Target)
- `POST /api/v1/amp/full-sync` (queued)
- `GET /api/v1/amp/full-sync/{job_id}`
- `GET /api/v1/amp/snapshots?limit=...`
- `GET /api/v1/amp/snapshots/{id}`
- `GET /api/v1/reconcile?patch_set_id=...`
- `PUT /api/v1/patch-sets/{id}/slots/{slot}` (assign desired hash)
- `POST /api/v1/patches/edit` (create new hash from edits)
- `POST /api/v1/measurements/rms` (queued run for set)
- `GET /api/v1/measurements/{run_id}`

## 12. Implementation Phases
Phase 1:
- snapshot tables + write path from full sync
- reconciliation endpoint
- slot card actual/desired hash state

Phase 2:
- patch-set slot assignment UI
- apply desired set -> amp with hash verification

Phase 3:
- patch editor (new-hash creation flow)
- measurement run pipeline + results UI

## 13. Non-Goals (For Now)
- name-based auto-merge semantics,
- mutable-in-place patch records,
- silent fallback when hash computation/persistence fails.

Failures should be explicit and hard-fail queue jobs.
