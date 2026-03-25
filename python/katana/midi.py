from __future__ import annotations

import asyncio

from .sysex import build_dt1, build_rq1, extract_sysex_frames, parse_dt1


EDITOR_MODE_ON = "F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7"
PATCH_SELECT_ADDR = (0x7F, 0x00, 0x01, 0x00)
PATCH_WRITE_ADDR = (0x7F, 0x00, 0x01, 0x04)


class AmidiTransport:
    def __init__(self, port: str = "hw:1,0,0", timeout_sec: float = 2.0) -> None:
        self.port = port
        self.timeout_sec = float(timeout_sec)

    async def _run(self, *args: str) -> tuple[int, str, str]:
        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        out, err = await proc.communicate()
        return proc.returncode, out.decode("utf-8", errors="replace"), err.decode("utf-8", errors="replace")

    async def send_hex(self, sysex_hex: str) -> None:
        rc, _out, err = await self._run("amidi", "-p", self.port, "-S", sysex_hex)
        if rc != 0:
            raise RuntimeError(f"amidi send failed rc={rc}: {err.strip()}")

    async def query_hex(self, sysex_hex: str, timeout_sec: float | None = None) -> str:
        timeout = self.timeout_sec if timeout_sec is None else timeout_sec
        rc, out, err = await self._run("amidi", "-p", self.port, "-d", "-t", f"{timeout:g}", "-S", sysex_hex)
        if rc != 0:
            raise RuntimeError(f"amidi query failed rc={rc}: {err.strip()}")
        return out

    async def set_editor_mode(self, enabled: bool = True) -> None:
        if enabled:
            await self.send_hex(EDITOR_MODE_ON)

    async def select_patch(self, slot: int) -> None:
        slot_val = max(1, min(8, int(slot)))
        await self.send_dt1(PATCH_SELECT_ADDR, [0x00, slot_val])

    async def send_dt1(self, addr: tuple[int, int, int, int], data: list[int]) -> None:
        await self.send_hex(build_dt1(addr, data))

    async def write_patch(self, slot: int) -> None:
        slot_val = max(1, min(8, int(slot)))
        await self.send_dt1(PATCH_WRITE_ADDR, [0x00, slot_val])

    async def read_rq1(self, addr: tuple[int, int, int, int], size: int, timeout_sec: float | None = None) -> list[int]:
        out = await self.query_hex(build_rq1(addr, size), timeout_sec=timeout_sec)
        frames = extract_sysex_frames(out)
        for frame in frames:
            parsed = parse_dt1(frame)
            if parsed is None:
                continue
            dt1_addr, data = parsed
            if dt1_addr == addr:
                return data[:size]
        raise RuntimeError(f"No DT1 response for address {addr} in output: {out.strip()}")
