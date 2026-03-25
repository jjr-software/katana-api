import shutil
from pathlib import Path

from sqlalchemy import text

from app.db import engine
from app.settings import get_settings


def run_startup_checks() -> None:
    settings = get_settings()

    pipewire_socket = Path(settings.pipewire_socket)
    if not pipewire_socket.exists():
        raise RuntimeError(f"PipeWire socket missing: {pipewire_socket}")

    midi_device_dir = Path(settings.midi_device_dir)
    if not midi_device_dir.exists():
        raise RuntimeError(f"MIDI device path missing: {midi_device_dir}")

    if shutil.which("amidi") is None:
        raise RuntimeError("amidi not found in container PATH")

    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
