import { Component } from '@angular/core';

interface AmpConnectionTestResponse {
  ok: boolean;
  midi_port: string;
  request_hex: string;
  response_hex: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main class="shell">
      <h1>Katana Gen 3 Patch Manager</h1>
      <p>Smoke test real amp communication from the web UI.</p>
      <button type="button" (click)="testAmpConnection()" [disabled]="isLoading">
        {{ isLoading ? 'Testing...' : 'Test Amp Connection' }}
      </button>
      <p class="status">{{ status }}</p>
      <pre>{{ responseJson }}</pre>
    </main>
  `,
  styles: [
    `
      .shell {
        max-width: 960px;
        margin: 3rem auto;
        padding: 1.5rem;
        border: 1px solid #2d3748;
        border-radius: 12px;
        background: color-mix(in srgb, var(--card) 85%, black);
      }
      h1 {
        margin-top: 0;
      }
      button {
        background: var(--accent);
        color: var(--fg);
        border: none;
        border-radius: 8px;
        padding: 0.65rem 1rem;
        cursor: pointer;
        font-size: 0.95rem;
      }
      button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .status {
        margin-top: 1rem;
      }
      pre {
        margin-top: 1rem;
        white-space: pre-wrap;
        word-break: break-word;
        background: #111827;
        border: 1px solid #374151;
        border-radius: 8px;
        padding: 0.75rem;
      }
    `,
  ],
})
export class AppComponent {
  isLoading = false;
  status = 'Idle';
  responseJson = '';

  async testAmpConnection(): Promise<void> {
    this.isLoading = true;
    this.status = 'Running amp identity request...';
    this.responseJson = '';

    try {
      const response = await fetch('/api/v1/amp/test-connection', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await response.json()) as AmpConnectionTestResponse | { detail: unknown };
      if (!response.ok) {
        this.status = 'Connection test failed';
        this.responseJson = JSON.stringify(payload, null, 2);
        return;
      }

      this.status = 'Connection test succeeded';
      this.responseJson = JSON.stringify(payload, null, 2);
    } catch (error: unknown) {
      this.status = 'Connection test failed';
      this.responseJson = JSON.stringify(
        {
          message: 'Browser request failed',
          error: String(error),
        },
        null,
        2,
      );
    } finally {
      this.isLoading = false;
    }
  }
}
