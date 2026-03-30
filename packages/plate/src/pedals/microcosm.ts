// Microcosm-specific types and enums

// ============================================================================
// Microcosm Enums
// ============================================================================

export type SubdivisionValue = 
  | 'QuarterNote' 
  | 'HalfNote' 
  | 'Tap' 
  | 'Double' 
  | 'Quadruple' 
  | 'Octuple';

export type WaveformShape = 'Square' | 'Ramp' | 'Triangle' | 'Saw';

// Note: Reverb mode is actually encoded in reverb_time (CC 20):
// 0-31: Bright room, 32-63: Dark medium, 64-95: Large hall, 96-127: Ambient
// For now we expose it as a single continuous value

export type PlaybackDirection = 'Forward' | 'Reverse';

export type LooperRouting = 'PostFX' | 'PreFX';

// Effect selection types (matching Rust enums)
export type EffectCategory = 'MicroLoop' | 'MultiDelay' | 'Granules' | 'MultiPass';

export type EffectType = 
  | 'Mosaic' | 'Seq' | 'Glide'
  | 'Blocks' | 'Interrupt' | 'Arp'
  | 'Haze' | 'Tunnel' | 'Strum'
  | 'Pattern' | 'Warp';

export type EffectVariation = 'A' | 'B' | 'C' | 'D';

// ============================================================================
// State Interface
// ============================================================================

export interface MicrocosmState {
  // Current effect selection
  current_effect: EffectType;
  current_variation: EffectVariation;
  
  // Time controls
  subdivision: SubdivisionValue;
  time: number;
  hold_sampler: boolean;
  tempo_mode?: boolean; // UI preference: true = tempo mode (BPM display), false = subdivision mode
  
  // Special Sauce
  activity: number;
  repeats: number;
  
  // Modulation
  shape: WaveformShape;
  frequency: number;
  depth: number;
  
  // Filter
  cutoff: number;
  resonance: number;
  
  // Effect
  mix: number;
  volume: number;
  reverse_effect: boolean;
  bypass: boolean;
  
  // Reverb
  space: number;
  reverb_time: number;
  
  // Looper
  loop_level: number;
  looper_speed: number;
  looper_speed_stepped: SubdivisionValue;
  fade_time: number;
  looper_enabled: boolean;
  playback_direction: PlaybackDirection;
  routing: LooperRouting;
  looper_only: boolean;
  burst_mode: boolean;
  quantized: boolean;
}

// ============================================================================
// Parameter Union Type
// ============================================================================

export type MicrocosmParameter =
  | { Subdivision: SubdivisionValue }
  | { Time: number }
  | { HoldSampler: boolean }
  | 'TapTempo'
  | { Activity: number }
  | { Repeats: number }
  | { Shape: WaveformShape }
  | { Frequency: number }
  | { Depth: number }
  | { Cutoff: number }
  | { Resonance: number }
  | { Mix: number }
  | { Volume: number }
  | { ReverseEffect: boolean }
  | { Bypass: boolean }
  | { Space: number }
  | { ReverbTime: number }
  | { LoopLevel: number }
  | { LooperSpeed: number }
  | { LooperSpeedStepped: SubdivisionValue }
  | { FadeTime: number }
  | { LooperEnabled: boolean }
  | { PlaybackDirection: PlaybackDirection }
  | { Routing: LooperRouting }
  | { LooperOnly: boolean }
  | { BurstMode: boolean }
  | { Quantized: boolean }
  | 'LooperRecord'
  | 'LooperPlay'
  | 'LooperOverdub'
  | 'LooperStop'
  | 'LooperErase'
  | 'LooperUndo'
  | 'PresetCopy'
  | 'PresetSave';
