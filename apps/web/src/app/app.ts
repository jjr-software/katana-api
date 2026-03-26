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

interface SlotsStateResponse {
  synced_at: string;
  amp_state_hash_sha256: string;
  total_sync_ms: number;
  slots: SlotPatchSummary[];
}

interface SlotsSyncEnqueueResponse {
  job_id: string;
  status: string;
  created_at: string;
}

interface SlotsSyncJobResponse {
  job_id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  error: string | null;
  result: SlotsStateResponse | null;
}

interface DeviceStatusResponse {
  midi_port: string;
  busy: boolean;
  available: boolean;
  concurrency_supported: boolean;
  detail: string;
  checked_at: string;
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
  slots = signal<SlotPatchSummary[]>([]);
  ampStateHash = signal('');
  lastSyncedAt = signal('');
  totalSyncMs = signal(0);
  deviceBusy = signal(false);
  deviceAvailable = signal(false);
  deviceStatusText = signal('Checking amp device...');
  deviceStatusCheckedAt = signal('');
  deviceMidiPort = signal('');

  ngOnInit(): void {
    void this.refreshDeviceStatus();
    this.pollHandle = setInterval(() => {
      if (this.isLoading()) {
        return;
      }
      void this.refreshDeviceStatus();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.pollHandle !== null) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
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
        this.slots.set([]);
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
        this.slots.set([]);
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
      this.slots.set(state.slots);
      this.ampStateHash.set(state.amp_state_hash_sha256);
      this.lastSyncedAt.set(state.synced_at);
      this.totalSyncMs.set(state.total_sync_ms);
      this.responseJson.set('');
      await this.refreshDeviceStatus();
    } catch (error: unknown) {
      this.status.set('Amp sync failed');
      this.slots.set([]);
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

  private async waitForSyncJob(jobId: string): Promise<SlotsSyncJobResponse> {
    const maxPolls = 900;
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

  private updateBusyFromPayload(payload: unknown): void {
    const encoded = JSON.stringify(payload).toLowerCase();
    if (encoded.includes('device or resource busy') || encoded.includes('resource busy')) {
      this.deviceBusy.set(true);
      this.deviceAvailable.set(false);
      this.deviceStatusText.set('Device busy: amp does not support concurrent control');
    }
  }

  slotsForBank(bank: 'A' | 'B'): SlotPatchSummary[] {
    return this.slots().filter((slot) => slot.slot_label.startsWith(`${bank}:`));
  }

  shortHash(hash: string): string {
    return hash.slice(0, 12);
  }

  formatMs(value: number): string {
    return `${Math.max(0, Math.round(value))} ms`;
  }
}
