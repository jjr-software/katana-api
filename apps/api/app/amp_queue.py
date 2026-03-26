import asyncio
from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from uuid import uuid4

from app.katana import (
    AmpClient,
    AmpClientError,
    AmpConnectionResult,
    FullAmpDumpSnapshot,
    QuickSlotsSnapshot,
    SlotPatchSummary,
    SlotsStateSnapshot,
)
from app.settings import get_settings

JobStatus = Literal["queued", "running", "succeeded", "failed"]
JobOperation = Literal[
    "test_connection",
    "current_patch",
    "sync_slot",
    "full_dump",
    "full_sync_slots",
    "quick_sync_names",
]


@dataclass
class AmpQueueJob:
    job_id: str
    operation: JobOperation
    status: JobStatus
    created_at: str
    slot: int | None = None
    started_at: str | None = None
    finished_at: str | None = None
    error: str | None = None
    result_connection: AmpConnectionResult | None = None
    result_current_patch: dict | None = None
    result_slot: SlotPatchSummary | None = None
    result_dump: FullAmpDumpSnapshot | None = None
    result_slots: SlotsStateSnapshot | None = None
    result_quick: QuickSlotsSnapshot | None = None


class AmpJobQueue:
    def __init__(self) -> None:
        self._queue: asyncio.Queue[str] = asyncio.Queue()
        self._jobs: dict[str, AmpQueueJob] = {}
        self._worker_task: asyncio.Task[None] | None = None
        self._jobs_lock = asyncio.Lock()

    async def start(self) -> None:
        if self._worker_task is not None and not self._worker_task.done():
            return
        self._worker_task = asyncio.create_task(self._worker_loop(), name="amp-ops-worker")

    async def stop(self) -> None:
        task = self._worker_task
        self._worker_task = None
        if task is None:
            return
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    async def enqueue_slots_sync(self) -> AmpQueueJob:
        return await self._enqueue("full_sync_slots")

    async def enqueue_quick_sync(self) -> AmpQueueJob:
        return await self._enqueue("quick_sync_names")

    async def enqueue_slot_sync(self, slot: int) -> AmpQueueJob:
        return await self._enqueue("sync_slot", slot=slot)

    async def enqueue_test_connection(self) -> AmpQueueJob:
        return await self._enqueue("test_connection")

    async def enqueue_current_patch(self) -> AmpQueueJob:
        return await self._enqueue("current_patch")

    async def enqueue_full_dump(self) -> AmpQueueJob:
        return await self._enqueue("full_dump")

    async def _enqueue(self, operation: JobOperation, slot: int | None = None) -> AmpQueueJob:
        job = AmpQueueJob(
            job_id=str(uuid4()),
            operation=operation,
            status="queued",
            created_at=datetime.now().isoformat(timespec="seconds"),
            slot=slot,
        )
        async with self._jobs_lock:
            self._jobs[job.job_id] = job
        await self._queue.put(job.job_id)
        return job

    async def get_job(self, job_id: str) -> AmpQueueJob | None:
        async with self._jobs_lock:
            return self._jobs.get(job_id)

    async def list_jobs(self, limit: int = 25) -> list[AmpQueueJob]:
        max_items = max(1, min(int(limit), 200))
        async with self._jobs_lock:
            jobs = sorted(self._jobs.values(), key=lambda item: item.created_at, reverse=True)
            return jobs[:max_items]

    async def get_running_job_id(self) -> str | None:
        async with self._jobs_lock:
            for job in self._jobs.values():
                if job.status == "running":
                    return job.job_id
        return None

    async def _worker_loop(self) -> None:
        while True:
            job_id = await self._queue.get()
            try:
                await self._run_job(job_id)
            finally:
                self._queue.task_done()

    async def _run_job(self, job_id: str) -> None:
        async with self._jobs_lock:
            job = self._jobs.get(job_id)
            if job is None:
                return
            job.status = "running"
            job.started_at = datetime.now().isoformat(timespec="seconds")
            job.error = None

        settings = get_settings()
        client = AmpClient(
            midi_port=settings.katana_midi_port,
            timeout_seconds=settings.amidi_timeout_seconds,
            rq1_timeout_seconds=settings.amidi_rq1_timeout_seconds,
        )
        synced_at = datetime.now().isoformat(timespec="seconds")
        try:
            if job.operation == "test_connection":
                connection_result = await asyncio.wait_for(
                    client.test_connection(),
                    timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )
                current_patch_result = None
                slot_result = None
                dump_result = None
                slots_result = None
                quick_result = None
            elif job.operation == "current_patch":
                current_patch_result = await asyncio.wait_for(
                    client.read_current_patch(),
                    timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )
                connection_result = None
                slot_result = None
                dump_result = None
                slots_result = None
                quick_result = None
            elif job.operation == "sync_slot":
                slot_target = job.slot
                if slot_target is None:
                    raise RuntimeError("sync_slot operation missing slot")
                slot_result = await asyncio.wait_for(
                    client.read_slot_state(slot=slot_target, synced_at=synced_at),
                    timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )
                connection_result = None
                current_patch_result = None
                dump_result = None
                slots_result = None
                quick_result = None
            elif job.operation == "full_dump":
                dump_result = await asyncio.wait_for(
                    client.full_amp_dump(synced_at=synced_at),
                    timeout=max(5.0, settings.full_sync_timeout_seconds),
                )
                connection_result = None
                current_patch_result = None
                slot_result = None
                slots_result = None
                quick_result = None
            elif job.operation == "full_sync_slots":
                slots_result = await asyncio.wait_for(
                    client.read_slots_state(synced_at=synced_at),
                    timeout=max(5.0, settings.full_sync_timeout_seconds),
                )
                connection_result = None
                current_patch_result = None
                slot_result = None
                dump_result = None
                quick_result = None
            elif job.operation == "quick_sync_names":
                quick_result = await asyncio.wait_for(
                    client.read_slots_names_quick(synced_at=synced_at),
                    timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )
                connection_result = None
                current_patch_result = None
                slot_result = None
                dump_result = None
                slots_result = None
            else:
                raise RuntimeError(f"unknown operation: {job.operation}")
        except asyncio.TimeoutError:
            async with self._jobs_lock:
                failed = self._jobs.get(job_id)
                if failed is None:
                    return
                failed.status = "failed"
                failed.error = (
                    f"Queue job timed out: operation={job.operation} "
                    f"(full_sync_timeout_seconds={settings.full_sync_timeout_seconds}, "
                    f"quick_sync_timeout_seconds={settings.quick_sync_timeout_seconds})"
                )
                failed.finished_at = datetime.now().isoformat(timespec="seconds")
            return
        except AmpClientError as exc:
            async with self._jobs_lock:
                failed = self._jobs.get(job_id)
                if failed is None:
                    return
                failed.status = "failed"
                failed.error = str(exc)
                failed.finished_at = datetime.now().isoformat(timespec="seconds")
            return
        except Exception as exc:
            async with self._jobs_lock:
                failed = self._jobs.get(job_id)
                if failed is None:
                    return
                failed.status = "failed"
                failed.error = f"Unhandled queue error: {exc}"
                failed.finished_at = datetime.now().isoformat(timespec="seconds")
            return

        async with self._jobs_lock:
            done = self._jobs.get(job_id)
            if done is None:
                return
            done.status = "succeeded"
            done.result_connection = connection_result
            done.result_current_patch = current_patch_result.payload if current_patch_result is not None else None
            done.result_slot = slot_result
            done.result_dump = dump_result
            done.result_slots = slots_result
            done.result_quick = quick_result
            done.finished_at = datetime.now().isoformat(timespec="seconds")


amp_job_queue = AmpJobQueue()
