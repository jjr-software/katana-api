#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
from datetime import datetime


PORT_DEFAULT = "hw:1,0,0"
BASE_DIR = os.path.dirname(__file__)
STATE_PATH = os.path.join(BASE_DIR, "intentional_state.json")

# Shared base amp for the whole intentional cycle.
# Order: gain, volume, bass, mid, treble, presence, poweramp_var, amp_type, resonance, preamp_var
# amp_type=1 => Clean
BASE_AMP = [30, 72, 38, 72, 52, 30, 0, 1, 1, 0]

# GE10 order: 31,62,125,250,500,1k,2k,4k,8k,16k,level (raw = dB + 24)
JOURNEY = [
    {
        "slug": "clean-boost",
        "type": 1,
        "intent": "Frusciante/Hendrix edge-of-breakup push; bright but not harsh.",
        "booster": [1, 58, 44, 56, 0, 50, 60, 0],
        "ge10": [18, 20, 22, 23, 25, 27, 27, 24, 20, 17, 24],  # -6,-4,-2,-1,+1,+3,+3,0,-4,-7,0
    },
    {
        "slug": "blues-drive",
        "type": 9,
        "intent": "Warm indie breakup with touch response; Oasis-ish rhythm crunch.",
        "booster": [9, 64, 46, 50, 0, 50, 61, 0],
        "ge10": [19, 21, 22, 24, 26, 28, 27, 23, 19, 16, 24],
    },
    {
        "slug": "t-scream",
        "type": 11,
        "intent": "Mid-forward alt lead voice; tight low end for chord clarity.",
        "booster": [11, 68, 40, 54, 0, 50, 61, 0],
        "ge10": [17, 19, 21, 23, 27, 30, 29, 24, 19, 16, 24],
    },
    {
        "slug": "distortion",
        "type": 13,
        "intent": "90s Brit/alt bite; fuller than TS, still controlled top.",
        "booster": [13, 78, 42, 56, 0, 50, 60, 0],
        "ge10": [18, 20, 22, 24, 27, 30, 29, 24, 18, 15, 24],
    },
    {
        "slug": "rat",
        "type": 14,
        "intent": "Radiohead-adjacent grainy aggression; upper-mid snarl with fizz trim.",
        "booster": [14, 76, 40, 58, 0, 50, 58, 0],
        "ge10": [17, 19, 21, 23, 28, 31, 30, 24, 17, 14, 24],
    },
    {
        "slug": "guv-ds",
        "type": 15,
        "intent": "Greenwood/ShredMaster lane; strong 1k/2k voice, dry by default.",
        "booster": [15, 82, 40, 58, 0, 50, 60, 0],
        "ge10": [18, 20, 22, 24, 28, 31, 30, 24, 18, 15, 24],
    },
    {
        "slug": "dst-plus",
        "type": 16,
        "intent": "Sharper vintage distortion edge for cutting riffs.",
        "booster": [16, 74, 38, 60, 0, 50, 58, 0],
        "ge10": [16, 18, 20, 22, 27, 30, 29, 24, 18, 15, 24],
    },
    {
        "slug": "centa-od",
        "type": 22,
        "intent": "Transparent-ish indie push with tight lows and sweet highs.",
        "booster": [22, 62, 44, 54, 0, 50, 62, 0],
        "ge10": [18, 20, 22, 23, 26, 28, 27, 24, 20, 17, 24],
    },
]


def sx_dt1(addr, data):
    cs = (128 - ((sum(addr) + sum(data)) % 128)) % 128
    msg = [0xF0, 0x41, 0x10, 0x01, 0x05, 0x07, 0x12, *addr, *data, cs, 0xF7]
    return " ".join(f"{b:02X}" for b in msg)


def amidi_send(port, msg):
    subprocess.run(["amidi", "-p", port, "-S", msg], check=True)


def apply_step(port, step):
    amidi_send(port, "F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7")  # editor on
    amidi_send(port, "F0 41 10 01 05 07 12 7F 00 01 00 00 04 7C F7")  # patch4

    amidi_send(port, sx_dt1([0x20, 0x00, 0x06, 0x00], BASE_AMP))
    amidi_send(port, sx_dt1([0x20, 0x00, 0x0A, 0x00], step["booster"]))
    amidi_send(port, sx_dt1([0x20, 0x00, 0x4C, 0x00], [0x01, 0x00, 0x00]))  # EQ on
    amidi_send(port, sx_dt1([0x20, 0x00, 0x54, 0x00], step["ge10"]))
    amidi_send(port, sx_dt1([0x20, 0x00, 0x58, 0x00], [0x01, 0x32, 0x28]))  # NS

    # dry by default on patch recall
    amidi_send(port, sx_dt1([0x20, 0x00, 0x08, 0x00], [0x01, 0x00, 0x00, 0x00, 0x00, 0x00]))
    amidi_send(port, sx_dt1([0x20, 0x00, 0x34, 0x0A], [0x00]))
    amidi_send(port, sx_dt1([0x20, 0x00, 0x36, 0x0A], [0x00]))
    amidi_send(port, sx_dt1([0x20, 0x00, 0x38, 0x0A], [0x00]))
    amidi_send(port, sx_dt1([0x10, 0x00, 0x1A, 0x03], [0x00]))
    amidi_send(port, sx_dt1([0x10, 0x00, 0x1A, 0x04], [0x00]))
    amidi_send(port, sx_dt1([0x10, 0x00, 0x1C, 0x03], [0x00]))
    amidi_send(port, sx_dt1([0x10, 0x00, 0x1C, 0x04], [0x00]))


def save_step(step):
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = os.path.join(BASE_DIR, f"intentional-{step['slug']}-{ts}")
    os.makedirs(run_dir, exist_ok=True)

    snap = {
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "slug": step["slug"],
        "pedal_type": step["type"],
        "intent": step["intent"],
        "amp": BASE_AMP,
        "amp_type_name": "clean",
        "booster": step["booster"],
        "ge10_raw": step["ge10"],
        "ge10_db": [v - 24 for v in step["ge10"]],
    }
    with open(os.path.join(run_dir, "snapshot.json"), "w") as f:
        json.dump(snap, f, indent=2)

    with open(os.path.join(run_dir, "README.md"), "w") as f:
        f.write(f"# {step['slug']} intentional variation\n\n")
        f.write(f"- Created: `{snap['created_at']}`\n")
        f.write(f"- Intent: {step['intent']}\n")
        f.write("- Amp base: Clean (`amp_type=1`) fixed for all intentional pedals\n")
        f.write("- Files: `snapshot.json`, `apply.sh`\n")

    with open(os.path.join(run_dir, "apply.sh"), "w") as f:
        f.write("#!/usr/bin/env bash\nset -euo pipefail\nPORT=${1:-hw:1,0,0}\n")
        f.write("send(){ amidi -p \"$PORT\" -S \"$1\"; }\n")
        f.write("send \"F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 7F 00 01 00 00 04 7C F7\"\n")
        f.write(f"send \"{sx_dt1([0x20,0x00,0x06,0x00], BASE_AMP)}\"\n")
        f.write(f"send \"{sx_dt1([0x20,0x00,0x0A,0x00], step['booster'])}\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 4C 00 01 00 00 13 F7\"\n")
        f.write(f"send \"{sx_dt1([0x20,0x00,0x54,0x00], step['ge10'])}\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 58 00 01 32 28 2D F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 08 00 01 00 00 00 00 00 57 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 34 0A 00 22 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 36 0A 00 20 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 38 0A 00 1E F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 10 00 1A 03 00 53 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 10 00 1A 04 00 52 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 10 00 1C 03 00 51 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 10 00 1C 04 00 50 F7\"\n")
        f.write(f"echo \"Applied intentional {step['slug']} variation\"\n")
    os.chmod(os.path.join(run_dir, "apply.sh"), 0o755)
    return run_dir


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", default=PORT_DEFAULT)
    ap.add_argument("--next", action="store_true")
    ap.add_argument("--index", type=int, default=None)
    args = ap.parse_args()

    if not os.path.exists(STATE_PATH):
        with open(STATE_PATH, "w") as f:
            json.dump({"next_index": 0}, f, indent=2)

    with open(STATE_PATH) as f:
        st = json.load(f)

    if args.index is not None:
        idx = args.index % len(JOURNEY)
    elif args.next:
        idx = st.get("next_index", 0) % len(JOURNEY)
    else:
        idx = 0

    step = JOURNEY[idx]
    apply_step(args.port, step)
    run_dir = save_step(step)

    st["last"] = {
        "index": idx,
        "slug": step["slug"],
        "intent": step["intent"],
        "dir": run_dir,
        "at": datetime.now().isoformat(timespec="seconds"),
    }
    st["next_index"] = (idx + 1) % len(JOURNEY)
    with open(STATE_PATH, "w") as f:
        json.dump(st, f, indent=2)

    print(f"Applied intentional step: {step['slug']} (index {idx})")
    print(f"Intent: {step['intent']}")
    print(f"Saved: {run_dir}")
    print(f"Next index: {st['next_index']}")


if __name__ == "__main__":
    main()
