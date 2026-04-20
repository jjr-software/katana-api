import { ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';

const DEFAULT_TARGET_RMS_DBFS = -35.0;
const GLOBAL_NORMALIZE_TARGET_STORAGE_KEY = 'katana.globalNormalizeTargetRms';
const LIVE_TOTAL_LEVEL_ZOOM_DB = 3.0;
const LIVE_RMS_HISTORY_LIMIT = 240;
const LIVE_TOTAL_LEVEL_GRAPH_WIDTH = 1000;
const LIVE_TOTAL_LEVEL_GRAPH_HEIGHT = 288;
const LIVE_TOTAL_LEVEL_BAR_STEP = 14;
const LIVE_TOTAL_LEVEL_BAR_WIDTH = 10;
const LIVE_METER_WINDOW_SEC = 2.0;

type ToneBlockKey =
  | 'routing'
  | 'amp'
  | 'booster'
  | 'mod'
  | 'fx'
  | 'delay'
  | 'reverb'
  | 'eq1'
  | 'eq2'
  | 'ns'
  | 'send_return'
  | 'solo'
  | 'pedalfx'
  | 'gafc_exp1';

export interface DashboardStickyPanelBar {
  x: number;
  y: number;
  width: number;
  height: number;
  tone: 'above' | 'below';
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
  currentSlotLabel: string;
  patchName: string;
  liveAmpName: string;
  ampSlotSavedName: string;
  livePatchConfirmedAt: string;
  lastSyncedAt: string;
  totalSyncMsText: string;
}

const BOOSTER_TYPE_NAMES = [
  'Mid Boost',
  'Clean Boost',
  'Treble Boost',
  'Crunch Overdrive',
  'Natural Overdrive',
  'Warm Overdrive',
  'Fat Distortion',
  'Metal Distortion',
  'Octave Fuzz',
  'Blues Drive',
  'Overdrive',
  'Tube Screamer',
  'Turbo Overdrive',
  'Distortion',
  'ProCo RAT',
  "Marshall Guv'nor Distortion",
  'MXR Distortion+',
  'Boss Metal Zone',
  '1960s Fuzz',
  'Electro-Harmonix Big Muff Fuzz',
  'Boss HM-2 Heavy Metal',
  'Boss Metal Core',
  'Centaur Overdrive',
];

const FX_TYPE_NAMES = [
  'Touch Wah',
  'Auto Wah',
  'Pedal Wah',
  'Compressor',
  'Limiter',
  'Graphic EQ',
  'Parametric EQ',
  'Guitar Simulator',
  'Slow Gear',
  'Wave Synth',
  'Octave',
  'Pitch Shifter',
  'Harmonist',
  'Acoustic Processor',
  'Phaser',
  'Flanger',
  'Tremolo',
  'Rotary Speaker',
  'Uni-Vibe',
  'Slicer',
  'Vibrato',
  'Ring Modulator',
  'Humanizer',
  'Chorus',
  'Acoustic Guitar Simulator',
  'MXR Phase 90',
  'MXR Flanger 117',
  'Cry Baby Wah 95',
  'Boss DC-30',
  'Heavy Octave',
  'Pedal Bend',
];

const DELAY_TYPE_NAMES = [
  'Digital Delay',
  'Pan Delay',
  'Stereo Delay',
  'Analog Delay',
  'Tape Echo',
  'Reverse Delay',
  'Modulate Delay',
  'Roland SDE-3000 Delay',
];
const AMP_TYPE_NAMES = ['Acoustic', 'Clean', 'Pushed', 'Crunch', 'Lead', 'Brown'];
const REVERB_TYPE_NAMES = ['Plate Reverb', 'Room Reverb', 'Hall Reverb', 'Spring Reverb', 'Modulate Reverb'];

interface ValueOption {
  value: number;
  label: string;
}

interface LiveRmsHistoryBar {
  x: number;
  y: number;
  width: number;
  height: number;
  tone: 'above' | 'below';
}

interface TypeOption {
  value: number;
  label: string;
}

function buildValueOptions(labels: readonly string[]): ValueOption[] {
  return labels.map((label, value) => ({ value, label }));
}

@Component({
  selector: 'app-dashboard-sticky-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: .75rem;
      z-index: 4;
    }
  `],
  template: `
    @if (model(); as vm) {
      <section class="d-grid gap-3">
        <div class="card shadow-sm">
          <div class="card-body py-2 px-3">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-primary btn-sm" [disabled]="vm.testAmpDisabled" (click)="testAmpConnection.emit()">{{ vm.testAmpLabel }}</button>
                <button type="button" class="btn btn-outline-primary btn-sm" [disabled]="vm.syncLivePatchDisabled" (click)="syncLivePatch.emit()">{{ vm.syncLivePatchLabel }}</button>
                <button type="button" class="btn btn-outline-warning btn-sm" [disabled]="vm.reapplyDisabled" (click)="reapplyCurrentSettingsToAmp.emit()">{{ vm.reapplyLabel }}</button>
                <button type="button" class="btn btn-success btn-sm" [disabled]="vm.storeToAmpDisabled" (click)="persistLivePatchToAmp.emit()">{{ vm.storeToAmpLabel }}</button>
                <button type="button" class="btn btn-outline-secondary btn-sm" (click)="openToneLibraryModal.emit()">{{ vm.loadPatchLabel }}</button>
                <button type="button" class="btn btn-outline-success btn-sm" (click)="openToneSaveModal.emit()">{{ vm.saveCurrentSettingsLabel }}</button>
                <button type="button" class="btn btn-outline-primary btn-sm" (click)="openToneDesignerModal.emit()">{{ vm.aiDesignerLabel }}</button>
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm" (click)="clearLiveMeterChart()">Clear</button>
            </div>

            <div class="d-flex flex-wrap gap-3 small text-secondary mb-2">
              <span>Current Slot: <strong>{{ vm.currentSlotLabel }}</strong></span>
              <span>Patch Name: <strong>{{ vm.patchName }}</strong></span>
              <span>Live Amp Name: <strong>{{ vm.liveAmpName }}</strong></span>
              <span>Stored Amp Name: <strong>{{ vm.ampSlotSavedName }}</strong></span>
            </div>

            <div class="d-flex flex-wrap gap-3 small text-secondary">
              <span>Live Confirmed: <code>{{ vm.livePatchConfirmedAt || 'n/a' }}</code></span>
              <span>Last Sync: <code>{{ vm.lastSyncedAt || 'n/a' }}</code></span>
              <span>Total Sync Time: <code>{{ vm.totalSyncMsText }}</code></span>
              <span>
                Live Meter:
                <code [class.text-success]="liveMeterConnected()" [class.text-secondary]="!liveMeterConnected()">
                  {{ liveMeterConnected() ? 'Connected' : 'Stopped' }}
                </code>
              </span>
            </div>

            <div class="small text-secondary mt-2">Total Level</div>
            <div class="d-flex align-items-baseline justify-content-between gap-2">
              <span class="fs-5 fw-semibold">{{ formatDb(liveRmsDbfs()) }}</span>
              <span class="small text-danger fw-semibold">Max <span class="border-bottom border-danger pb-1">{{ formatDb(liveRmsMaxDbfs()) }}</span></span>
            </div>
            <div class="d-flex justify-content-between align-items-center gap-2 small text-secondary">
              <span>Target {{ formatDb(liveTotalLevelTargetRms()) }}</span>
              <span>2s RMS chunks</span>
            </div>
            <div class="d-flex justify-content-between align-items-center gap-2 small text-secondary mt-1">
              <span>Current {{ liveTotalLevelDelta(liveRmsDbfs()) }}</span>
              <span>Max Hold {{ liveTotalLevelDelta(liveRmsMaxDbfs()) }}</span>
            </div>
            <div class="mt-2 rounded overflow-hidden border" style="background: linear-gradient(180deg, rgba(13, 110, 253, 0.04) 0%, rgba(220, 53, 69, 0.04) 50%, rgba(25, 135, 84, 0.04) 100%), #f8f9fa;">
              <svg class="d-block w-100" viewBox="0 0 1000 288" preserveAspectRatio="none" aria-label="Running total level history">
                <line x1="0" [attr.y1]="liveTotalLevelTargetLineY()" x2="1000" [attr.y2]="liveTotalLevelTargetLineY()" style="stroke:#dc3545;stroke-width:2;" />
                @for (bar of liveTotalLevelBars(); track $index) {
                  <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.width" [attr.height]="bar.height" [attr.fill]="bar.tone === 'above' ? '#dc3545' : '#0d6efd'" />
                }
              </svg>
            </div>
            <div class="d-flex justify-content-between align-items-center gap-2 small text-secondary mt-2">
              <span>{{ formatDb(liveTotalLevelWindowMin()) }}</span>
              <span class="text-danger fw-semibold text-uppercase">Target</span>
              <span>{{ formatDb(liveTotalLevelWindowMax()) }}</span>
            </div>
            <div class="small text-secondary mt-2">Zoom {{ formatDb(liveTotalLevelWindowMin()) }} to {{ formatDb(liveTotalLevelWindowMax()) }}</div>
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-body py-2">
            <div class="d-flex flex-wrap gap-2 mt-2">
              <div class="card shadow-sm" style="flex: 1 1 18rem; min-width: 18rem;">
                <div class="card-body py-2 px-3 d-grid gap-2">
                  <div class="small text-secondary">Global Target RMS</div>
                  <input type="number" step="0.1" class="form-control form-control-sm" style="width: 7.5rem;" [value]="globalNormalizeTargetRms()" (input)="globalNormalizeTargetRms.set($any($event.target).value); globalNormalizeTargetRmsChange.emit($any($event.target).value)" (blur)="commitGlobalNormalizeTargetRms(); globalNormalizeTargetRmsCommit.emit()" />
                </div>
              </div>
              <div class="card shadow-sm" style="flex: 1 1 11rem; min-width: 11rem;">
                <div class="card-body py-2 px-3">
                  <div class="small text-secondary mb-1">Live At</div>
                  <code class="d-block text-nowrap">{{ liveMeterAt() || 'n/a' }}</code>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    }
  `,
})
export class DashboardStickyPanelComponent implements OnInit, OnDestroy {
  readonly model = input.required<DashboardStickyPanelViewModel>();
  readonly testAmpConnection = output<void>();
  readonly syncLivePatch = output<void>();
  readonly reapplyCurrentSettingsToAmp = output<void>();
  readonly persistLivePatchToAmp = output<void>();
  readonly openToneLibraryModal = output<void>();
  readonly openToneSaveModal = output<void>();
  readonly openToneDesignerModal = output<void>();
  readonly globalNormalizeTargetRmsChange = output<string>();
  readonly globalNormalizeTargetRmsCommit = output<void>();

  readonly globalNormalizeTargetRms = signal(DEFAULT_TARGET_RMS_DBFS.toFixed(2));
  readonly liveRmsDbfs = signal<number | null>(null);
  readonly liveRmsMaxDbfs = signal<number | null>(null);
  readonly liveRmsHistory = signal<number[]>([]);
  readonly liveMeterAt = signal('');
  readonly liveMeterConnected = signal(false);

  private readonly ngZone = inject(NgZone);
  private liveMeterSource: EventSource | null = null;
  private liveMeterReconnectHandle: ReturnType<typeof setTimeout> | null = null;
  private liveMeterShouldRun = false;

  ngOnInit(): void {
    this.loadGlobalNormalizeTargetRms();
    this.globalNormalizeTargetRmsChange.emit(this.globalNormalizeTargetRms());
    this.startLiveMeter();
  }

  ngOnDestroy(): void {
    this.shutdownLiveMeter();
  }

  clearLiveMeterChart(): void {
    this.liveRmsHistory.set([]);
    this.liveRmsMaxDbfs.set(null);
  }

  formatDb(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
      return 'n/a';
    }
    return `${value.toFixed(2)} dBFS`;
  }

  liveTotalLevelTargetRms(): number {
    const parsed = Number.parseFloat(this.globalNormalizeTargetRms());
    return Number.isFinite(parsed) ? parsed : DEFAULT_TARGET_RMS_DBFS;
  }

  liveTotalLevelWindowMin(): number {
    return this.liveTotalLevelTargetRms() - LIVE_TOTAL_LEVEL_ZOOM_DB;
  }

  liveTotalLevelWindowMax(): number {
    return this.liveTotalLevelTargetRms() + LIVE_TOTAL_LEVEL_ZOOM_DB;
  }

  liveTotalLevelDelta(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
      return 'n/a';
    }
    const delta = value - this.liveTotalLevelTargetRms();
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(2)} dB`;
  }

  liveTotalLevelTargetLineY(): number {
    return this.liveTotalLevelValueToGraphY(this.liveTotalLevelTargetRms());
  }

  liveTotalLevelBars(): LiveRmsHistoryBar[] {
    const values = this.liveRmsHistory();
    if (values.length === 0) {
      return [];
    }
    const graphWidth = LIVE_TOTAL_LEVEL_GRAPH_WIDTH;
    const baselineY = this.liveTotalLevelTargetLineY();
    const latestIndex = values.length - 1;
    return values
      .map((value, index) => {
        const distanceFromLatest = latestIndex - index;
        const x = graphWidth - LIVE_TOTAL_LEVEL_BAR_WIDTH - (distanceFromLatest * LIVE_TOTAL_LEVEL_BAR_STEP);
        if (x + LIVE_TOTAL_LEVEL_BAR_WIDTH <= 0) {
          return null;
        }
        const y = this.liveTotalLevelValueToGraphY(value);
        const top = Math.min(y, baselineY);
        const height = Math.max(1, Math.abs(y - baselineY));
        return {
          x,
          y: top,
          width: LIVE_TOTAL_LEVEL_BAR_WIDTH,
          height,
          tone: value >= this.liveTotalLevelTargetRms() ? 'above' : 'below',
        };
      })
      .filter((bar): bar is LiveRmsHistoryBar => bar !== null);
  }

  commitGlobalNormalizeTargetRms(): void {
    const parsed = Number.parseFloat(this.globalNormalizeTargetRms());
    const normalized = Number.isFinite(parsed) ? parsed : DEFAULT_TARGET_RMS_DBFS;
    const text = normalized.toFixed(2);
    this.globalNormalizeTargetRms.set(text);
    try {
      window.localStorage.setItem(GLOBAL_NORMALIZE_TARGET_STORAGE_KEY, text);
    } catch {
      // local storage is best-effort only
    }
  }

  private loadGlobalNormalizeTargetRms(): void {
    try {
      const saved = window.localStorage.getItem(GLOBAL_NORMALIZE_TARGET_STORAGE_KEY);
      if (!saved) {
        return;
      }
      const parsed = Number.parseFloat(saved);
      if (!Number.isFinite(parsed)) {
        return;
      }
      this.globalNormalizeTargetRms.set(parsed.toFixed(2));
    } catch {
      // local storage is best-effort only
    }
  }

  private startLiveMeter(): void {
    this.liveMeterShouldRun = true;
    this.disconnectLiveMeter();
    this.ngZone.runOutsideAngular(() => {
      const source = new EventSource(`/api/v1/audio/live/sse?window_sec=${LIVE_METER_WINDOW_SEC}`);
      source.onmessage = (event: MessageEvent<string>) => {
        try {
          const payload = JSON.parse(event.data) as Record<string, unknown>;
          const eventType = String(payload['type'] ?? '');
          if (eventType === 'connected') {
            this.liveMeterConnected.set(true);
            return;
          }
          if (eventType !== 'audio_metrics') {
            return;
          }
          const rms = Number(payload['rms_dbfs']);
          const ts = String(payload['ts'] ?? '');
          if (Number.isFinite(rms)) {
            this.liveRmsDbfs.set(rms);
            this.liveRmsMaxDbfs.update((current) => (current === null || rms > current ? rms : current));
            this.pushLiveRmsPoint(rms);
          }
          this.liveMeterAt.set(ts);
        } catch {
          // Keep the panel stable if one event is malformed.
        }
      };
      source.onerror = () => {
        this.liveMeterConnected.set(false);
        this.disconnectLiveMeter();
        this.scheduleLiveMeterReconnect();
      };
      this.liveMeterSource = source;
    });
  }

  private disconnectLiveMeter(): void {
    if (this.liveMeterSource !== null) {
      this.liveMeterSource.close();
      this.liveMeterSource = null;
    }
    this.liveMeterConnected.set(false);
  }

  private shutdownLiveMeter(): void {
    this.liveMeterShouldRun = false;
    this.clearLiveMeterReconnect();
    this.disconnectLiveMeter();
    this.resetLiveMeterDisplay();
  }

  private resetLiveMeterDisplay(): void {
    this.liveRmsDbfs.set(null);
    this.liveRmsMaxDbfs.set(null);
    this.liveRmsHistory.set([]);
    this.liveMeterAt.set('');
  }

  private scheduleLiveMeterReconnect(): void {
    if (!this.liveMeterShouldRun || this.liveMeterReconnectHandle !== null) {
      return;
    }
    this.liveMeterReconnectHandle = setTimeout(() => {
      this.liveMeterReconnectHandle = null;
      if (!this.liveMeterShouldRun || this.liveMeterSource !== null) {
        return;
      }
      this.startLiveMeter();
    }, 1000);
  }

  private clearLiveMeterReconnect(): void {
    if (this.liveMeterReconnectHandle !== null) {
      clearTimeout(this.liveMeterReconnectHandle);
      this.liveMeterReconnectHandle = null;
    }
  }

  private pushLiveRmsPoint(value: number): void {
    this.liveRmsHistory.update((current) => {
      const next = [...current, value];
      if (next.length > LIVE_RMS_HISTORY_LIMIT) {
        return next.slice(next.length - LIVE_RMS_HISTORY_LIMIT);
      }
      return next;
    });
  }

  private liveTotalLevelValueToGraphY(value: number): number {
    const min = this.liveTotalLevelWindowMin();
    const max = this.liveTotalLevelWindowMax();
    if (max <= min) {
      return LIVE_TOTAL_LEVEL_GRAPH_HEIGHT / 2;
    }
    const clamped = Math.max(min, Math.min(max, value));
    const normalized = (clamped - min) / (max - min);
    return (1 - normalized) * LIVE_TOTAL_LEVEL_GRAPH_HEIGHT;
  }

}
