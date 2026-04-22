// MIDI CC mapping for Gen Loss MKII parameters
// Ported from apps/desktop/tauri/src/midi/pedals/gen_loss_mkii/mapper.rs

import type {
  GenLossMkiiParameter,
  GenLossMkiiState,
  TapeModel,
  DryMode,
  NoiseMode,
  AuxMode,
  SweepDirection,
  Polarity,
  InputGain,
  DspBypassMode,
} from './types';

// ============================================================================
// Enum → CC value helpers
// ============================================================================

export function tapeModelToCCValue(m: TapeModel): number {
  switch (m) {
    case 'None':        return 0;
    case 'CPR3300Gen1': return 15;
    case 'CPR3300Gen2': return 24;
    case 'CPR3300Gen3': return 33;
    case 'PortamaxRT':  return 43;
    case 'PortamaxHT':  return 53;
    case 'CAM8':        return 62;
    case 'DictatronEX': return 72;
    case 'DictatronIN': return 82;
    case 'Fishy60':     return 91;
    case 'MSWalker':    return 101;
    case 'AMU2':        return 111;
    case 'MPEX':        return 127;
  }
}

export function tapeModelFromCCValue(value: number): TapeModel {
  if (value <= 7)   return 'None';
  if (value <= 19)  return 'CPR3300Gen1';
  if (value <= 28)  return 'CPR3300Gen2';
  if (value <= 38)  return 'CPR3300Gen3';
  if (value <= 48)  return 'PortamaxRT';
  if (value <= 57)  return 'PortamaxHT';
  if (value <= 67)  return 'CAM8';
  if (value <= 77)  return 'DictatronEX';
  if (value <= 86)  return 'DictatronIN';
  if (value <= 96)  return 'Fishy60';
  if (value <= 106) return 'MSWalker';
  if (value <= 119) return 'AMU2';
  return 'MPEX';
}

export function dryModeToCCValue(m: DryMode): number {
  switch (m) {
    case 'Dry1': return 1;
    case 'Dry2': return 2;
    case 'Dry3': return 3;
  }
}

export function dryModeFromCCValue(value: number): DryMode {
  if (value === 2) return 'Dry2';
  if (value === 3) return 'Dry3';
  return 'Dry1';
}

export function noiseModeToCCValue(m: NoiseMode): number {
  switch (m) {
    case 'Noise1': return 1;
    case 'Noise2': return 2;
    case 'Noise3': return 3;
  }
}

export function noiseModeFromCCValue(value: number): NoiseMode {
  if (value === 2) return 'Noise2';
  if (value === 3) return 'Noise3';
  return 'Noise1';
}

export function auxModeToCCValue(m: AuxMode): number {
  switch (m) {
    case 'Aux1': return 1;
    case 'Aux2': return 2;
    case 'Aux3': return 3;
  }
}

export function auxModeFromCCValue(value: number): AuxMode {
  if (value === 2) return 'Aux2';
  if (value === 3) return 'Aux3';
  return 'Aux1';
}

export function sweepDirectionToCCValue(d: SweepDirection): number {
  return d === 'Bottom' ? 0 : 127;
}

export function sweepDirectionFromCCValue(value: number): SweepDirection {
  return value < 64 ? 'Bottom' : 'Top';
}

export function polarityToCCValue(p: Polarity): number {
  return p === 'Forward' ? 0 : 127;
}

export function polarityFromCCValue(value: number): Polarity {
  return value < 64 ? 'Forward' : 'Reverse';
}

export function inputGainToCCValue(g: InputGain): number {
  switch (g) {
    case 'LineLevel':       return 1;
    case 'InstrumentLevel': return 2;
    case 'HighGain':        return 3;
  }
}

export function inputGainFromCCValue(value: number): InputGain {
  if (value === 1) return 'LineLevel';
  if (value === 3) return 'HighGain';
  return 'InstrumentLevel';
}

export function dspBypassToCCValue(m: DspBypassMode): number {
  return m === 'TrueBypass' ? 0 : 127;
}

export function dspBypassFromCCValue(value: number): DspBypassMode {
  return value < 64 ? 'TrueBypass' : 'DspBypass';
}

// ============================================================================
// Parameter → CC number
// ============================================================================

export function parameterCCNumber(param: GenLossMkiiParameter): number {
  if ('Wow' in param)           return 14;
  if ('Volume' in param)        return 15;
  if ('Model' in param)         return 16;
  if ('Flutter' in param)       return 17;
  if ('Saturate' in param)      return 18;
  if ('Failure' in param)       return 19;
  if ('RampSpeed' in param)     return 20;
  if ('AuxMode' in param)       return 21;
  if ('DryMode' in param)       return 22;
  if ('NoiseMode' in param)     return 23;
  if ('Bypass' in param)        return 102;
  if ('AuxSwitch' in param)     return 103;
  if ('AltMode' in param)       return 104;
  if ('LeftSwitch' in param)    return 105;
  if ('CenterSwitch' in param)  return 106;
  if ('RightSwitch' in param)   return 107;
  if ('DipWow' in param)        return 61;
  if ('DipFlutter' in param)    return 62;
  if ('DipSatGen' in param)     return 63;
  if ('DipFailureHp' in param)  return 64;
  if ('DipModelLp' in param)    return 65;
  if ('DipBounce' in param)     return 66;
  if ('DipRandom' in param)     return 67;
  if ('DipSweep' in param)      return 68;
  if ('DipPolarity' in param)   return 71;
  if ('DipClassic' in param)    return 72;
  if ('DipMiso' in param)       return 73;
  if ('DipSpread' in param)     return 74;
  if ('DipDryType' in param)    return 75;
  if ('DipDropByp' in param)    return 76;
  if ('DipSnagByp' in param)    return 77;
  if ('DipHumByp' in param)     return 78;
  if ('Expression' in param)    return 100;
  if ('AuxOnsetTime' in param)  return 24;
  if ('HissLevel' in param)     return 27;
  if ('MechanicalNoise' in param) return 28;
  if ('CrinklePop' in param)    return 29;
  if ('InputGain' in param)     return 32;
  if ('DspBypass' in param)     return 26;
  if ('PresetSave' in param)    return 111;
  if ('RampBounce' in param)    return 52;
  throw new Error(`Unknown GenLossMkiiParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// Parameter → CC value
// ============================================================================

export function parameterCCValue(param: GenLossMkiiParameter): number {
  if ('Wow' in param)           return param.Wow;
  if ('Volume' in param)        return param.Volume;
  if ('Flutter' in param)       return param.Flutter;
  if ('Saturate' in param)      return param.Saturate;
  if ('Failure' in param)       return param.Failure;
  if ('RampSpeed' in param)     return param.RampSpeed;
  if ('Expression' in param)    return param.Expression;
  if ('AuxOnsetTime' in param)  return param.AuxOnsetTime;
  if ('HissLevel' in param)     return param.HissLevel;
  if ('MechanicalNoise' in param) return param.MechanicalNoise;
  if ('CrinklePop' in param)    return param.CrinklePop;
  if ('PresetSave' in param)    return param.PresetSave;
  if ('Model' in param)         return tapeModelToCCValue(param.Model);
  if ('DryMode' in param)       return dryModeToCCValue(param.DryMode);
  if ('NoiseMode' in param)     return noiseModeToCCValue(param.NoiseMode);
  if ('AuxMode' in param)       return auxModeToCCValue(param.AuxMode);
  if ('DipSweep' in param)      return sweepDirectionToCCValue(param.DipSweep);
  if ('DipPolarity' in param)   return polarityToCCValue(param.DipPolarity);
  if ('InputGain' in param)     return inputGainToCCValue(param.InputGain);
  if ('DspBypass' in param)     return dspBypassToCCValue(param.DspBypass);
  // Boolean parameters
  if ('Bypass' in param)        return param.Bypass ? 127 : 0;
  if ('AuxSwitch' in param)     return param.AuxSwitch ? 127 : 0;
  if ('AltMode' in param)       return param.AltMode ? 127 : 0;
  if ('LeftSwitch' in param)    return param.LeftSwitch ? 127 : 0;
  if ('CenterSwitch' in param)  return param.CenterSwitch ? 127 : 0;
  if ('RightSwitch' in param)   return param.RightSwitch ? 127 : 0;
  if ('DipWow' in param)        return param.DipWow ? 127 : 0;
  if ('DipFlutter' in param)    return param.DipFlutter ? 127 : 0;
  if ('DipSatGen' in param)     return param.DipSatGen ? 127 : 0;
  if ('DipFailureHp' in param)  return param.DipFailureHp ? 127 : 0;
  if ('DipModelLp' in param)    return param.DipModelLp ? 127 : 0;
  if ('DipBounce' in param)     return param.DipBounce ? 127 : 0;
  if ('DipRandom' in param)     return param.DipRandom ? 127 : 0;
  if ('DipClassic' in param)    return param.DipClassic ? 127 : 0;
  if ('DipMiso' in param)       return param.DipMiso ? 127 : 0;
  if ('DipSpread' in param)     return param.DipSpread ? 127 : 0;
  if ('DipDryType' in param)    return param.DipDryType ? 127 : 0;
  if ('DipDropByp' in param)    return param.DipDropByp ? 127 : 0;
  if ('DipSnagByp' in param)    return param.DipSnagByp ? 127 : 0;
  if ('DipHumByp' in param)     return param.DipHumByp ? 127 : 0;
  if ('RampBounce' in param)    return param.RampBounce ? 127 : 0;
  throw new Error(`Unknown GenLossMkiiParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// State → CC map (for full preset recall)
// ============================================================================

export function stateToCCMap(state: GenLossMkiiState): Map<number, number> {
  const map = new Map<number, number>();

  // Main knobs
  map.set(14, state.wow);
  map.set(15, state.volume);
  map.set(16, tapeModelToCCValue(state.model));
  map.set(17, state.flutter);
  map.set(18, state.saturate);
  map.set(19, state.failure);
  map.set(20, state.ramp_speed);

  // Toggles
  map.set(21, auxModeToCCValue(state.aux_mode));
  map.set(22, dryModeToCCValue(state.dry_mode));
  map.set(23, noiseModeToCCValue(state.noise_mode));

  // Switches
  map.set(102, state.bypass ? 127 : 0);
  map.set(103, state.aux_switch ? 127 : 0);
  map.set(104, state.alt_mode ? 127 : 0);
  map.set(105, state.left_switch ? 127 : 0);
  map.set(106, state.center_switch ? 127 : 0);
  map.set(107, state.right_switch ? 127 : 0);

  // DIP switches - Left bank
  map.set(61, state.dip_wow ? 127 : 0);
  map.set(62, state.dip_flutter ? 127 : 0);
  map.set(63, state.dip_sat_gen ? 127 : 0);
  map.set(64, state.dip_failure_hp ? 127 : 0);
  map.set(65, state.dip_model_lp ? 127 : 0);
  map.set(66, state.dip_bounce ? 127 : 0);
  map.set(67, state.dip_random ? 127 : 0);
  map.set(68, sweepDirectionToCCValue(state.dip_sweep));

  // DIP switches - Right bank
  map.set(71, polarityToCCValue(state.dip_polarity));
  map.set(72, state.dip_classic ? 127 : 0);
  map.set(73, state.dip_miso ? 127 : 0);
  map.set(74, state.dip_spread ? 127 : 0);
  map.set(75, state.dip_dry_type ? 127 : 0);
  map.set(76, state.dip_drop_byp ? 127 : 0);
  map.set(77, state.dip_snag_byp ? 127 : 0);
  map.set(78, state.dip_hum_byp ? 127 : 0);

  // Advanced
  map.set(100, state.expression);
  map.set(24,  state.aux_onset_time);
  map.set(27,  state.hiss_level);
  map.set(28,  state.mechanical_noise);
  map.set(29,  state.crinkle_pop);
  map.set(32,  inputGainToCCValue(state.input_gain));
  map.set(26,  dspBypassToCCValue(state.dsp_bypass));
  map.set(52,  state.ramp_bounce ? 127 : 0);

  return map;
}

// ============================================================================
// CC → Parameter (for useMIDIInput bidirectional updates)
// ============================================================================

export function ccToParameter(cc: number, value: number): GenLossMkiiParameter | null {
  switch (cc) {
    case 14:  return { Wow: value };
    case 15:  return { Volume: value };
    case 16:  return { Model: tapeModelFromCCValue(value) };
    case 17:  return { Flutter: value };
    case 18:  return { Saturate: value };
    case 19:  return { Failure: value };
    case 20:  return { RampSpeed: value };
    case 21:  return { AuxMode: auxModeFromCCValue(value) };
    case 22:  return { DryMode: dryModeFromCCValue(value) };
    case 23:  return { NoiseMode: noiseModeFromCCValue(value) };
    case 24:  return { AuxOnsetTime: value };
    case 26:  return { DspBypass: dspBypassFromCCValue(value) };
    case 27:  return { HissLevel: value };
    case 28:  return { MechanicalNoise: value };
    case 29:  return { CrinklePop: value };
    case 32:  return { InputGain: inputGainFromCCValue(value) };
    case 52:  return { RampBounce: value >= 64 };
    case 61:  return { DipWow: value >= 64 };
    case 62:  return { DipFlutter: value >= 64 };
    case 63:  return { DipSatGen: value >= 64 };
    case 64:  return { DipFailureHp: value >= 64 };
    case 65:  return { DipModelLp: value >= 64 };
    case 66:  return { DipBounce: value >= 64 };
    case 67:  return { DipRandom: value >= 64 };
    case 68:  return { DipSweep: sweepDirectionFromCCValue(value) };
    case 71:  return { DipPolarity: polarityFromCCValue(value) };
    case 72:  return { DipClassic: value >= 64 };
    case 73:  return { DipMiso: value >= 64 };
    case 74:  return { DipSpread: value >= 64 };
    case 75:  return { DipDryType: value >= 64 };
    case 76:  return { DipDropByp: value >= 64 };
    case 77:  return { DipSnagByp: value >= 64 };
    case 78:  return { DipHumByp: value >= 64 };
    case 100: return { Expression: value };
    case 102: return { Bypass: value >= 64 };
    case 103: return { AuxSwitch: value >= 64 };
    case 104: return { AltMode: value >= 64 };
    case 105: return { LeftSwitch: value >= 64 };
    case 106: return { CenterSwitch: value >= 64 };
    case 107: return { RightSwitch: value >= 64 };
    case 111: return { PresetSave: value };
    default:  return null;
  }
}
