import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface DashboardStickyPanelBar {
  x: number;
  y: number;
  width: number;
  height: number;
  tone: 'above' | 'below';
}

export interface DashboardStickyPanelBand {
  id: string;
  label: string;
  rangeLabel: string;
  currentText: string;
  maxText: string;
  currentPercent: number;
  maxPercent: number;
}

export interface DashboardStickyPanelViewModel {
  testAmpLabel: string;
  testAmpDisabled: boolean;
  syncLivePatchLabel: string;
  syncLivePatchDisabled: boolean;
  reapplyLabel: string;
  reapplyDisabled: boolean;
  storeToAmpLabel: string;
  storeToAmpDisabled: boolean;
  loadPatchLabel: string;
  saveCurrentSettingsLabel: string;
  aiDesignerLabel: string;
  clearLabel: string;
  currentSlotLabel: string;
  currentSettingsName: string;
  currentSettingsSourceQualifier: string | null;
  ampSlotSavedName: string;
  shownBlocks: string;
  ampStateHashShort: string;
  livePatchConfirmedAt: string;
  lastSyncedAt: string;
  totalSyncMsText: string;
  liveMeterConnected: boolean;
  liveMeterAt: string;
  liveRmsDbfsText: string;
  liveRmsMaxDbfsText: string;
  totalLevelTargetText: string;
  totalLevelCurrentDeltaText: string;
  totalLevelMaxHoldDeltaText: string;
  totalLevelWindowMinText: string;
  totalLevelWindowMaxText: string;
  totalLevelTargetLineY: number;
  totalLevelBars: DashboardStickyPanelBar[];
  globalNormalizeTargetRms: string;
  liveMeterBands: DashboardStickyPanelBand[];
}

@Component({
  selector: 'app-dashboard-sticky-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (model(); as vm) {
      <section class="d-grid gap-3">
        <div class="card shadow-sm" style="position: sticky; top: .75rem; z-index: 4;">
          <div class="card-body py-2 px-3">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-primary btn-sm" [disabled]="vm.testAmpDisabled" (click)="testAmpConnection.emit()">
                  {{ vm.testAmpLabel }}
                </button>
                <button type="button" class="btn btn-outline-primary btn-sm" [disabled]="vm.syncLivePatchDisabled" (click)="syncLivePatch.emit()">
                  {{ vm.syncLivePatchLabel }}
                </button>
                <button type="button" class="btn btn-outline-warning btn-sm" [disabled]="vm.reapplyDisabled" (click)="reapplyCurrentSettingsToAmp.emit()">
                  {{ vm.reapplyLabel }}
                </button>
                <button type="button" class="btn btn-success btn-sm" [disabled]="vm.storeToAmpDisabled" (click)="persistLivePatchToAmp.emit()">
                  {{ vm.storeToAmpLabel }}
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm" (click)="openToneLibraryModal.emit()">{{ vm.loadPatchLabel }}</button>
                <button type="button" class="btn btn-outline-success btn-sm" (click)="openToneSaveModal.emit()">{{ vm.saveCurrentSettingsLabel }}</button>
                <button type="button" class="btn btn-outline-primary btn-sm" (click)="openToneDesignerModal.emit()">{{ vm.aiDesignerLabel }}</button>
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="clearLiveMeterChart.emit()">{{ vm.clearLabel }}</button>
            </div>

            <div class="d-flex flex-wrap gap-3 small text-secondary mb-2">
              <span>Current Slot: <strong>{{ vm.currentSlotLabel }}</strong></span>
              <span>Current Settings Name: <strong>{{ vm.currentSettingsName }}</strong></span>
              @if (vm.currentSettingsSourceQualifier) {
                <span>({{ vm.currentSettingsSourceQualifier }})</span>
              }
              <span>Amp Slot Saved Name: <strong>{{ vm.ampSlotSavedName }}</strong></span>
              <span>Shown Blocks: <span>{{ vm.shownBlocks }}</span></span>
            </div>

            <div class="d-flex flex-wrap gap-3 small text-secondary">
              <span>AMP State Hash: <code>{{ vm.ampStateHashShort }}</code></span>
              <span>Live Confirmed: <code>{{ vm.livePatchConfirmedAt || 'n/a' }}</code></span>
              <span>Last Sync: <code>{{ vm.lastSyncedAt || 'n/a' }}</code></span>
              <span>Total Sync Time: <code>{{ vm.totalSyncMsText }}</code></span>
              <span>
                Live Meter:
                <code [class.text-success]="vm.liveMeterConnected" [class.text-secondary]="!vm.liveMeterConnected">
                  {{ vm.liveMeterConnected ? 'Connected' : 'Stopped' }}
                </code>
              </span>
            </div>

            <div class="small text-secondary mt-2">Total Level</div>
            <div class="d-flex align-items-baseline justify-content-between gap-2">
              <span class="fs-5 fw-semibold">{{ vm.liveRmsDbfsText }}</span>
              <span class="small text-danger fw-semibold">Max <span class="border-bottom border-danger pb-1">{{ vm.liveRmsMaxDbfsText }}</span></span>
            </div>
            <div class="d-flex justify-content-between align-items-center gap-2 small text-secondary">
              <span>Target {{ vm.totalLevelTargetText }}</span>
              <span>2s RMS chunks</span>
            </div>
            <div class="d-flex justify-content-between align-items-center gap-2 small text-secondary mt-1">
              <span>Current {{ vm.totalLevelCurrentDeltaText }}</span>
              <span>Max Hold {{ vm.totalLevelMaxHoldDeltaText }}</span>
            </div>
            <div class="mt-2 rounded overflow-hidden border" style="background: linear-gradient(180deg, rgba(13, 110, 253, 0.04) 0%, rgba(220, 53, 69, 0.04) 50%, rgba(25, 135, 84, 0.04) 100%), #f8f9fa;">
              <svg class="d-block w-100" viewBox="0 0 1000 72" preserveAspectRatio="none" aria-label="Running total level history">
                <line x1="0" [attr.y1]="vm.totalLevelTargetLineY" x2="1000" [attr.y2]="vm.totalLevelTargetLineY" style="stroke:#dc3545;stroke-width:2;" />
                @for (bar of vm.totalLevelBars; track $index) {
                  <rect
                    [attr.x]="bar.x"
                    [attr.y]="bar.y"
                    [attr.width]="bar.width"
                    [attr.height]="bar.height"
                    [attr.fill]="bar.tone === 'above' ? '#dc3545' : '#0d6efd'"
                  />
                }
              </svg>
            </div>
            <div class="d-flex justify-content-between align-items-center gap-2 small text-secondary mt-2">
              <span>{{ vm.totalLevelWindowMinText }}</span>
              <span class="text-danger fw-semibold text-uppercase">Target</span>
              <span>{{ vm.totalLevelWindowMaxText }}</span>
            </div>
            <div class="small text-secondary mt-2">Zoom {{ vm.totalLevelWindowMinText }} to {{ vm.totalLevelWindowMaxText }}</div>
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body py-2">
            <div class="d-flex flex-wrap gap-2 mt-2">
              <div class="card shadow-sm" style="flex: 1 1 18rem; min-width: 18rem;">
                <div class="card-body py-2 px-3 d-grid gap-2">
                  <div class="small text-secondary">Global Target RMS</div>
                  <input
                    type="number"
                    step="0.1"
                    class="form-control form-control-sm"
                    style="width: 7.5rem;"
                    [value]="vm.globalNormalizeTargetRms"
                    (input)="globalNormalizeTargetRmsChange.emit($any($event.target).value)"
                    (blur)="globalNormalizeTargetRmsCommit.emit()"
                  />
                </div>
              </div>
              <div class="card shadow-sm" style="flex: 1 1 11rem; min-width: 11rem;">
                <div class="card-body py-2 px-3">
                  <div class="small text-secondary mb-1">Live At</div>
                  <code class="d-block text-nowrap">{{ vm.liveMeterAt || 'n/a' }}</code>
                </div>
              </div>
            </div>

            <div class="mt-2">
              <div class="card shadow-sm">
                <div class="card-body py-2 px-3">
                  <div class="small text-secondary mb-2">Frequency Buckets</div>
                  <div class="d-flex flex-wrap gap-2">
                    @for (band of vm.liveMeterBands; track band.id) {
                      <div class="card shadow-sm" style="flex: 1 1 14rem; min-width: 14rem;">
                        <div class="card-body py-2 px-3">
                          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <div>
                              <div class="fw-semibold">{{ band.label }}</div>
                              <div class="small text-secondary">{{ band.rangeLabel }}</div>
                            </div>
                            <div class="text-end">
                              <div class="small text-secondary">Current</div>
                              <div class="fw-semibold">{{ band.currentText }}</div>
                            </div>
                          </div>
                          <div class="d-flex justify-content-between align-items-center gap-2">
                            <div class="small text-danger">Max</div>
                            <div class="fw-semibold text-danger border-bottom border-danger pb-1">{{ band.maxText }}</div>
                          </div>
                          <div class="d-grid mt-2" style="grid-template-columns: 2.75rem minmax(0, 1fr); gap: .5rem; align-items: stretch;">
                            <div class="d-flex flex-column justify-content-between align-items-end small text-secondary" style="min-height: 7.25rem; padding: .15rem 0; line-height: 1;">
                              <span>0 dB</span>
                              <span>-30 dB</span>
                              <span>-60 dB</span>
                            </div>
                            <div
                              class="position-relative"
                              style="min-height: 7.25rem; border: 1px solid rgba(33, 37, 41, 0.12); border-radius: .6rem; overflow: hidden; background: linear-gradient(180deg, rgba(13, 110, 253, 0.05) 0%, rgba(13, 110, 253, 0.015) 100%), #f8f9fa;"
                            >
                              <div
                                class="position-absolute top-0 start-0 end-0 bottom-0"
                                style="background: linear-gradient(to top, rgba(33, 37, 41, 0.08) 1px, transparent 1px) 0 0 / 100% 50%, linear-gradient(to top, rgba(33, 37, 41, 0.08) 1px, transparent 1px) 0 0 / 100% 100%; opacity: .9;"
                              ></div>
                              <div
                                class="position-absolute"
                                [style.left.rem]="0.45"
                                [style.right.rem]="0.45"
                                [style.bottom.%]="0"
                                [style.height.%]="band.currentPercent"
                                style="border-radius: .35rem .35rem 0 0; background: linear-gradient(180deg, #63b3ff 0%, #0d6efd 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);"
                              ></div>
                              <div
                                class="position-absolute"
                                [style.left.rem]="0.2"
                                [style.right.rem]="0.2"
                                [style.bottom.%]="band.maxPercent"
                                style="height: 0; border-top: 2px solid #dc3545; box-shadow: 0 0 0 1px rgba(220, 53, 69, 0.12);"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    }
  `,
})
export class DashboardStickyPanelComponent {
  readonly model = input.required<DashboardStickyPanelViewModel>();
  readonly testAmpConnection = output<void>();
  readonly syncLivePatch = output<void>();
  readonly reapplyCurrentSettingsToAmp = output<void>();
  readonly persistLivePatchToAmp = output<void>();
  readonly openToneLibraryModal = output<void>();
  readonly openToneSaveModal = output<void>();
  readonly openToneDesignerModal = output<void>();
  readonly clearLiveMeterChart = output<void>();
  readonly globalNormalizeTargetRmsChange = output<string>();
  readonly globalNormalizeTargetRmsCommit = output<void>();
}
