#!/usr/bin/env python3
import argparse
import json
import os
import random
import subprocess
from datetime import datetime


PORT = "hw:1,0,0"
BASE_DIR = os.path.dirname(__file__)
STATE_PATH = os.path.join(BASE_DIR, "random_state.json")

# booster type index map from BTS resource order
PEDALS = [
    (0, "mid-boost"),
    (1, "clean-boost"),
    (2, "treble-boost"),
    (3, "crunch-od"),
    (4, "natural-od"),
    (5, "warm-od"),
    (6, "fat-ds"),
    (7, "metal-ds"),
    (8, "oct-fuzz"),
    (9, "blues-drive"),
    (10, "overdrive"),
    (11, "t-scream"),
    (12, "turbo-od"),
    (13, "distortion"),
    (14, "rat"),
    (15, "guv-ds"),
    (16, "dst-plus"),
    (17, "metal-zone"),
    (18, "60s-fuzz"),
    (19, "muff-fuzz"),
    (20, "hm-2"),
    (21, "metal-core"),
    (22, "centa-od"),
]

POOL_INDIE90S = {
    "mid-boost",
    "clean-boost",
    "treble-boost",
    "crunch-od",
    "natural-od",
    "warm-od",
    "blues-drive",
    "overdrive",
    "t-scream",
    "turbo-od",
    "distortion",
    "rat",
    "guv-ds",
    "dst-plus",
    "centa-od",
}

POOL_ALL = {slug for _t, slug in PEDALS}


def sx_dt1(addr, data):
    cs = (128 - ((sum(addr) + sum(data)) % 128)) % 128
    msg = [0xF0, 0x41, 0x10, 0x01, 0x05, 0x07, 0x12, *addr, *data, cs, 0xF7]
    return " ".join(f"{b:02X}" for b in msg)


def amidi_send(msg):
    subprocess.run(["amidi", "-p", PORT, "-S", msg], check=True)


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--mode",
        default="indie90s",
        choices=["indie90s", "all"],
        help="Pedal selection mode",
    )
    return ap.parse_args()


def pick_pedal(mode):
    last = None
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH) as f:
            st = json.load(f)
            last = st.get("last_pedal_type")

    allowed = POOL_INDIE90S if mode == "indie90s" else POOL_ALL
    candidates = [p for p in PEDALS if p[1] in allowed and p[0] != last]
    if not candidates:
        candidates = [p for p in PEDALS if p[1] in allowed]
    return random.choice(candidates)


def make_settings(pedal_type):
    # Clean+box baseline with randomized contour
    amp_gain = random.randint(22, 42)
    amp_vol = random.randint(68, 82)
    amp_bass = random.randint(32, 48)
    amp_mid = random.randint(62, 78)
    amp_treble = random.randint(42, 58)
    amp_presence = random.randint(22, 36)

    # Keep drive musical for indie/alt styles; no extreme metal gain
    drv = random.randint(52, 88)
    bottom = random.randint(36, 52)
    tone = random.randint(40, 62)
    lvl = random.randint(52, 66)

    # GE10 random but guitar-safe tilt
    ge = [
        random.randint(16, 24),  # 31
        random.randint(17, 25),  # 62
        random.randint(18, 25),  # 125
        random.randint(20, 26),  # 250
        random.randint(22, 28),  # 500
        random.randint(24, 31),  # 1k
        random.randint(23, 30),  # 2k
        random.randint(18, 26),  # 4k
        random.randint(14, 23),  # 8k
        random.randint(12, 21),  # 16k
        24,                      # level 0 dB
    ]

    amp = [amp_gain, amp_vol, amp_bass, amp_mid, amp_treble, amp_presence, 0, 1, 1, 0]
    booster = [pedal_type, drv, bottom, tone, 0, 50, lvl, 0]
    return amp, booster, ge


def apply(amp, booster, ge10):
    amidi_send("F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7")  # editor on
    amidi_send("F0 41 10 01 05 07 12 7F 00 01 00 00 04 7C F7")  # patch4

    amidi_send(sx_dt1([0x20, 0x00, 0x06, 0x00], amp))
    amidi_send(sx_dt1([0x20, 0x00, 0x0A, 0x00], booster))
    amidi_send(sx_dt1([0x20, 0x00, 0x4C, 0x00], [0x01, 0x00, 0x00]))  # EQ on
    amidi_send(sx_dt1([0x20, 0x00, 0x54, 0x00], ge10))
    amidi_send(sx_dt1([0x20, 0x00, 0x58, 0x00], [0x01, 0x32, 0x28]))  # NS on

    # default dry on patch recall
    amidi_send(sx_dt1([0x20, 0x00, 0x08, 0x00], [0x01, 0x00, 0x00, 0x00, 0x00, 0x00]))
    amidi_send(sx_dt1([0x20, 0x00, 0x34, 0x0A], [0x00]))
    amidi_send(sx_dt1([0x20, 0x00, 0x36, 0x0A], [0x00]))
    amidi_send(sx_dt1([0x20, 0x00, 0x38, 0x0A], [0x00]))
    amidi_send(sx_dt1([0x10, 0x00, 0x1A, 0x03], [0x00]))
    amidi_send(sx_dt1([0x10, 0x00, 0x1A, 0x04], [0x00]))
    amidi_send(sx_dt1([0x10, 0x00, 0x1C, 0x03], [0x00]))
    amidi_send(sx_dt1([0x10, 0x00, 0x1C, 0x04], [0x00]))


def save_dir(pedal_slug, pedal_type, amp, booster, ge10):
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    d = os.path.join(BASE_DIR, f"random-{pedal_slug}-{ts}")
    os.makedirs(d, exist_ok=True)

    meta = {
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "pedal_type": pedal_type,
        "pedal_slug": pedal_slug,
        "amp": amp,
        "booster": booster,
        "ge10_raw": ge10,
        "ge10_db": [v - 24 for v in ge10],
        "notes": "Randomized clean+box variation with dry default recall.",
    }
    with open(os.path.join(d, "snapshot.json"), "w") as f:
        json.dump(meta, f, indent=2)

    with open(os.path.join(d, "README.md"), "w") as f:
        f.write(f"# {pedal_slug} random variation\n\n")
        f.write(f"- Created: `{meta['created_at']}`\n")
        f.write(f"- Pedal type index: `{pedal_type}`\n")
        f.write("- Files: `snapshot.json`, `apply.sh`\n")

    with open(os.path.join(d, "apply.sh"), "w") as f:
        f.write("#!/usr/bin/env bash\nset -euo pipefail\nPORT=${1:-hw:1,0,0}\n")
        f.write("send(){ amidi -p \"$PORT\" -S \"$1\"; }\n")
        f.write("send \"F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 7F 00 01 00 00 04 7C F7\"\n")
        f.write(f"send \"{sx_dt1([0x20,0x00,0x06,0x00], amp)}\"\n")
        f.write(f"send \"{sx_dt1([0x20,0x00,0x0A,0x00], booster)}\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 4C 00 01 00 00 13 F7\"\n")
        f.write(f"send \"{sx_dt1([0x20,0x00,0x54,0x00], ge10)}\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 58 00 01 32 28 2D F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 08 00 01 00 00 00 00 00 57 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 34 0A 00 22 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 36 0A 00 20 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 20 00 38 0A 00 1E F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 10 00 1A 03 00 53 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 10 00 1A 04 00 52 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 10 00 1C 03 00 51 F7\"\n")
        f.write("send \"F0 41 10 01 05 07 12 10 00 1C 04 00 50 F7\"\n")
        f.write(f"echo \"Applied {pedal_slug} random variation\"\n")
    os.chmod(os.path.join(d, "apply.sh"), 0o755)

    return d


def main():
    args = parse_args()
    pedal_type, pedal_slug = pick_pedal(args.mode)
    amp, booster, ge10 = make_settings(pedal_type)
    apply(amp, booster, ge10)
    d = save_dir(pedal_slug, pedal_type, amp, booster, ge10)

    with open(STATE_PATH, "w") as f:
        json.dump(
            {
                "last_pedal_type": pedal_type,
                "last_pedal_slug": pedal_slug,
                "last_dir": d,
                "mode": args.mode,
                "updated_at": datetime.now().isoformat(timespec="seconds"),
            },
            f,
            indent=2,
        )
    print(f"Applied random pedal: {pedal_slug} (type {pedal_type}, mode {args.mode})")
    print(f"Saved variation: {d}")


if __name__ == "__main__":
    main()
