import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface DashboardFrequencyBucketBand {
  id: string;
  label: string;
  rangeLabel: string;
  currentDbfs: number | null;
  maxDbfs: number | null;
  currentPercent: number;
  maxPercent: number;
}

@Component({
  selector: 'app-dashboard-frequency-buckets',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
    }

    .freq-buckets-card {
      overflow: hidden;
    }

    .freq-buckets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr));
      gap: 0.5rem;
      align-items: start;
    }

    .freq-bucket {
      display: grid;
      gap: 0.35rem;
      min-width: 0;
    }

    .min-w-0 {
      min-width: 0;
    }

    .freq-bucket-meter {
      position: relative;
      height: 4.25rem;
      border: 1px solid rgba(33, 37, 41, 0.12);
      border-radius: 0.55rem;
      overflow: hidden;
      background:
        linear-gradient(to top, rgba(33, 37, 41, 0.08) 1px, transparent 1px) 0 0 / 100% 50%,
        linear-gradient(180deg, rgba(13, 110, 253, 0.05) 0%, rgba(13, 110, 253, 0.015) 100%),
        #f8f9fa;
    }

    .freq-bucket-gridlines {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(to top, rgba(33, 37, 41, 0.08) 1px, transparent 1px) 0 0 / 100% 50%,
        linear-gradient(to top, rgba(33, 37, 41, 0.08) 1px, transparent 1px) 0 0 / 100% 100%;
      opacity: 0.75;
    }

    .freq-bucket-fill {
      position: absolute;
      left: 0.32rem;
      right: 0.32rem;
      bottom: 0;
      border-radius: 0.3rem 0.3rem 0 0;
      background: linear-gradient(180deg, #7cc4ff 0%, #0d6efd 100%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
      z-index: 1;
    }

    .freq-bucket-hold {
      position: absolute;
      left: 0.18rem;
      right: 0.18rem;
      height: 0;
      border-top: 2px solid #dc3545;
      box-shadow: 0 0 0 1px rgba(220, 53, 69, 0.12);
      z-index: 2;
    }
  `],
  template: `
    @if (bands(); as currentBands) {
      <div class="card shadow-sm freq-buckets-card">
        <div class="card-body py-2 px-3">
          <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
            <div class="small text-secondary">Frequency Buckets</div>
            <div class="small text-secondary">Current / Max hold</div>
          </div>
          <div class="freq-buckets-grid">
            @for (band of currentBands; track band.id) {
              <div class="freq-bucket">
                <div class="d-flex justify-content-between align-items-baseline gap-2">
                  <div class="min-w-0">
                    <div class="fw-semibold">{{ band.label }}</div>
                    <div class="small text-secondary text-truncate">{{ band.rangeLabel }}</div>
                  </div>
                  <div class="text-end flex-shrink-0">
                    <div class="fw-semibold">{{ formatRelativeDb(band.currentDbfs) }}</div>
                    <div class="small text-danger">{{ formatRelativeDb(band.maxDbfs) }}</div>
                  </div>
                </div>
                <div class="freq-bucket-meter mt-1">
                  <div class="freq-bucket-gridlines"></div>
                  <div class="freq-bucket-fill" [style.height.%]="band.currentPercent"></div>
                  <div class="freq-bucket-hold" [style.bottom.%]="band.maxPercent"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class DashboardFrequencyBucketsComponent {
  readonly bands = input.required<readonly DashboardFrequencyBucketBand[]>();

  formatRelativeDb(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
      return 'n/a';
    }
    return `${value.toFixed(2)} dB`;
  }
}
