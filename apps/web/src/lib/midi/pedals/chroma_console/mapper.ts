// MIDI CC mapping for Chroma Console parameters
// Ported from apps/desktop/tauri/src/midi/pedals/chroma_console/mapper.rs

import type {
  ChromaConsoleParameter,
  ChromaConsoleState,
  CharacterModule,
  MovementModule,
  DiffusionModule,
  TextureModule,
  BypassState,
  GestureMode,
  CaptureMode,
  CaptureRouting,
  FilterMode,
  CalibrationLevel,
} from './types';

// ============================================================================
// Enum → CC value helpers
// ============================================================================

export function characterModuleToCCValue(m: CharacterModule): number {
  switch (m) {
    case 'Drive':   return 10;
    case 'Sweeten': return 32;
    case 'Fuzz':    return 54;
    case 'Howl':    return 76;
    case 'Swell':   return 98;
    case 'Off':     return 120;
  }
}

export function characterModuleFromCCValue(value: number): CharacterModule {
  if (value <= 21)  return 'Drive';
  if (value <= 43)  return 'Sweeten';
  if (value <= 65)  return 'Fuzz';
  if (value <= 87)  return 'Howl';
  if (value <= 109) return 'Swell';
  return 'Off';
}

export function movementModuleToCCValue(m: MovementModule): number {
  switch (m) {
    case 'Doubler': return 10;
    case 'Vibrato': return 32;
    case 'Phaser':  return 54;
    case 'Tremolo': return 76;
    case 'Pitch':   return 98;
    case 'Off':     return 120;
  }
}

export function movementModuleFromCCValue(value: number): MovementModule {
  if (value <= 21)  return 'Doubler';
  if (value <= 43)  return 'Vibrato';
  if (value <= 65)  return 'Phaser';
  if (value <= 87)  return 'Tremolo';
  if (value <= 109) return 'Pitch';
  return 'Off';
}

export function diffusionModuleToCCValue(m: DiffusionModule): number {
  switch (m) {
    case 'Cascade': return 10;
    case 'Reels':   return 32;
    case 'Space':   return 54;
    case 'Collage': return 76;
    case 'Reverse': return 98;
    case 'Off':     return 120;
  }
}

export function diffusionModuleFromCCValue(value: number): DiffusionModule {
  if (value <= 21)  return 'Cascade';
  if (value <= 43)  return 'Reels';
  if (value <= 65)  return 'Space';
  if (value <= 87)  return 'Collage';
  if (value <= 109) return 'Reverse';
  return 'Off';
}

export function textureModuleToCCValue(m: TextureModule): number {
  switch (m) {
    case 'Filter':       return 10;
    case 'Squash':       return 32;
    case 'Cassette':     return 54;
    case 'Broken':       return 76;
    case 'Interference': return 98;
    case 'Off':          return 120;
  }
}

export function textureModuleFromCCValue(value: number): TextureModule {
  if (value <= 21)  return 'Filter';
  if (value <= 43)  return 'Squash';
  if (value <= 65)  return 'Cassette';
  if (value <= 87)  return 'Broken';
  if (value <= 109) return 'Interference';
  return 'Off';
}

export function bypassStateToCCValue(b: BypassState): number {
  switch (b) {
    case 'Bypass':     return 127;
    case 'Engaged':    return 0;
    case 'DualBypass': return 48;
  }
}

export function bypassStateFromCCValue(value: number): BypassState {
  if (value < 32) return 'Engaged';
  if (value < 64) return 'DualBypass';
  return 'Bypass';
}

export function gestureModeToCCValue(m: GestureMode): number {
  return m === 'Play' ? 0 : 127;
}

export function gestureModeFromCCValue(value: number): GestureMode {
  return value < 64 ? 'Play' : 'Record';
}

export function captureModeToCCValue(m: CaptureMode): number {
  switch (m) {
    case 'Stop':   return 21;
    case 'Play':   return 65;
    case 'Record': return 108;
  }
}

export function captureModeFromCCValue(value: number): CaptureMode {
  if (value <= 43) return 'Stop';
  if (value <= 87) return 'Play';
  return 'Record';
}

export function captureRoutingToCCValue(r: CaptureRouting): number {
  return r === 'PostFx' ? 0 : 127;
}

export function captureRoutingFromCCValue(value: number): CaptureRouting {
  return value < 64 ? 'PostFx' : 'PreFx';
}

export function filterModeToCCValue(m: FilterMode): number {
  switch (m) {
    case 'Lpf':  return 21;
    case 'Tilt': return 65;
    case 'Hpf':  return 108;
  }
}

export function filterModeFromCCValue(value: number): FilterMode {
  if (value <= 43) return 'Lpf';
  if (value <= 87) return 'Tilt';
  return 'Hpf';
}

export function calibrationLevelToCCValue(l: CalibrationLevel): number {
  switch (l) {
    case 'Low':      return 15;
    case 'Medium':   return 47;
    case 'High':     return 79;
    case 'VeryHigh': return 111;
  }
}

export function calibrationLevelFromCCValue(value: number): CalibrationLevel {
  if (value <= 31) return 'Low';
  if (value <= 63) return 'Medium';
  if (value <= 95) return 'High';
  return 'VeryHigh';
}

// ============================================================================
// Parameter → CC number
// ============================================================================

export function parameterCCNumber(param: ChromaConsoleParameter): number {
  if (typeof param === 'string') {
    if (param === 'GestureStop') return 81;
    if (param === 'TapTempo')    return 93;
  }
  if ('Tilt' in param)              return 64;
  if ('AmountCharacter' in param)   return 65;
  if ('Rate' in param)              return 66;
  if ('AmountMovement' in param)    return 67;
  if ('Time' in param)              return 68;
  if ('AmountDiffusion' in param)   return 69;
  if ('Mix' in param)               return 70;
  if ('AmountTexture' in param)     return 71;
  if ('Sensitivity' in param)       return 72;
  if ('EffectVolCharacter' in param) return 73;
  if ('DriftMovement' in param)     return 74;
  if ('EffectVolMovement' in param) return 75;
  if ('DriftDiffusion' in param)    return 76;
  if ('EffectVolDiffusion' in param) return 77;
  if ('OutputLevel' in param)       return 78;
  if ('EffectVolTexture' in param)  return 79;
  if ('GestureMode' in param)       return 80;
  if ('CaptureMode' in param)       return 82;
  if ('CaptureRouting' in param)    return 83;
  if ('FilterMode' in param)        return 84;
  if ('BypassState' in param)       return 91;
  if ('CharacterBypass' in param)   return 103;
  if ('MovementBypass' in param)    return 104;
  if ('DiffusionBypass' in param)   return 105;
  if ('TextureBypass' in param)     return 106;
  if ('CharacterModule' in param)   return 16;
  if ('MovementModule' in param)    return 17;
  if ('DiffusionModule' in param)   return 18;
  if ('TextureModule' in param)     return 19;
  if ('CalibrationLevel' in param)  return 94;
  if ('CalibrationEnter' in param)  return 95;
  throw new Error(`Unknown ChromaConsoleParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// Parameter → CC value
// NOTE: Chroma Console uses INVERTED bypass logic: 0 = engaged, 127 = bypassed
// Module bypasses: true = bypassed → 0; false = engaged → 127
// ============================================================================

export function parameterCCValue(param: ChromaConsoleParameter): number {
  if (typeof param === 'string') return 127; // GestureStop, TapTempo
  if ('Tilt' in param)              return param.Tilt;
  if ('Rate' in param)              return param.Rate;
  if ('Time' in param)              return param.Time;
  if ('Mix' in param)               return param.Mix;
  if ('AmountCharacter' in param)   return param.AmountCharacter;
  if ('AmountMovement' in param)    return param.AmountMovement;
  if ('AmountDiffusion' in param)   return param.AmountDiffusion;
  if ('AmountTexture' in param)     return param.AmountTexture;
  if ('Sensitivity' in param)       return param.Sensitivity;
  if ('DriftMovement' in param)     return param.DriftMovement;
  if ('DriftDiffusion' in param)    return param.DriftDiffusion;
  if ('OutputLevel' in param)       return param.OutputLevel;
  if ('EffectVolCharacter' in param) return param.EffectVolCharacter;
  if ('EffectVolMovement' in param) return param.EffectVolMovement;
  if ('EffectVolDiffusion' in param) return param.EffectVolDiffusion;
  if ('EffectVolTexture' in param)  return param.EffectVolTexture;
  if ('CharacterModule' in param)   return characterModuleToCCValue(param.CharacterModule);
  if ('MovementModule' in param)    return movementModuleToCCValue(param.MovementModule);
  if ('DiffusionModule' in param)   return diffusionModuleToCCValue(param.DiffusionModule);
  if ('TextureModule' in param)     return textureModuleToCCValue(param.TextureModule);
  if ('BypassState' in param)       return bypassStateToCCValue(param.BypassState);
  // Inverted: bypassed → 0, engaged → 127
  if ('CharacterBypass' in param)   return param.CharacterBypass ? 0 : 127;
  if ('MovementBypass' in param)    return param.MovementBypass ? 0 : 127;
  if ('DiffusionBypass' in param)   return param.DiffusionBypass ? 0 : 127;
  if ('TextureBypass' in param)     return param.TextureBypass ? 0 : 127;
  if ('GestureMode' in param)       return gestureModeToCCValue(param.GestureMode);
  if ('CaptureMode' in param)       return captureModeToCCValue(param.CaptureMode);
  if ('CaptureRouting' in param)    return captureRoutingToCCValue(param.CaptureRouting);
  if ('FilterMode' in param)        return filterModeToCCValue(param.FilterMode);
  if ('CalibrationLevel' in param)  return calibrationLevelToCCValue(param.CalibrationLevel);
  if ('CalibrationEnter' in param)  return param.CalibrationEnter ? 127 : 0;
  throw new Error(`Unknown ChromaConsoleParameter: ${JSON.stringify(param)}`);
}

// ============================================================================
// State → CC map (for full preset recall)
// ============================================================================

export function stateToCCMap(state: ChromaConsoleState): Map<number, number> {
  const map = new Map<number, number>();

  // Primary controls
  map.set(64, state.tilt);
  map.set(66, state.rate);
  map.set(68, state.time);
  map.set(70, state.mix);
  map.set(65, state.amount_character);
  map.set(67, state.amount_movement);
  map.set(69, state.amount_diffusion);
  map.set(71, state.amount_texture);

  // Secondary controls
  map.set(72, state.sensitivity);
  map.set(74, state.drift_movement);
  map.set(76, state.drift_diffusion);
  map.set(78, state.output_level);
  map.set(73, state.effect_vol_character);
  map.set(75, state.effect_vol_movement);
  map.set(77, state.effect_vol_diffusion);
  map.set(79, state.effect_vol_texture);

  // Module selections
  map.set(16, characterModuleToCCValue(state.character_module));
  map.set(17, movementModuleToCCValue(state.movement_module));
  map.set(18, diffusionModuleToCCValue(state.diffusion_module));
  map.set(19, textureModuleToCCValue(state.texture_module));

  // Bypass state (standard bypass CC 91)
  map.set(91, bypassStateToCCValue(state.bypass_state));

  // Module bypasses (inverted: bypassed=0, engaged=127)
  map.set(103, state.character_bypass ? 0 : 127);
  map.set(104, state.movement_bypass ? 0 : 127);
  map.set(105, state.diffusion_bypass ? 0 : 127);
  map.set(106, state.texture_bypass ? 0 : 127);

  // Other functions
  map.set(80, gestureModeToCCValue(state.gesture_mode));
  map.set(82, captureModeToCCValue(state.capture_mode));
  map.set(83, captureRoutingToCCValue(state.capture_routing));
  map.set(84, filterModeToCCValue(state.filter_mode));
  map.set(94, calibrationLevelToCCValue(state.calibration_level));

  return map;
}

// ============================================================================
// CC → Parameter (for useMIDIInput bidirectional updates)
// ============================================================================

export function ccToParameter(cc: number, value: number): ChromaConsoleParameter | null {
  switch (cc) {
    case 16: return { CharacterModule: characterModuleFromCCValue(value) };
    case 17: return { MovementModule: movementModuleFromCCValue(value) };
    case 18: return { DiffusionModule: diffusionModuleFromCCValue(value) };
    case 19: return { TextureModule: textureModuleFromCCValue(value) };
    case 64: return { Tilt: value };
    case 65: return { AmountCharacter: value };
    case 66: return { Rate: value };
    case 67: return { AmountMovement: value };
    case 68: return { Time: value };
    case 69: return { AmountDiffusion: value };
    case 70: return { Mix: value };
    case 71: return { AmountTexture: value };
    case 72: return { Sensitivity: value };
    case 73: return { EffectVolCharacter: value };
    case 74: return { DriftMovement: value };
    case 75: return { EffectVolMovement: value };
    case 76: return { DriftDiffusion: value };
    case 77: return { EffectVolDiffusion: value };
    case 78: return { OutputLevel: value };
    case 79: return { EffectVolTexture: value };
    case 80: return { GestureMode: gestureModeFromCCValue(value) };
    case 81: return 'GestureStop';
    case 82: return { CaptureMode: captureModeFromCCValue(value) };
    case 83: return { CaptureRouting: captureRoutingFromCCValue(value) };
    case 84: return { FilterMode: filterModeFromCCValue(value) };
    case 91: return { BypassState: bypassStateFromCCValue(value) };
    case 93: return 'TapTempo';
    case 94: return { CalibrationLevel: calibrationLevelFromCCValue(value) };
    case 95: return { CalibrationEnter: value >= 64 };
    // Module bypasses: low value = bypassed (true), high value = engaged (false)
    case 103: return { CharacterBypass: value < 64 };
    case 104: return { MovementBypass: value < 64 };
    case 105: return { DiffusionBypass: value < 64 };
    case 106: return { TextureBypass: value < 64 };
    default:  return null;
  }
}
