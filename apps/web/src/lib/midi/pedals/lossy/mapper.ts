// MIDI CC mapping for Lossy parameters
// Ported from apps/desktop/tauri/src/midi/pedals/lossy/mapper.rs

import type {
  LossyParameter,
  LossyState,
  FilterSlope,
  PacketMode,
  LossEffect,
  Weighting,
  SweepDirection,
  Polarity,
} from './types';

function filterSlopeToCCValue(f: FilterSlope): number {
  switch (f) { case 'Db6': return 1; case 'Db24': return 2; case 'Db96': return 3; }
}
function filterSlopeFromCCValue(v: number): FilterSlope {
  if (v === 2) return 'Db24'; if (v === 3) return 'Db96'; return 'Db6';
}

function packetModeToCCValue(p: PacketMode): number {
  switch (p) { case 'Repeat': return 1; case 'Clean': return 2; case 'LossMode': return 3; }
}
function packetModeFromCCValue(v: number): PacketMode {
  if (v === 2) return 'Clean'; if (v === 3) return 'LossMode'; return 'Repeat';
}

function lossEffectToCCValue(l: LossEffect): number {
  switch (l) { case 'Inverse': return 1; case 'Standard': return 2; case 'Jitter': return 3; }
}
function lossEffectFromCCValue(v: number): LossEffect {
  if (v === 2) return 'Standard'; if (v === 3) return 'Jitter'; return 'Inverse';
}

function weightingToCCValue(w: Weighting): number {
  switch (w) { case 'Dark': return 1; case 'Neutral': return 2; case 'Bright': return 3; }
}
function weightingFromCCValue(v: number): Weighting {
  if (v === 2) return 'Neutral'; if (v === 3) return 'Bright'; return 'Dark';
}

function sweepDirectionToCCValue(d: SweepDirection): number { return d === 'Bottom' ? 0 : 127; }
function sweepDirectionFromCCValue(v: number): SweepDirection { return v < 64 ? 'Bottom' : 'Top'; }
function polarityToCCValue(p: Polarity): number { return p === 'Forward' ? 0 : 127; }
function polarityFromCCValue(v: number): Polarity { return v < 64 ? 'Forward' : 'Reverse'; }

export function parameterCCNumber(param: LossyParameter): number {
  if ('Filter' in param)          return 14;
  if ('Global' in param)          return 15;
  if ('Reverb' in param)          return 16;
  if ('Freq' in param)            return 17;
  if ('Speed' in param)           return 18;
  if ('Loss' in param)            return 19;
  if ('RampSpeed' in param)       return 20;
  if ('FilterSlope' in param)     return 21;
  if ('PacketMode' in param)      return 22;
  if ('LossEffect' in param)      return 23;
  if ('Gate' in param)            return 24;
  if ('Freezer' in param)         return 25;
  if ('VerbDecay' in param)       return 26;
  if ('LimiterThreshold' in param) return 27;
  if ('AutoGain' in param)        return 28;
  if ('LossGain' in param)        return 29;
  if ('Weighting' in param)       return 33;
  if ('RampBounce' in param)      return 52;
  if ('DryKill' in param)         return 57;
  if ('DipFilter' in param)       return 61;
  if ('DipFreq' in param)         return 62;
  if ('DipSpeed' in param)        return 63;
  if ('DipLoss' in param)         return 64;
  if ('DipVerb' in param)         return 65;
  if ('DipBounce' in param)       return 66;
  if ('DipSweep' in param)        return 67;
  if ('DipPolarity' in param)     return 68;
  if ('DipMiso' in param)         return 71;
  if ('DipSpread' in param)       return 72;
  if ('DipTrails' in param)       return 73;
  if ('DipLatch' in param)        return 74;
  if ('DipPrePost' in param)      return 75;
  if ('DipSlow' in param)         return 76;
  if ('DipInvert' in param)       return 77;
  if ('DipAllWet' in param)       return 78;
  if ('Expression' in param)      return 100;
  if ('Bypass' in param)          return 102;
  if ('FreezeSlushie' in param)   return 103;
  if ('AltMode' in param)         return 104;
  if ('FreezeSolid' in param)     return 105;
  if ('GateSwitch' in param)      return 106;
  if ('PresetSave' in param)      return 111;
  throw new Error(`Unknown LossyParameter: ${JSON.stringify(param)}`);
}

export function parameterCCValue(param: LossyParameter): number {
  if ('Filter' in param)          return param.Filter;
  if ('Global' in param)          return param.Global;
  if ('Reverb' in param)          return param.Reverb;
  if ('Freq' in param)            return param.Freq;
  if ('Speed' in param)           return param.Speed;
  if ('Loss' in param)            return param.Loss;
  if ('RampSpeed' in param)       return param.RampSpeed;
  if ('Gate' in param)            return param.Gate;
  if ('Freezer' in param)         return param.Freezer;
  if ('VerbDecay' in param)       return param.VerbDecay;
  if ('LimiterThreshold' in param) return param.LimiterThreshold;
  if ('AutoGain' in param)        return param.AutoGain;
  if ('LossGain' in param)        return param.LossGain;
  if ('Expression' in param)      return param.Expression;
  if ('PresetSave' in param)      return param.PresetSave;
  if ('FilterSlope' in param)     return filterSlopeToCCValue(param.FilterSlope);
  if ('PacketMode' in param)      return packetModeToCCValue(param.PacketMode);
  if ('LossEffect' in param)      return lossEffectToCCValue(param.LossEffect);
  if ('Weighting' in param)       return weightingToCCValue(param.Weighting);
  if ('DipSweep' in param)        return sweepDirectionToCCValue(param.DipSweep);
  if ('DipPolarity' in param)     return polarityToCCValue(param.DipPolarity);
  if ('Bypass' in param)          return param.Bypass ? 127 : 0;
  if ('FreezeSlushie' in param)   return param.FreezeSlushie ? 127 : 0;
  if ('AltMode' in param)         return param.AltMode ? 127 : 0;
  if ('FreezeSolid' in param)     return param.FreezeSolid ? 127 : 0;
  if ('GateSwitch' in param)      return param.GateSwitch ? 127 : 0;
  if ('DipFilter' in param)       return param.DipFilter ? 127 : 0;
  if ('DipFreq' in param)         return param.DipFreq ? 127 : 0;
  if ('DipSpeed' in param)        return param.DipSpeed ? 127 : 0;
  if ('DipLoss' in param)         return param.DipLoss ? 127 : 0;
  if ('DipVerb' in param)         return param.DipVerb ? 127 : 0;
  if ('DipBounce' in param)       return param.DipBounce ? 127 : 0;
  if ('DipMiso' in param)         return param.DipMiso ? 127 : 0;
  if ('DipSpread' in param)       return param.DipSpread ? 127 : 0;
  if ('DipTrails' in param)       return param.DipTrails ? 127 : 0;
  if ('DipLatch' in param)        return param.DipLatch ? 127 : 0;
  if ('DipPrePost' in param)      return param.DipPrePost ? 127 : 0;
  if ('DipSlow' in param)         return param.DipSlow ? 127 : 0;
  if ('DipInvert' in param)       return param.DipInvert ? 127 : 0;
  if ('DipAllWet' in param)       return param.DipAllWet ? 127 : 0;
  if ('RampBounce' in param)      return param.RampBounce ? 127 : 0;
  if ('DryKill' in param)         return param.DryKill ? 127 : 0;
  throw new Error(`Unknown LossyParameter: ${JSON.stringify(param)}`);
}

export function stateToCCMap(state: LossyState): Map<number, number> {
  const map = new Map<number, number>();
  map.set(14, state.filter);
  map.set(15, state.global);
  map.set(16, state.reverb);
  map.set(17, state.freq);
  map.set(18, state.speed);
  map.set(19, state.loss);
  map.set(20, state.ramp_speed);
  map.set(21, filterSlopeToCCValue(state.filter_slope));
  map.set(22, packetModeToCCValue(state.packet_mode));
  map.set(23, lossEffectToCCValue(state.loss_effect));
  map.set(24, state.gate);
  map.set(25, state.freezer);
  map.set(26, state.verb_decay);
  map.set(27, state.limiter_threshold);
  map.set(28, state.auto_gain);
  map.set(29, state.loss_gain);
  map.set(33, weightingToCCValue(state.weighting));
  map.set(52, state.ramp_bounce ? 127 : 0);
  map.set(57, state.dry_kill ? 127 : 0);
  map.set(61, state.dip_filter ? 127 : 0);
  map.set(62, state.dip_freq ? 127 : 0);
  map.set(63, state.dip_speed ? 127 : 0);
  map.set(64, state.dip_loss ? 127 : 0);
  map.set(65, state.dip_verb ? 127 : 0);
  map.set(66, state.dip_bounce ? 127 : 0);
  map.set(67, sweepDirectionToCCValue(state.dip_sweep));
  map.set(68, polarityToCCValue(state.dip_polarity));
  map.set(71, state.dip_miso ? 127 : 0);
  map.set(72, state.dip_spread ? 127 : 0);
  map.set(73, state.dip_trails ? 127 : 0);
  map.set(74, state.dip_latch ? 127 : 0);
  map.set(75, state.dip_pre_post ? 127 : 0);
  map.set(76, state.dip_slow ? 127 : 0);
  map.set(77, state.dip_invert ? 127 : 0);
  map.set(78, state.dip_all_wet ? 127 : 0);
  map.set(100, state.expression);
  map.set(102, state.bypass ? 127 : 0);
  map.set(103, state.freeze_slushie ? 127 : 0);
  map.set(104, state.alt_mode ? 127 : 0);
  map.set(105, state.freeze_solid ? 127 : 0);
  map.set(106, state.gate_switch ? 127 : 0);
  return map;
}

export function ccToParameter(cc: number, value: number): LossyParameter | null {
  switch (cc) {
    case 14:  return { Filter: value };
    case 15:  return { Global: value };
    case 16:  return { Reverb: value };
    case 17:  return { Freq: value };
    case 18:  return { Speed: value };
    case 19:  return { Loss: value };
    case 20:  return { RampSpeed: value };
    case 21:  return { FilterSlope: filterSlopeFromCCValue(value) };
    case 22:  return { PacketMode: packetModeFromCCValue(value) };
    case 23:  return { LossEffect: lossEffectFromCCValue(value) };
    case 24:  return { Gate: value };
    case 25:  return { Freezer: value };
    case 26:  return { VerbDecay: value };
    case 27:  return { LimiterThreshold: value };
    case 28:  return { AutoGain: value };
    case 29:  return { LossGain: value };
    case 33:  return { Weighting: weightingFromCCValue(value) };
    case 52:  return { RampBounce: value >= 64 };
    case 57:  return { DryKill: value >= 64 };
    case 61:  return { DipFilter: value >= 64 };
    case 62:  return { DipFreq: value >= 64 };
    case 63:  return { DipSpeed: value >= 64 };
    case 64:  return { DipLoss: value >= 64 };
    case 65:  return { DipVerb: value >= 64 };
    case 66:  return { DipBounce: value >= 64 };
    case 67:  return { DipSweep: sweepDirectionFromCCValue(value) };
    case 68:  return { DipPolarity: polarityFromCCValue(value) };
    case 71:  return { DipMiso: value >= 64 };
    case 72:  return { DipSpread: value >= 64 };
    case 73:  return { DipTrails: value >= 64 };
    case 74:  return { DipLatch: value >= 64 };
    case 75:  return { DipPrePost: value >= 64 };
    case 76:  return { DipSlow: value >= 64 };
    case 77:  return { DipInvert: value >= 64 };
    case 78:  return { DipAllWet: value >= 64 };
    case 100: return { Expression: value };
    case 102: return { Bypass: value >= 64 };
    case 103: return { FreezeSlushie: value >= 64 };
    case 104: return { AltMode: value >= 64 };
    case 105: return { FreezeSolid: value >= 64 };
    case 106: return { GateSwitch: value >= 64 };
    case 111: return { PresetSave: value };
    default:  return null;
  }
}
