#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import sys
from datetime import datetime

from katana import (
    AmidiTransport,
    PipelineReport,
    PipeWireSampler,
    apply_patch,
    config_hash_for_payload,
    auto_level_patch,
    format_pipeline,
    inspect_pipeline,
    inspect_pipeline_all_slots,
    load_patch,
    pull_patch,
    save_patch,
)

IDENTITY_REQ_HEX = "F0 7E 7F 06 01 F7"
EDITOR_MODE_ADDR = (0x7F, 0x00, 0x00, 0x01)
AMP_BLOCK_ADDR = (0x20, 0x00, 0x06, 0x00)


class StatusSpinner:
    def __init__(self, enabled: bool = True) -> None:
        self.enabled = bool(enabled)
        self._message = ""
        self._running = False
        self._task: asyncio.Task[None] | None = None
        self._frames = ["|", "/", "-", "\\"]
        self._idx = 0

    def set_message(self, message: str) -> None:
        self._message = str(message).strip()

    async def start(self, message: str = "") -> None:
        if not self.enabled:
            return
        self.set_message(message)
        self._running = True
        self._task = asyncio.create_task(self._loop())

    async def _loop(self) -> None:
        while self._running:
            frame = self._frames[self._idx % len(self._frames)]
            self._idx += 1
            sys.stdout.write(f"\r{frame} {self._message}")
            sys.stdout.flush()
            await asyncio.sleep(0.1)

    async def stop(self, final_message: str = "") -> None:
        if not self.enabled:
            return
        self._running = False
        if self._task is not None:
            await self._task
        clear = " " * max(0, len(self._message) + 4)
        sys.stdout.write(f"\r{clear}\r")
        if final_message:
            sys.stdout.write(f"{final_message}\n")
        sys.stdout.flush()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Katana patch save/pull/apply/auto-level tool (asyncio-first)")
    parser.add_argument("--port", default="hw:1,0,0", help="amidi port")
    parser.add_argument("--timeout-sec", type=float, default=2.0, help="amidi read timeout")
    sub = parser.add_subparsers(dest="cmd", required=True)

    pull = sub.add_parser("pull", help="Pull patch state from amp and save snapshot JSON")
    pull.add_argument("--out", required=True, help="Output snapshot path")
    save = sub.add_parser("save", help="Alias of pull: save current patch state to snapshot JSON")
    save.add_argument("--out", required=True, help="Output snapshot path")

    apply_cmd = sub.add_parser("apply", help="Apply snapshot JSON to amp")
    apply_cmd.add_argument("--patch", required=True, help="Input snapshot path")
    apply_cmd.add_argument("--slot", type=int, default=4, help="Target slot select value (1-8)")
    apply_cmd.add_argument("--store", action="store_true", help="Commit current edit buffer into selected slot memory")
    apply_cmd.add_argument("--verify", action="store_true", help="Read back and verify amp/booster/ge10/ns after apply")

    batch = sub.add_parser("apply-batch", help="Fast batch apply/store for multiple slot=patch pairs")
    batch.add_argument(
        "--slot-patch",
        action="append",
        required=True,
        help="Pair in SLOT=PATH form (repeat), e.g. --slot-patch 1=foo.json",
    )
    batch.add_argument("--verify-end", action="store_true", help="Verify all programmed slots after batch completes")

    setup_5 = sub.add_parser("setup-5", help="Program exactly 5 consecutive slots from 5 snapshot files")
    setup_5.add_argument(
        "--patch",
        action="append",
        required=True,
        help="Snapshot path; repeat exactly 5 times in desired slot order",
    )
    setup_5.add_argument("--start-slot", type=int, default=1, help="First slot to program (1-4, writes 5 consecutive)")
    setup_5.add_argument("--verify-end", action="store_true", help="Verify all 5 slots after setup")
    setup_5.add_argument(
        "--manifest-out",
        default="",
        help="Optional output JSON manifest; default is setups/variations/session-YYYYMMDD/slots5-manifest-HHMMSS.json",
    )

    cycle_5 = sub.add_parser("cycle-5", help="Cycle through 5 consecutive slots for auditioning")
    cycle_5.add_argument("--start-slot", type=int, default=1, help="First slot to cycle (1-4)")
    cycle_5.add_argument("--dwell-sec", type=float, default=2.0, help="Seconds to stay on each slot")
    cycle_5.add_argument("--cycles", type=int, default=0, help="Number of full 5-slot cycles (0 = run forever)")

    dump = sub.add_parser("dump-amp-state", help="Full amp state download to timestamped JSON cache")
    dump.add_argument(
        "--out",
        default="",
        help="Optional output path; default setups/backups/amp-state-YYYYMMDD-HHMMSS.json",
    )

    sub.add_parser("match-5", help="Special active mode: auto-match 5-slot loudness to first slot (no args)")
    pipe = sub.add_parser("pipeline", help="Read and print full pipeline stage state")
    pipe.add_argument("--slot", type=int, default=0, help="Optional slot index 1-8 to inspect; 0 = all channels")
    pipe.add_argument(
        "--all-channels",
        action="store_true",
        help="Fetch and print full pipeline for all channels A:1..B:4",
    )
    pipe.add_argument(
        "--dump-file",
        default="",
        help="Read from dump-amp-state JSON file instead of querying amp live",
    )
    pipe.add_argument("--json", action="store_true", help="Print full JSON payload")
    pipe.add_argument("--color", choices=["auto", "always", "never"], default="auto", help="ANSI color output mode")
    pipe.add_argument("--show-off", action="store_true", help="Include blocks that are OFF in text output")
    test = sub.add_parser("test-connection", help="Fast Katana MIDI connectivity round-trip test")
    test.add_argument("--slot", type=int, default=0, help="Optional slot 1-8 to select and probe; 0 skips slot probe")
    test.add_argument("--json", action="store_true", help="Print JSON result payload")

    level = sub.add_parser("level", help="Auto-level one or more patches by AMP VOLUME")
    level.add_argument("--patch", nargs="+", required=True, help="Patch snapshot path(s)")
    level.add_argument("--target-dbfs", type=float, default=-29.0)
    level.add_argument("--measure-seconds", type=float, default=6.0)
    level.add_argument("--iters", type=int, default=4)
    level.add_argument("--tol-db", type=float, default=0.7)
    level.add_argument("--active-floor-dbfs", type=float, default=-45.0)
    level.add_argument("--slot", type=int, default=4)
    level.add_argument("--source", default="alsa_input.usb-Roland_KATANA3-01.analog-surround-40")
    level.add_argument("--rate", type=int, default=48000)
    level.add_argument("--channels", type=int, default=2)
    level.add_argument("--window-sec", type=float, default=1.0)
    level.add_argument("--out-dir", default="setups/variations/level-matched")
    level.add_argument("--no-bypass-stomps", action="store_true", help="Do leveling with full chain active")
    level.add_argument(
        "--no-progressive-restore",
        action="store_true",
        help="When bypassing stomps, restore all blocks at once instead of one-by-one",
    )

    sample = sub.add_parser("sample", help="Sample USB level in 1-second chunks and optionally log JSONL")
    sample.add_argument("--source", default="alsa_input.usb-Roland_KATANA3-01.analog-surround-40")
    sample.add_argument("--rate", type=int, default=48000)
    sample.add_argument("--channels", type=int, default=2)
    sample.add_argument("--window-sec", type=float, default=1.0)
    sample.add_argument("--interval-sec", type=float, default=1.0)
    sample.add_argument("--samples", type=int, default=0, help="0 = run forever")
    sample.add_argument("--active-floor-dbfs", type=float, default=-45.0)
    sample.add_argument("--log-file", default="", help="Optional JSONL output path")

    return parser.parse_args()


def _make_leveled_path(out_dir: str, source_path: str) -> str:
    slug = os.path.basename(os.path.dirname(source_path)) or os.path.splitext(os.path.basename(source_path))[0]
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = os.path.join(out_dir, f"{slug}-lvl-{stamp}")
    os.makedirs(run_dir, exist_ok=True)
    return os.path.join(run_dir, "snapshot.json")


def _slot_from_index(start_slot: int, index: int) -> int:
    slot = start_slot + index
    if slot < 1 or slot > 8:
        raise ValueError(f"slot out of range after offset: {slot} (valid: 1..8)")
    return slot


def _slot_label(slot: int) -> str:
    slot_val = max(1, min(8, int(slot)))
    bank = "A" if slot_val <= 4 else "B"
    channel = ((slot_val - 1) % 4) + 1
    return f"{bank}:{channel}"


def _chain_summary(patch) -> str:
    eq_sw = patch.metadata.get("eq_switch") if isinstance(patch.metadata, dict) else None
    eq_on = None
    if isinstance(eq_sw, list) and len(eq_sw) >= 1:
        eq_on = int(eq_sw[0]) != 0
    booster_on = len(patch.booster) >= 1 and int(patch.booster[0]) != 0
    ns_on = len(patch.ns) >= 1 and int(patch.ns[0]) != 0
    parts = [
        f"amp(gain={patch.amp[0]},vol={patch.amp[1]},bass={patch.amp[2]},mid={patch.amp[3]},treble={patch.amp[4]},pres={patch.amp[5]})",
        f"booster({'on' if booster_on else 'off'},type={patch.booster[0]},level={patch.booster[6] if len(patch.booster) >= 7 else 'n/a'})",
        f"ge10({'on' if eq_on else ('off' if eq_on is not None else 'unknown')},mid={patch.ge10_raw[5] if len(patch.ge10_raw) >= 6 else 'n/a'})",
        f"ns({'on' if ns_on else 'off'},thr={patch.ns[1] if len(patch.ns) >= 2 else 'n/a'})",
    ]
    return " | ".join(parts)


def _load_pipeline_reports_from_dump(path: str) -> list[PipelineReport]:
    with open(path, "r", encoding="utf-8") as handle:
        obj = json.load(handle)
    items = obj.get("slots") if isinstance(obj, dict) else obj
    if not isinstance(items, list):
        raise ValueError(f"invalid dump format in {path}: expected top-level list or 'slots' list")
    out: list[PipelineReport] = []
    for row in items:
        if not isinstance(row, dict):
            continue
        slot = row.get("slot")
        slot_label = row.get("slot_label")
        if slot_label is None and slot is not None:
            slot_label = _slot_label(int(slot))
        if slot_label is None:
            slot_label = "unknown"
        payload = {k: v for k, v in row.items() if k not in {"slot", "slot_label"}}
        out.append(PipelineReport(slot=slot, slot_label=str(slot_label), payload=payload))
    return out


async def _run_pipeline(args: argparse.Namespace, transport: AmidiTransport | None) -> int:
    slot = None if int(args.slot) <= 0 else int(args.slot)
    all_channels = bool(args.all_channels or slot is None)
    from_dump = bool(args.dump_file)

    if from_dump:
        reports = _load_pipeline_reports_from_dump(args.dump_file)
        if slot is not None:
            reports = [r for r in reports if r.slot == slot]
            if not reports:
                raise RuntimeError(f"slot {slot} not found in dump file: {args.dump_file}")
        elif not all_channels and reports:
            reports = reports[:1]

        if args.json:
            if slot is not None and len(reports) == 1:
                report = reports[0]
                print(json.dumps({"slot": report.slot, "slot_label": report.slot_label, **report.payload}, indent=2))
            else:
                print(
                    json.dumps(
                        [{"slot": report.slot, "slot_label": report.slot_label, **report.payload} for report in reports],
                        indent=2,
                    )
                )
        else:
            for idx, report in enumerate(reports):
                if idx > 0:
                    print()
                print(format_pipeline(report, color=args.color, show_off=bool(args.show_off)))
        return 0

    if transport is None:
        raise RuntimeError("pipeline live mode requires transport")

    spinner = StatusSpinner(enabled=not bool(args.json))

    async def _progress(msg: str) -> None:
        spinner.set_message(msg)

    if all_channels:
        await spinner.start("starting full channel download")
        reports = await inspect_pipeline_all_slots(transport, progress=_progress)
        await spinner.stop("Downloaded channels A:1..B:4")
        if args.json:
            print(
                json.dumps(
                    [
                        {"slot": report.slot, "slot_label": report.slot_label, **report.payload}
                        for report in reports
                    ],
                    indent=2,
                )
            )
        else:
            for idx, report in enumerate(reports):
                if idx > 0:
                    print()
                print(format_pipeline(report, color=args.color, show_off=bool(args.show_off)))
        return 0

    await spinner.start("reading pipeline")
    report = await inspect_pipeline(transport, slot=slot, progress=_progress)
    await spinner.stop("Pipeline read complete")
    if args.json:
        print(json.dumps({"slot": report.slot, "slot_label": report.slot_label, **report.payload}, indent=2))
    else:
        print(format_pipeline(report, color=args.color, show_off=bool(args.show_off)))
    return 0


async def _run_dump_amp_state(args: argparse.Namespace, transport: AmidiTransport) -> int:
    spinner = StatusSpinner(enabled=True)

    async def _progress(msg: str) -> None:
        spinner.set_message(msg)

    out_path = args.out
    if not out_path:
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        out_path = f"setups/backups/amp-state-{stamp}.json"

    await spinner.start("starting full amp download")
    reports = await inspect_pipeline_all_slots(transport, progress=_progress)
    await spinner.stop("Full amp download complete")

    payload = {
        "captured_at": datetime.now().isoformat(timespec="seconds"),
        "port": transport.port,
        "slots": [
            {"slot": report.slot, "slot_label": report.slot_label, **report.payload}
            for report in reports
        ],
    }
    aggregate = [
        {
            "slot": report.slot,
            "slot_label": report.slot_label,
            "config_hash_sha256": config_hash_for_payload(report.payload),
        }
        for report in reports
    ]
    payload["amp_config_hash_sha256_excl_names"] = hashlib.sha256(
        json.dumps(aggregate, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    ).hexdigest()
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
    print(f"Saved full amp state: {out_path}")
    print(f"Amp config hash (excl patch names): {payload['amp_config_hash_sha256_excl_names']}")
    return 0


async def _run_test_connection(args: argparse.Namespace, transport: AmidiTransport) -> int:
    slot = int(args.slot)
    if slot < 0 or slot > 8:
        raise ValueError(f"--slot must be 0..8, got {slot}")

    result: dict[str, object] = {
        "port": transport.port,
        "timeout_sec": transport.timeout_sec,
        "identity_reply": "",
        "editor_mode": None,
        "slot": slot if slot > 0 else None,
        "slot_label": _slot_label(slot) if slot > 0 else None,
        "amp_probe": None,
    }

    identity_out = await transport.query_hex(IDENTITY_REQ_HEX, timeout_sec=transport.timeout_sec)
    identity_line = identity_out.strip().splitlines()
    result["identity_reply"] = identity_line[0] if identity_line else identity_out.strip()

    await transport.set_editor_mode(True)
    editor_mode = await transport.read_rq1(EDITOR_MODE_ADDR, 1, timeout_sec=transport.timeout_sec)
    result["editor_mode"] = int(editor_mode[0]) if editor_mode else None

    if slot > 0:
        await transport.select_patch(slot)
        amp = await transport.read_rq1(AMP_BLOCK_ADDR, 10, timeout_sec=transport.timeout_sec)
        result["amp_probe"] = amp

    ok = bool(result["identity_reply"]) and result["editor_mode"] == 1
    result["ok"] = ok
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Port: {transport.port}")
        print(f"Identity reply: {result['identity_reply'] or 'none'}")
        print(f"Editor mode readback: {result['editor_mode']}")
        if slot > 0:
            print(f"Slot probe {_slot_label(slot)} (index {slot}) amp bytes: {result['amp_probe']}")
        print(f"Result: {'OK' if ok else 'FAIL'}")
    return 0 if ok else 2


async def _verify_patch(transport: AmidiTransport, expected_patch, slot: int) -> None:
    await transport.select_patch(slot)
    actual = await pull_patch(transport)
    mismatches: list[str] = []
    if actual.amp != expected_patch.amp:
        mismatches.append("amp")
    if actual.booster != expected_patch.booster:
        mismatches.append("booster")
    if actual.ge10_raw != expected_patch.ge10_raw:
        mismatches.append("ge10_raw")
    if actual.ns != expected_patch.ns:
        mismatches.append("ns")
    if mismatches:
        raise RuntimeError(f"verify failed slot {slot}: {', '.join(mismatches)}")


async def _run_pull(args: argparse.Namespace, transport: AmidiTransport) -> int:
    patch = await pull_patch(transport)
    save_patch(args.out, patch)
    print(f"Saved pull snapshot: {args.out}")
    return 0


async def _run_apply(args: argparse.Namespace, transport: AmidiTransport) -> int:
    patch = load_patch(args.patch)
    await apply_patch(transport, patch, slot=args.slot, store=bool(args.store))
    if args.verify:
        await _verify_patch(transport, patch, args.slot)
        print("Verify OK: amp/booster/ge10/ns readback matches snapshot")
    print(f"Applied patch: {args.patch}")
    return 0


def _parse_slot_patch_pairs(items: list[str]) -> list[tuple[int, str]]:
    pairs: list[tuple[int, str]] = []
    for raw in items:
        if "=" not in raw:
            raise ValueError(f"invalid --slot-patch '{raw}', expected SLOT=PATH")
        left, right = raw.split("=", 1)
        slot = int(left.strip())
        path = right.strip()
        if not path:
            raise ValueError(f"invalid --slot-patch '{raw}', empty path")
        pairs.append((slot, path))
    return pairs


async def _run_apply_batch(args: argparse.Namespace, transport: AmidiTransport) -> int:
    pairs = _parse_slot_patch_pairs(args.slot_patch)
    loaded: list[tuple[int, str, object]] = []
    for slot, path in pairs:
        patch = load_patch(path)
        loaded.append((slot, path, patch))

    for slot, path, patch in loaded:
        await apply_patch(transport, patch, slot=slot, store=True)
        print(f"Stored {_slot_label(slot)} (index {slot}): {path}")

    if args.verify_end:
        for slot, _, patch in loaded:
            await _verify_patch(transport, patch, slot)
            print(f"Verify OK slot {slot}")
    return 0


async def _run_setup_5(args: argparse.Namespace, transport: AmidiTransport) -> int:
    if len(args.patch) != 5:
        raise ValueError(f"setup-5 requires exactly 5 --patch values, got {len(args.patch)}")
    if args.start_slot < 1 or args.start_slot > 4:
        raise ValueError(f"--start-slot must be 1..4 to fit 5 slots in 1..8, got {args.start_slot}")

    loaded: list[tuple[int, str, object]] = []
    for index, path in enumerate(args.patch):
        slot = _slot_from_index(args.start_slot, index)
        patch = load_patch(path)
        loaded.append((slot, path, patch))

    for slot, path, patch in loaded:
        await apply_patch(transport, patch, slot=slot, store=True)
        print(f"Stored {_slot_label(slot)} (index {slot}): {path}")

    if args.verify_end:
        for slot, _, patch in loaded:
            await _verify_patch(transport, patch, slot)
            print(f"Verify OK slot {slot}")

    manifest_out = args.manifest_out
    if not manifest_out:
        date_part = datetime.now().strftime("%Y%m%d")
        time_part = datetime.now().strftime("%H%M%S")
        manifest_out = f"setups/variations/session-{date_part}/slots5-manifest-{time_part}.json"

    out_obj = {
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "port": transport.port,
        "start_slot": args.start_slot,
        "slots": [
            {"slot": slot, "label": _slot_label(slot), "patch": os.path.abspath(path)} for slot, path, _ in loaded
        ],
    }
    os.makedirs(os.path.dirname(manifest_out) or ".", exist_ok=True)
    with open(manifest_out, "w", encoding="utf-8") as handle:
        json.dump(out_obj, handle, indent=2)
        handle.write("\n")
    print(f"Wrote 5-slot manifest: {manifest_out}")
    return 0


async def _run_cycle_5(args: argparse.Namespace, transport: AmidiTransport) -> int:
    if args.start_slot < 1 or args.start_slot > 4:
        raise ValueError(f"--start-slot must be 1..4 to fit 5 slots in 1..8, got {args.start_slot}")
    if args.dwell_sec <= 0:
        raise ValueError(f"--dwell-sec must be > 0, got {args.dwell_sec}")

    slot_list = [_slot_from_index(args.start_slot, i) for i in range(5)]
    round_idx = 0
    while args.cycles <= 0 or round_idx < args.cycles:
        round_idx += 1
        for slot in slot_list:
            await transport.select_patch(slot)
            print(f"Cycle {round_idx}: selected {_slot_label(slot)} (index {slot})")
            await asyncio.sleep(args.dwell_sec)
    return 0


async def _run_active_match_5(
    transport: AmidiTransport,
    start_slot: int,
    measure_seconds: float,
    match_tol_db: float,
    max_match_iters: int,
    match_step_scale: float,
    match_max_step: int,
    active_floor_dbfs: float,
    source: str,
    rate: int,
    channels: int,
    window_sec: float,
    settle_sec: float,
    store: bool,
    report_json: str,
    manual_target_rms_dbfs: float | None = None,
) -> int:
    if start_slot < 1 or start_slot > 4:
        raise ValueError(f"--start-slot must be 1..4 to fit 5 slots in 1..8, got {start_slot}")
    if measure_seconds <= 0:
        raise ValueError(f"--measure-seconds must be > 0, got {measure_seconds}")
    if max_match_iters <= 0:
        raise ValueError(f"--max-match-iters must be > 0, got {max_match_iters}")
    if window_sec <= 0:
        raise ValueError(f"--window-sec must be > 0, got {window_sec}")
    if settle_sec < 0:
        raise ValueError(f"--settle-sec must be >= 0, got {settle_sec}")

    slot_list = [_slot_from_index(start_slot, i) for i in range(5)]
    slot_alias = {slot: _slot_label(slot) for slot in slot_list}

    def _compute_step(error_db: float) -> int:
        step = int(round(error_db * match_step_scale))
        step = max(-match_max_step, min(match_max_step, step))
        if step == 0:
            step = 1 if error_db > 0 else -1
        return step

    sampler = PipeWireSampler(source=source, rate=rate, channels=channels, window_sec=window_sec)
    await sampler.start()
    try:
        async def _measure_slot_mean_rms(slot: int, reselect: bool = True) -> float:
            if reselect:
                await transport.select_patch(slot)
            if settle_sec > 0:
                await asyncio.sleep(settle_sec)
            samples = await sampler.sample_window(seconds=measure_seconds, active_floor_dbfs=active_floor_dbfs)
            if not samples:
                raise RuntimeError(f"no active samples captured for slot {slot}; play continuously")
            return sum(s.rms_dbfs for s in samples) / len(samples)

        reference_slot = slot_list[0]
        if manual_target_rms_dbfs is None:
            reference_rms = await _measure_slot_mean_rms(reference_slot)
            print(f"Active-match reference {slot_alias[reference_slot]}: measured={reference_rms:.3f} dBFS")
            reference_kind = "slot"
        else:
            reference_rms = float(manual_target_rms_dbfs)
            print(f"Active-match manual target: {reference_rms:.3f} dBFS")
            reference_kind = "manual"

        report: dict[str, object] = {
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "reference_type": reference_kind,
            "reference_slot": reference_slot if reference_kind == "slot" else None,
            "reference_rms_dbfs": round(reference_rms, 3),
            "store": bool(store),
            "slots": [],
        }

        for slot in slot_list[1:]:
            await transport.select_patch(slot)
            patch = await pull_patch(transport)
            slot_rec: dict[str, object] = {"slot": slot, "initial_amp_volume": patch.amp_volume, "iterations": []}
            stage_report = await inspect_pipeline(transport, slot=slot)
            print(format_pipeline(stage_report))
            slot_rec["pipeline"] = stage_report.payload

            controls: list[dict[str, object]] = [
                {
                    "name": "amp_volume",
                    "kind": "amp",
                    "idx": 1,
                    "min": 0,
                    "max": 100,
                    "probe_step": 4,
                }
            ]
            if len(patch.booster) >= 7 and int(patch.booster[0]) != 0:
                controls.append(
                    {
                        "name": "booster_level",
                        "kind": "booster",
                        "idx": 6,
                        "min": 0,
                        "max": 100,
                        "probe_step": 4,
                    }
                )

            def _get_control_value(ctrl: dict[str, object]) -> int:
                idx = int(ctrl["idx"])
                if ctrl["kind"] == "amp":
                    return int(patch.amp[idx])
                return int(patch.booster[idx])

            def _set_control_value(ctrl: dict[str, object], value: int) -> int:
                lo = int(ctrl["min"])
                hi = int(ctrl["max"])
                clamped = max(lo, min(hi, int(value)))
                idx = int(ctrl["idx"])
                if ctrl["kind"] == "amp":
                    patch.amp[idx] = clamped
                else:
                    patch.booster[idx] = clamped
                return clamped

            current_mean = await _measure_slot_mean_rms(slot, reselect=True)
            probe: list[dict[str, object]] = []
            selected_control = controls[0]
            selected_sens = 0.0
            for ctrl in controls:
                base_val = _get_control_value(ctrl)
                step = int(ctrl["probe_step"])
                up_val = _set_control_value(ctrl, base_val + step)
                actual_step = up_val - base_val
                if actual_step == 0:
                    probe.append({"control": ctrl["name"], "delta_db": 0.0, "actual_step": 0})
                    continue
                await apply_patch(transport, patch, slot=slot, store=False)
                if settle_sec > 0:
                    await asyncio.sleep(settle_sec)
                probe_mean = await _measure_slot_mean_rms(slot, reselect=False)
                delta_db = probe_mean - current_mean
                sens = abs(delta_db / actual_step) if actual_step != 0 else 0.0
                probe.append(
                    {
                        "control": ctrl["name"],
                        "base": base_val,
                        "probe": up_val,
                        "actual_step": actual_step,
                        "delta_db": round(delta_db, 3),
                        "sensitivity_db_per_unit": round(sens, 4),
                    }
                )
                _set_control_value(ctrl, base_val)
                await apply_patch(transport, patch, slot=slot, store=False)
                if sens > selected_sens:
                    selected_control = ctrl
                    selected_sens = sens

            if settle_sec > 0:
                await asyncio.sleep(settle_sec)
            print(
                f"Active-match {slot_alias[slot]}: selected control={selected_control['name']} "
                f"(probe={probe})"
            )
            slot_rec["selected_control"] = selected_control["name"]
            slot_rec["probe"] = probe

            matched = False
            clamped = False
            for idx in range(1, max_match_iters + 1):
                mean_rms = await _measure_slot_mean_rms(slot, reselect=(idx == 1))
                error_db = reference_rms - mean_rms
                iter_rec: dict[str, object] = {
                    "iter": idx,
                    "mean_rms_dbfs": round(mean_rms, 3),
                    "error_db": round(error_db, 3),
                    "amp_volume": patch.amp_volume,
                    "booster_level": int(patch.booster[6]) if len(patch.booster) >= 7 else None,
                }
                if abs(error_db) <= match_tol_db:
                    iter_rec["status"] = "within_tolerance"
                    slot_rec["iterations"].append(iter_rec)
                    matched = True
                    print(
                        f"Active-match {slot_alias[slot]}: measured={mean_rms:.3f} target={reference_rms:.3f} "
                        f"error={error_db:.3f} dB vol={patch.amp_volume} (within tolerance)"
                    )
                    break

                if selected_sens > 0.02:
                    raw_step = int(round(error_db / selected_sens))
                    raw_step = max(-match_max_step, min(match_max_step, raw_step))
                    if raw_step == 0:
                        raw_step = 1 if error_db > 0 else -1
                    step = raw_step
                else:
                    step = _compute_step(error_db)
                prev = _get_control_value(selected_control)
                new_val = _set_control_value(selected_control, prev + step)
                actual_step = new_val - prev
                if actual_step == 0:
                    iter_rec["status"] = "clamped"
                    iter_rec["adjust_step"] = 0
                    iter_rec["new_value"] = new_val
                    slot_rec["iterations"].append(iter_rec)
                    clamped = True
                    print(
                        f"Active-match {slot_alias[slot]}: measured={mean_rms:.3f} target={reference_rms:.3f} "
                        f"error={error_db:.3f} dB {selected_control['name']}={new_val} (clamped at limit)"
                    )
                    break
                iter_rec["status"] = "adjusted"
                iter_rec["adjust_step"] = actual_step
                iter_rec["control"] = selected_control["name"]
                iter_rec["new_value"] = new_val
                slot_rec["iterations"].append(iter_rec)
                await apply_patch(transport, patch, slot=slot, store=False)
                if settle_sec > 0:
                    await asyncio.sleep(settle_sec)
                print(
                    f"Active-match {slot_alias[slot]}: measured={mean_rms:.3f} target={reference_rms:.3f} "
                    f"error={error_db:.3f} dB step={actual_step:+d} "
                    f"{selected_control['name']}={new_val}"
                )

            slot_rec["matched"] = matched
            slot_rec["clamped"] = clamped
            slot_rec["final_amp_volume"] = patch.amp_volume
            if store:
                await apply_patch(transport, patch, slot=slot, store=True)
            report["slots"].append(slot_rec)
            if not matched:
                if clamped:
                    print(
                        f"Active-match {slot_alias[slot]}: stopped at volume limit, final vol={patch.amp_volume}"
                    )
                else:
                    print(
                        f"Active-match {slot_alias[slot]}: reached max iters ({max_match_iters}), final vol={patch.amp_volume}"
                    )

        if report_json:
            os.makedirs(os.path.dirname(report_json) or ".", exist_ok=True)
            with open(report_json, "w", encoding="utf-8") as handle:
                json.dump(report, handle, indent=2)
                handle.write("\n")
            print(f"Active-match report: {report_json}")
    finally:
        await sampler.close()
    return 0


async def _run_match_5(args: argparse.Namespace, transport: AmidiTransport) -> int:
    manual_target: float | None = None
    try:
        raw = input("Target RMS dBFS (blank = use slot 1 as reference): ").strip()
    except EOFError:
        raw = ""
    if raw:
        try:
            manual_target = float(raw)
        except ValueError as exc:
            raise ValueError(f"invalid target RMS dBFS '{raw}'") from exc

    date_part = datetime.now().strftime("%Y%m%d")
    time_part = datetime.now().strftime("%H%M%S")
    default_report = f"setups/analysis/match5_report_{date_part}-{time_part}.json"
    return await _run_active_match_5(
        transport=transport,
        start_slot=1,
        measure_seconds=2.0,
        match_tol_db=0.7,
        max_match_iters=8,
        match_step_scale=2.0,
        match_max_step=8,
        active_floor_dbfs=-45.0,
        source="alsa_input.usb-Roland_KATANA3-01.analog-surround-40",
        rate=48000,
        channels=2,
        window_sec=0.5,
        settle_sec=0.25,
        store=True,
        report_json=default_report,
        manual_target_rms_dbfs=manual_target,
    )


async def _run_level(args: argparse.Namespace, transport: AmidiTransport) -> int:
    sampler = PipeWireSampler(source=args.source, rate=args.rate, channels=args.channels, window_sec=args.window_sec)
    await sampler.start()
    try:
        for patch_path in args.patch:
            patch = load_patch(patch_path)
            print(f"Leveling {patch_path} target={args.target_dbfs} dBFS")
            leveled, history = await auto_level_patch(
                transport=transport,
                sampler=sampler,
                patch=patch,
                target_dbfs=args.target_dbfs,
                measure_seconds=args.measure_seconds,
                max_iters=args.iters,
                tolerance_db=args.tol_db,
                active_floor_dbfs=args.active_floor_dbfs,
                slot=args.slot,
                bypass_stomps=not bool(args.no_bypass_stomps),
                progressive_restore=not bool(args.no_progressive_restore),
            )
            out_path = _make_leveled_path(args.out_dir, patch_path)
            save_patch(
                out_path,
                leveled,
                extra={
                    "source_snapshot": os.path.abspath(patch_path),
                    "target_rms_dbfs": args.target_dbfs,
                    "history": history,
                },
            )
            print(f"Saved leveled patch: {out_path}")
            for rec in history:
                print(f"  {rec}")
    finally:
        await sampler.close()
    return 0


async def _run_sample(args: argparse.Namespace) -> int:
    sampler = PipeWireSampler(source=args.source, rate=args.rate, channels=args.channels, window_sec=args.window_sec)
    if args.log_file:
        os.makedirs(os.path.dirname(args.log_file) or ".", exist_ok=True)
    await sampler.start()
    try:
        count = 0
        while True:
            item = await sampler.sample_one()
            count += 1
            if item is None:
                print(f"{datetime.utcnow().isoformat(timespec='seconds')} no-audio-captured")
            else:
                status = "active" if item.rms_dbfs >= args.active_floor_dbfs else "quiet"
                evt = {
                    "timestamp_utc": item.timestamp_utc,
                    "rms_dbfs": item.rms_dbfs,
                    "peak_dbfs": item.peak_dbfs,
                    "sample_count": item.sample_count,
                    "status": status,
                }
                print(
                    f"{item.timestamp_utc} rms={item.rms_dbfs} dBFS peak={item.peak_dbfs} dBFS "
                    f"status={status} n={item.sample_count}"
                )
                if args.log_file:
                    with open(args.log_file, "a", encoding="utf-8") as handle:
                        handle.write(json.dumps(evt, separators=(",", ":")) + "\n")

            if args.samples > 0 and count >= args.samples:
                break
            await asyncio.sleep(max(0.0, args.interval_sec - args.window_sec))
    finally:
        await sampler.close()
    return 0


async def amain() -> int:
    args = parse_args()
    if args.cmd == "sample":
        return await _run_sample(args)
    if args.cmd == "pipeline" and args.dump_file:
        return await _run_pipeline(args, transport=None)

    transport = AmidiTransport(port=args.port, timeout_sec=args.timeout_sec)
    if args.cmd in {"pull", "save"}:
        return await _run_pull(args, transport)
    if args.cmd == "apply":
        return await _run_apply(args, transport)
    if args.cmd == "apply-batch":
        return await _run_apply_batch(args, transport)
    if args.cmd == "setup-5":
        return await _run_setup_5(args, transport)
    if args.cmd == "cycle-5":
        return await _run_cycle_5(args, transport)
    if args.cmd == "dump-amp-state":
        return await _run_dump_amp_state(args, transport)
    if args.cmd == "match-5":
        return await _run_match_5(args, transport)
    if args.cmd == "pipeline":
        return await _run_pipeline(args, transport)
    if args.cmd == "test-connection":
        return await _run_test_connection(args, transport)
    if args.cmd == "level":
        return await _run_level(args, transport)
    raise RuntimeError(f"unknown command: {args.cmd}")


def main() -> int:
    return asyncio.run(amain())


if __name__ == "__main__":
    raise SystemExit(main())
