# Live Tone Setups

Date: 2026-03-23
Device: KATANA Gen 3 over USB MIDI (`hw:1,0,0`)

## Base Session Command
Always enable editor communication mode first:

```bash
amidi -p hw:1,0,0 -S "F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7"
```

## Setup 1: Hendrix-Leaning Amp EQ (Current Patch)
Target: neck single-coil friendly mids, less harsh top.

- Address block: `PATCH%AMP` bass/mid/treble/presence at `0x20000602..0x20000605`
- Values applied:
- Bass `42`
- Mid `68`
- Treble `62`
- Presence `40`

Write command:

```bash
amidi -p hw:1,0,0 -S "F0 41 10 01 05 07 12 20 00 06 02 2A 44 3E 28 04 F7"
```

Readback command (4 bytes):

```bash
amidi -p hw:1,0,0 -d -t 2 -S "F0 41 10 01 05 07 11 20 00 06 02 00 00 00 04 54 F7"
```

Expected reply data bytes:

```text
2A 44 3E 28
```

## Setup 2: 60s Fuzz on Active Booster Slot 1
Target: extra overdrive/fuzz while keeping some articulation.

- Active booster color readback was `0` (slot 1)
- Booster switch was turned ON
- Slot 1 block address: `0x20000A00..0x20000A07`

Values applied to slot 1:
- Type `18` (`'60S FUZZ`)
- Drive `88` (raised from 72)
- Bottom `46` (about `-4` with BTS offset)
- Tone `56` (about `+6` with BTS offset)
- Solo SW `0`
- Solo Level `50`
- Effect Level `80`
- Direct Mix `12`

Turn booster on:

```bash
amidi -p hw:1,0,0 -S "F0 41 10 01 05 07 12 20 00 08 00 01 57 F7"
```

Write slot 1 fuzz block (with drive 88):

```bash
amidi -p hw:1,0,0 -S "F0 41 10 01 05 07 12 20 00 0A 00 12 58 2E 38 00 32 50 0C 78 F7"
```

Readback slot 1 block (8 bytes):

```bash
amidi -p hw:1,0,0 -d -t 2 -S "F0 41 10 01 05 07 11 20 00 0A 00 00 00 00 08 4E F7"
```

Expected reply data bytes:

```text
12 58 2E 38 00 32 50 0C
```

## Analysis Snapshot (Audio)
Capture analyzed: `/tmp/katana_take_s16.wav`

- Peaks: `146.5 Hz`, `293.0 Hz`, `738.3 Hz`, `588.9 Hz`, `246.1 Hz`, `442.4 Hz`, `2083.0 Hz`, `1031.2 Hz`
- Band energy:
- `80-250 Hz`: `90.81%`
- `250-500 Hz`: `7.13%`
- `500-2000 Hz`: `1.54%`

## Notes
- These writes affect the currently active patch buffer.
- If tone does not respond as expected, resend editor mode ON command first.
- Booster slot assumptions depend on `PATCH%COLOR` (booster color) state.
## 2026-03-23 - Patch 4 - Greenwood Style (ShredMaster-ish)
- Patch slot: A:CH4
- AMP (`0x20000600`): gain 30, volume 78, bass 38, mid 72, treble 52, presence 30, poweramp variation 0, amp type 1 (Clean), resonance 1, preamp variation 0
- SW (`0x20000800`): booster ON, mod OFF, fx OFF, delay OFF, reverb OFF
- BOOSTER(1) (`0x20000A00`): type `0x0F` (GUV DS), drive 82, bottom 40, tone 58, solo off, solo level 50, effect level 70, direct mix 0
- EQ_EACH(1) (`0x20004C00`): ON
- EQ_GE10(1) (`0x20005400`): raw `0C 0E 0F 10 1A 1C 1B 16 13 10 18`
- EQ_GE10(1) in dB: 31Hz -12, 62Hz -10, 125Hz -9, 250Hz -8, 500Hz +2, 1k +4, 2k +3, 4k -2, 8k -5, 16k -8, level 0
- NS (`0x20005800`): ON, threshold 50, release 40

## Pinned Preset
- `greenwood-dry`: `setups/special/greenwood-dry/`
