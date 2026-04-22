// MIDI CC mapping for CXM 1978 parameters
// Ported from apps/desktop/tauri/src/midi/pedals/cxm1978/mapper.rs

import type { Cxm1978Parameter, Cxm1978State, Jump, ReverbType, Diffusion, TankMod, Clock } from './types';

// ============================================================================
// Enum → CC value helpers (arcade buttons: 1/2/3)
// NOTE: Bypass uses inverted logic: 0 = bypass, 127 = engage
// ============================================================================

function jumpToCCValue(j: Jump): number {
  switch (j) { case 'Off': return 1; case 'Zero': return 2; case 'Five': return 3; }
}
function jumpFromCCValue(v: number): Jump {
  if (v === 2) return 'Zero'; if (v === 3) return 'Five'; return 'Off';
}

function reverbTypeToCCValue(r: ReverbType): number {
  switch (r) { case 'Room': return 1; case 'Plate': return 2; case 'Hall': return 3; }
}
function reverbTypeFromCCValue(v: number): ReverbType {
  if (v === 2) return 'Plate'; if (v === 3) return 'Hall'; return 'Room';
}

function diffusionToCCValue(d: Diffusion): number {
  switch (d) { case 'Low': return 1; case 'Med': return 2; case 'High': return 3; }
}
function diffusionFromCCValue(v: number): Diffusion {
  if (v === 2) return 'Med'; if (v === 3) return 'High'; return 'Low';
}

function tankModToCCValue(t: TankMod): number {
  switch (t) { case 'Low': return 1; case 'Med': return 2; case 'High': return 3; }
}
function tankModFromCCValue(v: number): TankMod {
  if (v === 2) return 'Med'; if (v === 3) return 'High'; return 'Low';
}

function clockToCCValue(c: Clock): number {
  switch (c) { case 'HiFi': return 1; case 'Standard': return 2; case 'LoFi': return 3; }
}
function clockFromCCValue(v: number): Clock {
  if (v === 1) return 'HiFi'; if (v === 3) return 'LoFi'; return 'Standard';
}

// ============================================================================
// Parameter → CC number
// ============================================================================

export function parameterCCNumber(param: Cxm1978Parameter): number {
  if ('Bass' in param)       return 14;
  if ('Mids' in param)       return 15;
  if ('Cross' in param)      return 16;
  if ('Treble' in param)     return 17;
  if ('Mix' in param)        return 18;
  if ('PreDly' in param)     return 19;
  if ('Jump' in param)       return 22;
  if ('ReverbType' in param) return 23;
  if ('Diffusion' in param)  return 24;
  if ('TankMod' in param)    return 25;
  if ('Clock' in param)      return 26;
  if ('Expression' in param) return 100;
  if ('Bypass' in param)     return 102;
  throw new Error(`Unknown Cxm1978Parameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// Parameter → CC value
// NOTE: Bypass uses inverted logic: true (bypass) → 0; false (engage) → 127
// ============================================================================

export function parameterCCValue(param: Cxm1978Parameter): number {
  if ('Bass' in param)       return param.Bass;
  if ('Mids' in param)       return param.Mids;
  if ('Cross' in param)      return param.Cross;
  if ('Treble' in param)     return param.Treble;
  if ('Mix' in param)        return param.Mix;
  if ('PreDly' in param)     return param.PreDly;
  if ('Expression' in param) return param.Expression;
  if ('Jump' in param)       return jumpToCCValue(param.Jump);
  if ('ReverbType' in param) return reverbTypeToCCValue(param.ReverbType);
  if ('Diffusion' in param)  return diffusionToCCValue(param.Diffusion);
  if ('TankMod' in param)    return tankModToCCValue(param.TankMod);
  if ('Clock' in param)      return clockToCCValue(param.Clock);
  if ('Bypass' in param)     return param.Bypass ? 0 : 127;
  throw new Error(`Unknown Cxm1978Parameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// State → CC map (for full preset recall)
// NOTE: Expression (CC 100) and Bypass (CC 102) excluded from recall map
// ============================================================================

export function stateToCCMap(state: Cxm1978State): Map<number, number> {
  const map = new Map<number, number>();
  map.set(14, state.bass);
  map.set(15, state.mids);
  map.set(16, state.cross);
  map.set(17, state.treble);
  map.set(18, state.mix);
  map.set(19, state.pre_dly);
  map.set(22, jumpToCCValue(state.jump));
  map.set(23, reverbTypeToCCValue(state.reverb_type));
  map.set(24, diffusionToCCValue(state.diffusion));
  map.set(25, tankModToCCValue(state.tank_mod));
  map.set(26, clockToCCValue(state.clock));
  // Expression and Bypass intentionally excluded
  return map;
}

// ============================================================================
// CC → Parameter (for useMIDIInput bidirectional updates)
// ============================================================================

export function ccToParameter(cc: number, value: number): Cxm1978Parameter | null {
  switch (cc) {
    case 14:  return { Bass: value };
    case 15:  return { Mids: value };
    case 16:  return { Cross: value };
    case 17:  return { Treble: value };
    case 18:  return { Mix: value };
    case 19:  return { PreDly: value };
    case 22:  return { Jump: jumpFromCCValue(value) };
    case 23:  return { ReverbType: reverbTypeFromCCValue(value) };
    case 24:  return { Diffusion: diffusionFromCCValue(value) };
    case 25:  return { TankMod: tankModFromCCValue(value) };
    case 26:  return { Clock: clockFromCCValue(value) };
    case 100: return { Expression: value };
    case 102: return { Bypass: value === 0 }; // 0 = bypass
    default:  return null;
  }
}
