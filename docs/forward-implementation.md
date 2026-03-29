# Katana Forward Implementation

Date: 2026-03-29  
Status: Authoritative plan (single source)

## 1) Product Direction
Build a tone-discovery platform for Katana, not a hash-first patch vault.

Primary outcomes:
- make AI-assisted tone design a first-class workflow that reliably produces playable candidates,
- generate and catalog tone ideas at partial-setting level,
- compose those ideas into playable 8-slot audition sets,
- push sets to the amp quickly for GA-FC auditioning,
- keep and group winners without losing lineage,
- support structured AI generation for fragments, variants, and sets.

Full patch JSON remains the canonical deployment format sent to the amp, but it is no longer the primary product concept. It is the rendered output of a more useful internal model.

## 2) Core Design Rules
1. Full patch JSON is a deployment artifact, not the main unit of thought.
2. Partial settings must be first-class. A valid saved object may contain only `booster`, only `eq1`, or any intentional multi-stage subset.
3. There is exactly one `Live Patch` on the amp at a time. It is the current edit buffer and the sound being played right now.
4. Stored amp slots are distinct from `Live Patch`:
   - activating a slot loads that stored slot patch into `Live Patch`,
   - fragment edits modify `Live Patch`,
   - nothing persists to an amp slot without explicit store/commit.
5. Every playable slot assignment must render to one full patch JSON before being pushed to the amp.
6. Fast 8-slot audition workflow is a first-class product path, not a side feature.
7. A persisted entity must have one source of truth only. Do not store both raw source data and its derived rendered form in the same authoritative record.
8. Hashes are implementation detail only:
   - useful for dedupe,
   - useful for exact-equality checks,
   - not the primary user-facing identity model.
9. Names are human-facing and must be unique per entity type:
   - fragment names unique among fragments,
   - variant names unique among variants,
   - set names unique among sets,
   - group names unique among groups.
10. No silent overwrite by name. Name collision must force an explicit user choice:
   - rename,
   - save as new revision,
   - copy into another group with a new name.
11. All amp communications still run through queue operations.
12. AI designer flow is a core product path, not an optional add-on.
13. AI outputs must be structured and schema-validated before anything is persisted or pushed to hardware.
14. During tone design, fast apply to `Live Patch` is preferred over slot commit. Committing to amp slots is a persistence operation, not the default design loop.
15. Manual parameter edits in the UI must apply to `Live Patch` immediately. No grace period, debounce window, or delayed apply should interrupt the design loop.

## 3) Domain Model
## 3.1 Fragment
A `fragment` is a partial configuration covering one or more stages.

Examples:
- `booster` only,
- `eq1` only,
- `booster + eq1`,
- `delay + reverb`,
- `amp + eq1 + ns`.

Fragment requirements:
- stores only intentional fields, not a full patch blob,
- stores sparse block JSON only,
- can be tagged by sound, guitarist, genre, or purpose,
- can include free-text notes and AI provenance.

Fragment storage model:
- block presence means this fragment owns that block,
- block absence means this fragment does not define that block,
- for example `{ "amp": {...} }` is an amp-only fragment,
- for example `{ "amp": {...}, "eq1": {...}, "booster": {...} }` is a three-block fragment.

This is separate from effect enable/disable state:
- a present block may intentionally set `on: false`,
- that still means the fragment owns that block,
- absent blocks are the only `do not care` blocks,
- fields outside present blocks must not be stored as dead weight.

## 3.2 Full-Scope Patch Object
A full-scope patch object is the same storage concept as any other patch idea. It just happens to contain all relevant blocks.

Examples:
- a complete dry clean platform,
- a complete edge-of-breakup patch,
- a complete high-gain patch with noise suppressor baseline.

Rules:
- it is not a separate feature or entity class,
- it uses the same sparse block JSON model as any other saved object,
- it just has broad scope because more blocks are present,
- it can be used as the starting point for composition or live apply when needed.

## 3.3 Variant
A `variant` is a fully playable tone candidate.

There are two valid forms:
- `composed`: built from one full-scope patch object, zero or more fragments, and optional direct stage overrides,
- `captured` or `imported`: stored as one authoritative full patch JSON snapshot.

Rules:
- a composed variant does not store rendered patch JSON as authoritative data,
- a captured/imported variant may store full patch JSON because that is its source of truth,
- rendering happens on demand for composed variants,
- lineage must still record:
  - which full-scope starting patch it came from,
  - which fragments were applied,
  - which overrides were introduced,
  - whether it came from AI generation, manual edit, slot capture, or import.

## 3.4 Set
A `set` is an audition batch intended for fast live comparison on the amp.

Default assumption:
- 8 variants mapped to `A:1..B:4`.

Set requirements:
- ordered slot assignments,
- one-click queued apply-to-amp,
- clear provenance of how each slot was generated,
- ability to keep or promote individual winners after audition.

## 3.5 Group
A `group` is a durable cataloging container for saved work.

Examples:
- `Greenwood Trials`,
- `Coxon Keepers`,
- `Dry Crunch`,
- `Test Set 5 Winners`.

Groups are for organization and retrieval, not deployment. A group may contain:
- variants,
- fragments,
- sets.

## 3.6 Keeper
`keeper` is a promoted status, not a separate technical format.

Meaning:
- a variant survived audition,
- it should remain easy to find,
- it may be copied into one or more groups,
- it may become the parent of later revisions.

## 3.7 Live Patch
`Live Patch` is a first-class runtime concept and must be prominent in the UI.

It means:
- the sound currently being played,
- the current edit buffer on the amp,
- possibly different from every stored amp slot,
- possibly different from every saved DB object.

Rules:
- there is one live patch only,
- there is no such thing as a separate staged patch per slot,
- applying a fragment updates `Live Patch`,
- activating a slot replaces `Live Patch` with that slot's stored patch,
- storing commits current `Live Patch` into the selected amp slot,
- saving to the DB is separate again.

Design priority:
- the UI should optimize for getting AI suggestions and manual fragment edits into `Live Patch` quickly,
- manual UI edits should write through immediately to `Live Patch`,
- persistence indicators should answer whether `Live Patch` is saved:
  - to an amp slot,
  - to a DB object,
  - to both,
  - or to neither.

## 4) Identity, Equality, And Similarity
## 4.1 Identity
Primary identity is explicit and human-facing:
- immutable internal IDs,
- unique names by entity type,
- lineage links,
- group membership,
- creation source and timestamps.

## 4.2 Equality
Canonical JSON hashes remain useful for:
- exact duplicate detection,
- verifying rendered output equality,
- confirming amp readback matches expected rendered patch JSON.

They must not drive the main UX or conceptual model.

## 4.2.1 Amp State Trust Model
The app cannot know the amp state continuously. It only knows what it last wrote or last read.

Working rule:
- treat amp state as authoritative at the moment of successful readback,
- after app writes, assume that written/read-back state remains current until the next explicit sync or external change,
- surface this as `last known amp state`, not absolute omniscience,
- because the normal workflow assumes this app is the only writer, this trust model is acceptable.

## 4.3 Similarity
Similarity should be based on JSON-aware comparison and scope awareness, for example:
- same booster settings but different EQ,
- same amp core with different reverb,
- same fragment reused across many variants.

This should be computed from structured content, not guessed from names and not reduced to a single global hash concept.

## 5) Main User Workflows
## 5.0 Understand Current State
Target workflow:
1. User opens the app.
2. App shows `Live Patch` first.
3. App separately shows stored amp slot contents.
4. App states whether `Live Patch` matches:
   - the active slot,
   - another amp slot,
   - a saved DB object,
   - or nothing known.
5. App also shows when this status was last confirmed from the amp.

## 5.0.1 Fast Live Design Loop
Target workflow:
1. User asks AI for candidate ideas.
2. App applies one candidate directly to `Live Patch`.
3. User plays immediately.
4. App swaps another candidate into `Live Patch` without committing any slot.
5. User saves or stores only when something is worth keeping.

Manual edit rule:
1. User changes a control in the UI.
2. The change is sent to `Live Patch` immediately.
3. The user hears the result immediately.
4. Save/store decisions happen later and separately.

## 5.1 Build An Exploration Set
Target workflow:
1. User asks for a family of tones, for example `8 Greenwood-ish booster + eq1 ideas`.
2. AI generates 8 structured candidates against a chosen full-scope starting patch when needed.
3. App creates a new set, for example `Test Set 5`.
4. App renders 8 full patch payloads and queues apply-to-amp.
5. User auditions live with GA-FC.

Alternate fast path:
1. User asks for several candidate ideas.
2. App keeps them only in the DB.
3. User hot-applies them to `Live Patch` one-by-one without writing amp slots.
4. Slot commit is used later only for persistence or pedalboard-style audition convenience.

## 5.2 Keep Winners
Target workflow:
1. User selects a slot they like.
2. App promotes the slot variant to keeper status.
3. User optionally copies it into one or more groups.
4. Original set lineage remains intact.

## 5.3 Capture From Live Amp
Target workflow:
1. User tweaks the amp manually.
2. App syncs `Live Patch` from amp.
3. User saves the result as:
   - a fragment,
   - a full variant,
   - or both.

## 5.4 Compose From Existing Building Blocks
Target workflow:
1. User picks an existing full-scope patch object when one is needed.
2. User applies one or more saved fragments.
3. App renders a new variant.
4. User adds that variant to a set or saves it directly.

## 6) AI Interaction Model
## 6.1 Required Direction
AI designer must be one of the strongest parts of the product.

It must help with tone construction in structured form, not just chat about gear.

The system should support prompts such as:
- `Give me 8 booster + eq1 variants for Greenwood clean attack`
- `Build a Coxon-inspired set with dry amp core and more upper-mid bite`
- `Generate 4 reverb + delay tails for ambient clean parts`

Default expectation:
- most AI outputs should cover only 1-4 blocks,
- full-scope outputs are the exception,
- partial multi-block ideas are the normal case.

## 6.2 Structured Output Contract
Primary path:
- schema-validated JSON objects for fragments, variants, and sets.

Initial rule:
- prefer structured object generation over free-form patch JSON dumps.
- prefer generation of compact, intentional partial objects over noisy full-state dumps when the user is exploring only part of the tone.
- most generated candidates should be sparse 1-4 block objects unless the prompt explicitly asks for a full patch.
- only render full patch JSON after the app has resolved:
  - a full-scope starting patch when one is required,
  - present fragment blocks,
  - defaults for unspecified stages.
- if the target is `Live Patch`, the system may apply only the affected fragment/stage writes without persisting a slot.

Fallback path if needed later:
- stage-specific tool calls for AI to build a candidate incrementally.

## 6.3 Knowledge Layer Needed
The app should maintain a structured knowledge base for stage semantics, including:
- booster pedal names and likely musical flavor,
- EQ type behavior and practical use,
- common amp-type roles,
- reverb/delay/mod defaults and stylistic associations.

This is not for vague explanation only. It should improve candidate generation quality and explainability.

## 7) Data Model Direction
Planned nucleus:

### `full_patch_objects`
- `id`
- `name` (unique)
- `description`
- `patch_json`
- timestamps

### `fragments`
- `id`
- `name` (unique)
- `description`
- `fragment_json`
- `source_type` (`ai`, `manual`, `captured`, `imported`)
- `source_prompt`
- `parent_fragment_id` nullable
- timestamps

### `variants`
- `id`
- `name` (unique)
- `description`
- `variant_kind` (`composed`, `captured`, `imported`)
- `starting_patch_id` nullable
- `patch_json` nullable
- `is_keeper`
- `source_type`
- `source_prompt`
- `parent_variant_id` nullable
- timestamps

### `variant_fragments`
- `variant_id`
- `fragment_id`
- `position`
- unique `(variant_id, fragment_id, position)`

### `variant_overrides`
- `variant_id`
- `override_json`

### `live_patch_snapshots`
- `id`
- `source_type` (`amp_sync`, `ai_apply`, `manual_apply`, `slot_activation`)
- `patch_json`
- `active_slot` nullable
- `matches_saved_variant_id` nullable
- `matches_saved_slot` nullable
- `amp_confirmed_at`
- timestamps

### `sets`
- `id`
- `name` (unique)
- `description`
- `source_prompt`
- timestamps

### `set_slots`
- `set_id`
- `slot`
- `variant_id`
- unique `(set_id, slot)`

### `groups`
- `id`
- `name` (unique)
- `description`
- timestamps

### `group_variants`
- `group_id`
- `variant_id`
- unique `(group_id, variant_id)`

### `group_fragments`
- `group_id`
- `fragment_id`
- unique `(group_id, fragment_id)`

### `group_sets`
- `group_id`
- `set_id`
- unique `(group_id, set_id)`

Existing tables can survive where useful, but the model must pivot away from patch-hash-first thinking.

Storage rule:
- `fragments` store fragment data only,
- `full_patch_objects` store patch JSON only,
- `composed variants` store composition data only,
- `captured/imported variants` store patch JSON only,
- derived renders and hashes are computed or cached outside the authoritative entity model.

Fragment rule:
- fragment storage must preserve only intentional present blocks,
- not all visible values from a live patch,
- not unrelated defaults,
- not dead weight included only because it happened to be present when captured.

## 8) API Direction
Planned target surface:
- `GET /api/v1/live-patch`
- `POST /api/v1/live-patch/sync`
- `POST /api/v1/live-patch/apply-fragment`
- `POST /api/v1/live-patch/apply-variant`
- `POST /api/v1/live-patch/store-to-slot`
- `POST /api/v1/full-patches`
- `GET /api/v1/full-patches`
- `POST /api/v1/fragments`
- `GET /api/v1/fragments`
- `POST /api/v1/variants/render`
- `POST /api/v1/variants`
- `GET /api/v1/variants`
- `POST /api/v1/sets`
- `PUT /api/v1/sets/{id}/slots/{slot}`
- `POST /api/v1/sets/{id}/apply`
- `POST /api/v1/variants/{id}/keep`
- `POST /api/v1/groups`
- `POST /api/v1/groups/{id}/variants/{variant_id}`
- `POST /api/v1/ai/generate/fragments`
- `POST /api/v1/ai/generate/variants`
- `POST /api/v1/ai/generate/set`

Priority interaction path:
- AI generate -> save to DB -> apply to `Live Patch` -> play -> keep/store if worth it.
- manual edit in UI -> immediate apply to `Live Patch` -> hear result now.

Amp-facing operations should remain queued. The queue status UI remains valid and useful.

## 9) Migration Away From Hash-First Design
What changes:
- hash-based identity is retired as the main organizing principle,
- desired-vs-actual reconciliation by hash stops being the center of the roadmap,
- slot-centric staged-state thinking is retired,
- patch library becomes fragment/variant/set/group library.

What stays:
- canonical JSON rendering,
- exact hash fingerprinting for dedupe and verification,
- queued amp apply and sync operations,
- slot readback and raw payload inspection.

Migration rule:
- existing saved patch rows should be treated as importable rendered variants.
- `Live Patch` must become a first-class runtime object in the web app before more slot-centric UX grows further.
- no destructive data rewrite should happen until the new domain model is in place.

## 10) Current Delivery Status
## 10.1 Useful Foundation Already Present
- queued amp operations and queue monitor UI,
- ability to write partial stage data into the live patch/edit buffer,
- slot sync and raw JSON inspection,
- load-full-amp-state flow,
- web slot card layout and action wiring,
- patch JSON capture/apply tooling,
- audio sample capture foundation.

## 10.2 Misaligned With New Direction
- hash-first patch identity model,
- reconciliation-centered roadmap,
- slot cards being more conceptually central than `Live Patch`,
- stale assumptions about slot-level staged state,
- committing to amp slots too early in the design flow,
- delayed/grace-period live apply during manual editing,
- patch-only library mental model,
- limited support for partial-setting composition and promotion.

## 11) Implementation Roadmap
## Phase A: Domain Pivot
Deliver:
- replace planning and schema direction around fragments, variants, sets, groups, and full-scope patch objects,
- introduce `Live Patch` as first-class runtime model and top-level UI object,
- introduce unique-name rules with explicit collision failure,
- define render pipeline from partial structures to full patch JSON,
- define single-source-of-truth storage constraints for all persisted entities,
- define immediate write-through behavior for manual live editing.

Exit criteria:
- app has a stable internal model that matches tone-discovery workflow.

## Phase B: Set-Centric Workflow
Deliver:
- create/edit sets with 8 ordered slots,
- queued apply-set-to-amp flow,
- clear `Live Patch` vs stored slot status after activation and editing,
- keep/promote-from-slot flow,
- group assignment for saved winners.

Exit criteria:
- user can generate or assemble a set, push it, and keep winners without manual JSON handling.

## Phase C: Fragment Workflow
Deliver:
- fragment CRUD,
- compose variant from a full-scope patch object + fragments,
- apply fragment directly to `Live Patch`,
- capture fragment from `Live Patch` sync,
- browse by stage scope and tags.

Exit criteria:
- user can work naturally with `booster + eq1` or other partial ideas as first-class objects.

## Phase D: Structured AI Generation
Deliver:
- schema for AI fragment/variant/set generation,
- prompt-to-live-apply flow in UI,
- prompt-to-set flow in UI,
- validation and explainability for generated settings,
- pedal-flavor/stage-knowledge support data.

Exit criteria:
- user can ask for a guitarist/sound/profile and receive structured, playable candidates.

## 12) Immediate Next Sprint
1. Define the AI designer contract for fragment/variant generation with sparse 1-4 block output as the default.
2. Define `Live Patch`, stored amp slot, and DB object status model explicitly in API and UI terms.
3. Define the render/apply contract:
   - partial apply to `Live Patch`,
   - immediate manual UI write-through to `Live Patch`,
   - full render when required,
   - explicit store only for amp persistence.
4. Replace patch-set/hash-oriented schema plan with concrete `full_patch_objects`, `fragments`, `variants`, `sets`, and `groups` migrations.
5. Implement prompt-to-`Live Patch` apply plus visible saved/not-saved indicators before expanding slot workflows further.

## 13) Explicitly Out
- treating names as optional metadata only,
- silent overwrite when a requested name already exists,
- forcing all useful saved work into full patch records,
- storing both raw source data and derived rendered patch data as co-equal truth in one entity,
- pretending each slot has its own independent staged runtime patch state,
- making hash equality the main user-facing concept,
- free-form AI text as the primary generation interface.
