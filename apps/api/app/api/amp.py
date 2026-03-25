import re
import subprocess

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.settings import get_settings

IDENTITY_REQUEST_HEX = "F0 7E 7F 06 01 F7"

router = APIRouter(prefix="/api/v1/amp", tags=["amp"])


class AmpConnectionTestResponse(BaseModel):
    ok: bool
    midi_port: str
    request_hex: str
    response_hex: str


def _extract_hex_pairs(output: str) -> list[str]:
    return re.findall(r"\b[0-9A-Fa-f]{2}\b", output)


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
