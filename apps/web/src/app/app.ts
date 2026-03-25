import { Component, signal } from '@angular/core';

interface AmpConnectionTestResponse {
  ok: boolean;
  midi_port: string;
  request_hex: string;
  response_hex: string;
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
}
