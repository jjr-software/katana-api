#!/usr/bin/env python3
import argparse
import cmath
import json
import math
import os
import struct
import subprocess
import sys
import time
from datetime import datetime


def parse_args():
    p = argparse.ArgumentParser(description="Katana USB capture + active-play FFT")
    p.add_argument("--device", default="hw:KATANA3,0")
    p.add_argument("--rate", type=int, default=48000)
    p.add_argument("--channels", type=int, default=4)
    p.add_argument("--duration", type=int, default=8)
    p.add_argument("--countdown", type=int, default=4)
    p.add_argument("--channel-index", type=int, default=0, help="0-based channel")
    p.add_argument("--window", type=int, default=16384, help="FFT window size (power of 2)")
    p.add_argument("--record-dir", default="setups/recordings")
    p.add_argument("--analysis-dir", default="setups/analysis")
    p.add_argument("--reference-file", default="setups/analysis/db_reference.json")
    p.add_argument("--set-reference", action="store_true", help="Store this capture as global dB target")
    p.add_argument("--patch-label", default="current", help="Label stored in dB target file")
    p.add_argument("--min-active-sec", type=float, default=0.35)
    p.add_argument("--abs-floor", type=float, default=0.0005)
    return p.parse_args()


def read_wav_ieee_float32(path):
    with open(path, "rb") as f:
        b = f.read()
    if b[0:4] != b"RIFF" or b[8:12] != b"WAVE":
        raise RuntimeError("Not a WAV file")

    off = 12
    fmt = None
    data = None
    while off + 8 <= len(b):
        cid = b[off:off + 4]
        sz = int.from_bytes(b[off + 4:off + 8], "little")
        body = b[off + 8:off + 8 + sz]
        if cid == b"fmt ":
            fmt = body
        elif cid == b"data":
            data = body
        off += 8 + sz + (sz % 2)

    if fmt is None or data is None:
        raise RuntimeError("WAV missing fmt/data chunk")

    wfmt, ch, rate, _br, align, bits = struct.unpack("<HHIIHH", fmt[:16])
    if wfmt != 3:
        raise RuntimeError(f"Expected IEEE float format (3), got {wfmt}")
    if bits != 32:
        raise RuntimeError(f"Expected 32-bit float, got {bits}")
    frames = len(data) // align
    vals = struct.unpack("<" + "f" * (frames * ch), data)
    return rate, ch, frames, vals


def extract_channel(vals, frames, channels, idx):
    if idx < 0 or idx >= channels:
        raise RuntimeError(f"Invalid channel index {idx}, available 0..{channels-1}")
    out = [vals[i * channels + idx] for i in range(frames)]
    mean = sum(out) / len(out)
    return [v - mean for v in out]


def find_active_region(x, sr, min_active_sec, abs_floor):
    hop = 1024
    rms = []
    for i in range(0, len(x) - hop, hop):
        s = 0.0
        block = x[i:i + hop]
        for v in block:
            s += v * v
        rms.append(math.sqrt(s / hop))

    if not rms:
        raise RuntimeError("Capture too short")

    max_rms = max(rms)
    thr = max(abs_floor, max_rms * 0.20)
    min_blocks = max(1, int((min_active_sec * sr) / hop))

    best = None
    start = None
    for i, r in enumerate(rms):
        if r >= thr and start is None:
            start = i
        if r < thr and start is not None:
            if i - start >= min_blocks:
                if best is None or (i - start) > (best[1] - best[0]):
                    best = (start, i)
            start = None
    if start is not None:
        i = len(rms)
        if i - start >= min_blocks:
            if best is None or (i - start) > (best[1] - best[0]):
                best = (start, i)

    if best is None:
        return None, thr, max_rms

    a = best[0] * hop
    b = min(len(x), best[1] * hop)
    return (a, b), thr, max_rms


def fft_iter(real):
    n = len(real)
    x = [complex(v, 0.0) for v in real]

    j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j ^= bit
        if i < j:
            x[i], x[j] = x[j], x[i]

    m = 2
    while m <= n:
        ang = -2 * math.pi / m
        wm = complex(math.cos(ang), math.sin(ang))
        for k in range(0, n, m):
            w = 1 + 0j
            h = m // 2
            for t in range(h):
                u = x[k + t]
                v = w * x[k + t + h]
                x[k + t] = u + v
                x[k + t + h] = u - v
                w *= wm
        m <<= 1
    return x


def band_power(freqs, power, lo, hi):
    s = 0.0
    for f, p in zip(freqs, power):
        if lo <= f < hi:
            s += p
    return s


def linear_to_dbfs(v):
    if v <= 0.0:
        return -120.0
    return 20.0 * math.log10(v)


def main():
    args = parse_args()

    os.makedirs(args.record_dir, exist_ok=True)
    os.makedirs(args.analysis_dir, exist_ok=True)

    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    wav = os.path.join(args.record_dir, f"katana_take_{ts}_active.wav")
    js = os.path.join(args.analysis_dir, f"fft_{ts}_active.json")
    txt = os.path.join(args.analysis_dir, f"fft_{ts}_active.txt")

    print("Get ready to play...")
    for n in range(args.countdown, 0, -1):
        print(f"{n}...")
        sys.stdout.flush()
        time.sleep(1)
    print("REC")
    sys.stdout.flush()

    subprocess.run(
        [
            "arecord",
            "-D",
            args.device,
            "-f",
            "FLOAT_LE",
            "-c",
            str(args.channels),
            "-r",
            str(args.rate),
            "-d",
            str(args.duration),
            wav,
        ],
        check=True,
    )

    sr, ch, frames, vals = read_wav_ieee_float32(wav)
    x = extract_channel(vals, frames, ch, args.channel_index)
    region, thr, max_rms = find_active_region(x, sr, args.min_active_sec, args.abs_floor)
    if region is None:
        print("No active playing detected (mostly silence). Retry capture.")
        print(f"max_rms={max_rms:.6f}, threshold={thr:.6f}")
        return 2

    a, b = region
    active = x[a:b]
    active_rms = math.sqrt(sum(v * v for v in active) / len(active))
    active_peak = max(abs(v) for v in active)
    active_rms_dbfs = linear_to_dbfs(active_rms)
    active_peak_dbfs = linear_to_dbfs(active_peak)
    crest_db = active_peak_dbfs - active_rms_dbfs

    n = args.window
    if n & (n - 1):
        raise RuntimeError("--window must be a power of 2")
    if len(active) < n:
        raise RuntimeError(f"Active region too short ({len(active)} samples), need >= {n}")

    s = (len(active) - n) // 2
    w = active[s:s + n]
    for i in range(n):
        w[i] *= 0.5 - 0.5 * math.cos(2 * math.pi * i / (n - 1))

    X = fft_iter(w)
    half = n // 2
    freqs = []
    power = []
    for i in range(1, half + 1):
        f = i * sr / n
        if f < 40:
            continue
        c = X[i]
        p = c.real * c.real + c.imag * c.imag
        freqs.append(f)
        power.append(p)

    bands = {
        "bass_40_250": band_power(freqs, power, 40, 250),
        "low_mid_250_500": band_power(freqs, power, 250, 500),
        "mid_500_2k": band_power(freqs, power, 500, 2000),
        "high_mid_2k_6k": band_power(freqs, power, 2000, 6000),
        "presence_6k_12k": band_power(freqs, power, 6000, 12000),
        "air_12k_20k": band_power(freqs, power, 12000, 20000),
    }

    total = sum(bands.values()) or 1.0
    pct = {k: 100.0 * v / total for k, v in bands.items()}
    sump = sum(power) or 1.0
    centroid = sum(f * p for f, p in zip(freqs, power)) / sump
    cum = 0.0
    roll95 = freqs[-1]
    for f, p in zip(freqs, power):
        cum += p
        if cum >= 0.95 * sump:
            roll95 = f
            break

    result = {
        "file": wav,
        "sample_rate": sr,
        "frames": frames,
        "channels": ch,
        "analyzed_channel": args.channel_index + 1,
        "active_region_samples": [a, b],
        "active_region_seconds": [round(a / sr, 3), round(b / sr, 3)],
        "active_duration_sec": round((b - a) / sr, 3),
        "active_rms": round(active_rms, 6),
        "active_peak": round(active_peak, 6),
        "active_rms_dbfs": round(active_rms_dbfs, 3),
        "active_peak_dbfs": round(active_peak_dbfs, 3),
        "crest_factor_db": round(crest_db, 3),
        "rms_max": round(max_rms, 6),
        "rms_threshold": round(thr, 6),
        "fft_window_samples": n,
        "spectral_centroid_hz": round(centroid, 3),
        "spectral_rolloff_95_hz": round(roll95, 3),
        "band_power_percent": {k: round(v, 3) for k, v in pct.items()},
    }

    with open(js, "w") as f:
        json.dump(result, f, indent=2)
    with open(txt, "w") as f:
        f.write(f"file: {wav}\n")
        f.write(f"active_duration_sec: {result['active_duration_sec']}\n")
        f.write(f"active_rms_dbfs: {result['active_rms_dbfs']}\n")
        f.write(f"active_peak_dbfs: {result['active_peak_dbfs']}\n")
        f.write(f"crest_factor_db: {result['crest_factor_db']}\n")
        f.write(f"spectral_centroid_hz: {centroid:.1f}\n")
        f.write(f"spectral_rolloff_95_hz: {roll95:.1f}\n")
        for k, v in pct.items():
            f.write(f"{k}: {v:.2f}%\n")

    if args.set_reference:
        ref = {
            "updated_at": datetime.now().isoformat(timespec="seconds"),
            "patch_label": args.patch_label,
            "target_rms_dbfs": result["active_rms_dbfs"],
            "target_peak_dbfs": result["active_peak_dbfs"],
            "capture_json": js,
            "capture_wav": wav,
        }
        with open(args.reference_file, "w") as f:
            json.dump(ref, f, indent=2)

    print(json.dumps(result, indent=2))
    print(f"WAV={wav}")
    print(f"TXT={txt}")
    print(f"JSON={js}")
    print(f"ACTIVE_RMS_DBFS={result['active_rms_dbfs']}")
    print(f"ACTIVE_PEAK_DBFS={result['active_peak_dbfs']}")
    if args.set_reference:
        print(f"REFERENCE={args.reference_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
