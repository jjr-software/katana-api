import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main class="shell">
      <h1>Katana Gen 3 Patch Manager</h1>
      <p>Phase 1 scaffold is running.</p>
      <p>Next: patch library, apply/read/store, and volume-match workflows.</p>
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
    `,
  ],
})
export class AppComponent {}
