import { Component, signal } from '@angular/core';

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
}

interface SlotsStateResponse {
  synced_at: string;
  amp_state_hash_sha256: string;
  slots: SlotPatchSummary[];
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isLoading = signal(false);
  status = signal('Idle');
  responseJson = signal('');
  slots = signal<SlotPatchSummary[]>([]);
  ampStateHash = signal('');
  lastSyncedAt = signal('');

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
    } finally {
      this.isLoading.set(false);
    }
  }

  async syncAmpSlots(): Promise<void> {
    this.isLoading.set(true);
    this.status.set('Syncing amp slots A:1..B:4...');
    this.responseJson.set('');

    try {
      const response = await fetch('/api/v1/amp/slots', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await response.json()) as SlotsStateResponse | { detail: unknown };
      if (!response.ok) {
        this.status.set('Amp sync failed');
        this.slots.set([]);
        this.ampStateHash.set('');
        this.lastSyncedAt.set('');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }

      const state = payload as SlotsStateResponse;
      this.status.set('Amp sync succeeded');
      this.slots.set(state.slots);
      this.ampStateHash.set(state.amp_state_hash_sha256);
      this.lastSyncedAt.set(state.synced_at);
      this.responseJson.set('');
    } catch (error: unknown) {
      this.status.set('Amp sync failed');
      this.slots.set([]);
      this.ampStateHash.set('');
      this.lastSyncedAt.set('');
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
    } finally {
      this.isLoading.set(false);
    }
  }

  slotsForBank(bank: 'A' | 'B'): SlotPatchSummary[] {
    return this.slots().filter((slot) => slot.slot_label.startsWith(`${bank}:`));
  }

  shortHash(hash: string): string {
    return hash.slice(0, 12);
  }
}
