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
  patch: Record<string, unknown> | null;
  in_sync: boolean;
  is_saved: boolean;
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
  in_sync: boolean;
  is_saved: boolean;
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

interface FullDumpSlotResponse {
  slot: number;
  slot_label: string;
  in_sync: boolean;
  is_saved: boolean;
  synced_at: string;
  slot_sync_ms: number;
  patch: Record<string, unknown>;
  curated: Record<string, unknown>[];
}

interface FullAmpDumpResponse {
  synced_at: string;
  amp_state_hash_sha256: string;
  total_sync_ms: number;
  slots: FullDumpSlotResponse[];
}

interface BackupEnqueueResponse {
  job_id: string;
  operation: string;
  status: string;
  created_at: string;
}

interface BackupJobResponse {
  job_id: string;
  operation: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  elapsed_ms: number;
  error: string | null;
  result: FullAmpDumpResponse | null;
}

interface QueueJobSummary {
  job_id: string;
  operation: string;
  slot: number | null;
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
  patch: Record<string, unknown> | null;
  in_sync: boolean;
  is_saved: boolean;
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
      patch: null,
      in_sync: false,
      is_saved: false,
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
  status = signal('Idle');
  responseJson = signal('');
  slots = signal<SlotCard[]>(defaultSlotCards());
  ampStateHash = signal('');
  lastSyncedAt = signal('');
  totalSyncMs = signal(0);
  queueJobs = signal<QueueJobSummary[]>([]);
  queueGeneratedAt = signal('');
  queuePollHandle: ReturnType<typeof setInterval> | null = null;
  rawModalOpen = signal(false);
  rawModalTitle = signal('');
  rawModalJson = signal('');

  ngOnInit(): void {
    void this.refreshQueueState();
    this.queuePollHandle = setInterval(() => {
      void this.refreshQueueState();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.queuePollHandle !== null) {
      clearInterval(this.queuePollHandle);
      this.queuePollHandle = null;
    }
  }

  async testAmpConnection(): Promise<void> {
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
    }
  }

  async syncAmpSlots(): Promise<void> {
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
        return;
      }

      const state = job.result;
      this.status.set('Amp sync succeeded');
      this.slots.set(this.mergeFullState(state));
      this.ampStateHash.set(state.amp_state_hash_sha256);
      this.lastSyncedAt.set(state.synced_at);
      this.totalSyncMs.set(state.total_sync_ms);
      this.responseJson.set('');
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
    }
  }

  async syncAmpSlot(slot: number): Promise<void> {
    this.status.set(`Syncing slot ${slot} (full patch read)...`);
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
        return;
      }

      const synced = payload as SlotSyncResponse;
      this.applySyncedSlot(synced.slot);
      this.lastSyncedAt.set(synced.synced_at);
      this.totalSyncMs.set(synced.slot.slot_sync_ms);
      this.ampStateHash.set('');
      this.status.set(`Slot ${slot} full sync succeeded (${this.formatMs(synced.slot.slot_sync_ms)})`);
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
    }
  }

  async quickSyncAmpSlots(): Promise<void> {
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
        return;
      }

      const quick = job.result;
      this.slots.set(this.mergeQuickState(quick));
      this.ampStateHash.set('');
      this.lastSyncedAt.set(quick.synced_at);
      this.totalSyncMs.set(quick.total_sync_ms);
      this.status.set('Quick sync succeeded');
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
    }
  }

  async backupAmpState(): Promise<void> {
    this.status.set('Backup queued...');
    this.responseJson.set('');

    try {
      const enqueueResponse = await fetch('/api/v1/amp/backup', {
        method: 'POST',
        cache: 'no-store',
      });
      const enqueuePayload = (await enqueueResponse.json()) as BackupEnqueueResponse | { detail: unknown };
      if (!enqueueResponse.ok) {
        this.status.set('Backup failed');
        this.responseJson.set(JSON.stringify(enqueuePayload, null, 2));
        return;
      }

      const queued = enqueuePayload as BackupEnqueueResponse;
      const job = await this.waitForBackupJob(queued.job_id);
      if (job.status !== 'succeeded' || job.result === null) {
        this.status.set('Backup failed');
        this.responseJson.set(
          JSON.stringify(
            {
              message: 'Queued backup job failed',
              job_id: job.job_id,
              status: job.status,
              error: job.error,
            },
            null,
            2,
          ),
        );
        return;
      }

      this.downloadBackupFile(job.result);
      this.status.set('Backup succeeded');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Backup JSON downloaded',
            synced_at: job.result.synced_at,
            amp_state_hash_sha256: job.result.amp_state_hash_sha256,
            total_sync_ms: job.result.total_sync_ms,
          },
          null,
          2,
        ),
      );
    } catch (error: unknown) {
      this.status.set('Backup failed');
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

  private async waitForBackupJob(jobId: string): Promise<BackupJobResponse> {
    const maxPolls = 300;
    for (let i = 0; i < maxPolls; i += 1) {
      const response = await fetch(`/api/v1/amp/backup/${jobId}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as BackupJobResponse | { detail: unknown };
      if (!response.ok) {
        throw new Error(`Backup job poll failed: ${JSON.stringify(payload)}`);
      }
      const job = payload as BackupJobResponse;
      if (job.status === 'succeeded' || job.status === 'failed') {
        return job;
      }
      this.status.set(job.status === 'queued' ? 'Backup queued...' : 'Backup running...');
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    }
    throw new Error(`Backup job timed out: ${jobId}`);
  }

  private downloadBackupFile(backup: FullAmpDumpResponse): void {
    const fileName = `amp-backup-${backup.synced_at.replace(/[:T]/g, '-').replace(/\..*$/, '')}.json`;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
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
        patch: full.patch ?? null,
        in_sync: full.in_sync,
        is_saved: full.is_saved,
        synced_at: full.synced_at,
        slot_sync_ms: full.slot_sync_ms,
        inferred: false,
        match_count: 1,
      };
    });
  }

  private mergeQuickState(state: QuickSlotsStateResponse): SlotCard[] {
    const bySlot = new Map<number, QuickSlotSummary>(state.slots.map((slot) => [slot.slot, slot]));
    const currentBySlot = new Map<number, SlotCard>(this.slots().map((slot) => [slot.slot, slot]));
    return defaultSlotCards().map((base) => {
      const quick = bySlot.get(base.slot);
      const current = currentBySlot.get(base.slot);
      if (!quick) {
        return current ?? base;
      }
      return {
        slot: quick.slot,
        slot_label: quick.slot_label,
        patch_name: quick.patch_name,
        config_hash_sha256: quick.inferred_hash_sha256 ?? '',
        patch: current?.patch ?? null,
        in_sync: quick.in_sync,
        is_saved: quick.is_saved,
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
          patch: slot.patch ?? null,
          in_sync: slot.in_sync,
          is_saved: slot.is_saved,
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

  slotSyncStatusLabel(slot: SlotCard): string {
    return slot.in_sync ? 'In Sync' : 'Not Synced';
  }

  slotSavedStatusLabel(slot: SlotCard): string {
    return slot.is_saved ? 'Saved' : 'Not Saved';
  }

  ampSummary(slot: SlotCard): string {
    const amp = this.readObject(this.readObject(slot.patch, 'amp'));
    if (!amp) {
      return 'n/a';
    }
    const gain = this.readNumber(amp, 'gain');
    const volume = this.readNumber(amp, 'volume');
    const bass = this.readNumber(amp, 'bass');
    const middle = this.readNumber(amp, 'middle');
    const treble = this.readNumber(amp, 'treble');
    const presence = this.readNumber(amp, 'presence');
    return `G ${this.nv(gain)} | V ${this.nv(volume)} | B/M/T/P ${this.nv(bass)}/${this.nv(middle)}/${this.nv(treble)}/${this.nv(presence)}`;
  }

  boosterSummary(slot: SlotCard): string {
    return this.stageSummary(slot, 'booster');
  }

  modSummary(slot: SlotCard): string {
    return this.stageSummary(slot, 'mod');
  }

  fxSummary(slot: SlotCard): string {
    return this.stageSummary(slot, 'fx');
  }

  delaySummary(slot: SlotCard): string {
    return this.stageSummary(slot, 'delay');
  }

  reverbSummary(slot: SlotCard): string {
    return this.stageSummary(slot, 'reverb');
  }

  showRaw(slot: SlotCard): void {
    if (!slot.patch) {
      this.status.set(`No raw patch payload loaded for ${slot.slot_label}. Run full sync or slot sync first.`);
      return;
    }
    this.rawModalTitle.set(`${slot.slot_label} · ${slot.patch_name || 'Unnamed Patch'}`);
    this.rawModalJson.set(JSON.stringify(slot.patch, null, 2));
    this.rawModalOpen.set(true);
  }

  closeRawModal(): void {
    this.rawModalOpen.set(false);
  }

  onRawModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeRawModal();
    }
  }

  private stageSummary(slot: SlotCard, stageName: string): string {
    const stages = this.readObject(slot.patch, 'stages');
    const stage = this.readObject(stages, stageName);
    if (!stage) {
      return 'n/a';
    }
    const on = this.readBoolean(stage, 'on');
    const type = this.readNumber(stage, 'type');
    const level = this.readNumber(stage, 'effect_level');
    const parts: string[] = [on ? 'On' : 'Off'];
    if (type !== null) {
      parts.push(`Type ${type}`);
    }
    if (level !== null) {
      parts.push(`Lvl ${level}`);
    }
    return parts.join(' | ');
  }

  private readObject(value: unknown, key?: string): Record<string, unknown> | null {
    let candidate: unknown = value;
    if (key !== undefined) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
      }
      candidate = (value as Record<string, unknown>)[key];
    }
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return null;
    }
    return candidate as Record<string, unknown>;
  }

  private readNumber(source: Record<string, unknown> | null, key: string): number | null {
    if (!source) {
      return null;
    }
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    return null;
  }

  private readBoolean(source: Record<string, unknown> | null, key: string): boolean {
    if (!source) {
      return false;
    }
    return source[key] === true;
  }

  private nv(value: number | null): string {
    return value === null ? 'n/a' : `${value}`;
  }

  operationLabel(value: string): string {
    if (value === 'test_connection') {
      return 'Test Connection';
    }
    if (value === 'current_patch') {
      return 'Current Patch';
    }
    if (value === 'sync_slot') {
      return 'Sync Slot';
    }
    if (value === 'full_dump') {
      return 'Full Dump';
    }
    if (value === 'quick_sync_names') {
      return 'Quick Sync Names';
    }
    if (value === 'full_sync_slots') {
      return 'Full Sync Slots';
    }
    return value;
  }
}
