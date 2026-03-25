# Tone Cycle (Type + Variation + EQ)

Use: type `next` in chat, and I will apply the next preset in order.

All presets write the 10-byte `PATCH%AMP` block at `0x20000600`:
- `gain, volume, bass, middle, treble, presence, poweramp_variation, amp_type, resonance, preamp_variation`


## EQ Baseline (Applied To Every Preset)
Use these after each AMP preset write:

- Enable patch EQ block (`EQ_EACH(1)`):
`F0 41 10 01 05 07 12 20 00 4C 00 00 01 00 13 F7`

- GE10 curve (`EQ_GE10(1)`):
  - dB: `-4, -3, -2, -1, +2, +3, +2, +1, 0, -1, +1`
  - raw: `14 15 16 17 1A 1B 1A 19 18 17 19`
`F0 41 10 01 05 07 12 20 00 54 00 14 15 16 17 1A 1B 1A 19 18 17 19 06 F7`

## Presets
1. Hendrix Edge
- Values: `58,82,45,72,58,34,1,1,0,0`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 3A 52 2D 48 3A 22 01 01 00 00 7B F7`

2. Hendrix Bite Var
- Values: `66,80,43,74,61,38,1,1,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 42 50 2B 4A 3D 26 01 01 00 01 6D F7`

3. Frusciante CleanCrunch Var
- Values: `52,84,46,68,60,36,1,0,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 34 54 2E 44 3C 24 01 00 00 01 7E F7`

4. Frusciante Drive Var
- Values: `62,82,44,70,62,38,1,0,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 3E 52 2C 46 3E 26 01 00 00 01 72 F7`

5. Texas Push
- Values: `70,80,48,66,57,33,1,2,0,0`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 46 50 30 42 39 21 01 02 00 00 75 F7`

6. Texas Push Var
- Values: `76,78,46,68,60,36,1,2,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 4C 4E 2E 44 3C 24 01 02 00 01 6A F7`

7. Classic Lead
- Values: `74,78,42,65,64,40,1,3,0,0`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 4A 4E 2A 41 40 28 01 03 00 00 6B F7`

8. Classic Lead Var
- Values: `80,76,40,67,66,42,1,3,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 50 4C 28 43 42 2A 01 03 00 01 62 F7`

9. Brown Lite
- Values: `72,78,40,62,64,39,1,4,0,0`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 48 4E 28 3E 40 27 01 04 00 00 72 F7`

10. Brown Var
- Values: `82,76,38,64,66,42,1,4,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 52 4C 26 40 42 2A 01 04 00 01 64 F7`

11. Fuzz Friendly Base
- Values: `68,80,41,70,60,34,1,1,0,0`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 44 50 29 46 3C 22 01 01 00 00 77 F7`

12. Mid Focus Solo Var
- Values: `78,78,39,76,58,32,1,2,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 4E 4E 27 4C 3A 20 01 02 00 01 6D F7`

## Readback Command
- Read current AMP block (10 bytes):
`F0 41 10 01 05 07 11 20 00 06 00 00 00 00 0A 50 F7`
