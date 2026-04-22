// MIDI CC mapping for Microcosm parameters
// Ported from apps/desktop/tauri/src/midi/pedals/microcosm/mapper.rs

import type {
  MicrocosmParameter,
  MicrocosmState,
  SubdivisionValue,
  WaveformShape,
  PlaybackDirection,
  LooperRouting,
} from './types';

// ============================================================================
// Enum → CC value helpers
// ============================================================================

export function subdivisionToCCValue(s: SubdivisionValue): number {
  switch (s) {
    case 'QuarterNote': return 0;
    case 'HalfNote':    return 1;
    case 'Tap':         return 2;
    case 'Double':      return 3;
    case 'Quadruple':   return 4;
    case 'Octuple':     return 5;
  }
}

export function subdivisionFromCCValue(value: number): SubdivisionValue {
  switch (value) {
    case 0: return 'QuarterNote';
    case 1: return 'HalfNote';
    case 2: return 'Tap';
    case 3: return 'Double';
    case 4: return 'Quadruple';
    default: return 'Octuple';
  }
}

export function waveformToCCValue(s: WaveformShape): number {
  switch (s) {
    case 'Square':   return 16;
    case 'Ramp':     return 48;
    case 'Triangle': return 80;
    case 'Saw':      return 112;
  }
}

export function waveformFromCCValue(value: number): WaveformShape {
  if (value <= 31)  return 'Square';
  if (value <= 63)  return 'Ramp';
  if (value <= 95)  return 'Triangle';
  return 'Saw';
}

export function playbackDirectionToCCValue(d: PlaybackDirection): number {
  return d === 'Forward' ? 0 : 127;
}

export function playbackDirectionFromCCValue(value: number): PlaybackDirection {
  return value < 64 ? 'Forward' : 'Reverse';
}

export function looperRoutingToCCValue(r: LooperRouting): number {
  return r === 'PostFX' ? 0 : 127;
}

export function looperRoutingFromCCValue(value: number): LooperRouting {
  return value < 64 ? 'PostFX' : 'PreFX';
}

// ============================================================================
// Parameter → CC number
// ============================================================================

export function parameterCCNumber(param: MicrocosmParameter): number {
  if (typeof param === 'string') {
    switch (param) {
      case 'TapTempo':     return 93;
      case 'LooperRecord': return 28;
      case 'LooperPlay':   return 29;
      case 'LooperOverdub':return 30;
      case 'LooperStop':   return 31;
      case 'LooperErase':  return 34;
      case 'LooperUndo':   return 35;
      case 'PresetCopy':   return 45;
      case 'PresetSave':   return 46;
    }
  }
  if ('Subdivision' in param)      return 5;
  if ('Time' in param)             return 10;
  if ('HoldSampler' in param)      return 48;
  if ('Activity' in param)         return 6;
  if ('Repeats' in param)          return 11;
  if ('Shape' in param)            return 7;
  if ('Frequency' in param)        return 14;
  if ('Depth' in param)            return 19;
  if ('Cutoff' in param)           return 8;
  if ('Resonance' in param)        return 15;
  if ('Mix' in param)              return 9;
  if ('Volume' in param)           return 16;
  if ('ReverseEffect' in param)    return 47;
  if ('Bypass' in param)           return 102;
  if ('Space' in param)            return 12;
  if ('ReverbTime' in param)       return 20;
  if ('LoopLevel' in param)        return 13;
  if ('LooperSpeed' in param)      return 17;
  if ('LooperSpeedStepped' in param) return 18;
  if ('FadeTime' in param)         return 21;
  if ('LooperEnabled' in param)    return 22;
  if ('PlaybackDirection' in param)return 23;
  if ('Routing' in param)          return 24;
  if ('LooperOnly' in param)       return 25;
  if ('BurstMode' in param)        return 26;
  if ('Quantized' in param)        return 27;
  throw new Error(`Unknown MicrocosmParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// Parameter → CC value
// ============================================================================

export function parameterCCValue(param: MicrocosmParameter): number {
  if (typeof param === 'string') {
    // All trigger parameters send 127
    return 127;
  }
  if ('Time' in param)             return param.Time;
  if ('Activity' in param)         return param.Activity;
  if ('Repeats' in param)          return param.Repeats;
  if ('Frequency' in param)        return param.Frequency;
  if ('Depth' in param)            return param.Depth;
  if ('Cutoff' in param)           return param.Cutoff;
  if ('Resonance' in param)        return param.Resonance;
  if ('Mix' in param)              return param.Mix;
  if ('Volume' in param)           return param.Volume;
  if ('Space' in param)            return param.Space;
  if ('ReverbTime' in param)       return param.ReverbTime;
  if ('LoopLevel' in param)        return param.LoopLevel;
  if ('LooperSpeed' in param)      return param.LooperSpeed;
  if ('FadeTime' in param)         return param.FadeTime;
  if ('Subdivision' in param)      return subdivisionToCCValue(param.Subdivision);
  if ('LooperSpeedStepped' in param) return subdivisionToCCValue(param.LooperSpeedStepped);
  if ('Shape' in param)            return waveformToCCValue(param.Shape);
  if ('PlaybackDirection' in param) return playbackDirectionToCCValue(param.PlaybackDirection);
  if ('Routing' in param)          return looperRoutingToCCValue(param.Routing);
  if ('HoldSampler' in param)      return param.HoldSampler ? 127 : 0;
  if ('Bypass' in param)           return param.Bypass ? 127 : 0;
  if ('ReverseEffect' in param)    return param.ReverseEffect ? 127 : 0;
  if ('LooperEnabled' in param)    return param.LooperEnabled ? 127 : 0;
  if ('LooperOnly' in param)       return param.LooperOnly ? 127 : 0;
  if ('BurstMode' in param)        return param.BurstMode ? 127 : 0;
  if ('Quantized' in param)        return param.Quantized ? 127 : 0;
  throw new Error(`Unknown MicrocosmParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// State → CC map (for full preset recall)
// ============================================================================

export function stateToCCMap(state: MicrocosmState): Map<number, number> {
  const map = new Map<number, number>();

  // Time controls
  map.set(5,  subdivisionToCCValue(state.subdivision));
  map.set(10, state.time);
  map.set(48, state.hold_sampler ? 127 : 0);

  // Special Sauce
  map.set(6,  state.activity);
  map.set(11, state.repeats);

  // Modulation
  map.set(7,  waveformToCCValue(state.shape));
  map.set(14, state.frequency);
  map.set(19, state.depth);

  // Filter
  map.set(8,  state.cutoff);
  map.set(15, state.resonance);

  // Effect
  map.set(9,   state.mix);
  map.set(16,  state.volume);
  map.set(47,  state.reverse_effect ? 127 : 0);
  map.set(102, state.bypass ? 127 : 0);

  // Reverb
  map.set(12, state.space);
  map.set(20, state.reverb_time);

  // Looper
  map.set(13, state.loop_level);
  map.set(17, state.looper_speed);
  map.set(18, subdivisionToCCValue(state.looper_speed_stepped));
  map.set(21, state.fade_time);
  map.set(22, state.looper_enabled ? 127 : 0);
  map.set(23, playbackDirectionToCCValue(state.playback_direction));
  map.set(24, looperRoutingToCCValue(state.routing));
  map.set(25, state.looper_only ? 127 : 0);
  map.set(26, state.burst_mode ? 127 : 0);
  map.set(27, state.quantized ? 127 : 0);

  return map;
}

// ============================================================================
// CC → Parameter (for useMIDIInput bidirectional updates)
// ============================================================================

export function ccToParameter(cc: number, value: number): MicrocosmParameter | null {
  switch (cc) {
    case 5:   return { Subdivision: subdivisionFromCCValue(value) };
    case 6:   return { Activity: value };
    case 7:   return { Shape: waveformFromCCValue(value) };
    case 8:   return { Cutoff: value };
    case 9:   return { Mix: value };
    case 10:  return { Time: value };
    case 11:  return { Repeats: value };
    case 12:  return { Space: value };
    case 13:  return { LoopLevel: value };
    case 14:  return { Frequency: value };
    case 15:  return { Resonance: value };
    case 16:  return { Volume: value };
    case 17:  return { LooperSpeed: value };
    case 18:  return { LooperSpeedStepped: subdivisionFromCCValue(value) };
    case 19:  return { Depth: value };
    case 20:  return { ReverbTime: value };
    case 21:  return { FadeTime: value };
    case 22:  return { LooperEnabled: value >= 64 };
    case 23:  return { PlaybackDirection: playbackDirectionFromCCValue(value) };
    case 24:  return { Routing: looperRoutingFromCCValue(value) };
    case 25:  return { LooperOnly: value >= 64 };
    case 26:  return { BurstMode: value >= 64 };
    case 27:  return { Quantized: value >= 64 };
    case 28:  return 'LooperRecord';
    case 29:  return 'LooperPlay';
    case 30:  return 'LooperOverdub';
    case 31:  return 'LooperStop';
    case 34:  return 'LooperErase';
    case 35:  return 'LooperUndo';
    case 45:  return 'PresetCopy';
    case 46:  return 'PresetSave';
    case 47:  return { ReverseEffect: value >= 64 };
    case 48:  return { HoldSampler: value >= 64 };
    case 93:  return 'TapTempo';
    case 102: return { Bypass: value >= 64 };
    default:  return null;
  }
}
