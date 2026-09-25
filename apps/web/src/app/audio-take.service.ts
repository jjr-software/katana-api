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

@Injectable({ providedIn: 'root' })
export class AudioTakeService {
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
