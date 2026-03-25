#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import time
from datetime import datetime, timezone


PATCHES = [
    "/home/will/dev/BOSS-TONE-STUDIO-for-Linux/setups/variations/by-amp/manual-franz-ferdinand-v2-20260323-184319/snapshot.json",
    "/home/will/dev/BOSS-TONE-STUDIO-for-Linux/setups/variations/by-pedal/manual-90s-20260323-182418/snapshot.json",
    "/home/will/dev/BOSS-TONE-STUDIO-for-Linux/setups/variations/by-pedal/intentional-20260323-181446/snapshot.json",
    "/home/will/dev/BOSS-TONE-STUDIO-for-Linux/setups/variations/mixed/manual-brit-hybrid-rat-20260323-184750/snapshot.json",
    "/home/will/dev/BOSS-TONE-STUDIO-for-Linux/setups/variations/by-pedal/intentional-20260323-181211/snapshot.json",
]


def sx(addr, data):
    cs = (128 - ((sum(addr) + sum(data)) % 128)) % 128
    msg = [0xF0, 0x41, 0x10, 0x01, 0x05, 0x07, 0x12, *addr, *data, cs, 0xF7]
    return " ".join(f"{b:02X}" for b in msg)


def send(port, msg):
    subprocess.run(["amidi", "-p", port, "-S", msg], check=True)


def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, int(v)))


def parse_args():
    p = argparse.ArgumentParser(description="Auto level-match a patch cycle to target RMS dBFS")
    p.add_argument("--port", default="hw:1,0,0")
    p.add_argument("--log-jsonl", default="/home/will/dev/BOSS-TONE-STUDIO-for-Linux/setups/analysis/level_log.jsonl")
    p.add_argument("--target-dbfs", type=float, default=-29.0)
    p.add_argument("--play-seconds", type=float, default=8.0)
    p.add_argument("--max-iters", type=int, default=3)
    p.add_argument("--tol-db", type=float, default=0.7)
    p.add_argument("--active-floor-dbfs", type=float, default=-45.0)
    p.add_argument("--out-dir", default="/home/will/dev/BOSS-TONE-STUDIO-for-Linux/setups/variations/level-matched")
    return p.parse_args()


def load_snapshot(path):
    with open(path) as f:
        s = json.load(f)
    amp = s.get("amp")
    ge10 = s.get("ge10_raw")
    ns = s.get("ns", [1, 18, 40])
    booster = s.get("booster")
    # Some snapshots imply no pedal.
    if s.get("distortion_pedal_used") is False:
        booster = [0, 0, 0, 0, 0, 0, 0, 0]
    if booster is None:
        booster = [0, 0, 0, 0, 0, 0, 0, 0]
    if amp is None or ge10 is None:
        raise RuntimeError(f"snapshot missing amp/ge10: {path}")
    return s, amp[:], booster[:], ge10[:], ns[:]


def apply_patch(port, amp, booster, ge10, ns):
    send(port, "F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7")  # editor on
    send(port, "F0 41 10 01 05 07 12 7F 00 01 00 00 04 7C F7")  # A:CH4
    send(port, sx([0x20, 0x00, 0x06, 0x00], amp))
    send(port, sx([0x20, 0x00, 0x0A, 0x00], booster))
    send(port, sx([0x20, 0x00, 0x4C, 0x00], [0x01, 0x00, 0x00]))  # EQ on
    send(port, sx([0x20, 0x00, 0x54, 0x00], ge10))
    send(port, sx([0x20, 0x00, 0x58, 0x00], ns))
    # Dry default.
    send(port, sx([0x20, 0x00, 0x08, 0x00], [0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
    send(port, sx([0x20, 0x00, 0x34, 0x0A], [0x00]))
    send(port, sx([0x20, 0x00, 0x36, 0x0A], [0x00]))
    send(port, sx([0x20, 0x00, 0x38, 0x0A], [0x00]))
    send(port, sx([0x10, 0x00, 0x1A, 0x03], [0x00]))
    send(port, sx([0x10, 0x00, 0x1A, 0x04], [0x00]))
    send(port, sx([0x10, 0x00, 0x1C, 0x03], [0x00]))
    send(port, sx([0x10, 0x00, 0x1C, 0x04], [0x00]))


def read_rows_between(path, t0, t1, floor_db):
    out = []
    if not os.path.exists(path):
        return out
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
                ts = datetime.fromisoformat(r["timestamp_utc"].replace("Z", "+00:00"))
                if t0 <= ts <= t1 and r.get("rms_dbfs", -120.0) >= floor_db:
                    out.append(r)
            except Exception:
                continue
    return out


def slug(path):
    return os.path.basename(os.path.dirname(path))


def save_result(out_dir, name, source_snapshot, amp, booster, ge10, ns, history, target):
    os.makedirs(out_dir, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    d = os.path.join(out_dir, f"{name}-lvl29-{ts}")
    os.makedirs(d, exist_ok=True)
    obj = {
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "source_snapshot": source_snapshot,
        "target_rms_dbfs": target,
        "amp": amp,
        "booster": booster,
        "ge10_raw": ge10,
        "ns": ns,
        "history": history,
    }
    with open(os.path.join(d, "snapshot.json"), "w") as f:
        json.dump(obj, f, indent=2)
    return d


def main():
    args = parse_args()
    print(f"Auto cycle start: target={args.target_dbfs} dBFS, play={args.play_seconds}s per pass")
    print("Keep playing continuously; script will move patch-by-patch and level-match.")
    for p in PATCHES:
        s, amp, booster, ge10, ns = load_snapshot(p)
        name = slug(p)
        print(f"\n== {name} ==")
        history = []
        for i in range(1, args.max_iters + 1):
            apply_patch(args.port, amp, booster, ge10, ns)
            print(f"[{name}] iter {i}: play now...")
            t0 = datetime.now(timezone.utc)
            time.sleep(args.play_seconds)
            t1 = datetime.now(timezone.utc)
            rows = read_rows_between(args.log_jsonl, t0, t1, args.active_floor_dbfs)
            if len(rows) < 2:
                print(f"[{name}] iter {i}: insufficient active samples ({len(rows)}), skipping adjustment")
                history.append({"iter": i, "samples": len(rows), "status": "insufficient"})
                continue
            mean = sum(r["rms_dbfs"] for r in rows) / len(rows)
            err = args.target_dbfs - mean
            history.append({"iter": i, "samples": len(rows), "mean_rms_dbfs": round(mean, 3), "error_db": round(err, 3)})
            print(f"[{name}] iter {i}: mean={mean:.3f} dBFS error={err:+.3f} dB")
            if abs(err) <= args.tol_db:
                print(f"[{name}] within tolerance ({args.tol_db} dB)")
                break

            # Conservative gain staging adjustments.
            step = int(round(err * 2.0))  # about 0.5 dB per raw step (empirical coarse control)
            step = max(-8, min(8, step))
            if step == 0:
                step = 1 if err > 0 else -1

            amp[1] = clamp(amp[1] + step)
            # If pedal is active, trim its effect-level too.
            if any(booster):
                booster[6] = clamp(booster[6] + step)
            print(f"[{name}] adjust: amp_vol={amp[1]} booster_lvl={booster[6] if any(booster) else 0} (step {step:+d})")

        out = save_result(args.out_dir, name, p, amp, booster, ge10, ns, history, args.target_dbfs)
        print(f"[{name}] saved: {out}")

    print("\nCycle complete.")


if __name__ == "__main__":
    raise SystemExit(main())
