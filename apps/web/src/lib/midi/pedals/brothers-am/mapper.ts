// MIDI CC mapping for Brothers AM parameters
// Ported from apps/desktop/tauri/src/midi/pedals/brothers_am/mapper.rs

import type {
  BrothersAmParameter,
  BrothersAmState,
  Gain2Type,
  TrebleBoost,
  Gain1Type,
  SweepDirection,
  Polarity,
} from './types';

function gain2TypeToCCValue(g: Gain2Type): number {
  switch (g) { case 'Boost': return 1; case 'OD': return 2; case 'Dist': return 3; }
}
function gain2TypeFromCCValue(v: number): Gain2Type {
  if (v === 2) return 'OD'; if (v === 3) return 'Dist'; return 'Boost';
}

function trebleBoostToCCValue(t: TrebleBoost): number {
  switch (t) { case 'FullSun': return 1; case 'Off': return 2; case 'HalfSun': return 3; }
}
function trebleBoostFromCCValue(v: number): TrebleBoost {
  if (v === 2) return 'Off'; if (v === 3) return 'HalfSun'; return 'FullSun';
}

function gain1TypeToCCValue(g: Gain1Type): number {
  switch (g) { case 'Dist': return 1; case 'OD': return 2; case 'Boost': return 3; }
}
function gain1TypeFromCCValue(v: number): Gain1Type {
  if (v === 2) return 'OD'; if (v === 3) return 'Boost'; return 'Dist';
}

function sweepDirectionToCCValue(d: SweepDirection): number { return d === 'Bottom' ? 0 : 127; }
function sweepDirectionFromCCValue(v: number): SweepDirection { return v < 64 ? 'Bottom' : 'Top'; }
function polarityToCCValue(p: Polarity): number { return p === 'Forward' ? 0 : 127; }
function polarityFromCCValue(v: number): Polarity { return v < 64 ? 'Forward' : 'Reverse'; }

export function parameterCCNumber(param: BrothersAmParameter): number {
  if ('Gain2' in param)        return 14;
  if ('Volume2' in param)      return 15;
  if ('Gain1' in param)        return 16;
  if ('Tone2' in param)        return 17;
  if ('Volume1' in param)      return 18;
  if ('Tone1' in param)        return 19;
  if ('Gain2Type' in param)    return 21;
  if ('TrebleBoost' in param)  return 22;
  if ('Gain1Type' in param)    return 23;
  if ('Presence2' in param)    return 27;
  if ('Presence1' in param)    return 29;
  if ('DipVolume1' in param)   return 61;
  if ('DipVolume2' in param)   return 62;
  if ('DipGain1' in param)     return 63;
  if ('DipGain2' in param)     return 64;
  if ('DipTone1' in param)     return 65;
  if ('DipTone2' in param)     return 66;
  if ('DipSweep' in param)     return 67;
  if ('DipPolarity' in param)  return 68;
  if ('DipHiGain1' in param)   return 71;
  if ('DipHiGain2' in param)   return 72;
  if ('DipMotoByp1' in param)  return 73;
  if ('DipMotoByp2' in param)  return 74;
  if ('DipPresLink1' in param) return 75;
  if ('DipPresLink2' in param) return 76;
  if ('DipMaster' in param)    return 77;
  if ('Expression' in param)   return 100;
  if ('Channel1Bypass' in param) return 102;
  if ('Channel2Bypass' in param) return 103;
  if ('PresetSave' in param)   return 111;
  throw new Error(`Unknown BrothersAmParameter: ${JSON.stringify(param)}`);
}

export function parameterCCValue(param: BrothersAmParameter): number {
  if ('Gain2' in param)        return param.Gain2;
  if ('Volume2' in param)      return param.Volume2;
  if ('Gain1' in param)        return param.Gain1;
  if ('Tone2' in param)        return param.Tone2;
  if ('Volume1' in param)      return param.Volume1;
  if ('Tone1' in param)        return param.Tone1;
  if ('Presence2' in param)    return param.Presence2;
  if ('Presence1' in param)    return param.Presence1;
  if ('Expression' in param)   return param.Expression;
  if ('PresetSave' in param)   return param.PresetSave;
  if ('Gain2Type' in param)    return gain2TypeToCCValue(param.Gain2Type);
  if ('TrebleBoost' in param)  return trebleBoostToCCValue(param.TrebleBoost);
  if ('Gain1Type' in param)    return gain1TypeToCCValue(param.Gain1Type);
  if ('DipSweep' in param)     return sweepDirectionToCCValue(param.DipSweep);
  if ('DipPolarity' in param)  return polarityToCCValue(param.DipPolarity);
  if ('Channel1Bypass' in param) return param.Channel1Bypass ? 127 : 0;
  if ('Channel2Bypass' in param) return param.Channel2Bypass ? 127 : 0;
  if ('DipVolume1' in param)   return param.DipVolume1 ? 127 : 0;
  if ('DipVolume2' in param)   return param.DipVolume2 ? 127 : 0;
  if ('DipGain1' in param)     return param.DipGain1 ? 127 : 0;
  if ('DipGain2' in param)     return param.DipGain2 ? 127 : 0;
  if ('DipTone1' in param)     return param.DipTone1 ? 127 : 0;
  if ('DipTone2' in param)     return param.DipTone2 ? 127 : 0;
  if ('DipHiGain1' in param)   return param.DipHiGain1 ? 127 : 0;
  if ('DipHiGain2' in param)   return param.DipHiGain2 ? 127 : 0;
  if ('DipMotoByp1' in param)  return param.DipMotoByp1 ? 127 : 0;
  if ('DipMotoByp2' in param)  return param.DipMotoByp2 ? 127 : 0;
  if ('DipPresLink1' in param) return param.DipPresLink1 ? 127 : 0;
  if ('DipPresLink2' in param) return param.DipPresLink2 ? 127 : 0;
  if ('DipMaster' in param)    return param.DipMaster ? 127 : 0;
  throw new Error(`Unknown BrothersAmParameter: ${JSON.stringify(param)}`);
}

export function stateToCCMap(state: BrothersAmState): Map<number, number> {
  const map = new Map<number, number>();
  map.set(14, state.gain2);
  map.set(15, state.volume2);
  map.set(16, state.gain1);
  map.set(17, state.tone2);
  map.set(18, state.volume1);
  map.set(19, state.tone1);
  map.set(21, gain2TypeToCCValue(state.gain2_type));
  map.set(22, trebleBoostToCCValue(state.treble_boost));
  map.set(23, gain1TypeToCCValue(state.gain1_type));
  map.set(27, state.presence2);
  map.set(29, state.presence1);
  map.set(61, state.dip_volume1 ? 127 : 0);
  map.set(62, state.dip_volume2 ? 127 : 0);
  map.set(63, state.dip_gain1 ? 127 : 0);
  map.set(64, state.dip_gain2 ? 127 : 0);
  map.set(65, state.dip_tone1 ? 127 : 0);
  map.set(66, state.dip_tone2 ? 127 : 0);
  map.set(67, sweepDirectionToCCValue(state.dip_sweep));
  map.set(68, polarityToCCValue(state.dip_polarity));
  map.set(71, state.dip_hi_gain1 ? 127 : 0);
  map.set(72, state.dip_hi_gain2 ? 127 : 0);
  map.set(73, state.dip_moto_byp1 ? 127 : 0);
  map.set(74, state.dip_moto_byp2 ? 127 : 0);
  map.set(75, state.dip_pres_link1 ? 127 : 0);
  map.set(76, state.dip_pres_link2 ? 127 : 0);
  map.set(77, state.dip_master ? 127 : 0);
  map.set(100, state.expression);
  map.set(102, state.channel1_bypass ? 127 : 0);
  map.set(103, state.channel2_bypass ? 127 : 0);
  return map;
}

export function ccToParameter(cc: number, value: number): BrothersAmParameter | null {
  switch (cc) {
    case 14:  return { Gain2: value };
    case 15:  return { Volume2: value };
    case 16:  return { Gain1: value };
    case 17:  return { Tone2: value };
    case 18:  return { Volume1: value };
    case 19:  return { Tone1: value };
    case 21:  return { Gain2Type: gain2TypeFromCCValue(value) };
    case 22:  return { TrebleBoost: trebleBoostFromCCValue(value) };
    case 23:  return { Gain1Type: gain1TypeFromCCValue(value) };
    case 27:  return { Presence2: value };
    case 29:  return { Presence1: value };
    case 61:  return { DipVolume1: value >= 64 };
    case 62:  return { DipVolume2: value >= 64 };
    case 63:  return { DipGain1: value >= 64 };
    case 64:  return { DipGain2: value >= 64 };
    case 65:  return { DipTone1: value >= 64 };
    case 66:  return { DipTone2: value >= 64 };
    case 67:  return { DipSweep: sweepDirectionFromCCValue(value) };
    case 68:  return { DipPolarity: polarityFromCCValue(value) };
    case 71:  return { DipHiGain1: value >= 64 };
    case 72:  return { DipHiGain2: value >= 64 };
    case 73:  return { DipMotoByp1: value >= 64 };
    case 74:  return { DipMotoByp2: value >= 64 };
    case 75:  return { DipPresLink1: value >= 64 };
    case 76:  return { DipPresLink2: value >= 64 };
    case 77:  return { DipMaster: value >= 64 };
    case 100: return { Expression: value };
    case 102: return { Channel1Bypass: value >= 64 };
    case 103: return { Channel2Bypass: value >= 64 };
    case 111: return { PresetSave: value };
    default:  return null;
  }
}
