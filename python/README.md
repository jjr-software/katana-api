# Katana Python Toolkit

Common asyncio-first patch APIs for:

- storing patch ideas as JSON snapshots,
- applying snapshots to the amp,
- saving/pulling patch state from the amp,
- sampling USB audio levels in 1-second windows,
- auto-leveling patches by 1-second RMS dBFS windows.

Note on CLI framework choice:
- Typer was evaluated, but this tool stays on `argparse` because command handlers are natively `asyncio` coroutines and we want zero extra runtime dependency on this host.

## Commands

Use `python/katana_patch_tool.py`:

```bash
# Save current patch state from amp into a snapshot file
python3 python/katana_patch_tool.py save \
  --port hw:1,0,0 \
  --out setups/backups/current-patch-backup.json
```

`pull` remains available as an alias of `save`.

```bash
# Apply an existing snapshot to the amp
python3 python/katana_patch_tool.py apply \
  --port hw:1,0,0 \
  --patch setups/variations/mixed/manual-brit-hybrid-rat-20260323-184750/snapshot.json
```

```bash
# Program exactly 5 consecutive slots from 5 snapshots, then verify
python3 python/katana_patch_tool.py setup-5 \
  --port hw:1,0,0 \
  --start-slot 1 \
  --patch setups/variations/good/solid-clean-20260324-134019/snapshot.json \
  --patch setups/variations/level-matched/coxon-character-safe-quieter-v02-20260324-135740/snapshot.json \
  --patch setups/variations/mixed/mild-comp-clean-v02-gain50-20260324-132649/snapshot.json \
  --patch setups/variations/by-amp/manual-franz-ferdinand-v2-20260323-184319/snapshot.json \
  --patch setups/variations/by-pedal/manual-90s-20260323-182418/snapshot.json \
  --verify-end
```

```bash
# Cycle those 5 slots while auditioning
python3 python/katana_patch_tool.py cycle-5 \
  --port hw:1,0,0 \
  --start-slot 1 \
  --dwell-sec 2.0 \
  --cycles 3
```

```bash
# Special active mode (dedicated verb): match slots 2..5 loudness to slot 1
python3 python/katana_patch_tool.py match-5
```

```bash
# Full amp-state download (all channels), saved to dated cache JSON by default
python3 python/katana_patch_tool.py dump-amp-state --port hw:1,0,0
```

```bash
# Full amp-state download with explicit output path
python3 python/katana_patch_tool.py dump-amp-state \
  --port hw:1,0,0 \
  --out setups/backups/amp-state-manual.json
```

When `match-5` starts, it prompts:
- enter a numeric RMS dBFS target to force a manual target, or
- press Enter to use slot 1 as the reference.

`match-5` now prints live progress with measured/target/error on each update and uses faster defaults
for quicker convergence.

```bash
# Fast USB MIDI connection sanity check (identity + editor mode readback)
python3 python/katana_patch_tool.py test-connection --port hw:1,0,0
```

```bash
# Optional: include a specific slot probe
python3 python/katana_patch_tool.py test-connection --port hw:1,0,0 --slot 1 --json
```

```bash
# Print fully decoded pipeline for all channels A:1..B:4 (default)
# Shows a live \r spinner while fetching blocks
# Type fields are name-decoded (example: RAT(14), CHORUS(23), DIGITAL(0))
# OFF blocks are hidden by default
python3 python/katana_patch_tool.py pipeline
```

```bash
# Render pipeline view from a saved full-state dump file (no live amp query)
python3 python/katana_patch_tool.py pipeline \
  --dump-file setups/backups/amp-state-YYYYMMDD-HHMMSS.json
```

```bash
# Force ANSI colour output in terminal
python3 python/katana_patch_tool.py pipeline --color always
```

```bash
# Print a single slot pipeline (faster, scoped)
python3 python/katana_patch_tool.py pipeline --slot 3 --color always
```

```bash
# Print all channels pipeline as JSON (machine-readable)
python3 python/katana_patch_tool.py pipeline --all-channels --json
```

```bash
# Include OFF blocks in text output
python3 python/katana_patch_tool.py pipeline --show-off --color always
```

```bash
# Print pipeline for a specific slot as JSON (machine-readable)
python3 python/katana_patch_tool.py pipeline --slot 3 --json
```

Decoded name tables are loaded from BTS `resource.js` and cached locally at:
- `python/.cache/decode_tables.json`

```bash
# Sample USB level in 1-second windows and write JSONL
python3 python/katana_patch_tool.py sample \
  --source alsa_input.usb-Roland_KATANA3-01.analog-surround-40 \
  --window-sec 1.0 \
  --samples 20 \
  --log-file setups/analysis/level_log.jsonl
```

```bash
# Auto-level one or more snapshots by AMP VOLUME
# Default behavior:
# 1) bypass stomp blocks for core gain match,
# 2) restore active blocks progressively and trim.
python3 python/katana_patch_tool.py level \
  --port hw:1,0,0 \
  --patch setups/variations/mixed/manual-brit-hybrid-rat-20260323-184750/snapshot.json \
          setups/variations/by-pedal/manual-90s-20260323-182418/snapshot.json \
  --target-dbfs -29.0 \
  --window-sec 1.0 \
  --measure-seconds 6
```

```bash
# Legacy/full-chain mode (disable staged bypass workflow)
python3 python/katana_patch_tool.py level \
  --port hw:1,0,0 \
  --patch setups/variations/mixed/manual-brit-hybrid-rat-20260323-184750/snapshot.json \
  --no-bypass-stomps
```

## Library Surface

`python/katana/` exports:

- `AmidiTransport` for async SysEx send/read,
- `KatanaPatch` snapshot model,
- `pull_patch()` and `apply_patch()`,
- `PipeWireSampler` and `auto_level_patch()`,
- `load_patch()` and `save_patch()`.
