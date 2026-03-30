import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  BOOSTER_PARAM_SCHEMA,
  DELAY_PARAM_SCHEMA,
  type ParamControlKind,
  FX_PARAM_SCHEMAS_BY_TYPE,
  type ParamEncoding,
  REVERB_PARAM_SCHEMA,
  type StageParamSchema,
} from './pedal-schemas';

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
const AMP_TYPE_NAMES = ['Acoustic', 'Clean', 'Pushed', 'Crunch', 'Lead', 'Brown'];
const REVERB_TYPE_NAMES = ['Plate Reverb', 'Room Reverb', 'Hall Reverb', 'Spring Reverb', 'Modulate Reverb'];
const EQ_TYPE_NAMES = ['Parametric EQ', 'GE-10'];
const EQ_POSITION_NAMES = ['Input', 'Post Amp'];
const EQ_GE10_BAND_LABELS = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k', 'Level'];
const EQ_PEQ_LOW_CUT_LABELS = ['Flat', '20 Hz', '25 Hz', '31.5 Hz', '40 Hz', '50 Hz', '63 Hz', '80 Hz', '100 Hz', '125 Hz', '160 Hz', '200 Hz', '250 Hz', '315 Hz', '400 Hz', '500 Hz', '630 Hz', '800 Hz'];
const EQ_PEQ_MID_FREQ_LABELS = ['20 Hz', '25 Hz', '31.5 Hz', '40 Hz', '50 Hz', '63 Hz', '80 Hz', '100 Hz', '125 Hz', '160 Hz', '200 Hz', '250 Hz', '315 Hz', '400 Hz', '500 Hz', '630 Hz', '800 Hz', '1.00 kHz', '1.25 kHz', '1.60 kHz', '2.00 kHz', '2.50 kHz', '3.15 kHz', '4.00 kHz', '5.00 kHz', '6.30 kHz', '8.00 kHz', '10.0 kHz'];
const EQ_PEQ_Q_LABELS = ['0.5', '1', '2', '4', '8', '16'];
const EQ_PEQ_HIGH_CUT_LABELS = ['630 Hz', '800 Hz', '1.00 kHz', '1.25 kHz', '1.60 kHz', '2.00 kHz', '2.50 kHz', '3.15 kHz', '4.00 kHz', '5.00 kHz', '6.30 kHz', '8.00 kHz', '10.0 kHz', '12.5 kHz', 'Flat'];

interface ValueOption {
  value: number;
  label: string;
}

const buildValueOptions = (labels: readonly string[]): ValueOption[] => labels.map((label, value) => ({ value, label }));

const EQ_PEQ_PARAM_SCHEMA: ReadonlyArray<{ key: string; label: string; index: number; min: number; max: number; offset?: number; options?: ValueOption[] }> = [
  { key: 'low_cut', label: 'Low Cut', index: 0, min: 0, max: 17, options: buildValueOptions(EQ_PEQ_LOW_CUT_LABELS) },
  { key: 'low_gain', label: 'Low Gain', index: 1, min: -20, max: 20, offset: 20 },
  { key: 'lowmid_freq', label: 'Low Mid Freq', index: 2, min: 0, max: 27, options: buildValueOptions(EQ_PEQ_MID_FREQ_LABELS) },
  { key: 'lowmid_q', label: 'Low Mid Q', index: 3, min: 0, max: 5, options: buildValueOptions(EQ_PEQ_Q_LABELS) },
  { key: 'lowmid_gain', label: 'Low Mid Gain', index: 4, min: -20, max: 20, offset: 20 },
  { key: 'highmid_freq', label: 'High Mid Freq', index: 5, min: 0, max: 27, options: buildValueOptions(EQ_PEQ_MID_FREQ_LABELS) },
  { key: 'highmid_q', label: 'High Mid Q', index: 6, min: 0, max: 5, options: buildValueOptions(EQ_PEQ_Q_LABELS) },
  { key: 'highmid_gain', label: 'High Mid Gain', index: 7, min: -20, max: 20, offset: 20 },
  { key: 'high_gain', label: 'High Gain', index: 8, min: -20, max: 20, offset: 20 },
  { key: 'high_cut', label: 'High Cut', index: 9, min: 0, max: 14, options: buildValueOptions(EQ_PEQ_HIGH_CUT_LABELS) },
  { key: 'level', label: 'Level', index: 10, min: -20, max: 20, offset: 20 },
];
const LIVE_RMS_WINDOW_POINTS = 96;
const DEFAULT_TARGET_RMS_DBFS = -31.0;
const AUTO_LEVEL_TOLERANCE_DB = 0.4;
const AUTO_LEVEL_MEASURE_SEC = 2.0;
const TONE_BLOCK_OPTIONS = ['routing', 'amp', 'booster', 'mod', 'fx', 'delay', 'reverb', 'eq1', 'eq2', 'ns', 'send_return', 'solo', 'pedalfx'] as const;

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
  measured_rms_dbfs: number | null;
  measured_peak_dbfs: number | null;
  measured_at: string | null;
  synced_at: string;
  slot_sync_ms: number;
}

interface SlotSyncResponse {
  synced_at: string;
  slot: SlotPatchSummary;
}

interface SlotActivateResponse {
  slot: number;
  slot_label: string;
  activated_at: string;
  activate_ms: number;
}

interface SlotWriteResponse {
  synced_at: string;
  slot: SlotPatchSummary;
}

interface CurrentPatchResponse {
  created_at: string;
  patch: Record<string, unknown>;
}

interface ActiveSlotResponse {
  patch_number: number;
  slot: number | null;
  slot_label: string;
  patch_name: string;
  read_at: string;
}

interface ApplyCurrentPatchResponse {
  applied_at: string;
  patch: Record<string, unknown>;
}

interface LivePatchResponse {
  patch_json: Record<string, unknown>;
  active_slot: number | null;
  amp_confirmed_at: string;
  source_type: string;
  exact_patch_object: { id: number; name: string } | null;
  partial_patch_objects: { id: number; name: string }[];
  exact_amp_slot: { slot: number; patch_name: string } | null;
  partial_amp_slots: { slot: number; patch_name: string }[];
  compat_hash_sha256: string;
}

interface TonePatchObjectResponse {
  id: number;
  name: string;
  description: string;
  patch_json: Record<string, unknown>;
  source_type: string;
  source_prompt: string | null;
  parent_patch_object_id: number | null;
  blocks: string[];
  groups: Array<{ id: number; name: string }>;
  created_at: string;
  updated_at: string;
}

interface ToneGroupResponse {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface TonePatchObjectSetSlotResponse {
  slot: number;
  patch_object_id: number;
  patch_object_name: string;
  blocks: string[];
}

interface TonePatchObjectSetResponse {
  id: number;
  name: string;
  description: string;
  source_prompt: string | null;
  slots: TonePatchObjectSetSlotResponse[];
  created_at: string;
  updated_at: string;
}

interface ToneAiGenerateSetResponse {
  summary: string;
  set: TonePatchObjectSetResponse;
}

interface PatchConfigResponse {
  hash_id: string;
  snapshot: Record<string, unknown>;
  measured_rms_dbfs: number | null;
  measured_peak_dbfs: number | null;
  measured_at: string | null;
  created_at: string;
}

interface AudioSampleResponse {
  id: number;
  patch_hash: string | null;
  patch_name: string | null;
  patch_object_id: number | null;
  patch_object_name: string | null;
  slot: number | null;
  slot_label: string | null;
  source: string;
  duration_sec: number;
  rate: number;
  channels: number;
  rms_dbfs: number;
  peak_dbfs: number;
  sample_count: number;
  has_audio: boolean;
  playback_url: string | null;
  is_level_marker: boolean;
  created_at: string;
}

interface AiPatchAdviceChange {
  field: string;
  current_value: string | number;
  suggested_value: string | number;
  rationale: string;
}

interface AiPatchAdviceResponse {
  summary: string;
  suggested_changes: AiPatchAdviceChange[];
  proposed_patch: Record<string, unknown>;
  model: string;
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
  saved_hash_sha256: string;
  committed_hash_sha256: string;
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
type ColorStageName = 'booster' | 'mod' | 'fx' | 'delay' | 'reverb';
type EqStageName = 'eq1' | 'eq2';

interface RawValueField {
  id: string;
  label: string;
  value: number;
}

interface EqGe10BandField {
  id: string;
  label: string;
  offsetValue: number;
  percent: number;
}

interface EqParamField {
  id: string;
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  valueLabel: string | null;
  options: ValueOption[] | null;
}

interface EqPeqGraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  gain: number;
}

interface EqPeqFftBar {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TypeOption {
  value: number;
  label: string;
}

interface StageParam {
  id: string;
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  control: ParamControlKind;
  offLabel: string;
  onLabel: string;
}

type TriState = 'true' | 'false' | 'unknown';

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
      saved_hash_sha256: '',
      committed_hash_sha256: '',
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
  currentPage = signal<'dashboard' | 'samples'>(this.resolvePageFromPath());
  status = signal('Idle');
  responseJson = signal('');
  slots = signal<SlotCard[]>(defaultSlotCards());
  ampStateHash = signal('');
  lastSyncedAt = signal('');
  totalSyncMs = signal(0);
  selectedAmpSlot = signal<number | null>(null);
  selectedAmpSlotText = signal('n/a');
  currentAmpPatchHash = signal('');
  currentAmpCommitState = signal<'unknown' | 'committed' | 'uncommitted'>('unknown');
  livePatchConfirmedAt = signal('');
  livePatchSourceType = signal('');
  livePatchExactDbName = signal('');
  livePatchExactSlotText = signal('');
  livePatchPartialDbCount = signal(0);
  livePatchPartialSlotCount = signal(0);
  livePatchExactDbMatch = signal<{ id: number; name: string } | null>(null);
  livePatchPartialDbMatches = signal<Array<{ id: number; name: string }>>([]);
  livePatchExactSlotMatch = signal<{ slot: number; patch_name: string } | null>(null);
  livePatchPartialSlotMatches = signal<Array<{ slot: number; patch_name: string }>>([]);
  queueJobs = signal<QueueJobSummary[]>([]);
  queueGeneratedAt = signal('');
  levelMarkerRmsDbfs = signal<number | null>(null);
  levelMarkerPeakDbfs = signal<number | null>(null);
  levelMarkerCapturedAt = signal('');
  liveRmsDbfs = signal<number | null>(null);
  livePeakDbfs = signal<number | null>(null);
  liveFftBinsDb = signal<number[]>([]);
  liveMeterAt = signal('');
  liveMeterConnected = signal(false);
  liveRmsHistory = signal<number[]>([]);
  recentSamples = signal<AudioSampleResponse[]>([]);
  isMeasuringActivePatch = signal(false);
  measureCountdownSec = signal(0);
  busyActions = signal<Record<string, boolean>>({});
  queuePollHandle: ReturnType<typeof setInterval> | null = null;
  activeSlotPollHandle: ReturnType<typeof setInterval> | null = null;
  liveMeterSource: EventSource | null = null;
  patchSamplesModalOpen = signal(false);
  patchSamplesModalTitle = signal('');
  patchSamplesRows = signal<AudioSampleResponse[]>([]);
  aiModalOpen = signal(false);
  aiModalMode = signal<'general' | 'level'>('general');
  aiModalSlotNumber = signal<number | null>(null);
  aiModalSlotLabel = signal('');
  aiModalPatchName = signal('');
  aiModalPatch = signal<Record<string, unknown> | null>(null);
  aiModalCurrentMeasuredRms = signal<number | null>(null);
  aiModalTargetRms = signal('');
  aiModalPrompt = signal('Suggest the most useful concrete improvements for this patch. Focus on tone, EQ, gain structure, and clarity.');
  aiModalLoading = signal(false);
  aiModalError = signal('');
  aiModalAdvice = signal<AiPatchAdviceResponse | null>(null);
  autoLevelModalOpen = signal(false);
  autoLevelSlotNumber = signal<number | null>(null);
  autoLevelSlotLabel = signal('');
  autoLevelPatchName = signal('');
  autoLevelTargetRms = signal('');
  autoLevelCurrentRms = signal<number | null>(null);
  autoLevelIteration = signal(0);
  autoLevelState = signal<'idle' | 'waiting' | 'measuring' | 'asking' | 'applying' | 'succeeded' | 'failed'>('idle');
  autoLevelRunning = signal(false);
  autoLevelLogs = signal<string[]>([]);
  editorModalOpen = signal(false);
  editorSlotNumber = signal<number | null>(null);
  editorSlotLabel = signal('');
  editorPatchDraft = signal<Record<string, unknown> | null>(null);
  editorTargetIsActive = signal(false);
  editorBaseFingerprint = signal('');
  editorBaseConfigHash = signal('');
  editorLiveApplyPending = signal(false);
  editorLiveApplyError = signal('');
  editorLiveApplyReadbackAt = signal('');
  editorLiveApplyInFlight = false;
  editorLiveApplyLastAppliedFingerprint = '';
  editorLiveApplyQueuedFingerprint: string | null = null;
  livePatchSnapshot = signal<Record<string, unknown> | null>(null);
  tonePatchObjects = signal<TonePatchObjectResponse[]>([]);
  toneGroups = signal<ToneGroupResponse[]>([]);
  toneSets = signal<TonePatchObjectSetResponse[]>([]);
  toneSaveModalOpen = signal(false);
  toneDesignerModalOpen = signal(false);
  toneGroupModalOpen = signal(false);
  toneSetModalOpen = signal(false);
  toneBaseModalOpen = signal(false);
  toneSaveName = signal('');
  toneSaveDescription = signal('');
  toneSaveGroupId = signal('');
  toneGroupName = signal('');
  toneGroupDescription = signal('');
  toneAiPrompt = signal('Refine the current editor patch or generate distinct sparse candidates around the target sound. Keep the results audibly useful for quick auditioning.');
  toneAiMode = signal<'refine' | 'ideas' | 'set'>('refine');
  toneAiSetName = signal('');
  toneAiDescription = signal('');
  toneAiCount = signal('8');
  toneAiNamePrefix = signal('');
  toneSelectedBlocks = signal<Record<string, boolean>>({ amp: true, booster: true, eq1: true });
  liveEditorShowAllBlocks = signal(false);
  toneBasePatchObjectId = signal('');
  toneBasePatchObjectName = signal('');
  toneBasePatchSnapshot = signal<Record<string, unknown> | null>(null);
  toneAssignGroupByPatchObject = signal<Record<number, string>>({});
  tonePatchQuery = signal('');
  tonePatchSourceFilter = signal('');
  tonePatchGroupFilter = signal('');
  toneHighlightedPatchObjectId = signal<number | null>(null);
  toneManualSetName = signal('');
  toneManualSetDescription = signal('');
  toneManualSetSlots = signal<Record<number, string>>({});
  toneSetSlotAssignments = signal<Record<string, string>>({});
  private activeSlotPollInFlight = false;
  private readonly onPopState = (): void => {
    this.currentPage.set(this.resolvePageFromPath());
  };

  ngOnInit(): void {
    window.addEventListener('popstate', this.onPopState);
    void this.refreshQueueState();
    void this.loadAudioLevelMarker();
    void this.loadRecentAudioSamples();
    void this.loadToneLabData();
    void this.refreshActiveSlot();
    void this.refreshLivePatchStatus();
    void this.bootstrapLivePatchEditor();
    this.startLiveMeter();
    this.queuePollHandle = setInterval(() => {
      void this.refreshQueueState();
    }, 1000);
    this.activeSlotPollHandle = setInterval(() => {
      void this.refreshActiveSlot();
    }, 1500);
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.onPopState);
    if (this.queuePollHandle !== null) {
      clearInterval(this.queuePollHandle);
      this.queuePollHandle = null;
    }
    if (this.activeSlotPollHandle !== null) {
      clearInterval(this.activeSlotPollHandle);
      this.activeSlotPollHandle = null;
    }
    this.stopLiveMeter();
  }

  isActionBusy(key: string): boolean {
    return Boolean(this.busyActions()[key]);
  }

  private setActionBusy(key: string, busy: boolean): void {
    this.busyActions.update((current) => {
      if (busy) {
        return { ...current, [key]: true };
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  slotActionKey(action: string, slot: number): string {
    return `${action}:${slot}`;
  }

  headerActionLabel(key: string, idle: string, busy: string): string {
    return this.isActionBusy(key) ? busy : idle;
  }

  slotActionLabel(action: string, slot: number, idle: string, busy: string): string {
    return this.isActionBusy(this.slotActionKey(action, slot)) ? busy : idle;
  }

  async testAmpConnection(): Promise<void> {
    this.setActionBusy('test-amp-connection', true);
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
      this.setActionBusy('test-amp-connection', false);
    }
  }

  async syncLivePatch(): Promise<void> {
    this.setActionBusy('sync-live-patch', true);
    this.status.set('Syncing Live Patch from amp...');
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/live-patch/sync', {
        method: 'POST',
        cache: 'no-store',
      });
      const payload = (await response.json()) as LivePatchResponse | { detail?: unknown };
      if (!response.ok || !('patch_json' in payload)) {
        this.status.set('Live Patch sync failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.applyLivePatchStatus(payload as LivePatchResponse);
      this.loadLivePatchIntoEditorState(payload as LivePatchResponse, false);
      this.status.set('Live Patch synced');
    } catch (error: unknown) {
      this.status.set('Live Patch sync failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('sync-live-patch', false);
    }
  }

  async openLiveEditor(): Promise<void> {
    this.status.set('Loading Live Patch editor...');
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/live-patch', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as LivePatchResponse | { detail?: unknown };
      if (!response.ok || !('patch_json' in payload)) {
        this.status.set('Live Patch is not available. Sync it first.');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const live = payload as LivePatchResponse;
      this.applyLivePatchStatus(live);
      this.loadLivePatchIntoEditorState(live, false);
      this.status.set('Live Patch editor loaded');
    } catch (error: unknown) {
      this.status.set('Failed opening Live Patch editor');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    }
  }

  async refreshLivePatchStatus(): Promise<void> {
    try {
      const response = await fetch('/api/v1/live-patch', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as LivePatchResponse | { detail?: unknown };
      if (!response.ok || !('patch_json' in payload)) {
        return;
      }
      this.applyLivePatchStatus(payload as LivePatchResponse);
    } catch {
      // Ignore background Live Patch summary failures.
    }
  }

  private async bootstrapLivePatchEditor(): Promise<void> {
    try {
      const response = await fetch('/api/v1/live-patch', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as LivePatchResponse | { detail?: unknown };
      if (!response.ok || !('patch_json' in payload)) {
        return;
      }
      const live = payload as LivePatchResponse;
      this.applyLivePatchStatus(live);
      this.loadLivePatchIntoEditorState(live, false);
    } catch {
      // Silent bootstrap path.
    }
  }

  private loadLivePatchIntoEditorState(live: LivePatchResponse, replaceBase: boolean): void {
    const draft = this.clonePatch(live.patch_json);
    const draftAmp = this.readObject(draft, 'amp');
    if (draftAmp) {
      this.syncAmpDerivedFields(draftAmp);
    }
    const draftStages = this.readObject(draft, 'stages');
    if (draftStages) {
      for (const stageName of ['booster', 'mod', 'fx', 'delay', 'reverb'] as const) {
        const stage = this.readObject(draftStages, stageName);
        if (stage) {
          this.syncStageDerivedFields(stageName, stage);
        }
      }
    }
    this.editorSlotNumber.set(live.active_slot);
    this.editorSlotLabel.set('Live Patch');
    this.editorTargetIsActive.set(true);
    this.editorPatchDraft.set(draft);
    this.editorBaseFingerprint.set(this.patchFingerprint(draft));
    this.editorBaseConfigHash.set('');
    this.editorLiveApplyLastAppliedFingerprint = this.patchFingerprint(draft);
    this.editorLiveApplyQueuedFingerprint = null;
    this.editorLiveApplyInFlight = false;
    this.editorLiveApplyPending.set(false);
    this.editorLiveApplyError.set('');
    this.editorLiveApplyReadbackAt.set('');
    this.editorModalOpen.set(true);
    if (replaceBase || this.toneBasePatchSnapshot() === null) {
      this.toneBasePatchSnapshot.set(this.clonePatch(draft));
      this.toneBasePatchObjectName.set(replaceBase ? (this.toneBasePatchObjectName().trim() || 'Current Editor Patch') : 'Current Editor Patch');
      this.toneBasePatchObjectId.set(replaceBase ? this.toneBasePatchObjectId() : '');
    }
    this.autoSelectToneBlocksFromBase(draft, true);
  }

  toneBlockOptions(): readonly string[] {
    return TONE_BLOCK_OPTIONS;
  }

  openToneSaveModal(): void {
    this.toneSaveModalOpen.set(true);
  }

  closeToneSaveModal(): void {
    this.toneSaveModalOpen.set(false);
  }

  openToneDesignerModal(): void {
    this.toneAiMode.set('refine');
    this.toneDesignerModalOpen.set(true);
  }

  closeToneDesignerModal(): void {
    this.toneDesignerModalOpen.set(false);
  }

  setToneAiMode(value: 'refine' | 'ideas' | 'set'): void {
    this.toneAiMode.set(value);
  }

  openToneGroupModal(): void {
    this.toneGroupModalOpen.set(true);
  }

  closeToneGroupModal(): void {
    this.toneGroupModalOpen.set(false);
  }

  openToneSetModal(): void {
    this.toneSetModalOpen.set(true);
  }

  closeToneSetModal(): void {
    this.toneSetModalOpen.set(false);
  }

  openToneBaseModal(): void {
    this.toneBaseModalOpen.set(true);
  }

  closeToneBaseModal(): void {
    this.toneBaseModalOpen.set(false);
  }

  isToneBlockSelected(block: string): boolean {
    return Boolean(this.toneSelectedBlocks()[block]);
  }

  setToneBlockSelected(block: string, checked: boolean): void {
    this.toneSelectedBlocks.update((current) => ({ ...current, [block]: checked }));
  }

  setLiveEditorShowAllBlocks(checked: boolean): void {
    this.liveEditorShowAllBlocks.set(checked);
  }

  selectedToneBlocks(): string[] {
    return this.toneBlockOptions().filter((block) => this.isToneBlockSelected(block));
  }

  liveEditorShowsBlock(block: string): boolean {
    return this.liveEditorShowAllBlocks() || this.isToneBlockSelected(block);
  }

  liveEditorShowsAnyBlocks(blocks: readonly string[]): boolean {
    return this.liveEditorShowAllBlocks() || blocks.some((block) => this.isToneBlockSelected(block));
  }

  setToneSaveName(value: string): void {
    this.toneSaveName.set(value);
  }

  setToneSaveDescription(value: string): void {
    this.toneSaveDescription.set(value);
  }

  setToneSaveGroupId(value: string): void {
    this.toneSaveGroupId.set(value);
  }

  setToneBasePatchObjectId(value: string): void {
    this.toneBasePatchObjectId.set(value);
  }

  setToneGroupName(value: string): void {
    this.toneGroupName.set(value);
  }

  setToneGroupDescription(value: string): void {
    this.toneGroupDescription.set(value);
  }

  setToneAiPrompt(value: string): void {
    this.toneAiPrompt.set(value);
  }

  setToneAiSetName(value: string): void {
    this.toneAiSetName.set(value);
  }

  setToneAiDescription(value: string): void {
    this.toneAiDescription.set(value);
  }

  setToneAiCount(value: string): void {
    this.toneAiCount.set(value);
  }

  setToneAiNamePrefix(value: string): void {
    this.toneAiNamePrefix.set(value);
  }

  setToneAssignGroupId(patchObjectId: number, value: string): void {
    this.toneAssignGroupByPatchObject.update((current) => ({ ...current, [patchObjectId]: value }));
  }

  setTonePatchQuery(value: string): void {
    this.tonePatchQuery.set(value);
  }

  setTonePatchSourceFilter(value: string): void {
    this.tonePatchSourceFilter.set(value);
  }

  setTonePatchGroupFilter(value: string): void {
    this.tonePatchGroupFilter.set(value);
  }

  clearTonePatchFilters(): void {
    this.tonePatchQuery.set('');
    this.tonePatchSourceFilter.set('');
    this.tonePatchGroupFilter.set('');
    this.toneHighlightedPatchObjectId.set(null);
  }

  setToneManualSetName(value: string): void {
    this.toneManualSetName.set(value);
  }

  setToneManualSetDescription(value: string): void {
    this.toneManualSetDescription.set(value);
  }

  setToneManualSetSlot(slot: number, value: string): void {
    this.toneManualSetSlots.update((current) => {
      const next = { ...current };
      if (value.trim()) {
        next[slot] = value;
      } else {
        delete next[slot];
      }
      return next;
    });
  }

  toneManualSetSlotValue(slot: number): string {
    return this.toneManualSetSlots()[slot] ?? '';
  }

  setToneSetSlotAssignment(setId: number, slot: number, value: string): void {
    const key = this.toneSetSlotAssignmentKey(setId, slot);
    this.toneSetSlotAssignments.update((current) => ({ ...current, [key]: value }));
  }

  toneSetSlotAssignmentValue(toneSet: TonePatchObjectSetResponse, slot: number, currentPatchObjectId: number): string {
    const key = this.toneSetSlotAssignmentKey(toneSet.id, slot);
    return this.toneSetSlotAssignments()[key] ?? String(currentPatchObjectId);
  }

  async loadToneLabData(): Promise<void> {
    await Promise.all([this.loadTonePatchObjects(), this.loadToneGroups(), this.loadToneSets()]);
  }

  async loadTonePatchObjects(): Promise<void> {
    try {
      const params = new URLSearchParams();
      const groupFilter = this.tonePatchGroupFilter().trim();
      if (this.tonePatchQuery().trim()) {
        params.set('q', this.tonePatchQuery().trim());
      }
      if (this.tonePatchSourceFilter().trim()) {
        params.set('source_type', this.tonePatchSourceFilter().trim());
      }
      if (groupFilter) {
        params.set('group_id', groupFilter);
      }
      const suffix = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/v1/patch-objects${suffix}`, { method: 'GET', cache: 'no-store' });
      const payload = (await response.json()) as TonePatchObjectResponse[] | { detail?: unknown };
      if (!response.ok || !Array.isArray(payload)) {
        if (response.status === 404 && groupFilter) {
          this.tonePatchGroupFilter.set('');
          await this.loadTonePatchObjects();
        }
        return;
      }
      this.tonePatchObjects.set(payload as TonePatchObjectResponse[]);
    } catch {
      // Informational panel only.
    }
  }

  async loadToneGroups(): Promise<void> {
    try {
      const response = await fetch('/api/v1/groups', { method: 'GET', cache: 'no-store' });
      const payload = (await response.json()) as ToneGroupResponse[] | { detail?: unknown };
      if (!response.ok || !Array.isArray(payload)) {
        return;
      }
      this.toneGroups.set(payload as ToneGroupResponse[]);
    } catch {
      // Informational panel only.
    }
  }

  async loadToneSets(): Promise<void> {
    try {
      const response = await fetch('/api/v1/sets', { method: 'GET', cache: 'no-store' });
      const payload = (await response.json()) as TonePatchObjectSetResponse[] | { detail?: unknown };
      if (!response.ok || !Array.isArray(payload)) {
        return;
      }
      this.toneSets.set(payload as TonePatchObjectSetResponse[]);
    } catch {
      // Informational panel only.
    }
  }

  setCurrentEditorPatchAsBase(): void {
    const current = this.editorPatchDraft() ?? this.livePatchSnapshot();
    if (!current) {
      this.status.set('Sync or load the Live Patch before setting a base patch.');
      return;
    }
    this.toneBasePatchSnapshot.set(this.clonePatch(current));
    this.toneBasePatchObjectId.set('');
    this.toneBasePatchObjectName.set(this.editorPatchName().trim() || 'Current Editor Patch');
    this.autoSelectToneBlocksFromBase(this.editorPatchDraft() ?? current, true);
    this.toneBaseModalOpen.set(false);
    this.status.set('The current editor patch is now the base patch for comparison and save scope.');
  }

  clearToneBasePatch(): void {
    this.toneBasePatchSnapshot.set(null);
    this.toneBasePatchObjectId.set('');
    this.toneBasePatchObjectName.set('');
    this.toneSelectedBlocks.set({});
    this.status.set('Base patch cleared. Save scope is now manual.');
  }

  async applyToneBasePatchObject(): Promise<void> {
    const patchObjectId = Number.parseInt(this.toneBasePatchObjectId().trim() || '0', 10);
    if (!Number.isFinite(patchObjectId) || patchObjectId <= 0) {
      this.status.set('Select a saved patch object to use as the base patch.');
      return;
    }
    const patchObject = this.tonePatchObjects().find((item) => item.id === patchObjectId) ?? null;
    if (!patchObject) {
      this.status.set('Selected base patch object is not available in the current list.');
      return;
    }
    const actionKey = `tone-apply-base:${patchObject.id}`;
    this.setActionBusy(actionKey, true);
    this.status.set(`Applying ${patchObject.name} as the new Live Patch base...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/live-patch/apply-patch-object', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch_object_id: patchObject.id }),
      });
      const payload = (await response.json()) as LivePatchResponse | { detail?: unknown };
      if (!response.ok || !('patch_json' in payload)) {
        this.status.set(`Failed applying ${patchObject.name} as base`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.toneBasePatchObjectId.set(String(patchObject.id));
      this.toneBasePatchObjectName.set(patchObject.name);
      this.applyLivePatchStatus(payload as LivePatchResponse);
      this.loadLivePatchIntoEditorState(payload as LivePatchResponse, true);
      this.toneBaseModalOpen.set(false);
      this.status.set(`Applied ${patchObject.name} as the new Live Patch base`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set(`Failed applying ${patchObject.name} as base`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async saveLiveAsTonePatchObject(): Promise<void> {
    const name = this.toneSaveName().trim();
    const blocks = this.selectedToneBlocks();
    const saveGroupId = Number.parseInt(this.toneSaveGroupId().trim() || '0', 10);
    if (!name) {
      this.status.set('Tone save requires a name.');
      return;
    }
    if (blocks.length === 0) {
      this.status.set('Select at least one block before saving from Live Patch.');
      return;
    }
    this.setActionBusy('tone-save-live', true);
    this.status.set(`Saving Live Patch blocks to ${name}...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/patch-objects/save-from-live', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: this.toneSaveDescription(),
          blocks,
          source_type: 'manual',
        }),
      });
      const payload = (await response.json()) as TonePatchObjectResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set('Live Patch save failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const saved = payload as TonePatchObjectResponse;
      if (Number.isFinite(saveGroupId) && saveGroupId > 0) {
        const groupResponse = await fetch(`/api/v1/groups/${saveGroupId}/patch-objects/${saved.id}`, {
          method: 'POST',
          cache: 'no-store',
        });
        const groupPayload = (await groupResponse.json()) as { detail?: unknown };
        if (!groupResponse.ok) {
          this.status.set(`Saved ${name}, but failed assigning it to the selected group`);
          this.responseJson.set(JSON.stringify(groupPayload, null, 2));
          await this.loadTonePatchObjects();
          return;
        }
      }
      this.toneSaveName.set('');
      this.toneSaveDescription.set('');
      this.toneSaveGroupId.set('');
      this.toneSaveModalOpen.set(false);
      await this.loadTonePatchObjects();
      await this.refreshLivePatchStatus();
      this.status.set(`Saved Live Patch selection as ${name}`);
      this.responseJson.set(JSON.stringify(saved, null, 2));
    } catch (error: unknown) {
      this.status.set('Live Patch save failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-save-live', false);
    }
  }

  async saveFullLiveAsTonePatchObject(): Promise<void> {
    const previous = this.selectedToneBlocks();
    this.toneSelectedBlocks.set(
      this.toneBlockOptions().reduce<Record<string, boolean>>((acc, block) => {
        acc[block] = true;
        return acc;
      }, {}),
    );
    try {
      await this.saveLiveAsTonePatchObject();
    } finally {
      this.toneSelectedBlocks.set(
        previous.reduce<Record<string, boolean>>((acc, block) => {
          acc[block] = true;
          return acc;
        }, {}),
      );
    }
  }

  async createToneGroup(): Promise<void> {
    const name = this.toneGroupName().trim();
    if (!name) {
      this.status.set('Group creation requires a name.');
      return;
    }
    this.setActionBusy('tone-create-group', true);
    this.status.set(`Creating group ${name}...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/groups', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: this.toneGroupDescription() }),
      });
      const payload = (await response.json()) as ToneGroupResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set('Group creation failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.toneGroupName.set('');
      this.toneGroupDescription.set('');
      this.toneGroupModalOpen.set(false);
      await this.loadToneGroups();
      this.status.set(`Created group ${name}`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set('Group creation failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-create-group', false);
    }
  }

  async createManualToneSet(): Promise<void> {
    const name = this.toneManualSetName().trim();
    if (!name) {
      this.status.set('Manual set creation requires a name.');
      return;
    }
    const slots = Object.entries(this.toneManualSetSlots())
      .map(([slotText, patchObjectIdText]) => ({
        slot: Number.parseInt(slotText, 10),
        patch_object_id: Number.parseInt(patchObjectIdText, 10),
      }))
      .filter((item) => Number.isFinite(item.slot) && item.slot >= 1 && item.slot <= 8 && Number.isFinite(item.patch_object_id) && item.patch_object_id > 0)
      .sort((a, b) => a.slot - b.slot);
    if (slots.length === 0) {
      this.status.set('Select at least one patch object before creating a set.');
      return;
    }
    this.setActionBusy('tone-create-set', true);
    this.status.set(`Creating set ${name}...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/sets', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: this.toneManualSetDescription(),
          slots,
        }),
      });
      const payload = (await response.json()) as TonePatchObjectSetResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set('Set creation failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.toneManualSetName.set('');
      this.toneManualSetDescription.set('');
      this.toneManualSetSlots.set({});
      this.toneSetModalOpen.set(false);
      await this.loadToneSets();
      this.status.set(`Created set ${name}`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set('Set creation failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-create-set', false);
    }
  }

  async updateToneSetSlot(toneSet: TonePatchObjectSetResponse, slot: number): Promise<void> {
    const patchObjectId = Number.parseInt(this.toneSetSlotAssignmentValue(toneSet, slot, 0), 10);
    if (!Number.isFinite(patchObjectId) || patchObjectId <= 0) {
      this.status.set(`Select a patch object before updating ${toneSet.name} slot ${slot}.`);
      return;
    }
    const actionKey = `tone-update-set-slot:${toneSet.id}:${slot}`;
    this.setActionBusy(actionKey, true);
    this.status.set(`Updating ${toneSet.name} slot ${slot}...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/sets/${toneSet.id}/slots/${slot}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch_object_id: patchObjectId }),
      });
      const payload = (await response.json()) as TonePatchObjectSetResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set(`Failed updating ${toneSet.name} slot ${slot}`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.toneSetSlotAssignments.update((current) => {
        const next = { ...current };
        delete next[this.toneSetSlotAssignmentKey(toneSet.id, slot)];
        return next;
      });
      await this.loadToneSets();
      this.status.set(`Updated ${toneSet.name} slot ${slot}`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set(`Failed updating ${toneSet.name} slot ${slot}`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async assignTonePatchObjectToGroup(patchObject: TonePatchObjectResponse): Promise<void> {
    const groupIdValue = this.toneAssignGroupByPatchObject()[patchObject.id] ?? '';
    const groupId = Number.parseInt(groupIdValue, 10);
    if (!Number.isFinite(groupId) || groupId <= 0) {
      this.status.set(`Select a group before assigning ${patchObject.name}.`);
      return;
    }
    const actionKey = `tone-assign-group:${patchObject.id}`;
    this.setActionBusy(actionKey, true);
    this.status.set(`Adding ${patchObject.name} to group...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/groups/${groupId}/patch-objects/${patchObject.id}`, {
        method: 'POST',
        cache: 'no-store',
      });
      const payload = (await response.json()) as { ok?: boolean; detail?: unknown };
      if (!response.ok) {
        this.status.set(`Failed adding ${patchObject.name} to group`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.status.set(`Added ${patchObject.name} to group`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set(`Failed adding ${patchObject.name} to group`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async removeTonePatchObjectFromGroup(patchObject: TonePatchObjectResponse, group: { id: number; name: string }): Promise<void> {
    const actionKey = `tone-remove-group:${patchObject.id}:${group.id}`;
    this.setActionBusy(actionKey, true);
    this.status.set(`Removing ${patchObject.name} from ${group.name}...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/groups/${group.id}/patch-objects/${patchObject.id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      const payload = (await response.json()) as { detail?: unknown };
      if (!response.ok) {
        this.status.set(`Failed removing ${patchObject.name} from ${group.name}`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      await this.loadTonePatchObjects();
      this.status.set(`Removed ${patchObject.name} from ${group.name}`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set(`Failed removing ${patchObject.name} from ${group.name}`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async focusTonePatchObject(match: { id: number; name: string }): Promise<void> {
    this.tonePatchQuery.set(match.name);
    this.tonePatchSourceFilter.set('');
    this.tonePatchGroupFilter.set('');
    this.toneHighlightedPatchObjectId.set(match.id);
    await this.loadTonePatchObjects();
    globalThis.document?.getElementById('tone-patch-objects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async activateMatchedSlot(slot: number): Promise<void> {
    const card = this.slots().find((item) => item.slot === slot);
    if (!card) {
      this.status.set(`Slot ${this.setLabelForSlot(slot)} is not available in the current view.`);
      return;
    }
    await this.activateSlot(card);
  }

  async duplicateTonePatchObject(patchObject: TonePatchObjectResponse): Promise<void> {
    const name = window.prompt('Duplicate patch object as:', `${patchObject.name} Copy`);
    if (name === null) {
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      this.status.set('Duplicate requires a non-empty name.');
      return;
    }
    const actionKey = `tone-duplicate:${patchObject.id}`;
    this.setActionBusy(actionKey, true);
    this.status.set(`Duplicating ${patchObject.name}...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/patch-objects/${patchObject.id}/duplicate`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const payload = (await response.json()) as TonePatchObjectResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set(`Failed duplicating ${patchObject.name}`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      await this.loadTonePatchObjects();
      this.status.set(`Duplicated ${patchObject.name} as ${trimmed}`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set(`Failed duplicating ${patchObject.name}`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async applyTonePatchObjectToLive(patchObject: TonePatchObjectResponse): Promise<void> {
    const actionKey = `tone-apply:${patchObject.id}`;
    this.setActionBusy(actionKey, true);
    this.status.set(`Applying ${patchObject.name} to Live Patch...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/live-patch/apply-patch-object', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch_object_id: patchObject.id }),
      });
      const payload = (await response.json()) as LivePatchResponse | { detail?: unknown };
      if (!response.ok || !('patch_json' in payload)) {
        this.status.set(`Failed applying ${patchObject.name}`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.applyLivePatchStatus(payload as LivePatchResponse);
      this.loadLivePatchIntoEditorState(payload as LivePatchResponse, false);
      this.status.set(`Applied ${patchObject.name} to Live Patch`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set(`Failed applying ${patchObject.name}`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async generateToneAiSet(): Promise<void> {
    const setName = this.toneAiSetName().trim();
    const prompt = this.toneAiPrompt().trim();
    const blocks = this.selectedToneBlocks();
    const count = Number.parseInt(this.toneAiCount().trim() || '0', 10);
    if (!setName) {
      this.status.set('AI set generation requires a set name.');
      return;
    }
    if (!prompt) {
      this.status.set('AI set generation requires a prompt.');
      return;
    }
    if (blocks.length === 0) {
      this.status.set('Select at least one block before AI generation.');
      return;
    }
    if (!Number.isFinite(count) || count < 1 || count > 8) {
      this.status.set('AI set count must be between 1 and 8.');
      return;
    }
    this.setActionBusy('tone-ai-generate', true);
    this.status.set(`Generating AI set ${setName}...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/sets/ai-generate', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          set_name: setName,
          description: this.toneAiDescription(),
          prompt,
          blocks,
          count,
        }),
      });
      const payload = (await response.json()) as ToneAiGenerateSetResponse | { detail?: unknown };
      if (!response.ok || !('set' in payload)) {
        this.status.set('AI set generation failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.toneAiSetName.set('');
      this.toneAiDescription.set('');
      this.toneDesignerModalOpen.set(false);
      await this.loadTonePatchObjects();
      await this.loadToneSets();
      this.status.set(`Generated AI set ${setName}`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set('AI set generation failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-ai-generate', false);
    }
  }

  async generateToneAiPatchObjects(): Promise<void> {
    const prompt = this.toneAiPrompt().trim();
    const blocks = this.selectedToneBlocks();
    const count = Number.parseInt(this.toneAiCount().trim() || '0', 10);
    if (!prompt) {
      this.status.set('AI patch-object generation requires a prompt.');
      return;
    }
    if (blocks.length === 0) {
      this.status.set('Select at least one block before AI generation.');
      return;
    }
    if (!Number.isFinite(count) || count < 1 || count > 8) {
      this.status.set('AI generation count must be between 1 and 8.');
      return;
    }
    this.setActionBusy('tone-ai-generate-objects', true);
    this.status.set('Generating AI patch objects...');
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/ai/generate/patch-objects', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          count,
          preferred_blocks: blocks,
          use_live_patch_as_context: true,
          name_prefix: this.toneAiNamePrefix().trim() || null,
        }),
      });
      const payload = (await response.json()) as TonePatchObjectResponse[] | { detail?: unknown };
      if (!response.ok || !Array.isArray(payload)) {
        this.status.set('AI patch-object generation failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      await this.loadTonePatchObjects();
      this.toneDesignerModalOpen.set(false);
      this.status.set(`Generated ${payload.length} AI patch object${payload.length === 1 ? '' : 's'}`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set('AI patch-object generation failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-ai-generate-objects', false);
    }
  }

  async refineToneAiLivePatch(): Promise<void> {
    const prompt = this.toneAiPrompt().trim();
    const blocks = this.selectedToneBlocks();
    if (!prompt) {
      this.status.set('AI refinement requires a prompt.');
      return;
    }
    if (blocks.length === 0) {
      this.status.set('Select at least one block before AI refinement.');
      return;
    }
    const currentName = this.editorPatchName().trim() || this.livePatchExactDbName().trim() || 'Live Patch';
    this.setActionBusy('tone-ai-refine', true);
    this.status.set(`Refining ${currentName} with AI...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/ai/generate/patch-objects', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          count: 1,
          preferred_blocks: blocks,
          use_live_patch_as_context: true,
          name_prefix: `${currentName} Refine`,
        }),
      });
      const payload = (await response.json()) as TonePatchObjectResponse[] | { detail?: unknown };
      if (!response.ok || !Array.isArray(payload) || payload.length === 0) {
        this.status.set('AI refinement failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const refined = payload[0] as TonePatchObjectResponse;
      this.toneHighlightedPatchObjectId.set(refined.id);
      await this.loadTonePatchObjects();
      this.toneDesignerModalOpen.set(false);
      await this.applyTonePatchObjectToLive(refined);
      this.status.set(`Refined ${currentName} as ${refined.name} and applied it live`);
      this.responseJson.set(JSON.stringify(refined, null, 2));
    } catch (error: unknown) {
      this.status.set('AI refinement failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-ai-refine', false);
    }
  }

  async programToneSetToAmp(toneSet: TonePatchObjectSetResponse, startSlot: number): Promise<void> {
    const actionKey = `tone-program-set:${toneSet.id}:${startSlot}`;
    this.setActionBusy(actionKey, true);
    this.status.set(`Programming ${toneSet.name} to ${startSlot <= 4 ? 'A' : 'B'} bank...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/sets/${toneSet.id}/program-amp`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_slot: startSlot }),
      });
      const payload = (await response.json()) as { programmed_slots?: unknown; detail?: unknown };
      if (!response.ok) {
        this.status.set(`Failed programming ${toneSet.name}`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.status.set(`Programmed ${toneSet.name} starting at ${startSlot <= 4 ? 'A:1' : 'B:1'}`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set(`Failed programming ${toneSet.name}`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async syncAmpSlot(slot: number): Promise<void> {
    this.status.set(`Reading slot ${slot} (full patch)...`);
    this.responseJson.set('');

    try {
      const response = await fetch(`/api/v1/amp/slots/${slot}/sync`, {
        method: 'POST',
        cache: 'no-store',
      });
      const payload = (await response.json()) as SlotSyncResponse | { detail: unknown };
      if (!response.ok) {
        this.status.set(`Slot ${slot} read failed`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }

      const synced = payload as SlotSyncResponse;
      this.applySyncedSlot(synced.slot);
      this.lastSyncedAt.set(synced.synced_at);
      this.totalSyncMs.set(synced.slot.slot_sync_ms);
      this.ampStateHash.set('');
      this.status.set(`Slot ${slot} read succeeded (${this.formatMs(synced.slot.slot_sync_ms)})`);
    } catch (error: unknown) {
      this.status.set(`Slot ${slot} read failed`);
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

  async activateSlot(slot: SlotCard): Promise<void> {
    const actionKey = this.slotActionKey('activate', slot.slot);
    this.setActionBusy(actionKey, true);
    this.status.set(`Activating ${slot.slot_label} on amp...`);
    this.responseJson.set('');
    try {
      const activateResponse = await fetch(`/api/v1/amp/slots/${slot.slot}/activate`, {
        method: 'POST',
        cache: 'no-store',
      });
      const activatePayload = (await activateResponse.json()) as SlotActivateResponse | { detail?: unknown };
      if (!activateResponse.ok) {
        this.status.set(`Failed activating ${slot.slot_label}`);
        this.responseJson.set(JSON.stringify(activatePayload, null, 2));
        return;
      }
      const activated = activatePayload as SlotActivateResponse;
      this.selectedAmpSlot.set(slot.slot);
      this.selectedAmpSlotText.set(slot.slot_label);
      this.status.set(`Activated ${slot.slot_label} on amp (${this.formatMs(activated.activate_ms)}). Reading patch state back...`);

      const syncResponse = await fetch(`/api/v1/amp/slots/${slot.slot}/readback`, {
        method: 'POST',
        cache: 'no-store',
      });
      const syncPayload = (await syncResponse.json()) as SlotSyncResponse | { detail?: unknown };
      if (!syncResponse.ok) {
        this.status.set(`Activated ${slot.slot_label}; patch readback failed`);
        this.responseJson.set(
          JSON.stringify(
            {
              activate: activated,
              readback: syncPayload,
            },
            null,
            2,
          ),
        );
        return;
      }
      const synced = syncPayload as SlotSyncResponse;
      this.applySyncedSlot(synced.slot);
      this.lastSyncedAt.set(synced.synced_at);
      this.totalSyncMs.set(synced.slot.slot_sync_ms);
      this.currentAmpPatchHash.set(synced.slot.config_hash_sha256 || '');
      this.refreshCurrentCommitStateFromKnownState();
      this.status.set(`Activated ${slot.slot_label}; patch state read back (${this.formatMs(synced.slot.slot_sync_ms)})`);
    } catch (error: unknown) {
      this.status.set(`Failed activating ${slot.slot_label}`);
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
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async readActiveAmpSlot(slot: SlotCard): Promise<void> {
    const actionKey = this.slotActionKey('read-amp', slot.slot);
    this.setActionBusy(actionKey, true);
    this.status.set(`Reading active patch state for ${slot.slot_label}...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/amp/slots/${slot.slot}/readback`, {
        method: 'POST',
        cache: 'no-store',
      });
      const payload = (await response.json()) as SlotSyncResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set(`Active patch read failed for ${slot.slot_label}`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const synced = payload as SlotSyncResponse;
      this.applySyncedSlot(synced.slot);
      this.selectedAmpSlot.set(slot.slot);
      this.selectedAmpSlotText.set(slot.slot_label);
      this.lastSyncedAt.set(synced.synced_at);
      this.totalSyncMs.set(synced.slot.slot_sync_ms);
      this.currentAmpPatchHash.set(synced.slot.config_hash_sha256 || '');
      this.refreshCurrentCommitStateFromKnownState();
      this.status.set(`Read active patch state for ${slot.slot_label} (${this.formatMs(synced.slot.slot_sync_ms)})`);
    } catch (error: unknown) {
      this.status.set(`Active patch read failed for ${slot.slot_label}`);
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
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async stageSlotToAmp(slot: SlotCard): Promise<void> {
    if (!this.isActiveSlot(slot)) {
      this.status.set(`${slot.slot_label} is not active on amp. Activate it first.`);
      return;
    }
    if (!slot.patch) {
      this.status.set(`No full patch payload loaded for ${slot.slot_label}. Load or activate first.`);
      return;
    }
    const actionKey = this.slotActionKey('stage', slot.slot);
    this.setActionBusy(actionKey, true);
    this.status.set(`Staging ${slot.slot_label} to active amp patch...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/amp/current-patch/live-apply', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: slot.patch }),
      });
      const payload = (await response.json()) as ApplyCurrentPatchResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set(`Failed staging ${slot.slot_label} to active amp patch`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const staged = payload as ApplyCurrentPatchResponse;
      const appliedPatch = this.clonePatch(staged.patch);
      const hash = this.readString(appliedPatch, 'config_hash_sha256') ?? '';
      this.currentAmpPatchHash.set(hash);
      this.slots.update((rows) =>
        rows.map((card) =>
          card.slot === slot.slot
            ? {
                ...card,
                patch: {
                  ...this.clonePatch(card.patch ?? appliedPatch),
                  config_hash_sha256: hash,
                },
                config_hash_sha256: hash,
                in_sync: true,
                out_synced: true,
                is_saved: Boolean(card.saved_hash_sha256) && card.saved_hash_sha256 === hash,
              }
            : card,
        ),
      );
      this.currentAmpCommitState.set('uncommitted');
      this.status.set(`Staged ${slot.slot_label} to active amp patch`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Patch staged to active amp patch',
            slot: slot.slot_label,
            applied_at: staged.applied_at,
            hash_id: hash || null,
          },
          null,
          2,
        ),
      );
    } catch (error: unknown) {
      this.status.set(`Failed staging ${slot.slot_label} to active amp patch`);
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
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async commitSlotToAmp(slot: SlotCard): Promise<void> {
    if (!this.isActiveSlot(slot)) {
      this.status.set(`${slot.slot_label} is not active on amp. Activate it first.`);
      return;
    }
    if (!slot.patch) {
      this.status.set(`No full patch payload loaded for ${slot.slot_label}. Load or activate first.`);
      return;
    }
    const actionKey = this.slotActionKey('commit', slot.slot);
    this.setActionBusy(actionKey, true);
    this.status.set(`Committing ${slot.slot_label} to amp memory...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/amp/slots/${slot.slot}/write`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: slot.patch }),
      });
      const payload = (await response.json()) as SlotWriteResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set(`Failed committing ${slot.slot_label} to amp memory`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const committed = payload as SlotWriteResponse;
      this.applySyncedSlot(committed.slot);
      this.slots.update((rows) =>
        rows.map((card) => {
          if (card.slot !== slot.slot) {
            return card;
          }
          const nextPatch = this.clonePatch(card.patch ?? committed.slot.patch ?? {});
          nextPatch['config_hash_sha256'] = committed.slot.config_hash_sha256;
          const savedHash = card.saved_hash_sha256;
          return {
            ...card,
            patch: nextPatch,
            config_hash_sha256: committed.slot.config_hash_sha256,
            committed_hash_sha256: committed.slot.config_hash_sha256,
            in_sync: true,
            is_saved: Boolean(savedHash) && savedHash === committed.slot.config_hash_sha256,
            out_synced: true,
          };
        }),
      );
      this.selectedAmpSlot.set(slot.slot);
      this.lastSyncedAt.set(committed.synced_at);
      this.totalSyncMs.set(committed.slot.slot_sync_ms);
      this.currentAmpPatchHash.set(committed.slot.config_hash_sha256 || '');
      this.refreshCurrentCommitStateFromKnownState();
      this.status.set(`Committed ${slot.slot_label} to amp memory`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Patch committed to amp memory',
            slot: slot.slot_label,
            synced_at: committed.synced_at,
            hash_id: committed.slot.config_hash_sha256 || null,
          },
          null,
          2,
        ),
      );
    } catch (error: unknown) {
      this.status.set(`Failed committing ${slot.slot_label} to amp memory`);
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
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async keepSlotToToneLibrary(slot: SlotCard): Promise<void> {
    if (!slot.patch) {
      this.status.set(`No patch payload loaded for ${slot.slot_label}. Read or load it first.`);
      return;
    }
    const suggestedName = (slot.patch_name || `${slot.slot_label} Keeper`).trim();
    const name = window.prompt(`Keep ${slot.slot_label} in Tone Lab as:`, suggestedName);
    if (name === null) {
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      this.status.set('Keep requires a non-empty name.');
      return;
    }
    const groupId = Number.parseInt(this.toneSaveGroupId().trim() || '0', 10);
    const actionKey = this.slotActionKey('keep-tone', slot.slot);
    this.setActionBusy(actionKey, true);
    this.status.set(`Keeping ${slot.slot_label} in Tone Lab...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/patch-objects', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          description: `Captured from ${slot.slot_label}${slot.patch_name ? ` · ${slot.patch_name}` : ''}`,
          patch_json: slot.patch,
          source_type: 'captured',
          parent_patch_object_id: null,
        }),
      });
      const payload = (await response.json()) as TonePatchObjectResponse | { detail?: unknown };
      if (!response.ok || !('id' in payload)) {
        this.status.set(`Failed keeping ${slot.slot_label} in Tone Lab`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const created = payload as TonePatchObjectResponse;
      if (Number.isFinite(groupId) && groupId > 0) {
        const groupResponse = await fetch(`/api/v1/groups/${groupId}/patch-objects/${created.id}`, {
          method: 'POST',
          cache: 'no-store',
        });
        const groupPayload = (await groupResponse.json()) as { detail?: unknown };
        if (!groupResponse.ok) {
          this.status.set(`Kept ${slot.slot_label}, but failed assigning it to the selected group`);
          this.responseJson.set(JSON.stringify(groupPayload, null, 2));
          return;
        }
      }
      this.toneHighlightedPatchObjectId.set(created.id);
      await this.loadTonePatchObjects();
      this.status.set(`Kept ${slot.slot_label} as ${trimmed}`);
      this.responseJson.set(JSON.stringify(created, null, 2));
      globalThis.document?.getElementById('tone-patch-objects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error: unknown) {
      this.status.set(`Failed keeping ${slot.slot_label} in Tone Lab`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
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
      const exactPatchObjectId = this.livePatchExactDbMatch()?.id ?? null;
      const selectedSlot = this.selectedAmpSlot();

      const startedAt = Date.now();
      countdownHandle = setInterval(() => {
        const remaining = durationSec - Math.floor((Date.now() - startedAt) / 1000);
        this.measureCountdownSec.set(Math.max(0, remaining));
      }, 200);
      this.status.set(`Recording sample for active patch (${activeName}) for ${durationSec}s...`);
      const response = await fetch('/api/v1/audio/measure', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patch_hash: activeHash || null,
          patch_object_id: exactPatchObjectId,
          slot: selectedSlot,
          duration_sec: durationSec,
        }),
      });
      const payload = (await response.json()) as AudioSampleResponse | { detail?: unknown };
      if (!response.ok) {
        throw new Error(`active patch sample failed: ${JSON.stringify(payload)}`);
      }
      const sample = payload as AudioSampleResponse;
      const measuredAt = sample.created_at;
      const matchedSlot = this.slots().find((item) => item.config_hash_sha256 === sample.patch_hash);
      if (matchedSlot) {
        this.setSlotMeasuredRms(matchedSlot.slot, sample.rms_dbfs, sample.peak_dbfs, measuredAt);
      }
      await this.loadRecentAudioSamples();
      this.status.set(`Recorded sample for active patch (${activeName})`);
      this.responseJson.set(
        JSON.stringify(
          {
            message: 'Recorded sample for active patch',
            sample_id: sample.id,
            active_patch_name: activeName,
            active_patch_hash: sample.patch_hash,
            active_patch_object_id: sample.patch_object_id,
            active_patch_object_name: sample.patch_object_name,
            matched_slot: matchedSlot?.slot_label ?? null,
            rms_dbfs: sample.rms_dbfs,
            peak_dbfs: sample.peak_dbfs,
            captured_at: measuredAt,
            playback_url: sample.playback_url,
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
      this.measureCountdownSec.set(0);
      this.isMeasuringActivePatch.set(false);
    }
  }

  async captureAudioLevelMarker(): Promise<void> {
    this.setActionBusy('capture-level-marker', true);
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
    } finally {
      this.setActionBusy('capture-level-marker', false);
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

  async loadRecentAudioSamples(): Promise<void> {
    try {
      const response = await fetch('/api/v1/audio/measures?limit=12', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as AudioSampleResponse[] | { detail?: unknown };
      if (!response.ok) {
        return;
      }
      this.recentSamples.set((payload as AudioSampleResponse[]).filter((item) => !item.is_level_marker));
    } catch {
      // samples panel is informational; keep current UI state
    }
  }

  canShowPatchSamples(slot: SlotCard): boolean {
    return Boolean(slot.is_saved && slot.config_hash_sha256);
  }

  async openPatchSamplesModal(slot: SlotCard): Promise<void> {
    if (!slot.config_hash_sha256) {
      this.status.set(`No DB-known patch hash for ${slot.slot_label}`);
      return;
    }
    this.status.set(`Loading samples for ${slot.slot_label}...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/audio/measures?limit=50&patch_hash=${encodeURIComponent(slot.config_hash_sha256)}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as AudioSampleResponse[] | { detail?: unknown };
      if (!response.ok) {
        this.status.set(`Failed loading samples for ${slot.slot_label}`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.patchSamplesRows.set((payload as AudioSampleResponse[]).filter((item) => !item.is_level_marker));
      this.patchSamplesModalTitle.set(`${slot.slot_label} · ${slot.patch_name || 'Unnamed Patch'} Samples`);
      this.patchSamplesModalOpen.set(true);
      this.status.set(`Loaded samples for ${slot.slot_label}`);
    } catch (error: unknown) {
      this.status.set(`Failed loading samples for ${slot.slot_label}`);
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

  async openTonePatchObjectSamples(patchObject: TonePatchObjectResponse): Promise<void> {
    this.status.set(`Loading samples for ${patchObject.name}...`);
    this.responseJson.set('');
    try {
      const response = await fetch(`/api/v1/audio/measures?limit=50&patch_object_id=${patchObject.id}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as AudioSampleResponse[] | { detail?: unknown };
      if (!response.ok) {
        this.status.set(`Failed loading samples for ${patchObject.name}`);
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      this.patchSamplesRows.set((payload as AudioSampleResponse[]).filter((item) => !item.is_level_marker));
      this.patchSamplesModalTitle.set(`Tone Lab · ${patchObject.name} Samples`);
      this.patchSamplesModalOpen.set(true);
      this.status.set(`Loaded samples for ${patchObject.name}`);
    } catch (error: unknown) {
      this.status.set(`Failed loading samples for ${patchObject.name}`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    }
  }

  closePatchSamplesModal(): void {
    this.patchSamplesModalOpen.set(false);
    this.patchSamplesModalTitle.set('');
    this.patchSamplesRows.set([]);
  }

  sampleDisplayName(sample: AudioSampleResponse): string {
    return sample.patch_object_name || sample.patch_name || sample.slot_label || `Sample #${sample.id}`;
  }

  canAskAi(slot: SlotCard): boolean {
    return slot.patch !== null;
  }

  canAskAiLevel(slot: SlotCard): boolean {
    return slot.patch !== null && this.isActiveSlot(slot);
  }

  async openAskAiModal(slot: SlotCard): Promise<void> {
    if (!slot.patch) {
      this.status.set(`No full patch payload loaded for ${slot.slot_label}. Sync this slot first.`);
      return;
    }
    this.aiModalMode.set('general');
    this.aiModalSlotNumber.set(slot.slot);
    this.aiModalSlotLabel.set(slot.slot_label);
    this.aiModalPatchName.set(slot.patch_name || 'Unnamed Patch');
    this.aiModalPatch.set(this.clonePatch(slot.patch));
    this.aiModalCurrentMeasuredRms.set(slot.measured_rms_dbfs);
    this.aiModalTargetRms.set(DEFAULT_TARGET_RMS_DBFS.toFixed(2));
    this.aiModalPrompt.set('Suggest the most useful concrete improvements for this patch. Focus on tone, EQ, gain structure, and clarity.');
    this.aiModalAdvice.set(null);
    this.aiModalError.set('');
    this.aiModalOpen.set(true);
  }

  openAiLevelModal(slot: SlotCard): void {
    if (!slot.patch) {
      this.status.set(`No full patch payload loaded for ${slot.slot_label}. Sync this slot first.`);
      return;
    }
    if (!this.isActiveSlot(slot)) {
      this.status.set(`${slot.slot_label} is not active on amp. Activate it first.`);
      return;
    }
    this.autoLevelSlotNumber.set(slot.slot);
    this.autoLevelSlotLabel.set(slot.slot_label);
    this.autoLevelPatchName.set(slot.patch_name || 'Unnamed Patch');
    this.autoLevelTargetRms.set(DEFAULT_TARGET_RMS_DBFS.toFixed(2));
    this.autoLevelCurrentRms.set(slot.measured_rms_dbfs);
    this.autoLevelIteration.set(0);
    this.autoLevelState.set('idle');
    this.autoLevelRunning.set(false);
    this.autoLevelLogs.set([
      slot.measured_rms_dbfs !== null
        ? `${slot.slot_label}: current 10s Max RMS is ${slot.measured_rms_dbfs.toFixed(2)} dBFS.`
        : `${slot.slot_label}: no stored 10s Max RMS yet. The run will measure from the live amp first.`,
      `Default target RMS is ${DEFAULT_TARGET_RMS_DBFS.toFixed(2)} dBFS.`,
    ]);
    this.autoLevelModalOpen.set(true);
  }

  closeAiModal(): void {
    this.aiModalOpen.set(false);
    this.aiModalMode.set('general');
    this.aiModalSlotNumber.set(null);
    this.aiModalSlotLabel.set('');
    this.aiModalPatchName.set('');
    this.aiModalPatch.set(null);
    this.aiModalCurrentMeasuredRms.set(null);
    this.aiModalTargetRms.set('');
    this.aiModalPrompt.set('Suggest the most useful concrete improvements for this patch. Focus on tone, EQ, gain structure, and clarity.');
    this.aiModalLoading.set(false);
    this.aiModalError.set('');
    this.aiModalAdvice.set(null);
  }

  closeAutoLevelModal(): void {
    if (this.autoLevelRunning()) {
      return;
    }
    this.autoLevelModalOpen.set(false);
    this.autoLevelSlotNumber.set(null);
    this.autoLevelSlotLabel.set('');
    this.autoLevelPatchName.set('');
    this.autoLevelTargetRms.set('');
    this.autoLevelCurrentRms.set(null);
    this.autoLevelIteration.set(0);
    this.autoLevelState.set('idle');
    this.autoLevelLogs.set([]);
  }

  async requestAiPatchAdvice(promptOverride?: string): Promise<void> {
    const patch = this.aiModalPatch();
    if (!patch) {
      this.aiModalError.set('No patch payload loaded for AI advice.');
      return;
    }
    const prompt = promptOverride ?? this.aiModalPrompt();
    this.aiModalLoading.set(true);
    this.aiModalError.set('');
    this.aiModalAdvice.set(null);
    this.status.set(`Asking AI about ${this.aiModalSlotLabel()}...`);
    this.responseJson.set('');
    try {
      const advice = await this.fetchAiPatchAdvice(this.aiModalSlotLabel(), prompt, patch);
      this.aiModalAdvice.set(advice);
      this.status.set(`AI advice loaded for ${this.aiModalSlotLabel()}`);
    } catch (error: unknown) {
      const detailText = JSON.stringify(
        {
          message: 'Browser request failed',
          error: String(error),
        },
        null,
        2,
      );
      this.aiModalError.set(detailText);
      this.responseJson.set(detailText);
      this.status.set(`AI advice failed for ${this.aiModalSlotLabel()}`);
    } finally {
      this.aiModalLoading.set(false);
    }
  }

  setAiModalPrompt(value: string): void {
    this.aiModalPrompt.set(value);
  }

  setAiModalTargetRms(value: string): void {
    this.aiModalTargetRms.set(value);
  }

  async requestAiTargetRmsAdvice(): Promise<void> {
    const currentMeasured = this.aiModalCurrentMeasuredRms();
    if (currentMeasured === null) {
      this.aiModalError.set('No current measured RMS is available for this slot.');
      return;
    }
    const parsed = Number.parseFloat(this.aiModalTargetRms());
    if (!Number.isFinite(parsed)) {
      this.aiModalError.set('Enter a valid target dBFS value.');
      return;
    }
    const prompt = this.buildAiTargetRmsPrompt(currentMeasured, parsed);
    this.aiModalPrompt.set(prompt);
    await this.requestAiPatchAdvice(prompt);
  }

  setAutoLevelTargetRms(value: string): void {
    this.autoLevelTargetRms.set(value);
  }

  autoLevelStateLabel(): string {
    const state = this.autoLevelState();
    if (state === 'idle') {
      return 'Ready';
    }
    if (state === 'waiting') {
      return 'Waiting For Playing';
    }
    if (state === 'measuring') {
      return 'Measuring';
    }
    if (state === 'asking') {
      return 'Consulting AI';
    }
    if (state === 'applying') {
      return 'Applying Proposal';
    }
    if (state === 'succeeded') {
      return 'Succeeded';
    }
    return 'Failed';
  }

  async startAutoLevelRun(): Promise<void> {
    if (this.autoLevelRunning()) {
      return;
    }
    const slotNumber = this.autoLevelSlotNumber();
    if (slotNumber === null) {
      return;
    }
    const targetRms = Number.parseFloat(this.autoLevelTargetRms());
    if (!Number.isFinite(targetRms)) {
      this.pushAutoLevelLog('Target RMS is invalid.');
      this.autoLevelState.set('failed');
      return;
    }
    const slot = this.slots().find((item) => item.slot === slotNumber) ?? null;
    if (!slot || !slot.patch) {
      this.pushAutoLevelLog('No slot patch is available for auto-level.');
      this.autoLevelState.set('failed');
      return;
    }
    if (!this.isActiveSlot(slot)) {
      this.pushAutoLevelLog(`${slot.slot_label} is no longer active on the amp.`);
      this.autoLevelState.set('failed');
      return;
    }
    this.autoLevelRunning.set(true);
    this.autoLevelState.set('waiting');
    this.autoLevelIteration.set(0);
    this.autoLevelLogs.set([
      `${slot.slot_label}: target RMS ${targetRms.toFixed(2)} dBFS.`,
      'Waiting for you to start playing...',
    ]);
    this.responseJson.set('');
    try {
      await this.waitForPlayingStart(slot.slot_label);
      const maxIterations = 4;
      for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
        this.autoLevelIteration.set(iteration);
        this.autoLevelState.set('measuring');
        this.pushAutoLevelLog(`Iteration ${iteration}: measuring ${AUTO_LEVEL_MEASURE_SEC.toFixed(0)}s window...`);
        const sample = await this.captureActivePatchMeasurement(slot.slot, AUTO_LEVEL_MEASURE_SEC);
        this.autoLevelCurrentRms.set(sample.rms_dbfs);
        this.pushAutoLevelLog(`Iteration ${iteration}: measured ${sample.rms_dbfs.toFixed(2)} dBFS.`);
        const errorDb = sample.rms_dbfs - targetRms;
        this.pushAutoLevelLog(`Iteration ${iteration}: error ${errorDb.toFixed(2)} dB vs target.`);
        if (Math.abs(errorDb) <= AUTO_LEVEL_TOLERANCE_DB) {
          this.autoLevelState.set('succeeded');
          this.pushAutoLevelLog(
            `Target reached within ${AUTO_LEVEL_TOLERANCE_DB.toFixed(1)} dB tolerance. Final RMS ${sample.rms_dbfs.toFixed(2)} dBFS.`,
          );
          this.status.set(`AI auto-level succeeded for ${slot.slot_label}`);
          return;
        }
        const currentSlot = this.slots().find((item) => item.slot === slot.slot) ?? null;
        if (!currentSlot || !currentSlot.patch) {
          throw new Error('Active slot patch disappeared during auto-level run.');
        }
        const prompt = this.buildAiTargetRmsPrompt(sample.rms_dbfs, targetRms);
        this.autoLevelState.set('asking');
        const direction = errorDb > 0 ? 'quieter' : 'louder';
        this.pushAutoLevelLog(`Iteration ${iteration}: asking AI for a ${direction} proposal...`);
        const advice = await this.fetchAiPatchAdvice(slot.slot_label, prompt, currentSlot.patch);
        for (const change of advice.suggested_changes) {
          this.pushAutoLevelLog(
            `AI change: ${change.field} ${this.formatAiValue(change.current_value)} -> ${this.formatAiValue(change.suggested_value)} (${change.rationale})`,
          );
        }
        this.autoLevelState.set('applying');
        this.pushAutoLevelLog(`Iteration ${iteration}: applying AI proposal...`);
        await this.applyProposedPatchToSlot(slot.slot, advice.proposed_patch, true);
        this.pushAutoLevelLog(`Iteration ${iteration}: proposal applied to active patch.`);
      }
      throw new Error(`Failed to reach target ${targetRms.toFixed(2)} dBFS after ${maxIterations} iterations.`);
    } catch (error: unknown) {
      this.autoLevelState.set('failed');
      this.pushAutoLevelLog(String(error));
      this.status.set(`AI auto-level failed for ${this.autoLevelSlotLabel()}`);
    } finally {
      this.autoLevelRunning.set(false);
    }
  }

  applyAiAdviceToPatch(): void {
    const advice = this.aiModalAdvice();
    const slotNumber = this.aiModalSlotNumber();
    if (!advice || slotNumber === null) {
      return;
    }
    const proposedName = this.readString(advice.proposed_patch, 'patch_name') ?? this.aiModalPatchName();
    void this.applyProposedPatchToSlot(slotNumber, advice.proposed_patch, false).then(() => {
      this.aiModalPatchName.set(proposedName || this.aiModalPatchName());
    });
    this.status.set(`Applied AI proposal to ${this.aiModalSlotLabel()} as local patch state`);
  }

  aiModalPrimaryButtonLabel(): string {
    return this.aiModalMode() === 'level' ? 'Ask AI To Hit Target' : 'Ask AI';
  }

  aiModalDescription(): string {
    if (this.aiModalMode() === 'level') {
      return 'The AI is fed the current patch JSON plus measured RMS and target RMS, and may return multiple concrete control/value changes to move loudness toward target.';
    }
    return 'The AI is fed the current patch JSON and may return multiple concrete Katana control/value changes.';
  }

  private buildAiTargetRmsPrompt(currentRmsDbfs: number, targetRmsDbfs: number): string {
    const deltaDb = targetRmsDbfs - currentRmsDbfs;
    const direction = deltaDb < 0 ? 'reduce' : 'increase';
    return [
      `Current 10s Max RMS is ${currentRmsDbfs.toFixed(2)} dBFS.`,
      `Target 10s Max RMS is ${targetRmsDbfs.toFixed(2)} dBFS.`,
      `Suggest concrete numeric control changes to ${direction} loudness toward that target while preserving the overall tone character where possible.`,
      'You may return multiple changes when they clearly work together.',
      'Do not assume amp.volume is the only control to use.',
      'Consider whichever parts of the chain are actually contributing level, including booster drive/effect level, mod/fx levels, delay/reverb levels, solo, send_return, EQ boosts, amp gain, and amp volume.',
      'Prefer the smallest effective change.',
    ].join(' ');
  }

  private async fetchAiPatchAdvice(slotLabel: string, prompt: string, patch: Record<string, unknown>): Promise<AiPatchAdviceResponse> {
    const response = await fetch('/api/v1/ai/patch-advice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slot_label: slotLabel,
        question: prompt,
        patch,
      }),
    });
    const payload = (await response.json()) as AiPatchAdviceResponse | { detail?: unknown };
    if (!response.ok) {
      throw new Error(JSON.stringify(payload, null, 2));
    }
    return payload as AiPatchAdviceResponse;
  }

  navigateToPage(page: 'dashboard' | 'samples'): void {
    const targetPath = page === 'samples' ? '/samples' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    this.currentPage.set(page);
    if (page === 'samples') {
      void this.loadRecentAudioSamples();
    }
  }

  isSamplesPage(): boolean {
    return this.currentPage() === 'samples';
  }

  isDashboardPage(): boolean {
    return this.currentPage() === 'dashboard';
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
        const fftBinsUnknown = payload['fft_bins_db'];
        if (Array.isArray(fftBinsUnknown)) {
          const fftBins = fftBinsUnknown
            .map((item) => (typeof item === 'number' && Number.isFinite(item) ? item : null))
            .filter((item): item is number => item !== null);
          this.liveFftBinsDb.set(fftBins);
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

  toggleLiveMeter(): void {
    if (this.liveMeterConnected()) {
      this.stopLiveMeter();
      this.status.set('Live audio meter stopped');
      return;
    }
    this.startLiveMeter();
  }

  stopLiveMeter(): void {
    if (this.liveMeterSource !== null) {
      this.liveMeterSource.close();
      this.liveMeterSource = null;
    }
    this.liveMeterConnected.set(false);
    this.liveFftBinsDb.set([]);
  }

  liveMeterButtonLabel(): string {
    return this.liveMeterConnected() ? 'Stop Live Meter' : 'Start Live Meter';
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

  private resolvePageFromPath(): 'dashboard' | 'samples' {
    return window.location.pathname === '/samples' ? 'samples' : 'dashboard';
  }

  canUseSlotActions(slot: SlotCard): boolean {
    return this.hasFullPatch(slot);
  }

  canOpenEditor(slot: SlotCard): boolean {
    return this.hasFullPatch(slot);
  }

  canActivateSlot(slot: SlotCard): boolean {
    return !this.isActiveSlot(slot);
  }

  canReadActiveSlot(slot: SlotCard): boolean {
    return this.isActiveSlot(slot);
  }

  canStageSlot(slot: SlotCard): boolean {
    return this.hasFullPatch(slot) && this.isActiveSlot(slot);
  }

  canCommitSlot(slot: SlotCard): boolean {
    return this.hasFullPatch(slot) && this.isActiveSlot(slot);
  }

  canSaveSlot(slot: SlotCard): boolean {
    return this.hasFullPatch(slot);
  }

  measureActiveButtonLabel(): string {
    if (this.isMeasuringActivePatch()) {
      return `Measure (${this.measureCountdownSec()}s)`;
    }
    return 'Measure';
  }

  editorLiveApplyAvailable(): boolean {
    return this.editorTargetIsActive();
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

  editorDbStateLabel(): string {
    const slotNumber = this.editorSlotNumber();
    if (slotNumber === null) {
      return 'DB ?';
    }
    const slot = this.slots().find((card) => card.slot === slotNumber);
    if (!slot?.saved_hash_sha256) {
      return this.editorPatchDraft() ? 'DB ✗' : 'DB ?';
    }
    if (this.editorIsModified()) {
      return 'DB ✗';
    }
    const draftHash = this.readString(this.editorPatchDraft(), 'config_hash_sha256') ?? '';
    if (!draftHash) {
      return 'DB ✗';
    }
    return draftHash === slot.saved_hash_sha256 ? 'DB ✓' : 'DB ✗';
  }

  setEditorPatchName(value: string): void {
    this.updateEditorPatch((draft) => {
      draft['patch_name'] = value;
    });
  }

  editorAmpNumber(field: string): number | null {
    const amp = this.readObject(this.editorPatchDraft(), 'amp');
    const fromDraft = this.readAmpField(amp, field);
    if (fromDraft !== null) {
      return fromDraft;
    }
    const slotNumber = this.editorSlotNumber();
    if (slotNumber === null) {
      return null;
    }
    const slot = this.slots().find((item) => item.slot === slotNumber);
    const slotAmp = this.readObject(this.readObject(slot?.patch, 'amp'));
    return this.readAmpField(slotAmp, field);
  }

  editorAmpRawValue(rawIndex: number): number {
    const fromDraft = this.readEditorAmpRawIndex(rawIndex);
    if (fromDraft !== null) {
      return fromDraft;
    }
    const slotNumber = this.editorSlotNumber();
    if (slotNumber !== null) {
      const slot = this.slots().find((item) => item.slot === slotNumber);
      const slotAmp = this.readObject(this.readObject(slot?.patch, 'amp'));
      const raw = this.readAmpRaw(slotAmp);
      if (raw !== null && rawIndex >= 0 && rawIndex < raw.length) {
        return raw[rawIndex];
      }
    }
    return 0;
  }

  setEditorAmpNumber(field: string, value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const amp = this.ensureObject(draft, 'amp');
      amp[field] = parsed;
      this.syncAmpDerivedRawField(amp, field, parsed);
    });
  }

  editorAmpTypeOptions(): TypeOption[] {
    return AMP_TYPE_NAMES.map((label, index) => ({ value: index, label }));
  }

  editorRoutingNumber(field: 'chain_pattern' | 'cabinet_resonance' | 'master_key'): number | null {
    const routing = this.readObject(this.editorPatchDraft(), 'routing');
    return this.readNumber(routing, field);
  }

  setEditorRoutingNumber(field: 'chain_pattern' | 'cabinet_resonance' | 'master_key', value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const routing = this.ensureObject(draft, 'routing');
      routing[field] = parsed;
    });
  }

  editorColorIndex(stageName: ColorStageName): number {
    const colors = this.readObject(this.editorPatchDraft(), 'colors');
    const stage = this.readObject(colors, stageName);
    const index = this.readNumber(stage, 'index');
    return index ?? 0;
  }

  setEditorColorIndex(stageName: ColorStageName, value: string): void {
    const parsed = this.clampInteger(this.parseInteger(value), 0, 2);
    this.updateEditorPatch((draft) => {
      const colors = this.ensureObject(draft, 'colors');
      const stage = this.ensureObject(colors, stageName);
      stage['index'] = parsed;
      stage['name'] = this.colorName(parsed);
    });
  }

  editorColorOptions(): TypeOption[] {
    return [
      { value: 0, label: 'Green' },
      { value: 1, label: 'Red' },
      { value: 2, label: 'Yellow' },
    ];
  }

  editorDelay2On(): boolean {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const delay = this.readObject(stages, 'delay');
    return this.readBoolean(delay, 'delay2_on');
  }

  setEditorDelay2On(checked: boolean): void {
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const delay = this.ensureObject(stages, 'delay');
      delay['delay2_on'] = checked;
    });
  }

  editorEqNumber(eqName: EqStageName, field: 'position' | 'type'): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const eq = this.readObject(stages, eqName);
    return this.readNumber(eq, field);
  }

  setEditorEqNumber(eqName: EqStageName, field: 'position' | 'type', value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const eq = this.ensureObject(stages, eqName);
      eq[field] = parsed;
    });
  }

  editorEqOn(eqName: EqStageName): boolean {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const eq = this.readObject(stages, eqName);
    return this.readBoolean(eq, 'on');
  }

  setEditorEqOn(eqName: EqStageName, checked: boolean): void {
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const eq = this.ensureObject(stages, eqName);
      eq['on'] = checked;
    });
  }

  editorEqTypeOptions(): TypeOption[] {
    return EQ_TYPE_NAMES.map((label, index) => ({ value: index, label }));
  }

  editorEqPositionOptions(): TypeOption[] {
    return EQ_POSITION_NAMES.map((label, index) => ({ value: index, label }));
  }

  editorEqType(eqName: EqStageName): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const eq = this.readObject(stages, eqName);
    return this.readNumber(eq, 'type');
  }

  editorEqIsParametric(eqName: EqStageName): boolean {
    return this.editorEqType(eqName) !== 1;
  }

  editorEqIsGe10(eqName: EqStageName): boolean {
    return this.editorEqType(eqName) === 1;
  }

  editorEqRawFields(eqName: EqStageName, rawKey: 'peq_raw' | 'ge10_raw'): RawValueField[] {
    return this.editorNestedRawFields(['stages', eqName], rawKey, `${eqName}-${rawKey}`);
  }

  setEditorEqRawValue(eqName: EqStageName, rawKey: 'peq_raw' | 'ge10_raw', index: number, value: string): void {
    this.setEditorNestedRawValue(['stages', eqName], rawKey, index, value);
  }

  editorEqPeqParams(eqName: EqStageName): EqParamField[] {
    const fields = this.editorEqRawFields(eqName, 'peq_raw');
    return EQ_PEQ_PARAM_SCHEMA.map((schema) => {
      const rawValue = fields[schema.index]?.value ?? 0;
      const value = rawValue - (schema.offset ?? 0);
      const valueLabel = schema.options?.find((option) => option.value === value)?.label ?? null;
      return {
        id: `${eqName}-peq-${schema.key}`,
        key: schema.key,
        label: schema.label,
        value,
        min: schema.min,
        max: schema.max,
        valueLabel,
        options: schema.options ?? null,
      };
    });
  }

  setEditorEqPeqValue(eqName: EqStageName, paramKey: string, value: string): void {
    const schema = EQ_PEQ_PARAM_SCHEMA.find((item) => item.key === paramKey);
    if (!schema) {
      return;
    }
    const parsed = this.clampInteger(this.parseInteger(value), schema.min, schema.max);
    const encoded = parsed + (schema.offset ?? 0);
    this.setEditorEqRawValue(eqName, 'peq_raw', schema.index, `${encoded}`);
  }

  editorEqPeqGraphPath(eqName: EqStageName): string {
    const nodes = this.editorEqPeqGraphNodes(eqName);
    if (nodes.length === 0) {
      return '';
    }
    return nodes.map((node, index) => `${index === 0 ? 'M' : 'L'} ${node.x} ${node.y}`).join(' ');
  }

  editorEqPeqGraphNodes(eqName: EqStageName): EqPeqGraphNode[] {
    const params = this.editorEqPeqParamMap(eqName);
    const lowMidFreq = params.get('lowmid_freq')?.value ?? 14;
    const highMidFreq = params.get('highmid_freq')?.value ?? 23;
    return [
      this.buildEqPeqGraphNode(eqName, 'Low', 28, params.get('low_gain')?.value ?? 0),
      this.buildEqPeqGraphNode(eqName, 'Low Mid', this.eqPeqMidBandX(lowMidFreq, 92, 240), params.get('lowmid_gain')?.value ?? 0),
      this.buildEqPeqGraphNode(eqName, 'High Mid', this.eqPeqMidBandX(highMidFreq, 272, 420), params.get('highmid_gain')?.value ?? 0),
      this.buildEqPeqGraphNode(eqName, 'High', 484, params.get('high_gain')?.value ?? 0),
    ];
  }

  editorEqPeqLowCutWidth(eqName: EqStageName): number {
    const lowCut = this.editorEqPeqParamMap(eqName).get('low_cut')?.value ?? 0;
    return Math.round((lowCut / 17) * 84);
  }

  editorEqPeqHighCutWidth(eqName: EqStageName): number {
    const highCut = this.editorEqPeqParamMap(eqName).get('high_cut')?.value ?? 0;
    return Math.round((highCut / 14) * 96);
  }

  editorEqPeqGainLabel(gain: number): string {
    return `${gain >= 0 ? '+' : ''}${gain} dB`;
  }

  editorEqPeqFftBars(): EqPeqFftBar[] {
    const bins = this.liveFftBinsDb();
    if (bins.length === 0) {
      return [];
    }
    const width = 512;
    const graphFloor = 88;
    const graphHeight = 76;
    const minDb = -60;
    const maxDb = 0;
    const step = width / bins.length;
    const barWidth = Math.max(2, step * 0.72);
    return bins.map((value, index) => {
      const clamped = Math.max(minDb, Math.min(maxDb, value));
      const normalized = (clamped - minDb) / (maxDb - minDb);
      const height = Math.max(1, normalized * graphHeight);
      return {
        x: (index * step) + ((step - barWidth) / 2),
        y: graphFloor - height,
        width: barWidth,
        height,
      };
    });
  }

  editorEqGe10Bands(eqName: EqStageName): EqGe10BandField[] {
    const fields = this.editorEqRawFields(eqName, 'ge10_raw');
    return fields.slice(0, EQ_GE10_BAND_LABELS.length).map((field, index) => {
      const offsetValue = field.value - 24;
      const percent = Math.max(0, Math.min(100, ((offsetValue + 24) / 48) * 100));
      return {
        id: `${eqName}-ge10-band-${index}`,
        label: EQ_GE10_BAND_LABELS[index] ?? field.label,
        offsetValue,
        percent,
      };
    });
  }

  setEditorEqGe10BandValue(eqName: EqStageName, index: number, value: string): void {
    const offset = this.clampInteger(this.parseInteger(value), -24, 24);
    this.setEditorEqRawValue(eqName, 'ge10_raw', index, `${offset + 24}`);
  }

  private editorEqPeqParamMap(eqName: EqStageName): Map<string, EqParamField> {
    return new Map(this.editorEqPeqParams(eqName).map((param) => [param.key, param]));
  }

  private buildEqPeqGraphNode(eqName: EqStageName, label: string, x: number, gain: number): EqPeqGraphNode {
    return {
      id: `${eqName}-peq-node-${label.toLowerCase().replace(/\s+/g, '-')}`,
      label,
      x,
      y: this.eqPeqGainY(gain),
      gain,
    };
  }

  private eqPeqGainY(gain: number): number {
    const clamped = this.clampInteger(gain, -20, 20);
    return 72 - ((clamped + 20) / 40) * 56;
  }

  private eqPeqMidBandX(value: number, minX: number, maxX: number): number {
    const clamped = this.clampInteger(value, 0, 27);
    return Math.round(minX + (clamped / 27) * (maxX - minX));
  }

  editorNsOn(): boolean {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const ns = this.readObject(stages, 'ns');
    return this.readBoolean(ns, 'on');
  }

  setEditorNsOn(checked: boolean): void {
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const ns = this.ensureObject(stages, 'ns');
      ns['on'] = checked;
      this.syncBooleanRawField(ns, 'raw', 0, checked);
    });
  }

  editorNsNumber(field: 'threshold' | 'release'): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const ns = this.readObject(stages, 'ns');
    return this.readNumber(ns, field);
  }

  setEditorNsNumber(field: 'threshold' | 'release', value: string): void {
    const parsed = this.parseInteger(value);
    const rawIndex = field === 'threshold' ? 1 : 2;
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const ns = this.ensureObject(stages, 'ns');
      ns[field] = parsed;
      this.syncNumericRawField(ns, 'raw', rawIndex, parsed);
    });
  }

  editorSendReturnOn(): boolean {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'send_return');
    return this.readBoolean(block, 'on');
  }

  setEditorSendReturnOn(checked: boolean): void {
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'send_return');
      block['on'] = checked;
      this.syncBooleanRawField(block, 'raw', 0, checked);
    });
  }

  editorSendReturnNumber(field: 'position' | 'mode' | 'send_level' | 'return_level'): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'send_return');
    return this.readNumber(block, field);
  }

  setEditorSendReturnNumber(field: 'position' | 'mode' | 'send_level' | 'return_level', value: string): void {
    const parsed = this.parseInteger(value);
    const rawIndexByField = { position: 1, mode: 2, send_level: 3, return_level: 4 } as const;
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'send_return');
      block[field] = parsed;
      this.syncNumericRawField(block, 'raw', rawIndexByField[field], parsed);
    });
  }

  editorSoloOn(): boolean {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'solo');
    return this.readBoolean(block, 'on');
  }

  setEditorSoloOn(checked: boolean): void {
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'solo');
      block['on'] = checked;
      this.syncBooleanRawField(block, 'raw', 0, checked);
    });
  }

  editorSoloLevel(): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'solo');
    return this.readNumber(block, 'effect_level');
  }

  setEditorSoloLevel(value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'solo');
      block['effect_level'] = parsed;
      this.syncNumericRawField(block, 'raw', 1, parsed);
    });
  }

  editorPedalFxOn(): boolean {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'pedalfx');
    return this.readBoolean(block, 'on');
  }

  setEditorPedalFxOn(checked: boolean): void {
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'pedalfx');
      block['on'] = checked;
      this.syncBooleanRawField(block, 'raw_com', 1, checked);
    });
  }

  editorPedalFxNumber(field: 'position' | 'type'): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'pedalfx');
    return this.readNumber(block, field);
  }

  setEditorPedalFxNumber(field: 'position' | 'type', value: string): void {
    const parsed = this.parseInteger(value);
    const rawIndexByField = { position: 0, type: 2 } as const;
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'pedalfx');
      block[field] = parsed;
      this.syncNumericRawField(block, 'raw_com', rawIndexByField[field], parsed);
    });
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
    const type = this.readNumber(stage, 'type');
    if (type !== null) {
      return type;
    }
    const raw = this.ensureNumericRaw(stage ?? {});
    if (raw.length > 0) {
      return raw[0];
    }
    return null;
  }

  setEditorStageType(stageName: StageName, value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const stage = this.ensureObject(stages, stageName);
      stage['type'] = parsed;
      const raw = this.ensureNumericRaw(stage);
      if (raw.length > 0) {
        raw[0] = parsed;
        stage['raw'] = raw;
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
    const params: StageParam[] = [];
    for (const schema of this.stageParamSchema(stageName)) {
      const decoded = this.readStageParamValue(stageName, raw, schema);
      if (decoded === null) {
        continue;
      }
      params.push({
        id: `${stageName}-${schema.key}`,
        key: schema.key,
        label: schema.label,
        value: decoded,
        min: schema.min,
        max: schema.max,
        control: this.stageParamControl(schema),
        offLabel: schema.offLabel ?? 'Off',
        onLabel: schema.onLabel ?? 'On',
      });
    }
    return params;
  }

  stageParamIsToggle(param: StageParam): boolean {
    return param.control === 'toggle';
  }

  stageParamToggleLabel(param: StageParam): string {
    return param.value === param.max ? param.onLabel : param.offLabel;
  }

  editorStageSchemaWarning(stageName: StageName): string | null {
    if (stageName !== 'mod' && stageName !== 'fx') {
      return null;
    }
    const type = this.editorStageType(stageName);
    if (type === null) {
      return 'No pedal type selected';
    }
    if (type < 0 || type >= FX_PARAM_SCHEMAS_BY_TYPE.length) {
      return `No schema mapped for ${this.effectTypeLabel(stageName, type)} (${type})`;
    }
    return null;
  }

  setEditorStageParam(stageName: StageName, paramKey: string, value: string | number): void {
    const schema = this.findStageParamSchema(stageName, paramKey);
    if (!schema) {
      return;
    }
    const parsed = this.clampInteger(this.parseInteger(value), schema.min, schema.max);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const stage = this.ensureObject(stages, stageName);
      const raw = this.ensureNumericRaw(stage);
      const updated = this.writeStageParamValue(stageName, raw, schema, parsed);
      if (!updated) {
        return;
      }
      stage['raw'] = raw;
      this.syncStageDerivedFields(stageName, stage);
    });
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

  displayPatchName(slot: SlotCard): string {
    if (slot.patch_name) {
      return slot.patch_name;
    }
    return 'Unsynced';
  }

  selectedAmpSlotLabel(): string {
    return this.selectedAmpSlotText();
  }

  currentCommitStateLabel(): string {
    const state = this.currentAmpCommitState();
    if (state === 'committed') {
      return 'Committed';
    }
    if (state === 'uncommitted') {
      return 'Uncommitted';
    }
    return 'Unknown';
  }

  private applySyncedSlot(slot: SlotPatchSummary): void {
    this.slots.update((current) =>
      current.map((card) => {
        if (card.slot !== slot.slot) {
          return card;
        }
        const preserveLocal = this.slotHasLocalAuthority(card);
        return {
          slot: slot.slot,
          slot_label: slot.slot_label,
          patch_name: preserveLocal ? card.patch_name : slot.patch_name,
          config_hash_sha256: preserveLocal ? card.config_hash_sha256 : slot.config_hash_sha256,
          saved_hash_sha256: preserveLocal ? card.saved_hash_sha256 : (slot.is_saved ? slot.config_hash_sha256 : ''),
          committed_hash_sha256: slot.config_hash_sha256,
          patch: preserveLocal ? card.patch : (slot.patch ?? null),
          in_sync: preserveLocal ? card.config_hash_sha256 === slot.config_hash_sha256 : slot.in_sync,
          is_saved: preserveLocal ? card.is_saved : slot.is_saved,
          synced_at: slot.synced_at,
          slot_sync_ms: slot.slot_sync_ms,
          inferred: preserveLocal ? card.inferred : false,
          match_count: preserveLocal ? card.match_count : 1,
          out_synced: preserveLocal ? card.out_synced : true,
          measured_rms_dbfs: slot.measured_rms_dbfs ?? card.measured_rms_dbfs,
          measured_peak_dbfs: slot.measured_peak_dbfs ?? card.measured_peak_dbfs,
          measured_at: slot.measured_at ?? card.measured_at,
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

  private async captureActivePatchMeasurement(slotNumber: number, durationSec: number): Promise<AudioSampleResponse> {
    const response = await fetch('/api/v1/audio/measure', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patch_hash: null,
        slot: slotNumber,
        duration_sec: durationSec,
      }),
    });
    const payload = (await response.json()) as AudioSampleResponse | { detail?: unknown };
    if (!response.ok) {
      throw new Error(`active patch sample failed: ${JSON.stringify(payload)}`);
    }
    const sample = payload as AudioSampleResponse;
    this.setSlotMeasuredRms(slotNumber, sample.rms_dbfs, sample.peak_dbfs, sample.created_at);
    await this.loadRecentAudioSamples();
    return sample;
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

  private slotHasLocalAuthority(slot: SlotCard | undefined): boolean {
    if (!slot) {
      return false;
    }
    return slot.patch !== null;
  }

  private async applyProposedPatchToSlot(slotNumber: number, proposedPatchInput: Record<string, unknown>, applyLive: boolean): Promise<void> {
    const proposedPatch = this.clonePatch(proposedPatchInput);
    proposedPatch['config_hash_sha256'] = '';
    const localProposedSnapshot = this.clonePatch(proposedPatch);
    const proposedName = this.readString(proposedPatch, 'patch_name') ?? '';
    this.slots.update((current) =>
      current.map((card) => {
        if (card.slot !== slotNumber) {
          return card;
        }
        return {
          ...card,
          patch_name: proposedName || card.patch_name,
          patch: this.clonePatch(proposedPatch),
          config_hash_sha256: '',
          saved_hash_sha256: card.saved_hash_sha256,
          in_sync: false,
          is_saved: false,
          out_synced: false,
        };
      }),
    );
    void this.recalculateLocalPatchHash(slotNumber, localProposedSnapshot);
    if (this.editorModalOpen() && this.editorSlotNumber() === slotNumber) {
      this.editorPatchDraft.set(this.clonePatch(proposedPatch));
      this.editorLiveApplyError.set('');
      this.editorLiveApplyReadbackAt.set('');
    }
    if (applyLive) {
      const response = await fetch('/api/v1/amp/current-patch/live-apply', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: proposedPatch }),
      });
      const payload = (await response.json()) as ApplyCurrentPatchResponse | { detail?: unknown };
      if (!response.ok) {
        throw new Error(`active live-apply failed: ${JSON.stringify(payload)}`);
      }
      const applied = payload as ApplyCurrentPatchResponse;
      const appliedPatch = this.clonePatch(applied.patch);
      const hash = this.readString(appliedPatch, 'config_hash_sha256') ?? '';
      this.currentAmpPatchHash.set(hash);
      this.currentAmpCommitState.set('uncommitted');
      this.slots.update((current) =>
        current.map((card) => {
          if (card.slot !== slotNumber) {
            return card;
          }
          const localPatch = this.clonePatch(card.patch ?? proposedPatch);
          localPatch['config_hash_sha256'] = hash;
          return {
            ...card,
            patch_name: proposedName || card.patch_name,
            patch: localPatch,
            config_hash_sha256: hash,
            saved_hash_sha256: card.saved_hash_sha256,
            in_sync: true,
            is_saved: Boolean(card.saved_hash_sha256) && card.saved_hash_sha256 === hash,
            out_synced: true,
          };
        }),
      );
      if (this.editorModalOpen() && this.editorSlotNumber() === slotNumber) {
        this.editorPatchDraft.set(this.clonePatch(appliedPatch));
        this.editorLiveApplyReadbackAt.set(applied.applied_at);
      }
      this.aiModalPatch.set(this.clonePatch(appliedPatch));
      this.aiModalPatchName.set(proposedName || this.aiModalPatchName());
      return;
    }
    this.aiModalPatch.set(this.clonePatch(proposedPatch));
    this.aiModalPatchName.set(proposedName || this.aiModalPatchName());
  }

  private async waitForPlayingStart(slotLabel: string): Promise<void> {
    if (!this.liveMeterConnected()) {
      throw new Error('Live meter is not connected. Auto-level requires the live meter.');
    }
    const deadlineMs = Date.now() + 60000;
    const playingThresholdDbfs = -55;
    while (Date.now() < deadlineMs) {
      const currentSelectedSlot = this.selectedAmpSlot();
      const autoSlot = this.autoLevelSlotNumber();
      if (autoSlot === null || currentSelectedSlot !== autoSlot) {
        throw new Error(`${slotLabel} is no longer the active slot.`);
      }
      const rms = this.liveRmsDbfs();
      if (rms !== null && rms > playingThresholdDbfs) {
        this.pushAutoLevelLog(`Detected playing at ${rms.toFixed(2)} dBFS on the live meter.`);
        return;
      }
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 250);
      });
    }
    throw new Error('Timed out waiting for playing to start.');
  }

  private pushAutoLevelLog(message: string): void {
    this.autoLevelLogs.update((current) => [...current, message]);
  }

  private formatAiValue(value: unknown): string {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (value && typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private async persistPatchMeasurement(
    patchHash: string,
    rmsDbfs: number,
    peakDbfs: number,
    measuredAt: string,
  ): Promise<void> {
    const response = await fetch(`/api/v1/patches/configs/${patchHash}/measurements`, {
      method: 'PATCH',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        measured_rms_dbfs: rmsDbfs,
        measured_peak_dbfs: peakDbfs,
        measured_at: measuredAt,
      }),
    });
    const payload = (await response.json()) as PatchConfigResponse | { detail?: unknown };
    if (!response.ok) {
      throw new Error(`patch measurement save failed: ${JSON.stringify(payload)}`);
    }
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

  slotSavedStatusLabel(slot: SlotCard): string {
    const state = this.ampCommittedState(slot);
    if (state === 'true') {
      return 'AMP-COMMITTED ✓';
    }
    if (state === 'false') {
      return 'AMP-COMMITTED ✗';
    }
    return 'AMP-COMMITTED ?';
  }

  isAmpCommitted(slot: SlotCard): boolean {
    return this.ampCommittedState(slot) === 'true';
  }

  ampCommittedState(slot: SlotCard): TriState {
    const currentHash = slot.config_hash_sha256;
    const committedHash = slot.committed_hash_sha256;
    if (!currentHash) {
      return slot.patch && committedHash ? 'false' : 'unknown';
    }
    if (!committedHash) {
      return 'unknown';
    }
    return currentHash === committedHash ? 'true' : 'false';
  }

  slotDbStatusLabel(slot: SlotCard): string {
    const state = this.dbState(slot);
    if (state === 'true') {
      return 'LIBRARY ✓';
    }
    if (state === 'false') {
      return 'LIBRARY ✗';
    }
    return 'LIBRARY ?';
  }

  dbState(slot: SlotCard): TriState {
    if (!slot.saved_hash_sha256) {
      return slot.patch ? 'false' : 'unknown';
    }
    if (!slot.config_hash_sha256) {
      return 'false';
    }
    return slot.config_hash_sha256 === slot.saved_hash_sha256 ? 'true' : 'false';
  }

  isLiveOnAmp(slot: SlotCard): boolean {
    return this.ampStagedState(slot) === 'true';
  }

  ampStagedState(slot: SlotCard): TriState {
    if (!slot.config_hash_sha256) {
      return slot.patch ? 'false' : 'unknown';
    }
    const currentLiveHash = this.currentAmpPatchHash();
    if (!currentLiveHash) {
      return 'unknown';
    }
    return slot.config_hash_sha256 === currentLiveHash ? 'true' : 'false';
  }

  isActiveSlot(slot: SlotCard): boolean {
    const selected = this.selectedAmpSlot();
    if (selected !== null) {
      return selected === slot.slot;
    }
    return this.isLiveOnAmp(slot);
  }

  slotLiveStatusLabel(slot: SlotCard): string {
    const state = this.ampStagedState(slot);
    if (state === 'true') {
      return 'AMP-STAGED ✓';
    }
    if (state === 'false') {
      return 'AMP-STAGED ✗';
    }
    return 'AMP-STAGED ?';
  }

  ampSummary(slot: SlotCard): string {
    const amp = this.readObject(this.readObject(slot.patch, 'amp'));
    if (!amp) {
      return 'n/a';
    }
    const gain = this.readAmpField(amp, 'gain');
    const volume = this.readAmpField(amp, 'volume');
    const bass = this.readAmpField(amp, 'bass');
    const middle = this.readAmpField(amp, 'middle');
    const treble = this.readAmpField(amp, 'treble');
    const presence = this.readAmpField(amp, 'presence');
    return `G ${this.nv(gain)} | V ${this.nv(volume)} | B/M/T/P ${this.nv(bass)}/${this.nv(middle)}/${this.nv(treble)}/${this.nv(presence)}`;
  }

  ampTypeSummary(slot: SlotCard): string {
    const amp = this.readObject(this.readObject(slot.patch, 'amp'));
    if (!amp) {
      return 'n/a';
    }
    const ampType = this.readAmpField(amp, 'amp_type');
    if (ampType === null) {
      return 'n/a';
    }
    const ampTypeIndex = Math.trunc(ampType);
    const ampTypeName =
      ampTypeIndex >= 0 && ampTypeIndex < AMP_TYPE_NAMES.length ? AMP_TYPE_NAMES[ampTypeIndex] : `Unknown (${ampTypeIndex})`;
    const preampVariation = this.readAmpField(amp, 'preamp_variation');
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

  nsSummary(slot: SlotCard): string {
    const stages = this.readObject(slot.patch, 'stages');
    const ns = this.readObject(stages, 'ns');
    if (!ns) {
      return 'n/a';
    }
    const threshold = this.readNumber(ns, 'threshold');
    const release = this.readNumber(ns, 'release');
    return `Thr ${this.nv(threshold)} | Rel ${this.nv(release)}`;
  }

  eqSummary(slot: SlotCard, eqName: 'eq1' | 'eq2'): string {
    const stages = this.readObject(slot.patch, 'stages');
    const eq = this.readObject(stages, eqName);
    if (!eq) {
      return 'n/a';
    }
    const parts: string[] = [];
    const type = this.readNumber(eq, 'type');
    const position = this.readNumber(eq, 'position');
    if (type !== null) {
      parts.push(this.eqTypeLabel(type));
    }
    if (position !== null) {
      parts.push(this.eqPositionLabel(position));
    }
    return parts.length > 0 ? parts.join(' | ') : 'n/a';
  }

  isStageOn(slot: SlotCard, stageName: string): boolean {
    const stages = this.readObject(slot.patch, 'stages');
    const stage = this.readObject(stages, stageName);
    return this.readBoolean(stage, 'on');
  }

  isNoiseSuppressorOn(slot: SlotCard): boolean {
    const stages = this.readObject(slot.patch, 'stages');
    const ns = this.readObject(stages, 'ns');
    return this.readBoolean(ns, 'on');
  }

  isEqOn(slot: SlotCard, eqName: 'eq1' | 'eq2'): boolean {
    const stages = this.readObject(slot.patch, 'stages');
    const eq = this.readObject(stages, eqName);
    return this.readBoolean(eq, 'on');
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

  private eqTypeLabel(type: number): string {
    const index = Math.max(0, Math.trunc(type));
    if (index >= 0 && index < EQ_TYPE_NAMES.length) {
      return EQ_TYPE_NAMES[index];
    }
    return `Unknown (${index})`;
  }

  private eqPositionLabel(position: number): string {
    const index = Math.max(0, Math.trunc(position));
    if (index >= 0 && index < EQ_POSITION_NAMES.length) {
      return EQ_POSITION_NAMES[index];
    }
    return `Unknown (${index})`;
  }

  private colorName(index: number): string {
    if (index === 0) {
      return 'green';
    }
    if (index === 1) {
      return 'red';
    }
    if (index === 2) {
      return 'yellow';
    }
    return `unknown(${index})`;
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

  private ensureRawArray(target: Record<string, unknown>, key: string, length: number): number[] {
    const rawUnknown = target[key];
    if (!Array.isArray(rawUnknown) || rawUnknown.length !== length) {
      const created = Array.from({ length }, () => 0);
      target[key] = created;
      return created;
    }
    return rawUnknown.map((item) => this.parseUnknownNumber(item));
  }

  private ensureAmpRaw(amp: Record<string, unknown>): number[] {
    const rawUnknown = amp['raw'];
    if (!Array.isArray(rawUnknown) || rawUnknown.length !== 10) {
      const raw = Array.from({ length: 10 }, () => 0);
      const fieldMap: Array<[string, number]> = [
        ['gain', 0],
        ['volume', 1],
        ['bass', 2],
        ['middle', 3],
        ['treble', 4],
        ['presence', 5],
        ['poweramp_variation', 6],
        ['amp_type', 7],
        ['resonance', 8],
        ['preamp_variation', 9],
      ];
      for (const [field, index] of fieldMap) {
        const value = amp[field];
        if (typeof value === 'number' && Number.isFinite(value)) {
          raw[index] = Math.trunc(value);
        }
      }
      return raw;
    }
    return rawUnknown.map((item) => this.parseUnknownNumber(item));
  }

  private syncAmpDerivedRawField(amp: Record<string, unknown>, field: string, value: number): void {
    const rawIndexByField: Record<string, number> = {
      gain: 0,
      volume: 1,
      bass: 2,
      middle: 3,
      treble: 4,
      presence: 5,
      poweramp_variation: 6,
      amp_type: 7,
      resonance: 8,
      preamp_variation: 9,
    };
    const rawIndex = rawIndexByField[field];
    if (rawIndex === undefined) {
      return;
    }
    const raw = this.ensureAmpRaw(amp);
    raw[rawIndex] = value;
    amp['raw'] = raw;
  }

  private syncAmpDerivedFields(amp: Record<string, unknown>): void {
    const raw = this.ensureAmpRaw(amp);
    if (raw.length < 10) {
      return;
    }
    amp['gain'] = raw[0];
    amp['volume'] = raw[1];
    amp['bass'] = raw[2];
    amp['middle'] = raw[3];
    amp['treble'] = raw[4];
    amp['presence'] = raw[5];
    amp['poweramp_variation'] = raw[6];
    amp['amp_type'] = raw[7];
    amp['resonance'] = raw[8];
    amp['preamp_variation'] = raw[9];
    amp['raw'] = raw;
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

  private editorNestedRawFields(path: string[], rawKey: string, idPrefix: string): RawValueField[] {
    const obj = this.readNestedObject(this.editorPatchDraft(), path);
    if (!obj) {
      return [];
    }
    const raw = obj[rawKey];
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map((item, index) => ({
      id: `${idPrefix}-${index}`,
      label: `#${index}`,
      value: this.parseUnknownNumber(item),
    }));
  }

  private setEditorNestedRawValue(path: string[], rawKey: string, index: number, value: string): void {
    const parsed = this.clampInteger(this.parseInteger(value), 0, 127);
    this.updateEditorPatch((draft) => {
      const obj = this.ensureNestedObject(draft, path);
      const rawUnknown = obj[rawKey];
      if (!Array.isArray(rawUnknown)) {
        return;
      }
      const raw = rawUnknown.map((item) => this.parseUnknownNumber(item));
      if (index < 0 || index >= raw.length) {
        return;
      }
      raw[index] = parsed;
      obj[rawKey] = raw;
    });
  }

  private readNestedObject(source: Record<string, unknown> | null, path: string[]): Record<string, unknown> | null {
    let current: Record<string, unknown> | null = source;
    for (const key of path) {
      current = this.readObject(current, key);
      if (!current) {
        return null;
      }
    }
    return current;
  }

  private ensureNestedObject(parent: Record<string, unknown>, path: string[]): Record<string, unknown> {
    let current = parent;
    for (const key of path) {
      current = this.ensureObject(current, key);
    }
    return current;
  }

  private syncNumericRawField(target: Record<string, unknown>, rawKey: string, index: number, value: number): void {
    const raw = this.ensureRawArray(target, rawKey, Math.max(index + 1, Array.isArray(target[rawKey]) ? (target[rawKey] as unknown[]).length : index + 1));
    raw[index] = value;
    target[rawKey] = raw;
  }

  private syncBooleanRawField(target: Record<string, unknown>, rawKey: string, index: number, checked: boolean): void {
    this.syncNumericRawField(target, rawKey, index, checked ? 1 : 0);
  }

  private stageParamSchema(stageName: StageName): readonly StageParamSchema[] {
    if (stageName === 'booster') {
      return BOOSTER_PARAM_SCHEMA.filter((schema) => schema.key !== 'type');
    }
    if (stageName === 'delay') {
      return DELAY_PARAM_SCHEMA.filter((schema) => schema.key !== 'type');
    }
    if (stageName === 'reverb') {
      return REVERB_PARAM_SCHEMA.filter((schema) => schema.key !== 'type');
    }
    const type = this.editorStageType(stageName);
    if (type === null || type < 0 || type >= FX_PARAM_SCHEMAS_BY_TYPE.length) {
      return [];
    }
    return FX_PARAM_SCHEMAS_BY_TYPE[type];
  }

  private findStageParamSchema(stageName: StageName, paramKey: string): StageParamSchema | null {
    return this.stageParamSchema(stageName).find((schema) => schema.key === paramKey) ?? null;
  }

  private stageParamControl(schema: StageParamSchema): ParamControlKind {
    if (schema.control) {
      return schema.control;
    }
    if (schema.size === 'int1x7' && schema.min === 0 && schema.max === 1) {
      return 'toggle';
    }
    return 'range';
  }

  private stageParamArrayIndex(stageName: StageName, schema: StageParamSchema): number {
    if (stageName === 'mod' || stageName === 'fx') {
      return schema.rawIndex;
    }
    return schema.rawIndex - 1;
  }

  private stageParamWidth(encoding: ParamEncoding): number {
    if (encoding === 'int4x4') {
      return 4;
    }
    if (encoding === 'int2x4') {
      return 2;
    }
    return 1;
  }

  private readStageParamValue(stageName: StageName, raw: number[], schema: StageParamSchema): number | null {
    const start = this.stageParamArrayIndex(stageName, schema);
    const width = this.stageParamWidth(schema.size);
    if (start < 0 || start + width > raw.length) {
      return null;
    }
    let encoded = 0;
    if (schema.size === 'int1x7') {
      encoded = raw[start];
    } else if (schema.size === 'int2x4') {
      encoded = (raw[start] << 4) | raw[start + 1];
    } else {
      encoded = (raw[start] << 12) | (raw[start + 1] << 8) | (raw[start + 2] << 4) | raw[start + 3];
    }
    return encoded - schema.offset;
  }

  private writeStageParamValue(stageName: StageName, raw: number[], schema: StageParamSchema, value: number): boolean {
    const start = this.stageParamArrayIndex(stageName, schema);
    const width = this.stageParamWidth(schema.size);
    if (start < 0 || start + width > raw.length) {
      return false;
    }
    const encoded = value + schema.offset;
    if (schema.size === 'int1x7') {
      raw[start] = encoded;
      return true;
    }
    if (schema.size === 'int2x4') {
      raw[start] = (encoded >> 4) & 0x0f;
      raw[start + 1] = encoded & 0x0f;
      return true;
    }
    raw[start] = (encoded >> 12) & 0x0f;
    raw[start + 1] = (encoded >> 8) & 0x0f;
    raw[start + 2] = (encoded >> 4) & 0x0f;
    raw[start + 3] = encoded & 0x0f;
    return true;
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

  private readAmpField(amp: Record<string, unknown> | null, field: string): number | null {
    const direct = this.readNumber(amp, field);
    if (direct !== null) {
      return direct;
    }
    if (!amp) {
      return null;
    }
    const rawIndexByField: Record<string, number> = {
      gain: 0,
      volume: 1,
      bass: 2,
      middle: 3,
      treble: 4,
      presence: 5,
      poweramp_variation: 6,
      amp_type: 7,
      resonance: 8,
      preamp_variation: 9,
    };
    const rawIndex = rawIndexByField[field];
    if (rawIndex === undefined) {
      return null;
    }
    const raw = amp['raw'];
    if (!Array.isArray(raw) || rawIndex >= raw.length) {
      return null;
    }
    return this.parseUnknownNumber(raw[rawIndex]);
  }

  private readEditorAmpRawIndex(rawIndex: number): number | null {
    const amp = this.readObject(this.editorPatchDraft(), 'amp');
    const raw = this.readAmpRaw(amp);
    if (raw === null || rawIndex < 0 || rawIndex >= raw.length) {
      return null;
    }
    return raw[rawIndex];
  }

  private readAmpRaw(amp: Record<string, unknown> | null): number[] | null {
    if (!amp) {
      return null;
    }
    const raw = amp['raw'];
    if (!Array.isArray(raw)) {
      return null;
    }
    return raw.map((item) => this.parseUnknownNumber(item));
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

  private parseInteger(value: string | number): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? Math.trunc(value) : 0;
    }
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return parsed;
  }

  private clampInteger(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private clonePatch(patch: Record<string, unknown>): Record<string, unknown> {
    return JSON.parse(JSON.stringify(patch)) as Record<string, unknown>;
  }

  private updateEditorPatch(mutator: (draft: Record<string, unknown>) => void): void {
    let nextDraftSnapshot: Record<string, unknown> | null = null;
    let slotNumberForHash: number | null = null;
    this.editorPatchDraft.update((current) => {
      if (current === null) {
        return null;
      }
      const next = this.clonePatch(current);
      mutator(next);
      next['config_hash_sha256'] = '';
      const slotNumber = this.editorSlotNumber();
      slotNumberForHash = slotNumber;
      nextDraftSnapshot = this.clonePatch(next);
      this.autoSelectToneBlocksFromBase(nextDraftSnapshot, false);
      if (slotNumber !== null) {
        this.slots.update((cards) =>
          cards.map((card) => {
            if (card.slot !== slotNumber) {
              return card;
            }
            return {
              ...card,
              patch_name: this.readString(next, 'patch_name') ?? card.patch_name,
              config_hash_sha256: '',
              patch: this.clonePatch(next),
              in_sync: false,
              out_synced: false,
              is_saved: false,
            };
          }),
        );
      }
      return next;
    });
    this.editorLiveApplyError.set('');
    this.editorLiveApplyReadbackAt.set('');
    if (nextDraftSnapshot && slotNumberForHash !== null) {
      void this.recalculateLocalPatchHash(slotNumberForHash, nextDraftSnapshot);
    }
    this.scheduleEditorLiveApply();
  }

  private async recalculateLocalPatchHash(slotNumber: number, patch: Record<string, unknown>): Promise<void> {
    const fingerprint = this.patchFingerprint(patch);
    const hash = await this.computePatchHash(patch);
    this.slots.update((current) =>
      current.map((card) => {
        if (card.slot !== slotNumber) {
          return card;
        }
        const currentPatch = card.patch;
        if (!currentPatch || this.patchFingerprint(currentPatch) !== fingerprint) {
          return card;
        }
        const nextPatch = this.clonePatch(currentPatch);
        nextPatch['config_hash_sha256'] = hash;
        return {
          ...card,
          patch: nextPatch,
          config_hash_sha256: hash,
          is_saved: Boolean(card.saved_hash_sha256) && card.saved_hash_sha256 === hash,
        };
      }),
    );
    if (this.editorModalOpen() && this.editorSlotNumber() === slotNumber) {
      const draft = this.editorPatchDraft();
      if (draft && this.patchFingerprint(draft) === fingerprint) {
        const nextDraft = this.clonePatch(draft);
        nextDraft['config_hash_sha256'] = hash;
        this.editorPatchDraft.set(nextDraft);
      }
    }
  }

  private scheduleEditorLiveApply(): void {
    if (!this.editorModalOpen() || !this.editorLiveApplyAvailable()) {
      return;
    }
    const draftFingerprint = this.editorDraftFingerprint();
    if (draftFingerprint === '') {
      return;
    }
    this.editorLiveApplyQueuedFingerprint = draftFingerprint;
    if (this.editorLiveApplyInFlight) {
      return;
    }
    void this.flushEditorLiveApplyQueue();
  }

  private async flushEditorLiveApplyQueue(): Promise<void> {
    if (!this.editorModalOpen() || !this.editorLiveApplyAvailable()) {
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
    if (!this.editorLiveApplyAvailable() || draft === null || this.editorLiveApplyInFlight) {
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
    const draftSnapshot = this.clonePatch(draft);
    this.editorLiveApplyInFlight = true;
    this.editorLiveApplyPending.set(true);
    this.editorLiveApplyReadbackAt.set('');
    try {
      const response = await fetch('/api/v1/amp/current-patch/live-apply', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: draftSnapshot }),
      });
      const payload = (await response.json()) as ApplyCurrentPatchResponse | { detail?: unknown };
      if (!response.ok) {
        this.editorLiveApplyError.set(typeof payload === 'object' ? JSON.stringify(payload) : 'live apply failed');
        return;
      }
      const applied = payload as ApplyCurrentPatchResponse;
      const stagedFingerprint = expectedFingerprint;
      this.editorLiveApplyLastAppliedFingerprint = stagedFingerprint;
      if (this.editorLiveApplyQueuedFingerprint === expectedFingerprint) {
        this.editorLiveApplyQueuedFingerprint = null;
      }
      const patchName = this.readString(draftSnapshot, 'patch_name') ?? '';
      const hash = this.readString(applied.patch, 'config_hash_sha256') ?? '';
      const targetSlotNumber = slotNumber ?? this.selectedAmpSlot();
      if (targetSlotNumber !== null) {
        this.slots.update((current) =>
          current.map((card) => {
            if (card.slot !== targetSlotNumber) {
              return card;
            }
            return {
              ...card,
              patch_name: patchName || card.patch_name,
              patch: this.clonePatch(draftSnapshot),
              config_hash_sha256: hash,
              in_sync: true,
              out_synced: true,
              is_saved: false,
            };
          }),
        );
      }
      this.currentAmpPatchHash.set(hash);
      this.currentAmpCommitState.set('uncommitted');
      this.editorLiveApplyReadbackAt.set(applied.applied_at);
      void this.refreshLivePatchStatus();
    } catch (error: unknown) {
      this.editorLiveApplyError.set(String(error));
    } finally {
      this.editorLiveApplyInFlight = false;
      this.editorLiveApplyPending.set(false);
      if (this.editorLiveApplyQueuedFingerprint && this.editorLiveApplyQueuedFingerprint !== this.editorLiveApplyLastAppliedFingerprint) {
        void this.flushEditorLiveApplyQueue();
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

  editorLiveApplyHasApplied(): boolean {
    return this.editorLiveApplyReadbackAt() !== '' && !this.editorIsModified();
  }

  private patchFingerprint(patch: Record<string, unknown>): string {
    const normalized = this.clonePatch(patch);
    delete normalized['config_hash_sha256'];
    return this.stableStringify(normalized);
  }

  private async computePatchHash(patch: Record<string, unknown>): Promise<string> {
    if (!globalThis.crypto?.subtle) {
      throw new Error('Web Crypto API is unavailable; cannot compute patch hash.');
    }
    const canonical = this.canonicalBlobForHash(patch);
    const bytes = new TextEncoder().encode(canonical);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('');
  }

  private canonicalBlobForHash(snapshot: Record<string, unknown>): string {
    return this.stableStringify(this.canonicalizeSnapshotForHash(snapshot));
  }

  private canonicalizeSnapshotForHash(snapshot: Record<string, unknown>): Record<string, unknown> {
    const canonical: Record<string, unknown> = {};

    const routing = this.readObject(snapshot, 'routing');
    if (routing) {
      const routingOut: Record<string, unknown> = {};
      for (const key of ['chain_pattern', 'cabinet_resonance', 'master_key'] as const) {
        if (routing[key] !== undefined) {
          routingOut[key] = routing[key];
        }
      }
      if (Object.keys(routingOut).length > 0) {
        canonical['routing'] = routingOut;
      }
    }

    const colors = this.readObject(snapshot, 'colors');
    if (colors) {
      const colorsOut: Record<string, unknown> = {};
      for (const stage of ['booster', 'mod', 'fx', 'delay', 'reverb'] as const) {
        const stageColor = this.readObject(colors, stage);
        if (stageColor && stageColor['index'] !== undefined) {
          colorsOut[stage] = { index: stageColor['index'] };
        }
      }
      if (Object.keys(colorsOut).length > 0) {
        canonical['colors'] = colorsOut;
      }
    }

    const amp = this.readObject(snapshot, 'amp');
    if (amp) {
      const ampOut: Record<string, unknown> = {};
      if (Array.isArray(amp['raw'])) {
        ampOut['raw'] = amp['raw'];
      } else {
        for (const key of ['gain', 'volume', 'bass', 'middle', 'treble', 'presence', 'poweramp_variation', 'amp_type', 'resonance', 'preamp_variation'] as const) {
          if (amp[key] !== undefined) {
            ampOut[key] = amp[key];
          }
        }
      }
      if (Object.keys(ampOut).length > 0) {
        canonical['amp'] = ampOut;
      }
    }

    const stages = this.readObject(snapshot, 'stages');
    if (stages) {
      const stagesOut: Record<string, unknown> = {};

      const booster = this.readObject(stages, 'booster');
      if (booster) {
        const out: Record<string, unknown> = {};
        if (booster['on'] !== undefined) {
          out['on'] = booster['on'];
        }
        if (Array.isArray(booster['variants_raw'])) {
          out['variants_raw'] = booster['variants_raw'];
        } else if (Array.isArray(booster['raw'])) {
          out['raw'] = booster['raw'];
        }
        if (Object.keys(out).length > 0) {
          stagesOut['booster'] = out;
        }
      }

      for (const stageName of ['mod', 'fx'] as const) {
        const stage = this.readObject(stages, stageName);
        if (!stage) {
          continue;
        }
        const out: Record<string, unknown> = {};
        if (stage['on'] !== undefined) {
          out['on'] = stage['on'];
        }
        if (Array.isArray(stage['variants_raw'])) {
          out['variants_raw'] = stage['variants_raw'];
        } else if (Array.isArray(stage['raw'])) {
          out['raw'] = stage['raw'];
        }
        if (Object.keys(out).length > 0) {
          stagesOut[stageName] = out;
        }
      }

      const delay = this.readObject(stages, 'delay');
      if (delay) {
        const out: Record<string, unknown> = {};
        if (delay['on'] !== undefined) {
          out['on'] = delay['on'];
        }
        if (delay['delay2_on'] !== undefined) {
          out['delay2_on'] = delay['delay2_on'];
        }
        if (Array.isArray(delay['variants_raw'])) {
          out['variants_raw'] = delay['variants_raw'];
        } else if (Array.isArray(delay['raw'])) {
          out['raw'] = delay['raw'];
        }
        if (Array.isArray(delay['variants2_raw'])) {
          out['variants2_raw'] = delay['variants2_raw'];
        } else if (Array.isArray(delay['delay2_raw'])) {
          out['delay2_raw'] = delay['delay2_raw'];
        }
        if (Object.keys(out).length > 0) {
          stagesOut['delay'] = out;
        }
      }

      const reverb = this.readObject(stages, 'reverb');
      if (reverb) {
        const out: Record<string, unknown> = {};
        if (reverb['on'] !== undefined) {
          out['on'] = reverb['on'];
        }
        if (Array.isArray(reverb['variants_raw'])) {
          out['variants_raw'] = reverb['variants_raw'];
        } else if (Array.isArray(reverb['raw'])) {
          out['raw'] = reverb['raw'];
        }
        if (Object.keys(out).length > 0) {
          stagesOut['reverb'] = out;
        }
      }

      for (const eqName of ['eq1', 'eq2'] as const) {
        const eq = this.readObject(stages, eqName);
        if (!eq) {
          continue;
        }
        const out: Record<string, unknown> = {};
        for (const key of ['position', 'on', 'type'] as const) {
          if (eq[key] !== undefined) {
            out[key] = eq[key];
          }
        }
        if (Array.isArray(eq['peq_raw'])) {
          out['peq_raw'] = eq['peq_raw'];
        }
        if (Array.isArray(eq['ge10_raw'])) {
          out['ge10_raw'] = eq['ge10_raw'];
        }
        if (Object.keys(out).length > 0) {
          stagesOut[eqName] = out;
        }
      }

      const ns = this.readObject(stages, 'ns');
      if (ns) {
        const out: Record<string, unknown> = {};
        if (Array.isArray(ns['raw'])) {
          out['raw'] = ns['raw'];
        } else {
          for (const key of ['on', 'threshold', 'release'] as const) {
            if (ns[key] !== undefined) {
              out[key] = ns[key];
            }
          }
        }
        if (Object.keys(out).length > 0) {
          stagesOut['ns'] = out;
        }
      }

      const sendReturn = this.readObject(stages, 'send_return');
      if (sendReturn) {
        const out: Record<string, unknown> = {};
        if (Array.isArray(sendReturn['raw'])) {
          out['raw'] = sendReturn['raw'];
        } else {
          for (const key of ['on', 'position', 'mode', 'send_level', 'return_level'] as const) {
            if (sendReturn[key] !== undefined) {
              out[key] = sendReturn[key];
            }
          }
        }
        if (Object.keys(out).length > 0) {
          stagesOut['send_return'] = out;
        }
      }

      const solo = this.readObject(stages, 'solo');
      if (solo) {
        const out: Record<string, unknown> = {};
        if (Array.isArray(solo['raw'])) {
          out['raw'] = solo['raw'];
        } else {
          for (const key of ['on', 'effect_level'] as const) {
            if (solo[key] !== undefined) {
              out[key] = solo[key];
            }
          }
        }
        if (Object.keys(out).length > 0) {
          stagesOut['solo'] = out;
        }
      }

      const pedalfx = this.readObject(stages, 'pedalfx');
      if (pedalfx) {
        const out: Record<string, unknown> = {};
        if (Array.isArray(pedalfx['raw_com'])) {
          out['raw_com'] = pedalfx['raw_com'];
        }
        if (Array.isArray(pedalfx['raw'])) {
          out['raw'] = pedalfx['raw'];
        }
        if (Object.keys(out).length === 0) {
          for (const key of ['position', 'on', 'type'] as const) {
            if (pedalfx[key] !== undefined) {
              out[key] = pedalfx[key];
            }
          }
        }
        if (Object.keys(out).length > 0) {
          stagesOut['pedalfx'] = out;
        }
      }

      if (Object.keys(stagesOut).length > 0) {
        canonical['stages'] = stagesOut;
      }
    }

    return canonical;
  }

  private toneSetSlotAssignmentKey(setId: number, slot: number): string {
    return `${setId}:${slot}`;
  }

  setLabelForSlot(slot: number): string {
    return slot <= 4 ? `A:${slot}` : `B:${slot - 4}`;
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

  livePatchBaseName(): string {
    return this.toneBasePatchObjectName().trim() || 'None';
  }

  livePatchSelectedBlocksSummary(): string {
    const blocks = this.selectedToneBlocks();
    if (this.liveEditorShowAllBlocks()) {
      return blocks.length > 0 ? `${blocks.join(', ')} · editor showing all blocks` : 'Editor showing all blocks';
    }
    if (blocks.length === 0) {
      return 'No blocks selected yet';
    }
    return blocks.join(', ');
  }

  canResetEditorBlockToBase(block: string): boolean {
    const basePatch = this.toneBasePatchSnapshot();
    const currentPatch = this.editorPatchDraft();
    if (!basePatch || !currentPatch) {
      return false;
    }
    const baseBlock = this.comparablePatchBlock(basePatch, block);
    const currentBlock = this.comparablePatchBlock(currentPatch, block);
    return this.stableStringify(baseBlock) !== this.stableStringify(currentBlock);
  }

  resetEditorBlockToBase(block: string): void {
    const basePatch = this.toneBasePatchSnapshot();
    if (!basePatch) {
      return;
    }
    this.updateEditorPatch((draft) => {
      this.applyBaseBlockToDraft(draft, basePatch, block);
    });
  }

  private autoSelectToneBlocksFromBase(currentPatch: Record<string, unknown>, replaceSelection: boolean): void {
    const basePatch = this.toneBasePatchSnapshot();
    if (!basePatch) {
      return;
    }
    const next: Record<string, boolean> = {};
    for (const block of this.toneBlockOptions()) {
      const baseBlock = this.comparablePatchBlock(basePatch, block);
      const currentBlock = this.comparablePatchBlock(currentPatch, block);
      next[block] = this.stableStringify(baseBlock) !== this.stableStringify(currentBlock);
    }
    if (replaceSelection) {
      this.toneSelectedBlocks.set(next);
      return;
    }
    this.toneSelectedBlocks.update((current) => {
      const merged = { ...current };
      for (const block of this.toneBlockOptions()) {
        merged[block] = Boolean(current[block]) || next[block];
      }
      return merged;
    });
  }

  private applyBaseBlockToDraft(draft: Record<string, unknown>, basePatch: Record<string, unknown>, block: string): void {
    if (block === 'routing' || block === 'amp') {
      const baseDirect = this.readObject(basePatch, block);
      if (baseDirect) {
        draft[block] = this.clonePatch(baseDirect);
      } else {
        delete draft[block];
      }
      return;
    }

    const baseStages = this.readObject(basePatch, 'stages');
    const baseStage = this.readObject(baseStages, block);
    const draftStages = this.readObject(draft, 'stages');
    if (baseStage) {
      const ensuredStages = this.ensureObject(draft, 'stages');
      ensuredStages[block] = this.clonePatch(baseStage);
    } else if (draftStages) {
      delete draftStages[block];
      if (Object.keys(draftStages).length === 0) {
        delete draft['stages'];
      }
    }

    if (block === 'booster' || block === 'mod' || block === 'fx' || block === 'delay' || block === 'reverb') {
      const baseColors = this.readObject(basePatch, 'colors');
      const baseColor = this.readObject(baseColors, block);
      const draftColors = this.readObject(draft, 'colors');
      if (baseColor) {
        const ensuredColors = this.ensureObject(draft, 'colors');
        ensuredColors[block] = this.clonePatch(baseColor);
      } else if (draftColors) {
        delete draftColors[block];
        if (Object.keys(draftColors).length === 0) {
          delete draft['colors'];
        }
      }
    }
  }

  private comparablePatchBlock(source: Record<string, unknown> | null, block: string): unknown {
    if (!source) {
      return null;
    }
    if (block === 'routing' || block === 'amp') {
      const direct = this.readObject(source, block);
      return direct ? this.clonePatch(direct) : null;
    }
    const out: Record<string, unknown> = {};
    const direct = this.readObject(source, block);
    if (direct) {
      Object.assign(out, this.clonePatch(direct));
    }
    const stages = this.readObject(source, 'stages');
    const stage = this.readObject(stages, block);
    if (stage) {
      Object.assign(out, this.clonePatch(stage));
    }
    if (block === 'booster' || block === 'mod' || block === 'fx' || block === 'delay' || block === 'reverb') {
      const colors = this.readObject(source, 'colors');
      const colorStage = this.readObject(colors, block);
      if (colorStage) {
        out['color'] = this.clonePatch(colorStage);
      }
    }
    return Object.keys(out).length > 0 ? out : null;
  }

  private applyLivePatchStatus(payload: LivePatchResponse): void {
    this.livePatchSnapshot.set(this.clonePatch(payload.patch_json));
    this.livePatchConfirmedAt.set(payload.amp_confirmed_at || '');
    this.livePatchSourceType.set(payload.source_type || '');
    this.livePatchExactDbMatch.set(payload.exact_patch_object ?? null);
    this.livePatchExactDbName.set(payload.exact_patch_object?.name || '');
    this.livePatchExactSlotMatch.set(payload.exact_amp_slot ?? null);
    this.livePatchExactSlotText.set(
      payload.exact_amp_slot ? `${payload.exact_amp_slot.slot} · ${payload.exact_amp_slot.patch_name || 'Unnamed'}` : '',
    );
    this.livePatchPartialDbMatches.set(Array.isArray(payload.partial_patch_objects) ? payload.partial_patch_objects : []);
    this.livePatchPartialSlotMatches.set(Array.isArray(payload.partial_amp_slots) ? payload.partial_amp_slots : []);
    this.livePatchPartialDbCount.set(Array.isArray(payload.partial_patch_objects) ? payload.partial_patch_objects.length : 0);
    this.livePatchPartialSlotCount.set(Array.isArray(payload.partial_amp_slots) ? payload.partial_amp_slots.length : 0);
    this.currentAmpPatchHash.set(payload.compat_hash_sha256 || this.currentAmpPatchHash());
    if (payload.active_slot !== null) {
      this.selectedAmpSlot.set(payload.active_slot);
      this.selectedAmpSlotText.set(payload.active_slot <= 4 ? `A:${payload.active_slot}` : `B:${payload.active_slot - 4}`);
    }
  }

  private refreshCurrentCommitStateFromKnownState(): void {
    const selectedSlot = this.selectedAmpSlot();
    const currentHash = this.currentAmpPatchHash();
    if (selectedSlot === null) {
      this.currentAmpCommitState.set('unknown');
      return;
    }
    const selectedCard = this.slots().find((card) => card.slot === selectedSlot) ?? null;
    const selectedHash = selectedCard?.committed_hash_sha256 ?? '';
    if (!currentHash || !selectedHash) {
      this.currentAmpCommitState.set('unknown');
      return;
    }
    this.currentAmpCommitState.set(currentHash === selectedHash ? 'committed' : 'uncommitted');
  }

  private async refreshActiveSlot(): Promise<void> {
    if (this.activeSlotPollInFlight) {
      return;
    }
    this.activeSlotPollInFlight = true;
    try {
      const response = await fetch('/api/v1/amp/current-slot', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as ActiveSlotResponse | { detail?: unknown };
      if (!response.ok) {
        return;
      }
      const active = payload as ActiveSlotResponse;
      const previousSlot = this.selectedAmpSlot();
      if (previousSlot !== null && active.slot !== previousSlot) {
        this.currentAmpPatchHash.set('');
        this.currentAmpCommitState.set('unknown');
      }
      this.selectedAmpSlot.set(active.slot);
      this.selectedAmpSlotText.set(active.slot_label || 'n/a');
      this.refreshCurrentCommitStateFromKnownState();
    } catch {
      // Active-slot probe is informational; leave current UI state unchanged on failure.
    } finally {
      this.activeSlotPollInFlight = false;
    }
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
      return 'Stage To AMP';
    }
    if (value === 'sync_slot') {
      return 'Activate Slot';
    }
    if (value === 'write_slot') {
      return 'Commit To AMP';
    }
    if (value === 'full_sync_slots') {
      return 'Full Sync Slots';
    }
    return value;
  }
}
