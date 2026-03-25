# Compose Runtime

This stack is Traefik/dockerips-first:
- no `ports:` and no `expose:` for app services,
- routing via Traefik labels on the external `dockerips` network,
- API/Web run as UID:GID `1000:1000`.

## Start

```bash
eval "$(python3 scripts/resolve_katana_midi.py --shell)"
docker compose -f compose.yml up -d --build
```

## Notes

- `katana.ryzen.jjrsoftware.co.uk` is used as the default host rule for both web and API routes.
- Traefik routers are configured on `websecure` with `tls=true` and cert resolver `le-dns`.
- API expects host PipeWire socket at `/run/user/1000/pipewire-0`.
- API mounts `/dev/snd` for ALSA MIDI/audio access.
- API adds host audio group GID `29` so `user: 1000:1000` can open ALSA device nodes.
- API uses `security_opt: systempaths=unconfined` so ALSA `/proc/asound` is not masked by Docker.
- Startup checks fail hard if PipeWire socket, MIDI path, DB, or `amidi` are unavailable.

## Amp Communication Smoke Test

1. Start the stack:
```bash
eval "$(python3 scripts/resolve_katana_midi.py --shell)"
docker compose -f compose.yml up -d --build
```
2. Open `https://katana.ryzen.jjrsoftware.co.uk`.
3. Click `Test Amp Connection`.
4. Confirm the response JSON includes a SysEx identity reply (`response_hex` begins with `F0` and ends with `F7`).

## Katana Port Resolution

- Resolve the current Katana ALSA card/port before startup:
```bash
python3 scripts/resolve_katana_midi.py --shell
```
- This exports:
  - `KATANA_CARD_INDEX`
  - `KATANA_MIDI_PORT` (used by API, e.g. `hw:3,0,0`)
  - `KATANA_MIDI_DEVNODE`
