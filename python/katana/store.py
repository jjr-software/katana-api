from __future__ import annotations

import json
import os
from datetime import datetime

from .model import KatanaPatch


def load_patch(path: str) -> KatanaPatch:
    with open(path, "r", encoding="utf-8") as handle:
        obj = json.load(handle)
    return KatanaPatch.from_snapshot(obj)


def save_patch(path: str, patch: KatanaPatch, extra: dict | None = None) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    payload = patch.to_snapshot()
    payload["updated_at"] = datetime.now().isoformat(timespec="seconds")
    if extra:
        payload.update(extra)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
