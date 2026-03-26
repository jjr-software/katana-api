import asyncio
from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from uuid import uuid4

from app.katana import AmpClient, AmpClientError, SlotsStateSnapshot
from app.settings import get_settings

JobStatus = Literal["queued", "running", "succeeded", "failed"]


@dataclass
class SlotsSyncJob:
    job_id: str
    status: JobStatus
    created_at: str
    started_at: str | None = None
    finished_at: str | None = None
    error: str | None = None
    result: SlotsStateSnapshot | None = None


class AmpJobQueue:
    def __init__(self) -> None:
        self._queue: asyncio.Queue[str] = asyncio.Queue()
        self._jobs: dict[str, SlotsSyncJob] = {}
        self._worker_task: asyncio.Task[None] | None = None
        self._jobs_lock = asyncio.Lock()

    async def start(self) -> None:
        if self._worker_task is not None and not self._worker_task.done():
            return
        self._worker_task = asyncio.create_task(self._worker_loop(), name="amp-slots-sync-worker")

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

    async def enqueue_slots_sync(self) -> SlotsSyncJob:
        job = SlotsSyncJob(
            job_id=str(uuid4()),
            status="queued",
            created_at=datetime.now().isoformat(timespec="seconds"),
        )
        async with self._jobs_lock:
            self._jobs[job.job_id] = job
        await self._queue.put(job.job_id)
        return job

    async def get_job(self, job_id: str) -> SlotsSyncJob | None:
        async with self._jobs_lock:
            return self._jobs.get(job_id)

    async def _worker_loop(self) -> None:
        while True:
            job_id = await self._queue.get()
            try:
                await self._run_slots_sync(job_id)
            finally:
                self._queue.task_done()

    async def _run_slots_sync(self, job_id: str) -> None:
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
        )
        synced_at = datetime.now().isoformat(timespec="seconds")
        try:
            result = await client.read_slots_state(synced_at=synced_at)
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
            done.result = result
            done.finished_at = datetime.now().isoformat(timespec="seconds")


amp_job_queue = AmpJobQueue()
