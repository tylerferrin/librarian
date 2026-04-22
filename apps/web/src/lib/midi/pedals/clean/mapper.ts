// MIDI CC mapping for Clean parameters
// Ported from apps/desktop/tauri/src/midi/pedals/clean/mapper.rs

import type {
  CleanParameter,
  CleanState,
  ReleaseMode,
  EffectMode,
  PhysicsMode,
  EnvelopeMode,
  SpreadRouting,
  SweepDirection,
  Polarity,
} from './types';

// ============================================================================
// Enum → CC value helpers
// ============================================================================

function releaseModeToCCValue(m: ReleaseMode): number {
  switch (m) { case 'Fast': return 1; case 'User': return 2; case 'Slow': return 3; }
}
function releaseModeFromCCValue(v: number): ReleaseMode {
  if (v === 2) return 'User'; if (v === 3) return 'Slow'; return 'Fast';
}

function effectModeToCCValue(m: EffectMode): number {
  switch (m) { case 'Shifty': return 1; case 'Manual': return 2; case 'Modulated': return 3; }
}
function effectModeFromCCValue(v: number): EffectMode {
  if (v === 2) return 'Manual'; if (v === 3) return 'Modulated'; return 'Shifty';
}

function physicsModeToCCValue(m: PhysicsMode): number {
  switch (m) { case 'Wobbly': return 1; case 'Off': return 2; case 'Twitchy': return 3; }
}
function physicsModeFromCCValue(v: number): PhysicsMode {
  if (v === 2) return 'Off'; if (v === 3) return 'Twitchy'; return 'Wobbly';
}

function envelopeModeToCCValue(m: EnvelopeMode): number {
  switch (m) { case 'Analog': return 1; case 'Hybrid': return 2; case 'Adaptive': return 3; }
}
function envelopeModeFromCCValue(v: number): EnvelopeMode {
  if (v === 2) return 'Hybrid'; if (v === 3) return 'Adaptive'; return 'Analog';
}

function spreadRoutingToCCValue(r: SpreadRouting): number {
  switch (r) { case 'Eq': return 1; case 'Both': return 2; case 'VolComp': return 3; }
}
function spreadRoutingFromCCValue(v: number): SpreadRouting {
  if (v === 2) return 'Both'; if (v === 3) return 'VolComp'; return 'Eq';
}

function sweepDirectionToCCValue(d: SweepDirection): number { return d === 'Bottom' ? 0 : 127; }
function sweepDirectionFromCCValue(v: number): SweepDirection { return v < 64 ? 'Bottom' : 'Top'; }
function polarityToCCValue(p: Polarity): number { return p === 'Forward' ? 0 : 127; }
function polarityFromCCValue(v: number): Polarity { return v < 64 ? 'Forward' : 'Reverse'; }

// ============================================================================
// Parameter → CC number
// ============================================================================

export function parameterCCNumber(param: CleanParameter): number {
  if ('Dynamics' in param)        return 14;
  if ('Sensitivity' in param)     return 15;
  if ('Wet' in param)             return 16;
  if ('Attack' in param)          return 17;
  if ('Eq' in param)              return 18;
  if ('Dry' in param)             return 19;
  if ('RampSpeed' in param)       return 20;
  if ('ReleaseMode' in param)     return 21;
  if ('EffectMode' in param)      return 22;
  if ('PhysicsMode' in param)     return 23;
  if ('NoiseGateRelease' in param) return 24;
  if ('NoiseGateSens' in param)   return 25;
  if ('SwellIn' in param)         return 26;
  if ('UserRelease' in param)     return 27;
  if ('BalanceFilter' in param)   return 28;
  if ('SwellOut' in param)        return 29;
  if ('EnvelopeMode' in param)    return 31;
  if ('ShiftyMode' in param)      return 32;
  if ('SpreadRouting' in param)   return 33;
  if ('RampBounce' in param)      return 52;
  if ('DipDynamics' in param)     return 61;
  if ('DipAttack' in param)       return 62;
  if ('DipEq' in param)           return 63;
  if ('DipDry' in param)          return 64;
  if ('DipWet' in param)          return 65;
  if ('DipBounce' in param)       return 66;
  if ('DipSweep' in param)        return 67;
  if ('DipPolarity' in param)     return 68;
  if ('DipMiso' in param)         return 71;
  if ('DipSpread' in param)       return 72;
  if ('DipLatch' in param)        return 73;
  if ('DipSidechain' in param)    return 74;
  if ('DipNoiseGate' in param)    return 75;
  if ('DipMotion' in param)       return 76;
  if ('DipSwellAux' in param)     return 77;
  if ('DipDusty' in param)        return 78;
  if ('Expression' in param)      return 100;
  if ('Bypass' in param)          return 102;
  if ('Swell' in param)           return 103;
  if ('AltMode' in param)         return 104;
  if ('SwellHold' in param)       return 105;
  if ('DynamicsMax' in param)     return 106;
  if ('PresetSave' in param)      return 111;
  throw new Error(`Unknown CleanParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// Parameter → CC value
// ============================================================================

export function parameterCCValue(param: CleanParameter): number {
  if ('Dynamics' in param)        return param.Dynamics;
  if ('Sensitivity' in param)     return param.Sensitivity;
  if ('Wet' in param)             return param.Wet;
  if ('Attack' in param)          return param.Attack;
  if ('Eq' in param)              return param.Eq;
  if ('Dry' in param)             return param.Dry;
  if ('RampSpeed' in param)       return param.RampSpeed;
  if ('NoiseGateRelease' in param) return param.NoiseGateRelease;
  if ('NoiseGateSens' in param)   return param.NoiseGateSens;
  if ('SwellIn' in param)         return param.SwellIn;
  if ('UserRelease' in param)     return param.UserRelease;
  if ('BalanceFilter' in param)   return param.BalanceFilter;
  if ('SwellOut' in param)        return param.SwellOut;
  if ('ShiftyMode' in param)      return param.ShiftyMode;
  if ('Expression' in param)      return param.Expression;
  if ('PresetSave' in param)      return param.PresetSave;
  if ('ReleaseMode' in param)     return releaseModeToCCValue(param.ReleaseMode);
  if ('EffectMode' in param)      return effectModeToCCValue(param.EffectMode);
  if ('PhysicsMode' in param)     return physicsModeToCCValue(param.PhysicsMode);
  if ('EnvelopeMode' in param)    return envelopeModeToCCValue(param.EnvelopeMode);
  if ('SpreadRouting' in param)   return spreadRoutingToCCValue(param.SpreadRouting);
  if ('DipSweep' in param)        return sweepDirectionToCCValue(param.DipSweep);
  if ('DipPolarity' in param)     return polarityToCCValue(param.DipPolarity);
  // Binary params
  if ('Bypass' in param)          return param.Bypass ? 127 : 0;
  if ('Swell' in param)           return param.Swell ? 127 : 0;
  if ('AltMode' in param)         return param.AltMode ? 127 : 0;
  if ('SwellHold' in param)       return param.SwellHold ? 127 : 0;
  if ('DynamicsMax' in param)     return param.DynamicsMax ? 127 : 0;
  if ('DipDynamics' in param)     return param.DipDynamics ? 127 : 0;
  if ('DipAttack' in param)       return param.DipAttack ? 127 : 0;
  if ('DipEq' in param)           return param.DipEq ? 127 : 0;
  if ('DipDry' in param)          return param.DipDry ? 127 : 0;
  if ('DipWet' in param)          return param.DipWet ? 127 : 0;
  if ('DipBounce' in param)       return param.DipBounce ? 127 : 0;
  if ('DipMiso' in param)         return param.DipMiso ? 127 : 0;
  if ('DipSpread' in param)       return param.DipSpread ? 127 : 0;
  if ('DipLatch' in param)        return param.DipLatch ? 127 : 0;
  if ('DipSidechain' in param)    return param.DipSidechain ? 127 : 0;
  if ('DipNoiseGate' in param)    return param.DipNoiseGate ? 127 : 0;
  if ('DipMotion' in param)       return param.DipMotion ? 127 : 0;
  if ('DipSwellAux' in param)     return param.DipSwellAux ? 127 : 0;
  if ('DipDusty' in param)        return param.DipDusty ? 127 : 0;
  if ('RampBounce' in param)      return param.RampBounce ? 127 : 0;
  throw new Error(`Unknown CleanParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// State → CC map
// ============================================================================

export function stateToCCMap(state: CleanState): Map<number, number> {
  const map = new Map<number, number>();
  map.set(14, state.dynamics);
  map.set(15, state.sensitivity);
  map.set(16, state.wet);
  map.set(17, state.attack);
  map.set(18, state.eq);
  map.set(19, state.dry);
  map.set(20, state.ramp_speed);
  map.set(21, releaseModeToCCValue(state.release_mode));
  map.set(22, effectModeToCCValue(state.effect_mode));
  map.set(23, physicsModeToCCValue(state.physics_mode));
  map.set(24, state.noise_gate_release);
  map.set(25, state.noise_gate_sens);
  map.set(26, state.swell_in);
  map.set(27, state.user_release);
  map.set(28, state.balance_filter);
  map.set(29, state.swell_out);
  map.set(31, envelopeModeToCCValue(state.envelope_mode));
  map.set(32, state.shifty_mode);
  map.set(33, spreadRoutingToCCValue(state.spread_routing));
  map.set(52, state.ramp_bounce ? 127 : 0);
  map.set(61, state.dip_dynamics ? 127 : 0);
  map.set(62, state.dip_attack ? 127 : 0);
  map.set(63, state.dip_eq ? 127 : 0);
  map.set(64, state.dip_dry ? 127 : 0);
  map.set(65, state.dip_wet ? 127 : 0);
  map.set(66, state.dip_bounce ? 127 : 0);
  map.set(67, sweepDirectionToCCValue(state.dip_sweep));
  map.set(68, polarityToCCValue(state.dip_polarity));
  map.set(71, state.dip_miso ? 127 : 0);
  map.set(72, state.dip_spread ? 127 : 0);
  map.set(73, state.dip_latch ? 127 : 0);
  map.set(74, state.dip_sidechain ? 127 : 0);
  map.set(75, state.dip_noise_gate ? 127 : 0);
  map.set(76, state.dip_motion ? 127 : 0);
  map.set(77, state.dip_swell_aux ? 127 : 0);
  map.set(78, state.dip_dusty ? 127 : 0);
  map.set(100, state.expression);
  map.set(102, state.bypass ? 127 : 0);
  map.set(103, state.swell ? 127 : 0);
  map.set(104, state.alt_mode ? 127 : 0);
  map.set(105, state.swell_hold ? 127 : 0);
  map.set(106, state.dynamics_max ? 127 : 0);
  return map;
}

// ============================================================================
// CC → Parameter
// ============================================================================

export function ccToParameter(cc: number, value: number): CleanParameter | null {
  switch (cc) {
    case 14:  return { Dynamics: value };
    case 15:  return { Sensitivity: value };
    case 16:  return { Wet: value };
    case 17:  return { Attack: value };
    case 18:  return { Eq: value };
    case 19:  return { Dry: value };
    case 20:  return { RampSpeed: value };
    case 21:  return { ReleaseMode: releaseModeFromCCValue(value) };
    case 22:  return { EffectMode: effectModeFromCCValue(value) };
    case 23:  return { PhysicsMode: physicsModeFromCCValue(value) };
    case 24:  return { NoiseGateRelease: value };
    case 25:  return { NoiseGateSens: value };
    case 26:  return { SwellIn: value };
    case 27:  return { UserRelease: value };
    case 28:  return { BalanceFilter: value };
    case 29:  return { SwellOut: value };
    case 31:  return { EnvelopeMode: envelopeModeFromCCValue(value) };
    case 32:  return { ShiftyMode: value };
    case 33:  return { SpreadRouting: spreadRoutingFromCCValue(value) };
    case 52:  return { RampBounce: value >= 64 };
    case 61:  return { DipDynamics: value >= 64 };
    case 62:  return { DipAttack: value >= 64 };
    case 63:  return { DipEq: value >= 64 };
    case 64:  return { DipDry: value >= 64 };
    case 65:  return { DipWet: value >= 64 };
    case 66:  return { DipBounce: value >= 64 };
    case 67:  return { DipSweep: sweepDirectionFromCCValue(value) };
    case 68:  return { DipPolarity: polarityFromCCValue(value) };
    case 71:  return { DipMiso: value >= 64 };
    case 72:  return { DipSpread: value >= 64 };
    case 73:  return { DipLatch: value >= 64 };
    case 74:  return { DipSidechain: value >= 64 };
    case 75:  return { DipNoiseGate: value >= 64 };
    case 76:  return { DipMotion: value >= 64 };
    case 77:  return { DipSwellAux: value >= 64 };
    case 78:  return { DipDusty: value >= 64 };
    case 100: return { Expression: value };
    case 102: return { Bypass: value >= 64 };
    case 103: return { Swell: value >= 64 };
    case 104: return { AltMode: value >= 64 };
    case 105: return { SwellHold: value >= 64 };
    case 106: return { DynamicsMax: value >= 64 };
    case 111: return { PresetSave: value };
    default:  return null;
  }
}
