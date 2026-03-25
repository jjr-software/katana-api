#!/usr/bin/env bash
set -euo pipefail
PORT=${1:-hw:1,0,0}
send(){ amidi -p "$PORT" -S "$1"; }
send "F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7"
send "F0 41 10 01 05 07 12 7F 00 01 00 00 04 7C F7"
# SW: booster on, mod/fx/delay/delay2/reverb off
send "F0 41 10 01 05 07 12 20 00 08 00 01 00 00 00 00 00 57 F7"
# Reverb effect level = 0 for G/R/Y
send "F0 41 10 01 05 07 12 20 00 34 0A 00 22 F7"
send "F0 41 10 01 05 07 12 20 00 36 0A 00 20 F7"
send "F0 41 10 01 05 07 12 20 00 38 0A 00 1E F7"
# Line out ambience predelay/level = 0
send "F0 41 10 01 05 07 12 10 00 1A 03 00 53 F7"
send "F0 41 10 01 05 07 12 10 00 1A 04 00 52 F7"
send "F0 41 10 01 05 07 12 10 00 1C 03 00 51 F7"
send "F0 41 10 01 05 07 12 10 00 1C 04 00 50 F7"
echo "Applied preset: greenwood-dry on $PORT"
