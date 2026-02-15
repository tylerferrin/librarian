// Chroma Console-specific types and enums

// ============================================================================
// Chroma Console Enums
// ============================================================================

export type CharacterModule = 
  | 'Drive' 
  | 'Sweeten' 
  | 'Fuzz' 
  | 'Howl' 
  | 'Swell' 
  | 'Off';

export type MovementModule = 
  | 'Doubler' 
  | 'Vibrato' 
  | 'Phaser' 
  | 'Tremolo' 
  | 'Pitch' 
  | 'Off';

export type DiffusionModule = 
  | 'Cascade' 
  | 'Reels' 
  | 'Space' 
  | 'Collage' 
  | 'Reverse' 
  | 'Off';

export type TextureModule = 
  | 'Filter' 
  | 'Squash' 
  | 'Cassette' 
  | 'Broken' 
  | 'Interference' 
  | 'Off';

export type BypassState = 'Bypass' | 'Engaged' | 'DualBypass';

export type GestureMode = 'Play' | 'Record';

export type CaptureMode = 'Stop' | 'Play' | 'Record';

export type CaptureRouting = 'PostFx' | 'PreFx';

export type FilterMode = 'Lpf' | 'Tilt' | 'Hpf';

export type CalibrationLevel = 'Low' | 'Medium' | 'High' | 'VeryHigh';

// ============================================================================
// State Interface
// ============================================================================

export interface ChromaConsoleState {
  // Primary controls (main knobs on pedal)
  tilt: number;              // CC# 64, 0-127
  rate: number;              // CC# 66, 0-127
  time: number;              // CC# 68, 0-127
  mix: number;               // CC# 70, 0-127
  amount_character: number;  // CC# 65, 0-127
  amount_movement: number;   // CC# 67, 0-127
  amount_diffusion: number;  // CC# 69, 0-127
  amount_texture: number;    // CC# 71, 0-127
  
  // Secondary controls
  sensitivity: number;        // CC# 72, 0-127
  drift_movement: number;     // CC# 74, 0-127
  drift_diffusion: number;    // CC# 76, 0-127
  output_level: number;       // CC# 78, 0-127
  effect_vol_character: number;  // CC# 73, 0-127
  effect_vol_movement: number;   // CC# 75, 0-127
  effect_vol_diffusion: number;  // CC# 77, 0-127
  effect_vol_texture: number;    // CC# 79, 0-127
  
  // Module selections
  character_module: CharacterModule;   // CC# 16
  movement_module: MovementModule;     // CC# 17
  diffusion_module: DiffusionModule;   // CC# 18
  texture_module: TextureModule;       // CC# 19
  
  // Bypass controls
  bypass_state: BypassState;           // CC# 91 or CC# 92
  character_bypass: boolean;           // CC# 103
  movement_bypass: boolean;            // CC# 104
  diffusion_bypass: boolean;           // CC# 105
  texture_bypass: boolean;             // CC# 106
  
  // Other functions
  gesture_mode: GestureMode;           // CC# 80
  capture_mode: CaptureMode;           // CC# 82
  capture_routing: CaptureRouting;     // CC# 83
  filter_mode: FilterMode;             // CC# 84
  calibration_level: CalibrationLevel; // CC# 94
}

// ============================================================================
// Parameter Union Type
// ============================================================================

export type ChromaConsoleParameter =
  // Primary controls
  | { Tilt: number }
  | { Rate: number }
  | { Time: number }
  | { Mix: number }
  | { AmountCharacter: number }
  | { AmountMovement: number }
  | { AmountDiffusion: number }
  | { AmountTexture: number }
  // Secondary controls
  | { Sensitivity: number }
  | { DriftMovement: number }
  | { DriftDiffusion: number }
  | { OutputLevel: number }
  | { EffectVolCharacter: number }
  | { EffectVolMovement: number }
  | { EffectVolDiffusion: number }
  | { EffectVolTexture: number }
  // Module selections
  | { CharacterModule: CharacterModule }
  | { MovementModule: MovementModule }
  | { DiffusionModule: DiffusionModule }
  | { TextureModule: TextureModule }
  // Bypass controls
  | { BypassState: BypassState }
  | { CharacterBypass: boolean }
  | { MovementBypass: boolean }
  | { DiffusionBypass: boolean }
  | { TextureBypass: boolean }
  // Other functions
  | { GestureMode: GestureMode }
  | 'GestureStop'
  | { CaptureMode: CaptureMode }
  | { CaptureRouting: CaptureRouting }
  | 'TapTempo'
  | { FilterMode: FilterMode }
  | { CalibrationLevel: CalibrationLevel }
  | { CalibrationEnter: boolean };
