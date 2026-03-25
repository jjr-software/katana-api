# Compose Runtime

This stack is Traefik/dockerips-first:
- no `ports:` and no `expose:` for app services,
- routing via Traefik labels on the external `dockerips` network,
- API/Web run as UID:GID `1000:1000`.

## Start

```bash
docker compose -f infra/compose/compose.yml up -d --build
```

## Notes

- `katana.local` is used as the default host rule for both web and API routes.
- API expects host PipeWire socket at `/run/user/1000/pipewire-0`.
- API mounts `/dev/snd` for MIDI/audio access.
- Startup checks fail hard if PipeWire socket, MIDI path, DB, or `amidi` are unavailable.
