from __future__ import annotations

import re
from typing import Iterable


ROLAND_ID = 0x41
DEFAULT_DEVICE_ID = 0x10
MODEL_ID = (0x01, 0x05, 0x07)
CMD_RQ1 = 0x11
CMD_DT1 = 0x12


def clamp_byte(value: int) -> int:
    return max(0, min(127, int(value)))


def checksum(payload: Iterable[int]) -> int:
    total = sum(int(v) for v in payload) % 128
    return (128 - total) % 128


def _format_sysex(body: list[int]) -> str:
    return " ".join(f"{b:02X}" for b in body)


def build_dt1(addr: Iterable[int], data: Iterable[int], device_id: int = DEFAULT_DEVICE_ID) -> str:
    addr_bytes = [clamp_byte(v) for v in addr]
    data_bytes = [clamp_byte(v) for v in data]
    if len(addr_bytes) != 4:
        raise ValueError(f"DT1 address must be 4 bytes, got {len(addr_bytes)}")
    cs = checksum([*addr_bytes, *data_bytes])
    body = [0xF0, ROLAND_ID, device_id, *MODEL_ID, CMD_DT1, *addr_bytes, *data_bytes, cs, 0xF7]
    return _format_sysex(body)


def build_rq1(addr: Iterable[int], size: int, device_id: int = DEFAULT_DEVICE_ID) -> str:
    addr_bytes = [clamp_byte(v) for v in addr]
    if len(addr_bytes) != 4:
        raise ValueError(f"RQ1 address must be 4 bytes, got {len(addr_bytes)}")
    if size < 0:
        raise ValueError("RQ1 size must be >= 0")
    # Roland RQ1 encodes requested size in 4 x 7-bit bytes.
    size_bytes = [(size >> 21) & 0x7F, (size >> 14) & 0x7F, (size >> 7) & 0x7F, size & 0x7F]
    cs = checksum([*addr_bytes, *size_bytes])
    body = [0xF0, ROLAND_ID, device_id, *MODEL_ID, CMD_RQ1, *addr_bytes, *size_bytes, cs, 0xF7]
    return _format_sysex(body)


def extract_sysex_frames(text: str) -> list[list[int]]:
    tokens = re.findall(r"\b[0-9A-Fa-f]{2}\b", text)
    raw = [int(tok, 16) for tok in tokens]
    frames: list[list[int]] = []
    current: list[int] = []
    in_frame = False
    for value in raw:
        if value == 0xF0:
            current = [value]
            in_frame = True
            continue
        if not in_frame:
            continue
        current.append(value)
        if value == 0xF7:
            frames.append(current[:])
            current = []
            in_frame = False
    return frames


def parse_dt1(frame: list[int]) -> tuple[tuple[int, int, int, int], list[int]] | None:
    if len(frame) < 13:
        return None
    if frame[0] != 0xF0 or frame[-1] != 0xF7:
        return None
    if frame[1] != ROLAND_ID or tuple(frame[3:6]) != MODEL_ID:
        return None
    if frame[6] != CMD_DT1:
        return None
    addr = (frame[7], frame[8], frame[9], frame[10])
    data = frame[11:-2]
    msg_cs = frame[-2]
    if checksum([*addr, *data]) != msg_cs:
        return None
    return addr, data
