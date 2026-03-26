import re

from app.katana.protocol import CMD_DT1, CMD_RQ1, MODEL_ID, ROLAND_ID


def extract_hex_pairs(output: str) -> list[str]:
    return re.findall(r"\b[0-9A-Fa-f]{2}\b", output)


def checksum(payload: list[int]) -> int:
    total = sum(payload) % 128
    return (128 - total) % 128


def build_rq1(addr: tuple[int, int, int, int], size: int) -> str:
    size_bytes = [(size >> 21) & 0x7F, (size >> 14) & 0x7F, (size >> 7) & 0x7F, size & 0x7F]
    cs = checksum([*addr, *size_bytes])
    body = [0xF0, ROLAND_ID, 0x10, *MODEL_ID, CMD_RQ1, *addr, *size_bytes, cs, 0xF7]
    return " ".join(f"{value:02X}" for value in body)


def build_dt1(addr: tuple[int, int, int, int], data: list[int]) -> str:
    cs = checksum([*addr, *data])
    body = [0xF0, ROLAND_ID, 0x10, *MODEL_ID, CMD_DT1, *addr, *data, cs, 0xF7]
    return " ".join(f"{value:02X}" for value in body)


def extract_sysex_frames(output: str) -> list[list[int]]:
    tokens = extract_hex_pairs(output)
    raw = [int(tok, 16) for tok in tokens]
    frames: list[list[int]] = []
    cur: list[int] = []
    in_frame = False
    for value in raw:
        if value == 0xF0:
            cur = [value]
            in_frame = True
            continue
        if not in_frame:
            continue
        cur.append(value)
        if value == 0xF7:
            frames.append(cur[:])
            cur = []
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
    if checksum([*addr, *data]) != frame[-2]:
        return None
    return addr, data
