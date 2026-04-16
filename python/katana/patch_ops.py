from __future__ import annotations

import asyncio
from dataclasses import dataclass

from .midi import AmidiTransport
from .model import KatanaPatch


ADDR_AMP = (0x20, 0x00, 0x06, 0x00)
ADDR_BOOSTER = (0x20, 0x00, 0x0A, 0x00)
ADDR_EQ_SWITCH = (0x20, 0x00, 0x4C, 0x00)
ADDR_GE10 = (0x20, 0x00, 0x54, 0x00)
ADDR_NS = (0x20, 0x00, 0x58, 0x00)
ADDR_SW = (0x20, 0x00, 0x08, 0x00)

ADDR_RVB_1 = (0x20, 0x00, 0x34, 0x0A)
ADDR_RVB_2 = (0x20, 0x00, 0x36, 0x0A)
ADDR_RVB_3 = (0x20, 0x00, 0x38, 0x0A)
ADDR_PEDALFX_COM = (0x20, 0x00, 0x48, 0x00)
ADDR_EQ_EACH_1 = (0x20, 0x00, 0x4C, 0x00)
ADDR_EQ_EACH_2 = (0x20, 0x00, 0x4E, 0x00)
ADDR_SOLO_COM = (0x20, 0x00, 0x3A, 0x00)
ADDR_SENDRETURN = (0x20, 0x00, 0x5A, 0x00)


@dataclass
class LevelingStageState:
    sw: list[int]
    pedalfx_com: list[int]
    ns: list[int]
    send_return: list[int]
    eq1: list[int]
    eq2: list[int]
    solo: list[int]


def _copy_state(s: LevelingStageState) -> LevelingStageState:
    return LevelingStageState(
        sw=list(s.sw),
        pedalfx_com=list(s.pedalfx_com),
        ns=list(s.ns),
        send_return=list(s.send_return),
        eq1=list(s.eq1),
        eq2=list(s.eq2),
        solo=list(s.solo),
    )


def _ensure_len(v: list[int], n: int) -> list[int]:
    out = list(v)
    while len(out) < n:
        out.append(0)
    return out[:n]


def stage_active_order(state: LevelingStageState) -> list[str]:
    out: list[str] = []
    if state.sw[0] != 0:
        out.append("booster")
    if state.sw[1] != 0:
        out.append("mod")
    if state.sw[2] != 0:
        out.append("fx")
    if state.sw[3] != 0:
        out.append("delay")
    if state.sw[4] != 0:
        out.append("delay2")
    if state.sw[5] != 0:
        out.append("reverb")
    if state.pedalfx_com[1] != 0:
        out.append("pedalfx")
    if state.ns[0] != 0:
        out.append("ns")
    if state.send_return[0] != 0:
        out.append("send_return")
    if state.eq1[1] != 0:
        out.append("eq1")
    if state.eq2[1] != 0:
        out.append("eq2")
    if state.solo[0] != 0:
        out.append("solo")
    return out


async def read_leveling_stage_state(transport: AmidiTransport) -> LevelingStageState:
    sw = _ensure_len(await transport.read_rq1(ADDR_SW, 6), 6)
    pedalfx_com = _ensure_len(await transport.read_rq1(ADDR_PEDALFX_COM, 3), 3)
    ns = _ensure_len(await transport.read_rq1(ADDR_NS, 3), 3)
    send_return = _ensure_len(await transport.read_rq1(ADDR_SENDRETURN, 5), 5)
    eq1 = _ensure_len(await transport.read_rq1(ADDR_EQ_EACH_1, 3), 3)
    eq2 = _ensure_len(await transport.read_rq1(ADDR_EQ_EACH_2, 3), 3)
    solo = _ensure_len(await transport.read_rq1(ADDR_SOLO_COM, 2), 2)
    return LevelingStageState(sw=sw, pedalfx_com=pedalfx_com, ns=ns, send_return=send_return, eq1=eq1, eq2=eq2, solo=solo)


async def write_leveling_stage_state(transport: AmidiTransport, state: LevelingStageState) -> None:
    await transport.send_dt1(ADDR_SW, _ensure_len(state.sw, 6))
    await transport.send_dt1(ADDR_PEDALFX_COM, _ensure_len(state.pedalfx_com, 3))
    await transport.send_dt1(ADDR_NS, _ensure_len(state.ns, 3))
    await transport.send_dt1(ADDR_SENDRETURN, _ensure_len(state.send_return, 5))
    await transport.send_dt1(ADDR_EQ_EACH_1, _ensure_len(state.eq1, 3))
    await transport.send_dt1(ADDR_EQ_EACH_2, _ensure_len(state.eq2, 3))
    await transport.send_dt1(ADDR_SOLO_COM, _ensure_len(state.solo, 2))


def bypassed_stage_state(original: LevelingStageState) -> LevelingStageState:
    s = _copy_state(original)
    s.sw = [0, 0, 0, 0, 0, 0]
    if len(s.pedalfx_com) >= 2:
        s.pedalfx_com[1] = 0
    if len(s.ns) >= 1:
        s.ns[0] = 0
    if len(s.send_return) >= 1:
        s.send_return[0] = 0
    if len(s.eq1) >= 2:
        s.eq1[1] = 0
    if len(s.eq2) >= 2:
        s.eq2[1] = 0
    if len(s.solo) >= 1:
        s.solo[0] = 0
    return s


def state_with_enabled_stages(
    bypassed: LevelingStageState,
    original: LevelingStageState,
    enabled: set[str],
) -> LevelingStageState:
    s = _copy_state(bypassed)
    for name in enabled:
        if name == "booster":
            s.sw[0] = original.sw[0]
        elif name == "mod":
            s.sw[1] = original.sw[1]
        elif name == "fx":
            s.sw[2] = original.sw[2]
        elif name == "delay":
            s.sw[3] = original.sw[3]
        elif name == "delay2":
            s.sw[4] = original.sw[4]
        elif name == "reverb":
            s.sw[5] = original.sw[5]
        elif name == "pedalfx":
            s.pedalfx_com[1] = original.pedalfx_com[1]
        elif name == "ns":
            s.ns[0] = original.ns[0]
        elif name == "send_return":
            s.send_return[0] = original.send_return[0]
        elif name == "eq1":
            s.eq1[1] = original.eq1[1]
        elif name == "eq2":
            s.eq2[1] = original.eq2[1]
        elif name == "solo":
            s.solo[0] = original.solo[0]
    return s


async def apply_patch(transport: AmidiTransport, patch: KatanaPatch, slot: int = 4, store: bool = False) -> None:
    patch.validate()
    await transport.set_editor_mode(True)
    await transport.select_patch(slot)
    await transport.send_dt1(ADDR_AMP, patch.amp)
    await transport.send_dt1(ADDR_BOOSTER, patch.booster)
    await transport.send_dt1(ADDR_EQ_SWITCH, [0x01, 0x00, 0x00])
    await transport.send_dt1(ADDR_GE10, patch.ge10_raw)
    await transport.send_dt1(ADDR_NS, patch.ns)
    if store:
        await transport.write_patch(slot)
        await asyncio.sleep(0.25)


async def pull_patch(transport: AmidiTransport) -> KatanaPatch:
    await transport.set_editor_mode(True)
    amp = await transport.read_rq1(ADDR_AMP, 10)
    booster = await transport.read_rq1(ADDR_BOOSTER, 8)
    ge10_raw = await transport.read_rq1(ADDR_GE10, 11)
    ns = await transport.read_rq1(ADDR_NS, 3)
    eq_switch = await transport.read_rq1(ADDR_EQ_SWITCH, 3)
    patch = KatanaPatch(
        amp=amp,
        booster=booster,
        ge10_raw=ge10_raw,
        ns=ns,
        metadata={"eq_switch": eq_switch},
    )
    patch.validate()
    return patch
