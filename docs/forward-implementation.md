# Katana Forward Implementation

Date: 2026-03-29  
Status: Authoritative plan (single source)

## 1) Product Direction
Build a tone-discovery platform for Katana, not a hash-first patch vault.

Primary outcomes:
- generate and catalog tone ideas at partial-setting level,
- compose those ideas into playable 8-slot audition sets,
- push sets to the amp quickly for GA-FC auditioning,
- keep and group winners without losing lineage,
- support structured AI generation for fragments, variants, and sets.

Full patch JSON remains the canonical deployment format sent to the amp, but it is no longer the primary product concept. It is the rendered output of a more useful internal model.

## 2) Core Design Rules
1. Full patch JSON is a deployment artifact, not the main unit of thought.
2. Partial settings must be first-class. A valid saved object may contain only `booster`, only `eq1`, or any intentional multi-stage subset.
3. Every playable slot assignment must render to one full patch JSON before being pushed to the amp.
4. Fast 8-slot audition workflow is a first-class product path, not a side feature.
5. Hashes are implementation detail only:
   - useful for dedupe,
   - useful for exact-equality checks,
   - not the primary user-facing identity model.
6. Names are human-facing and must be unique per entity type:
   - fragment names unique among fragments,
   - variant names unique among variants,
   - set names unique among sets,
   - group names unique among groups.
7. No silent overwrite by name. Name collision must force an explicit user choice:
   - rename,
   - save as new revision,
   - copy into another group with a new name.
8. All amp communications still run through queue operations.
9. AI outputs must be structured and schema-validated before anything is persisted or pushed to hardware.

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
- records which stages it owns,
- can be tagged by sound, guitarist, genre, or purpose,
- can include free-text notes and AI provenance.

## 3.2 Base Rig
A `base rig` is a known starting point used to render playable variants.

Examples:
- everything off except amp,
- dry clean platform,
- edge-of-breakup platform,
- high-gain platform with noise suppressor baseline.

Base rig requirements:
- stored as full patch JSON,
- stable and explicit,
- used to fill in unspecified stages when composing variants.

## 3.3 Variant
A `variant` is a fully playable tone candidate.

It is built from:
- one base rig,
- zero or more fragments,
- optional direct stage overrides.

A variant always renders to one full patch JSON for amp push, but it keeps composition lineage:
- which base rig it came from,
- which fragments were applied,
- which overrides were introduced,
- whether it came from AI generation, manual edit, or slot capture.

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

## 4.3 Similarity
Similarity should be based on JSON-aware comparison and scope awareness, for example:
- same booster settings but different EQ,
- same amp core with different reverb,
- same fragment reused across many variants.

This should be computed from structured content, not guessed from names and not reduced to a single global hash concept.

## 5) Main User Workflows
## 5.1 Build An Exploration Set
Target workflow:
1. User asks for a family of tones, for example `8 Greenwood-ish booster + eq1 ideas`.
2. AI generates 8 structured candidates against a chosen base rig.
3. App creates a new set, for example `Test Set 5`.
4. App renders 8 full patch payloads and queues apply-to-amp.
5. User auditions live with GA-FC.

## 5.2 Keep Winners
Target workflow:
1. User selects a slot they like.
2. App promotes the slot variant to keeper status.
3. User optionally copies it into one or more groups.
4. Original set lineage remains intact.

## 5.3 Capture From Live Amp
Target workflow:
1. User tweaks a live slot manually.
2. App syncs the slot from amp.
3. User saves the result as:
   - a fragment,
   - a full variant,
   - or both.

## 5.4 Compose From Existing Building Blocks
Target workflow:
1. User picks an existing base rig.
2. User applies one or more saved fragments.
3. App renders a new variant.
4. User adds that variant to a set or saves it directly.

## 6) AI Interaction Model
## 6.1 Required Direction
AI must help with tone construction in structured form, not just chat about gear.

The system should support prompts such as:
- `Give me 8 booster + eq1 variants for Greenwood clean attack`
- `Build a Coxon-inspired set with dry amp core and more upper-mid bite`
- `Generate 4 reverb + delay tails for ambient clean parts`

## 6.2 Structured Output Contract
Primary path:
- schema-validated JSON objects for fragments, variants, and sets.

Initial rule:
- prefer structured object generation over free-form patch JSON dumps.
- only render full patch JSON after the app has resolved:
  - base rig,
  - owned stages,
  - defaults for unspecified stages.

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

### `base_rigs`
- `id`
- `name` (unique)
- `description`
- `patch_json`
- timestamps

### `fragments`
- `id`
- `name` (unique)
- `description`
- `stage_scope` or owned-stage list
- `fragment_json`
- `source_type` (`ai`, `manual`, `captured`, `imported`)
- `source_prompt`
- `parent_fragment_id` nullable
- timestamps

### `variants`
- `id`
- `name` (unique)
- `description`
- `base_rig_id`
- `rendered_patch_json`
- `render_hash` nullable
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

## 8) API Direction
Planned target surface:
- `POST /api/v1/base-rigs`
- `GET /api/v1/base-rigs`
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

Amp-facing operations should remain queued. The queue status UI remains valid and useful.

## 9) Migration Away From Hash-First Design
What changes:
- hash-based identity is retired as the main organizing principle,
- desired-vs-actual reconciliation by hash stops being the center of the roadmap,
- patch library becomes fragment/variant/set/group library.

What stays:
- canonical JSON rendering,
- exact hash fingerprinting for dedupe and verification,
- queued amp apply and sync operations,
- slot readback and raw payload inspection.

Migration rule:
- existing saved patch rows should be treated as importable rendered variants.
- no destructive data rewrite should happen until the new domain model is in place.

## 10) Current Delivery Status
## 10.1 Useful Foundation Already Present
- queued amp operations and queue monitor UI,
- slot sync and raw JSON inspection,
- load-full-amp-state flow,
- web slot card layout and action wiring,
- patch JSON capture/apply tooling,
- audio sample capture foundation.

## 10.2 Misaligned With New Direction
- hash-first patch identity model,
- reconciliation-centered roadmap,
- patch-only library mental model,
- limited support for partial-setting composition and promotion.

## 11) Implementation Roadmap
## Phase A: Domain Pivot
Deliver:
- replace planning and schema direction around fragments, variants, sets, groups, base rigs,
- introduce unique-name rules with explicit collision failure,
- define render pipeline from partial structures to full patch JSON.

Exit criteria:
- app has a stable internal model that matches tone-discovery workflow.

## Phase B: Set-Centric Workflow
Deliver:
- create/edit sets with 8 ordered slots,
- queued apply-set-to-amp flow,
- keep/promote-from-slot flow,
- group assignment for saved winners.

Exit criteria:
- user can generate or assemble a set, push it, and keep winners without manual JSON handling.

## Phase C: Fragment Workflow
Deliver:
- fragment CRUD,
- compose variant from base rig + fragments,
- capture fragment from live amp sync,
- browse by stage scope and tags.

Exit criteria:
- user can work naturally with `booster + eq1` or other partial ideas as first-class objects.

## Phase D: Structured AI Generation
Deliver:
- schema for AI fragment/variant/set generation,
- prompt-to-set flow in UI,
- validation and explainability for generated settings,
- pedal-flavor/stage-knowledge support data.

Exit criteria:
- user can ask for a guitarist/sound/profile and receive structured, playable candidates.

## 12) Immediate Next Sprint
1. Replace patch-set/hash-oriented schema plan with concrete `base_rigs`, `fragments`, `variants`, `sets`, and `groups` migrations.
2. Define the render contract from partial objects to full patch JSON.
3. Implement minimal `set` creation plus 8-slot assignment API.
4. Implement queued `apply set to amp`.
5. Add `keep variant from slot` flow with explicit naming and collision failure.

## 13) Explicitly Out
- treating names as optional metadata only,
- silent overwrite when a requested name already exists,
- forcing all useful saved work into full patch records,
- making hash equality the main user-facing concept,
- free-form AI text as the primary generation interface.
