// MIDI CC mapping for Reverse Mode C parameters
// Ported from apps/desktop/tauri/src/midi/pedals/reverse_mode_c/mapper.rs

import type {
  ReverseModeCParameter,
  ReverseModeCState,
  ModSync,
  ModType,
  SequenceMode,
  OctaveType,
  SweepDirection,
  Polarity,
} from './types';

function modSyncToCCValue(m: ModSync): number {
  switch (m) { case 'Sync': return 1; case 'Off': return 2; case 'Free': return 3; }
}
function modSyncFromCCValue(v: number): ModSync {
  if (v === 2) return 'Off'; if (v === 3) return 'Free'; return 'Sync';
}

function modTypeToCCValue(m: ModType): number {
  switch (m) { case 'Vib': return 1; case 'Trem': return 2; case 'Freq': return 3; }
}
function modTypeFromCCValue(v: number): ModType {
  if (v === 2) return 'Trem'; if (v === 3) return 'Freq'; return 'Vib';
}

function sequenceModeToCCValue(m: SequenceMode): number {
  switch (m) { case 'Run': return 1; case 'Off': return 2; case 'Env': return 3; }
}
function sequenceModeFromCCValue(v: number): SequenceMode {
  if (v === 2) return 'Off'; if (v === 3) return 'Env'; return 'Run';
}

function octaveTypeToCCValue(o: OctaveType): number {
  switch (o) { case 'OctDown': return 1; case 'BothOct': return 2; case 'OctUp': return 3; }
}
function octaveTypeFromCCValue(v: number): OctaveType {
  if (v === 2) return 'BothOct'; if (v === 3) return 'OctUp'; return 'OctDown';
}

// CC 33: sequence_spacing (false=Rest → 1, true=Skip → 2)
function sequenceSpacingToCCValue(active: boolean): number { return active ? 2 : 1; }
function sequenceSpacingFromCCValue(v: number): boolean { return v >= 2; }

function sweepDirectionToCCValue(d: SweepDirection): number { return d === 'Bottom' ? 0 : 127; }
function sweepDirectionFromCCValue(v: number): SweepDirection { return v < 64 ? 'Bottom' : 'Top'; }
function polarityToCCValue(p: Polarity): number { return p === 'Forward' ? 0 : 127; }
function polarityFromCCValue(v: number): Polarity { return v < 64 ? 'Forward' : 'Reverse'; }

export function parameterCCNumber(param: ReverseModeCParameter): number {
  if ('Time' in param)                 return 14;
  if ('Mix' in param)                  return 15;
  if ('Feedback' in param)             return 16;
  if ('Offset' in param)               return 17;
  if ('Balance' in param)              return 18;
  if ('Filter' in param)               return 19;
  if ('RampSpeed' in param)            return 20;
  if ('ModSync' in param)              return 21;
  if ('ModType' in param)              return 22;
  if ('SequenceMode' in param)         return 23;
  if ('SequencerSubdivision' in param) return 24;
  if ('RampingWaveform' in param)      return 25;
  if ('ModDepth' in param)             return 27;
  if ('ModRate' in param)              return 28;
  if ('OctaveType' in param)           return 31;
  if ('SequenceSpacing' in param)      return 33;
  if ('MidiClockIgnore' in param)      return 51;
  if ('RampBounce' in param)           return 52;
  if ('DryKill' in param)              return 57;
  if ('DipTime' in param)              return 61;
  if ('DipOffset' in param)            return 62;
  if ('DipBalance' in param)           return 63;
  if ('DipFilter' in param)            return 64;
  if ('DipFeed' in param)              return 65;
  if ('DipBounce' in param)            return 66;
  if ('DipSweep' in param)             return 67;
  if ('DipPolarity' in param)          return 68;
  if ('DipSwap' in param)              return 71;
  if ('DipMiso' in param)              return 72;
  if ('DipSpread' in param)            return 73;
  if ('DipTrails' in param)            return 74;
  if ('DipLatch' in param)             return 75;
  if ('DipFeedType' in param)          return 76;
  if ('DipFadeType' in param)          return 77;
  if ('DipModType' in param)           return 78;
  if ('Expression' in param)           return 100;
  if ('Bypass' in param)               return 102;
  if ('Tap' in param)                  return 103;
  if ('AltMode' in param)              return 104;
  if ('Freeze' in param)               return 105;
  if ('HalfSpeed' in param)            return 106;
  if ('PresetSave' in param)           return 111;
  throw new Error(`Unknown ReverseModeCParameter: ${JSON.stringify(param)}`);
}

export function parameterCCValue(param: ReverseModeCParameter): number {
  if ('Time' in param)                 return param.Time;
  if ('Mix' in param)                  return param.Mix;
  if ('Feedback' in param)             return param.Feedback;
  if ('Offset' in param)               return param.Offset;
  if ('Balance' in param)              return param.Balance;
  if ('Filter' in param)               return param.Filter;
  if ('RampSpeed' in param)            return param.RampSpeed;
  if ('SequencerSubdivision' in param) return param.SequencerSubdivision;
  if ('RampingWaveform' in param)      return param.RampingWaveform;
  if ('ModDepth' in param)             return param.ModDepth;
  if ('ModRate' in param)              return param.ModRate;
  if ('Expression' in param)           return param.Expression;
  if ('PresetSave' in param)           return param.PresetSave;
  if ('ModSync' in param)              return modSyncToCCValue(param.ModSync);
  if ('ModType' in param)              return modTypeToCCValue(param.ModType);
  if ('SequenceMode' in param)         return sequenceModeToCCValue(param.SequenceMode);
  if ('OctaveType' in param)           return octaveTypeToCCValue(param.OctaveType);
  if ('SequenceSpacing' in param)      return sequenceSpacingToCCValue(param.SequenceSpacing);
  if ('DipSweep' in param)             return sweepDirectionToCCValue(param.DipSweep);
  if ('DipPolarity' in param)          return polarityToCCValue(param.DipPolarity);
  if ('Bypass' in param)               return param.Bypass ? 127 : 0;
  if ('Tap' in param)                  return param.Tap ? 127 : 0;
  if ('AltMode' in param)              return param.AltMode ? 127 : 0;
  if ('Freeze' in param)               return param.Freeze ? 127 : 0;
  if ('HalfSpeed' in param)            return param.HalfSpeed ? 127 : 0;
  if ('DipTime' in param)              return param.DipTime ? 127 : 0;
  if ('DipOffset' in param)            return param.DipOffset ? 127 : 0;
  if ('DipBalance' in param)           return param.DipBalance ? 127 : 0;
  if ('DipFilter' in param)            return param.DipFilter ? 127 : 0;
  if ('DipFeed' in param)              return param.DipFeed ? 127 : 0;
  if ('DipBounce' in param)            return param.DipBounce ? 127 : 0;
  if ('DipSwap' in param)              return param.DipSwap ? 127 : 0;
  if ('DipMiso' in param)              return param.DipMiso ? 127 : 0;
  if ('DipSpread' in param)            return param.DipSpread ? 127 : 0;
  if ('DipTrails' in param)            return param.DipTrails ? 127 : 0;
  if ('DipLatch' in param)             return param.DipLatch ? 127 : 0;
  if ('DipFeedType' in param)          return param.DipFeedType ? 127 : 0;
  if ('DipFadeType' in param)          return param.DipFadeType ? 127 : 0;
  if ('DipModType' in param)           return param.DipModType ? 127 : 0;
  if ('MidiClockIgnore' in param)      return param.MidiClockIgnore ? 127 : 0;
  if ('RampBounce' in param)           return param.RampBounce ? 127 : 0;
  if ('DryKill' in param)              return param.DryKill ? 127 : 0;
  throw new Error(`Unknown ReverseModeCParameter: ${JSON.stringify(param)}`);
}

export function stateToCCMap(state: ReverseModeCState): Map<number, number> {
  const map = new Map<number, number>();
  map.set(14, state.time);
  map.set(15, state.mix);
  map.set(16, state.feedback);
  map.set(17, state.offset);
  map.set(18, state.balance);
  map.set(19, state.filter);
  map.set(20, state.ramp_speed);
  map.set(21, modSyncToCCValue(state.mod_sync));
  map.set(22, modTypeToCCValue(state.mod_type));
  map.set(23, sequenceModeToCCValue(state.sequence_mode));
  map.set(24, state.sequencer_subdivision);
  map.set(25, state.ramping_waveform);
  map.set(27, state.mod_depth);
  map.set(28, state.mod_rate);
  map.set(31, octaveTypeToCCValue(state.octave_type));
  map.set(33, sequenceSpacingToCCValue(state.sequence_spacing));
  map.set(51, state.midi_clock_ignore ? 127 : 0);
  map.set(52, state.ramp_bounce ? 127 : 0);
  map.set(57, state.dry_kill ? 127 : 0);
  map.set(61, state.dip_time ? 127 : 0);
  map.set(62, state.dip_offset ? 127 : 0);
  map.set(63, state.dip_balance ? 127 : 0);
  map.set(64, state.dip_filter ? 127 : 0);
  map.set(65, state.dip_feed ? 127 : 0);
  map.set(66, state.dip_bounce ? 127 : 0);
  map.set(67, sweepDirectionToCCValue(state.dip_sweep));
  map.set(68, polarityToCCValue(state.dip_polarity));
  map.set(71, state.dip_swap ? 127 : 0);
  map.set(72, state.dip_miso ? 127 : 0);
  map.set(73, state.dip_spread ? 127 : 0);
  map.set(74, state.dip_trails ? 127 : 0);
  map.set(75, state.dip_latch ? 127 : 0);
  map.set(76, state.dip_feed_type ? 127 : 0);
  map.set(77, state.dip_fade_type ? 127 : 0);
  map.set(78, state.dip_mod_type ? 127 : 0);
  map.set(100, state.expression);
  map.set(102, state.bypass ? 127 : 0);
  map.set(103, state.tap ? 127 : 0);
  map.set(104, state.alt_mode ? 127 : 0);
  map.set(105, state.freeze ? 127 : 0);
  map.set(106, state.half_speed ? 127 : 0);
  return map;
}

export function ccToParameter(cc: number, value: number): ReverseModeCParameter | null {
  switch (cc) {
    case 14:  return { Time: value };
    case 15:  return { Mix: value };
    case 16:  return { Feedback: value };
    case 17:  return { Offset: value };
    case 18:  return { Balance: value };
    case 19:  return { Filter: value };
    case 20:  return { RampSpeed: value };
    case 21:  return { ModSync: modSyncFromCCValue(value) };
    case 22:  return { ModType: modTypeFromCCValue(value) };
    case 23:  return { SequenceMode: sequenceModeFromCCValue(value) };
    case 24:  return { SequencerSubdivision: value };
    case 25:  return { RampingWaveform: value };
    case 27:  return { ModDepth: value };
    case 28:  return { ModRate: value };
    case 31:  return { OctaveType: octaveTypeFromCCValue(value) };
    case 33:  return { SequenceSpacing: sequenceSpacingFromCCValue(value) };
    case 51:  return { MidiClockIgnore: value >= 64 };
    case 52:  return { RampBounce: value >= 64 };
    case 57:  return { DryKill: value >= 64 };
    case 61:  return { DipTime: value >= 64 };
    case 62:  return { DipOffset: value >= 64 };
    case 63:  return { DipBalance: value >= 64 };
    case 64:  return { DipFilter: value >= 64 };
    case 65:  return { DipFeed: value >= 64 };
    case 66:  return { DipBounce: value >= 64 };
    case 67:  return { DipSweep: sweepDirectionFromCCValue(value) };
    case 68:  return { DipPolarity: polarityFromCCValue(value) };
    case 71:  return { DipSwap: value >= 64 };
    case 72:  return { DipMiso: value >= 64 };
    case 73:  return { DipSpread: value >= 64 };
    case 74:  return { DipTrails: value >= 64 };
    case 75:  return { DipLatch: value >= 64 };
    case 76:  return { DipFeedType: value >= 64 };
    case 77:  return { DipFadeType: value >= 64 };
    case 78:  return { DipModType: value >= 64 };
    case 100: return { Expression: value };
    case 102: return { Bypass: value >= 64 };
    case 103: return { Tap: value >= 64 };
    case 104: return { AltMode: value >= 64 };
    case 105: return { Freeze: value >= 64 };
    case 106: return { HalfSpeed: value >= 64 };
    case 111: return { PresetSave: value };
    default:  return null;
  }
}
