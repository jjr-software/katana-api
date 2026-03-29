# Katana Implementation Plan

Date: 2026-03-29  
Status: Implementation plan

## 1) Purpose
This document turns [docs/forward-implementation.md](/home/will/dev/katana-api/docs/forward-implementation.md) into concrete implementation choices.

This is the plan for the first useful version, not the forever-perfect schema.

## 2) Hard Decisions
1. `Live Patch` is the primary runtime object in the UI.
2. Manual UI edits apply to `Live Patch` immediately. No grace period.
3. Amp slots are persistence targets, not the main design loop.
4. Saved patch ideas use sparse block JSON:
   - block present = owned by this object
   - block absent = `do not care`
5. Full-scope patches are ordinary saved patch objects with broad scope. They are not a separate feature.
6. AI output defaults to sparse `1-4` block objects unless the user explicitly asks for a full patch or a set.
7. Matching must support both:
   - exact match
   - partial match
8. Hashes are used for exact comparison and dedupe only.
9. The app only knows the amp as `last known state` from explicit read/write confirmation.
10. Do not store both authoritative raw source and authoritative rendered derivative in the same entity.

## 3) First-Cut Data Model
The first implementation should minimize entity count while preserving the design rules.

## 3.1 `patch_objects`
This is the core saved-object table.

Purpose:
- stores sparse patch ideas,
- stores full-scope patch ideas,
- stores captured full patches,
- is the main thing AI creates and the user browses.

Columns:
- `id`
- `name` unique
- `description`
- `patch_json` JSONB
- `source_type` enum: `ai`, `manual`, `captured`, `imported`
- `source_prompt` nullable
- `parent_patch_object_id` nullable
- `created_at`
- `updated_at`

Rules:
- `patch_json` is authoritative
- block presence is the scope model
- no derived rendered patch JSON column
- no derived scope column in phase 1

Examples:

```json
{
  "booster": { "on": true, "type": 13, "drive": 72, "tone": 46, "effect_level": 64 },
  "eq1": { "on": true, "type": 0, "ge10_raw": [24, 24, 24, 26, 28, 29, 27, 25, 24, 24, 24] }
}
```

```json
{
  "amp": { "raw": [46, 82, 50, 50, 51, 54, 1, 1, 0, 0] },
  "booster": { "on": true, "raw": [1, 18, 50, 45, 0, 50, 58, 0] },
  "eq1": { "position": 0, "on": true, "type": 0, "ge10_raw": [24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24] },
  "ns": { "on": false, "threshold": 50, "release": 50 }
}
```

## 3.2 `groups`
Purpose:
- user-facing organization only

Columns:
- `id`
- `name` unique
- `description`
- `created_at`
- `updated_at`

## 3.3 `group_patch_objects`
Columns:
- `group_id`
- `patch_object_id`

Unique:
- `(group_id, patch_object_id)`

## 3.4 `sets`
Purpose:
- ordered 8-slot audition batches

Columns:
- `id`
- `name` unique
- `description`
- `source_prompt` nullable
- `created_at`
- `updated_at`

## 3.5 `set_slots`
Columns:
- `set_id`
- `slot`
- `patch_object_id`

Unique:
- `(set_id, slot)`

Rules:
- `slot` is `1..8`
- in phase 1, sets point directly to `patch_objects`
- no separate `variant` table in phase 1

Implementation note:
- the product language can still say `candidate` or `variant`
- the persisted phase-1 object is `patch_object`

## 3.6 `live_patch_state`
Purpose:
- store last-known `Live Patch` and its status

Columns:
- `id` fixed single row or singleton table
- `patch_json`
- `active_slot` nullable
- `amp_confirmed_at`
- `source_type` enum: `amp_sync`, `ai_apply`, `manual_apply`, `slot_activation`
- `last_known_exact_patch_object_id` nullable
- `last_known_exact_slot` nullable
- `created_at`
- `updated_at`

Rules:
- this is last-known state, not a guarantee of current reality
- this row updates after:
  - live sync from amp
  - successful live apply
  - slot activation
  - successful manual edit write-through

## 3.7 `amp_slot_snapshots`
Purpose:
- store last-known contents of amp slots `1..8`

Columns:
- `slot` primary key
- `patch_name`
- `patch_json`
- `amp_confirmed_at`
- `exact_patch_object_id` nullable
- `updated_at`

Rules:
- this is also last-known state
- it updates only on explicit sync/readback or confirmed write/store

## 3.8 Deferred
Do not build these in phase 1:
- separate recipe/composition tables
- cached render tables
- dedicated fragment/full-patch subtype tables
- measurement orchestration schema changes unrelated to the new tone-design loop

If composition lineage later needs stronger structure, add:
- `patch_recipes`
- `patch_recipe_parts`

But do not start there.

## 4) JSON Contract
## 4.1 Saved Object Shape
`patch_json` is sparse and block-oriented.

Allowed top-level blocks in phase 1:
- `amp`
- `booster`
- `mod`
- `fx`
- `delay`
- `reverb`
- `eq1`
- `eq2`
- `ns`
- `send_return`
- `solo`
- `pedalfx`
- optional patch-level metadata block only if already authoritative in existing model

Rules:
- top-level block absent means `do not care`
- top-level block present means ownership
- a present block may explicitly set an effect to `off`
- saving from `Live Patch` must not include unrelated blocks

## 4.2 Block Validation
Each present block must validate against the existing block schema already supported by the amp client and editor.

Examples:
- `booster` may contain either compact fields or `raw`
- `eq1` may contain `position`, `on`, `type`, and either `ge10_raw` or `peq_raw`
- `amp` uses existing authoritative amp block shape

Do not invent a second schema for the same block.

## 5) Matching Rules
## 5.1 Exact Match
Exact match is canonical JSON equality after normalization.

Use:
- canonical JSON comparison
- optional hash shortcut after canonicalization

Applies to:
- `Live Patch` vs saved `patch_object`
- amp slot snapshot vs saved `patch_object`
- `Live Patch` vs amp slot snapshot

## 5.2 Partial Match
Partial match is scope-aware.

Rule:
- object `A` partially matches object `B` if every present top-level block in `A` exists in `B` and matches exactly after canonical normalization of that block

Meaning:
- absent blocks in `A` are wildcards
- a full object can exact-match another full object
- a sparse object can partially match many targets

Example:
- fragment `{amp, booster, eq1}` partially matches a `Live Patch` containing matching `amp`, `booster`, and `eq1` regardless of `delay`, `reverb`, or `mod`

## 5.3 Live Patch Status
The UI should compute and show all of these separately:
- `Exact DB Match`
- `Partial DB Matches`
- `Exact Amp Slot Match`
- `Partial Amp Slot Matches`
- `Last Confirmed`

Do not collapse this into one boolean.

## 6) Save Rules
## 6.1 Save From Live Patch
Saving from `Live Patch` requires explicit block selection every time.

Reason:
- prevents accidental junk capture
- keeps comparison meaningful
- preserves sparse intentional storage

UI behavior:
- open save modal
- user picks one or more blocks
- only selected blocks are extracted into saved `patch_object`

Nice-to-have, not day-one requirement:
- preselect blocks recently edited in the current session

## 6.2 Save Full Current Patch
If the user wants the whole current sound:
- provide explicit `Save Full Live Patch`
- this stores a broad-scope `patch_object`

This is still just another `patch_object`, not a different entity class.

## 6.3 Store To Amp Slot
This is separate from DB save.

Flow:
1. `Live Patch` exists
2. user chooses target slot
3. app writes/commits to slot
4. app updates `amp_slot_snapshots`
5. app recomputes exact/partial match status

## 7) Render And Apply Rules
## 7.1 Apply Sparse Object To Live Patch
Default fast path.

Rule:
- apply only the present blocks in the selected `patch_object`
- leave all absent blocks untouched in `Live Patch`

This is the normal path for:
- AI candidates
- fragment browsing
- manual auditioning

## 7.2 Apply Full-Scope Object To Live Patch
Rule:
- apply all present blocks
- because scope is broad, this usually defines most of the sound

## 7.3 Apply Set To Amp
For slot-based audition convenience:
1. resolve each set slot to a full patch payload
2. write each slot
3. commit each slot
4. update `amp_slot_snapshots`

Note:
- set apply is slower and persistence-oriented
- it is not the preferred loop for rapid tone-design iteration unless the user explicitly wants pedalboard/GA-FC auditioning

## 7.4 Manual Editing
Manual UI parameter changes:
- write through immediately to `Live Patch`
- update `live_patch_state` after successful apply
- do not wait on grace periods
- do not batch behind delayed timers

If a transport error occurs:
- fail visibly
- do not silently queue phantom local state as if the amp changed

## 8) AI Designer Contract
## 8.1 Output Modes
Default routing:
- prompt about a few stages -> return sparse `patch_objects`
- prompt about a whole tone -> return broad/full-scope `patch_objects`
- prompt for batch/comparison pack -> return `8` `patch_objects` suitable for a set

Default assumption:
- most outputs should be `1-4` blocks

## 8.2 API Surface
### `POST /api/v1/ai/generate/patch-objects`
Input:
- natural language prompt
- optional count
- optional preferred blocks
- optional reference `patch_object_id`
- optional `use_live_patch_as_context`

Output:
- array of validated sparse or broad `patch_json` objects with proposed names/descriptions

### `POST /api/v1/ai/generate/set`
Input:
- natural language prompt
- count fixed at `8`
- optional reference `patch_object_id`
- optional `use_live_patch_as_context`

Output:
- set draft plus `8` validated `patch_objects`

## 8.3 Persist Then Apply
For traceability, AI generation should follow:
1. generate validated objects
2. save to DB
3. apply selected object to `Live Patch`

Do not treat unsaved transient AI output as the normal state once generation succeeded.

## 9) API Plan
## 9.1 Live Patch
- `GET /api/v1/live-patch`
- `POST /api/v1/live-patch/sync`
- `POST /api/v1/live-patch/apply-patch-object`
- `POST /api/v1/live-patch/store-to-slot`
- `PATCH /api/v1/live-patch/blocks/{block_name}`

`GET /api/v1/live-patch` response should include:
- `patch_json`
- `active_slot`
- `amp_confirmed_at`
- `exact_patch_object`
- `exact_amp_slot`
- `partial_patch_objects`
- `partial_amp_slots`

## 9.2 Patch Objects
- `POST /api/v1/patch-objects`
- `GET /api/v1/patch-objects`
- `GET /api/v1/patch-objects/{id}`
- `POST /api/v1/patch-objects/save-from-live`
- `POST /api/v1/patch-objects/{id}/duplicate`

Filtering should support:
- block presence
- source type
- group membership
- text search by name/description

## 9.3 Sets
- `POST /api/v1/sets`
- `GET /api/v1/sets`
- `GET /api/v1/sets/{id}`
- `PUT /api/v1/sets/{id}/slots/{slot}`
- `POST /api/v1/sets/{id}/apply`

## 9.4 Groups
- `POST /api/v1/groups`
- `GET /api/v1/groups`
- `POST /api/v1/groups/{id}/patch-objects/{patch_object_id}`
- `DELETE /api/v1/groups/{id}/patch-objects/{patch_object_id}`

## 10) UI Plan
## 10.1 Top Of Page
Top section should be `Live Patch`.

It should show:
- current `Live Patch`
- active slot if known
- last confirmed time
- exact DB match if any
- exact slot match if any
- partial matches count and quick links
- actions:
  - `Sync Live`
  - `Save Fragment`
  - `Save Full Live Patch`
  - `Store To Slot`

## 10.2 AI Designer
Prominent entry point near `Live Patch`.

Flow:
1. user enters tone prompt
2. generated candidates appear as saved draft `patch_objects`
3. user clicks one
4. app applies it to `Live Patch` immediately
5. user hears result immediately

## 10.3 Manual Editor
Editor works against `Live Patch`, not against a slot card.

Rules:
- edits apply immediately
- no grace countdown
- save actions are explicit and separate

## 10.4 Slots Area
Slots remain visible, but secondary to `Live Patch`.

Each slot card should show:
- patch name
- last confirmed time
- exact saved-object match if any
- activate
- sync
- overwrite/store from `Live Patch`

## 10.5 Save Fragment Modal
Required controls:
- name
- description
- block checklist
- groups

Block checklist is mandatory.

## 11) Phased Build Order
## Phase 1: Core Runtime Pivot
- add `patch_objects`, `groups`, `group_patch_objects`, `sets`, `set_slots`, `live_patch_state`, `amp_slot_snapshots`
- add `GET /live-patch`
- add `POST /live-patch/sync`
- add `POST /live-patch/apply-patch-object`
- move editor semantics to immediate write-through against `Live Patch`

Exit:
- user can save sparse objects, apply them to `Live Patch`, and see exact/partial match status

## Phase 2: Save And Organize
- add `save-from-live` with explicit block selection
- add group APIs and UI
- add browse/filter by block presence

Exit:
- user can build a useful library of sparse ideas without junk

## Phase 3: AI Designer
- add AI generation endpoint for `patch_objects`
- persist generated candidates before apply
- add prompt-to-live-apply UI

Exit:
- user can ask for tone ideas and hear them immediately through `Live Patch`

## Phase 4: Set Workflow
- add set editor
- add set apply to amp slots
- add keep/promote flow from slot or live state

Exit:
- user can do 8-slot GA-FC auditioning when desired without distorting the core live-design model

## 12) Explicitly Not In Phase 1
- complicated recipe/composition schema
- hidden auto-save of live edits
- delayed apply/debounce-driven tone editing
- slot-first UI as the main mental model
- storing noisy full patch blobs for every small idea

## 13) First Build Tasks
1. Create migrations for `patch_objects`, `groups`, `group_patch_objects`, `sets`, `set_slots`, `live_patch_state`, and `amp_slot_snapshots`.
2. Implement canonical exact-match and scope-aware partial-match helpers.
3. Add `GET /api/v1/live-patch` and `POST /api/v1/live-patch/sync`.
4. Add `POST /api/v1/live-patch/apply-patch-object`.
5. Remove delayed/grace live-apply behavior from the editor path.
6. Add `POST /api/v1/patch-objects/save-from-live` with explicit block selection.
7. Move the web UI to a `Live Patch`-first layout.
