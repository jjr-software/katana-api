export type RoutingChainBlockId =
  | 'input'
  | 'pdl'
  | 'bst'
  | 'mod'
  | 'fx'
  | 'fv'
  | 'sr'
  | 'dly1'
  | 'dly2'
  | 'rev'
  | 'eq'
  | 'eq2'
  | 'amp'
  | 'speaker';

type RoutingChainFlow = readonly RoutingChainBlockId[];

interface RoutingChainBaseFlow {
  pdlVal: number;
  srVal: number;
  list: readonly RoutingChainFlow[];
}

interface RoutingChainEqFlow {
  eqPos1: number;
  eqPos2: number;
  list: RoutingChainFlow;
}

const BASE_FLOWS: readonly RoutingChainBaseFlow[] = [
  {
    pdlVal: 0,
    srVal: 0,
    list: [
      ['pdl', 'bst', 'amp', 'mod', 'fx', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['pdl', 'bst', 'mod', 'amp', 'fx', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['pdl', 'bst', 'mod', 'fx', 'amp', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['pdl', 'bst', 'mod', 'fx', 'dly1', 'amp', 'fv', 'sr', 'dly2', 'rev'],
      ['pdl', 'mod', 'bst', 'amp', 'fx', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['pdl', 'mod', 'bst', 'fx', 'amp', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['pdl', 'mod', 'bst', 'fx', 'dly1', 'amp', 'fv', 'sr', 'dly2', 'rev'],
      ['pdl', 'mod', 'fx', 'bst', 'amp', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['pdl', 'mod', 'fx', 'bst', 'dly1', 'amp', 'fv', 'sr', 'dly2', 'rev'],
    ],
  },
  {
    pdlVal: 0,
    srVal: 1,
    list: [
      ['pdl', 'bst', 'amp', 'mod', 'fx', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['pdl', 'bst', 'mod', 'amp', 'fx', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['pdl', 'bst', 'mod', 'fx', 'amp', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['pdl', 'bst', 'mod', 'fx', 'dly1', 'amp', 'fv', 'dly2', 'rev', 'sr'],
      ['pdl', 'mod', 'bst', 'amp', 'fx', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['pdl', 'mod', 'bst', 'fx', 'amp', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['pdl', 'mod', 'bst', 'fx', 'dly1', 'amp', 'fv', 'dly2', 'rev', 'sr'],
      ['pdl', 'mod', 'fx', 'bst', 'amp', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['pdl', 'mod', 'fx', 'bst', 'dly1', 'amp', 'fv', 'dly2', 'rev', 'sr'],
    ],
  },
  {
    pdlVal: 0,
    srVal: 2,
    list: [
      ['pdl', 'bst', 'amp', 'sr', 'mod', 'fx', 'fv', 'dly1', 'dly2', 'rev'],
      ['pdl', 'bst', 'mod', 'amp', 'sr', 'fx', 'fv', 'dly1', 'dly2', 'rev'],
      ['pdl', 'bst', 'mod', 'fx', 'amp', 'sr', 'fv', 'dly1', 'dly2', 'rev'],
      ['pdl', 'bst', 'mod', 'fx', 'dly1', 'amp', 'sr', 'fv', 'dly2', 'rev'],
      ['pdl', 'mod', 'bst', 'amp', 'sr', 'fx', 'fv', 'dly1', 'dly2', 'rev'],
      ['pdl', 'mod', 'bst', 'fx', 'amp', 'sr', 'fv', 'dly1', 'dly2', 'rev'],
      ['pdl', 'mod', 'bst', 'fx', 'dly1', 'amp', 'sr', 'fv', 'dly2', 'rev'],
      ['pdl', 'mod', 'fx', 'bst', 'amp', 'sr', 'fv', 'dly1', 'dly2', 'rev'],
      ['pdl', 'mod', 'fx', 'bst', 'dly1', 'amp', 'sr', 'fv', 'dly2', 'rev'],
    ],
  },
  {
    pdlVal: 1,
    srVal: 0,
    list: [
      ['bst', 'amp', 'pdl', 'mod', 'fx', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['bst', 'mod', 'amp', 'pdl', 'fx', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['bst', 'mod', 'fx', 'amp', 'pdl', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['bst', 'mod', 'fx', 'dly1', 'amp', 'pdl', 'fv', 'sr', 'dly2', 'rev'],
      ['mod', 'bst', 'amp', 'pdl', 'fx', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['mod', 'bst', 'fx', 'amp', 'pdl', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['mod', 'bst', 'fx', 'dly1', 'amp', 'pdl', 'fv', 'sr', 'dly2', 'rev'],
      ['mod', 'fx', 'bst', 'amp', 'pdl', 'fv', 'sr', 'dly1', 'dly2', 'rev'],
      ['mod', 'fx', 'bst', 'dly1', 'amp', 'pdl', 'fv', 'sr', 'dly2', 'rev'],
    ],
  },
  {
    pdlVal: 1,
    srVal: 1,
    list: [
      ['bst', 'amp', 'pdl', 'mod', 'fx', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['bst', 'mod', 'amp', 'pdl', 'fx', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['bst', 'mod', 'fx', 'amp', 'pdl', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['bst', 'mod', 'fx', 'dly1', 'amp', 'pdl', 'fv', 'dly2', 'rev', 'sr'],
      ['mod', 'bst', 'amp', 'pdl', 'fx', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['mod', 'bst', 'fx', 'amp', 'pdl', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['mod', 'bst', 'fx', 'dly1', 'amp', 'pdl', 'fv', 'dly2', 'rev', 'sr'],
      ['mod', 'fx', 'bst', 'amp', 'pdl', 'fv', 'dly1', 'dly2', 'rev', 'sr'],
      ['mod', 'fx', 'bst', 'dly1', 'amp', 'pdl', 'fv', 'dly2', 'rev', 'sr'],
    ],
  },
  {
    pdlVal: 1,
    srVal: 2,
    list: [
      ['bst', 'amp', 'pdl', 'sr', 'mod', 'fx', 'fv', 'dly1', 'dly2', 'rev'],
      ['bst', 'mod', 'amp', 'pdl', 'sr', 'fx', 'fv', 'dly1', 'dly2', 'rev'],
      ['bst', 'mod', 'fx', 'amp', 'pdl', 'sr', 'fv', 'dly1', 'dly2', 'rev'],
      ['bst', 'mod', 'fx', 'dly1', 'amp', 'pdl', 'sr', 'fv', 'dly2', 'rev'],
      ['mod', 'bst', 'amp', 'pdl', 'sr', 'fx', 'fv', 'dly1', 'dly2', 'rev'],
      ['mod', 'bst', 'fx', 'amp', 'pdl', 'sr', 'fv', 'dly1', 'dly2', 'rev'],
      ['mod', 'bst', 'fx', 'dly1', 'amp', 'pdl', 'sr', 'fv', 'dly2', 'rev'],
      ['mod', 'fx', 'bst', 'amp', 'pdl', 'sr', 'fv', 'dly1', 'dly2', 'rev'],
      ['mod', 'fx', 'bst', 'dly1', 'amp', 'pdl', 'sr', 'fv', 'dly2', 'rev'],
    ],
  },
];

const EQ_FLOWS: readonly RoutingChainEqFlow[] = [
  { eqPos1: 0, eqPos2: 0, list: ['eq', 'eq2', 'amp'] },
  { eqPos1: 1, eqPos2: 1, list: ['amp', 'eq', 'eq2'] },
  { eqPos1: 0, eqPos2: 1, list: ['eq', 'amp', 'eq2'] },
  { eqPos1: 1, eqPos2: 0, list: ['eq2', 'amp', 'eq'] },
];

const BLOCK_LABELS: Record<RoutingChainBlockId, string> = {
  input: 'Input',
  pdl: 'Pedal FX',
  bst: 'Booster',
  mod: 'Mod',
  fx: 'FX',
  fv: 'FV',
  sr: 'Send/Return',
  dly1: 'Delay 1',
  dly2: 'Delay 2',
  rev: 'Reverb',
  eq: 'EQ1',
  eq2: 'EQ2',
  amp: 'Amp',
  speaker: 'Speaker',
};

export function buildRoutingChainOrder(params: {
  chainPattern: number;
  pedalFxPosition: number;
  sendReturnPosition: number;
  eq1Position: number;
  eq2Position: number;
}): RoutingChainBlockId[] {
  const pdlVal = clampInt(params.pedalFxPosition, 0, 1);
  const srVal = clampInt(params.sendReturnPosition, 0, 2);
  const chainPattern = clampInt(params.chainPattern, 0, 8);
  const eqPos1 = clampInt(params.eq1Position, 0, 1);
  const eqPos2 = clampInt(params.eq2Position, 0, 1);

  const baseFlow = BASE_FLOWS.find((flow) => flow.pdlVal === pdlVal && flow.srVal === srVal)?.list[chainPattern];
  if (!baseFlow) {
    return [];
  }
  const eqFlow = EQ_FLOWS.find((flow) => flow.eqPos1 === eqPos1 && flow.eqPos2 === eqPos2)?.list;
  if (!eqFlow) {
    return [...baseFlow];
  }
  const ampIndex = baseFlow.indexOf('amp');
  if (ampIndex < 0) {
    return [...baseFlow];
  }
  return [...baseFlow.slice(0, ampIndex), ...eqFlow, ...baseFlow.slice(ampIndex + 1)];
}

export function routingChainBlockLabel(blockId: RoutingChainBlockId): string {
  return BLOCK_LABELS[blockId];
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.trunc(value)));
}
