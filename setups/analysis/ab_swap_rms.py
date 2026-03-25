#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import json
import os
import statistics
import sys
from datetime import datetime, timezone


REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
KATANA_PY_ROOT = os.path.join(REPO_ROOT, "setups", "python")
if KATANA_PY_ROOT not in sys.path:
    sys.path.insert(0, KATANA_PY_ROOT)

from katana import AmidiTransport, PipeWireSampler, apply_patch, load_patch  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Swap two patches and measure per-patch RMS via PipeWire (dBFS)."
    )
    parser.add_argument("--patch-a", required=True, help="Patch A snapshot path")
    parser.add_argument("--patch-b", required=True, help="Patch B snapshot path")
    parser.add_argument("--port", default="hw:1,0,0", help="amidi port")
    parser.add_argument("--slot", type=int, default=4, help="Target slot for patch apply")
    parser.add_argument(
        "--source",
        default="alsa_input.usb-Roland_KATANA3-01.analog-surround-40",
        help="PipeWire source node name",
    )
    parser.add_argument("--rate", type=int, default=48000)
    parser.add_argument("--channels", type=int, default=2)
    parser.add_argument("--window-sec", type=float, default=1.0)
    parser.add_argument(
        "--windows-per-patch",
        type=int,
        default=4,
        help="Number of RMS windows measured after each patch swap",
    )
    parser.add_argument("--cycles", type=int, default=4, help="A->B cycles")
    parser.add_argument("--settle-sec", type=float, default=1.0, help="Wait after each patch apply")
    parser.add_argument(
        "--active-floor-dbfs",
        type=float,
        default=-60.0,
        help="Ignore windows quieter than this",
    )
    parser.add_argument(
        "--report-json",
        default="",
        help="Optional output report path (JSON)",
    )
    return parser.parse_args()


def _mean(values: list[float]) -> float | None:
    if not values:
        return None
    return float(statistics.fmean(values))


async def _measure_patch(
    label: str,
    transport: AmidiTransport,
    sampler: PipeWireSampler,
    patch_path: str,
    slot: int,
    settle_sec: float,
    windows_per_patch: int,
    active_floor_dbfs: float,
) -> dict:
    patch = load_patch(patch_path)
    await apply_patch(transport, patch, slot=slot)
    await asyncio.sleep(max(0.0, settle_sec))

    windows: list[dict] = []
    for _ in range(max(1, windows_per_patch)):
        item = await sampler.sample_one()
        if item is None:
            continue
        if item.rms_dbfs < active_floor_dbfs:
            continue
        windows.append(
            {
                "timestamp_utc": item.timestamp_utc,
                "rms_dbfs": item.rms_dbfs,
                "peak_dbfs": item.peak_dbfs,
                "sample_count": item.sample_count,
            }
        )

    rms_values = [w["rms_dbfs"] for w in windows]
    mean_rms = _mean(rms_values)
    mean_peak = _mean([w["peak_dbfs"] for w in windows]) if windows else None

    return {
        "label": label,
        "patch": patch_path,
        "window_count": len(windows),
        "mean_rms_dbfs": None if mean_rms is None else round(mean_rms, 3),
        "mean_peak_dbfs": None if mean_peak is None else round(mean_peak, 3),
        "windows": windows,
    }


async def amain(args: argparse.Namespace) -> int:
    transport = AmidiTransport(port=args.port, timeout_sec=2.0)
    sampler = PipeWireSampler(
        source=args.source,
        rate=args.rate,
        channels=args.channels,
        window_sec=args.window_sec,
    )

    await sampler.start()
    try:
        results: list[dict] = []
        deltas: list[float] = []

        for cycle in range(1, max(1, args.cycles) + 1):
            rec_a = await _measure_patch(
                label="A",
                transport=transport,
                sampler=sampler,
                patch_path=args.patch_a,
                slot=args.slot,
                settle_sec=args.settle_sec,
                windows_per_patch=args.windows_per_patch,
                active_floor_dbfs=args.active_floor_dbfs,
            )
            rec_a["cycle"] = cycle
            results.append(rec_a)
            print(
                f"cycle={cycle} patch=A mean_rms={rec_a['mean_rms_dbfs']} dBFS "
                f"n={rec_a['window_count']}",
                flush=True,
            )

            rec_b = await _measure_patch(
                label="B",
                transport=transport,
                sampler=sampler,
                patch_path=args.patch_b,
                slot=args.slot,
                settle_sec=args.settle_sec,
                windows_per_patch=args.windows_per_patch,
                active_floor_dbfs=args.active_floor_dbfs,
            )
            rec_b["cycle"] = cycle
            results.append(rec_b)
            print(
                f"cycle={cycle} patch=B mean_rms={rec_b['mean_rms_dbfs']} dBFS "
                f"n={rec_b['window_count']}",
                flush=True,
            )

            a = rec_a["mean_rms_dbfs"]
            b = rec_b["mean_rms_dbfs"]
            if isinstance(a, (int, float)) and isinstance(b, (int, float)):
                delta = round(float(b) - float(a), 3)
                deltas.append(delta)
                print(f"cycle={cycle} delta(B-A)={delta} dB", flush=True)
            else:
                print(f"cycle={cycle} delta(B-A)=n/a", flush=True)

        all_a = [r["mean_rms_dbfs"] for r in results if r["label"] == "A" and isinstance(r["mean_rms_dbfs"], (int, float))]
        all_b = [r["mean_rms_dbfs"] for r in results if r["label"] == "B" and isinstance(r["mean_rms_dbfs"], (int, float))]
        mean_a = _mean([float(v) for v in all_a]) if all_a else None
        mean_b = _mean([float(v) for v in all_b]) if all_b else None
        mean_delta = _mean(deltas) if deltas else None

        summary = {
            "timestamp_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "patch_a": args.patch_a,
            "patch_b": args.patch_b,
            "cycles": args.cycles,
            "windows_per_patch": args.windows_per_patch,
            "source": args.source,
            "mean_a_rms_dbfs": None if mean_a is None else round(mean_a, 3),
            "mean_b_rms_dbfs": None if mean_b is None else round(mean_b, 3),
            "mean_delta_b_minus_a_db": None if mean_delta is None else round(mean_delta, 3),
            "per_cycle_delta_b_minus_a_db": deltas,
            "results": results,
        }

        print("---")
        print(json.dumps(summary, indent=2), flush=True)

        if args.report_json:
            os.makedirs(os.path.dirname(args.report_json) or ".", exist_ok=True)
            with open(args.report_json, "w", encoding="utf-8") as handle:
                json.dump(summary, handle, indent=2)
            print(f"report_json={args.report_json}", flush=True)
    finally:
        await sampler.close()

    return 0


def main() -> int:
    args = parse_args()
    return asyncio.run(amain(args))


if __name__ == "__main__":
    raise SystemExit(main())
