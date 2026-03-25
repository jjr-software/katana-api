# Tone Cycle Log

## 2026-03-23 Preset 1 Applied\n- Name: `Hendrix Edge`\n- AMP values: `58,82,45,72,58,34,1,1,0,0`\n- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 3A 52 2D 48 3A 22 01 01 00 00 7B F7`\n- Readback: `F0 41 10 01 05 07 12 20 00 06 00 3A 52 2D 48 3A 22 01 01 00 00 7B F7`\n\n## 2026-03-23 Preset 2 Applied
- Name: `Hendrix Bite Var`
- AMP values: `66,80,43,74,61,38,1,1,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 42 50 2B 4A 3D 26 01 01 00 01 6D F7`

## 2026-03-23 Expression Pedal Wah Assignment
- Goal: set onboard expression pedal to direct wah in amp.
- `PATCH%ASSIGN_EXPPDL_FUNC_FUNCTION` (`0x20005E00`) -> `2` (`PEDAL FX`)
- `PATCH%PEDALFX_COM` (`0x20004800`) -> `00 01 00`:
  - position `0`
  - switch `1` (on)
  - type `0` (Pedal Wah)
- `PATCH%PEDALFX` first 6 bytes (`0x20004A00`) -> `00 64 00 64 64 00`:
  - wah type `0` (Cry Wah)
  - pedal pos `100`, min `0`, max `100`, effect level `100`, direct mix `0`
- Verified readback:
  - `F0 41 10 01 05 07 12 20 00 5E 00 02 00 F7`
  - `F0 41 10 01 05 07 12 20 00 48 00 00 01 00 17 F7`
  - `F0 41 10 01 05 07 12 20 00 4A 00 00 00 00 64 64 00 4E F7`
## 2026-03-23 Preset 3 Applied
- Name: `Frusciante CleanCrunch Var`
- AMP values: `52,84,46,68,60,36,1,0,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 34 54 2E 44 3C 24 01 00 00 01 7E F7`

## 2026-03-23 Wah Disabled (while keeping Preset 3)
- `PATCH%ASSIGN_EXPPDL_FUNC_FUNCTION` (`0x20005E00`) -> `1`
- `PATCH%PEDALFX_COM` (`0x20004800`) -> `00 00 00` (off)
- Verified readback:
  - `F0 41 10 01 05 07 12 20 00 5E 00 01 01 F7`
  - `F0 41 10 01 05 07 12 20 00 48 00 00 00 00 18 F7`
## 2026-03-23 Frusciante v2 Applied
- AMP values: `46,84,34,70,67,42,1,0,0,1`
- SysEx: `F0 41 10 01 05 07 12 20 00 06 00 2E 54 22 46 43 2A 01 00 00 01 01 F7`
- Readback matched.
## 2026-03-23 EQ Baseline Enabled for Cycle\n- `EQ_EACH(1)` enabled with `00 01 00`.\n- `EQ_GE10(1)` set to raw `14 15 16 17 1A 1B 1A 19 18 17 19` (mild Frusciante tilt).\n- Verification readback matched write on both EQ blocks.\n\n