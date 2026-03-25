#!/usr/bin/env python3
import argparse
import json
import math
import os
import signal
import struct
import subprocess
import time
from datetime import datetime, timezone


DEFAULT_SOURCE = "alsa_input.usb-Roland_KATANA3-01.analog-surround-40"


def parse_args():
    p = argparse.ArgumentParser(description="Periodic PipeWire level logger (RMS/Peak dBFS)")
    p.add_argument("--source", default=DEFAULT_SOURCE, help="PipeWire source node name")
    p.add_argument("--rate", type=int, default=48000)
    p.add_argument("--channels", type=int, default=2)
    p.add_argument("--window-sec", type=float, default=1.0, help="Measurement window duration")
    p.add_argument("--interval-sec", type=float, default=2.0, help="Start-to-start period")
    p.add_argument("--samples", type=int, default=0, help="Number of windows, 0 = run forever")
    p.add_argument("--log-file", default="setups/analysis/level_log.jsonl")
    p.add_argument("--reference-file", default="setups/analysis/db_reference.json")
    return p.parse_args()


def linear_to_dbfs(v):
    if v <= 0.0:
        return -120.0
    return 20.0 * math.log10(v)


def ensure_log_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)


def read_target_rms_dbfs(path):
    if not path or not os.path.exists(path):
        return None
    try:
        with open(path) as f:
            d = json.load(f)
        v = d.get("target_rms_dbfs")
        if isinstance(v, (int, float)):
            return float(v)
    except Exception:
        return None
    return None


def start_stream(args):
    cmd = [
        "timeout",
        "365d",
        "pw-record",
        "--target",
        args.source,
        "--rate",
        str(args.rate),
        "--channels",
        str(args.channels),
        "--format",
        "f32",
        "-",
    ]
    return subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        bufsize=0,
    )


def read_exact(stream, total_bytes):
    buf = bytearray()
    while len(buf) < total_bytes:
        chunk = stream.read(total_bytes - len(buf))
        if not chunk:
            break
        buf.extend(chunk)
    return bytes(buf)


def analyze_chunk(raw):
    usable = (len(raw) // 4) * 4
    if usable == 0:
        return None
    raw = raw[:usable]

    vals = struct.unpack("<" + "f" * (len(raw) // 4), raw)
    s2 = 0.0
    peak = 0.0
    for v in vals:
        a = abs(v)
        if a > peak:
            peak = a
        s2 += v * v
    rms = math.sqrt(s2 / len(vals))
    rms_db = linear_to_dbfs(rms)
    peak_db = linear_to_dbfs(peak)
    return rms, peak, rms_db, peak_db, len(vals)


def main():
    args = parse_args()
    ensure_log_dir(args.log_file)
    target_rms_dbfs = read_target_rms_dbfs(args.reference_file)
    target_samples = int(args.rate * args.window_sec * args.channels)
    target_bytes = target_samples * 4
    stream_proc = start_stream(args)
    if stream_proc.stdout is None:
        raise RuntimeError("failed to open PipeWire stream")
    print(
        f"logger start: source={args.source} window={args.window_sec}s interval={args.interval_sec}s "
        f"log={args.log_file} mode=persistent-stream",
        flush=True,
    )

    running = True

    def _stop(_sig, _frame):
        nonlocal running
        running = False

    signal.signal(signal.SIGINT, _stop)
    signal.signal(signal.SIGTERM, _stop)

    i = 0
    next_tick = time.monotonic()
    try:
        while running:
            t0 = datetime.now(timezone.utc)
            raw = read_exact(stream_proc.stdout, target_bytes)
            m = analyze_chunk(raw)
            if stream_proc.poll() is not None and not m:
                print(f"{t0.isoformat(timespec='seconds')} stream-ended", flush=True)
                break
            if m is not None:
                rms, peak, rms_db, peak_db, n = m
                crest = peak_db - rms_db
                delta = None if target_rms_dbfs is None else (rms_db - target_rms_dbfs)
                evt = {
                    "timestamp_utc": t0.isoformat(timespec="seconds"),
                    "rate_hz": args.rate,
                    "channels": args.channels,
                    "window_sec": round(args.window_sec, 3),
                    "rms_linear": round(rms, 6),
                    "peak_linear": round(peak, 6),
                    "rms_dbfs": round(rms_db, 3),
                    "peak_dbfs": round(peak_db, 3),
                    "target_rms_dbfs": None if target_rms_dbfs is None else round(target_rms_dbfs, 3),
                    "delta_to_target_db": None if delta is None else round(delta, 3),
                    "crest_db": round(crest, 3),
                    "sample_count": n,
                }
                with open(args.log_file, "a") as f:
                    f.write(json.dumps(evt, separators=(",", ":")) + "\n")
                print(
                    f"{evt['timestamp_utc']} rms={evt['rms_dbfs']} dBFS peak={evt['peak_dbfs']} dBFS "
                    f"delta={evt['delta_to_target_db'] if evt['delta_to_target_db'] is not None else 'n/a'} dB "
                    f"crest={evt['crest_db']} dB n={n}",
                    flush=True,
                )
            else:
                print(f"{t0.isoformat(timespec='seconds')} no-audio-captured", flush=True)

            i += 1
            if args.samples > 0 and i >= args.samples:
                break
            next_tick += args.interval_sec
            sleep_s = next_tick - time.monotonic()
            if sleep_s > 0:
                time.sleep(sleep_s)
    finally:
        if stream_proc.poll() is None:
            stream_proc.terminate()
            try:
                stream_proc.wait(timeout=1.5)
            except subprocess.TimeoutExpired:
                stream_proc.kill()


if __name__ == "__main__":
    raise SystemExit(main())
