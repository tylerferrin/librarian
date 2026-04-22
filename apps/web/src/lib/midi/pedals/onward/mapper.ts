// MIDI CC mapping for Onward parameters
// Ported from apps/desktop/tauri/src/midi/pedals/onward/mapper.rs

import type {
  OnwardParameter,
  OnwardState,
  ErrorType,
  FadeMode,
  AnimateMode,
  Routing,
  SweepDirection,
  Polarity,
} from './types';

function errorTypeToCCValue(e: ErrorType): number {
  switch (e) { case 'Timing': return 1; case 'Condition': return 2; case 'Playback': return 3; }
}
function errorTypeFromCCValue(v: number): ErrorType {
  if (v === 2) return 'Condition'; if (v === 3) return 'Playback'; return 'Timing';
}

function fadeModeToCCValue(f: FadeMode): number {
  switch (f) { case 'Long': return 1; case 'User': return 2; case 'Short': return 3; }
}
function fadeModeFromCCValue(v: number): FadeMode {
  if (v === 2) return 'User'; if (v === 3) return 'Short'; return 'Long';
}

function animateModeToCCValue(a: AnimateMode): number {
  switch (a) { case 'Vibrato': return 1; case 'Off': return 2; case 'Chorus': return 3; }
}
function animateModeFromCCValue(v: number): AnimateMode {
  if (v === 2) return 'Off'; if (v === 3) return 'Chorus'; return 'Vibrato';
}

function routingToCCValue(r: Routing): number {
  switch (r) { case 'Glitch': return 1; case 'Both': return 2; case 'Freeze': return 3; }
}
function routingFromCCValue(v: number): Routing {
  if (v === 2) return 'Both'; if (v === 3) return 'Freeze'; return 'Glitch';
}

function sweepDirectionToCCValue(d: SweepDirection): number { return d === 'Bottom' ? 0 : 127; }
function sweepDirectionFromCCValue(v: number): SweepDirection { return v < 64 ? 'Bottom' : 'Top'; }
function polarityToCCValue(p: Polarity): number { return p === 'Forward' ? 0 : 127; }
function polarityFromCCValue(v: number): Polarity { return v < 64 ? 'Forward' : 'Reverse'; }

export function parameterCCNumber(param: OnwardParameter): number {
  if ('Size' in param)            return 14;
  if ('Mix' in param)             return 15;
  if ('Octave' in param)          return 16;
  if ('Error' in param)           return 17;
  if ('Sustain' in param)         return 18;
  if ('Texture' in param)         return 19;
  if ('RampSpeed' in param)       return 20;
  if ('ErrorType' in param)       return 21;
  if ('FadeMode' in param)        return 22;
  if ('AnimateMode' in param)     return 23;
  if ('Sensitivity' in param)     return 24;
  if ('Balance' in param)         return 25;
  if ('DuckDepth' in param)       return 26;
  if ('ErrorBlend' in param)      return 27;
  if ('UserFade' in param)        return 28;
  if ('Filter' in param)          return 29;
  if ('ErrorRouting' in param)    return 31;
  if ('SustainRouting' in param)  return 32;
  if ('EffectsRouting' in param)  return 33;
  if ('MidiClockIgnore' in param) return 51;
  if ('RampBounce' in param)      return 52;
  if ('DryKill' in param)         return 57;
  if ('Trails' in param)          return 58;
  if ('DipSize' in param)         return 61;
  if ('DipError' in param)        return 62;
  if ('DipSustain' in param)      return 63;
  if ('DipTexture' in param)      return 64;
  if ('DipOctave' in param)       return 65;
  if ('DipBounce' in param)       return 66;
  if ('DipSweep' in param)        return 67;
  if ('DipPolarity' in param)     return 68;
  if ('DipMiso' in param)         return 71;
  if ('DipSpread' in param)       return 72;
  if ('DipLatch' in param)        return 73;
  if ('DipSidechain' in param)    return 74;
  if ('DipDuck' in param)         return 75;
  if ('DipReverse' in param)      return 76;
  if ('DipHalfSpeed' in param)    return 77;
  if ('DipManual' in param)       return 78;
  if ('Expression' in param)      return 100;
  if ('FreezeBypass' in param)    return 102;
  if ('GlitchBypass' in param)    return 103;
  if ('AltMode' in param)         return 104;
  if ('GlitchHold' in param)      return 105;
  if ('FreezeHold' in param)      return 106;
  if ('RetriggerGlitch' in param) return 108;
  if ('RetriggerFreeze' in param) return 109;
  if ('PresetSave' in param)      return 111;
  throw new Error(`Unknown OnwardParameter: ${JSON.stringify(param)}`);
}

export function parameterCCValue(param: OnwardParameter): number {
  if ('Size' in param)            return param.Size;
  if ('Mix' in param)             return param.Mix;
  if ('Octave' in param)          return param.Octave;
  if ('Error' in param)           return param.Error;
  if ('Sustain' in param)         return param.Sustain;
  if ('Texture' in param)         return param.Texture;
  if ('RampSpeed' in param)       return param.RampSpeed;
  if ('Sensitivity' in param)     return param.Sensitivity;
  if ('Balance' in param)         return param.Balance;
  if ('DuckDepth' in param)       return param.DuckDepth;
  if ('ErrorBlend' in param)      return param.ErrorBlend;
  if ('UserFade' in param)        return param.UserFade;
  if ('Filter' in param)          return param.Filter;
  if ('Expression' in param)      return param.Expression;
  if ('PresetSave' in param)      return param.PresetSave;
  if ('ErrorType' in param)       return errorTypeToCCValue(param.ErrorType);
  if ('FadeMode' in param)        return fadeModeToCCValue(param.FadeMode);
  if ('AnimateMode' in param)     return animateModeToCCValue(param.AnimateMode);
  if ('ErrorRouting' in param)    return routingToCCValue(param.ErrorRouting);
  if ('SustainRouting' in param)  return routingToCCValue(param.SustainRouting);
  if ('EffectsRouting' in param)  return routingToCCValue(param.EffectsRouting);
  if ('DipSweep' in param)        return sweepDirectionToCCValue(param.DipSweep);
  if ('DipPolarity' in param)     return polarityToCCValue(param.DipPolarity);
  // Boolean params
  if ('FreezeBypass' in param)    return param.FreezeBypass ? 127 : 0;
  if ('GlitchBypass' in param)    return param.GlitchBypass ? 127 : 0;
  if ('AltMode' in param)         return param.AltMode ? 127 : 0;
  if ('GlitchHold' in param)      return param.GlitchHold ? 127 : 0;
  if ('FreezeHold' in param)      return param.FreezeHold ? 127 : 0;
  if ('RetriggerGlitch' in param) return param.RetriggerGlitch ? 127 : 0;
  if ('RetriggerFreeze' in param) return param.RetriggerFreeze ? 127 : 0;
  if ('DipSize' in param)         return param.DipSize ? 127 : 0;
  if ('DipError' in param)        return param.DipError ? 127 : 0;
  if ('DipSustain' in param)      return param.DipSustain ? 127 : 0;
  if ('DipTexture' in param)      return param.DipTexture ? 127 : 0;
  if ('DipOctave' in param)       return param.DipOctave ? 127 : 0;
  if ('DipBounce' in param)       return param.DipBounce ? 127 : 0;
  if ('DipMiso' in param)         return param.DipMiso ? 127 : 0;
  if ('DipSpread' in param)       return param.DipSpread ? 127 : 0;
  if ('DipLatch' in param)        return param.DipLatch ? 127 : 0;
  if ('DipSidechain' in param)    return param.DipSidechain ? 127 : 0;
  if ('DipDuck' in param)         return param.DipDuck ? 127 : 0;
  if ('DipReverse' in param)      return param.DipReverse ? 127 : 0;
  if ('DipHalfSpeed' in param)    return param.DipHalfSpeed ? 127 : 0;
  if ('DipManual' in param)       return param.DipManual ? 127 : 0;
  if ('MidiClockIgnore' in param) return param.MidiClockIgnore ? 127 : 0;
  if ('RampBounce' in param)      return param.RampBounce ? 127 : 0;
  if ('DryKill' in param)         return param.DryKill ? 127 : 0;
  if ('Trails' in param)          return param.Trails ? 127 : 0;
  throw new Error(`Unknown OnwardParameter: ${JSON.stringify(param)}`);
}

export function stateToCCMap(state: OnwardState): Map<number, number> {
  const map = new Map<number, number>();
  map.set(14, state.size);
  map.set(15, state.mix);
  map.set(16, state.octave);
  map.set(17, state.error);
  map.set(18, state.sustain);
  map.set(19, state.texture);
  map.set(20, state.ramp_speed);
  map.set(21, errorTypeToCCValue(state.error_type));
  map.set(22, fadeModeToCCValue(state.fade_mode));
  map.set(23, animateModeToCCValue(state.animate_mode));
  map.set(24, state.sensitivity);
  map.set(25, state.balance);
  map.set(26, state.duck_depth);
  map.set(27, state.error_blend);
  map.set(28, state.user_fade);
  map.set(29, state.filter);
  map.set(31, routingToCCValue(state.error_routing));
  map.set(32, routingToCCValue(state.sustain_routing));
  map.set(33, routingToCCValue(state.effects_routing));
  map.set(51, state.midi_clock_ignore ? 127 : 0);
  map.set(52, state.ramp_bounce ? 127 : 0);
  map.set(57, state.dry_kill ? 127 : 0);
  map.set(58, state.trails ? 127 : 0);
  map.set(61, state.dip_size ? 127 : 0);
  map.set(62, state.dip_error ? 127 : 0);
  map.set(63, state.dip_sustain ? 127 : 0);
  map.set(64, state.dip_texture ? 127 : 0);
  map.set(65, state.dip_octave ? 127 : 0);
  map.set(66, state.dip_bounce ? 127 : 0);
  map.set(67, sweepDirectionToCCValue(state.dip_sweep));
  map.set(68, polarityToCCValue(state.dip_polarity));
  map.set(71, state.dip_miso ? 127 : 0);
  map.set(72, state.dip_spread ? 127 : 0);
  map.set(73, state.dip_latch ? 127 : 0);
  map.set(74, state.dip_sidechain ? 127 : 0);
  map.set(75, state.dip_duck ? 127 : 0);
  map.set(76, state.dip_reverse ? 127 : 0);
  map.set(77, state.dip_half_speed ? 127 : 0);
  map.set(78, state.dip_manual ? 127 : 0);
  map.set(100, state.expression);
  map.set(102, state.freeze_bypass ? 127 : 0);
  map.set(103, state.glitch_bypass ? 127 : 0);
  map.set(104, state.alt_mode ? 127 : 0);
  map.set(105, state.glitch_hold ? 127 : 0);
  map.set(106, state.freeze_hold ? 127 : 0);
  map.set(108, state.retrigger_glitch ? 127 : 0);
  map.set(109, state.retrigger_freeze ? 127 : 0);
  return map;
}

export function ccToParameter(cc: number, value: number): OnwardParameter | null {
  switch (cc) {
    case 14:  return { Size: value };
    case 15:  return { Mix: value };
    case 16:  return { Octave: value };
    case 17:  return { Error: value };
    case 18:  return { Sustain: value };
    case 19:  return { Texture: value };
    case 20:  return { RampSpeed: value };
    case 21:  return { ErrorType: errorTypeFromCCValue(value) };
    case 22:  return { FadeMode: fadeModeFromCCValue(value) };
    case 23:  return { AnimateMode: animateModeFromCCValue(value) };
    case 24:  return { Sensitivity: value };
    case 25:  return { Balance: value };
    case 26:  return { DuckDepth: value };
    case 27:  return { ErrorBlend: value };
    case 28:  return { UserFade: value };
    case 29:  return { Filter: value };
    case 31:  return { ErrorRouting: routingFromCCValue(value) };
    case 32:  return { SustainRouting: routingFromCCValue(value) };
    case 33:  return { EffectsRouting: routingFromCCValue(value) };
    case 51:  return { MidiClockIgnore: value >= 64 };
    case 52:  return { RampBounce: value >= 64 };
    case 57:  return { DryKill: value >= 64 };
    case 58:  return { Trails: value >= 64 };
    case 61:  return { DipSize: value >= 64 };
    case 62:  return { DipError: value >= 64 };
    case 63:  return { DipSustain: value >= 64 };
    case 64:  return { DipTexture: value >= 64 };
    case 65:  return { DipOctave: value >= 64 };
    case 66:  return { DipBounce: value >= 64 };
    case 67:  return { DipSweep: sweepDirectionFromCCValue(value) };
    case 68:  return { DipPolarity: polarityFromCCValue(value) };
    case 71:  return { DipMiso: value >= 64 };
    case 72:  return { DipSpread: value >= 64 };
    case 73:  return { DipLatch: value >= 64 };
    case 74:  return { DipSidechain: value >= 64 };
    case 75:  return { DipDuck: value >= 64 };
    case 76:  return { DipReverse: value >= 64 };
    case 77:  return { DipHalfSpeed: value >= 64 };
    case 78:  return { DipManual: value >= 64 };
    case 100: return { Expression: value };
    case 102: return { FreezeBypass: value >= 64 };
    case 103: return { GlitchBypass: value >= 64 };
    case 104: return { AltMode: value >= 64 };
    case 105: return { GlitchHold: value >= 64 };
    case 106: return { FreezeHold: value >= 64 };
    case 108: return { RetriggerGlitch: value >= 64 };
    case 109: return { RetriggerFreeze: value >= 64 };
    case 111: return { PresetSave: value };
    default:  return null;
  }
}
