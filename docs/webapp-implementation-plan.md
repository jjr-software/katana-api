# Katana Gen 3 Web App Implementation Plan

Date: 2026-03-25

## Goal
Build a full-stack web application for Katana Gen 3 patch management and amp operations, replacing Tauri as runtime UI while retaining Tauri assets only as reverse-engineering references.

Core workflows:
- list and browse stored patches,
- read current patch/state from amp,
- apply patch to amp,
- store patch to slot memory,
- inspect decoded pipeline,
- run patch volume matching.

## Confirmed Constraints
- Deployment model: Docker Compose stack.
- Reverse proxy/networking: Traefik + dockerips.
- No local host port exposure for app services:
  - do not use `ports:`,
  - do not use `expose:`,
  - use Traefik labels and dockerips networking only.
- Runtime UID/GID: services run as `1000:1000`.
- Audio integration: PipeWire interface must be used.
- Keep failure behavior strict: fail hard on missing dependencies/prerequisites.

## Target Stack
- Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL + Pydantic.
- Frontend: Angular (strict TypeScript).
- Runtime pattern: async-first Python (`asyncio`) for I/O operations.

## High-Level Architecture
- `apps/api`: FastAPI service exposing amp + patch APIs.
- `apps/web`: Angular SPA.
- `libs/katana-core`: shared Python library for MIDI SysEx, patch I/O, pipeline decode, leveling/matching.
- `infra/compose`: compose and container config, Traefik labels, dockerips attachment.
- `db` service: PostgreSQL internal-only on compose network.

Tauri remains non-runtime and is retained only for extracted JS/resources used in protocol decoding research.

## Backend Scope
### 1) Katana Core Extraction
Port current toolkit logic into importable backend services (not shelling out to CLI):
- MIDI transport/session management,
- pull/read current patch,
- apply patch,
- store/commit to slot,
- full pipeline fetch/decode,
- loudness sampling + match routines,
- connection sanity check.

### 2) Data Model (Postgres)
Initial entities:
- `patches` (name, tags, source, snapshot JSON, checksum),
- `patch_versions` (history/versioning),
- `amp_state_dumps` (timestamped state capture),
- `level_match_runs` (inputs, iterations, outcomes),
- `operation_logs` (action/result/error metadata).

Deliverables:
- SQLAlchemy models,
- Alembic baseline migration,
- initial seed/bootstrap path where helpful.

### 3) API Surface
Planned endpoints:
- `GET /patches`, `POST /patches`, `GET /patches/{id}`,
- `POST /amp/read-current`,
- `POST /amp/apply`,
- `POST /amp/store-slot`,
- `POST /amp/pipeline`,
- `POST /amp/match-volume`,
- `GET /amp/test-connection`.

Long-running operations should stream progress via WebSocket/SSE (match, batch apply, dumps).

## Frontend Scope (Angular)
Views:
- Patch library (list/filter/tag/search),
- Patch detail + structured snapshot view,
- Amp actions panel (read/apply/store),
- Pipeline inspector (decoded stage data),
- Volume-match workflow + report history,
- Operation/event log.

UX requirements:
- explicit loading/progress states for hardware operations,
- clear hard-fail errors with actionable messages,
- no silent retry/fallback behavior.

## Compose + Infra Plan
### Service Design
- `web` and `api` run as `user: "1000:1000"`.
- `db` internal only.
- No host port publishing for app services.

### Networking
- Attach services to internal app network and `dockerips` network.
- Traefik discovers `web`/`api` via labels.
- Routing entirely through Traefik entrypoints.

### PipeWire + Device Access (API service)
- mount PipeWire socket from host user runtime dir (expected `/run/user/1000/pipewire-0`),
- set `XDG_RUNTIME_DIR=/run/user/1000`,
- mount required sound/MIDI device paths (for Katana + sampling),
- startup checks fail hard if socket/device/source are unavailable.

## Delivery Phases
### Phase 1: Foundation
- Monorepo structure (`apps/`, `libs/`, `infra/compose/`).
- Container build skeleton for API + Web.
- Compose stack with Traefik/dockerips labels (no host ports).
- Postgres service + Alembic wiring.

### Phase 2: Backend MVP
- `katana-core` integration into FastAPI service.
- Patch CRUD + read/apply/store/test endpoints.
- Operation logging and error model.

### Phase 3: Frontend MVP
- Angular app scaffold with strict TS.
- Patch library and core amp actions.
- Basic operation status/progress UX.

### Phase 4: Advanced Audio Workflows
- Volume matching endpoints + UI.
- Match run reporting/history.
- Pipeline decode view + dump import support.

### Phase 5: Hardening + Cutover
- End-to-end validation with real hardware.
- Remove/retire legacy runtime paths once web flow is authoritative.
- Keep reverse-engineering assets as references only.

## Non-Goals (Initial)
- Backward compatibility with old CLI/Tauri runtime behavior.
- Multiple alternate runtime wiring paths/config surfaces.
- Manual ad-hoc deployment outside compose + Traefik model.

## Acceptance Criteria
- User can manage patch library from browser.
- User can read/apply/store patches to Katana via API.
- User can run volume matching with PipeWire-backed measurement.
- System is reachable only through Traefik routing on dockerips (no app port exposure).
- API/Web run as UID:GID `1000:1000`.
- Missing critical dependencies fail clearly and immediately.

## Risks / Open Items
- Host-specific PipeWire and MIDI device mapping may vary; compose mounts must match actual host paths.
- Hardware timing nuances (store/verify race) require explicit settle/verify sequencing in API workflows.
- Long-running operations need robust cancellation/state handling to avoid dangling hardware sessions.
