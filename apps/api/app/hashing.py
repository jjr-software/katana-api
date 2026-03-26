import hashlib
import json
from typing import Any


def canonicalize_snapshot_for_hash(snapshot: dict[str, Any]) -> dict[str, Any]:
    canonical: dict[str, Any] = {}

    routing = snapshot.get("routing")
    if isinstance(routing, dict):
        routing_out: dict[str, Any] = {}
        for key in ("chain_pattern", "cabinet_resonance", "master_key"):
            if key in routing:
                routing_out[key] = routing[key]
        if routing_out:
            canonical["routing"] = routing_out

    colors = snapshot.get("colors")
    if isinstance(colors, dict):
        colors_out: dict[str, Any] = {}
        for stage in ("booster", "mod", "fx", "delay", "reverb"):
            stage_color = colors.get(stage)
            if isinstance(stage_color, dict) and "index" in stage_color:
                colors_out[stage] = {"index": stage_color["index"]}
        if colors_out:
            canonical["colors"] = colors_out

    amp = snapshot.get("amp")
    if isinstance(amp, dict):
        amp_out: dict[str, Any] = {}
        if isinstance(amp.get("raw"), list):
            amp_out["raw"] = amp["raw"]
        else:
            for key in (
                "gain",
                "volume",
                "bass",
                "middle",
                "treble",
                "presence",
                "poweramp_variation",
                "amp_type",
                "resonance",
                "preamp_variation",
            ):
                if key in amp:
                    amp_out[key] = amp[key]
        if amp_out:
            canonical["amp"] = amp_out

    stages = snapshot.get("stages")
    if isinstance(stages, dict):
        stages_out: dict[str, Any] = {}

        booster = stages.get("booster")
        if isinstance(booster, dict):
            out: dict[str, Any] = {}
            if "on" in booster:
                out["on"] = booster["on"]
            if isinstance(booster.get("variants_raw"), list):
                out["variants_raw"] = booster["variants_raw"]
            elif isinstance(booster.get("raw"), list):
                out["raw"] = booster["raw"]
            if out:
                stages_out["booster"] = out

        for stage_name in ("mod", "fx"):
            stage = stages.get(stage_name)
            if isinstance(stage, dict):
                out = {}
                if "on" in stage:
                    out["on"] = stage["on"]
                if isinstance(stage.get("variants_raw"), list):
                    out["variants_raw"] = stage["variants_raw"]
                elif isinstance(stage.get("raw"), list):
                    out["raw"] = stage["raw"]
                if out:
                    stages_out[stage_name] = out

        delay = stages.get("delay")
        if isinstance(delay, dict):
            out = {}
            if "on" in delay:
                out["on"] = delay["on"]
            if "delay2_on" in delay:
                out["delay2_on"] = delay["delay2_on"]
            if isinstance(delay.get("variants_raw"), list):
                out["variants_raw"] = delay["variants_raw"]
            elif isinstance(delay.get("raw"), list):
                out["raw"] = delay["raw"]
            if isinstance(delay.get("variants2_raw"), list):
                out["variants2_raw"] = delay["variants2_raw"]
            elif isinstance(delay.get("delay2_raw"), list):
                out["delay2_raw"] = delay["delay2_raw"]
            if out:
                stages_out["delay"] = out

        reverb = stages.get("reverb")
        if isinstance(reverb, dict):
            out = {}
            if "on" in reverb:
                out["on"] = reverb["on"]
            if isinstance(reverb.get("variants_raw"), list):
                out["variants_raw"] = reverb["variants_raw"]
            elif isinstance(reverb.get("raw"), list):
                out["raw"] = reverb["raw"]
            if out:
                stages_out["reverb"] = out

        for eq_name in ("eq1", "eq2"):
            eq = stages.get(eq_name)
            if isinstance(eq, dict):
                out = {}
                for key in ("position", "on", "type"):
                    if key in eq:
                        out[key] = eq[key]
                if isinstance(eq.get("peq_raw"), list):
                    out["peq_raw"] = eq["peq_raw"]
                if isinstance(eq.get("ge10_raw"), list):
                    out["ge10_raw"] = eq["ge10_raw"]
                if out:
                    stages_out[eq_name] = out

        ns = stages.get("ns")
        if isinstance(ns, dict):
            out = {}
            if isinstance(ns.get("raw"), list):
                out["raw"] = ns["raw"]
            else:
                for key in ("on", "threshold", "release"):
                    if key in ns:
                        out[key] = ns[key]
            if out:
                stages_out["ns"] = out

        send_return = stages.get("send_return")
        if isinstance(send_return, dict):
            out = {}
            if isinstance(send_return.get("raw"), list):
                out["raw"] = send_return["raw"]
            else:
                for key in ("on", "position", "mode", "send_level", "return_level"):
                    if key in send_return:
                        out[key] = send_return[key]
            if out:
                stages_out["send_return"] = out

        solo = stages.get("solo")
        if isinstance(solo, dict):
            out = {}
            if isinstance(solo.get("raw"), list):
                out["raw"] = solo["raw"]
            else:
                for key in ("on", "effect_level"):
                    if key in solo:
                        out[key] = solo[key]
            if out:
                stages_out["solo"] = out

        pedalfx = stages.get("pedalfx")
        if isinstance(pedalfx, dict):
            out = {}
            if isinstance(pedalfx.get("raw_com"), list):
                out["raw_com"] = pedalfx["raw_com"]
            if isinstance(pedalfx.get("raw"), list):
                out["raw"] = pedalfx["raw"]
            if not out:
                for key in ("position", "on", "type"):
                    if key in pedalfx:
                        out[key] = pedalfx[key]
            if out:
                stages_out["pedalfx"] = out

        if stages_out:
            canonical["stages"] = stages_out

    return canonical


def canonical_blob(snapshot: dict[str, Any]) -> str:
    canonical = canonicalize_snapshot_for_hash(snapshot)
    return json.dumps(canonical, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def snapshot_hash(snapshot: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_blob(snapshot).encode("utf-8")).hexdigest()
