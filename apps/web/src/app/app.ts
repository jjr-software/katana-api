import { Component, OnDestroy, OnInit, signal } from '@angular/core';

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
  "1960s Fuzz",
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
const AMP_TYPE_NAMES = ['Acoustic', 'Clean', 'Crunch', 'Lead', 'Brown'];
const REVERB_TYPE_NAMES = ['Plate Reverb', 'Room Reverb', 'Hall Reverb', 'Spring Reverb', 'Modulate Reverb'];
const LIVE_RMS_WINDOW_POINTS = 96;
const EDITOR_LIVE_APPLY_DEBOUNCE_MS = 180;
const EDITOR_LIVE_APPLY_MIN_GAP_MS = 120;

interface AmpConnectionTestResponse {
  ok: boolean;
  midi_port: string;
  request_hex: string;
  response_hex: string;
}

interface SlotPatchSummary {
  slot: number;
  slot_label: string;
  patch_name: string;
  config_hash_sha256: string;
  patch: Record<string, unknown> | null;
  in_sync: boolean;
  is_saved: boolean;
  synced_at: string;
  slot_sync_ms: number;
}

interface QuickSlotSummary {
  slot: number;
  slot_label: string;
  patch_name: string;
  inferred_hash_sha256: string | null;
  candidate_hashes_sha256: string[];
  match_count: number;
  in_sync: boolean;
  is_saved: boolean;
  synced_at: string;
  slot_sync_ms: number;
}

interface SlotSyncResponse {
  synced_at: string;
  slot: SlotPatchSummary;
}

interface QuickSlotsStateResponse {
  synced_at: string;
  total_sync_ms: number;
  slots: QuickSlotSummary[];
}

interface QuickSyncEnqueueResponse {
  job_id: string;
  operation: string;
  status: string;
  created_at: string;
}

interface QuickSyncJobResponse {
  job_id: string;
  operation: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  elapsed_ms: number;
  error: string | null;
  result: QuickSlotsStateResponse | null;
}

interface FullDumpSlotResponse {
  slot: number;
  slot_label: string;
  in_sync: boolean;
  is_saved: boolean;
  synced_at: string;
  slot_sync_ms: number;
  patch: Record<string, unknown>;
  curated: Record<string, unknown>[];
}

interface FullAmpDumpResponse {
  synced_at: string;
  amp_state_hash_sha256: string;
  total_sync_ms: number;
  slots: FullDumpSlotResponse[];
}

interface BackupEnqueueResponse {
  job_id: string;
  operation: string;
  status: string;
  created_at: string;
}

interface BackupJobResponse {
  job_id: string;
  operation: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  elapsed_ms: number;
  error: string | null;
  result: FullAmpDumpResponse | null;
}

interface BackupSnapshotSummary {
  id: number;
  label: string;
  synced_at: string;
  amp_state_hash_sha256: string;
  total_sync_ms: number;
  slot_count: number;
  created_at: string;
}

interface BackupSnapshotListResponse {
  snapshots: BackupSnapshotSummary[];
}

interface CurrentPatchResponse {
  created_at: string;
  patch: Record<string, unknown>;
}

interface ApplyCurrentPatchResponse {
  applied_at: string;
  patch: Record<string, unknown>;
}

interface AudioSampleResponse {
  id: number;
  patch_hash: string | null;
  slot: number | null;
  source: string;
  duration_sec: number;
  rate: number;
  channels: number;
  rms_dbfs: number;
  peak_dbfs: number;
  sample_count: number;
  is_level_marker: boolean;
  created_at: string;
}

interface QueueJobSummary {
  job_id: string;
  operation: string;
  slot: number | null;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  elapsed_ms: number;
  error: string | null;
}

interface QueueStateResponse {
  generated_at: string;
  queued_count: number;
  running_job_id: string | null;
  jobs: QueueJobSummary[];
}

interface SlotCard {
  slot: number;
  slot_label: string;
  patch_name: string;
  config_hash_sha256: string;
  patch: Record<string, unknown> | null;
  in_sync: boolean;
  is_saved: boolean;
  synced_at: string;
  slot_sync_ms: number;
  inferred: boolean;
  match_count: number;
  out_synced: boolean;
  measured_rms_dbfs: number | null;
  measured_peak_dbfs: number | null;
  measured_at: string;
}

type StageName = 'booster' | 'mod' | 'fx' | 'delay' | 'reverb';

interface TypeOption {
  value: number;
  label: string;
}

interface StageParam {
  id: string;
  label: string;
  rawIndex: number;
  value: number;
}

function defaultSlotCards(): SlotCard[] {
  return Array.from({ length: 8 }, (_, idx) => {
    const slot = idx + 1;
    const bank = slot <= 4 ? 'A' : 'B';
    const channel = slot <= 4 ? slot : slot - 4;
    return {
      slot,
      slot_label: `${bank}:${channel}`,
      patch_name: '',
      config_hash_sha256: '',
      patch: null,
      in_sync: false,
      is_saved: false,
      synced_at: '',
      slot_sync_ms: 0,
      inferred: false,
      match_count: 0,
      out_synced: false,
      measured_rms_dbfs: null,
      measured_peak_dbfs: null,
      measured_at: '',
    };
  });
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  status = signal('Idle');
  responseJson = signal('');
  slots = signal<SlotCard[]>(defaultSlotCards());
  ampStateHash = signal('');
  lastSyncedAt = signal('');
  totalSyncMs = signal(0);
  queueJobs = signal<QueueJobSummary[]>([]);
  queueGeneratedAt = signal('');
  levelMarkerRmsDbfs = signal<number | null>(null);
  levelMarkerPeakDbfs = signal<number | null>(null);
  levelMarkerCapturedAt = signal('');
  liveRmsDbfs = signal<number | null>(null);
  livePeakDbfs = signal<number | null>(null);
  liveMeterAt = signal('');
  liveMeterConnected = signal(false);
  liveRmsHistory = signal<number[]>([]);
  isMeasuringSlotsRms = signal(false);
  isMeasuringActivePatch = signal(false);
  measureCountdownSec = signal(0);
  queuePollHandle: ReturnType<typeof setInterval> | null = null;
  liveMeterSource: EventSource | null = null;
  rawModalOpen = signal(false);
  rawModalTitle = signal('');
  rawModalJson = signal('');
  editorModalOpen = signal(false);
  editorSlotNumber = signal<number | null>(null);
  editorSlotLabel = signal('');
  editorPatchDraft = signal<Record<string, unknown> | null>(null);
  editorBaseFingerprint = signal('');
  editorBaseConfigHash = signal('');
  editorLiveApplyEnabled = signal(true);
  editorLiveApplyPending = signal(false);
  editorLiveApplyError = signal('');
  editorLiveApplyHandle: ReturnType<typeof setTimeout> | null = null;
  editorLiveApplyInFlight = false;
  editorLiveApplyLastStartedAtMs = 0;
  editorLiveApplyLastAppliedFingerprint = '';
  editorLiveApplyQueuedFingerprint: string | null = null;
  patchSetModalOpen = signal(false);
  patchSetSnapshots = signal<BackupSnapshotSummary[]>([]);

  ngOnInit(): void {
    void this.refreshQueueState();
    void this.loadAudioLevelMarker();
    this.queuePollHandle = setInterval(() => {
      void this.refreshQueueState();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.queuePollHandle !== null) {
      clearInterval(this.queuePollHandle);
      this.queuePollHandle = null;
    }
    this.stopLiveMeter();
    if (this.editorLiveApplyHandle !== null) {
      clearTimeout(this.editorLiveApplyHandle);
      this.editorLiveApplyHandle = null;
    }
  }

  async testAmpConnection(): Promise<void> {
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
    }
  }

  async syncAmpSlot(slot: number): Promise<void> {
    this.status.set(`Syncing slot ${slot} (full patch read)...`);
    this.responseJson.set('');

    try {
      const response = await fetch(`/api/v1/amp/slots/${slot}/sync`, {
        method: 'POST',
        cache: 'no-store',
      });
      const payload = (await response.json()) as SlotSyncResponse | { detail: unknown };
      if (!response.ok) {
        this.status.set(`Slot ${slot} sync failed`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }

      const synced = payload as SlotSyncResponse;
      this.applySyncedSlot(synced.slot);
      this.lastSyncedAt.set(synced.synced_at);
      this.totalSyncMs.set(synced.slot.slot_sync_ms);
      this.ampStateHash.set('');
      this.status.set(`Slot ${slot} full sync succeeded (${this.formatMs(synced.slot.slot_sync_ms)})`);
    } catch (error: unknown) {
      this.status.set(`Slot ${slot} sync failed`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    }
  }

  async saveSlotPatch(slot: SlotCard): Promise<void> {
    if (!slot.patch || !slot.config_hash_sha256) {
      this.status.set(`No full patch payload loaded for ${slot.slot_label}. Sync this slot first.`);
      return;
    }

    this.status.set(`Checking library for ${slot.slot_label}...`);
    this.responseJson.set('');

    try {
      const lookupResponse = await fetch(`/api/v1/patches/configs/${slot.config_hash_sha256}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (lookupResponse.ok) {
        this.markSlotSaved(slot.slot);
        this.status.set(`${slot.slot_label} already in library`);
        this.responseJson.set(
          JSON.stringify(
            {
              message: 'Patch already exists in library',
              slot: slot.slot_label,
              hash_id: slot.config_hash_sha256,
            },
            null,
            2,
          ),
        );
        return;
      }

      if (lookupResponse.status !== 404) {
        const payload = (await lookupResponse.json()) as { detail?: unknown };
        this.status.set(`Failed library lookup for ${slot.slot_label}`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }

      const saveResponse = await fetch('/api/v1/patches/configs', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot: slot.patch }),
      });
      const savePayload = (await saveResponse.json()) as { hash_id?: string; detail?: unknown };
      if (!saveResponse.ok) {
        this.status.set(`Failed saving ${slot.slot_label}`);
        this.responseJson.set(JSON.stringify(savePayload, null, 2));
        return;
      }

      const persistedHash = typeof savePayload.hash_id === 'string' ? savePayload.hash_id : slot.config_hash_sha256;
      this.markSlotSaved(slot.slot, persistedHash);
      this.status.set(`${slot.slot_label} saved to library`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Patch saved to library',
            slot: slot.slot_label,
            hash_id: persistedHash,
          },
          null,
          2,
        ),
      );
    } catch (error: unknown) {
      this.status.set(`Failed saving ${slot.slot_label}`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    }
  }

  async measureActivePatch(): Promise<void> {
    if (this.isMeasuringActivePatch()) {
      return;
    }
    const durationSec = 10;
    this.isMeasuringActivePatch.set(true);
    this.measureCountdownSec.set(durationSec);
    this.responseJson.set('');
    let countdownHandle: ReturnType<typeof setInterval> | null = null;
    let source: EventSource | null = null;
    try {
      this.status.set('Reading active patch from amp...');
      const currentPatchResponse = await fetch('/api/v1/amp/current-patch', {
        method: 'GET',
        cache: 'no-store',
      });
      const currentPatchPayload = (await currentPatchResponse.json()) as CurrentPatchResponse | { detail?: unknown };
      if (!currentPatchResponse.ok) {
        throw new Error(`active patch read failed: ${JSON.stringify(currentPatchPayload)}`);
      }
      const currentPatch = currentPatchPayload as CurrentPatchResponse;
      const activeHash = this.readString(currentPatch.patch, 'config_hash_sha256');
      const activeName = this.readString(currentPatch.patch, 'patch_name') ?? 'Active Patch';
      if (!activeHash) {
        throw new Error('active patch payload missing config_hash_sha256');
      }

      let maxRms = Number.NEGATIVE_INFINITY;
      let maxPeak = Number.NEGATIVE_INFINITY;
      let samples = 0;
      let lastTs = '';
      source = new EventSource('/api/v1/audio/live/sse?window_sec=0.25');
      source.onmessage = (event: MessageEvent<string>) => {
        try {
          const payload = JSON.parse(event.data) as Record<string, unknown>;
          if (String(payload['type'] ?? '') !== 'audio_metrics') {
            return;
          }
          const rms = Number(payload['rms_dbfs']);
          const peak = Number(payload['peak_dbfs']);
          if (Number.isFinite(rms)) {
            maxRms = Math.max(maxRms, rms);
          }
          if (Number.isFinite(peak)) {
            maxPeak = Math.max(maxPeak, peak);
          }
          samples += 1;
          lastTs = String(payload['ts'] ?? '');
        } catch {
          // ignore malformed event payloads; measurement window continues
        }
      };

      const startedAt = Date.now();
      countdownHandle = setInterval(() => {
        const remaining = durationSec - Math.floor((Date.now() - startedAt) / 1000);
        this.measureCountdownSec.set(Math.max(0, remaining));
      }, 200);
      this.status.set(`Measuring active patch (${activeName}) max levels for ${durationSec}s...`);
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), durationSec * 1000);
      });

      if (samples <= 0 || !Number.isFinite(maxRms) || !Number.isFinite(maxPeak)) {
        throw new Error('No live audio metric samples captured during 10-second window');
      }

      const measuredAt = lastTs || new Date().toISOString();
      const matchedSlot = this.slots().find((item) => item.config_hash_sha256 === activeHash);
      if (matchedSlot) {
        this.setSlotMeasuredRms(matchedSlot.slot, maxRms, maxPeak, measuredAt);
      }
      this.status.set(`Max-level measurement complete for active patch (${activeName})`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: '10-second max-level measurement captured for active patch',
            active_patch_name: activeName,
            active_patch_hash: activeHash,
            matched_slot: matchedSlot?.slot_label ?? null,
            max_rms_dbfs: maxRms,
            max_peak_dbfs: maxPeak,
            events: samples,
            captured_at: measuredAt,
          },
          null,
          2,
        ),
      );
    } catch (error: unknown) {
      this.status.set('Measure active patch failed');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Measure active patch failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    } finally {
      if (countdownHandle !== null) {
        clearInterval(countdownHandle);
      }
      if (source !== null) {
        source.close();
      }
      this.measureCountdownSec.set(0);
      this.isMeasuringActivePatch.set(false);
    }
  }

  async captureAudioLevelMarker(): Promise<void> {
    this.status.set('Capturing audio level marker...');
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/audio/marker/capture', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_sec: 2.0,
        }),
      });
      const payload = (await response.json()) as AudioSampleResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set('Audio level marker capture failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const marker = payload as AudioSampleResponse;
      this.levelMarkerRmsDbfs.set(marker.rms_dbfs);
      this.levelMarkerPeakDbfs.set(marker.peak_dbfs);
      this.levelMarkerCapturedAt.set(marker.created_at);
      this.status.set('Audio level marker captured');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Audio level marker captured',
            rms_dbfs: marker.rms_dbfs,
            peak_dbfs: marker.peak_dbfs,
            captured_at: marker.created_at,
          },
          null,
          2,
        ),
      );
    } catch (error: unknown) {
      this.status.set('Audio level marker capture failed');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    }
  }

  async loadAudioLevelMarker(): Promise<void> {
    try {
      const response = await fetch('/api/v1/audio/marker', {
        method: 'GET',
        cache: 'no-store',
      });
      if (response.status === 404) {
        this.levelMarkerRmsDbfs.set(null);
        this.levelMarkerPeakDbfs.set(null);
        this.levelMarkerCapturedAt.set('');
        return;
      }
      const payload = (await response.json()) as AudioSampleResponse | { detail?: unknown };
      if (!response.ok) {
        return;
      }
      const marker = payload as AudioSampleResponse;
      this.levelMarkerRmsDbfs.set(marker.rms_dbfs);
      this.levelMarkerPeakDbfs.set(marker.peak_dbfs);
      this.levelMarkerCapturedAt.set(marker.created_at);
    } catch {
      // marker display is optional; keep current UI state
    }
  }

  startLiveMeter(): void {
    this.stopLiveMeter();
    this.status.set('Starting live audio meter feed...');
    const source = new EventSource('/api/v1/audio/live/sse?window_sec=0.5');
    source.onmessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as Record<string, unknown>;
        const eventType = String(payload['type'] ?? '');
        if (eventType === 'connected') {
          this.liveMeterConnected.set(true);
          this.status.set('Live audio meter connected');
          return;
        }
        if (eventType !== 'audio_metrics') {
          return;
        }
        const rms = Number(payload['rms_dbfs']);
        const peak = Number(payload['peak_dbfs']);
        const ts = String(payload['ts'] ?? '');
        if (Number.isFinite(rms)) {
          this.liveRmsDbfs.set(rms);
          this.pushLiveRmsPoint(rms);
        }
        if (Number.isFinite(peak)) {
          this.livePeakDbfs.set(peak);
        }
        this.liveMeterAt.set(ts);
      } catch (error: unknown) {
        this.status.set('Live audio meter parse failed');
        this.responseJson.set(
          JSON.stringify(
            {
              message: 'Failed to parse live audio meter event',
              error: String(error),
            },
            null,
            2,
          ),
        );
      }
    };
    source.onerror = () => {
      this.liveMeterConnected.set(false);
      this.status.set('Live audio meter disconnected');
      this.stopLiveMeter();
    };
    this.liveMeterSource = source;
  }

  stopLiveMeter(): void {
    if (this.liveMeterSource !== null) {
      this.liveMeterSource.close();
      this.liveMeterSource = null;
    }
    this.liveMeterConnected.set(false);
  }

  rmsGraphPoints(): string {
    const values = this.liveRmsHistory();
    if (values.length === 0) {
      return '';
    }
    const width = 220;
    const height = 64;
    const minDb = -90;
    const maxDb = 0;
    if (values.length === 1) {
      const y = this.rmsToGraphY(values[0], minDb, maxDb, height);
      return `0,${y.toFixed(1)} ${width},${y.toFixed(1)}`;
    }
    const step = width / (values.length - 1);
    return values
      .map((value, idx) => {
        const x = idx * step;
        const y = this.rmsToGraphY(value, minDb, maxDb, height);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  rmsGraphBars(): Array<{ x: number; y: number; width: number; height: number }> {
    const values = this.liveRmsHistory();
    if (values.length === 0) {
      return [];
    }
    const graphWidth = 1000;
    const graphHeight = 64;
    const minDb = -90;
    const maxDb = 0;
    const step = graphWidth / LIVE_RMS_WINDOW_POINTS;
    const barWidth = Math.max(1, step * 0.7);
    const startIndex = Math.max(0, LIVE_RMS_WINDOW_POINTS - values.length);
    return values.map((value, idx) => {
      const y = this.rmsToGraphY(value, minDb, maxDb, graphHeight);
      const x = ((startIndex + idx) * step) + ((step - barWidth) / 2);
      const height = Math.max(1, graphHeight - y);
      return {
        x,
        y,
        width: barWidth,
        height,
      };
    });
  }

  private pushLiveRmsPoint(value: number): void {
    this.liveRmsHistory.update((current) => {
      const next = [...current, value];
      if (next.length > LIVE_RMS_WINDOW_POINTS) {
        return next.slice(next.length - LIVE_RMS_WINDOW_POINTS);
      }
      return next;
    });
  }

  private rmsToGraphY(value: number, minDb: number, maxDb: number, height: number): number {
    const clamped = Math.max(minDb, Math.min(maxDb, value));
    const normalized = (clamped - minDb) / (maxDb - minDb);
    return (1 - normalized) * height;
  }

  async measureAllSlotsRms(): Promise<void> {
    if (this.isMeasuringSlotsRms()) {
      return;
    }
    this.isMeasuringSlotsRms.set(true);
    this.responseJson.set('');
    const measurements: Array<{ slot: number; slot_label: string; rms_dbfs: number; captured_at: string }> = [];
    try {
      for (let slot = 1; slot <= 8; slot += 1) {
        this.status.set(`Slot ${slot}/8: syncing patch...`);
        const synced = await this.syncSlotForMeasurement(slot);
        this.applySyncedSlot(synced.slot);
        this.lastSyncedAt.set(synced.synced_at);
        this.totalSyncMs.set(synced.slot.slot_sync_ms);
        this.ampStateHash.set('');

        this.status.set(`Slot ${slot}/8: measuring RMS (5s)...`);
        const sample = await this.captureSlotRmsSample(synced.slot);
        this.setSlotMeasuredRms(synced.slot.slot, sample.rms_dbfs, sample.peak_dbfs, sample.created_at);
        measurements.push({
          slot: synced.slot.slot,
          slot_label: synced.slot.slot_label,
          rms_dbfs: sample.rms_dbfs,
          captured_at: sample.created_at,
        });
      }
      this.status.set('Completed 5-second RMS measurement across all slots');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Measured 5-second RMS for all slots',
            measurements,
          },
          null,
          2,
        ),
      );
    } catch (error: unknown) {
      this.status.set('5-second RMS slot cycle failed');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Measure all slots RMS failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    } finally {
      this.isMeasuringSlotsRms.set(false);
    }
  }

  canUseSlotActions(slot: SlotCard): boolean {
    return slot.in_sync && this.hasFullPatch(slot);
  }

  canOpenEditor(slot: SlotCard): boolean {
    return this.hasFullPatch(slot);
  }

  canSyncSlot(slot: SlotCard): boolean {
    return !(slot.in_sync && slot.is_saved);
  }

  slotSyncInLabel(slot: SlotCard): string {
    return slot.in_sync ? 'Sync-In OK' : 'Sync-In Missing';
  }

  slotSyncOutLabel(slot: SlotCard): string {
    return slot.out_synced ? 'Sync-Out OK' : 'Sync-Out Pending';
  }

  canSaveSlot(slot: SlotCard): boolean {
    if (slot.in_sync && slot.is_saved) {
      return false;
    }
    return this.canUseSlotActions(slot);
  }

  measureActiveButtonLabel(): string {
    if (this.isMeasuringActivePatch()) {
      return `Measure Active (${this.measureCountdownSec()}s)`;
    }
    return 'Measure Active Patch';
  }

  async quickSyncAmpSlots(): Promise<void> {
    this.status.set('Quick sync queued...');
    this.responseJson.set('');

    try {
      const enqueueResponse = await fetch('/api/v1/amp/slots/quick/sync', {
        method: 'POST',
        cache: 'no-store',
      });

      const enqueuePayload = (await enqueueResponse.json()) as QuickSyncEnqueueResponse | { detail: unknown };
      if (!enqueueResponse.ok) {
        this.status.set('Quick sync failed');
        this.responseJson.set(JSON.stringify(enqueuePayload, null, 2));
        return;
      }

      const queued = enqueuePayload as QuickSyncEnqueueResponse;
      const job = await this.waitForQuickSyncJob(queued.job_id);
      if (job.status !== 'succeeded' || job.result === null) {
        this.status.set('Quick sync failed');
        this.responseJson.set(
          JSON.stringify(
            {
              message: 'Queued quick sync job failed',
              job_id: job.job_id,
              status: job.status,
              error: job.error,
            },
            null,
            2,
          ),
        );
        return;
      }

      const quick = job.result;
      this.slots.set(this.mergeQuickState(quick));
      this.ampStateHash.set('');
      this.lastSyncedAt.set(quick.synced_at);
      this.totalSyncMs.set(quick.total_sync_ms);
      this.status.set('Quick sync succeeded');
    } catch (error: unknown) {
      this.status.set('Quick sync failed');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    }
  }

  async loadAmpState(): Promise<void> {
    this.status.set('Load amp state queued...');
    this.responseJson.set('');

    try {
      const enqueueResponse = await fetch('/api/v1/amp/backup', {
        method: 'POST',
        cache: 'no-store',
      });
      const enqueuePayload = (await enqueueResponse.json()) as BackupEnqueueResponse | { detail: unknown };
      if (!enqueueResponse.ok) {
        this.status.set('Load amp state failed');
        this.responseJson.set(JSON.stringify(enqueuePayload, null, 2));
        return;
      }

      const queued = enqueuePayload as BackupEnqueueResponse;
      const job = await this.waitForBackupJob(queued.job_id);
      if (job.status !== 'succeeded' || job.result === null) {
        this.status.set('Load amp state failed');
        this.responseJson.set(
          JSON.stringify(
            {
              message: 'Queued load amp state job failed',
              job_id: job.job_id,
              status: job.status,
              error: job.error,
            },
            null,
            2,
          ),
        );
        return;
      }

      this.slots.set(this.mergeDumpState(job.result));
      this.ampStateHash.set(job.result.amp_state_hash_sha256);
      this.lastSyncedAt.set(job.result.synced_at);
      this.totalSyncMs.set(job.result.total_sync_ms);
      this.status.set('Amp state loaded');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Amp state loaded; JSON stored server-side',
            job_id: job.job_id,
            synced_at: job.result.synced_at,
            amp_state_hash_sha256: job.result.amp_state_hash_sha256,
            total_sync_ms: job.result.total_sync_ms,
          },
          null,
          2,
        ),
      );
    } catch (error: unknown) {
      this.status.set('Load amp state failed');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    }
  }

  async openPatchSetLoader(): Promise<void> {
    this.status.set('Loading recent full-sync data...');
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/amp/backup/snapshots?limit=20', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as BackupSnapshotListResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set('Failed loading recent full-sync data');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const result = payload as BackupSnapshotListResponse;
      this.patchSetSnapshots.set(result.snapshots);
      this.patchSetModalOpen.set(true);
      if (result.snapshots.length === 0) {
        this.status.set('No recent full-sync data found');
      } else {
        this.status.set('Select a full-sync snapshot to load into cards');
      }
    } catch (error: unknown) {
      this.status.set('Failed loading recent full-sync data');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    }
  }

  closePatchSetModal(): void {
    this.patchSetModalOpen.set(false);
  }

  openEditor(slot: SlotCard): void {
    if (!slot.patch) {
      this.status.set(`No full patch payload loaded for ${slot.slot_label}. Sync this slot first.`);
      return;
    }
    const draft = this.clonePatch(slot.patch);
    this.editorSlotNumber.set(slot.slot);
    this.editorSlotLabel.set(slot.slot_label);
    this.editorPatchDraft.set(draft);
    this.editorBaseFingerprint.set(this.patchFingerprint(draft));
    this.editorBaseConfigHash.set(slot.config_hash_sha256);
    this.editorLiveApplyLastAppliedFingerprint = this.patchFingerprint(draft);
    this.editorLiveApplyQueuedFingerprint = null;
    this.editorLiveApplyInFlight = false;
    this.editorLiveApplyPending.set(false);
    this.editorLiveApplyError.set('');
    this.editorModalOpen.set(true);
  }

  closeEditorModal(): void {
    this.editorModalOpen.set(false);
    this.editorLiveApplyPending.set(false);
    this.editorLiveApplyError.set('');
    if (this.editorLiveApplyHandle !== null) {
      clearTimeout(this.editorLiveApplyHandle);
      this.editorLiveApplyHandle = null;
    }
    this.editorLiveApplyInFlight = false;
    this.editorLiveApplyQueuedFingerprint = null;
    this.editorBaseFingerprint.set('');
    this.editorBaseConfigHash.set('');
  }

  setEditorLiveApplyEnabled(enabled: boolean): void {
    this.editorLiveApplyEnabled.set(enabled);
    if (enabled) {
      this.scheduleEditorLiveApply();
    }
  }

  editorPatchName(): string {
    return this.readString(this.editorPatchDraft(), 'patch_name') ?? '';
  }

  editorIsModified(): boolean {
    const draftFingerprint = this.editorDraftFingerprint();
    const baseline = this.editorBaseFingerprint();
    if (!draftFingerprint || !baseline) {
      return false;
    }
    return draftFingerprint !== baseline;
  }

  editorHashLabel(): string {
    const draftHash = this.readString(this.editorPatchDraft(), 'config_hash_sha256') ?? '';
    const baselineHash = this.editorBaseConfigHash();
    if (this.editorIsModified()) {
      if (baselineHash) {
        return `${this.shortHash(baselineHash)} -> pending`;
      }
      return 'pending';
    }
    if (draftHash) {
      return this.shortHash(draftHash);
    }
    return 'n/a';
  }

  setEditorPatchName(value: string): void {
    this.updateEditorPatch((draft) => {
      draft['patch_name'] = value;
    });
  }

  editorAmpNumber(field: string): number | null {
    const amp = this.readObject(this.editorPatchDraft(), 'amp');
    return this.readNumber(amp, field);
  }

  setEditorAmpNumber(field: string, value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const amp = this.ensureObject(draft, 'amp');
      amp[field] = parsed;
    });
  }

  editorAmpTypeOptions(): TypeOption[] {
    return AMP_TYPE_NAMES.map((label, index) => ({ value: index, label }));
  }

  editorStageOn(stageName: StageName): boolean {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const stage = this.readObject(stages, stageName);
    return this.readBoolean(stage, 'on');
  }

  setEditorStageOn(stageName: StageName, checked: boolean): void {
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const stage = this.ensureObject(stages, stageName);
      stage['on'] = checked;
    });
  }

  editorStageType(stageName: StageName): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const stage = this.readObject(stages, stageName);
    return this.readNumber(stage, 'type');
  }

  setEditorStageType(stageName: StageName, value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const stage = this.ensureObject(stages, stageName);
      stage['type'] = parsed;
      const variantsRaw = stage['variants_raw'];
      if (Array.isArray(variantsRaw) && parsed >= 0 && parsed < variantsRaw.length) {
        const variant = variantsRaw[parsed];
        if (Array.isArray(variant)) {
          stage['raw'] = variant.map((item) => this.parseUnknownNumber(item));
        }
      }
      this.syncStageDerivedFields(stageName, stage);
    });
  }

  editorStageLevel(stageName: StageName): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const stage = this.readObject(stages, stageName);
    return this.readNumber(stage, 'effect_level');
  }

  setEditorStageLevel(stageName: StageName, value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const stage = this.ensureObject(stages, stageName);
      stage['effect_level'] = parsed;
      const raw = this.ensureNumericRaw(stage);
      const rawIndex = this.effectLevelRawIndex(stageName);
      if (rawIndex !== null && rawIndex < raw.length) {
        raw[rawIndex] = parsed;
      }
      stage['raw'] = raw;
    });
  }

  editorBoosterDrive(): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const stage = this.readObject(stages, 'booster');
    return this.readNumber(stage, 'drive');
  }

  setEditorBoosterDrive(value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const stage = this.ensureObject(stages, 'booster');
      stage['drive'] = parsed;
      const raw = this.ensureNumericRaw(stage);
      if (raw.length > 1) {
        raw[1] = parsed;
      }
      stage['raw'] = raw;
    });
  }

  stageTypeOptions(stageName: StageName): TypeOption[] {
    const table =
      stageName === 'booster'
        ? BOOSTER_TYPE_NAMES
        : stageName === 'mod' || stageName === 'fx'
          ? FX_TYPE_NAMES
          : stageName === 'delay'
            ? DELAY_TYPE_NAMES
            : REVERB_TYPE_NAMES;
    return table.map((label, index) => ({ value: index, label }));
  }

  editorStageTypeLabel(stageName: StageName): string {
    const type = this.editorStageType(stageName);
    if (type === null) {
      return 'n/a';
    }
    return this.effectTypeLabel(stageName, type);
  }

  editorStageRawLength(stageName: StageName): number {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const stage = this.readObject(stages, stageName);
    if (!stage) {
      return 0;
    }
    return this.ensureNumericRaw(stage).length;
  }

  editorStageParams(stageName: StageName): StageParam[] {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const stage = this.readObject(stages, stageName);
    if (!stage) {
      return [];
    }
    const raw = this.ensureNumericRaw(stage);
    if (raw.length <= 1) {
      return [];
    }
    const labels = this.stageParamLabels(stageName, raw.length);
    const params: StageParam[] = [];
    for (let idx = 1; idx < raw.length; idx += 1) {
      params.push({
        id: `${stageName}-${idx}`,
        label: labels[idx] ?? `P${idx}`,
        rawIndex: idx,
        value: raw[idx],
      });
    }
    return params;
  }

  setEditorStageParam(stageName: StageName, rawIndex: number, value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const stage = this.ensureObject(stages, stageName);
      const raw = this.ensureNumericRaw(stage);
      if (rawIndex >= raw.length) {
        return;
      }
      raw[rawIndex] = parsed;
      stage['raw'] = raw;
      this.syncStageDerivedFields(stageName, stage);
    });
  }

  applyEditorDraftToSlot(): void {
    const slotNumber = this.editorSlotNumber();
    const draft = this.editorPatchDraft();
    if (slotNumber === null || draft === null) {
      return;
    }
    const patchName = this.readString(draft, 'patch_name') ?? '';
    this.slots.update((current) =>
      current.map((card) => {
        if (card.slot !== slotNumber) {
          return card;
        }
        return {
          ...card,
          patch_name: patchName || card.patch_name,
          patch: this.clonePatch(draft),
          config_hash_sha256: '',
          in_sync: false,
          out_synced: false,
          is_saved: false,
          inferred: false,
        };
      }),
    );
    this.status.set(`Applied editor draft to ${this.editorSlotLabel()} (local only)`);
    this.closeEditorModal();
  }

  async saveEditorDraftToLibrary(): Promise<void> {
    const slotNumber = this.editorSlotNumber();
    const draft = this.editorPatchDraft();
    if (slotNumber === null || draft === null) {
      return;
    }
    this.status.set(`Saving editor draft for ${this.editorSlotLabel()}...`);
    this.responseJson.set('');
    try {
      const saveResponse = await fetch('/api/v1/patches/configs', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot: draft }),
      });
      const savePayload = (await saveResponse.json()) as { hash_id?: string; detail?: unknown };
      if (!saveResponse.ok || typeof savePayload.hash_id !== 'string') {
        this.status.set('Failed saving editor draft');
        this.responseJson.set(JSON.stringify(savePayload, null, 2));
        return;
      }
      const hashId = savePayload.hash_id;
      const patchName = this.readString(draft, 'patch_name') ?? '';
      this.slots.update((current) =>
        current.map((card) => {
          if (card.slot !== slotNumber) {
            return card;
          }
          return {
            ...card,
            patch_name: patchName || card.patch_name,
            patch: this.clonePatch(draft),
            config_hash_sha256: hashId,
            in_sync: false,
            out_synced: false,
            is_saved: true,
            inferred: false,
          };
        }),
      );
      this.status.set(`Editor draft saved for ${this.editorSlotLabel()}`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Editor draft saved to library',
            slot: this.editorSlotLabel(),
            hash_id: hashId,
          },
          null,
          2,
        ),
      );
      this.closeEditorModal();
    } catch (error: unknown) {
      this.status.set('Failed saving editor draft');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    }
  }

  async loadPatchSetSnapshot(snapshot: BackupSnapshotSummary): Promise<void> {
    this.status.set(`Loading snapshot ${snapshot.label}...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/amp/backup/snapshots/${snapshot.id}/load`, {
        method: 'POST',
        cache: 'no-store',
      });
      const payload = (await response.json()) as FullAmpDumpResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set('Failed loading snapshot');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const loaded = payload as FullAmpDumpResponse;
      this.slots.set(this.mergeSnapshotState(loaded));
      this.ampStateHash.set(loaded.amp_state_hash_sha256);
      this.lastSyncedAt.set(loaded.synced_at);
      this.totalSyncMs.set(loaded.total_sync_ms);
      this.patchSetModalOpen.set(false);
      this.status.set(`Loaded snapshot ${snapshot.label}`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Loaded full-sync data into cards (Saved + Not Synced)',
            snapshot_id: snapshot.id,
            synced_at: loaded.synced_at,
            amp_state_hash_sha256: loaded.amp_state_hash_sha256,
          },
          null,
          2,
        ),
      );
    } catch (error: unknown) {
      this.status.set('Failed loading snapshot');
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Browser request failed',
            error: String(error),
          },
          null,
          2,
        ),
      );
    }
  }

  private async waitForQuickSyncJob(jobId: string): Promise<QuickSyncJobResponse> {
    const maxPolls = 75;
    for (let i = 0; i < maxPolls; i += 1) {
      const response = await fetch(`/api/v1/amp/slots/quick/sync/${jobId}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as QuickSyncJobResponse | { detail: unknown };
      if (!response.ok) {
        throw new Error(`Quick sync job poll failed: ${JSON.stringify(payload)}`);
      }
      const job = payload as QuickSyncJobResponse;
      if (job.status === 'succeeded' || job.status === 'failed') {
        return job;
      }
      this.status.set(job.status === 'queued' ? 'Quick sync queued...' : 'Quick sync running...');
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    }
    throw new Error(`Quick sync job timed out: ${jobId}`);
  }

  private async waitForBackupJob(jobId: string): Promise<BackupJobResponse> {
    const maxPolls = 300;
    for (let i = 0; i < maxPolls; i += 1) {
      const response = await fetch(`/api/v1/amp/backup/${jobId}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as BackupJobResponse | { detail: unknown };
      if (!response.ok) {
        throw new Error(`Load amp state job poll failed: ${JSON.stringify(payload)}`);
      }
      const job = payload as BackupJobResponse;
      if (job.status === 'succeeded' || job.status === 'failed') {
        return job;
      }
      this.status.set(job.status === 'queued' ? 'Load amp state queued...' : 'Load amp state running...');
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    }
    throw new Error(`Load amp state job timed out: ${jobId}`);
  }

  async refreshQueueState(): Promise<void> {
    try {
      const response = await fetch('/api/v1/amp/queue', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as QueueStateResponse | { detail: unknown };
      if (!response.ok) {
        return;
      }
      const queue = payload as QueueStateResponse;
      this.queueJobs.set(queue.jobs);
      this.queueGeneratedAt.set(queue.generated_at);
    } catch {
      // no-op: queue panel keeps last visible state
    }
  }

  slotsForBank(bank: 'A' | 'B'): SlotCard[] {
    return this.slots().filter((slot) => slot.slot_label.startsWith(`${bank}:`));
  }

  shortHash(hash: string): string {
    return hash.slice(0, 12);
  }

  displayHash(slot: SlotCard): string {
    return slot.config_hash_sha256 ? this.shortHash(slot.config_hash_sha256) : 'n/a';
  }

  displayPatchName(slot: SlotCard): string {
    if (slot.patch_name) {
      return slot.patch_name;
    }
    return 'Unsynced';
  }

  private mergeDumpState(state: FullAmpDumpResponse): SlotCard[] {
    const currentBySlot = new Map<number, SlotCard>(this.slots().map((slot) => [slot.slot, slot]));
    const bySlot = new Map<number, FullDumpSlotResponse>(state.slots.map((slot) => [slot.slot, slot]));
    return defaultSlotCards().map((base) => {
      const full = bySlot.get(base.slot);
      if (!full) {
        return base;
      }
      const current = currentBySlot.get(base.slot);
      const patchName = this.readString(full.patch, 'patch_name');
      const hash = this.readString(full.patch, 'config_hash_sha256');
      return {
        slot: full.slot,
        slot_label: full.slot_label,
        patch_name: patchName ?? '',
        config_hash_sha256: hash ?? '',
        patch: full.patch,
        in_sync: full.in_sync,
        is_saved: full.is_saved,
        synced_at: full.synced_at,
        slot_sync_ms: full.slot_sync_ms,
        inferred: false,
        match_count: 1,
        out_synced: true,
        measured_rms_dbfs: current?.measured_rms_dbfs ?? null,
        measured_peak_dbfs: current?.measured_peak_dbfs ?? null,
        measured_at: current?.measured_at ?? '',
      };
    });
  }

  private mergeSnapshotState(state: FullAmpDumpResponse): SlotCard[] {
    const currentBySlot = new Map<number, SlotCard>(this.slots().map((slot) => [slot.slot, slot]));
    const bySlot = new Map<number, FullDumpSlotResponse>(state.slots.map((slot) => [slot.slot, slot]));
    return defaultSlotCards().map((base) => {
      const full = bySlot.get(base.slot);
      if (!full) {
        return base;
      }
      const current = currentBySlot.get(base.slot);
      const patchName = this.readString(full.patch, 'patch_name');
      const hash = this.readString(full.patch, 'config_hash_sha256');
      return {
        slot: full.slot,
        slot_label: full.slot_label,
        patch_name: patchName ?? '',
        config_hash_sha256: hash ?? '',
        patch: full.patch,
        in_sync: false,
        is_saved: true,
        synced_at: full.synced_at,
        slot_sync_ms: full.slot_sync_ms,
        inferred: false,
        match_count: 1,
        out_synced: false,
        measured_rms_dbfs: current?.measured_rms_dbfs ?? null,
        measured_peak_dbfs: current?.measured_peak_dbfs ?? null,
        measured_at: current?.measured_at ?? '',
      };
    });
  }

  private mergeQuickState(state: QuickSlotsStateResponse): SlotCard[] {
    const bySlot = new Map<number, QuickSlotSummary>(state.slots.map((slot) => [slot.slot, slot]));
    const currentBySlot = new Map<number, SlotCard>(this.slots().map((slot) => [slot.slot, slot]));
    return defaultSlotCards().map((base) => {
      const quick = bySlot.get(base.slot);
      const current = currentBySlot.get(base.slot);
      if (!quick) {
        return current ?? base;
      }
      return {
        slot: quick.slot,
        slot_label: quick.slot_label,
        patch_name: quick.patch_name,
        config_hash_sha256: quick.inferred_hash_sha256 ?? '',
        patch: current?.patch ?? null,
        in_sync: quick.in_sync,
        is_saved: quick.is_saved,
        synced_at: quick.synced_at,
        slot_sync_ms: quick.slot_sync_ms,
        inferred: quick.inferred_hash_sha256 !== null,
        match_count: quick.match_count,
        out_synced: current?.out_synced ?? false,
        measured_rms_dbfs: current?.measured_rms_dbfs ?? null,
        measured_peak_dbfs: current?.measured_peak_dbfs ?? null,
        measured_at: current?.measured_at ?? '',
      };
    });
  }

  private applySyncedSlot(slot: SlotPatchSummary): void {
    this.slots.update((current) =>
      current.map((card) => {
        if (card.slot !== slot.slot) {
          return card;
        }
        return {
          slot: slot.slot,
          slot_label: slot.slot_label,
          patch_name: slot.patch_name,
          config_hash_sha256: slot.config_hash_sha256,
          patch: slot.patch ?? null,
          in_sync: slot.in_sync,
          is_saved: slot.is_saved,
          synced_at: slot.synced_at,
          slot_sync_ms: slot.slot_sync_ms,
          inferred: false,
          match_count: 1,
          out_synced: true,
          measured_rms_dbfs: card.measured_rms_dbfs,
          measured_peak_dbfs: card.measured_peak_dbfs,
          measured_at: card.measured_at,
        };
      }),
    );
  }

  private async syncSlotForMeasurement(slot: number): Promise<SlotSyncResponse> {
    const response = await fetch(`/api/v1/amp/slots/${slot}/sync`, {
      method: 'POST',
      cache: 'no-store',
    });
    const payload = (await response.json()) as SlotSyncResponse | { detail?: unknown };
    if (!response.ok) {
      throw new Error(`slot ${slot} sync failed: ${JSON.stringify(payload)}`);
    }
    return payload as SlotSyncResponse;
  }

  private async captureSlotRmsSample(slot: SlotPatchSummary): Promise<AudioSampleResponse> {
    const response = await fetch('/api/v1/audio/measure', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patch_hash: slot.is_saved ? (slot.config_hash_sha256 || null) : null,
        slot: slot.slot,
        duration_sec: 5.0,
      }),
    });
    const payload = (await response.json()) as AudioSampleResponse | { detail?: unknown };
    if (!response.ok) {
      throw new Error(`slot ${slot.slot} sample failed: ${JSON.stringify(payload)}`);
    }
    return payload as AudioSampleResponse;
  }

  private setSlotMeasuredRms(slotNumber: number, rmsDbfs: number, peakDbfs: number, measuredAt: string): void {
    this.slots.update((current) =>
      current.map((card) => {
        if (card.slot !== slotNumber) {
          return card;
        }
        return {
          ...card,
          measured_rms_dbfs: rmsDbfs,
          measured_peak_dbfs: peakDbfs,
          measured_at: measuredAt,
        };
      }),
    );
  }

  private markSlotSaved(slotNumber: number, hashId?: string): void {
    this.slots.update((current) =>
      current.map((card) => {
        if (card.slot !== slotNumber) {
          return card;
        }
        return {
          ...card,
          is_saved: true,
          config_hash_sha256: hashId ?? card.config_hash_sha256,
        };
      }),
    );
  }

  formatMs(value: number): string {
    return `${Math.max(0, Math.round(value))} ms`;
  }

  formatDb(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
      return 'n/a';
    }
    return `${value.toFixed(2)} dBFS`;
  }

  slotSyncStatusLabel(slot: SlotCard): string {
    return slot.in_sync ? 'In Sync' : 'Not Synced';
  }

  slotSavedStatusLabel(slot: SlotCard): string {
    return slot.is_saved ? 'Saved' : 'Not Saved';
  }

  ampSummary(slot: SlotCard): string {
    const amp = this.readObject(this.readObject(slot.patch, 'amp'));
    if (!amp) {
      return 'n/a';
    }
    const gain = this.readNumber(amp, 'gain');
    const volume = this.readNumber(amp, 'volume');
    const bass = this.readNumber(amp, 'bass');
    const middle = this.readNumber(amp, 'middle');
    const treble = this.readNumber(amp, 'treble');
    const presence = this.readNumber(amp, 'presence');
    return `G ${this.nv(gain)} | V ${this.nv(volume)} | B/M/T/P ${this.nv(bass)}/${this.nv(middle)}/${this.nv(treble)}/${this.nv(presence)}`;
  }

  ampTypeSummary(slot: SlotCard): string {
    const amp = this.readObject(this.readObject(slot.patch, 'amp'));
    if (!amp) {
      return 'n/a';
    }
    const ampType = this.readNumber(amp, 'amp_type');
    if (ampType === null) {
      return 'n/a';
    }
    const ampTypeIndex = Math.trunc(ampType);
    const ampTypeName =
      ampTypeIndex >= 0 && ampTypeIndex < AMP_TYPE_NAMES.length ? AMP_TYPE_NAMES[ampTypeIndex] : `Unknown (${ampTypeIndex})`;
    const preampVariation = this.readNumber(amp, 'preamp_variation');
    const variationLabel = preampVariation === null ? 'n/a' : (Math.trunc(preampVariation) === 1 ? 'On' : 'Off');
    return `${ampTypeName} | Variation ${variationLabel}`;
  }

  boosterSummary(slot: SlotCard): string {
    const stages = this.readObject(slot.patch, 'stages');
    const booster = this.readObject(stages, 'booster');
    if (!booster) {
      return 'n/a';
    }
    const type = this.readNumber(booster, 'type');
    const drive = this.readNumber(booster, 'drive');
    const volume = this.readNumber(booster, 'effect_level');
    const parts: string[] = [];
    if (type !== null) {
      parts.push(this.effectTypeLabel('booster', type));
    }
    parts.push(`G ${this.nv(drive)}`);
    parts.push(`V ${this.nv(volume)}`);
    return parts.join(' | ');
  }

  modSummary(slot: SlotCard): string {
    return this.stageSummary(slot, 'mod');
  }

  fxSummary(slot: SlotCard): string {
    return this.stageSummary(slot, 'fx');
  }

  delaySummary(slot: SlotCard): string {
    return this.stageSummary(slot, 'delay');
  }

  reverbSummary(slot: SlotCard): string {
    return this.stageSummary(slot, 'reverb');
  }

  isStageOn(slot: SlotCard, stageName: string): boolean {
    const stages = this.readObject(slot.patch, 'stages');
    const stage = this.readObject(stages, stageName);
    return this.readBoolean(stage, 'on');
  }

  showRaw(slot: SlotCard): void {
    if (!slot.patch) {
      this.status.set(`No raw patch payload loaded for ${slot.slot_label}. Run full sync or slot sync first.`);
      return;
    }
    this.rawModalTitle.set(`${slot.slot_label} · ${slot.patch_name || 'Unnamed Patch'}`);
    this.rawModalJson.set(JSON.stringify(slot.patch, null, 2));
    this.rawModalOpen.set(true);
  }

  closeRawModal(): void {
    this.rawModalOpen.set(false);
  }

  onRawModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeRawModal();
    }
  }

  private stageSummary(slot: SlotCard, stageName: string): string {
    const stages = this.readObject(slot.patch, 'stages');
    const stage = this.readObject(stages, stageName);
    if (!stage) {
      return 'n/a';
    }
    const type = this.readNumber(stage, 'type');
    const level = this.readNumber(stage, 'effect_level');
    const parts: string[] = [];
    if (type !== null) {
      parts.push(this.effectTypeLabel(stageName, type));
    }
    if (level !== null) {
      parts.push(`Lvl ${level}`);
    }
    return parts.join(' | ');
  }

  private effectTypeLabel(stageName: string, type: number): string {
    const index = Math.max(0, Math.trunc(type));
    let table: string[] = [];
    if (stageName === 'booster') {
      table = BOOSTER_TYPE_NAMES;
    } else if (stageName === 'mod' || stageName === 'fx') {
      table = FX_TYPE_NAMES;
    } else if (stageName === 'delay') {
      table = DELAY_TYPE_NAMES;
    } else if (stageName === 'reverb') {
      table = REVERB_TYPE_NAMES;
    }
    if (index >= 0 && index < table.length) {
      return table[index];
    }
    return `Unknown (${index})`;
  }

  private readObject(value: unknown, key?: string): Record<string, unknown> | null {
    let candidate: unknown = value;
    if (key !== undefined) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
      }
      candidate = (value as Record<string, unknown>)[key];
    }
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return null;
    }
    return candidate as Record<string, unknown>;
  }

  private ensureObject(parent: Record<string, unknown>, key: string): Record<string, unknown> {
    const existing = parent[key];
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      return existing as Record<string, unknown>;
    }
    const created: Record<string, unknown> = {};
    parent[key] = created;
    return created;
  }

  private ensureNumericRaw(stage: Record<string, unknown>): number[] {
    const rawUnknown = stage['raw'];
    if (!Array.isArray(rawUnknown)) {
      return [];
    }
    return rawUnknown.map((item) => this.parseUnknownNumber(item));
  }

  private parseUnknownNumber(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.trunc(value);
    }
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return 0;
  }

  private effectLevelRawIndex(stageName: StageName): number | null {
    if (stageName === 'booster') {
      return 6;
    }
    if (stageName === 'delay') {
      return 7;
    }
    if (stageName === 'reverb') {
      return 10;
    }
    return null;
  }

  private syncStageDerivedFields(stageName: StageName, stage: Record<string, unknown>): void {
    const raw = this.ensureNumericRaw(stage);
    if (raw.length === 0) {
      return;
    }
    if (stageName === 'booster') {
      if (raw.length > 0) {
        stage['type'] = raw[0];
      }
      if (raw.length > 1) {
        stage['drive'] = raw[1];
      }
      if (raw.length > 6) {
        stage['effect_level'] = raw[6];
      }
      return;
    }
    if (stageName === 'delay') {
      if (raw.length > 0) {
        stage['type'] = raw[0];
      }
      if (raw.length > 7) {
        stage['effect_level'] = raw[7];
      }
      return;
    }
    if (stageName === 'reverb') {
      if (raw.length > 0) {
        stage['type'] = raw[0];
      }
      if (raw.length > 10) {
        stage['effect_level'] = raw[10];
      }
      return;
    }
    if (raw.length > 0) {
      stage['type'] = raw[0];
    }
  }

  private stageParamLabels(stageName: StageName, rawLength: number): string[] {
    const labels: string[] = Array.from({ length: rawLength }, (_, index) => `P${index}`);
    labels[0] = 'Type';
    if (stageName === 'booster') {
      if (rawLength > 1) labels[1] = 'Drive';
      if (rawLength > 2) labels[2] = 'Bottom';
      if (rawLength > 3) labels[3] = 'Tone';
      if (rawLength > 4) labels[4] = 'Solo SW';
      if (rawLength > 5) labels[5] = 'Solo Level';
      if (rawLength > 6) labels[6] = 'Effect Level';
      if (rawLength > 7) labels[7] = 'Direct Mix';
      return labels;
    }
    if (stageName === 'delay') {
      if (rawLength > 1) labels[1] = 'Time LSB';
      if (rawLength > 2) labels[2] = 'Time';
      if (rawLength > 3) labels[3] = 'Time';
      if (rawLength > 4) labels[4] = 'Time MSB';
      if (rawLength > 5) labels[5] = 'Feedback';
      if (rawLength > 6) labels[6] = 'High Cut';
      if (rawLength > 7) labels[7] = 'Effect Level';
      if (rawLength > 8) labels[8] = 'Direct Level';
      return labels;
    }
    if (stageName === 'reverb') {
      if (rawLength > 1) labels[1] = 'Layer Mode';
      if (rawLength > 2) labels[2] = 'Time';
      if (rawLength > 10) labels[10] = 'Effect Level';
      if (rawLength > 11) labels[11] = 'Direct Level';
      return labels;
    }
    return labels;
  }

  private readNumber(source: Record<string, unknown> | null, key: string): number | null {
    if (!source) {
      return null;
    }
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    return null;
  }

  private readBoolean(source: Record<string, unknown> | null, key: string): boolean {
    if (!source) {
      return false;
    }
    return source[key] === true;
  }

  private readString(source: Record<string, unknown> | null, key: string): string | null {
    if (!source) {
      return null;
    }
    const value = source[key];
    if (typeof value === 'string') {
      return value;
    }
    return null;
  }

  private hasFullPatch(slot: SlotCard): boolean {
    return slot.patch !== null;
  }

  private parseInteger(value: string): number {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return parsed;
  }

  private clonePatch(patch: Record<string, unknown>): Record<string, unknown> {
    return JSON.parse(JSON.stringify(patch)) as Record<string, unknown>;
  }

  private updateEditorPatch(mutator: (draft: Record<string, unknown>) => void): void {
    this.editorPatchDraft.update((current) => {
      if (current === null) {
        return null;
      }
      const next = this.clonePatch(current);
      mutator(next);
      next['config_hash_sha256'] = '';
      return next;
    });
    this.editorLiveApplyError.set('');
    const slotNumber = this.editorSlotNumber();
    if (slotNumber !== null) {
      this.slots.update((current) =>
        current.map((card) => (card.slot === slotNumber ? { ...card, out_synced: false, in_sync: false } : card)),
      );
    }
    this.scheduleEditorLiveApply();
  }

  private scheduleEditorLiveApply(): void {
    if (!this.editorModalOpen() || !this.editorLiveApplyEnabled()) {
      return;
    }
    const draftFingerprint = this.editorDraftFingerprint();
    if (draftFingerprint === '' || this.editorSlotNumber() === null) {
      return;
    }
    this.editorLiveApplyQueuedFingerprint = draftFingerprint;
    if (this.editorLiveApplyInFlight) {
      return;
    }
    if (this.editorLiveApplyHandle !== null) {
      clearTimeout(this.editorLiveApplyHandle);
    }
    const sinceLastStartMs = Date.now() - this.editorLiveApplyLastStartedAtMs;
    const gapWaitMs = Math.max(0, EDITOR_LIVE_APPLY_MIN_GAP_MS - sinceLastStartMs);
    const waitMs = Math.max(EDITOR_LIVE_APPLY_DEBOUNCE_MS, gapWaitMs);
    this.editorLiveApplyHandle = setTimeout(() => {
      this.editorLiveApplyHandle = null;
      void this.flushEditorLiveApplyQueue();
    }, waitMs);
  }

  private async flushEditorLiveApplyQueue(): Promise<void> {
    if (!this.editorModalOpen() || !this.editorLiveApplyEnabled()) {
      return;
    }
    if (this.editorLiveApplyInFlight) {
      return;
    }
    const queuedFingerprint = this.editorLiveApplyQueuedFingerprint;
    if (!queuedFingerprint || queuedFingerprint === this.editorLiveApplyLastAppliedFingerprint) {
      return;
    }
    await this.applyEditorPatchLive(queuedFingerprint);
  }

  private async applyEditorPatchLive(expectedFingerprint: string): Promise<void> {
    const draft = this.editorPatchDraft();
    const slotNumber = this.editorSlotNumber();
    if (!this.editorLiveApplyEnabled() || draft === null || slotNumber === null || this.editorLiveApplyInFlight) {
      return;
    }
    const currentFingerprint = this.patchFingerprint(draft);
    if (currentFingerprint !== expectedFingerprint) {
      this.scheduleEditorLiveApply();
      return;
    }
    if (currentFingerprint === this.editorLiveApplyLastAppliedFingerprint) {
      return;
    }
    this.editorLiveApplyInFlight = true;
    this.editorLiveApplyLastStartedAtMs = Date.now();
    this.editorLiveApplyPending.set(true);
    try {
      const response = await fetch('/api/v1/amp/current-patch/live-apply', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: draft }),
      });
      const payload = (await response.json()) as ApplyCurrentPatchResponse | { detail?: unknown };
      if (!response.ok) {
        this.editorLiveApplyError.set(typeof payload === 'object' ? JSON.stringify(payload) : 'live apply failed');
        return;
      }
      const applied = payload as ApplyCurrentPatchResponse;
      const appliedPatch = this.clonePatch(applied.patch);
      this.editorPatchDraft.set(appliedPatch);
      this.editorLiveApplyQueuedFingerprint = null;
      const appliedFingerprint = this.patchFingerprint(appliedPatch);
      this.editorLiveApplyLastAppliedFingerprint = appliedFingerprint;
      this.editorBaseFingerprint.set(appliedFingerprint);
      const patchName = this.readString(appliedPatch, 'patch_name') ?? '';
      const hash = this.readString(appliedPatch, 'config_hash_sha256') ?? '';
      this.editorBaseConfigHash.set(hash);
      this.slots.update((current) =>
        current.map((card) => {
          if (card.slot !== slotNumber) {
            return card;
          }
          return {
            ...card,
            patch_name: patchName || card.patch_name,
            patch: this.clonePatch(appliedPatch),
            config_hash_sha256: hash,
            in_sync: true,
            out_synced: true,
            is_saved: false,
          };
        }),
      );
    } catch (error: unknown) {
      this.editorLiveApplyError.set(String(error));
    } finally {
      this.editorLiveApplyInFlight = false;
      this.editorLiveApplyPending.set(false);
      if (this.editorLiveApplyQueuedFingerprint && this.editorLiveApplyQueuedFingerprint !== this.editorLiveApplyLastAppliedFingerprint) {
        this.scheduleEditorLiveApply();
      }
    }
  }

  private editorDraftFingerprint(): string {
    const draft = this.editorPatchDraft();
    if (!draft) {
      return '';
    }
    return this.patchFingerprint(draft);
  }

  private patchFingerprint(patch: Record<string, unknown>): string {
    const normalized = this.clonePatch(patch);
    delete normalized['config_hash_sha256'];
    return this.stableStringify(normalized);
  }

  private stableStringify(value: unknown): string {
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
    }
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const keys = Object.keys(record).sort();
      const parts = keys.map((key) => `${JSON.stringify(key)}:${this.stableStringify(record[key])}`);
      return `{${parts.join(',')}}`;
    }
    return JSON.stringify(value);
  }

  private nv(value: number | null): string {
    return value === null ? 'n/a' : `${value}`;
  }

  operationLabel(value: string): string {
    if (value === 'test_connection') {
      return 'Test Connection';
    }
    if (value === 'current_patch') {
      return 'Current Patch';
    }
    if (value === 'apply_current_patch') {
      return 'Live Apply Patch';
    }
    if (value === 'sync_slot') {
      return 'Sync Slot';
    }
    if (value === 'full_dump') {
      return 'Load Amp State';
    }
    if (value === 'quick_sync_names') {
      return 'Quick Sync Names';
    }
    if (value === 'full_sync_slots') {
      return 'Full Sync Slots';
    }
    return value;
  }
}
