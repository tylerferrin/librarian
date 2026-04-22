// MIDI CC mapping for Preamp MK II parameters
// Ported from apps/desktop/tauri/src/midi/pedals/preamp_mk2/mapper.rs

import type {
  PreampMk2Parameter,
  PreampMk2State,
  Jump,
  MidsPosition,
  QResonance,
  DiodeClipping,
  FuzzMode,
} from './types';

// ============================================================================
// Enum → CC value helpers (arcade buttons: 1/2/3)
// NOTE: Bypass uses inverted logic: true (bypass) → 0; false (engage) → 127
// ============================================================================

function jumpToCCValue(j: Jump): number {
  switch (j) { case 'Off': return 1; case 'Zero': return 2; case 'Five': return 3; }
}
function jumpFromCCValue(v: number): Jump {
  if (v === 2) return 'Zero'; if (v === 3) return 'Five'; return 'Off';
}

function midsPositionToCCValue(m: MidsPosition): number {
  switch (m) { case 'Off': return 1; case 'Pre': return 2; case 'Post': return 3; }
}
function midsPositionFromCCValue(v: number): MidsPosition {
  if (v === 2) return 'Pre'; if (v === 3) return 'Post'; return 'Off';
}

function qResonanceToCCValue(q: QResonance): number {
  switch (q) { case 'Low': return 1; case 'Mid': return 2; case 'High': return 3; }
}
function qResonanceFromCCValue(v: number): QResonance {
  if (v === 2) return 'Mid'; if (v === 3) return 'High'; return 'Low';
}

function diodeClippingToCCValue(d: DiodeClipping): number {
  switch (d) { case 'Off': return 1; case 'Silicon': return 2; case 'Germanium': return 3; }
}
function diodeClippingFromCCValue(v: number): DiodeClipping {
  if (v === 2) return 'Silicon'; if (v === 3) return 'Germanium'; return 'Off';
}

function fuzzModeToCCValue(f: FuzzMode): number {
  switch (f) { case 'Off': return 1; case 'Open': return 2; case 'Gated': return 3; }
}
function fuzzModeFromCCValue(v: number): FuzzMode {
  if (v === 2) return 'Open'; if (v === 3) return 'Gated'; return 'Off';
}

// ============================================================================
// Parameter → CC number
// ============================================================================

export function parameterCCNumber(param: PreampMk2Parameter): number {
  if ('Volume' in param)        return 14;
  if ('Treble' in param)        return 15;
  if ('Mids' in param)          return 16;
  if ('Frequency' in param)     return 17;
  if ('Bass' in param)          return 18;
  if ('Gain' in param)          return 19;
  if ('Jump' in param)          return 22;
  if ('MidsPosition' in param)  return 23;
  if ('QResonance' in param)    return 24;
  if ('DiodeClipping' in param) return 25;
  if ('FuzzMode' in param)      return 26;
  if ('Expression' in param)    return 100;
  if ('Bypass' in param)        return 102;
  throw new Error(`Unknown PreampMk2Parameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// Parameter → CC value
// ============================================================================

export function parameterCCValue(param: PreampMk2Parameter): number {
  if ('Volume' in param)        return param.Volume;
  if ('Treble' in param)        return param.Treble;
  if ('Mids' in param)          return param.Mids;
  if ('Frequency' in param)     return param.Frequency;
  if ('Bass' in param)          return param.Bass;
  if ('Gain' in param)          return param.Gain;
  if ('Expression' in param)    return param.Expression;
  if ('Jump' in param)          return jumpToCCValue(param.Jump);
  if ('MidsPosition' in param)  return midsPositionToCCValue(param.MidsPosition);
  if ('QResonance' in param)    return qResonanceToCCValue(param.QResonance);
  if ('DiodeClipping' in param) return diodeClippingToCCValue(param.DiodeClipping);
  if ('FuzzMode' in param)      return fuzzModeToCCValue(param.FuzzMode);
  if ('Bypass' in param)        return param.Bypass ? 0 : 127;
  throw new Error(`Unknown PreampMk2Parameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// State → CC map (for full preset recall)
// NOTE: Expression (CC 100) and Bypass (CC 102) excluded from recall map
// ============================================================================

export function stateToCCMap(state: PreampMk2State): Map<number, number> {
  const map = new Map<number, number>();
  map.set(14, state.volume);
  map.set(15, state.treble);
  map.set(16, state.mids);
  map.set(17, state.frequency);
  map.set(18, state.bass);
  map.set(19, state.gain);
  map.set(22, jumpToCCValue(state.jump));
  map.set(23, midsPositionToCCValue(state.mids_position));
  map.set(24, qResonanceToCCValue(state.q_resonance));
  map.set(25, diodeClippingToCCValue(state.diode_clipping));
  map.set(26, fuzzModeToCCValue(state.fuzz_mode));
  // Expression and Bypass intentionally excluded
  return map;
}

// ============================================================================
// CC → Parameter (for useMIDIInput bidirectional updates)
// ============================================================================

export function ccToParameter(cc: number, value: number): PreampMk2Parameter | null {
  switch (cc) {
    case 14:  return { Volume: value };
    case 15:  return { Treble: value };
    case 16:  return { Mids: value };
    case 17:  return { Frequency: value };
    case 18:  return { Bass: value };
    case 19:  return { Gain: value };
    case 22:  return { Jump: jumpFromCCValue(value) };
    case 23:  return { MidsPosition: midsPositionFromCCValue(value) };
    case 24:  return { QResonance: qResonanceFromCCValue(value) };
    case 25:  return { DiodeClipping: diodeClippingFromCCValue(value) };
    case 26:  return { FuzzMode: fuzzModeFromCCValue(value) };
    case 100: return { Expression: value };
    case 102: return { Bypass: value === 0 };
    default:  return null;
  }
}
