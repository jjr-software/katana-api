import { Component, input } from '@angular/core';

const PATCH_BLOCK_LABELS: Record<string, string> = {
  routing: 'routing',
  amp: 'amp',
  booster: 'booster',
  mod: 'mod',
  fx: 'fx',
  delay: 'delay',
  reverb: 'reverb',
  eq1: 'eq1',
  eq2: 'eq2',
  ns: 'ns',
  send_return: 'send/return',
  solo: 'solo',
  pedalfx: 'pedalfx',
};

@Component({
  selector: 'app-patch-summary',
  standalone: true,
  template: `
    <div class="d-flex flex-wrap align-items-center gap-1">
      <strong>{{ name() }}</strong>
      @for (block of blocks(); track block) {
        <span class="badge rounded-pill text-bg-secondary fw-normal">{{ blockLabel(block) }}</span>
      }
    </div>
  `,
})
export class PatchSummaryComponent {
  readonly name = input.required<string>();
  readonly blocks = input<readonly string[]>([]);

  blockLabel(block: string): string {
    return PATCH_BLOCK_LABELS[block] ?? block;
  }
}
