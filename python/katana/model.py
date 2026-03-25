from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


DEFAULT_NS = [0x01, 0x32, 0x28]
DEFAULT_BOOSTER = [0x00] * 8


def _to_int_list(values: list[int], expected: int, name: str) -> list[int]:
    out = [int(v) for v in values]
    if len(out) != expected:
        raise ValueError(f"{name} must contain {expected} values, got {len(out)}")
    return out


@dataclass
class KatanaPatch:
    amp: list[int]
    booster: list[int] = field(default_factory=lambda: DEFAULT_BOOSTER[:])
    ge10_raw: list[int] = field(default_factory=lambda: [24] * 11)
    ns: list[int] = field(default_factory=lambda: DEFAULT_NS[:])
    dry_default: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)

    def validate(self) -> None:
        self.amp = _to_int_list(self.amp, 10, "amp")
        self.booster = _to_int_list(self.booster, 8, "booster")
        self.ge10_raw = _to_int_list(self.ge10_raw, 11, "ge10_raw")
        self.ns = _to_int_list(self.ns, 3, "ns")

    @property
    def amp_volume(self) -> int:
        return int(self.amp[1])

    @amp_volume.setter
    def amp_volume(self, value: int) -> None:
        self.amp[1] = max(0, min(100, int(value)))

    @classmethod
    def from_snapshot(cls, obj: dict[str, Any]) -> "KatanaPatch":
        booster = obj.get("booster")
        if obj.get("distortion_pedal_used") is False:
            booster = [0] * 8
        if booster is None:
            booster = [0] * 8
        patch = cls(
            amp=list(obj["amp"]),
            booster=list(booster),
            ge10_raw=list(obj.get("ge10_raw") or obj.get("ge10") or [24] * 11),
            ns=list(obj.get("ns", DEFAULT_NS)),
            dry_default=bool(obj.get("dry_default", True)),
            metadata={
                k: v
                for k, v in obj.items()
                if k not in {"amp", "booster", "ge10_raw", "ge10", "ns", "dry_default"}
            },
        )
        patch.validate()
        return patch

    def to_snapshot(self) -> dict[str, Any]:
        self.validate()
        out = dict(self.metadata)
        out["created_at"] = out.get("created_at", datetime.now().isoformat(timespec="seconds"))
        out["amp"] = self.amp
        out["booster"] = self.booster
        out["ge10_raw"] = self.ge10_raw
        out["ge10_db"] = [v - 24 for v in self.ge10_raw]
        out["ns"] = self.ns
        out["dry_default"] = self.dry_default
        return out
