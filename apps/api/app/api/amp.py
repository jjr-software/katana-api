import re
import subprocess
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.settings import get_settings

IDENTITY_REQUEST_HEX = "F0 7E 7F 06 01 F7"
EDITOR_MODE_ON = "F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7"

ROLAND_ID = 0x41
MODEL_ID = (0x01, 0x05, 0x07)
CMD_RQ1 = 0x11
CMD_DT1 = 0x12

ADDR_AMP = (0x20, 0x00, 0x06, 0x00)
ADDR_BOOSTER = (0x20, 0x00, 0x0A, 0x00)
ADDR_EQ_SWITCH = (0x20, 0x00, 0x4C, 0x00)
ADDR_GE10 = (0x20, 0x00, 0x54, 0x00)
ADDR_NS = (0x20, 0x00, 0x58, 0x00)

router = APIRouter(prefix="/api/v1/amp", tags=["amp"])


class AmpConnectionTestResponse(BaseModel):
    ok: bool
    midi_port: str
    request_hex: str
    response_hex: str


class CurrentPatchResponse(BaseModel):
    created_at: str
    amp: list[int]
    booster: list[int]
    ge10_raw: list[int]
    ge10_db: list[int]
    ns: list[int]
    metadata: dict


def _extract_hex_pairs(output: str) -> list[str]:
    return re.findall(r"\b[0-9A-Fa-f]{2}\b", output)


def _checksum(payload: list[int]) -> int:
    total = sum(payload) % 128
    return (128 - total) % 128


def _build_rq1(addr: tuple[int, int, int, int], size: int) -> str:
    size_bytes = [(size >> 21) & 0x7F, (size >> 14) & 0x7F, (size >> 7) & 0x7F, size & 0x7F]
    cs = _checksum([*addr, *size_bytes])
    body = [0xF0, ROLAND_ID, 0x10, *MODEL_ID, CMD_RQ1, *addr, *size_bytes, cs, 0xF7]
    return " ".join(f"{b:02X}" for b in body)


def _extract_sysex_frames(output: str) -> list[list[int]]:
    tokens = _extract_hex_pairs(output)
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


def _parse_dt1(frame: list[int]) -> tuple[tuple[int, int, int, int], list[int]] | None:
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
    if _checksum([*addr, *data]) != frame[-2]:
        return None
    return addr, data


def _send_and_read(sysex_hex: str, timeout_sec: float, midi_port: str) -> str:
    result = subprocess.run(
        [
            "amidi",
            "-p",
            midi_port,
            "-d",
            "-t",
            str(timeout_sec),
            "-S",
            sysex_hex,
        ],
        capture_output=True,
        text=True,
        timeout=max(5.0, timeout_sec + 2.0),
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"amidi query failed: {result.stderr.strip() or result.stdout.strip()}")
    return result.stdout


def _send_only(sysex_hex: str, midi_port: str) -> None:
    result = subprocess.run(
        ["amidi", "-p", midi_port, "-S", sysex_hex],
        capture_output=True,
        text=True,
        timeout=5.0,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"amidi send failed: {result.stderr.strip() or result.stdout.strip()}")


def _read_rq1(addr: tuple[int, int, int, int], size: int, timeout_sec: float, midi_port: str) -> list[int]:
    out = _send_and_read(_build_rq1(addr, size), timeout_sec=timeout_sec, midi_port=midi_port)
    frames = _extract_sysex_frames(out)
    for frame in frames:
        parsed = _parse_dt1(frame)
        if parsed is None:
            continue
        dt1_addr, data = parsed
        if dt1_addr == addr:
            return data[:size]
    raise RuntimeError(f"No DT1 response for address {addr}")


@router.get("/test-connection", response_model=AmpConnectionTestResponse)
def test_connection() -> AmpConnectionTestResponse:
    settings = get_settings()

    result = subprocess.run(
        [
            "amidi",
            "-p",
            settings.katana_midi_port,
            "-d",
            "-t",
            str(settings.amidi_timeout_seconds),
            "-S",
            IDENTITY_REQUEST_HEX,
        ],
        capture_output=True,
        text=True,
        timeout=max(5.0, settings.amidi_timeout_seconds + 2.0),
        check=False,
    )

    if result.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "amidi command failed",
                "stderr": result.stderr.strip(),
                "stdout": result.stdout.strip(),
                "midi_port": settings.katana_midi_port,
            },
        )

    hex_pairs = _extract_hex_pairs(result.stdout)
    if len(hex_pairs) < 2:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "No SysEx response bytes detected from amp",
                "stdout": result.stdout.strip(),
                "midi_port": settings.katana_midi_port,
            },
        )

    response_hex = " ".join(pair.upper() for pair in hex_pairs)
    if not response_hex.startswith("F0") or not response_hex.endswith("F7"):
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Non-SysEx response received",
                "response_hex": response_hex,
                "midi_port": settings.katana_midi_port,
            },
        )

    return AmpConnectionTestResponse(
        ok=True,
        midi_port=settings.katana_midi_port,
        request_hex=IDENTITY_REQUEST_HEX,
        response_hex=response_hex,
    )


@router.get("/current-patch", response_model=CurrentPatchResponse)
def current_patch() -> CurrentPatchResponse:
    settings = get_settings()
    try:
        _send_only(EDITOR_MODE_ON, midi_port=settings.katana_midi_port)
        amp = _read_rq1(ADDR_AMP, 10, timeout_sec=settings.amidi_timeout_seconds, midi_port=settings.katana_midi_port)
        booster = _read_rq1(ADDR_BOOSTER, 8, timeout_sec=settings.amidi_timeout_seconds, midi_port=settings.katana_midi_port)
        ge10_raw = _read_rq1(ADDR_GE10, 11, timeout_sec=settings.amidi_timeout_seconds, midi_port=settings.katana_midi_port)
        ns = _read_rq1(ADDR_NS, 3, timeout_sec=settings.amidi_timeout_seconds, midi_port=settings.katana_midi_port)
        eq_switch = _read_rq1(ADDR_EQ_SWITCH, 3, timeout_sec=settings.amidi_timeout_seconds, midi_port=settings.katana_midi_port)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to read current patch from amp",
                "error": str(exc),
                "midi_port": settings.katana_midi_port,
            },
        ) from exc

    return CurrentPatchResponse(
        created_at=datetime.now().isoformat(timespec="seconds"),
        amp=amp,
        booster=booster,
        ge10_raw=ge10_raw,
        ge10_db=[v - 24 for v in ge10_raw],
        ns=ns,
        metadata={"eq_switch": eq_switch},
    )
