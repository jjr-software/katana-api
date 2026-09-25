import asyncio
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Literal
from uuid import uuid4

from sqlalchemy.exc import SQLAlchemyError

from app.db import SessionLocal
from app.katana import (
    AmpClient,
    AmpClientError,
    AmpConnectionResult,
    ActiveSlotSnapshot,
    FullAmpDumpSnapshot,
    LineOutSnapshot,
    SlotDump,
    SlotPatchSummary,
    SlotsStateSnapshot,
)
from app.live_patch_state import live_patch_status_payload, upsert_amp_slot_snapshot, upsert_live_patch_state
from app.models import AmpSyncHistory, LivePatchState
from app.patch_objects import merge_patch_object_into_full_patch
from app.settings import get_settings

JobStatus = Literal["queued", "running", "succeeded", "failed"]
JobOperation = Literal[
    "test_connection",
    "current_patch",
    "active_slot",
    "activate_slot",
    "readback_slot",
    "read_line_out",
    "write_line_out",
    "edit_current_patch",
    "sync_slot",
    "write_slot",
    "store_live_patch",
    "full_dump",
    "full_sync_slots",
]


@dataclass
class AmpQueueJob:
    job_id: str
    operation: JobOperation
    status: JobStatus
    created_at: str
    queue_key: str | None = None
    slot: int | None = None
    started_at: str | None = None
    finished_at: str | None = None
    error: str | None = None
    result_connection: AmpConnectionResult | None = None
    result_active_slot: ActiveSlotSnapshot | None = None
    result_activate_ms: int | None = None
    result_line_out: LineOutSnapshot | None = None
    result_live_patch_status: dict | None = None
    result_current_patch: dict | None = None
    request_patch: dict | None = None
    request_block_name: str | None = None
    request_patch_name: str | None = None
    request_source_type: str = "manual_apply"
    request_line_out: dict | None = None
    result_applied_patch: dict | None = None
    result_slot: SlotPatchSummary | None = None
    result_dump: FullAmpDumpSnapshot | None = None
    result_slots: SlotsStateSnapshot | None = None


class AmpJobQueue:
    def __init__(self) -> None:
        self._queue: asyncio.Queue[str] = asyncio.Queue()
        self._jobs: dict[str, AmpQueueJob] = {}
        self._completion: dict[str, asyncio.Event] = {}
        self._max_job_history = 120
        self._worker_task: asyncio.Task[None] | None = None
        self._jobs_lock = asyncio.Lock()
        self._state_change = asyncio.Condition()
        self._state_revision = 0

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

    async def enqueue_slot_sync(self, slot: int) -> AmpQueueJob:
        return await self._enqueue("sync_slot", slot=slot)

    async def enqueue_slot_write(self, slot: int, patch: dict) -> AmpQueueJob:
        return await self._enqueue("write_slot", slot=slot, request_patch=patch)

    async def enqueue_store_live_patch(self, slot: int) -> AmpQueueJob:
        return await self._enqueue("store_live_patch", slot=slot)

    async def enqueue_test_connection(self) -> AmpQueueJob:
        return await self._enqueue("test_connection")

    async def enqueue_current_patch(self) -> AmpQueueJob:
        return await self._enqueue("current_patch")

    async def enqueue_active_slot(self) -> AmpQueueJob:
        return await self._enqueue("active_slot")

    async def enqueue_activate_slot(self, slot: int) -> AmpQueueJob:
        return await self._enqueue("activate_slot", slot=slot)

    async def enqueue_slot_readback(self, slot: int) -> AmpQueueJob:
        return await self._enqueue("readback_slot", slot=slot)

    async def enqueue_line_out_read(self) -> AmpQueueJob:
        return await self._enqueue("read_line_out")

    async def enqueue_line_out_write(self, state: dict) -> AmpQueueJob:
        return await self._enqueue("write_line_out", request_line_out=state)

    async def enqueue_full_dump(self) -> AmpQueueJob:
        return await self._enqueue("full_dump")

    async def enqueue_patch_edit(
        self, *, patch: dict, block_name: str | None = None,
        patch_name: str | None = None, source_type: str = "manual_apply",
        queue_key: str | None = None,
    ) -> AmpQueueJob:
        # Every accepted edit retains its own identity and executes in order.
        return await self._enqueue(
            "edit_current_patch", request_patch=patch, request_block_name=block_name,
            request_patch_name=patch_name, request_source_type=source_type,
            queue_key=queue_key,
        )

    async def _enqueue(
        self,
        operation: JobOperation,
        slot: int | None = None,
        request_patch: dict | None = None,
        request_block_name: str | None = None,
        queue_key: str | None = None,
        request_patch_name: str | None = None,
        request_source_type: str = "manual_apply",
        request_line_out: dict | None = None,
    ) -> AmpQueueJob:
        async with self._jobs_lock:
            job = AmpQueueJob(
                job_id=str(uuid4()), operation=operation, status="queued",
                created_at=datetime.now().isoformat(timespec="seconds"),
                queue_key=queue_key, slot=slot, request_patch=request_patch,
                request_block_name=request_block_name,
                request_patch_name=request_patch_name,
                request_source_type=request_source_type,
                request_line_out=request_line_out,
            )
            self._jobs[job.job_id] = job
            self._completion[job.job_id] = asyncio.Event()
            self._prune_jobs_locked()
            await self._queue.put(job.job_id)
        await self.publish_state_change()
        return job

    async def get_state_revision(self) -> int:
        async with self._state_change:
            return self._state_revision

    async def wait_for_state_change(self, known_revision: int, timeout_seconds: float) -> int:
        async with self._state_change:
            if self._state_revision != known_revision:
                return self._state_revision
            try:
                await asyncio.wait_for(
                    self._state_change.wait_for(lambda: self._state_revision != known_revision),
                    timeout=timeout_seconds,
                )
            except asyncio.TimeoutError:
                pass
            return self._state_revision

    async def publish_state_change(self) -> None:
        async with self._state_change:
            self._state_revision += 1
            self._state_change.notify_all()

    async def get_job(self, job_id: str) -> AmpQueueJob | None:
        async with self._jobs_lock:
            return self._jobs.get(job_id)

    async def wait_for_job(self, job_id: str, timeout_seconds: float) -> AmpQueueJob | None:
        async with self._jobs_lock:
            completion = self._completion.get(job_id)
            job = self._jobs.get(job_id)
        if job is None or completion is None:
            return None
        try:
            await asyncio.wait_for(completion.wait(), timeout=timeout_seconds)
        except asyncio.TimeoutError:
            pass
        return await self.get_job(job_id)

    @staticmethod
    def _active_slot(patch: dict) -> int | None:
        active = patch.get("active_slot")
        return active.get("slot") if isinstance(active, dict) else None

    @staticmethod
    def _save_live_patch(patch: dict, *, source_type: str, confirmed_at: str) -> dict:
        with SessionLocal() as db:
            row = upsert_live_patch_state(
                db, full_patch=patch, active_slot=AmpJobQueue._active_slot(patch),
                amp_confirmed_at=confirmed_at, source_type=source_type,
            )
            return live_patch_status_payload(db, row)

    @staticmethod
    def _save_slot_snapshots(slots: list[SlotPatchSummary | SlotDump]) -> None:
        with SessionLocal() as db:
            for slot_result in slots:
                if slot_result.payload is None:
                    continue
                upsert_amp_slot_snapshot(
                    db, slot=slot_result.slot,
                    patch_name=str(slot_result.payload.get("patch_name", "")),
                    full_patch=slot_result.payload, amp_confirmed_at=slot_result.synced_at,
                )

    async def _refresh_live_patch(
        self, client: AmpClient, synced_at: str, source_type: str = "amp_sync",
        timeout_seconds: float = 60.0,
    ) -> dict:
        current = await asyncio.wait_for(client.read_current_patch(), timeout=timeout_seconds)
        return await asyncio.to_thread(
            self._save_live_patch, current.payload,
            source_type=source_type, confirmed_at=synced_at,
        )

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
        await self.publish_state_change()

        settings = get_settings()
        client = AmpClient(
            midi_port=settings.katana_midi_port,
            timeout_seconds=settings.amidi_timeout_seconds,
            rq1_timeout_seconds=settings.amidi_rq1_timeout_seconds,
        )
        synced_at = datetime.now().isoformat(timespec="seconds")
        try:
            applied_patch_result = None
            active_slot_result = None
            activate_ms_result = None
            line_out_result = None
            live_status_result = None
            warning_result = None
            if job.operation == "test_connection":
                connection_result = await asyncio.wait_for(
                    client.test_connection(),
                    timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )
                current_patch_result = None
                slot_result = None
                dump_result = None
                slots_result = None
            elif job.operation == "current_patch":
                current_patch_result = await asyncio.wait_for(
                    client.read_current_patch(),
                    timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )
                live_status_result = await asyncio.to_thread(
                    self._save_live_patch, current_patch_result.payload,
                    source_type="amp_sync", confirmed_at=synced_at,
                )
                connection_result = None
                slot_result = None
                dump_result = None
                slots_result = None
            elif job.operation == "active_slot":
                active_slot_result = await asyncio.wait_for(
                    client.read_active_slot(), timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )
                connection_result = None
                current_patch_result = None
                slot_result = None
                dump_result = None
                slots_result = None
            elif job.operation == "activate_slot":
                if job.slot is None:
                    raise RuntimeError("activate_slot operation missing slot")
                activate_ms_result = await asyncio.wait_for(
                    client.activate_slot(job.slot), timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )
                current_patch_result = None
                try:
                    current_patch_result = await asyncio.wait_for(
                        client.read_current_patch(), timeout=max(5.0, settings.full_sync_timeout_seconds),
                    )
                    live_status_result = await asyncio.to_thread(
                        self._save_live_patch, current_patch_result.payload,
                        source_type="amp_sync", confirmed_at=synced_at,
                    )
                except Exception as exc:
                    warning_result = f"Slot activated; Live Patch refresh unavailable: {exc}"
                connection_result = None
                slot_result = None
                dump_result = None
                slots_result = None
            elif job.operation == "readback_slot":
                if job.slot is None:
                    raise RuntimeError("readback_slot operation missing slot")
                slot_result = await asyncio.wait_for(
                    client.read_slot_state(slot=job.slot, synced_at=synced_at),
                    timeout=max(5.0, settings.full_sync_timeout_seconds),
                )
                await asyncio.to_thread(self._save_slot_snapshots, [slot_result])
                connection_result = None
                current_patch_result = None
                dump_result = None
                slots_result = None
            elif job.operation == "read_line_out":
                line_out_result = await asyncio.wait_for(
                    client.read_line_out_state(), timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )
                connection_result = None
                current_patch_result = None
                slot_result = None
                dump_result = None
                slots_result = None
            elif job.operation == "write_line_out":
                if job.request_line_out is None:
                    raise RuntimeError("write_line_out operation missing state")
                line_out_result = await asyncio.wait_for(
                    client.write_line_out_state(job.request_line_out),
                    timeout=max(5.0, settings.full_sync_timeout_seconds),
                )
                connection_result = None
                current_patch_result = None
                slot_result = None
                dump_result = None
                slots_result = None
            elif job.operation == "edit_current_patch":
                if job.request_patch is None:
                    raise RuntimeError("edit_current_patch operation missing patch edit")
                previous = (await asyncio.wait_for(
                    client.read_current_patch(),
                    timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )).payload
                rendered = merge_patch_object_into_full_patch(previous, job.request_patch)
                rendered["patch_name"] = (
                    job.request_patch_name[:16] if job.request_patch_name is not None
                    else str(previous.get("patch_name", ""))[:16]
                )
                if job.request_block_name is None:
                    applied_patch_result = await asyncio.wait_for(
                        client.apply_current_patch(rendered),
                        timeout=max(5.0, settings.full_sync_timeout_seconds),
                    )
                else:
                    applied_patch_result = await asyncio.wait_for(
                        client.apply_current_patch_block(
                            block_name=job.request_block_name,
                            previous_payload=previous, patch_payload=rendered,
                        ),
                        timeout=max(5.0, settings.full_sync_timeout_seconds),
                    )
                live_status_result = await asyncio.to_thread(
                    self._save_live_patch, applied_patch_result.payload,
                    source_type=job.request_source_type, confirmed_at=synced_at,
                )
                connection_result = None
                current_patch_result = None
                slot_result = None
                dump_result = None
                slots_result = None
            elif job.operation == "sync_slot":
                slot_target = job.slot
                if slot_target is None:
                    raise RuntimeError("sync_slot operation missing slot")
                slot_result = await asyncio.wait_for(
                    client.read_slot_state(slot=slot_target, synced_at=synced_at),
                    timeout=max(5.0, settings.full_sync_timeout_seconds),
                )
                await asyncio.to_thread(self._save_slot_snapshots, [slot_result])
                connection_result = None
                current_patch_result = None
                dump_result = None
                slots_result = None
                applied_patch_result = None
            elif job.operation == "write_slot":
                slot_target = job.slot
                if slot_target is None:
                    raise RuntimeError("write_slot operation missing slot")
                if job.request_patch is None:
                    raise RuntimeError("write_slot operation missing request patch")
                slot_result = await asyncio.wait_for(
                    client.write_slot_state(slot=slot_target, patch_payload=job.request_patch, synced_at=synced_at),
                    timeout=max(5.0, settings.full_sync_timeout_seconds),
                )
                try:
                    await asyncio.to_thread(self._save_slot_snapshots, [slot_result])
                except Exception as exc:
                    warning_result = f"Slot written; snapshot persistence failed: {exc}"
                connection_result = None
                current_patch_result = None
                dump_result = None
                slots_result = None
                applied_patch_result = None
            elif job.operation == "store_live_patch":
                slot_target = job.slot
                if slot_target is None:
                    raise RuntimeError("store_live_patch operation missing slot")
                with SessionLocal() as db:
                    live_row = db.get(LivePatchState, 1)
                    source_type = live_row.source_type if live_row is not None else "amp_sync"
                live_patch = (await asyncio.wait_for(
                    client.read_current_patch(),
                    timeout=max(5.0, settings.quick_sync_timeout_seconds),
                )).payload
                live_status_result = await asyncio.to_thread(
                    self._save_live_patch, live_patch,
                    source_type=source_type, confirmed_at=synced_at,
                )
                slot_result = await asyncio.wait_for(
                    client.write_slot_state(slot=slot_target, patch_payload=live_patch, synced_at=synced_at),
                    timeout=max(5.0, settings.full_sync_timeout_seconds),
                )
                try:
                    await asyncio.to_thread(self._save_slot_snapshots, [slot_result])
                except Exception as exc:
                    warning_result = f"Slot stored; snapshot persistence failed: {exc}"
                try:
                    live_status_result = await self._refresh_live_patch(
                        client, synced_at, source_type,
                        timeout_seconds=max(5.0, settings.full_sync_timeout_seconds),
                    )
                except Exception as exc:
                    refresh_warning = f"Slot stored; Live Patch refresh unavailable: {exc}"
                    warning_result = f"{warning_result}; {refresh_warning}" if warning_result else refresh_warning
                connection_result = None
                current_patch_result = None
                dump_result = None
                slots_result = None
                applied_patch_result = None
            elif job.operation == "full_dump":
                dump_result = await asyncio.wait_for(
                    client.full_amp_dump_via_export(synced_at=synced_at),
                    timeout=max(5.0, settings.full_sync_timeout_seconds),
                )
                await asyncio.to_thread(self._save_slot_snapshots, dump_result.slots)
                connection_result = None
                current_patch_result = None
                slot_result = None
                slots_result = None
                applied_patch_result = None
            elif job.operation == "full_sync_slots":
                slots_result = await asyncio.wait_for(
                    client.read_slots_state(synced_at=synced_at),
                    timeout=max(5.0, settings.full_sync_timeout_seconds),
                )
                await asyncio.to_thread(self._save_slot_snapshots, slots_result.slots)
                connection_result = None
                current_patch_result = None
                slot_result = None
                dump_result = None
                applied_patch_result = None
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
                    f"(full_sync_timeout_seconds={settings.full_sync_timeout_seconds})"
                )
                failed.finished_at = datetime.now().isoformat(timespec="seconds")
            await self._persist_sync_history_with_guard(failed)
            await self.publish_state_change()
            self._completion[job_id].set()
            return
        except AmpClientError as exc:
            async with self._jobs_lock:
                failed = self._jobs.get(job_id)
                if failed is None:
                    return
                failed.status = "failed"
                failed.error = str(exc)
                failed.finished_at = datetime.now().isoformat(timespec="seconds")
            await self._persist_sync_history_with_guard(failed)
            await self.publish_state_change()
            self._completion[job_id].set()
            return
        except Exception as exc:
            async with self._jobs_lock:
                failed = self._jobs.get(job_id)
                if failed is None:
                    return
                failed.status = "failed"
                failed.error = f"Unhandled queue error: {exc}"
                failed.finished_at = datetime.now().isoformat(timespec="seconds")
            await self._persist_sync_history_with_guard(failed)
            await self.publish_state_change()
            self._completion[job_id].set()
            return

        async with self._jobs_lock:
            done = self._jobs.get(job_id)
            if done is None:
                return
            done.status = "succeeded"
            done.result_connection = connection_result
            done.result_active_slot = active_slot_result
            done.result_activate_ms = activate_ms_result
            done.result_line_out = line_out_result
            done.result_live_patch_status = live_status_result
            done.result_current_patch = current_patch_result.payload if current_patch_result is not None else None
            done.result_applied_patch = applied_patch_result.payload if applied_patch_result is not None else None
            done.result_slot = slot_result
            done.result_dump = dump_result
            done.result_slots = slots_result
            done.error = warning_result
            done.finished_at = datetime.now().isoformat(timespec="seconds")
        try:
            await self._persist_sync_history_if_needed(done)
        except Exception as exc:
            async with self._jobs_lock:
                completed = self._jobs.get(job_id)
                if completed is None:
                    return
                history_warning = f"Sync history persistence failed: {exc}"
                completed.error = f"{completed.error}; {history_warning}" if completed.error else history_warning
        await self.publish_state_change()
        self._completion[job_id].set()

    async def _persist_sync_history_if_needed(self, job: AmpQueueJob) -> None:
        if not self._is_sync_operation(job.operation):
            return
        await asyncio.to_thread(self._persist_sync_history, job)

    async def _persist_sync_history_with_guard(self, job: AmpQueueJob) -> None:
        try:
            await self._persist_sync_history_if_needed(job)
        except Exception as exc:
            async with self._jobs_lock:
                failed = self._jobs.get(job.job_id)
                if failed is None:
                    return
                message = f"Sync history persistence failed: {exc}"
                failed.error = f"{failed.error}; {message}" if failed.error else message

    @staticmethod
    def _is_sync_operation(operation: JobOperation) -> bool:
        return operation in {"sync_slot", "readback_slot", "write_slot", "store_live_patch", "full_dump", "full_sync_slots"}

    def _prune_jobs_locked(self) -> None:
        if len(self._jobs) <= self._max_job_history:
            return
        overflow = len(self._jobs) - self._max_job_history
        if overflow <= 0:
            return
        removable = sorted(
            (
                job
                for job in self._jobs.values()
                if job.status in {"succeeded", "failed"}
                and job.finished_at is not None
                and datetime.fromisoformat(job.finished_at) <= datetime.now() - timedelta(minutes=10)
            ),
            key=lambda item: item.created_at,
        )
        for job in removable[:overflow]:
            self._jobs.pop(job.job_id, None)
            self._completion.pop(job.job_id, None)

    @staticmethod
    def _persist_sync_history(job: AmpQueueJob) -> None:
        synced_at = None
        amp_state_hash = None
        total_sync_ms = None
        slot_count = None
        result_json: dict | None = None

        if job.result_slot is not None:
            synced_at = job.result_slot.synced_at
            total_sync_ms = job.result_slot.slot_sync_ms
            slot_count = 1
            result_json = {
                "slot": {
                    "slot": job.result_slot.slot,
                    "slot_label": job.result_slot.slot_label,
                    "patch_name": job.result_slot.patch_name,
                    "config_hash_sha256": job.result_slot.config_hash_sha256,
                    "synced_at": job.result_slot.synced_at,
                    "slot_sync_ms": job.result_slot.slot_sync_ms,
                }
            }
        elif job.result_slots is not None:
            synced_at = job.result_slots.synced_at
            amp_state_hash = job.result_slots.amp_state_hash_sha256
            total_sync_ms = job.result_slots.total_sync_ms
            slot_count = len(job.result_slots.slots)
            result_json = {
                "amp_state_hash_sha256": job.result_slots.amp_state_hash_sha256,
                "slots": [
                    {
                        "slot": item.slot,
                        "slot_label": item.slot_label,
                        "patch_name": item.patch_name,
                        "config_hash_sha256": item.config_hash_sha256,
                        "synced_at": item.synced_at,
                        "slot_sync_ms": item.slot_sync_ms,
                    }
                    for item in job.result_slots.slots
                ],
            }
        elif job.result_dump is not None:
            synced_at = job.result_dump.synced_at
            amp_state_hash = job.result_dump.amp_state_hash_sha256
            total_sync_ms = job.result_dump.total_sync_ms
            slot_count = len(job.result_dump.slots)
            result_json = {
                "amp_state_hash_sha256": job.result_dump.amp_state_hash_sha256,
                "slots": [
                    {
                        "slot": item.slot,
                        "slot_label": item.slot_label,
                        "synced_at": item.synced_at,
                        "slot_sync_ms": item.slot_sync_ms,
                        "payload": item.payload,
                    }
                    for item in job.result_dump.slots
                ],
            }

        row = AmpSyncHistory(
            job_id=job.job_id,
            operation=job.operation,
            status=job.status,
            synced_at=synced_at,
            amp_state_hash_sha256=amp_state_hash,
            total_sync_ms=total_sync_ms,
            slot_count=slot_count,
            result_json=result_json,
            error=job.error,
        )
        session = SessionLocal()
        try:
            session.add(row)
            session.commit()
        except SQLAlchemyError:
            session.rollback()
            raise
        finally:
            session.close()


amp_job_queue = AmpJobQueue()
