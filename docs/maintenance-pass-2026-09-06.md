# Focused Maintenance Pass

Date: 2026-09-06  
Status: scope and acceptance criteria

## Product workflow and authority

The guitarist uses Tone Lab to shape one `Live Patch`, hear changes promptly, then save worthwhile partial or full patch objects and optionally commit them to amp slots for auditioning. The amp queue owns device operations; persisted Live Patch state owns the last-known amp projection; the Angular app owns dashboard interaction state. Spectrum Compare remains browser-local and does not add a second patch-state authority.

## Selected improvements

1. Correct the root README so new contributors reach the authoritative forward plan rather than two retired planning documents and the legacy Tauri workflow.
   - Evidence: the README names only removed planning files, while `docs/forward-implementation.md` is the authoritative plan and `tauri/` is reference-only.
2. Make `App` the sole owner of the global normalization target value and its browser-local persistence. The dashboard panel will receive the value and emit edits, rather than maintaining a second local signal and storage lifecycle.
   - Evidence: both `app.ts` and `dashboard-sticky-panel.component.ts` currently parse, normalize, and persist the same `katana.globalNormalizeTargetRms` value, while normalization itself reads the parent state.
3. Remove unused effect-name catalogues and option helpers from the dashboard panel.
   - Evidence: the panel declares booster, effect, delay, amp, and reverb catalogues plus related helper types, but none are referenced by its template or class logic.

## Module responsibilities

- `apps/web/src/app/app.ts` owns the normalization target because it is consumed by the normalization workflow and already owns its persistence.
- `dashboard-sticky-panel.component.ts` owns only the panel’s live-meter display and emits user interactions to the parent.
- `README.md` is the repository entry point and must identify the active runtime and authoritative planning document.

## Acceptance criteria

- The README links only to current planning/runtime guidance and clearly marks Tauri as reference-only.
- Editing the dashboard normalization target still updates the value used by normalization and persists it through the parent owner.
- The dashboard panel contains no duplicate normalization persistence or unused effect catalogues.
- The Angular production build succeeds in the Compose path, Compose services become healthy after the required rebuild/restart, and non-mutating public API and browser checks succeed without amp writes, AI generation, or catalog-data changes.
