# Katana Gen 3 Patch Manager

This repository is evolving into a full-stack web app for managing a BOSS/Roland Katana Gen 3 amp.

Runtime target:
- FastAPI + SQLAlchemy + Alembic + PostgreSQL backend,
- Angular frontend (strict TypeScript),
- Docker Compose deployment behind Traefik on `dockerips` (no host app port exposure).

The `tauri/` folder is retained as a reverse-engineering source/reference for extracted JS assets, not as the primary runtime UI.

Primary planning doc:
- `docs/webapp-implementation-plan.md`
- `docs/hash-first-patch-platform-design.md`

Phase 1 scaffold paths:
- `apps/api`
- `apps/web`
- `libs/katana-core`
- `compose.yml`
- `COMPOSE.md`

---

# Legacy Notes: BOSS TONE STUDIO for Linux

An earlier goal of this repository was an unofficial port of BOSS TONE STUDIO to Linux.

## Installing

### Requirements

1. Docker Engine for Linux: https://docs.docker.com/engine/install/

### Building

To build the application and place the resulting packages (.deb, .rpm, .AppImage) in a directory named `out/`, run:

```
docker build . -f Dockerfile.prepare -o . && docker build . -o out
```

The resulting packages can be directly installed with your distribution's package manager.

## Developing

### Requirements

1. Tauri Prerequisites: https://v2.tauri.app/start/prerequisites/

### Preparation

To prepare the repository for development:

```
docker build . -f Dockerfile.prepare -o .
cd tauri
npm install
```

### Running

```
cd tauri
npm run tauri dev
```

## Supported BOSS TONE STUDIO Versions

| Version                                     | Status | Notes                                 |
| ------------------------------------------- | ------ | ------------------------------------- |
| BOSS TONE STUDIO for KATANA Gen 3 Ver 1.1.0 | 🚧      | All controls that I have tested work. |
