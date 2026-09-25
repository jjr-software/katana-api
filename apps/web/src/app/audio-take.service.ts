import { Injectable } from '@angular/core';

export interface AudioTakePoint {
  time_sec: number;
  rms_dbfs: number;
}

export interface AudioTake {
  id: string;
  duration_sec: number;
  audio_url: string;
  waveform: AudioTakePoint[];
}

export interface AudioTakeComparison {
  clean_lufs: number | null;
  dirty_lufs: number | null;
  dirty_minus_clean_lu: number | null;
  clean_rms_dbfs: number;
  dirty_rms_dbfs: number;
}

export interface AudioTakeSummary {
  id: string;
  duration_sec: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AudioTakeService {
  async recent(): Promise<AudioTakeSummary[]> {
    const response = await fetch('/api/v1/audio/takes/recent');
    const payload = await response.json();
    if (!response.ok) throw new Error(this.errorMessage(payload, 'Could not load recent takes.'));
    return payload as AudioTakeSummary[];
  }

  async get(takeId: string): Promise<AudioTake> {
    const response = await fetch(`/api/v1/audio/take/${encodeURIComponent(takeId)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(this.errorMessage(payload, 'Could not open the take.'));
    return payload as AudioTake;
  }

  async compare(takeId: string, clean: [number, number], dirty: [number, number]): Promise<AudioTakeComparison> {
    const response = await fetch(`/api/v1/audio/take/${encodeURIComponent(takeId)}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clean_start_sec: clean[0], clean_end_sec: clean[1],
        dirty_start_sec: dirty[0], dirty_end_sec: dirty[1],
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(this.errorMessage(payload, 'Could not compare the selected sections.'));
    return payload as AudioTakeComparison;
  }

  async start(): Promise<string> {
    const response = await fetch('/api/v1/audio/take/start', { method: 'POST' });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(this.errorMessage(payload, 'Could not start the take.'));
    }
    return (payload as { session_id: string }).session_id;
  }

  async stop(): Promise<AudioTake> {
    const response = await fetch('/api/v1/audio/take/stop', { method: 'POST' });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(this.errorMessage(payload, 'Could not stop the take.'));
    }
    return payload as AudioTake;
  }

  private errorMessage(payload: unknown, fallback: string): string {
    if (payload && typeof payload === 'object' && 'detail' in payload) {
      const detail = payload.detail;
      return typeof detail === 'string' ? detail : JSON.stringify(detail);
    }
    return fallback;
  }
}
