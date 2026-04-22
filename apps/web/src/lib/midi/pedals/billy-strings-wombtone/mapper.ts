// MIDI CC mapping for Billy Strings Wombtone parameters
// Ported from apps/desktop/tauri/src/midi/pedals/billy_strings_wombtone/mapper.rs

import type { BillyStringsWombtoneParameter, BillyStringsWombtoneState } from './types';

export function parameterCCNumber(param: BillyStringsWombtoneParameter): number {
  if ('Feed' in param)            return 14;
  if ('Volume' in param)          return 15;
  if ('Mix' in param)             return 16;
  if ('Rate' in param)            return 17;
  if ('Depth' in param)           return 18;
  if ('Form' in param)            return 19;
  if ('RampSpeed' in param)       return 20;
  if ('NoteDivision' in param)    return 21;
  if ('MidiClockIgnore' in param) return 51;
  if ('Tap' in param)             return 93;
  if ('Expression' in param)      return 100;
  if ('Bypass' in param)          return 102;
  if ('PresetSave' in param)      return 111;
  throw new Error(`Unknown BillyStringsWombtoneParameter: ${JSON.stringify(param)}`);
}

// NOTE: Bypass uses split-range: off=0, on=64 (not the standard 0/127 pattern)
export function parameterCCValue(param: BillyStringsWombtoneParameter): number {
  if ('Feed' in param)            return param.Feed;
  if ('Volume' in param)          return param.Volume;
  if ('Mix' in param)             return param.Mix;
  if ('Rate' in param)            return param.Rate;
  if ('Depth' in param)           return param.Depth;
  if ('Form' in param)            return param.Form;
  if ('RampSpeed' in param)       return param.RampSpeed;
  if ('NoteDivision' in param)    return param.NoteDivision;
  if ('Expression' in param)      return param.Expression;
  if ('PresetSave' in param)      return param.PresetSave;
  if ('Bypass' in param)          return param.Bypass ? 64 : 0;
  if ('Tap' in param)             return param.Tap ? 127 : 0;
  if ('MidiClockIgnore' in param) return param.MidiClockIgnore ? 127 : 0;
  throw new Error(`Unknown BillyStringsWombtoneParameter: ${JSON.stringify(param)}`);
}

export function stateToCCMap(state: BillyStringsWombtoneState): Map<number, number> {
  const map = new Map<number, number>();
  map.set(14, state.feed);
  map.set(15, state.volume);
  map.set(16, state.mix);
  map.set(17, state.rate);
  map.set(18, state.depth);
  map.set(19, state.form);
  map.set(20, state.ramp_speed);
  map.set(21, state.note_division);
  map.set(51, state.midi_clock_ignore ? 127 : 0);
  map.set(93, state.tap ? 127 : 0);
  map.set(100, state.expression);
  map.set(102, state.bypass ? 64 : 0);
  return map;
}

export function ccToParameter(cc: number, value: number): BillyStringsWombtoneParameter | null {
  switch (cc) {
    case 14:  return { Feed: value };
    case 15:  return { Volume: value };
    case 16:  return { Mix: value };
    case 17:  return { Rate: value };
    case 18:  return { Depth: value };
    case 19:  return { Form: value };
    case 20:  return { RampSpeed: value };
    case 21:  return { NoteDivision: value };
    case 51:  return { MidiClockIgnore: value >= 64 };
    case 93:  return { Tap: value >= 64 };
    case 100: return { Expression: value };
    // Bypass: split-range, off=0, on=64
    case 102: return { Bypass: value >= 32 };
    case 111: return { PresetSave: value };
    default:  return null;
  }
}
