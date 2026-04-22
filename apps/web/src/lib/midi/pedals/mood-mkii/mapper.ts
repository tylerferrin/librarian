// MIDI CC mapping for Mood MkII parameters
// Ported from apps/desktop/tauri/src/midi/pedals/mood_mkii/mapper.rs

import type {
  MoodMkiiParameter,
  MoodMkiiState,
  WetChannelRouting,
  MoodRouting,
  MicroLooper,
  MoodSync,
  MoodSpread,
  SweepDirection,
  Polarity,
} from './types';

// ============================================================================
// Enum → CC value helpers
// ============================================================================

function wetChannelRoutingToCCValue(r: WetChannelRouting): number {
  switch (r) { case 'Reverb': return 1; case 'Delay': return 2; case 'Slip': return 3; }
}
function wetChannelRoutingFromCCValue(v: number): WetChannelRouting {
  if (v === 2) return 'Delay'; if (v === 3) return 'Slip'; return 'Reverb';
}

function moodRoutingToCCValue(r: MoodRouting): number {
  switch (r) { case 'Lfo': return 1; case 'Mid': return 2; case 'Env': return 3; }
}
function moodRoutingFromCCValue(v: number): MoodRouting {
  if (v === 2) return 'Mid'; if (v === 3) return 'Env'; return 'Lfo';
}

function microLooperToCCValue(m: MicroLooper): number {
  switch (m) { case 'Env': return 1; case 'Tape': return 2; case 'Stretch': return 3; }
}
function microLooperFromCCValue(v: number): MicroLooper {
  if (v === 2) return 'Tape'; if (v === 3) return 'Stretch'; return 'Env';
}

function moodSyncToCCValue(s: MoodSync): number {
  switch (s) { case 'On': return 1; case 'NoSync': return 2; case 'Auto': return 3; }
}
function moodSyncFromCCValue(v: number): MoodSync {
  if (v === 2) return 'NoSync'; if (v === 3) return 'Auto'; return 'On';
}

function moodSpreadToCCValue(s: MoodSpread): number {
  switch (s) { case 'Only': return 1; case 'Both': return 2; case 'OnlyAlt': return 3; }
}
function moodSpreadFromCCValue(v: number): MoodSpread {
  if (v === 2) return 'Both'; if (v === 3) return 'OnlyAlt'; return 'Only';
}

function sweepDirectionToCCValue(d: SweepDirection): number { return d === 'Bottom' ? 0 : 127; }
function sweepDirectionFromCCValue(v: number): SweepDirection { return v < 64 ? 'Bottom' : 'Top'; }
function polarityToCCValue(p: Polarity): number { return p === 'Forward' ? 0 : 127; }
function polarityFromCCValue(v: number): Polarity { return v < 64 ? 'Forward' : 'Reverse'; }

// ============================================================================
// Parameter → CC number
// ============================================================================

export function parameterCCNumber(param: MoodMkiiParameter): number {
  if ('Time' in param)            return 14;
  if ('Mix' in param)             return 15;
  if ('Length' in param)          return 16;
  if ('ModifyWet' in param)       return 17;
  if ('Clock' in param)           return 18;
  if ('ModifyLooper' in param)    return 19;
  if ('RampSpeed' in param)       return 20;
  if ('WetChannelRouting' in param) return 21;
  if ('Routing' in param)         return 22;
  if ('MicroLooper' in param)     return 23;
  if ('StereoWidth' in param)     return 24;
  if ('RampingWaveform' in param) return 25;
  if ('Fade' in param)            return 26;
  if ('Tone' in param)            return 27;
  if ('LevelBalance' in param)    return 28;
  if ('DirectMicroLoop' in param) return 29;
  if ('Sync' in param)            return 31;
  if ('Spread' in param)          return 32;
  if ('BufferLength' in param)    return 33;
  if ('MidiClockIgnore' in param) return 51;
  if ('RampBounce' in param)      return 52;
  if ('DipTime' in param)         return 61;
  if ('DipModifyWet' in param)    return 62;
  if ('DipClock' in param)        return 63;
  if ('DipModifyLooper' in param) return 64;
  if ('DipLength' in param)       return 65;
  if ('DipBounce' in param)       return 66;
  if ('DipSweep' in param)        return 67;
  if ('DipPolarity' in param)     return 68;
  if ('DipClassic' in param)      return 71;
  if ('DipMiso' in param)         return 72;
  if ('DipSpread' in param)       return 73;
  if ('DipDryKill' in param)      return 74;
  if ('DipTrails' in param)       return 75;
  if ('DipLatch' in param)        return 76;
  if ('DipNoDub' in param)        return 77;
  if ('DipSmooth' in param)       return 78;
  if ('Expression' in param)      return 100;
  if ('BypassLeft' in param)      return 102;
  if ('BypassRight' in param)     return 103;
  if ('HiddenMenu' in param)      return 104;
  if ('Freeze' in param)          return 105;
  if ('Overdub' in param)         return 106;
  if ('PresetSave' in param)      return 111;
  throw new Error(`Unknown MoodMkiiParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// Parameter → CC value
// ============================================================================

export function parameterCCValue(param: MoodMkiiParameter): number {
  if ('Time' in param)            return param.Time;
  if ('Mix' in param)             return param.Mix;
  if ('Length' in param)          return param.Length;
  if ('ModifyWet' in param)       return param.ModifyWet;
  if ('Clock' in param)           return param.Clock;
  if ('ModifyLooper' in param)    return param.ModifyLooper;
  if ('RampSpeed' in param)       return param.RampSpeed;
  if ('StereoWidth' in param)     return param.StereoWidth;
  if ('RampingWaveform' in param) return param.RampingWaveform;
  if ('Fade' in param)            return param.Fade;
  if ('Tone' in param)            return param.Tone;
  if ('LevelBalance' in param)    return param.LevelBalance;
  if ('DirectMicroLoop' in param) return param.DirectMicroLoop;
  if ('Expression' in param)      return param.Expression;
  if ('PresetSave' in param)      return param.PresetSave;
  if ('WetChannelRouting' in param) return wetChannelRoutingToCCValue(param.WetChannelRouting);
  if ('Routing' in param)         return moodRoutingToCCValue(param.Routing);
  if ('MicroLooper' in param)     return microLooperToCCValue(param.MicroLooper);
  if ('Sync' in param)            return moodSyncToCCValue(param.Sync);
  if ('Spread' in param)          return moodSpreadToCCValue(param.Spread);
  if ('DipSweep' in param)        return sweepDirectionToCCValue(param.DipSweep);
  if ('DipPolarity' in param)     return polarityToCCValue(param.DipPolarity);
  // BufferLength: false=HalfMki(1), true=Full(2)
  if ('BufferLength' in param)    return param.BufferLength ? 2 : 1;
  // Boolean params
  if ('BypassLeft' in param)      return param.BypassLeft ? 127 : 0;
  if ('BypassRight' in param)     return param.BypassRight ? 127 : 0;
  if ('HiddenMenu' in param)      return param.HiddenMenu ? 127 : 0;
  if ('Freeze' in param)          return param.Freeze ? 127 : 0;
  if ('Overdub' in param)         return param.Overdub ? 127 : 0;
  if ('DipTime' in param)         return param.DipTime ? 127 : 0;
  if ('DipModifyWet' in param)    return param.DipModifyWet ? 127 : 0;
  if ('DipClock' in param)        return param.DipClock ? 127 : 0;
  if ('DipModifyLooper' in param) return param.DipModifyLooper ? 127 : 0;
  if ('DipLength' in param)       return param.DipLength ? 127 : 0;
  if ('DipBounce' in param)       return param.DipBounce ? 127 : 0;
  if ('DipClassic' in param)      return param.DipClassic ? 127 : 0;
  if ('DipMiso' in param)         return param.DipMiso ? 127 : 0;
  if ('DipSpread' in param)       return param.DipSpread ? 127 : 0;
  if ('DipDryKill' in param)      return param.DipDryKill ? 127 : 0;
  if ('DipTrails' in param)       return param.DipTrails ? 127 : 0;
  if ('DipLatch' in param)        return param.DipLatch ? 127 : 0;
  if ('DipNoDub' in param)        return param.DipNoDub ? 127 : 0;
  if ('DipSmooth' in param)       return param.DipSmooth ? 127 : 0;
  if ('MidiClockIgnore' in param) return param.MidiClockIgnore ? 127 : 0;
  if ('RampBounce' in param)      return param.RampBounce ? 127 : 0;
  throw new Error(`Unknown MoodMkiiParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// State → CC map
// ============================================================================

export function stateToCCMap(state: MoodMkiiState): Map<number, number> {
  const map = new Map<number, number>();

  map.set(14, state.time);
  map.set(15, state.mix);
  map.set(16, state.length);
  map.set(17, state.modify_wet);
  map.set(18, state.clock);
  map.set(19, state.modify_looper);
  map.set(20, state.ramp_speed);
  map.set(21, wetChannelRoutingToCCValue(state.wet_channel_routing));
  map.set(22, moodRoutingToCCValue(state.routing));
  map.set(23, microLooperToCCValue(state.micro_looper));
  map.set(24, state.stereo_width);
  map.set(25, state.ramping_waveform);
  map.set(26, state.fade);
  map.set(27, state.tone);
  map.set(28, state.level_balance);
  map.set(29, state.direct_micro_loop);
  map.set(31, moodSyncToCCValue(state.sync));
  map.set(32, moodSpreadToCCValue(state.spread));
  map.set(33, state.buffer_length ? 2 : 1);
  map.set(51, state.midi_clock_ignore ? 127 : 0);
  map.set(52, state.ramp_bounce ? 127 : 0);
  map.set(61, state.dip_time ? 127 : 0);
  map.set(62, state.dip_modify_wet ? 127 : 0);
  map.set(63, state.dip_clock ? 127 : 0);
  map.set(64, state.dip_modify_looper ? 127 : 0);
  map.set(65, state.dip_length ? 127 : 0);
  map.set(66, state.dip_bounce ? 127 : 0);
  map.set(67, sweepDirectionToCCValue(state.dip_sweep));
  map.set(68, polarityToCCValue(state.dip_polarity));
  map.set(71, state.dip_classic ? 127 : 0);
  map.set(72, state.dip_miso ? 127 : 0);
  map.set(73, state.dip_spread ? 127 : 0);
  map.set(74, state.dip_dry_kill ? 127 : 0);
  map.set(75, state.dip_trails ? 127 : 0);
  map.set(76, state.dip_latch ? 127 : 0);
  map.set(77, state.dip_no_dub ? 127 : 0);
  map.set(78, state.dip_smooth ? 127 : 0);
  map.set(100, state.expression);
  map.set(102, state.bypass_left ? 127 : 0);
  map.set(103, state.bypass_right ? 127 : 0);
  map.set(104, state.hidden_menu ? 127 : 0);
  map.set(105, state.freeze ? 127 : 0);
  map.set(106, state.overdub ? 127 : 0);

  return map;
}

// ============================================================================
// CC → Parameter
// ============================================================================

export function ccToParameter(cc: number, value: number): MoodMkiiParameter | null {
  switch (cc) {
    case 14:  return { Time: value };
    case 15:  return { Mix: value };
    case 16:  return { Length: value };
    case 17:  return { ModifyWet: value };
    case 18:  return { Clock: value };
    case 19:  return { ModifyLooper: value };
    case 20:  return { RampSpeed: value };
    case 21:  return { WetChannelRouting: wetChannelRoutingFromCCValue(value) };
    case 22:  return { Routing: moodRoutingFromCCValue(value) };
    case 23:  return { MicroLooper: microLooperFromCCValue(value) };
    case 24:  return { StereoWidth: value };
    case 25:  return { RampingWaveform: value };
    case 26:  return { Fade: value };
    case 27:  return { Tone: value };
    case 28:  return { LevelBalance: value };
    case 29:  return { DirectMicroLoop: value };
    case 31:  return { Sync: moodSyncFromCCValue(value) };
    case 32:  return { Spread: moodSpreadFromCCValue(value) };
    case 33:  return { BufferLength: value >= 2 };
    case 51:  return { MidiClockIgnore: value >= 64 };
    case 52:  return { RampBounce: value >= 64 };
    case 61:  return { DipTime: value >= 64 };
    case 62:  return { DipModifyWet: value >= 64 };
    case 63:  return { DipClock: value >= 64 };
    case 64:  return { DipModifyLooper: value >= 64 };
    case 65:  return { DipLength: value >= 64 };
    case 66:  return { DipBounce: value >= 64 };
    case 67:  return { DipSweep: sweepDirectionFromCCValue(value) };
    case 68:  return { DipPolarity: polarityFromCCValue(value) };
    case 71:  return { DipClassic: value >= 64 };
    case 72:  return { DipMiso: value >= 64 };
    case 73:  return { DipSpread: value >= 64 };
    case 74:  return { DipDryKill: value >= 64 };
    case 75:  return { DipTrails: value >= 64 };
    case 76:  return { DipLatch: value >= 64 };
    case 77:  return { DipNoDub: value >= 64 };
    case 78:  return { DipSmooth: value >= 64 };
    case 100: return { Expression: value };
    case 102: return { BypassLeft: value >= 64 };
    case 103: return { BypassRight: value >= 64 };
    case 104: return { HiddenMenu: value >= 64 };
    case 105: return { Freeze: value >= 64 };
    case 106: return { Overdub: value >= 64 };
    case 111: return { PresetSave: value };
    default:  return null;
  }
}
