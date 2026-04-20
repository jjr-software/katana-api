import { Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { NgbModal, NgbModalModule, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PatchSummaryComponent } from './patch-summary.component';
import { DashboardStickyPanelComponent, type DashboardStickyPanelViewModel } from './dashboard-sticky-panel.component';
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
const GAFC_EXP1_FUNCTION_OPTIONS: ReadonlyArray<ValueOption> = [
  { value: 0, label: 'Volume' },
  { value: 1, label: 'Foot Volume' },
  { value: 2, label: 'Pedal FX' },
  { value: 3, label: 'Pedal FX + FV' },
  { value: 4, label: 'Booster' },
  { value: 5, label: 'Mod' },
  { value: 6, label: 'FX' },
  { value: 7, label: 'Delay' },
  { value: 8, label: 'Delay 2' },
  { value: 9, label: 'Reverb' },
];
interface GafcExp1AssignmentSpec {
  key: string;
  label: string;
  detailMax: number;
  valueMax: number;
  minOffset: number;
  minSize: number;
  maxOffset: number;
  maxSize: number;
}

interface GafcExp1AssignmentRow extends GafcExp1AssignmentSpec {
  detail: number;
  min: number;
  max: number;
}

const GAFC_EXP1_ASSIGNMENT_RAW_LENGTH = 49;
const GAFC_EXP1_ASSIGNMENT_SCHEMA: ReadonlyArray<GafcExp1AssignmentSpec> = [
  { key: 'booster', label: 'Booster', detailMax: 7, valueMax: 127, minOffset: 0, minSize: 1, maxOffset: 0, maxSize: 1 },
  { key: 'delay', label: 'Delay', detailMax: 7, valueMax: 2000, minOffset: 1, minSize: 4, maxOffset: 1, maxSize: 4 },
  { key: 'reverb', label: 'Reverb', detailMax: 7, valueMax: 500, minOffset: 5, minSize: 4, maxOffset: 5, maxSize: 4 },
  { key: 'chorus', label: 'Chorus', detailMax: 10, valueMax: 127, minOffset: 9, minSize: 1, maxOffset: 9, maxSize: 1 },
  { key: 'flanger', label: 'Flanger', detailMax: 7, valueMax: 127, minOffset: 10, minSize: 1, maxOffset: 10, maxSize: 1 },
  { key: 'phaser', label: 'Phaser', detailMax: 7, valueMax: 127, minOffset: 11, minSize: 1, maxOffset: 11, maxSize: 1 },
  { key: 'univ', label: 'Uni-V', detailMax: 3, valueMax: 127, minOffset: 12, minSize: 1, maxOffset: 12, maxSize: 1 },
  { key: 'tremolo', label: 'Tremolo', detailMax: 4, valueMax: 127, minOffset: 13, minSize: 1, maxOffset: 13, maxSize: 1 },
  { key: 'vibrato', label: 'Vibrato', detailMax: 3, valueMax: 127, minOffset: 14, minSize: 1, maxOffset: 14, maxSize: 1 },
  { key: 'rotary', label: 'Rotary', detailMax: 3, valueMax: 127, minOffset: 15, minSize: 1, maxOffset: 15, maxSize: 1 },
  { key: 'ring_mod', label: 'Ring Mod', detailMax: 3, valueMax: 127, minOffset: 16, minSize: 1, maxOffset: 16, maxSize: 1 },
  { key: 'slow_gear', label: 'Slow Gear', detailMax: 3, valueMax: 127, minOffset: 17, minSize: 1, maxOffset: 17, maxSize: 1 },
  { key: 'slicer', label: 'Slicer', detailMax: 4, valueMax: 127, minOffset: 18, minSize: 1, maxOffset: 18, maxSize: 1 },
  { key: 'comp', label: 'Comp', detailMax: 4, valueMax: 127, minOffset: 19, minSize: 1, maxOffset: 19, maxSize: 1 },
  { key: 'limiter', label: 'Limiter', detailMax: 5, valueMax: 127, minOffset: 20, minSize: 1, maxOffset: 20, maxSize: 1 },
  { key: 't_wah', label: 'T.Wah', detailMax: 5, valueMax: 127, minOffset: 21, minSize: 1, maxOffset: 21, maxSize: 1 },
  { key: 'auto_wah', label: 'Auto Wah', detailMax: 6, valueMax: 127, minOffset: 22, minSize: 1, maxOffset: 22, maxSize: 1 },
  { key: 'pedal_wah', label: 'Pedal Wah', detailMax: 5, valueMax: 127, minOffset: 23, minSize: 1, maxOffset: 23, maxSize: 1 },
  { key: 'geq', label: 'GEQ', detailMax: 11, valueMax: 127, minOffset: 24, minSize: 1, maxOffset: 24, maxSize: 1 },
  { key: 'peq', label: 'PEQ', detailMax: 11, valueMax: 127, minOffset: 25, minSize: 1, maxOffset: 25, maxSize: 1 },
  { key: 'guitar_sim', label: 'Guitar Sim', detailMax: 4, valueMax: 127, minOffset: 26, minSize: 1, maxOffset: 26, maxSize: 1 },
  { key: 'ac_guitar_sim', label: 'AC.Guitar Sim', detailMax: 4, valueMax: 127, minOffset: 27, minSize: 1, maxOffset: 27, maxSize: 1 },
  { key: 'ac_processor', label: 'AC.Processor', detailMax: 6, valueMax: 127, minOffset: 28, minSize: 1, maxOffset: 28, maxSize: 1 },
  { key: 'wave_synth', label: 'Wave Synth', detailMax: 7, valueMax: 127, minOffset: 29, minSize: 1, maxOffset: 29, maxSize: 1 },
  { key: 'octave', label: 'Octave', detailMax: 2, valueMax: 127, minOffset: 30, minSize: 1, maxOffset: 30, maxSize: 1 },
  { key: 'pitch_shifter', label: 'Pitch Shifter', detailMax: 10, valueMax: 300, minOffset: 31, minSize: 4, maxOffset: 31, maxSize: 4 },
  { key: 'harmonist', label: 'Harmonist', detailMax: 9, valueMax: 300, minOffset: 35, minSize: 4, maxOffset: 35, maxSize: 4 },
  { key: 'humanizer', label: 'Humanizer', detailMax: 5, valueMax: 127, minOffset: 39, minSize: 1, maxOffset: 39, maxSize: 1 },
  { key: 'phase_90e', label: 'Phase 90E', detailMax: 1, valueMax: 127, minOffset: 40, minSize: 1, maxOffset: 40, maxSize: 1 },
  { key: 'flanger_117e', label: 'Flanger 117E', detailMax: 4, valueMax: 127, minOffset: 41, minSize: 1, maxOffset: 41, maxSize: 1 },
  { key: 'wah_95e', label: 'Wah 95E', detailMax: 5, valueMax: 127, minOffset: 42, minSize: 1, maxOffset: 42, maxSize: 1 },
  { key: 'dc_30', label: 'DC-30', detailMax: 6, valueMax: 600, minOffset: 43, minSize: 4, maxOffset: 43, maxSize: 4 },
  { key: 'heavy_oct', label: 'Heavy Oct', detailMax: 3, valueMax: 127, minOffset: 47, minSize: 1, maxOffset: 47, maxSize: 1 },
  { key: 'pedal_bend', label: 'Pedal Bend', detailMax: 4, valueMax: 127, minOffset: 48, minSize: 1, maxOffset: 48, maxSize: 1 },
] as const;
const GAFC_EXP1_FUNCTION_ROW_KEY: ReadonlyArray<string | null> = [
  null,
  null,
  null,
  null,
  'booster',
  null,
  null,
  'delay',
  'delay',
  'reverb',
];
const GAFC_EXP1_FUNCTION_ROW_NOTE: ReadonlyArray<string | null> = [
  'Volume is handled by the live amp block, not here.',
  'Foot volume is handled by the live amp block, not here.',
  'Pedal FX settings live in the Pedal FX block below.',
  'Pedal FX + FV is a split control mode; the actual Pedal FX controls live in the Pedal FX block.',
  null,
  'Mod has no separate assignment row here; use the Mod block below.',
  'FX has no separate assignment row here; use the FX block below.',
  null,
  'Delay 2 shares the Delay assignment row here.',
  null,
];
const EQ_TYPE_NAMES = ['Parametric EQ', 'GE-10'];
const EQ_POSITION_NAMES = ['Input', 'Post Amp'];
const EQ_GE10_BAND_LABELS = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k', 'Level'];
const PEDAL_FX_POSITION_OPTIONS: ReadonlyArray<ValueOption> = [
  { value: 0, label: 'Input' },
  { value: 1, label: 'Post Amp' },
];
const PEDAL_FX_TYPE_OPTIONS: ReadonlyArray<ValueOption> = [
  { value: 0, label: 'Pedal Wah' },
  { value: 1, label: 'Pedal Bend' },
  { value: 2, label: 'WAH 95E' },
];
const PEDAL_FX_WAH_TYPE_OPTIONS: ReadonlyArray<ValueOption> = [
  { value: 0, label: 'Cry Wah' },
  { value: 1, label: 'VO Wah' },
  { value: 2, label: 'Fat Wah' },
  { value: 3, label: 'Light Wah' },
  { value: 4, label: '7-String Wah' },
  { value: 5, label: 'Reso Wah' },
];
const EQ_PEQ_LOW_CUT_LABELS = ['Flat', '20 Hz', '25 Hz', '31.5 Hz', '40 Hz', '50 Hz', '63 Hz', '80 Hz', '100 Hz', '125 Hz', '160 Hz', '200 Hz', '250 Hz', '315 Hz', '400 Hz', '500 Hz', '630 Hz', '800 Hz'];
const EQ_PEQ_MID_FREQ_LABELS = ['20 Hz', '25 Hz', '31.5 Hz', '40 Hz', '50 Hz', '63 Hz', '80 Hz', '100 Hz', '125 Hz', '160 Hz', '200 Hz', '250 Hz', '315 Hz', '400 Hz', '500 Hz', '630 Hz', '800 Hz', '1.00 kHz', '1.25 kHz', '1.60 kHz', '2.00 kHz', '2.50 kHz', '3.15 kHz', '4.00 kHz', '5.00 kHz', '6.30 kHz', '8.00 kHz', '10.0 kHz'];
const EQ_PEQ_Q_LABELS = ['0.5', '1', '2', '4', '8', '16'];
const EQ_PEQ_HIGH_CUT_LABELS = ['630 Hz', '800 Hz', '1.00 kHz', '1.25 kHz', '1.60 kHz', '2.00 kHz', '2.50 kHz', '3.15 kHz', '4.00 kHz', '5.00 kHz', '6.30 kHz', '8.00 kHz', '10.0 kHz', '12.5 kHz', 'Flat'];

interface ValueOption {
  value: number;
  label: string;
}

interface LiveMeterBandRow {
  id: string;
  label: string;
  rangeLabel: string;
  currentDbfs: number | null;
  maxDbfs: number | null;
  currentPercent: number;
  maxPercent: number;
}

interface LiveRmsHistoryBar {
  x: number;
  y: number;
  width: number;
  height: number;
  tone: 'above' | 'below';
}

interface LineOutCustomState {
  mic_type: number;
  mic_distance: number;
  mic_position: number;
  ambience_pre_delay: number;
  ambience_level: number;
}

interface LineOutState {
  select: number;
  air_feel_mode: number;
  enabled: boolean;
  lineout_1: LineOutCustomState;
  lineout_2: LineOutCustomState;
}

interface LineOutResponse {
  read_at: string;
  lineout_com: LineOutSystemState;
  lineout_1: LineOutCustomState;
  lineout_2: LineOutCustomState;
}

interface LineOutWriteRequest {
  lineout_com: LineOutSystemState;
  lineout_1: LineOutCustomState;
  lineout_2: LineOutCustomState;
}

interface LineOutSystemState {
  select: number;
  air_feel_mode: number;
  enabled: boolean;
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
const EQ_PEQ_PARAM_GROUPS: ReadonlyArray<{ id: string; label: string; keys: readonly string[] }> = [
  { id: 'filters', label: 'Filters', keys: ['low_cut', 'high_cut'] },
  { id: 'low', label: 'Low', keys: ['low_gain'] },
  { id: 'low-mid', label: 'Low Mid', keys: ['lowmid_freq', 'lowmid_q', 'lowmid_gain'] },
  { id: 'high-mid', label: 'High Mid', keys: ['highmid_freq', 'highmid_q', 'highmid_gain'] },
  { id: 'high', label: 'High', keys: ['high_gain'] },
  { id: 'level', label: 'Output', keys: ['level'] },
];
const LINE_OUT_AIR_FEEL_OPTIONS: ReadonlyArray<ValueOption> = [
  { value: 0, label: 'REC' },
  { value: 1, label: 'LIVE' },
  { value: 2, label: 'BLEND' },
];
const LINE_OUT_MIC_TYPE_OPTIONS: ReadonlyArray<ValueOption> = buildValueOptions(['DYN57', 'DYN421', 'CND451', 'CND87', 'RBN121']);
const LINE_OUT_DISTANCE_OPTIONS: ReadonlyArray<ValueOption> = Array.from({ length: 21 }, (_, value) => ({ value, label: `${value} cm` }));
const LINE_OUT_POSITION_OPTIONS: ReadonlyArray<ValueOption> = Array.from({ length: 11 }, (_, value) => ({ value, label: `${value} cm` }));
const LIVE_FFT_MIN_FREQ_HZ = 31;
const LIVE_FFT_MAX_FREQ_HZ = 20_000;
const LIVE_METER_DEFAULT_RATE = 48_000;
const LIVE_GE10_BAND_CENTERS_HZ = [31, 62, 125, 250, 500, 1_000, 2_000, 4_000, 8_000, 16_000] as const;
const LIVE_FFT_BANDS = buildLiveMeterBands(LIVE_GE10_BAND_CENTERS_HZ, EQ_GE10_BAND_LABELS.slice(0, LIVE_GE10_BAND_CENTERS_HZ.length));
const DEFAULT_TARGET_RMS_DBFS = -35.0;
const LIVE_TOTAL_LEVEL_ZOOM_DB = 3.0;
const LIVE_METER_WINDOW_SEC = 2.0;
const LIVE_RMS_HISTORY_LIMIT = 240;
const LIVE_TOTAL_LEVEL_GRAPH_WIDTH = 1000;
const LIVE_TOTAL_LEVEL_GRAPH_HEIGHT = 72;
const LIVE_TOTAL_LEVEL_BAR_STEP = 14;
const LIVE_TOTAL_LEVEL_BAR_WIDTH = 10;
const AUTO_LEVEL_TOLERANCE_DB = 0.4;
const AUTO_LEVEL_MEASURE_SEC = 2.0;
const AUTO_LEVEL_MAX_ITERS = 8;
const AUTO_LEVEL_STEP_SCALE = 2.0;
const AUTO_LEVEL_MAX_STEP = 8;
const GLOBAL_NORMALIZE_TARGET_STORAGE_KEY = 'katana.globalNormalizeTargetRms';
const TONE_BLOCK_OPTIONS = ['routing', 'amp', 'booster', 'mod', 'fx', 'delay', 'reverb', 'eq1', 'eq2', 'ns', 'send_return', 'solo', 'pedalfx', 'gafc_exp1'] as const;
type ToneBlockKey = (typeof TONE_BLOCK_OPTIONS)[number];

interface ToneBlockDisplay {
  label: string;
  glyph: string;
  subtitle: string;
}

function buildLiveMeterBands(centersHz: readonly number[], labels: readonly string[]): Array<{ id: string; label: string; minHz: number; maxHz: number }> {
  return centersHz.map((centerHz, index) => {
    const previousCenterHz = index > 0 ? centersHz[index - 1] : centerHz;
    const nextCenterHz = index < centersHz.length - 1 ? centersHz[index + 1] : centerHz;
    const minHz = index === 0 ? centerHz : Math.sqrt(previousCenterHz * centerHz);
    const maxHz = index === centersHz.length - 1 ? LIVE_FFT_MAX_FREQ_HZ : Math.sqrt(centerHz * nextCenterHz);
    return {
      id: `ge10-${index}`,
      label: labels[index] ?? `${centerHz}`,
      minHz,
      maxHz,
    };
  });
}

const TONE_BLOCK_DISPLAY: Record<ToneBlockKey, ToneBlockDisplay> = {
  routing: { label: 'Routing', glyph: 'RT', subtitle: 'Chain order and cab routing' },
  amp: { label: 'Amp', glyph: 'AMP', subtitle: 'Gain, tone stack, and volume' },
  booster: { label: 'Booster', glyph: 'BST', subtitle: 'Boost and drive stage' },
  mod: { label: 'Mod', glyph: 'MOD', subtitle: 'Modulation block' },
  fx: { label: 'FX', glyph: 'FX', subtitle: 'Secondary effects block' },
  delay: { label: 'Delay', glyph: 'DLY', subtitle: 'Delay block' },
  reverb: { label: 'Reverb', glyph: 'RVB', subtitle: 'Space and decay' },
  eq1: { label: 'EQ1', glyph: 'EQ1', subtitle: 'First EQ block' },
  eq2: { label: 'EQ2', glyph: 'EQ2', subtitle: 'Second EQ block' },
  ns: { label: 'Noise Suppressor', glyph: 'NS', subtitle: 'Noise gate and threshold' },
  send_return: { label: 'Send/Return', glyph: 'S/R', subtitle: 'External loop levels' },
  solo: { label: 'Solo', glyph: 'SO', subtitle: 'Solo lift and level' },
  pedalfx: { label: 'Pedal FX', glyph: 'PFX', subtitle: 'Pedal effect stage' },
  gafc_exp1: { label: 'GA-FC EXP1', glyph: 'EXP1', subtitle: 'Patch-level expression assignment' },
} as const;

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

interface AiPreviewPatchObjectCandidate {
  name: string;
  description: string;
  patch_json: Record<string, unknown>;
  blocks: string[];
}

interface AiPreviewPatchObjectsResponse {
  summary: string;
  candidates: AiPreviewPatchObjectCandidate[];
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

interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'success' | 'danger';
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

interface EqParamGroup {
  id: string;
  label: string;
  params: EqParamField[];
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
type ModalKey = 'toneSave' | 'toneDesigner' | 'toneSet' | 'patchSamples' | 'toneLibrary' | 'ai' | 'autoLevel' | 'ampStateConflict';

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
  imports: [DashboardStickyPanelComponent, PatchSummaryComponent, NgbModalModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  @ViewChild('toneSaveModalTpl') private toneSaveModalTpl?: TemplateRef<unknown>;
  @ViewChild('toneDesignerModalTpl') private toneDesignerModalTpl?: TemplateRef<unknown>;
  @ViewChild('toneSetModalTpl') private toneSetModalTpl?: TemplateRef<unknown>;
  @ViewChild('patchSamplesModalTpl') private patchSamplesModalTpl?: TemplateRef<unknown>;
  @ViewChild('toneLibraryModalTpl') private toneLibraryModalTpl?: TemplateRef<unknown>;
  @ViewChild('aiModalTpl') private aiModalTpl?: TemplateRef<unknown>;
  @ViewChild('autoLevelModalTpl') private autoLevelModalTpl?: TemplateRef<unknown>;
  @ViewChild('ampStateConflictModalTpl') private ampStateConflictModalTpl?: TemplateRef<unknown>;
  private readonly modalService = inject(NgbModal);
  private readonly ngZone = inject(NgZone);
  private readonly modalRefs: Partial<Record<ModalKey, NgbModalRef>> = {};

  currentPage = signal<'dashboard' | 'lineout' | 'samples'>(this.resolvePageFromPath());
  status = signal('Idle');
  responseJson = signal('');
  slots = signal<SlotCard[]>(defaultSlotCards());
  selectedAmpSlot = signal<number | null>(null);
  selectedAmpSlotText = signal('n/a');
  currentAmpPatchHash = signal('');
  currentAmpCommitState = signal<'unknown' | 'committed' | 'uncommitted'>('unknown');
  livePatchSourceType = signal('');
  livePatchExactDbName = signal('');
  livePatchExactSlotText = signal('');
  livePatchPartialDbCount = signal(0);
  livePatchPartialSlotCount = signal(0);
  livePatchExactDbMatch = signal<{ id: number; name: string } | null>(null);
  livePatchPartialDbMatches = signal<Array<{ id: number; name: string }>>([]);
  livePatchExactSlotMatch = signal<{ slot: number; patch_name: string } | null>(null);
  livePatchPartialSlotMatches = signal<Array<{ slot: number; patch_name: string }>>([]);
  toasts = signal<ToastMessage[]>([]);
  globalNormalizeTargetRms = signal(DEFAULT_TARGET_RMS_DBFS.toFixed(2));
  liveRmsDbfs = signal<number | null>(null);
  liveRmsMaxDbfs = signal<number | null>(null);
  liveRmsHistory = signal<number[]>([]);
  liveFftBinsDb = signal<number[]>([]);
  liveMeterRate = signal(LIVE_METER_DEFAULT_RATE);
  liveFrequencyBandMaxDbfs = signal<Array<number | null>>([]);
  liveMeterAt = signal('');
  liveMeterConnected = signal(false);
  lineOutState = signal<LineOutResponse | null>(null);
  lineOutDraft = signal<LineOutState>(this.defaultLineOutState());
  lineOutReadAt = signal('');
  lineOutLoading = signal(false);
  lineOutSaving = signal(false);
  lineOutError = signal('');
  readonly lineOutAirFeelOptions = LINE_OUT_AIR_FEEL_OPTIONS;
  readonly lineOutMicTypeOptions = LINE_OUT_MIC_TYPE_OPTIONS;
  readonly lineOutDistanceOptions = LINE_OUT_DISTANCE_OPTIONS;
  readonly lineOutPositionOptions = LINE_OUT_POSITION_OPTIONS;
  recentSamples = signal<AudioSampleResponse[]>([]);
  isMeasuringActivePatch = signal(false);
  measureCountdownSec = signal(0);
  busyActions = signal<Record<string, boolean>>({});
  queuePollHandle: ReturnType<typeof setInterval> | null = null;
  activeSlotPollHandle: ReturnType<typeof setInterval> | null = null;
  liveMeterSource: EventSource | null = null;
  liveMeterReconnectHandle: ReturnType<typeof setTimeout> | null = null;
  patchSamplesModalTitle = signal('');
  patchSamplesRows = signal<AudioSampleResponse[]>([]);
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
  autoLevelSlotNumber = signal<number | null>(null);
  autoLevelSlotLabel = signal('');
  autoLevelPatchName = signal('');
  autoLevelTargetRms = signal('');
  autoLevelCurrentRms = signal<number | null>(null);
  autoLevelIteration = signal(0);
  autoLevelState = signal<'idle' | 'waiting' | 'measuring' | 'adjusting' | 'succeeded' | 'failed'>('idle');
  autoLevelRunning = signal(false);
  autoLevelMatchBoosterBypass = signal(true);
  autoLevelLogs = signal<string[]>([]);
  ampStateConflictPreviousSlotLabel = signal('');
  ampStateConflictCurrentSlotLabel = signal('');
  ampStateConflictDetectedAt = signal('');
  editorModalOpen = signal(false);
  editorSlotNumber = signal<number | null>(null);
  editorSlotLabel = signal('');
  editorPatchDraft = signal<Record<string, unknown> | null>(null);
  editorTargetIsActive = signal(false);
  editorLiveApplyPending = signal(false);
  editorLiveApplyError = signal('');
  editorLiveApplyReadbackAt = signal('');
  editorLiveApplyInFlight = false;
  editorLiveApplyLastAppliedFingerprint = '';
  editorLiveApplyQueuedFingerprint: string | null = null;
  livePatchSnapshot = signal<Record<string, unknown> | null>(null);
  tonePatchObjects = signal<TonePatchObjectResponse[]>([]);
  toneSets = signal<TonePatchObjectSetResponse[]>([]);
  toneSaveName = signal('');
  toneSaveDescription = signal('');
  toneAiPrompt = signal('Refine the current editor patch or generate distinct sparse candidates around the target sound. Keep the results audibly useful for quick auditioning.');
  toneAiMode = signal<'refine' | 'ideas' | 'set'>('refine');
  toneAiSetName = signal('');
  toneAiDescription = signal('');
  toneAiCount = signal('8');
  toneAiNamePrefix = signal('');
  toneAiPreviewSummary = signal('');
  toneAiPreviewCandidate = signal<AiPreviewPatchObjectCandidate | null>(null);
  toneSelectedBlocks = signal<Record<string, boolean>>({ amp: true, booster: true, eq1: true });
  toneSaveBlocks = signal<Record<string, boolean>>({});
  toneLoadedPatchObjectId = signal('');
  toneLoadedPatchName = signal('');
  toneLoadedPatchSnapshot = signal<Record<string, unknown> | null>(null);
  tonePatchQuery = signal('');
  toneHighlightedPatchObjectId = signal<number | null>(null);
  toneManualSetName = signal('');
  toneManualSetDescription = signal('');
  toneManualSetSlots = signal<Record<number, string>>({});
  toneSetSlotAssignments = signal<Record<string, string>>({});
  private activeSlotPollInFlight = false;
  private liveMeterShouldRun = false;
  private toastCounter = 0;
  private readonly toastTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private lastStatusToast = '';
  private queueJobStatusById = new Map<string, QueueJobSummary['status']>();
  private queueNotificationsInitialized = false;
  readonly stickyPanelVm = computed<DashboardStickyPanelViewModel>(() => ({
    testAmpLabel: this.headerActionLabel('test-amp-connection', 'Test Amp Connection', 'Testing...'),
    testAmpDisabled: this.isActionBusy('test-amp-connection'),
    syncLivePatchLabel: this.headerActionLabel('sync-live-patch', 'Sync Live Patch', 'Syncing...'),
    syncLivePatchDisabled: this.isActionBusy('sync-live-patch'),
    reapplyLabel: this.headerActionLabel('reapply-current-settings', 'Reapply settings to amp', 'Reapplying...'),
    reapplyDisabled: this.isActionBusy('reapply-current-settings') || !this.canReapplyCurrentSettingsToAmp(),
    storeToAmpLabel: this.headerActionLabel('persist-live-patch', 'Store to Amp', 'Storing...'),
    storeToAmpDisabled: this.isActionBusy('persist-live-patch') || !this.canPersistLivePatchToAmp(),
    loadPatchLabel: 'Load Patch',
    saveCurrentSettingsLabel: 'Save Current Settings',
    aiDesignerLabel: 'AI Designer',
    clearLabel: 'Clear',
    currentSlotLabel: this.selectedAmpSlotLabel(),
    patchName: this.currentSettingsPatchName(),
    liveAmpName: this.livePatchExactDbName().trim() || 'n/a',
    ampSlotSavedName: this.selectedAmpSlotSavedPatchName(),
  }));
  private readonly onPopState = (): void => {
    const page = this.resolvePageFromPath();
    this.currentPage.set(page);
    if (page === 'lineout') {
      void this.loadLineOutState();
    }
    if (page === 'samples') {
      void this.loadRecentAudioSamples();
    }
  };

  private openModal(key: ModalKey, template: TemplateRef<unknown> | undefined, options: NgbModalOptions = {}): void {
    if (!template) {
      this.status.set('Modal template is not ready yet.');
      return;
    }
    this.closeModal(key);
    const modalRef = this.modalService.open(template, {
      centered: true,
      scrollable: true,
      ...options,
    });
    this.modalRefs[key] = modalRef;
    modalRef.result.finally(() => {
      if (this.modalRefs[key] === modalRef) {
        delete this.modalRefs[key];
      }
    }).catch(() => undefined);
  }

  private closeModal(key: ModalKey): void {
    const modalRef = this.modalRefs[key];
    if (!modalRef) {
      return;
    }
    modalRef.close();
    delete this.modalRefs[key];
  }

  constructor() {
    effect(() => {
      const message = this.status();
      if (!message || message === 'Idle' || message === this.lastStatusToast) {
        return;
      }
      this.lastStatusToast = message;
      this.pushToast(message, this.toastToneForStatus(message));
    });
  }

  ngOnInit(): void {
    window.addEventListener('popstate', this.onPopState);
    this.loadGlobalNormalizeTargetRms();
    void this.refreshQueueState();
    void this.loadRecentAudioSamples();
    void this.loadToneLabData();
    if (this.isLineOutPage()) {
    void this.loadLineOutState();
    }
    void this.refreshActiveSlot();
    void this.refreshLivePatchStatus();
    void this.bootstrapLivePatchEditor();
    this.ngZone.runOutsideAngular(() => {
      this.queuePollHandle = setInterval(() => {
        void this.refreshQueueState();
      }, 1000);
      this.activeSlotPollHandle = setInterval(() => {
        void this.refreshActiveSlot();
      }, 1500);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.onPopState);
    this.modalService.dismissAll();
    if (this.queuePollHandle !== null) {
      clearInterval(this.queuePollHandle);
      this.queuePollHandle = null;
    }
    if (this.activeSlotPollHandle !== null) {
      clearInterval(this.activeSlotPollHandle);
      this.activeSlotPollHandle = null;
    }
    for (const timer of this.toastTimers.values()) {
      clearTimeout(timer);
    }
    this.toastTimers.clear();
    this.shutdownLiveMeter();
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

  async syncLivePatch(): Promise<boolean> {
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
        return false;
      }
      this.applyLivePatchStatus(payload as LivePatchResponse);
      this.loadLivePatchIntoEditorState(payload as LivePatchResponse, false, true);
      this.status.set('Live Patch synced');
      return true;
    } catch (error: unknown) {
      this.status.set('Live Patch sync failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
      return false;
    } finally {
      this.setActionBusy('sync-live-patch', false);
    }
  }

  canPersistLivePatchToAmp(): boolean {
    return this.livePatchSnapshot() !== null && this.selectedAmpSlot() !== null;
  }

  canReapplyCurrentSettingsToAmp(): boolean {
    return this.editorPatchDraft() !== null && this.editorLiveApplyAvailable();
  }

  async reapplyCurrentSettingsToAmp(): Promise<void> {
    const actionKey = 'reapply-current-settings';
    this.setActionBusy(actionKey, true);
    this.status.set('Reapplying current settings to amp...');
    this.responseJson.set('');
    try {
      const applied = await this.applyEditorPatchLive(this.editorDraftFingerprint(), true);
      if (!applied) {
        this.status.set('Reapply current settings failed');
        return;
      }
      this.status.set('Current settings reapplied to amp');
    } catch (error: unknown) {
      this.status.set('Reapply current settings failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async persistLivePatchToAmp(): Promise<void> {
    const slotNumber = this.selectedAmpSlot();
    if (slotNumber === null) {
      this.status.set('Sync Live Patch first so the active slot is known.');
      return;
    }
    if (this.livePatchSnapshot() === null) {
      this.status.set('Load Live Patch first before persisting it to amp.');
      return;
    }

    const actionKey = 'persist-live-patch';
    this.setActionBusy(actionKey, true);
    this.status.set(`Storing full patch to ${this.selectedAmpSlotLabel()}...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/live-patch/store-to-slot', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: slotNumber }),
      });
      const payload = (await response.json()) as LivePatchResponse | { detail?: unknown };
      if (!response.ok || !('patch_json' in payload)) {
        this.status.set('Live Patch persistence failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }

      const persisted = payload as LivePatchResponse;
      this.applyLivePatchStatus(persisted);

      let synced: SlotSyncResponse | null = null;
      let refreshError: string | null = null;
      try {
        synced = await this.syncSlotForMeasurement(slotNumber);
        this.applySyncedSlot(synced.slot);
        this.selectedAmpSlot.set(synced.slot.slot);
        this.selectedAmpSlotText.set(synced.slot.slot_label);
        this.currentAmpPatchHash.set(synced.slot.config_hash_sha256 || '');
        this.refreshCurrentCommitStateFromKnownState();
      } catch (syncError: unknown) {
        refreshError = String(syncError);
      }

      if (refreshError) {
        this.status.set(`Stored full patch to ${this.selectedAmpSlotLabel()}, but refresh failed`);
        this.responseJson.set(
          JSON.stringify(
            {
              live_patch: persisted,
              refresh_error: refreshError,
            },
            null,
            2,
          ),
        );
      } else {
        this.status.set(`Stored full patch to ${this.selectedAmpSlotLabel()}`);
        this.responseJson.set(
          JSON.stringify(
            {
              live_patch: persisted,
              slot: synced,
            },
            null,
            2,
          ),
        );
      }
    } catch (error: unknown) {
      this.status.set('Live Patch persistence failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async openLiveEditor(): Promise<void> {
    this.status.set('Loading current Live Patch from amp...');
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/live-patch/sync', {
        method: 'POST',
        cache: 'no-store',
      });
      const payload = (await response.json()) as LivePatchResponse | { detail?: unknown };
      if (!response.ok || !('patch_json' in payload)) {
        this.status.set('Failed to load current Live Patch from amp.');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const live = payload as LivePatchResponse;
      this.applyLivePatchStatus(live);
      this.loadLivePatchIntoEditorState(live, false, true);
      this.status.set('Loaded current Live Patch from amp');
    } catch (error: unknown) {
      this.status.set('Failed to load current Live Patch from amp.');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    }
  }

  async applyGuiStateAfterAmpChange(): Promise<void> {
    const actionKey = 'amp-state-conflict-apply';
    this.setActionBusy(actionKey, true);
    this.status.set('Re-applying GUI state to amp live...');
    try {
      const applied = await this.applyEditorPatchLive(this.editorDraftFingerprint(), true);
      if (!applied) {
        this.status.set('GUI to amp apply failed');
        return;
      }
      this.status.set('GUI state re-applied live to amp');
      this.closeAmpStateConflictModal();
    } finally {
      this.setActionBusy(actionKey, false);
    }
  }

  async readAmpStateAfterAmpChange(): Promise<void> {
    const actionKey = 'amp-state-conflict-read';
    this.setActionBusy(actionKey, true);
    try {
      const synced = await this.syncLivePatch();
      if (!synced) {
        return;
      }
      this.closeAmpStateConflictModal();
    } finally {
      this.setActionBusy(actionKey, false);
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

  private loadLivePatchIntoEditorState(live: LivePatchResponse, replaceLoadedPatch: boolean, resetScopeToAll: boolean = false): void {
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
    this.editorLiveApplyLastAppliedFingerprint = this.patchFingerprint(draft);
    this.editorLiveApplyQueuedFingerprint = null;
    this.editorLiveApplyInFlight = false;
    this.editorLiveApplyPending.set(false);
    this.editorLiveApplyError.set('');
    this.editorLiveApplyReadbackAt.set('');
    if (resetScopeToAll) {
      this.resetLivePatchSelectionScopeToAll();
    }
    this.editorModalOpen.set(true);
    if (replaceLoadedPatch && this.toneLoadedPatchSnapshot() === null) {
      this.setToneBlocksFromPatch(draft, true);
    }
  }

  toneBlockOptions(): readonly string[] {
    return TONE_BLOCK_OPTIONS;
  }

  toneBlockDisplay(block: string): ToneBlockDisplay {
    return TONE_BLOCK_DISPLAY[block as ToneBlockKey] ?? {
      label: block,
      glyph: block.slice(0, 3).toUpperCase(),
      subtitle: '',
    };
  }

  toneBlockControlId(scope: 'live' | 'save' | 'ai', block: string): string {
    return `tone-block-${scope}-${block}`;
  }

  openToneSaveModal(): void {
    this.setToneSaveBlocksFromNames(this.defaultToneSaveBlocks(), true);
    const currentName = this.readString(this.editorPatchDraft(), 'patch_name') ?? this.toneLoadedPatchName();
    if (!this.toneSaveName().trim() && currentName) {
      this.toneSaveName.set(currentName);
    }
    this.openModal('toneSave', this.toneSaveModalTpl, { size: 'xl' });
  }

  closeToneSaveModal(): void {
    this.closeModal('toneSave');
  }

  openToneDesignerModal(): void {
    this.toneAiMode.set('refine');
    this.clearToneAiPreview();
    this.openModal('toneDesigner', this.toneDesignerModalTpl, { size: 'xl' });
  }

  closeToneDesignerModal(): void {
    this.clearToneAiPreview();
    this.closeModal('toneDesigner');
  }

  async openToneLibraryModal(): Promise<void> {
    await this.loadTonePatchObjects();
    this.openModal('toneLibrary', this.toneLibraryModalTpl, { size: 'xl', scrollable: true });
  }

  closeToneLibraryModal(): void {
    this.closeModal('toneLibrary');
  }

  setToneAiMode(value: 'refine' | 'ideas' | 'set'): void {
    this.clearToneAiPreview();
    this.toneAiMode.set(value);
  }

  openToneSetModal(): void {
    this.openModal('toneSet', this.toneSetModalTpl, { size: 'xl' });
  }

  closeToneSetModal(): void {
    this.closeModal('toneSet');
  }

  isToneBlockSelected(block: string): boolean {
    return Boolean(this.toneSelectedBlocks()[block]);
  }

  setToneBlockSelected(block: string, checked: boolean): void {
    this.toneSelectedBlocks.update((current) => ({ ...current, [block]: checked }));
  }

  isToneSaveBlockIncluded(block: string): boolean {
    return Boolean(this.toneSaveBlocks()[block]);
  }

  setToneSaveBlockIncluded(block: string, checked: boolean): void {
    this.toneSaveBlocks.update((current) => ({ ...current, [block]: checked }));
  }

  private setToneSaveBlocksFromNames(blocks: readonly string[], replaceSelection: boolean): void {
    const selected = new Set(blocks.filter((block) => this.toneBlockOptions().includes(block)));
    const next: Record<string, boolean> = {};
    for (const block of this.toneBlockOptions()) {
      next[block] = selected.has(block);
    }
    if (replaceSelection) {
      this.toneSaveBlocks.set(next);
      return;
    }
    this.toneSaveBlocks.update((current) => {
      const merged = { ...current };
      for (const block of this.toneBlockOptions()) {
        merged[block] = Boolean(current[block]) || next[block];
      }
      return merged;
    });
  }

  private setToneSaveBlocksFromPatch(source: Record<string, unknown> | null, replaceSelection: boolean): void {
    const next: Record<string, boolean> = {};
    for (const block of this.toneBlockOptions()) {
      next[block] = this.patchDefinesBlock(source, block);
    }
    if (replaceSelection) {
      this.toneSaveBlocks.set(next);
      return;
    }
    this.toneSaveBlocks.update((current) => {
      const merged = { ...current };
      for (const block of this.toneBlockOptions()) {
        merged[block] = Boolean(current[block]) || next[block];
      }
      return merged;
    });
  }

  selectAllLiveEditorBlocks(): void {
    this.setToneBlocksFromNames(this.toneBlockOptions(), true);
  }

  selectNoneLiveEditorBlocks(): void {
    this.setToneBlocksFromNames([], true);
  }

  selectedToneBlocks(): string[] {
    return this.toneBlockOptions().filter((block) => this.isToneBlockSelected(block));
  }

  saveToneBlocks(): string[] {
    return this.toneBlockOptions().filter((block) => this.isToneSaveBlockIncluded(block));
  }

  private defaultToneSaveBlocks(): string[] {
    return this.toneBlockOptions().filter((block) => this.isToneBlockSelected(block) || this.editorBlockIsOn(block));
  }

  private editorBlockIsOn(block: string): boolean {
    switch (block as ToneBlockKey) {
      case 'booster':
      case 'mod':
      case 'fx':
      case 'delay':
      case 'reverb':
        return this.editorStageOn(block as StageName);
      case 'eq1':
      case 'eq2':
        return this.editorEqOn(block as EqStageName);
      case 'ns':
        return this.editorNsOn();
      case 'send_return':
        return this.editorSendReturnOn();
      case 'solo':
        return this.editorSoloOn();
      case 'pedalfx':
        return this.editorPedalFxOn();
      default:
        return false;
    }
  }

  editorBlockEnabledLabel(block: string): 'On' | 'Off' | null {
    switch (block as ToneBlockKey) {
      case 'booster':
      case 'mod':
      case 'fx':
      case 'delay':
      case 'reverb': {
        return this.editorStageOn(block as StageName) ? 'On' : 'Off';
      }
      case 'eq1':
      case 'eq2': {
        return this.editorEqOn(block as EqStageName) ? 'On' : 'Off';
      }
      case 'ns':
        return this.editorNsOn() ? 'On' : 'Off';
      case 'send_return':
        return this.editorSendReturnOn() ? 'On' : 'Off';
      case 'solo':
        return this.editorSoloOn() ? 'On' : 'Off';
      case 'pedalfx':
        return this.editorPedalFxOn() ? 'On' : 'Off';
      default:
        return null;
    }
  }

  liveEditorShowsBlock(block: string): boolean {
    return this.isToneBlockSelected(block);
  }

  liveEditorShowsAnyBlocks(blocks: readonly string[]): boolean {
    return blocks.some((block) => this.isToneBlockSelected(block));
  }

  setToneSaveName(value: string): void {
    this.toneSaveName.set(value);
  }

  setToneSaveDescription(value: string): void {
    this.toneSaveDescription.set(value);
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

  toneAiPreviewJson(): string {
    const preview = this.toneAiPreviewCandidate();
    if (!preview) {
      return '';
    }
    return JSON.stringify(preview.patch_json, null, 2);
  }

  setTonePatchQuery(value: string): void {
    this.tonePatchQuery.set(value);
  }

  clearTonePatchFilters(): void {
    this.tonePatchQuery.set('');
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
    await Promise.all([this.loadTonePatchObjects(), this.loadToneSets()]);
  }

  async loadTonePatchObjects(): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (this.tonePatchQuery().trim()) {
        params.set('q', this.tonePatchQuery().trim());
      }
      const suffix = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/v1/patch-objects${suffix}`, { method: 'GET', cache: 'no-store' });
      const payload = (await response.json()) as TonePatchObjectResponse[] | { detail?: unknown };
      if (!response.ok || !Array.isArray(payload)) {
        return;
      }
      this.tonePatchObjects.set(payload as TonePatchObjectResponse[]);
      this.syncSelectedPatchFromExactMatch();
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

  async saveGuiStateAsTonePatchObject(): Promise<void> {
    const name = this.toneSaveName().trim();
    const blocks = this.saveToneBlocks();
    const editorPatch = this.editorPatchDraft();
    if (!name) {
      this.status.set('Tone save requires a name.');
      return;
    }
    if (blocks.length === 0) {
      this.status.set('Include at least one block before saving.');
      return;
    }
    if (!editorPatch) {
      this.status.set('Load GUI state first before saving it.');
      return;
    }
    this.setActionBusy('tone-save-gui', true);
    this.status.set(`Saving GUI state as ${name}...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/patch-objects/save-from-patch', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: this.toneSaveDescription(),
          patch_json: editorPatch,
          blocks,
          source_type: 'manual',
        }),
      });
      const payload = (await response.json()) as TonePatchObjectResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set('GUI state save failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const saved = payload as TonePatchObjectResponse;
      this.toneSaveName.set('');
      this.toneSaveDescription.set('');
      this.closeToneSaveModal();
      await this.loadTonePatchObjects();
      this.status.set(`Saved GUI state as ${name}`);
      this.responseJson.set(JSON.stringify(saved, null, 2));
    } catch (error: unknown) {
      this.status.set('GUI state save failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-save-gui', false);
    }
  }

  async saveFullLiveAsTonePatchObject(): Promise<void> {
    const name = this.toneSaveName().trim();
    if (!name) {
      this.status.set('Tone save requires a name.');
      return;
    }
    this.setActionBusy('tone-save-full', true);
    this.status.set(`Storing full amp patch as ${name}...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/patch-objects/save-from-amp', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: this.toneSaveDescription(),
          source_type: 'manual',
        }),
      });
      const payload = (await response.json()) as TonePatchObjectResponse | { detail?: unknown };
      if (!response.ok) {
        this.status.set('Full patch store failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const saved = payload as TonePatchObjectResponse;
      this.toneSaveName.set('');
      this.toneSaveDescription.set('');
      this.closeToneSaveModal();
      await this.loadTonePatchObjects();
      await this.refreshLivePatchStatus();
      this.status.set(`Stored full amp patch as ${name}`);
      this.responseJson.set(JSON.stringify(saved, null, 2));
    } catch (error: unknown) {
      this.status.set('Full patch store failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-save-full', false);
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
      this.status.set('Select at least one patch before creating a set.');
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
      this.closeToneSetModal();
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
      this.status.set(`Select a patch before updating ${toneSet.name} slot ${slot}.`);
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

  async focusTonePatchObject(match: { id: number; name: string }): Promise<void> {
    this.tonePatchQuery.set(match.name);
    this.toneHighlightedPatchObjectId.set(match.id);
    await this.openToneLibraryModal();
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
    const name = window.prompt('Duplicate patch as:', `${patchObject.name} Copy`);
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
      this.selectSavedPatch(patchObject);
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
      this.closeToneDesignerModal();
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
      this.status.set('AI patch generation requires a prompt.');
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
    this.status.set('Generating AI patches...');
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
        this.status.set('AI patch generation failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      await this.loadTonePatchObjects();
      this.closeToneDesignerModal();
      this.status.set(`Generated ${payload.length} AI patch${payload.length === 1 ? '' : 'es'}`);
      this.responseJson.set(JSON.stringify(payload, null, 2));
    } catch (error: unknown) {
      this.status.set('AI patch generation failed');
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
    const currentName = this.livePatchExactDbName().trim() || this.toneLoadedPatchName().trim() || 'Live Patch';
    this.setActionBusy('tone-ai-refine', true);
    this.status.set(`Previewing AI refinement for ${currentName}...`);
    this.responseJson.set('');
    try {
      const response = await fetch('/api/v1/ai/preview/patch-objects', {
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
      const payload = (await response.json()) as AiPreviewPatchObjectsResponse | { detail?: unknown };
      if (!response.ok || !('candidates' in payload) || !Array.isArray(payload.candidates) || payload.candidates.length === 0) {
        this.status.set('AI refinement failed');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const preview = payload as AiPreviewPatchObjectsResponse;
      this.toneAiPreviewSummary.set(preview.summary || '');
      this.toneAiPreviewCandidate.set(preview.candidates[0] ?? null);
      this.status.set(`AI refinement preview ready for ${currentName}`);
      this.responseJson.set(JSON.stringify(preview, null, 2));
    } catch (error: unknown) {
      this.status.set('AI refinement failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-ai-refine', false);
    }
  }

  async approveToneAiRefinement(): Promise<void> {
    const preview = this.toneAiPreviewCandidate();
    if (!preview) {
      this.status.set('No AI refinement preview is ready.');
      return;
    }
    this.setActionBusy('tone-ai-approve', true);
    this.status.set(`Approving AI refinement ${preview.name}...`);
    this.responseJson.set('');
    try {
      const createResponse = await fetch('/api/v1/patch-objects', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: preview.name,
          description: preview.description,
          patch_json: preview.patch_json,
          source_type: 'ai',
          source_prompt: this.toneAiPrompt().trim() || null,
        }),
      });
      const createPayload = (await createResponse.json()) as TonePatchObjectResponse | { detail?: unknown };
      if (!createResponse.ok || !('id' in createPayload)) {
        this.status.set('AI refinement approval failed');
        this.responseJson.set(JSON.stringify(createPayload, null, 2));
        return;
      }
      const created = createPayload as TonePatchObjectResponse;
      this.toneHighlightedPatchObjectId.set(created.id);
      await this.loadTonePatchObjects();
      this.clearToneAiPreview();
      this.closeToneDesignerModal();
      await this.applyTonePatchObjectToLive(created);
      this.status.set(`Approved AI refinement ${created.name} and applied it live`);
      this.responseJson.set(JSON.stringify(created, null, 2));
    } catch (error: unknown) {
      this.status.set('AI refinement approval failed');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.setActionBusy('tone-ai-approve', false);
    }
  }

  rejectToneAiRefinement(): void {
    this.clearToneAiPreview();
    this.status.set('AI refinement rejected');
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
      this.toneHighlightedPatchObjectId.set(created.id);
      await this.loadTonePatchObjects();
      this.status.set(`Kept ${slot.slot_label} as ${trimmed}`);
      this.responseJson.set(JSON.stringify(created, null, 2));
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

  setGlobalNormalizeTargetRms(value: string): void {
    this.globalNormalizeTargetRms.set(value);
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
      this.openModal('patchSamples', this.patchSamplesModalTpl, { size: 'lg' });
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
      this.openModal('patchSamples', this.patchSamplesModalTpl, { size: 'lg' });
      this.status.set(`Loaded samples for ${patchObject.name}`);
    } catch (error: unknown) {
      this.status.set(`Failed loading samples for ${patchObject.name}`);
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    }
  }

  closePatchSamplesModal(): void {
    this.closeModal('patchSamples');
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
    this.openModal('ai', this.aiModalTpl, { size: 'xl' });
  }

  openVolumeNormalizeModal(slot: SlotCard): void {
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
    const globalTarget = Number.parseFloat(this.globalNormalizeTargetRms());
    if (Number.isFinite(globalTarget)) {
      this.autoLevelTargetRms.set(globalTarget.toFixed(2));
    } else {
      this.autoLevelTargetRms.set(DEFAULT_TARGET_RMS_DBFS.toFixed(2));
    }
    this.autoLevelCurrentRms.set(slot.measured_rms_dbfs);
    this.autoLevelIteration.set(0);
    this.autoLevelState.set('idle');
    this.autoLevelRunning.set(false);
    this.autoLevelMatchBoosterBypass.set(this.patchBoosterOn(slot.patch));
    this.autoLevelLogs.set([
      slot.measured_rms_dbfs !== null
        ? `${slot.slot_label}: current 10s Max RMS is ${slot.measured_rms_dbfs.toFixed(2)} dBFS.`
        : `${slot.slot_label}: no stored 10s Max RMS yet. The run will measure from the live amp first.`,
      `Global target RMS is ${this.autoLevelTargetRms()} dBFS.`,
      'Control order: booster OFF base -> AMP volume, then booster ON trim -> booster level.',
    ]);
    this.openModal('autoLevel', this.autoLevelModalTpl, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      beforeDismiss: () => !this.autoLevelRunning(),
    });
  }

  closeAiModal(): void {
    this.closeModal('ai');
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
    this.closeModal('autoLevel');
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

  setAutoLevelMatchBoosterBypass(checked: boolean): void {
    this.autoLevelMatchBoosterBypass.set(checked);
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
    if (state === 'adjusting') {
      return 'Adjusting Control';
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
      this.pushAutoLevelLog('No slot patch is available for normalization.');
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
    this.ngZone.runOutsideAngular(() => {
      this.startLiveMeter();
    });
      let workingPatch = this.clonePatch(slot.patch);
      const boosterInitiallyOn = this.patchBoosterOn(workingPatch);
      await this.waitForPlayingStart(slot.slot_label);

      if (boosterInitiallyOn && this.autoLevelMatchBoosterBypass()) {
        this.pushAutoLevelLog('Booster is ON. Matching booster-OFF base loudness with AMP volume.');
        const boosterOffPatch = this.clonePatch(workingPatch);
        this.setPatchBoosterOn(boosterOffPatch, false);
        workingPatch = await this.applyPatchForNormalization(slot.slot, boosterOffPatch, 'set booster OFF for base match');
        await this.waitForPlayingStart(slot.slot_label);
        workingPatch = await this.normalizeControlToTarget(slot.slot, slot.slot_label, workingPatch, targetRms, 'amp_volume');
      }

      if (boosterInitiallyOn) {
        this.pushAutoLevelLog('Matching booster-ON loudness with booster level trim.');
        const boosterOnPatch = this.clonePatch(workingPatch);
        this.setPatchBoosterOn(boosterOnPatch, true);
        workingPatch = await this.applyPatchForNormalization(slot.slot, boosterOnPatch, 'restore booster ON');
        await this.waitForPlayingStart(slot.slot_label);
        workingPatch = await this.normalizeControlToTarget(slot.slot, slot.slot_label, workingPatch, targetRms, 'booster_level');
      } else {
        this.pushAutoLevelLog('Booster is OFF. Matching loudness with AMP volume.');
        workingPatch = await this.normalizeControlToTarget(slot.slot, slot.slot_label, workingPatch, targetRms, 'amp_volume');
      }
      const finalSample = await this.captureActivePatchMeasurement(slot.slot, AUTO_LEVEL_MEASURE_SEC);
      this.autoLevelCurrentRms.set(finalSample.rms_dbfs);
      this.autoLevelState.set('succeeded');
      this.pushAutoLevelLog(
        `Done. Final RMS ${finalSample.rms_dbfs.toFixed(2)} dBFS (target ${targetRms.toFixed(2)} dBFS).`,
      );
      this.status.set(`Volume normalization succeeded for ${slot.slot_label}`);
    } catch (error: unknown) {
      this.autoLevelState.set('failed');
      this.pushAutoLevelLog(String(error));
      this.status.set(`Volume normalization failed for ${this.autoLevelSlotLabel()}`);
    } finally {
      this.autoLevelRunning.set(false);
      this.shutdownLiveMeter();
    }
  }

  private patchBoosterOn(patch: Record<string, unknown>): boolean {
    const stages = this.readObject(patch, 'stages');
    const booster = this.readObject(stages, 'booster');
    return this.readBoolean(booster, 'on');
  }

  private setPatchBoosterOn(patch: Record<string, unknown>, on: boolean): void {
    const stages = this.ensureObject(patch, 'stages');
    const booster = this.ensureObject(stages, 'booster');
    booster['on'] = on;
  }

  private readNormalizationControlValue(
    patch: Record<string, unknown>,
    control: 'amp_volume' | 'booster_level',
  ): number | null {
    if (control === 'amp_volume') {
      const amp = this.readObject(patch, 'amp');
      const value = this.readAmpField(amp, 'volume');
      return value === null ? null : this.clampInteger(Math.trunc(value), 0, 127);
    }
    const stages = this.readObject(patch, 'stages');
    const booster = this.readObject(stages, 'booster');
    const direct = this.readNumber(booster, 'effect_level');
    if (direct !== null) {
      return this.clampInteger(Math.trunc(direct), 0, 127);
    }
    if (!booster) {
      return null;
    }
    const raw = booster['raw'];
    if (!Array.isArray(raw) || raw.length <= 6) {
      return null;
    }
    return this.clampInteger(this.parseUnknownNumber(raw[6]), 0, 127);
  }

  private writeNormalizationControlValue(
    patch: Record<string, unknown>,
    control: 'amp_volume' | 'booster_level',
    value: number,
  ): boolean {
    const clamped = this.clampInteger(value, 0, 127);
    if (control === 'amp_volume') {
      const amp = this.ensureObject(patch, 'amp');
      amp['volume'] = clamped;
      this.syncAmpDerivedRawField(amp, 'volume', clamped);
      this.syncAmpDerivedFields(amp);
      return true;
    }
    const stages = this.ensureObject(patch, 'stages');
    const booster = this.ensureObject(stages, 'booster');
    booster['effect_level'] = clamped;
    this.syncNumericRawField(booster, 'raw', 6, clamped);
    this.syncStageDerivedFields('booster', booster);
    return true;
  }

  private normalizationControlLabel(control: 'amp_volume' | 'booster_level'): string {
    if (control === 'amp_volume') {
      return 'AMP volume';
    }
    return 'Booster level';
  }

  private async normalizeControlToTarget(
    slotNumber: number,
    slotLabel: string,
    patch: Record<string, unknown>,
    targetRms: number,
    control: 'amp_volume' | 'booster_level',
  ): Promise<Record<string, unknown>> {
    let workingPatch = this.clonePatch(patch);
    const controlLabel = this.normalizationControlLabel(control);
    for (let iteration = 1; iteration <= AUTO_LEVEL_MAX_ITERS; iteration += 1) {
      this.autoLevelIteration.update((current) => current + 1);
      this.autoLevelState.set('measuring');
      this.pushAutoLevelLog(
        `${controlLabel} pass ${iteration}: measuring ${AUTO_LEVEL_MEASURE_SEC.toFixed(0)}s window...`,
      );
      const sample = await this.captureActivePatchMeasurement(slotNumber, AUTO_LEVEL_MEASURE_SEC);
      this.autoLevelCurrentRms.set(sample.rms_dbfs);
      const errorDb = targetRms - sample.rms_dbfs;
      this.pushAutoLevelLog(
        `${controlLabel} pass ${iteration}: measured ${sample.rms_dbfs.toFixed(2)} dBFS, error ${errorDb.toFixed(2)} dB.`,
      );
      if (Math.abs(errorDb) <= AUTO_LEVEL_TOLERANCE_DB) {
        this.pushAutoLevelLog(
          `${controlLabel} reached target within ${AUTO_LEVEL_TOLERANCE_DB.toFixed(1)} dB.`,
        );
        return workingPatch;
      }
      const currentValue = this.readNormalizationControlValue(workingPatch, control);
      if (currentValue === null) {
        throw new Error(`${slotLabel}: ${controlLabel} is unavailable in this patch payload.`);
      }
      let step = Math.round(errorDb * AUTO_LEVEL_STEP_SCALE);
      step = Math.max(-AUTO_LEVEL_MAX_STEP, Math.min(AUTO_LEVEL_MAX_STEP, step));
      if (step === 0) {
        step = errorDb > 0 ? 1 : -1;
      }
      const nextValue = this.clampInteger(currentValue + step, 0, 127);
      if (nextValue === currentValue) {
        throw new Error(`${slotLabel}: ${controlLabel} hit limit at ${currentValue}; cannot move toward target.`);
      }
      const nextPatch = this.clonePatch(workingPatch);
      if (!this.writeNormalizationControlValue(nextPatch, control, nextValue)) {
        throw new Error(`${slotLabel}: failed to update ${controlLabel}.`);
      }
      this.autoLevelState.set('adjusting');
      this.pushAutoLevelLog(`${controlLabel}: ${currentValue} -> ${nextValue}`);
      workingPatch = await this.applyPatchForNormalization(
        slotNumber,
        nextPatch,
        `${controlLabel} ${currentValue} -> ${nextValue}`,
      );
    }
    throw new Error(`${slotLabel}: ${controlLabel} did not converge within ${AUTO_LEVEL_MAX_ITERS} passes.`);
  }

  private async applyPatchForNormalization(
    slotNumber: number,
    patch: Record<string, unknown>,
    reason: string,
  ): Promise<Record<string, unknown>> {
    this.pushAutoLevelLog(`Applying: ${reason}`);
    const applied = await this.applyProposedPatchToSlot(slotNumber, patch, true);
    return this.clonePatch(applied);
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

  navigateToPage(page: 'dashboard' | 'lineout' | 'samples'): void {
    const targetPath = page === 'samples' ? '/samples' : page === 'lineout' ? '/line-out' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    this.currentPage.set(page);
    if (page === 'lineout') {
      void this.loadLineOutState();
    }
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

  isLineOutPage(): boolean {
    return this.currentPage() === 'lineout';
  }

  async loadLineOutState(): Promise<void> {
    this.lineOutLoading.set(true);
    this.lineOutError.set('');
    try {
      const response = await fetch('/api/v1/amp/line-out', {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as LineOutResponse | { detail?: unknown };
      if (!response.ok || !('lineout_com' in payload)) {
        this.lineOutError.set('Failed to load line out state.');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const state = payload as LineOutResponse;
      this.lineOutState.set(state);
      this.lineOutDraft.set(this.lineOutStateToDraft(state));
      this.lineOutReadAt.set(state.read_at);
      this.status.set('Loaded line out state');
      this.responseJson.set(JSON.stringify(state, null, 2));
    } catch (error: unknown) {
      this.lineOutError.set('Failed to load line out state.');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.lineOutLoading.set(false);
    }
  }

  async saveLineOutState(): Promise<void> {
    const draft = this.lineOutDraft();
    this.lineOutSaving.set(true);
    this.lineOutError.set('');
    try {
      const request = this.lineOutDraftToRequest(draft);
      const response = await fetch('/api/v1/amp/line-out', {
        method: 'PUT',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const payload = (await response.json()) as LineOutResponse | { detail?: unknown };
      if (!response.ok || !('lineout_com' in payload)) {
        this.lineOutError.set('Failed to save line out state.');
        this.responseJson.set(JSON.stringify(payload, null, 2));
        return;
      }
      const state = payload as LineOutResponse;
      this.lineOutState.set(state);
      this.lineOutDraft.set(this.lineOutStateToDraft(state));
      this.lineOutReadAt.set(state.read_at);
      this.status.set('Saved line out state');
      this.responseJson.set(JSON.stringify(state, null, 2));
    } catch (error: unknown) {
      this.lineOutError.set('Failed to save line out state.');
      this.responseJson.set(JSON.stringify({ message: 'Browser request failed', error: String(error) }, null, 2));
    } finally {
      this.lineOutSaving.set(false);
    }
  }

  lineOutModeLabel(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
      return 'n/a';
    }
    return this.lineOutAirFeelOptions.find((option) => option.value === value)?.label ?? `Mode ${value}`;
  }

  lineOutMicTypeLabel(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
      return 'n/a';
    }
    return this.lineOutMicTypeOptions.find((option) => option.value === value)?.label ?? `Type ${value}`;
  }

  lineOutMemoryLabel(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
      return 'n/a';
    }
    return value === 0 ? 'M1' : 'M2';
  }

  lineOutCmLabel(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
      return 'n/a';
    }
    return `${value} cm`;
  }

  lineOutSavedStateLabel(): string {
    const saved = this.lineOutState();
    if (saved === null) {
      return 'Draft';
    }
    if (!this.lineOutDraftMatchesSavedState()) {
      return 'Unsaved changes';
    }
    return saved.lineout_com.enabled ? 'Saved Active' : 'Saved Bypassed';
  }

  lineOutSavedStateTone(): 'success' | 'secondary' | 'warning' {
    const saved = this.lineOutState();
    if (saved === null) {
      return 'secondary';
    }
    return this.lineOutDraftMatchesSavedState() ? 'success' : 'warning';
  }

  setLineOutSystemValue(field: 'select' | 'air_feel_mode', value: string | number): void {
    const parsed = this.parseInteger(value);
    if (parsed === null) {
      return;
    }
    this.lineOutDraft.update((current) => ({
      ...current,
      [field]: field === 'select'
        ? this.clampInteger(parsed, 0, 1)
        : this.clampInteger(parsed, 0, 2),
    }));
  }

  setLineOutEnabled(checked: boolean): void {
    this.lineOutDraft.update((current) => ({
      ...current,
      enabled: checked,
    }));
  }

  setLineOutCustomValue(section: 'lineout_1' | 'lineout_2', field: keyof LineOutCustomState, value: string): void {
    const parsed = this.parseInteger(value);
    if (parsed === null) {
      return;
    }
    this.lineOutDraft.update((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: this.clampLineOutFieldValue(field, parsed),
      },
    }));
  }

  defaultLineOutState(): LineOutState {
    return {
      select: 0,
      air_feel_mode: 0,
      enabled: false,
      lineout_1: {
        mic_type: 2,
        mic_distance: 2,
        mic_position: 2,
        ambience_pre_delay: 0,
        ambience_level: 0,
      },
      lineout_2: {
        mic_type: 2,
        mic_distance: 2,
        mic_position: 2,
        ambience_pre_delay: 0,
        ambience_level: 0,
      },
    };
  }

  private cloneLineOutState(state: LineOutState): LineOutState {
    return {
      select: state.select,
      air_feel_mode: state.air_feel_mode,
      enabled: state.enabled,
      lineout_1: { ...state.lineout_1 },
      lineout_2: { ...state.lineout_2 },
    };
  }

  private lineOutDraftMatchesSavedState(): boolean {
    const saved = this.lineOutState();
    if (saved === null) {
      return false;
    }
    const draft = this.lineOutDraft();
    return JSON.stringify(this.lineOutDraftToRequest(draft)) === JSON.stringify({
      lineout_com: saved.lineout_com,
      lineout_1: saved.lineout_1,
      lineout_2: saved.lineout_2,
    });
  }

  private lineOutStateToDraft(state: LineOutResponse): LineOutState {
    return {
      select: state.lineout_com.select,
      air_feel_mode: state.lineout_com.air_feel_mode,
      enabled: state.lineout_com.enabled,
      lineout_1: { ...state.lineout_1 },
      lineout_2: { ...state.lineout_2 },
    };
  }

  private lineOutDraftToRequest(state: LineOutState): LineOutWriteRequest {
    return {
      lineout_com: {
        select: state.select,
        air_feel_mode: state.air_feel_mode,
        enabled: state.enabled,
      },
      lineout_1: { ...state.lineout_1 },
      lineout_2: { ...state.lineout_2 },
    };
  }

  private clampLineOutFieldValue(field: keyof LineOutCustomState, value: number): number {
    if (field === 'mic_type') {
      return this.clampInteger(value, 0, 4);
    }
    if (field === 'mic_distance') {
      return this.clampInteger(value, 0, 20);
    }
    if (field === 'mic_position') {
      return this.clampInteger(value, 0, 10);
    }
    return this.clampInteger(value, 0, 100);
  }

  startLiveMeter(): void {
    this.liveMeterShouldRun = true;
    this.disconnectLiveMeter();
    const source = new EventSource(`/api/v1/audio/live/sse?window_sec=${LIVE_METER_WINDOW_SEC}`);
    source.onmessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as Record<string, unknown>;
        const eventType = String(payload['type'] ?? '');
        if (eventType === 'connected') {
          const rate = Number(payload['rate']);
          if (Number.isFinite(rate) && rate > 0) {
            this.liveMeterRate.set(rate);
          }
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
        const fftBinsUnknown = payload['fft_bins_db'];
        if (Array.isArray(fftBinsUnknown)) {
          const fftBins = fftBinsUnknown
            .map((item) => (typeof item === 'number' && Number.isFinite(item) ? item : null))
            .filter((item): item is number => item !== null);
          this.liveFftBinsDb.set(fftBins);
          const currentBands = this.buildLiveMeterBandRows(fftBins);
          this.liveFrequencyBandMaxDbfs.update((current) => this.mergeLiveMeterBandMax(current, currentBands));
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
      this.disconnectLiveMeter();
      this.scheduleLiveMeterReconnect();
    };
    this.liveMeterSource = source;
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
    this.liveFftBinsDb.set([]);
    this.liveFrequencyBandMaxDbfs.set([]);
    this.liveMeterRate.set(LIVE_METER_DEFAULT_RATE);
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

  liveMeterBandRows(): LiveMeterBandRow[] {
    const currentBands = this.buildLiveMeterBandRows(this.liveFftBinsDb());
    const maxBands = this.liveFrequencyBandMaxDbfs();
    return currentBands.map((band, index) => ({
      ...band,
      maxDbfs: index < maxBands.length ? maxBands[index] ?? null : null,
      maxPercent: index < maxBands.length ? this.liveMeterDbfsToPercent(maxBands[index] ?? null) : 0,
    }));
  }

  clearLiveMeterChart(): void {
    this.liveRmsHistory.set([]);
    this.liveRmsMaxDbfs.set(null);
    this.liveFrequencyBandMaxDbfs.set([]);
  }

  formatRelativeDb(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
      return 'n/a';
    }
    return `${value.toFixed(2)} dB`;
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

  private buildLiveMeterBandRows(bins: number[]): LiveMeterBandRow[] {
    const currentRate = Math.max(1, this.liveMeterRate());
    const maxFreq = Math.max(LIVE_FFT_MIN_FREQ_HZ + 1, Math.min(LIVE_FFT_MAX_FREQ_HZ, currentRate / 2));
    return LIVE_FFT_BANDS.map((band) => {
      const currentValues: number[] = [];
      const binCount = bins.length;
      for (let index = 0; index < binCount; index += 1) {
        const centerFreq = this.liveFftBinCenterHz(index, binCount, LIVE_FFT_MIN_FREQ_HZ, maxFreq);
        const withinBand = band.id === LIVE_FFT_BANDS[LIVE_FFT_BANDS.length - 1].id
          ? centerFreq >= band.minHz && centerFreq <= band.maxHz
          : centerFreq >= band.minHz && centerFreq < band.maxHz;
        if (!withinBand) {
          continue;
        }
        const value = bins[index];
        if (!Number.isFinite(value)) {
          continue;
        }
        currentValues.push(value);
      }
      if (currentValues.length === 0) {
        return {
          id: band.id,
          label: band.label,
          rangeLabel: `${Math.round(band.minHz)} Hz - ${Math.round(band.maxHz)} Hz`,
          currentDbfs: null,
          maxDbfs: null,
          currentPercent: 0,
          maxPercent: 0,
        };
      }
      const meanPower = currentValues.reduce((acc, value) => acc + 10 ** (value / 10), 0) / currentValues.length;
      const currentDbfs = Math.max(-60, Math.min(0, Number((10 * Math.log10(meanPower)).toFixed(2))));
      return {
        id: band.id,
        label: band.label,
        rangeLabel: `${Math.round(band.minHz)} Hz - ${Math.round(band.maxHz)} Hz`,
        currentDbfs,
        maxDbfs: null,
        currentPercent: this.liveMeterDbfsToPercent(currentDbfs),
        maxPercent: 0,
      };
    });
  }

  private liveMeterDbfsToPercent(value: number | null): number {
    if (value === null || !Number.isFinite(value)) {
      return 0;
    }
    const clamped = Math.max(-60, Math.min(0, value));
    return Math.max(0, Math.min(100, ((clamped + 60) / 60) * 100));
  }

  private liveFftBinCenterHz(index: number, binCount: number, minFreq: number, maxFreq: number): number {
    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);
    const startFreq = 10 ** (logMin + (index / binCount) * (logMax - logMin));
    const endFreq = 10 ** (logMin + ((index + 1) / binCount) * (logMax - logMin));
    return Math.sqrt(startFreq * endFreq);
  }

  private mergeLiveMeterBandMax(previous: Array<number | null>, current: LiveMeterBandRow[]): Array<number | null> {
    return current.map((band, index) => {
      if (band.currentDbfs === null || !Number.isFinite(band.currentDbfs)) {
        return index < previous.length ? previous[index] ?? null : null;
      }
      const prior = index < previous.length ? previous[index] : null;
      if (prior === null || !Number.isFinite(prior)) {
        return band.currentDbfs;
      }
      return Math.max(prior, band.currentDbfs);
    });
  }

  private resolvePageFromPath(): 'dashboard' | 'lineout' | 'samples' {
    if (window.location.pathname === '/samples') {
      return 'samples';
    }
    if (window.location.pathname === '/line-out') {
      return 'lineout';
    }
    return 'dashboard';
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

  editorDbStateLabel(): string {
    const slotNumber = this.editorSlotNumber();
    if (slotNumber === null) {
      return 'DB ?';
    }
    const slot = this.slots().find((card) => card.slot === slotNumber);
    const draftHash = this.readString(this.editorPatchDraft(), 'config_hash_sha256') ?? '';
    if (!slot?.saved_hash_sha256 || !draftHash) {
      return 'DB ✗';
    }
    return draftHash === slot.saved_hash_sha256 ? 'DB ✓' : 'DB ✗';
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

  editorEqPeqParamGroups(eqName: EqStageName): EqParamGroup[] {
    const paramMap = new Map(this.editorEqPeqParams(eqName).map((param) => [param.key, param]));
    return EQ_PEQ_PARAM_GROUPS.map((group) => ({
      id: `${eqName}-${group.id}`,
      label: group.label,
      params: group.keys
        .map((key) => paramMap.get(key) ?? null)
        .filter((param): param is EqParamField => param !== null),
    })).filter((group) => group.params.length > 0);
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
    const minDb = -120;
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

  editorPedalFxPositionOptions(): readonly ValueOption[] {
    return PEDAL_FX_POSITION_OPTIONS;
  }

  editorPedalFxTypeOptions(): readonly ValueOption[] {
    return PEDAL_FX_TYPE_OPTIONS;
  }

  editorPedalFxWahTypeOptions(): readonly ValueOption[] {
    return PEDAL_FX_WAH_TYPE_OPTIONS;
  }

  editorPedalFxPosition(): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'pedalfx');
    const direct = this.readNumber(block, 'position');
    if (direct !== null) {
      return this.clampInteger(Math.trunc(direct), 0, 1);
    }
    const rawCom = this.readNumericArray(block, 'raw_com');
    if (rawCom && rawCom.length >= 1) {
      return this.clampInteger(rawCom[0], 0, 1);
    }
    return null;
  }

  setEditorPedalFxPosition(value: string): void {
    const parsed = this.clampInteger(this.parseInteger(value), 0, 1);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'pedalfx');
      block['position'] = parsed;
      this.syncNumericRawField(block, 'raw_com', 0, parsed);
    });
  }

  editorPedalFxType(): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'pedalfx');
    const direct = this.readNumber(block, 'type');
    if (direct !== null) {
      return this.clampInteger(Math.trunc(direct), 0, 2);
    }
    const rawCom = this.readNumericArray(block, 'raw_com');
    if (rawCom && rawCom.length >= 3) {
      return this.clampInteger(rawCom[2], 0, 2);
    }
    return null;
  }

  setEditorPedalFxType(value: string): void {
    const parsed = this.clampInteger(this.parseInteger(value), 0, 2);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'pedalfx');
      block['type'] = parsed;
      this.syncNumericRawField(block, 'raw_com', 2, parsed);
    });
  }

  editorPedalFxRawValue(index: number, offset = 0): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'pedalfx');
    const raw = this.readNumericArray(block, 'raw');
    if (!raw || index < 0 || index >= raw.length) {
      return null;
    }
    return raw[index] - offset;
  }

  setEditorPedalFxRawValue(index: number, value: string, min: number, max: number, offset = 0): void {
    const parsed = this.clampInteger(this.parseInteger(value), min, max);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'pedalfx');
      this.syncNumericRawField(block, 'raw', index, parsed + offset);
    });
  }

  editorPedalFxWahType(): number | null {
    return this.editorPedalFxRawValue(0);
  }

  setEditorPedalFxWahType(value: string): void {
    this.setEditorPedalFxRawValue(0, value, 0, 5);
  }

  editorPedalFxPedalPosition(): number | null {
    return this.editorPedalFxRawValue(1);
  }

  setEditorPedalFxPedalPosition(value: string): void {
    this.setEditorPedalFxRawValue(1, value, 0, 100);
  }

  editorPedalFxPedalMin(): number | null {
    return this.editorPedalFxRawValue(2);
  }

  setEditorPedalFxPedalMin(value: string): void {
    this.setEditorPedalFxRawValue(2, value, 0, 100);
  }

  editorPedalFxPedalMax(): number | null {
    return this.editorPedalFxRawValue(3);
  }

  setEditorPedalFxPedalMax(value: string): void {
    this.setEditorPedalFxRawValue(3, value, 0, 100);
  }

  editorPedalFxEffectLevel(): number | null {
    return this.editorPedalFxRawValue(4);
  }

  setEditorPedalFxEffectLevel(value: string): void {
    this.setEditorPedalFxRawValue(4, value, 0, 100);
  }

  editorPedalFxDirectMix(): number | null {
    return this.editorPedalFxRawValue(5);
  }

  setEditorPedalFxDirectMix(value: string): void {
    this.setEditorPedalFxRawValue(5, value, 0, 100);
  }

  editorPedalFxPitch(): number | null {
    return this.editorPedalFxRawValue(6, 24);
  }

  setEditorPedalFxPitch(value: string): void {
    this.setEditorPedalFxRawValue(6, value, -24, 24, 24);
  }

  editorPedalFxBendPedalPosition(): number | null {
    return this.editorPedalFxRawValue(7);
  }

  setEditorPedalFxBendPedalPosition(value: string): void {
    this.setEditorPedalFxRawValue(7, value, 0, 100);
  }

  editorPedalFxBendEffectLevel(): number | null {
    return this.editorPedalFxRawValue(8);
  }

  setEditorPedalFxBendEffectLevel(value: string): void {
    this.setEditorPedalFxRawValue(8, value, 0, 100);
  }

  editorPedalFxBendDirectMix(): number | null {
    return this.editorPedalFxRawValue(9);
  }

  setEditorPedalFxBendDirectMix(value: string): void {
    this.setEditorPedalFxRawValue(9, value, 0, 100);
  }

  editorPedalFxEwahPedalPosition(): number | null {
    return this.editorPedalFxRawValue(10);
  }

  setEditorPedalFxEwahPedalPosition(value: string): void {
    this.setEditorPedalFxRawValue(10, value, 0, 100);
  }

  editorPedalFxEwahPedalMin(): number | null {
    return this.editorPedalFxRawValue(11);
  }

  setEditorPedalFxEwahPedalMin(value: string): void {
    this.setEditorPedalFxRawValue(11, value, 0, 100);
  }

  editorPedalFxEwahPedalMax(): number | null {
    return this.editorPedalFxRawValue(12);
  }

  setEditorPedalFxEwahPedalMax(value: string): void {
    this.setEditorPedalFxRawValue(12, value, 0, 100);
  }

  editorPedalFxEwahEffectLevel(): number | null {
    return this.editorPedalFxRawValue(13);
  }

  setEditorPedalFxEwahEffectLevel(value: string): void {
    this.setEditorPedalFxRawValue(13, value, 0, 100);
  }

  editorPedalFxEwahDirectMix(): number | null {
    return this.editorPedalFxRawValue(14);
  }

  setEditorPedalFxEwahDirectMix(value: string): void {
    this.setEditorPedalFxRawValue(14, value, 0, 100);
  }

  editorGafcExp1Function(): number | null {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'gafc_exp1');
    return this.readNumber(block, 'function');
  }

  setEditorGafcExp1Function(value: string): void {
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'gafc_exp1');
      block['function'] = parsed;
      this.syncNumericRawField(block, 'raw', 0, parsed);
    });
  }

  editorGafcExp1FunctionOptions(): readonly ValueOption[] {
    return GAFC_EXP1_FUNCTION_OPTIONS;
  }

  editorGafcExp1AssignmentRows(): readonly GafcExp1AssignmentRow[] {
    const stages = this.readObject(this.editorPatchDraft(), 'stages');
    const block = this.readObject(stages, 'gafc_exp1');
    if (!block) {
      return [];
    }
    const detailRaw = this.readNumericArray(block, 'detail_raw') ?? [];
    const minRaw = this.readNumericArray(block, 'min_raw') ?? [];
    const maxRaw = this.readNumericArray(block, 'max_raw') ?? [];
    return GAFC_EXP1_ASSIGNMENT_SCHEMA.map((spec, index) => ({
      ...spec,
      detail: this.decodeRolandValue(detailRaw.slice(index, index + 1)),
      min: this.decodeRolandValue(minRaw.slice(spec.minOffset, spec.minOffset + spec.minSize)),
      max: this.decodeRolandValue(maxRaw.slice(spec.maxOffset, spec.maxOffset + spec.maxSize)),
    }));
  }

  editorGafcExp1SelectedAssignmentRow(): GafcExp1AssignmentRow | null {
    const functionValue = this.editorGafcExp1Function();
    if (functionValue === null || functionValue < 0 || functionValue >= GAFC_EXP1_FUNCTION_ROW_KEY.length) {
      return null;
    }
    const rowKey = GAFC_EXP1_FUNCTION_ROW_KEY[functionValue];
    if (!rowKey) {
      return null;
    }
    return this.editorGafcExp1AssignmentRows().find((row) => row.key === rowKey) ?? null;
  }

  editorGafcExp1SelectedFunctionNote(): string | null {
    const functionValue = this.editorGafcExp1Function();
    if (functionValue === null || functionValue < 0 || functionValue >= GAFC_EXP1_FUNCTION_ROW_NOTE.length) {
      return null;
    }
    return GAFC_EXP1_FUNCTION_ROW_NOTE[functionValue] ?? null;
  }

  setEditorGafcExp1AssignmentValue(key: string, field: 'detail' | 'min' | 'max', value: string): void {
    const specIndex = GAFC_EXP1_ASSIGNMENT_SCHEMA.findIndex((entry) => entry.key === key);
    if (specIndex < 0) {
      return;
    }
    const spec = GAFC_EXP1_ASSIGNMENT_SCHEMA[specIndex];
    const parsed = this.parseInteger(value);
    this.updateEditorPatch((draft) => {
      const stages = this.ensureObject(draft, 'stages');
      const block = this.ensureObject(stages, 'gafc_exp1');
      if (field === 'detail') {
        const raw = this.ensureRawArray(block, 'detail_raw', GAFC_EXP1_ASSIGNMENT_SCHEMA.length);
        raw[specIndex] = this.clampInteger(parsed, 0, spec.detailMax);
        block['detail_raw'] = raw;
        return;
      }
      const rawKey = field === 'min' ? 'min_raw' : 'max_raw';
      const offset = field === 'min' ? spec.minOffset : spec.maxOffset;
      const size = field === 'min' ? spec.minSize : spec.maxSize;
      const raw = this.ensureRawArray(block, rawKey, GAFC_EXP1_ASSIGNMENT_RAW_LENGTH);
      const encoded = this.encodeRolandValue(this.clampInteger(parsed, 0, spec.valueMax), size);
      for (let idx = 0; idx < encoded.length; idx += 1) {
        raw[offset + idx] = encoded[idx];
      }
      block[rawKey] = raw;
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
      this.notifyQueueTransitions(queue.jobs);
    } catch {
      // no-op: queue notifications resume on next successful poll
    }
  }

  dismissToast(toastId: number): void {
    const timer = this.toastTimers.get(toastId);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.toastTimers.delete(toastId);
    }
    this.toasts.update((current) => current.filter((toast) => toast.id !== toastId));
  }

  private pushToast(text: string, tone: 'info' | 'success' | 'danger'): void {
    const message = text.trim();
    if (!message) {
      return;
    }
    const duplicate = this.toasts().find((toast) => toast.text === message && toast.tone === tone);
    if (duplicate) {
      const timer = this.toastTimers.get(duplicate.id);
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      this.toastTimers.set(
        duplicate.id,
        setTimeout(() => this.dismissToast(duplicate.id), 5000),
      );
      return;
    }
    const id = ++this.toastCounter;
    this.toasts.update((current) => [...current, { id, text: message, tone }].slice(-5));
    this.toastTimers.set(
      id,
      setTimeout(() => this.dismissToast(id), 5000),
    );
  }

  private toastToneForStatus(message: string): 'info' | 'success' | 'danger' {
    const normalized = message.toLowerCase();
    if (normalized.includes('failed') || normalized.includes('error')) {
      return 'danger';
    }
    if (
      normalized.includes('succeeded') ||
      normalized.includes('synced') ||
      normalized.includes('saved') ||
      normalized.includes('created') ||
      normalized.includes('updated') ||
      normalized.includes('added') ||
      normalized.includes('removed') ||
      normalized.includes('applied') ||
      normalized.includes('programmed') ||
      normalized.includes('activated') ||
      normalized.includes('recorded') ||
      normalized.includes('captured') ||
      normalized.includes('connected') ||
      normalized.includes('committed') ||
      normalized.includes('loaded')
    ) {
      return 'success';
    }
    return 'info';
  }

  private notifyQueueTransitions(jobs: QueueJobSummary[]): void {
    const next = new Map<string, QueueJobSummary['status']>();
    for (const job of jobs) {
      next.set(job.job_id, job.status);
      if (!this.queueNotificationsInitialized) {
        continue;
      }
      const previousStatus = this.queueJobStatusById.get(job.job_id);
      if (previousStatus === job.status) {
        continue;
      }
      if (job.status !== 'succeeded' && job.status !== 'failed') {
        continue;
      }
      const slotLabel = job.slot !== null ? ` ${this.setLabelForSlot(job.slot)}` : '';
      const messageLabel = `${this.operationLabel(job.operation)}${slotLabel}`;
      if (job.status === 'succeeded') {
        this.pushToast(`${messageLabel} completed`, 'success');
      } else {
        const suffix = job.error ? `: ${job.error}` : '';
        this.pushToast(`${messageLabel} failed${suffix}`, 'danger');
      }
    }
    this.queueJobStatusById = next;
    this.queueNotificationsInitialized = true;
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

  selectedAmpSlotSavedPatchName(): string {
    const selectedSlot = this.selectedAmpSlot();
    if (selectedSlot === null) {
      return 'n/a';
    }
    const card = this.slots().find((item) => item.slot === selectedSlot) ?? null;
    if (!card || !card.in_sync || !card.patch_name.trim()) {
      return 'n/a';
    }
    return card.patch_name.trim();
  }

  currentSettingsPatchName(): string {
    return this.readString(this.editorPatchDraft(), 'patch_name')?.trim() || this.toneLoadedPatchName().trim() || this.livePatchExactDbName().trim() || 'Unnamed Current Settings';
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

  private async applyProposedPatchToSlot(
    slotNumber: number,
    proposedPatchInput: Record<string, unknown>,
    applyLive: boolean,
  ): Promise<Record<string, unknown>> {
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
      return this.clonePatch(appliedPatch);
    }
    this.aiModalPatch.set(this.clonePatch(proposedPatch));
    this.aiModalPatchName.set(proposedName || this.aiModalPatchName());
    return this.clonePatch(proposedPatch);
  }

  private async waitForPlayingStart(slotLabel: string): Promise<void> {
    if (!this.liveMeterConnected()) {
      throw new Error('Live meter is not connected. Normalization requires the live meter.');
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

  private decodeRolandValue(bytes: readonly number[]): number {
    let value = 0;
    for (const byte of bytes) {
      value = value * 128 + this.clampInteger(byte, 0, 127);
    }
    return value;
  }

  private encodeRolandValue(value: number, size: number): number[] {
    const encoded = Array.from({ length: size }, () => 0);
    let remaining = Math.max(0, Math.floor(value));
    for (let index = size - 1; index >= 0; index -= 1) {
      encoded[index] = remaining % 128;
      remaining = Math.floor(remaining / 128);
    }
    return encoded;
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

  private readNumericArray(source: Record<string, unknown> | null, key: string): number[] | null {
    if (!source) {
      return null;
    }
    const value = source[key];
    if (!Array.isArray(value)) {
      return null;
    }
    return value.map((item) => this.parseUnknownNumber(item));
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

  private async applyEditorPatchLive(expectedFingerprint: string, forceFullPatch = false): Promise<boolean> {
    const draft = this.editorPatchDraft();
    const slotNumber = this.editorSlotNumber();
    if (!this.editorLiveApplyAvailable() || draft === null || this.editorLiveApplyInFlight) {
      return false;
    }
    const currentFingerprint = this.patchFingerprint(draft);
    if (currentFingerprint !== expectedFingerprint) {
      this.scheduleEditorLiveApply();
      return false;
    }
    if (!forceFullPatch && currentFingerprint === this.editorLiveApplyLastAppliedFingerprint) {
      return false;
    }
    const draftSnapshot = this.clonePatch(draft);
    const changedBlocks = forceFullPatch ? [] : this.editorBlocksToApply(this.livePatchSnapshot(), draftSnapshot);
    this.pushToast(this.editorPatchApplyToast(changedBlocks, forceFullPatch), 'info');
    this.editorLiveApplyInFlight = true;
    this.editorLiveApplyPending.set(true);
    this.editorLiveApplyReadbackAt.set('');
    try {
      if (!forceFullPatch && changedBlocks.length === 1) {
        const blockName = changedBlocks[0];
        const blockPayload = this.comparablePatchBlock(draftSnapshot, blockName);
        if (blockPayload && typeof blockPayload === 'object' && !Array.isArray(blockPayload)) {
          const response = await fetch(`/api/v1/live-patch/blocks/${blockName}`, {
            method: 'PATCH',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patch_block: blockPayload }),
          });
          const payload = (await response.json()) as LivePatchResponse | { detail?: unknown };
          if (!response.ok || !('patch_json' in payload)) {
            this.editorLiveApplyError.set(typeof payload === 'object' ? JSON.stringify(payload) : 'live apply failed');
            return false;
          }
          const applied = payload as LivePatchResponse;
          const appliedFingerprint = this.patchFingerprint(applied.patch_json);
          this.editorPatchDraft.set(this.clonePatch(applied.patch_json));
          this.editorLiveApplyLastAppliedFingerprint = appliedFingerprint;
          if (this.editorLiveApplyQueuedFingerprint === expectedFingerprint) {
            this.editorLiveApplyQueuedFingerprint = null;
          }
          this.applyLivePatchStatus(applied);
          this.currentAmpCommitState.set('uncommitted');
          this.editorLiveApplyReadbackAt.set(applied.amp_confirmed_at);
          this.editorLiveApplyError.set('');
          const targetSlotNumber = this.selectedAmpSlot() ?? slotNumber;
          if (targetSlotNumber !== null) {
            this.editorSlotNumber.set(targetSlotNumber);
          }
          this.refreshCurrentCommitStateFromKnownState();
          return true;
        }
      }
      const response = await fetch('/api/v1/amp/current-patch/live-apply', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: draftSnapshot }),
      });
      const payload = (await response.json()) as ApplyCurrentPatchResponse | { detail?: unknown };
      if (!response.ok) {
        this.editorLiveApplyError.set(typeof payload === 'object' ? JSON.stringify(payload) : 'live apply failed');
        return false;
      }
      const applied = payload as ApplyCurrentPatchResponse;
      const stagedFingerprint = expectedFingerprint;
      this.editorLiveApplyLastAppliedFingerprint = stagedFingerprint;
      if (this.editorLiveApplyQueuedFingerprint === expectedFingerprint) {
        this.editorLiveApplyQueuedFingerprint = null;
      }
      const patchName = this.readString(draftSnapshot, 'patch_name') ?? '';
      const hash = this.readString(applied.patch, 'config_hash_sha256') ?? '';
      const targetSlotNumber = this.selectedAmpSlot() ?? slotNumber;
      if (targetSlotNumber !== null) {
        this.editorSlotNumber.set(targetSlotNumber);
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
      return true;
    } catch (error: unknown) {
      this.editorLiveApplyError.set(String(error));
      return false;
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

  private editorPatchApplyToast(changedBlocks: readonly string[], forceFullPatch: boolean): string {
    if (forceFullPatch || changedBlocks.length !== 1) {
      return 'Patching current settings to amp live';
    }
    return `Patching ${this.toneBlockDisplay(changedBlocks[0]).label} to amp live`;
  }

  private editorBlocksToApply(referencePatch: Record<string, unknown> | null, currentPatch: Record<string, unknown>): string[] {
    if (!referencePatch) {
      return [];
    }
    return this.toneBlockOptions().filter((block) => {
      const referenceBlock = this.comparablePatchBlock(referencePatch, block);
      const currentBlock = this.comparablePatchBlock(currentPatch, block);
      return this.stableStringify(referenceBlock) !== this.stableStringify(currentBlock);
    });
  }

  private isAmpStateConflictModalOpen(): boolean {
    return this.modalRefs.ampStateConflict !== undefined;
  }

  private openAmpStateConflictModal(previousSlot: number | null, currentSlot: number | null): void {
    this.ampStateConflictPreviousSlotLabel.set(previousSlot === null ? 'n/a' : this.setLabelForSlot(previousSlot));
    this.ampStateConflictCurrentSlotLabel.set(currentSlot === null ? 'n/a' : this.setLabelForSlot(currentSlot));
    this.ampStateConflictDetectedAt.set(new Date().toISOString());
    this.editorLiveApplyError.set('');
    this.openModal('ampStateConflict', this.ampStateConflictModalTpl, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
    });
  }

  private closeAmpStateConflictModal(): void {
    this.closeModal('ampStateConflict');
    this.ampStateConflictPreviousSlotLabel.set('');
    this.ampStateConflictCurrentSlotLabel.set('');
    this.ampStateConflictDetectedAt.set('');
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

      const gafcExp1 = this.readObject(stages, 'gafc_exp1');
      if (gafcExp1) {
        const out: Record<string, unknown> = {};
        if (gafcExp1['function'] !== undefined) {
          out['function'] = gafcExp1['function'];
        }
        if (Array.isArray(gafcExp1['raw'])) {
          out['raw'] = gafcExp1['raw'];
        }
        if (Array.isArray(gafcExp1['detail_raw'])) {
          out['detail_raw'] = gafcExp1['detail_raw'];
        }
        if (Array.isArray(gafcExp1['min_raw'])) {
          out['min_raw'] = gafcExp1['min_raw'];
        }
        if (Array.isArray(gafcExp1['max_raw'])) {
          out['max_raw'] = gafcExp1['max_raw'];
        }
        if (Object.keys(out).length > 0) {
          stagesOut['gafc_exp1'] = out;
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

  hasLoadedSavedPatch(): boolean {
    return this.toneLoadedPatchObjectId().trim().length > 0;
  }

  private clearToneAiPreview(): void {
    this.toneAiPreviewSummary.set('');
    this.toneAiPreviewCandidate.set(null);
  }

  private selectSavedPatch(patchObject: TonePatchObjectResponse): void {
    this.toneLoadedPatchSnapshot.set(this.clonePatch(patchObject.patch_json));
    this.toneLoadedPatchObjectId.set(String(patchObject.id));
    this.toneLoadedPatchName.set(patchObject.name);
    if (patchObject.blocks.length > 0) {
      this.setToneBlocksFromNames(patchObject.blocks, true);
      return;
    }
    this.setToneBlocksFromPatch(patchObject.patch_json, true);
  }

  private syncSelectedPatchFromExactMatch(): void {
    const exactMatch = this.livePatchExactDbMatch();
    if (!exactMatch) {
      return;
    }
    const patchObject = this.tonePatchObjects().find((item) => item.id === exactMatch.id) ?? null;
    if (!patchObject) {
      return;
    }
    const currentSelectedId = this.toneLoadedPatchObjectId().trim();
    if (currentSelectedId && currentSelectedId !== String(exactMatch.id)) {
      return;
    }
    if (!currentSelectedId && this.toneLoadedPatchSnapshot() !== null) {
      return;
    }
    this.selectSavedPatch(patchObject);
  }

  private setToneBlocksFromPatch(source: Record<string, unknown>, replaceSelection: boolean): void {
    const blockNames = this.toneBlockOptions().filter((block) => this.patchDefinesBlock(source, block));
    this.setToneBlocksFromNames(blockNames, replaceSelection);
  }

  private resetLivePatchSelectionScopeToAll(): void {
    this.toneLoadedPatchSnapshot.set(null);
    this.toneLoadedPatchObjectId.set('');
    this.toneLoadedPatchName.set('');
    this.setToneBlocksFromNames(this.toneBlockOptions(), true);
  }

  private setToneBlocksFromNames(blocks: readonly string[], replaceSelection: boolean): void {
    const selected = new Set(blocks.filter((block) => this.toneBlockOptions().includes(block)));
    const next: Record<string, boolean> = {};
    for (const block of this.toneBlockOptions()) {
      next[block] = selected.has(block);
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

  private applyLoadedPatchBlockToDraft(draft: Record<string, unknown>, loadedPatch: Record<string, unknown>, block: string): void {
    if (block === 'routing' || block === 'amp') {
      const loadedDirect = this.readObject(loadedPatch, block);
      if (loadedDirect) {
        draft[block] = this.clonePatch(loadedDirect);
      } else {
        delete draft[block];
      }
      return;
    }

    const loadedStages = this.readObject(loadedPatch, 'stages');
    const loadedStage = this.readObject(loadedStages, block);
    const draftStages = this.readObject(draft, 'stages');
    if (loadedStage) {
      const ensuredStages = this.ensureObject(draft, 'stages');
      ensuredStages[block] = this.clonePatch(loadedStage);
    } else if (draftStages) {
      delete draftStages[block];
      if (Object.keys(draftStages).length === 0) {
        delete draft['stages'];
      }
    }

    if (block === 'booster' || block === 'mod' || block === 'fx' || block === 'delay' || block === 'reverb') {
      const loadedColors = this.readObject(loadedPatch, 'colors');
      const loadedColor = this.readObject(loadedColors, block);
      const draftColors = this.readObject(draft, 'colors');
      if (loadedColor) {
        const ensuredColors = this.ensureObject(draft, 'colors');
        ensuredColors[block] = this.clonePatch(loadedColor);
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

  private patchDefinesBlock(source: Record<string, unknown> | null, block: string): boolean {
    const comparable = this.comparablePatchBlock(source, block);
    if (!comparable || typeof comparable !== 'object' || Array.isArray(comparable)) {
      return false;
    }
    return Object.keys(comparable as Record<string, unknown>).length > 0;
  }

  private applyLivePatchStatus(payload: LivePatchResponse): void {
    this.livePatchSnapshot.set(this.clonePatch(payload.patch_json));
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
    this.syncSelectedPatchFromExactMatch();
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
        this.editorLiveApplyQueuedFingerprint = null;
        if (!this.isAmpStateConflictModalOpen()) {
          this.openAmpStateConflictModal(previousSlot, active.slot);
        } else {
          this.ampStateConflictPreviousSlotLabel.set(this.setLabelForSlot(previousSlot));
          this.ampStateConflictCurrentSlotLabel.set(active.slot === null ? 'n/a' : this.setLabelForSlot(active.slot));
          this.ampStateConflictDetectedAt.set(new Date().toISOString());
        }
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

  showTonePatchDescription(patchObject: TonePatchObjectResponse): boolean {
    const description = patchObject.description.trim();
    if (!description) {
      return false;
    }
    return !description.startsWith('Migrated from legacy saved patch');
  }
}
