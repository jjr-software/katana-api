import { Injectable, NgZone, inject } from '@angular/core';

export interface AmpOperationalQueueJob {
  job_id: string;
  operation: string;
  slot: number | null;
  request_patch_name?: string | null;
  request_patch_hash?: string | null;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  elapsed_ms: number;
  error: string | null;
}

export interface AmpOperationalLivePatch {
  patch_json: Record<string, unknown>;
  active_slot: number | null;
  amp_confirmed_at: string;
  source_type: string;
  exact_patch_object: { id: number; name: string } | null;
  partial_patch_objects: Array<{ id: number; name: string }>;
  exact_amp_slot: { slot: number; patch_name: string } | null;
  partial_amp_slots: Array<{ slot: number; patch_name: string }>;
  compat_hash_sha256: string;
}

export interface AmpOperationalState {
  generated_at: string;
  queue: {
    generated_at: string;
    queued_count: number;
    running_job_id: string | null;
    jobs: AmpOperationalQueueJob[];
  };
  live_patch: AmpOperationalLivePatch | null;
}

export interface AmpOperationalStateHandlers {
  state: (value: AmpOperationalState) => void;
  connection: (connected: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class AmpOperationalStateService {
  private readonly zone = inject(NgZone);
  private source: EventSource | null = null;

  connect(handlers: AmpOperationalStateHandlers): void {
    this.close();
    const source = new EventSource('/api/v1/amp/operations/events');
    source.addEventListener('amp-state', (event: Event) => {
      const message = event as MessageEvent<string>;
      try {
        const state = JSON.parse(message.data) as AmpOperationalState;
        this.zone.run(() => handlers.state(state));
      } catch {
        // A malformed event is ignored; EventSource remains responsible for the connection.
      }
    });
    source.onopen = () => this.zone.run(() => handlers.connection(true));
    source.onerror = () => this.zone.run(() => handlers.connection(false));
    this.source = source;
  }

  close(): void {
    if (this.source === null) {
      return;
    }
    this.source.close();
    this.source = null;
  }
}
