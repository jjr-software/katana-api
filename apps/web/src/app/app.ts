import { Component, OnDestroy, OnInit, signal } from '@angular/core';

interface AmpConnectionTestResponse {
  ok: boolean;
  midi_port: string;
  request_hex: string;
  response_hex: string;
}

interface SlotPatchSummary {
  slot: number;
  slot_label: string;
  patch_name: string;
  config_hash_sha256: string;
  synced_at: string;
  slot_sync_ms: number;
}

interface QuickSlotSummary {
  slot: number;
  slot_label: string;
  patch_name: string;
  inferred_hash_sha256: string | null;
  candidate_hashes_sha256: string[];
  match_count: number;
  synced_at: string;
  slot_sync_ms: number;
}

interface SlotsStateResponse {
  synced_at: string;
  amp_state_hash_sha256: string;
  total_sync_ms: number;
  slots: SlotPatchSummary[];
}

interface SlotSyncResponse {
  synced_at: string;
  slot: SlotPatchSummary;
}

interface QuickSlotsStateResponse {
  synced_at: string;
  total_sync_ms: number;
  slots: QuickSlotSummary[];
}

interface SlotsSyncEnqueueResponse {
  job_id: string;
  operation: string;
  status: string;
  created_at: string;
}

interface SlotsSyncJobResponse {
  job_id: string;
  operation: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  elapsed_ms: number;
  error: string | null;
  result: SlotsStateResponse | null;
}

interface QuickSyncEnqueueResponse {
  job_id: string;
  operation: string;
  status: string;
  created_at: string;
}

interface QuickSyncJobResponse {
  job_id: string;
  operation: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  elapsed_ms: number;
  error: string | null;
  result: QuickSlotsStateResponse | null;
}

interface DeviceStatusResponse {
  midi_port: string;
  busy: boolean;
  available: boolean;
  concurrency_supported: boolean;
  detail: string;
  checked_at: string;
}

interface QueueJobSummary {
  job_id: string;
  operation: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  elapsed_ms: number;
  error: string | null;
}

interface QueueStateResponse {
  generated_at: string;
  queued_count: number;
  running_job_id: string | null;
  jobs: QueueJobSummary[];
}

interface SlotCard {
  slot: number;
  slot_label: string;
  patch_name: string;
  config_hash_sha256: string;
  synced_at: string;
  slot_sync_ms: number;
  inferred: boolean;
  match_count: number;
}

function defaultSlotCards(): SlotCard[] {
  return Array.from({ length: 8 }, (_, idx) => {
    const slot = idx + 1;
    const bank = slot <= 4 ? 'A' : 'B';
    const channel = slot <= 4 ? slot : slot - 4;
    return {
      slot,
      slot_label: `${bank}:${channel}`,
      patch_name: '',
      config_hash_sha256: '',
      synced_at: '',
      slot_sync_ms: 0,
      inferred: false,
      match_count: 0,
    };
  });
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private pollHandle: ReturnType<typeof setInterval> | null = null;

  isLoading = signal(false);
  status = signal('Idle');
  responseJson = signal('');
  slots = signal<SlotCard[]>(defaultSlotCards());
  ampStateHash = signal('');
  lastSyncedAt = signal('');
  totalSyncMs = signal(0);
  deviceBusy = signal(false);
  deviceAvailable = signal(false);
  deviceStatusText = signal('Checking amp device...');
  deviceStatusCheckedAt = signal('');
  deviceMidiPort = signal('');
  queueJobs = signal<QueueJobSummary[]>([]);
  queueGeneratedAt = signal('');
  queuePollHandle: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    void this.refreshDeviceStatus();
    void this.refreshQueueState();
    this.pollHandle = setInterval(() => {
      if (this.isLoading()) {
        return;
      }
      void this.refreshDeviceStatus();
    }, 4000);
    this.queuePollHandle = setInterval(() => {
      void this.refreshQueueState();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.pollHandle !== null) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
    if (this.queuePollHandle !== null) {
      clearInterval(this.queuePollHandle);
      this.queuePollHandle = null;
    }
  }

  async testAmpConnection(): Promise<void> {
    this.isLoading.set(true);
    this.status.set('Running amp identity request...');
    this.responseJson.set('');

    try {
      const response = await fetch('/api/v1/amp/test-connection', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await response.json()) as AmpConnectionTestResponse | { detail: unknown };
      if (!response.ok) {
        this.status.set('Connection test failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        this.updateBusyFromPayload(payload);
        await this.refreshDeviceStatus();
        return;
      }

      this.status.set('Connection test succeeded');
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set('Connection test failed');
      this.responseJson.set(
        JSON.stringify(
        {
          message: 'Browser request failed',
          error: String(error),
        },
        null,
        2,
      ));
      await this.refreshDeviceStatus();
    } finally {
      this.isLoading.set(false);
    }
  }

  async syncAmpSlots(): Promise<void> {
    this.isLoading.set(true);
    this.status.set('Queueing amp sync...');
    this.responseJson.set('');

    try {
      const enqueueResponse = await fetch('/api/v1/amp/slots/sync', {
        method: 'POST',
        cache: 'no-store',
      });

      const enqueuePayload = (await enqueueResponse.json()) as SlotsSyncEnqueueResponse | { detail: unknown };
      if (!enqueueResponse.ok) {
        this.status.set('Amp sync failed');
        this.ampStateHash.set('');
        this.lastSyncedAt.set('');
        this.totalSyncMs.set(0);
        this.responseJson.set(JSON.stringify(enqueuePayload, null, 2));
        this.updateBusyFromPayload(enqueuePayload);
        await this.refreshDeviceStatus();
        return;
      }

      const queued = enqueuePayload as SlotsSyncEnqueueResponse;
      this.status.set('Amp sync queued...');
      const job = await this.waitForSyncJob(queued.job_id);
      if (job.status !== 'succeeded' || job.result === null) {
        this.status.set('Amp sync failed');
        this.ampStateHash.set('');
        this.lastSyncedAt.set('');
        this.totalSyncMs.set(0);
        this.responseJson.set(
          JSON.stringify(
            {
              message: 'Queued sync job failed',
              job_id: job.job_id,
              status: job.status,
              error: job.error,
            },
            null,
            2,
          ),
        );
        await this.refreshDeviceStatus();
        return;
      }

      const state = job.result;
      this.status.set('Amp sync succeeded');
      this.slots.set(this.mergeFullState(state));
      this.ampStateHash.set(state.amp_state_hash_sha256);
      this.lastSyncedAt.set(state.synced_at);
      this.totalSyncMs.set(state.total_sync_ms);
      this.responseJson.set('');
      await this.refreshDeviceStatus();
    } catch (error: unknown) {
      this.status.set('Amp sync failed');
      this.ampStateHash.set('');
      this.lastSyncedAt.set('');
      this.totalSyncMs.set(0);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
      await this.refreshDeviceStatus();
    } finally {
      this.isLoading.set(false);
    }
  }

  async syncAmpSlot(slot: number): Promise<void> {
    this.isLoading.set(true);
    this.status.set(`Syncing slot ${slot}...`);
    this.responseJson.set('');

    try {
      const response = await fetch(`/api/v1/amp/slots/${slot}/sync`, {
        method: 'POST',
        cache: 'no-store',
      });
      const payload = (await response.json()) as SlotSyncResponse | { detail: unknown };
      if (!response.ok) {
        this.status.set(`Slot ${slot} sync failed`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        this.updateBusyFromPayload(payload);
        await this.refreshDeviceStatus();
        return;
      }

      const synced = payload as SlotSyncResponse;
      this.applySyncedSlot(synced.slot);
      this.lastSyncedAt.set(synced.synced_at);
      this.totalSyncMs.set(synced.slot.slot_sync_ms);
      this.ampStateHash.set('');
      this.status.set(`Slot ${slot} sync succeeded`);
      await this.refreshDeviceStatus();
    } catch (error: unknown) {
      this.status.set(`Slot ${slot} sync failed`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
      await this.refreshDeviceStatus();
    } finally {
      this.isLoading.set(false);
    }
  }

  async quickSyncAmpSlots(): Promise<void> {
    this.isLoading.set(true);
    this.status.set('Quick sync queued...');
    this.responseJson.set('');

    try {
      const enqueueResponse = await fetch('/api/v1/amp/slots/quick/sync', {
        method: 'POST',
        cache: 'no-store',
      });

      const enqueuePayload = (await enqueueResponse.json()) as QuickSyncEnqueueResponse | { detail: unknown };
      if (!enqueueResponse.ok) {
        this.status.set('Quick sync failed');
        this.responseJson.set(JSON.stringify(enqueuePayload, null, 2));
        this.updateBusyFromPayload(enqueuePayload);
        await this.refreshDeviceStatus();
        return;
      }

      const queued = enqueuePayload as QuickSyncEnqueueResponse;
      const job = await this.waitForQuickSyncJob(queued.job_id);
      if (job.status !== 'succeeded' || job.result === null) {
        this.status.set('Quick sync failed');
        this.responseJson.set(
          JSON.stringify(
            {
              message: 'Queued quick sync job failed',
              job_id: job.job_id,
              status: job.status,
              error: job.error,
            },
            null,
            2,
          ),
        );
        await this.refreshDeviceStatus();
        return;
      }

      const quick = job.result;
      this.slots.set(this.mergeQuickState(quick));
      this.ampStateHash.set('');
      this.lastSyncedAt.set(quick.synced_at);
      this.totalSyncMs.set(quick.total_sync_ms);
      this.status.set('Quick sync succeeded');
      await this.refreshDeviceStatus();
    } catch (error: unknown) {
      this.status.set('Quick sync failed');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
      await this.refreshDeviceStatus();
    } finally {
      this.isLoading.set(false);
    }
  }

  private async waitForSyncJob(jobId: string): Promise<SlotsSyncJobResponse> {
    const maxPolls = 150;
    for (let i = 0; i < maxPolls; i += 1) {
      const response = await fetch(`/api/v1/amp/slots/sync/${jobId}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as SlotsSyncJobResponse | { detail: unknown };
      if (!response.ok) {
        throw new Error(`Sync job poll failed: ${JSON.stringify(payload)}`);
      }
      const job = payload as SlotsSyncJobResponse;
      if (job.status === 'succeeded' || job.status === 'failed') {
        return job;
      }
      this.status.set(job.status === 'queued' ? 'Amp sync queued...' : 'Amp sync running...');
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    }
    throw new Error(`Sync job timed out: ${jobId}`);
  }

  private async waitForQuickSyncJob(jobId: string): Promise<QuickSyncJobResponse> {
    const maxPolls = 75;
    for (let i = 0; i < maxPolls; i += 1) {
      const response = await fetch(`/api/v1/amp/slots/quick/sync/${jobId}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as QuickSyncJobResponse | { detail: unknown };
      if (!response.ok) {
        throw new Error(`Quick sync job poll failed: ${JSON.stringify(payload)}`);
      }
      const job = payload as QuickSyncJobResponse;
      if (job.status === 'succeeded' || job.status === 'failed') {
        return job;
      }
      this.status.set(job.status === 'queued' ? 'Quick sync queued...' : 'Quick sync running...');
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    }
    throw new Error(`Quick sync job timed out: ${jobId}`);
  }

  async refreshDeviceStatus(): Promise<void> {
    try {
      const response = await fetch('/api/v1/amp/device-status', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as DeviceStatusResponse | { detail: unknown };
      if (!response.ok) {
        this.deviceAvailable.set(false);
        this.deviceBusy.set(true);
        this.deviceStatusText.set('Device status probe failed');
        this.deviceStatusCheckedAt.set('');
        return;
      }

      const status = payload as DeviceStatusResponse;
      this.deviceBusy.set(status.busy);
      this.deviceAvailable.set(status.available);
      this.deviceMidiPort.set(status.midi_port);
      this.deviceStatusCheckedAt.set(status.checked_at);
      if (status.busy) {
        this.deviceStatusText.set('Device busy: amp does not support concurrent control');
      } else if (status.available) {
        this.deviceStatusText.set('Device available for control');
      } else {
        this.deviceStatusText.set('Device unavailable');
      }
    } catch {
      this.deviceAvailable.set(false);
      this.deviceBusy.set(true);
      this.deviceStatusText.set('Device status probe failed');
      this.deviceStatusCheckedAt.set('');
    }
  }

  async refreshQueueState(): Promise<void> {
    try {
      const response = await fetch('/api/v1/amp/queue', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as QueueStateResponse | { detail: unknown };
      if (!response.ok) {
        return;
      }
      const queue = payload as QueueStateResponse;
      this.queueJobs.set(queue.jobs);
      this.queueGeneratedAt.set(queue.generated_at);
    } catch {
      // no-op: queue panel keeps last visible state
    }
  }

  private updateBusyFromPayload(payload: unknown): void {
    const encoded = JSON.stringify(payload).toLowerCase();
    if (encoded.includes('device or resource busy') || encoded.includes('resource busy')) {
      this.deviceBusy.set(true);
      this.deviceAvailable.set(false);
      this.deviceStatusText.set('Device busy: amp does not support concurrent control');
    }
  }

  slotsForBank(bank: 'A' | 'B'): SlotCard[] {
    return this.slots().filter((slot) => slot.slot_label.startsWith(`${bank}:`));
  }

  shortHash(hash: string): string {
    return hash.slice(0, 12);
  }

  displayHash(slot: SlotCard): string {
    return slot.config_hash_sha256 ? this.shortHash(slot.config_hash_sha256) : 'n/a';
  }

  displayPatchName(slot: SlotCard): string {
    if (slot.patch_name) {
      return slot.patch_name;
    }
    return 'Unsynced';
  }

  private mergeFullState(state: SlotsStateResponse): SlotCard[] {
    const bySlot = new Map<number, SlotPatchSummary>(state.slots.map((slot) => [slot.slot, slot]));
    return defaultSlotCards().map((base) => {
      const full = bySlot.get(base.slot);
      if (!full) {
        return base;
      }
      return {
        slot: full.slot,
        slot_label: full.slot_label,
        patch_name: full.patch_name,
        config_hash_sha256: full.config_hash_sha256,
        synced_at: full.synced_at,
        slot_sync_ms: full.slot_sync_ms,
        inferred: false,
        match_count: 1,
      };
    });
  }

  private mergeQuickState(state: QuickSlotsStateResponse): SlotCard[] {
    const bySlot = new Map<number, QuickSlotSummary>(state.slots.map((slot) => [slot.slot, slot]));
    return defaultSlotCards().map((base) => {
      const quick = bySlot.get(base.slot);
      if (!quick) {
        return base;
      }
      return {
        slot: quick.slot,
        slot_label: quick.slot_label,
        patch_name: quick.patch_name,
        config_hash_sha256: quick.inferred_hash_sha256 ?? '',
        synced_at: quick.synced_at,
        slot_sync_ms: quick.slot_sync_ms,
        inferred: quick.inferred_hash_sha256 !== null,
        match_count: quick.match_count,
      };
    });
  }

  private applySyncedSlot(slot: SlotPatchSummary): void {
    this.slots.update((current) =>
      current.map((card) => {
        if (card.slot !== slot.slot) {
          return card;
        }
        return {
          slot: slot.slot,
          slot_label: slot.slot_label,
          patch_name: slot.patch_name,
          config_hash_sha256: slot.config_hash_sha256,
          synced_at: slot.synced_at,
          slot_sync_ms: slot.slot_sync_ms,
          inferred: false,
          match_count: 1,
        };
      }),
    );
  }

  formatMs(value: number): string {
    return `${Math.max(0, Math.round(value))} ms`;
  }

  operationLabel(value: string): string {
    if (value === 'quick_sync_names') {
      return 'Quick Sync Names';
    }
    if (value === 'full_sync_slots') {
      return 'Full Sync Slots';
    }
    return value;
  }
}
