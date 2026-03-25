import asyncio
from dataclasses import dataclass

from app.katana.protocol import CURRENT_PATCH_BLOCKS, EDITOR_MODE_ON, IDENTITY_REQUEST_HEX
from app.katana.sysex import build_rq1, extract_hex_pairs, extract_sysex_frames, parse_dt1


class AmpClientError(RuntimeError):
    pass


@dataclass(frozen=True)
class AmpConnectionResult:
    midi_port: str
    request_hex: str
    response_hex: str


@dataclass(frozen=True)
class CurrentPatchSnapshot:
    amp: list[int]
    booster: list[int]
    ge10_raw: list[int]
    ns: list[int]
    eq_switch: list[int]


class AmpClient:
    def __init__(self, midi_port: str, timeout_seconds: float) -> None:
        self._midi_port = midi_port
        self._timeout_seconds = timeout_seconds

    @property
    def midi_port(self) -> str:
        return self._midi_port

    async def test_connection(self) -> AmpConnectionResult:
        output = await self._send_and_read(IDENTITY_REQUEST_HEX, timeout_seconds=self._timeout_seconds)
        hex_pairs = extract_hex_pairs(output)
        if len(hex_pairs) < 2:
            raise AmpClientError("No SysEx response bytes detected from amp")

        response_hex = " ".join(pair.upper() for pair in hex_pairs)
        if not response_hex.startswith("F0") or not response_hex.endswith("F7"):
            raise AmpClientError(f"Non-SysEx response received: {response_hex}")

        return AmpConnectionResult(
            midi_port=self._midi_port,
            request_hex=IDENTITY_REQUEST_HEX,
            response_hex=response_hex,
        )

    async def read_current_patch(self) -> CurrentPatchSnapshot:
        await self._send_only(EDITOR_MODE_ON)

        block_data: dict[str, list[int]] = {}
        for block in CURRENT_PATCH_BLOCKS:
            block_data[block.name] = await self._read_rq1(block.addr, block.size)

        return CurrentPatchSnapshot(
            amp=block_data["amp"],
            booster=block_data["booster"],
            ge10_raw=block_data["ge10_raw"],
            ns=block_data["ns"],
            eq_switch=block_data["eq_switch"],
        )

    async def _run_amidi(self, args: list[str], timeout_seconds: float) -> tuple[int, str, str]:
        proc = await asyncio.create_subprocess_exec(
            "amidi",
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(),
                timeout=max(5.0, timeout_seconds + 2.0),
            )
        except asyncio.TimeoutError as exc:
            proc.kill()
            await proc.wait()
            raise AmpClientError("amidi command timed out") from exc
        stdout = stdout_bytes.decode("utf-8", errors="replace")
        stderr = stderr_bytes.decode("utf-8", errors="replace")
        return proc.returncode, stdout, stderr

    async def _send_and_read(self, sysex_hex: str, timeout_seconds: float) -> str:
        returncode, stdout, stderr = await self._run_amidi(
            ["-p", self._midi_port, "-d", "-t", str(timeout_seconds), "-S", sysex_hex],
            timeout_seconds=timeout_seconds,
        )
        if returncode != 0:
            raise AmpClientError(f"amidi query failed: {(stderr.strip() or stdout.strip())}")
        return stdout

    async def _send_only(self, sysex_hex: str) -> None:
        returncode, stdout, stderr = await self._run_amidi(
            ["-p", self._midi_port, "-S", sysex_hex],
            timeout_seconds=5.0,
        )
        if returncode != 0:
            raise AmpClientError(f"amidi send failed: {(stderr.strip() or stdout.strip())}")

    async def _read_rq1(self, addr: tuple[int, int, int, int], size: int) -> list[int]:
        output = await self._send_and_read(
            build_rq1(addr, size),
            timeout_seconds=self._timeout_seconds,
        )
        frames = extract_sysex_frames(output)
        for frame in frames:
            parsed = parse_dt1(frame)
            if parsed is None:
                continue
            dt1_addr, data = parsed
            if dt1_addr == addr:
                return data[:size]
        raise AmpClientError(f"No DT1 response for address {addr}")
