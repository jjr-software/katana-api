# Agent Session Notes

## Hard Rule: Web Build/Run Path
- Do not run host-local frontend tooling (`npm run ...`, `ng ...`) for this repo.
- Web build/verification must use the containerized path only (`docker compose ...`).
- If host tooling is missing, fail hard and switch to Compose; do not use host fallbacks.
- After each code change, always rebuild and restart the stack with:
  - `docker compose up -d --build`

## Scope
- Date: 2026-03-22
- Device under test: BOSS/Roland KATANA Gen 3 over USB MIDI
- Goal: verify manual SysEx control/readback and identify working command flow

## What Was Confirmed
- Katana is visible to host:
  - `lsusb`: `0582:02f0 Roland Corp. KATANA3`
  - `amidi -l`: `hw:1,0,0  KATANA3 MIDI 1`
- Raw read/write SysEx works through `amidi`.
- `EDITOR_COMMUNICATION_MODE` must be `1` for reliable live control.
  - Before enabling it, many commands appeared to have no audible effect.
  - After enabling it, patch switching became audible and reliable.

## Key Readback Examples
- Identity request works:
  - Sent: `F0 7E 7F 06 01 F7`
  - Reply: `F0 7E 10 06 02 41 07 05 00 00 06 00 00 00 F7`
- Editor communication mode readback:
  - RQ1: `F0 41 10 01 05 07 11 7F 00 00 01 00 00 00 01 7F F7`
  - DT1 reply value observed: `00` (off), then `01` (on) after write
- GA-FC connected and detected:
  - RQ1: `F0 41 10 01 05 07 11 7F 01 02 02 00 00 00 01 7B F7`
  - Reply observed: `... 7F 01 02 02 03 ...`

## Commands Used Successfully
- Turn editor mode ON:
  - `F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7`
- Patch select (worked audibly after editor mode ON):
  - A:CH1: `F0 41 10 01 05 07 12 7F 00 01 00 00 01 7F F7`
  - A:CH2: `F0 41 10 01 05 07 12 7F 00 01 00 00 02 7E F7`
  - A:CH3: `F0 41 10 01 05 07 12 7F 00 01 00 00 03 7D F7`

## LINE OUT Investigation
- Parameters were read/written successfully:
  - `LINEOUT_COM%0` at `0x10001800`
  - `LINEOUT_COM%1` (AIR FEEL mode) at `0x10001801`
  - `LINEOUT_COM%2` at `0x10001802`
  - `LINEOUT(1)%4` ambience at `0x10001A04`
  - `LINEOUT(2)%4` ambience at `0x10001C04`
- AIR FEEL options in extracted resources: `REC, LIVE, BLEND`.
- Writes and readbacks were consistent, but audible impact depended on active mode/path.

## Extracted Source Location (for protocol map)
- `manual-extract/installer_extracted/localappdata/Roland/BOSS TONE STUDIO for KATANA Gen 3/html/js/config/address_map.js`
- `manual-extract/installer_extracted/localappdata/Roland/BOSS TONE STUDIO for KATANA Gen 3/html/js/businesslogic/bts/address_const.js`
- `manual-extract/installer_extracted/localappdata/Roland/BOSS TONE STUDIO for KATANA Gen 3/html/js/common/midi_controller.js`
- `manual-extract/installer_extracted/localappdata/Roland/BOSS TONE STUDIO for KATANA Gen 3/html/js/config/product_setting.js`

## Practical Note
- For manual host testing, this pattern worked well:
  - `amidi -p hw:1,0,0 -S "<SYSEX_HEX>"`
  - `amidi -p hw:1,0,0 -d -t 2 -S "<RQ1_SYSEX_HEX>"`

## Session Signposting
- Keep this file updated at the end of meaningful work sessions.
- Add one dated entry per session with:
  - what was discovered/changed,
  - where key files/commands live,
  - current status and next recommended step.

## Session Update - 2026-03-24
- Confirmed patch tool exists and is active at:
  - `python/katana_patch_tool.py`
- Current CLI surface:
  - `save` (read amp state to snapshot JSON),
  - `pull` (alias of `save`),
  - `apply` (apply snapshot JSON to amp),
  - `level` (auto-level patch snapshots),
  - `sample` (USB level sampling to console/JSONL).
- Command docs are in:
  - `python/README.md`
- Suggested next session starting point:
  - run one end-to-end smoke command (for example `pull` or `apply`) before deeper changes.
- `save` command run confirmed on host MIDI:
  - `python3 python/katana_patch_tool.py --port hw:1,0,0 save --out setups/backups/current-patch-backup-YYYYMMDD-HHMMSS.json`
  - Snapshot written: `setups/backups/current-patch-backup-20260324-131043.json`
- Bugfix recorded:
  - File: `python/katana/sysex.py`
  - `build_rq1()` size encoding corrected from 3-byte to Roland 4-byte size field (`00 00 00 NN` style).
  - Symptom before fix: `No DT1 response` during `pull/save` despite manual `amidi` reads working.

## Session Update - 2026-03-24 (Live FFT Check While Playing)
- Current live patch was backed up before capture:
  - `setups/backups/current-patch-backup-20260324-131352.json`
- Core patch values at capture time:
  - `amp`: `[44,75,45,65,45,50,1,1,0,0]`
  - `booster`: `[13,100,49,48,0,50,50,0]`
  - `ge10_raw`: `[24,24,24,24,24,24,24,24,24,24,24]`
  - `ns`: `[0,50,50]`
  - `dry_default`: `true`
- Matching against `setups/variations/**/snapshot.json`:
  - Exact matches: `0` (current state appears to be a distinct live state).
- Amp block manual readback succeeded during this session:
  - RQ1: `F0 41 10 01 05 07 11 20 00 06 00 00 00 00 0A 50 F7`
  - DT1: `F0 41 10 01 05 07 12 20 00 06 00 2C 4B 2D 41 2D 32 01 01 00 00 14 F7`
- FFT capture performed while user played:
  - WAV: `setups/recordings/katana_take_20260324-131457_active.wav`
  - TXT: `setups/analysis/fft_20260324-131457_active.txt`
  - JSON: `setups/analysis/fft_20260324-131457_active.json`
  - Active RMS: `-21.385 dBFS`
  - Active Peak: `-11.34 dBFS`
  - Crest Factor: `10.045 dB`
  - Spectral Centroid: `216.852 Hz`
  - 95% Rolloff: `249.023 Hz`
  - Band power %:
    - `bass_40_250`: `95.568%`
    - `low_mid_250_500`: `1.428%`
    - `mid_500_2k`: `1.458%`
    - `high_mid_2k_6k`: `1.546%`
    - `presence_6k_12k`: `0.001%`
    - `air_12k_20k`: `0.0%`

## Session Update - 2026-03-24 (Patch Load)
- Applied Coxon keeper baseline patch to amp:
  - `setups/variations/by-pedal/coxon-keeper/base-manual-90s-graham-coxon-20260323-182512/snapshot.json`
- Command used:
  - `python3 python/katana_patch_tool.py --port hw:1,0,0 apply --patch <snapshot>`

## Session Update - 2026-03-24 (Coxon vs Original Consistency Check)
- Capture on Coxon keeper (while playing):
  - WAV: `setups/recordings/katana_take_20260324-131856_active.wav`
  - JSON: `setups/analysis/fft_20260324-131856_active.json`
  - RMS/Peak: `-24.891 / -14.238 dBFS`
  - Centroid/Roll95: `881.150 / 3708.984 Hz`
  - Bands: bass `56.436%`, low-mid `15.892%`, mid `9.114%`, high-mid `18.520%`
- Re-applied original patch backup:
  - `setups/backups/current-patch-backup-20260324-131352.json`
- Capture on reloaded original (while playing):
  - WAV: `setups/recordings/katana_take_20260324-131925_active.wav`
  - JSON: `setups/analysis/fft_20260324-131925_active.json`
  - RMS/Peak: `-21.884 / -11.328 dBFS`
  - Centroid/Roll95: `332.376 / 981.445 Hz`
  - Bands: bass `68.130%`, low-mid `25.386%`, mid `2.822%`, high-mid `3.645%`
- Original-vs-original consistency against earlier run (`fft_20260324-131457_active.json`):
  - Level is close (`RMS delta -0.499 dB`, `Peak delta +0.012 dB`).
  - Spectral shape changed significantly (earlier was much more sub/bass heavy: `95.568%` in `40-250 Hz`; rerun is `68.130%`).
  - Implication: playing variation/pick attack/string choice has a large effect; for tighter patch profiling, capture a fixed riff with near-identical articulation across takes.

## Session Update - 2026-03-24 (New Patch Idea: Mild Comp Clean v01)
- Goal from user: mild compression feel for cleaner RHCP/chilli-style tone.
- Constraint: current patch toolkit does not expose an explicit compressor pedal type index; used a `clean-boost` based approximation.
- Created snapshot:
  - `setups/variations/mixed/mild-comp-clean-v01-20260324-132202/snapshot.json`
- Applied snapshot to amp.
- Key settings:
  - `amp`: `[22,75,42,62,58,54,1,1,0,0]`
  - `booster` (`clean-boost`): `[1,18,50,45,0,50,58,0]`
  - `dry_default`: `true`

## Session Update - 2026-03-24 (Quick Level-Match Attempts)
- User requested keeping patch loudness consistent across ideas.
- Method used:
  - baseline meter pass on original patch with `katana_patch_tool.py sample` (6 x 1s windows),
  - then `katana_patch_tool.py level` targeting baseline RMS.
- Baseline pass (original patch) measured near `-21.9 dBFS` RMS on PipeWire source `alsa_input.usb-Roland_KATANA3-01.analog-surround-40`.
- Two leveler runs on `mild-comp-clean-v01` measured very low RMS (`~ -39 dBFS`) and pushed `amp_volume` to `100` in generated level-matched snapshots:
  - `setups/variations/level-matched/mild-comp-clean-v01-20260324-132202-lvl-20260324-132326/snapshot.json`
  - `setups/variations/level-matched/mild-comp-clean-v01-20260324-132202-lvl-20260324-132504/snapshot.json`
- Safety/reset:
  - Re-applied base `mild-comp-clean-v01` snapshot (`amp_volume=75`) after each run to avoid leaving the amp at max output.

## Session Update - 2026-03-24 (Clean Loudness Rule)
- Critical finding from user testing:
  - In clean modes with low amp gain, usable loudness is hard to achieve.
  - Working rule: keep clean patch gain around `50` as a floor for practical output level.
- Created and applied variant:
  - `setups/variations/mixed/mild-comp-clean-v02-gain50-20260324-132649/snapshot.json`
- v02 key change:
  - `amp` moved to `[50,68,42,62,58,54,1,1,0,0]` (gain raised to `50`, amp volume re-centered).

## Session Update - 2026-03-24 (Locked Good Patch + New Reference dB)
- User requested this current state be tracked as a "good patch" and used to set a new dB reference.
- Saved good patch snapshot:
  - `setups/variations/good/solid-clean-20260324-134019/snapshot.json`
- Readable state at save time:
  - `amp`: `[46,82,50,50,51,54,1,1,0,0]`
  - `booster`: `[1,18,50,45,0,50,58,0]` (`clean-boost`)
  - `ge10_raw`: `[24,24,24,24,24,24,24,24,24,24,24]`
  - `ns`: `[0,50,50]` (off)
- New reference capture (while playing, `--set-reference`):
  - WAV: `setups/recordings/katana_take_20260324-134037_active.wav`
  - JSON: `setups/analysis/fft_20260324-134037_active.json`
  - Reference file updated: `setups/analysis/db_reference.json`
  - New target values:
    - `target_rms_dbfs`: `-27.98`
    - `target_peak_dbfs`: `-17.825`
  - Label: `solid-clean-20260324-134019`

## Session Update - 2026-03-24 (Coxon Volume-Right, Character-Safe)
- User requirement: for character patches (example: Coxon), avoid changing gain to preserve tone character; treat loudness with volume controls.
- Procedure run:
  - Loaded base Coxon keeper patch:
    - `setups/variations/by-pedal/coxon-keeper/base-manual-90s-graham-coxon-20260323-182512/snapshot.json`
  - Level-matched to current reference target (`-27.98 dBFS`) in two passes.
- Final applied snapshot:
  - `setups/variations/level-matched/base-manual-90s-graham-coxon-20260323-182512-lvl-20260324-134432-lvl-20260324-134453/snapshot.json`
- Final convergence record:
  - `mean_rms_dbfs: -27.383`, `error_db: -0.597`, status `within_tolerance`.
- Final key params:
  - `amp`: `[28,59,32,76,52,30,0,1,1,0]`
  - `booster`: `[13,74,36,62,0,50,70,0]`

## Session Update - 2026-03-24 (PipeWire A/B Swap RMS Utility)
- Added utility:
  - `setups/analysis/ab_swap_rms.py`
- Purpose:
  - alternate two patches repeatedly,
  - measure RMS per patch using PipeWire stream windows,
  - report per-cycle and mean `delta(B-A)` in dB.
- Example:
  - `python3 setups/analysis/ab_swap_rms.py --patch-a <patchA.json> --patch-b <patchB.json> --cycles 4 --windows-per-patch 4 --window-sec 1.0 --settle-sec 1.0 --source alsa_input.usb-Roland_KATANA3-01.analog-surround-40 --report-json setups/analysis/ab_swap_report.json`

## Session Update - 2026-03-24 (A/B Level Iteration: Clean vs Coxon)
- A/B measurement run (PipeWire swap utility):
  - A: `setups/variations/good/solid-clean-20260324-134019/snapshot.json`
  - B: `setups/variations/level-matched/coxon-character-safe-quieter-v01-20260324-134611/snapshot.json`
  - Report: `setups/analysis/ab_swap_report_clean_vs_coxon_v01.json`
  - Mean delta (`B - A`): `+0.232 dB` (Coxon slightly louder).
- Fine trim created:
  - `setups/variations/level-matched/coxon-character-safe-quieter-v02-20260324-135740/snapshot.json`
  - Change: `amp_volume -1` (character-safe trim).
- Quick verify run:
  - Report: `setups/analysis/ab_swap_report_clean_vs_coxon_v02.json`
  - One cycle showed low/quiet clean playing (outlier); stable cycle indicates Coxon still about `+0.5 dB` louder.
- Current applied working patch: `coxon-character-safe-quieter-v02`.
- Re-run with controlled playing:
  - Report: `setups/analysis/ab_swap_report_clean_vs_coxon_v02_rerun.json`
  - Mean delta (`B - A`): `-0.031 dB` (effectively matched).

## Session Update - 2026-03-24 (Session Folder + Slot Write Limitation)
- Created session folder for today:
  - `setups/variations/session-20260324/`
- Added files:
  - `slot1-before-fix-snapshot.json` (backup before attempted correction)
  - `slot1-gain50-clean-snapshot.json` (intended gain-50 clean target)
- Critical behavior observed:
  - `katana_patch_tool.py apply --slot N` updates the current edit buffer, but did not persist to GA-FC channel memory in this test.
  - Verification after apply+reselect on slot 1 still read old patch values (`gain=80`, `volume=85`).

## Session Update - 2026-03-24 (Write/Read/Verify Bug Found + Fixed)
- Hard gate test established:
  - write -> read verify on live buffer (pass),
  - store to slot -> reselect -> read verify (initially flaky in CLI, then fixed).
- Root cause:
  - Toolchain lacked the BTS `PATCH_WRITE` commit command (`0x7F000104`), so slot memory was not being committed.
  - After adding commit, immediate verify could race the device write completion.
- Fixes implemented:
  - `python/katana/midi.py`: added `PATCH_WRITE_ADDR` and `write_patch(slot)`.
  - `python/katana/patch_ops.py`: `apply_patch(..., store=True)` now commits slot memory and adds short settle delay.
  - `python/katana_patch_tool.py`: `apply` gained `--store` and `--verify`.
- Verified command (pass):
  - `python3 python/katana_patch_tool.py --port hw:1,0,0 apply --slot 1 --store --verify --patch setups/variations/session-20260324/slot1-gain50-clean-snapshot.json`
  - Output: `Verify OK: amp/booster/ge10/ns readback matches snapshot`

## Session Update - 2026-03-24 (Speed-Up for Multi-Slot Programming)
- Added fast batch command:
  - `katana_patch_tool.py apply-batch --slot-patch SLOT=PATH ...`
- Purpose:
  - write/store multiple slots in one run without expensive per-slot verify overhead.
- Optional end-check:
  - add `--verify-end` to verify all programmed slots after batch write.

## Session Update - 2026-03-24 (Five-Slot Workflow Verbs)
- Added two new CLI verbs in `python/katana_patch_tool.py`:
  - `setup-5`: programs exactly five consecutive slots from five `--patch` snapshot paths, stores each slot, optional `--verify-end`, and writes a manifest JSON.
  - `cycle-5`: cycles across five consecutive slots for auditioning (`--dwell-sec`, `--cycles`).
- Kept CLI on `argparse` with `asyncio` coroutine handlers.
  - Reason: Typer was considered, but this host currently has no Typer runtime dependency installed and the existing async-first flow remains simpler/reliable with zero extra package requirement.
- Docs updated:
  - `python/README.md` now includes `setup-5` and `cycle-5` examples and the CLI framework note.

## Session Update - 2026-03-24 (Special Active Mode: Cycle Loudness Match)
- Extended `cycle-5` with an active loudness-match mode:
  - flag: `--active-match`
  - behavior: uses the first slot in the cycle as reference, then adjusts `AMP VOLUME` on the other 4 slots until each is within tolerance of reference RMS.
- Key options added:
  - `--measure-seconds`, `--match-tol-db`, `--max-match-iters`, `--match-step-scale`, `--match-max-step`,
  - `--active-floor-dbfs`, `--source`, `--rate`, `--channels`, `--window-sec`, `--settle-sec`,
  - `--store` to persist matched values to slot memory,
  - `--report-json` for run report output.
- Docs updated:
  - `python/README.md` includes a concrete `cycle-5 --active-match` command example.

## Session Update - 2026-03-24 (Dedicated Match Verb)
- Per workflow simplification request, matching logic now has its own dedicated verb:
  - `match-5`
- `cycle-5` is now audition-only again (no matching flags/behavior).
- `match-5` defaults:
  - reference is slot 1 of the selected 5-slot block (`--start-slot`, default `1`),
  - uses active RMS matching and adjusts AMP VOLUME on slots 2..5,
  - stores matched values by default (disable with `--no-store`),
  - writes a timestamped report under `setups/analysis/match5_report_*.json`.

## Session Update - 2026-03-24 (Manual Target Input for Match Verb)
- `match-5` now prompts at runtime for target RMS:
  - user can enter a numeric dBFS value to use as manual target, or
  - press Enter to fall back to slot-1 reference sampling.
- This keeps the one-verb workflow while allowing manual target entry without extra CLI flags.

## Session Update - 2026-03-24 (Match-5 Speed + Live Measured Output)
- Updated `match-5` progress output to include measured/target/error on every iteration.
- Updated slot labels in active matching logs to `A:1..A:5` for the five-slot set.
- Improved speed defaults:
  - measure window reduced (`2.0s` total using `0.5s` windows),
  - settle delay reduced to `0.25s`,
  - more iterations allowed (`8`) for faster but still convergent behavior.
- Matching now applies live edits per iteration and only stores once at final per slot (when store is enabled), reducing write latency and avoiding repeated commit overhead.

## Session Update - 2026-03-24 (Greenwood Pack on A:1..A:4)
- Loaded four Greenwood-focused snapshots to slots `A:1..A:4` from:
  - `setups/variations/session-20260324/greenwood-pack-1-4/a1-greenwood-dry-base.json`
  - `setups/variations/session-20260324/greenwood-pack-1-4/a2-greenwood-eq-shaped.json`
  - `setups/variations/session-20260324/greenwood-pack-1-4/a3-guvds-manual-90s-greenwoodish.json`
  - `setups/variations/session-20260324/greenwood-pack-1-4/a4-greenwood-dry-bright-cut.json`
- Note:
  - `apply-batch --verify-end` reported a verify mismatch immediately after write,
  - direct slot audit afterwards confirmed stored values on slots 1..4 match expected patch payloads.

## Session Update - 2026-03-24 (Pipeline Utilities Foundation)
- Added dedicated pipeline library:
  - `python/katana/pipeline.py`
- New capabilities:
  - reads patch routing and stage blocks using BTS address map layout,
  - reports on/off and key values for amp, booster, mod, fx, delay, delay2, reverb, eq1/eq2, ns, send/return, solo, pedalfx,
  - includes selected color/type context and raw block values.
- Added CLI verb:
  - `python3 python/katana_patch_tool.py pipeline`
  - optional: `--slot N` and `--json`.
- `match-5` now captures this pipeline report per slot and prints stage details before matching that slot.

## Session Update - 2026-03-24 (Fast Connection Sanity Verb)
- Added dedicated connectivity verb:
  - `python3 python/katana_patch_tool.py test-connection`
- Purpose:
  - fast Katana USB MIDI sanity check without the heavier `pipeline` read sweep,
  - checks identity reply, forces editor mode on, verifies editor mode readback (`0x7F000001`),
  - optional slot probe with `--slot N` to validate patch select + amp-block read.
- Files changed:
  - `python/katana_patch_tool.py`
  - `python/README.md`
- Practical usage:
  - quick check: `python3 python/katana_patch_tool.py --port hw:1,0,0 test-connection`
  - with slot probe JSON: `python3 python/katana_patch_tool.py --port hw:1,0,0 test-connection --slot 1 --json`

## Session Update - 2026-03-24 (Pipeline Output Decode + Colour)
- Enhanced pipeline text output to be fully decoded for inspected blocks:
  - includes named per-byte fields for amp, booster, mod, fx, delay, delay2, reverb, eq1/eq2, ns, send/return, solo, pedalfx.
  - GE10 now includes centered step view (`value-24`) for quick reading.
- Added pipeline colour control:
  - `--color auto|always|never` (default `auto`).
  - useful on hosts where stdout is not detected as TTY (`--color always`).
- Files changed:
  - `python/katana/pipeline.py`
  - `python/katana_patch_tool.py`
  - `python/README.md`

## Session Update - 2026-03-24 (Python Toolkit Moved To Repo Root)
- Relocated toolkit directory:
  - from `setups/python/` to `python/` at repository root.
- Canonical CLI path is now:
  - `python3 python/katana_patch_tool.py ...`
- Updated path references in docs/session notes accordingly.

## Session Update - 2026-03-24 (Pipeline Spinner + Full Channel Fetch)
- Added npm-style live status spinner for pipeline fetch progress:
  - uses `\r` animation and updates messages as each block is read.
- Added progress hooks in pipeline reader:
  - reports what is being fetched (routing, colors, amp, variants, EQ, NS, etc.).
- Added full channel fetch mode:
  - `pipeline` now defaults to downloading and printing all channels `A:1..B:4` when `--slot` is omitted.
  - single-slot scoped read remains available with `--slot N`.
- Files changed:
  - `python/katana/pipeline.py`
  - `python/katana_patch_tool.py`
  - `python/katana/__init__.py`
  - `python/README.md`

## Session Update - 2026-03-24 (Pipeline Type Name Decode + Local Cache)
- Added decoded type-name rendering in pipeline text output:
  - example fields now render as `type=RAT(14)`, `type=CHORUS(23)`, `type=DIGITAL(0)`, etc.
  - applied to amp type, booster type, mod/fx type, delay type, reverb type/layer mode, EQ type, send/return mode+position, pedal-fx type, and chain pattern.
- Added BTS resource parser + local cache:
  - new module: `python/katana/decode.py`
  - source table: `manual-extract/.../html/js/config/resource.js`
  - cache file: `python/.cache/decode_tables.json`
  - cache invalidates automatically when the source file size/mtime changes.

## Session Update - 2026-03-24 (Pipeline OFF Filtering Switch)
- Pipeline text output now hides OFF blocks by default for cleaner reading.
- Added CLI switch to include them when needed:
  - `python3 python/katana_patch_tool.py pipeline --show-off`
- JSON output behavior is unchanged (full payload still available with `--json`).

## Session Update - 2026-03-24 (Full Amp-State Download Command)
- Added new CLI verb for full download + dated cache:
  - `python3 python/katana_patch_tool.py dump-amp-state`
- Behavior:
  - fetches full pipeline payload for all slots/channels `A:1..B:4`,
  - writes timestamped JSON by default to:
    - `setups/backups/amp-state-YYYYMMDD-HHMMSS.json`
  - supports custom output path via `--out`.

## Session Update - 2026-03-24 (Leveling Rule: Stomp Bypass Then Restore)
- `level` workflow now applies a staging rule aligned with physical pedal-chain gain logic:
  - core loudness match runs with stomp-style blocks bypassed,
  - then previously-active blocks are restored progressively one-by-one,
  - AMP volume is trimmed during restore so final level remains controlled.
- New level flags:
  - `--no-bypass-stomps` to keep full chain active throughout,
  - `--no-progressive-restore` to restore all blocks in one step.
- Core files updated:
  - `python/katana/patch_ops.py` (stage-state read/write/bypass helpers)
  - `python/katana/leveling.py` (staged leveling algorithm)
  - `python/katana_patch_tool.py` (CLI flags wiring)

## Session Update - 2026-03-24 (Pipeline Reads From Dump File)
- Added offline source option for pipeline rendering:
  - `python3 python/katana_patch_tool.py pipeline --dump-file <amp-state.json>`
- Behavior:
  - renders the same decoded pipeline output from a saved `dump-amp-state` JSON file,
  - supports `--slot`, `--json`, `--show-off`, `--color` in dump-file mode,
  - avoids live MIDI reads when you want to inspect cached snapshots.

## Session Update - 2026-03-25 (Flattened `by-pedal` Structure)
- Removed pedal-type category nesting under:
  - `setups/variations/by-pedal/<pedal-type>/<variation>/...`
- New canonical layout is flat:
  - `setups/variations/by-pedal/<variation>/...`
- Existing variation folders were moved up one level (no name collisions found).
- Updated path references in docs/scripts/state JSON and level-matched metadata where old nested paths were embedded.
- Updated generators so new runs stay flat:
  - `setups/variations/by-pedal/random_pedal_pick.py`
  - `setups/variations/by-pedal/intentional_pedal_cycle.py`
- Updated `setups/variations/by-pedal/README.md` to document flat naming convention and metadata-in-JSON rule.

## Session Update - 2026-03-25 (.gitignore Expansion for Python Workflow)
- Expanded repository root `.gitignore` from minimal entries to a fuller Python-oriented baseline.
- Added ignores for:
  - Python caches/bytecode, virtualenvs, packaging/build artifacts, test/coverage outputs, editor/OS clutter.
  - Repo-local generated outputs from current workflow:
    - `python/.cache/`
    - `setups/backups/`
    - `setups/recordings/`
    - `setups/analysis/*.json`
    - `setups/analysis/*.txt`
- Kept patch/snapshot sources under `setups/variations/**` unaffected.

## Session Update - 2026-03-26 (Per-Slot Refresh + Sync Buttons)
- Added dedicated quick-refresh API for a single slot:
  - `POST /api/v1/amp/slots/{slot}/quick`
  - reads only patch name for the selected slot and returns quick match metadata.
- Added backend client helper:
  - `AmpClient.read_slot_name_quick(slot, synced_at)`
- Updated web slot cards (both banks) to include two per-slot controls:
  - `Refresh` (quick name-only refresh)
  - `Sync` (full per-slot sync with config hash)
- Files changed:
  - `apps/api/app/katana/client.py`
  - `apps/api/app/api/amp.py`
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
  - `apps/web/src/app/app.css`
- Containerized verification run:
  - `docker compose build api web` succeeded.

## Session Update - 2026-03-26 (Slot Card Simplification)
- Removed per-slot card display fields from web UI:
  - `Hash`
  - `Match`
- Kept per-slot controls and timing metadata:
  - `Refresh`, `Sync`, `Last Sync`
- File changed:
  - `apps/web/src/app/app.html`
- Containerized verification run:
  - `docker compose build web` succeeded.

## Session Update - 2026-03-26 (Refresh/Sync Parity + Quick Sync Route Fix)
- Per-slot `Refresh` now uses the exact same full sync flow as per-slot `Sync` in the web UI.
- Removed the added per-slot quick endpoint and helper:
  - removed `POST /api/v1/amp/slots/{slot}/quick`
  - removed `AmpClient.read_slot_name_quick(...)`
- Reason:
  - the dynamic route `POST /api/v1/amp/slots/{slot}/sync` could capture `POST /api/v1/amp/slots/quick/sync`, breaking `Quick Sync Names`.
- Verified route table no longer includes the per-slot quick route and still includes:
  - `POST /api/v1/amp/slots/quick/sync`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Single Per-Slot Action Button)
- Simplified slot cards to one per-slot action button only:
  - kept `Sync`
  - removed duplicate `Refresh` button
- Removed now-unused UI code/styling tied to dual-button layout:
  - removed `refreshAmpSlot(...)` from `apps/web/src/app/app.ts`
  - removed `.slot-actions` styles from `apps/web/src/app/app.css`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Queue Panel Moved To Left Column)
- Updated web app layout to place the queue monitor on the left-hand side instead of stacking it above cards.
- Introduced a two-column workspace shell:
  - left: sticky queue panel (`Queue Monitor`)
  - right: actions, sync metadata, status, and both bank card grids
- Added responsive fallback:
  - below `980px`, layout collapses back to a single vertical column.
- Files changed:
  - `apps/web/src/app/app.html`
  - `apps/web/src/app/app.css`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Load Amp State Naming + Full-Height Queue)
- Renamed web UI wording from `Backup Amp State` to `Load Amp State` while keeping the same queued backend endpoints.
- Updated user-facing status and job messages to use `Load amp state` language.
- Increased left queue panel to use vertical space on desktop:
  - queue panel now fills viewport height and scrolls internally.
  - responsive behavior keeps auto-height on smaller screens.
- Files changed:
  - `apps/web/src/app/app.html`
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.css`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Unsynced Slot Action Gating Tightened)
- Tightened slot action enablement in web UI:
  - `Save`, `Sample`, and `Raw` now require both:
    - a full patch payload loaded, and
    - slot state `in_sync = true`.
- Outcome:
  - unsynced slots keep `Sync` as the only usable action path.
- File changed:
  - `apps/web/src/app/app.ts`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Small-Screen Queue Hide + Single-Card Flow)
- Updated responsive web layout for small screens (`max-width: 980px`):
  - hide left queue column entirely,
  - switch slot cards container to flex-wrap flow with one card per row (`flex: 1 1 100%`).
- Outcome:
  - mobile/smaller displays now prioritize the patch cards in a vertical one-at-a-time flow.
- File changed:
  - `apps/web/src/app/app.css`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Bootstrap 5 Migration For Web Layout)
- Migrated the web UI layout to Bootstrap 5 utilities/components to replace custom layout/css that was causing overflow/jank.
- Key changes:
  - app shell rebuilt with Bootstrap grid (`row`/`col-*`) and cards/buttons/badges,
  - queue panel integrated as Bootstrap card with sticky behavior on `xl+`,
  - queue hidden below `xl`,
  - patch cards now use responsive Bootstrap columns (`col-12`, `col-md-6`, `col-xxl-4`),
  - reduced app-specific CSS to narrow overrides only (sync border colors, queue scroll area, modal styling),
  - renamed custom modal classes to avoid Bootstrap `.modal` class conflicts.
- Added Bootstrap stylesheet via CDN import in global styles:
  - `@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");`
- Files changed:
  - `apps/web/src/app/app.html`
  - `apps/web/src/app/app.css`
  - `apps/web/src/styles.css`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Queue Narrower + 4-Wide Patch Grid)
- Adjusted Bootstrap column widths on desktop (`xl+`):
  - queue column narrowed from `col-xl-3` to `col-xl-2`,
  - main patch area widened from `col-xl-9` to `col-xl-10`.
- Forced patch cards to render 4 per row at desktop widths:
  - card columns changed to `col-xl-3`.
- File changed:
  - `apps/web/src/app/app.html`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Disable Sync/Save When Slot Already Synced + Saved)
- Updated slot button gating logic in web UI:
  - `Sync` is disabled when a slot is both `in_sync` and `is_saved`.
  - `Save` is disabled when a slot is both `in_sync` and `is_saved`.
  - Existing requirements remain:
    - `Save` still requires full patch payload + `in_sync`.
    - `Sample` and `Raw` continue using existing action gating.
- Files changed:
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Docs Consolidated To Single Forward Plan)
- Retired overlapping docs and consolidated planning into one authoritative implementation document:
  - added `docs/forward-implementation.md`
  - removed:
    - `docs/hash-first-patch-platform-design.md`
    - `docs/webapp-implementation-plan.md`
- New doc includes:
  - hash-first invariants,
  - done vs partial vs pending status,
  - phased forward roadmap,
  - immediate next sprint checklist.
- Follow-up clarification added:
  - explicitly states `patch_set_slot_assignments` is a junction table between `patch_sets` and `patch_configs` with `slot` and unique `(patch_set_id, slot)`.

## Session Update - 2026-03-26 (Audio Level Marker Feature)
- Added first-class audio level marker support.
- Backend:
  - `audio_samples` now includes `is_level_marker` flag.
  - New Alembic migration:
    - `apps/api/alembic/versions/20260326_0003_audio_level_marker.py`
  - New API endpoints:
    - `POST /api/v1/audio/marker/capture` (captures audio sample and marks it as the active level marker)
    - `GET /api/v1/audio/marker` (returns latest active marker)
  - Marker capture clears previous marker flags before setting the new one.
- Frontend:
  - Added `Set Level Marker` action button in header.
  - Added marker display in sync metadata area:
    - RMS/Peak marker values
    - marker capture timestamp
  - On app init, UI loads existing marker if present.
- Files changed:
  - `apps/api/app/models.py`
  - `apps/api/app/api/audio.py`
  - `apps/api/alembic/versions/20260326_0003_audio_level_marker.py`
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
- Runtime updates:
  - `docker compose up -d --build`
  - `docker compose exec -T api alembic upgrade head`

## Session Update - 2026-03-26 (One-Click 5s RMS Cycle Across All Slots)
- Added a new web action button:
  - `Measure 5s RMS (All Slots)`
- Behavior:
  - iterates slots `1..8` sequentially,
  - for each slot:
    - performs queued full slot sync (`POST /api/v1/amp/slots/{slot}/sync`),
    - captures a 5-second audio sample (`POST /api/v1/audio/sample` with `duration_sec=5.0`),
    - stores measured RMS dBFS and timestamp on that slot card.
- UI additions on each patch card:
  - `5s RMS` value,
  - `RMS At` timestamp.
- State handling:
  - cycle button disables while a cycle is running,
  - measured RMS values are preserved across quick/full state refresh merges in the UI model.
- Files changed:
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Terminology Split: Measure vs Demo Sample)
- Clarified feature semantics:
  - current per-slot and cycle functionality is RMS **measurement**, not demo recording.
- Renamed measurement API paths:
  - `POST /api/v1/audio/measure`
  - `GET /api/v1/audio/measures`
- Updated web UI labels/calls:
  - slot button text changed from `Sample` to `Measure`
  - frontend now calls `/api/v1/audio/measure`
  - status/response text now says RMS measurement.
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Live Audio dBFS Feed via SSE)
- Added live server push feed for audio measurement metrics:
  - `GET /api/v1/audio/live/sse`
  - emits `text/event-stream` JSON events:
    - `connected`
    - repeated `audio_metrics` payloads with RMS/Peak dBFS and timestamp
- Added web live meter controls:
  - `Start Live Meter`
  - `Stop Live Meter`
  - header now shows live RMS/Peak and last event timestamp.
- Implementation note:
  - frontend uses `EventSource` to consume SSE feed and updates signals in real time.
- Files changed:
  - `apps/api/app/api/audio.py`
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Live RMS Sparkline Graph)
- Added a small live RMS sparkline graph in the web header area.
- Data source:
  - reuses SSE live meter events (`/api/v1/audio/live/sse`).
- Rendering:
  - SVG polyline graph (`220x64`) using the last 120 RMS points.
  - range normalized to `-90..0 dBFS`.
- Files changed:
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
  - `apps/web/src/app/app.css`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Live RMS Graph: Full-Width Bar Style)
- Updated live RMS chart rendering from line sparkline to bar graph.
- New behavior:
  - chart expands to full available row width,
  - displays little vertical bars for recent RMS points (last 96 points).
- Files changed:
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
  - `apps/web/src/app/app.css`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Live RMS Graph Uses Fixed Rolling Window)
- Adjusted bar-chart time axis behavior so it is a fixed rolling window, not a compressing timeline.
- Implementation:
  - fixed bin count (`96`) and fixed x-step spacing,
  - newest samples scroll through the window while oldest drop off.
- File changed:
  - `apps/web/src/app/app.ts`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Fix: Per-Slot Measure Updates Card Value)
- Fixed UI behavior where pressing per-slot `Measure` performed API call but did not update slot card RMS fields.
- Change:
  - per-slot measure handler now writes returned `rms_dbfs` + timestamp to that slot card (`5s RMS`/`RMS At` display fields).
- File changed:
  - `apps/web/src/app/app.ts`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Per-Slot Measure: 10s Frontend Max Capture + Countdown)
- Reworked per-slot `Measure` behavior to run fully in frontend timing window:
  - duration fixed to 10 seconds,
  - slot is synced first (queued amp slot sync),
  - frontend subscribes to SSE live metrics (`/api/v1/audio/live/sse`) during window,
  - records maximum RMS/Peak dBFS seen during that 10-second interval.
- UX updates:
  - button now shows live countdown (`Measuring (Ns)`) for active slot,
  - only one slot measure can run at a time.
- Card display updated:
  - shows `10s Max RMS/Peak` and capture timestamp.
- Files changed:
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Measure Converted To Single Active-Patch Action)
- Updated measurement UX to match active patch workflow:
  - removed per-slot `Measure` buttons from patch cards,
  - added single global `Measure Active Patch` button in header.
- New flow:
  1. reads active patch from amp (`GET /api/v1/amp/current-patch`),
  2. runs frontend 10-second max capture via live SSE metrics feed,
  3. matches active patch hash to loaded card hash and updates that card’s `10s Max RMS/Peak`.
- Button behavior:
  - shows countdown while running (`Measure Active (Ns)`),
  - disabled during active run.
- Files changed:
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Queued Backup Feature + Nested Repo Flatten)
- Added queued amp backup API endpoints:
  - `POST /api/v1/amp/backup` (enqueue full amp-state dump)
  - `GET /api/v1/amp/backup/{job_id}` (poll queued backup job/result)
- Added web backup action:
  - new `Backup Amp State` button in toolbar
  - enqueues backup, polls queue status, downloads resulting JSON on success
- Validation:
  - rebuilt/restarted via `docker compose up -d --build`
  - verified backup queue flow returns `succeeded` and full slot payload
- Repository hygiene fix:
  - flattened `manual-extract/fresh/innoextract` from accidental gitlink into regular tracked files

## Session Update - 2026-03-26 (Persistent Sync History)
- Added durable sync history storage in API DB:
  - new table: `amp_sync_history`
  - records queued sync operations (`sync_slot`, `quick_sync_names`, `full_sync_slots`, `full_dump`) with status/timestamps/result metadata.
- Added API endpoint:
  - `GET /api/v1/amp/sync-history?limit=N`
- Validation run:
  - executed queued full-dump sync job and confirmed persisted row with:
    - `operation=full_dump`
    - `status=succeeded`
    - `synced_at`, `created_at`, `amp_state_hash_sha256`, `slot_count=8`

## Session Update - 2026-03-26 (Alembic Squash + DB Reset)
- Collapsed Alembic history into a single base revision:
  - removed prior chain: `20260325_0001`, `20260326_0002`, `20260326_0003`
  - added new base: `20260326_0001_base_schema.py`
- Base migration now creates full current schema in one pass:
  - `patches`, `patch_configs`, `patch_sets`, `patch_set_members`, `amp_sync_history`
- Reset runtime DB to apply only new base migration:
  - ran `docker compose down -v`
  - ran `docker compose up -d --build`
- Verified migration state:
  - `alembic current` => `20260326_0001 (head)`
  - `alembic history` => `<base> -> 20260326_0001 (head)`

## Session Update - 2026-03-26 (Per-Slot Sync/Saved Status Colors)
- Added explicit per-slot status fields in amp API responses:
  - `in_sync`
  - `is_saved`
- Applied on:
  - full slot sync responses
  - per-slot sync responses
  - quick sync name responses
  - full dump/backup slot payload responses
- Added web slot-card status badges and color coding:
  - `In Sync` / `Not Synced`
  - `Saved` / `Not Saved`
  - card border now reflects sync status (`green` synced, `amber` not synced)
- Rebuilt/restarted:
  - `docker compose up -d --build`
- API verification:
  - `/api/v1/amp/slots/quick` and `/api/v1/amp/slots` now both include `in_sync` + `is_saved` per slot.

## Session Update - 2026-03-26 (Removed Auto Device Banner Polling)
- Removed auto `/api/v1/amp/device-status` banner and polling from web UI.
- Kept explicit manual health check via `Test Amp Connection` action only.
- Reason:
  - reduce random red/busy banner flips caused by transient status polling/probe noise.
- Rebuilt/restarted:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Per-Slot Sync Uses Full Timeout)
- Confirmed per-slot sync operation (`sync_slot`) performs full patch-state read path.
- Updated queue timeout behavior so `sync_slot` uses full-sync timeout budget:
  - changed from `quick_sync_timeout_seconds` to `full_sync_timeout_seconds`
- Updated UI status copy for per-slot sync to make full-read behavior explicit:
  - start: `Syncing slot N (full patch read)...`
  - success: `Slot N full sync succeeded (X ms)`
- Rebuilt/restarted:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Card Details + Raw JSON Modal)
- Extended slot sync payload to include full patch object on per-slot/full sync responses:
  - `SlotPatchSummary` now carries `payload` from amp read
  - API `SlotPatchSummaryResponse` now includes `patch`
- Updated slot cards to show key patch details directly:
  - amp summary (gain/volume/eq/presence)
  - stage summaries for booster/mod/fx/delay/reverb
- Added per-slot `Raw` button:
  - opens modal overlay with pretty-printed JSON payload for that slot
  - modal supports close button and backdrop-click close
- Quick sync behavior:
  - preserves previously loaded detailed patch payload per slot instead of wiping it
- Rebuilt/restarted:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Backup Queue Uses BTS Export Command)
- Updated API backup/full-dump queue path to use BTS export command sequence before slot reads:
  - send `CMDID_PREVIEW_MUTE` (`0x7F010109`) with value `01`
  - send `CMDID_EXPORT` (`0x7F01010A`) with value `7F7F`
  - require DT1 reply on export command address before continuing
- Implementation:
  - `AmpClient.full_amp_dump_via_export(...)`
  - queue `full_dump` operation now calls export-based method
- Preserved existing full payload collection after command ack (slot sweep still returns full patch JSON).
- Validation:
  - queued `POST /api/v1/amp/backup` run completed with `status=succeeded`.

## Session Update - 2026-03-26 (Backup No Longer Auto-Downloads In Browser)
- Changed web backup action behavior:
  - removed browser-side forced JSON file download
  - backup now reports success as server-side stored result tied to queue `job_id`
- Rationale:
  - backup data is persisted in backend history storage; UI should not force local file download by default.
- Rebuilt/restarted:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Pedal Type Names In UI)
- Replaced numeric stage type display (`Type N`) with human-readable effect names in slot cards.
- Applied mappings for:
  - booster types
  - mod/fx types
  - delay types
  - reverb types
- Unmapped values now display as `Unknown (N)` only when name table has no entry.
- Rebuilt/restarted:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Expanded To Full Pedal Names)
- Expanded stage type name tables to more descriptive full names (instead of shorthand labels):
  - examples: `Tube Screamer`, `ProCo RAT`, `Boss Metal Zone`, `MXR Distortion+`
  - delay/reverb labels now include full category names (for example `Digital Delay`, `Plate Reverb`)
- Unknown values remain explicit as `Unknown (N)` when not in table.
- Rebuilt/restarted:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Retired Frontend Sync Slots Action)
- Removed `Sync Slots A:1..B:4` action from web UI.
- Unified full-state refresh behavior under `Backup Amp State`:
  - queued backup/full-dump now also hydrates all slot cards with live patch data
  - updates AMP state hash, last sync timestamp, and total sync time on completion
- Rationale:
  - eliminate duplicate full-state actions; `backup/full-dump` is the authoritative full amp read path.
- Rebuilt/restarted:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Per-Slot Save With Hash Lookup)
- Added per-slot `Save` button on slot cards.
- Save workflow now does explicit hash lookup before writing:
  1. `GET /api/v1/patches/configs/{hash}`
  2. if 200 -> mark slot as saved (no duplicate write)
  3. if 404 -> `POST /api/v1/patches/configs` with slot snapshot
- On success, slot card state is updated to `is_saved=true`.
- Rebuilt/restarted:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Web Audio Samples Feature)
- Added backend audio sampling API:
  - `POST /api/v1/audio/sample` captures short PipeWire sample and returns RMS/Peak dBFS metrics
  - `GET /api/v1/audio/samples` lists recent captured samples
- Added persistence:
  - new table `audio_samples` (optional `patch_hash`/`slot` linkage + capture metrics + timestamp)
  - Alembic revision: `20260326_0002_audio_samples`
- Added frontend per-slot action:
  - `Sample` button on slot cards posts sample request with slot/hash context
  - response panel now shows captured metrics (`rms_dbfs`, `peak_dbfs`, sample count, timestamp)
- Runtime dependencies:
  - API container now installs `pipewire-bin` (for `pw-record`)
- Validation:
  - live API sample call succeeded and stored row id `1` with returned RMS/Peak dBFS.

## Session Update - 2026-03-26 (Audio Sample Failure Fix)
- Fixed sample failure caused by foreign-key linkage to unsaved patch hashes.
- Changes:
  - frontend now links `patch_hash` only when slot is marked saved
  - backend now validates supplied `patch_hash` and returns HTTP `400` with clear message when hash is unknown (instead of DB `500`)
- Validation:
  - sample with `patch_hash=null` succeeded and persisted
  - sample with unknown hash returned expected `400` JSON error payload

## Session Update - 2026-03-26 (Disable Non-Usable Slot Buttons)
- Slot card actions now respect slot sync state:
  - when slot has no full patch payload, only `Sync` remains usable
  - `Save`, `Sample`, and `Raw` are disabled until full slot sync/backup hydration loads patch payload
- Rebuilt/restarted:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Save->Sample Hash Mismatch Fix)
- Fixed root cause where `save` could create a different library hash than amp slot hash:
  - server patch-config hashing now uses canonical snapshot excluding `config_hash_sha256` field (matches amp hash logic)
- Frontend save flow now updates slot hash from server save response when needed.
- Result:
  - save confirmation and subsequent sample-linking now operate on the same hash id.
- Validation:
  - sync slot -> save config -> sample with hash link
  - confirmed `amp_hash == saved_hash` and sample insert succeeded.

## Session Update - 2026-03-26 (Queue-Only Amp I/O + No Global UI Lock)
- Enforced queue-backed amp communication across API amp-read/sync routes:
  - `GET /api/v1/amp/test-connection` now executes via queue job.
  - `GET /api/v1/amp/current-patch` now executes via queue job.
  - `GET /api/v1/amp/slots` now executes via queue job (`full_sync_slots`).
  - `POST /api/v1/amp/slots/{slot}/sync` now executes via queue job (`sync_slot`).
  - `GET /api/v1/amp/slots/quick` now executes via queue job (`quick_sync_names`).
  - `GET /api/v1/amp/full-dump` now executes via queue job (`full_dump`).
- Expanded queue worker operations/results in:
  - `apps/api/app/amp_queue.py`
  - added operations: `test_connection`, `current_patch`, `sync_slot`, `full_dump`.
- Updated queue state payload to include optional per-job `slot` metadata.
- Web UI no longer globally disables all buttons while one request is active:
  - removed global `[disabled]="isLoading()"` gating and shared loading toggles.
  - queue monitor now shows slot context for slot-targeted jobs.
- Containerized verification:
  - `docker compose build api web` succeeded.

## Session Update - 2026-03-26 (Quick Sync Route Collision Fixed)
- Reproduced web failure via Playwright:
  - `Quick Sync Names` returned validation error with `slot='quick'`.
- Root cause:
  - route collision where dynamic per-slot path could capture quick-sync path.
- Fix:
  - changed per-slot route to explicit integer converter:
    - `POST /api/v1/amp/slots/{slot:int}/sync`
  - file: `apps/api/app/api/amp.py`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`
- Playwright re-check:
  - `Quick Sync Names` now succeeds and updates slot names.

## Session Update - 2026-03-26 (Patch-Set Load From Recent Full Sync Data)
- Added API endpoints to list and load recent successful full-dump snapshots from sync history data:
  - `GET /api/v1/amp/backup/snapshots?limit=20`
  - `POST /api/v1/amp/backup/snapshots/{snapshot_id}/load`
- Source of truth is `amp_sync_history` rows (`operation=full_dump`, `status=succeeded`, with `result_json.slots[].payload`).
- Load behavior intentionally marks all returned slots as:
  - `is_saved = true`
  - `in_sync = false`
  - so UI reads `Saved` + `Not Synced` after loading data-only snapshots.
- Added web UI action:
  - header button `Load Patch Set`
  - modal listing recent full-sync snapshots (label/synced-at/slot-count/sync-ms) with per-item `Load`.
- Files changed:
  - `apps/api/app/api/amp.py`
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`

## Session Update - 2026-03-26 (Patch-Set Load 404 Fix)
- Fixed API route collision that caused `Load Patch Set` to fail with:
  - `Failed loading recent full-sync data`
- Root cause:
  - dynamic route `GET /api/v1/amp/backup/{job_id}` captured `/api/v1/amp/backup/snapshots`.
- Fix:
  - constrained backup job route to UUID path parameter:
    - `GET /api/v1/amp/backup/{job_id:uuid}`
- Validation:
  - `GET /api/v1/amp/backup/snapshots?limit=3` returns snapshot list.
  - `POST /api/v1/amp/backup/snapshots/{id}/load` returns 8 slots with `in_sync=false` and `is_saved=true`.

## Session Update - 2026-03-26 (AMP Type Human-Readable + Variation)
- Updated slot card AMP type display to decode the numeric amp type into names:
  - `Acoustic`, `Clean`, `Crunch`, `Lead`, `Brown`.
- AMP type line now also shows variation state from patch payload:
  - `Variation On/Off` (derived from `amp.preamp_variation`).
- File changed:
  - `apps/web/src/app/app.ts`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Booster Summary Shows G/V)
- Updated slot card booster summary formatting to include explicit gain/volume style values:
  - `On/Off | <Booster Type> | G <drive> | V <effect_level>`
- Mapping uses existing booster payload fields:
  - `drive` -> `G`
  - `effect_level` -> `V`
- File changed:
  - `apps/web/src/app/app.ts`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Stage On/Off via Label Color)
- Updated stage display on slot cards to remove textual `On/Off` prefixes from summaries.
- Stage state is now represented by label color only:
  - green label when stage `on=true`
  - red label when stage `on=false`
- Applied to stage labels:
  - `Booster`, `Mod`, `FX`, `Delay`, `Reverb`
- Added helper in web app for stage on/off state:
  - `isStageOn(slot, stageName)`
- Files changed:
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Editor Modal v1 Scaffold)
- Started editor modal development in web UI with first working slice.
- Slot cards now include an `Editor` action (enabled when a full patch payload exists).
- Added `Editor` modal with draft editing for:
  - patch name,
  - amp controls (`type`, `variation`, `gain`, `volume`, `bass`, `middle`, `treble`, `presence`),
  - stage controls for `booster`, `mod`, `fx`, `delay`, `reverb` (`enabled`, `type`, `level`),
  - booster-specific `Gain` (`drive`).
- Added modal actions:
  - `Apply Local` (writes draft back to slot card state locally and marks unsynced/unsaved),
  - `Save Draft` (persists draft snapshot via `/api/v1/patches/configs` and updates slot hash/saved state).
- No amp device write path added yet in this slice; this is editor/draft workflow only.
- Files changed:
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
  - `apps/web/src/app/app.css`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`

## Session Update - 2026-03-26 (Editor Modal v2: Type-Schema Foundation)
- Extended editor modal to handle differing pedal schemas by stage/type using raw variant payloads.
- Added stage parameter grid driven from each stage `raw` payload:
  - renders `P1..Pn` style parameters for all stage types,
  - applies stage-specific labels where known:
    - booster (`Drive`, `Tone`, `Effect Level`, etc.),
    - delay (`Feedback`, `Effect Level`, `Direct Level`, etc.),
    - reverb (`Layer Mode`, `Time`, `Effect Level`, `Direct Level`).
- Type changes now hydrate stage `raw` from `variants_raw[type]` when available (schema switch behavior).
- Added synchronization of derived fields from raw payload for key stage summaries:
  - booster: `type`, `drive`, `effect_level`
  - delay: `type`, `effect_level`
  - reverb: `type`, `effect_level`
- Files changed:
  - `apps/web/src/app/app.ts`
  - `apps/web/src/app/app.html`
- Rebuilt/restarted stack:
  - `docker compose up -d --build`
