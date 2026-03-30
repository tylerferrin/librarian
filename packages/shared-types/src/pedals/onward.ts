// Chase Bliss Audio Onward types — mirrors tauri/src/midi/pedals/onward/types.rs

import type { SweepDirection, Polarity } from '../common';

export type { SweepDirection, Polarity };

// Three-position error type (CC 21)
export type ErrorType = 'Timing' | 'Condition' | 'Playback';

export const ERROR_TYPE_NAMES: Record<ErrorType, string> = {
  Timing: 'Timing',
  Condition: 'Condition',
  Playback: 'Playback',
};

export const ERROR_TYPES: ErrorType[] = ['Timing', 'Condition', 'Playback'];

// Three-position fade mode (CC 22)
export type FadeMode = 'Long' | 'User' | 'Short';

export const FADE_MODE_NAMES: Record<FadeMode, string> = {
  Long: 'Long',
  User: 'User',
  Short: 'Short',
};

export const FADE_MODES: FadeMode[] = ['Long', 'User', 'Short'];

// Three-position animate mode (CC 23)
export type AnimateMode = 'Vibrato' | 'Off' | 'Chorus';

export const ANIMATE_MODE_NAMES: Record<AnimateMode, string> = {
  Vibrato: 'Vibrato',
  Off: 'Off',
  Chorus: 'Chorus',
};

export const ANIMATE_MODES: AnimateMode[] = ['Vibrato', 'Off', 'Chorus'];

// Three-position signal routing (CC 31, 32, 33)
export type Routing = 'Glitch' | 'Both' | 'Freeze';

export const ROUTING_NAMES: Record<Routing, string> = {
  Glitch: 'Glitch',
  Both: 'Both',
  Freeze: 'Freeze',
};

export const ROUTINGS: Routing[] = ['Glitch', 'Both', 'Freeze'];

// Complete state of all Onward parameters
export interface OnwardState {
  // Main control knobs
  size: number;
  mix: number;
  octave: number;
  error: number;
  sustain: number;
  texture: number;
  ramp_speed: number;

  // Three-position toggles
  error_type: ErrorType;
  fade_mode: FadeMode;
  animate_mode: AnimateMode;

  // Hidden options
  sensitivity: number;
  balance: number;
  duck_depth: number;
  error_blend: number;
  user_fade: number;
  filter: number;
  error_routing: Routing;
  sustain_routing: Routing;
  effects_routing: Routing;

  // Footswitches
  freeze_bypass: boolean;
  glitch_bypass: boolean;
  alt_mode: boolean;
  glitch_hold: boolean;
  freeze_hold: boolean;
  retrigger_glitch: boolean;
  retrigger_freeze: boolean;

  // DIP switches - Left bank
  dip_size: boolean;
  dip_error: boolean;
  dip_sustain: boolean;
  dip_texture: boolean;
  dip_octave: boolean;
  dip_bounce: boolean;
  dip_sweep: SweepDirection;
  dip_polarity: Polarity;

  // DIP switches - Right bank
  dip_miso: boolean;
  dip_spread: boolean;
  dip_latch: boolean;
  dip_sidechain: boolean;
  dip_duck: boolean;
  dip_reverse: boolean;
  dip_half_speed: boolean;
  dip_manual: boolean;

  // Utility
  midi_clock_ignore: boolean;
  ramp_bounce: boolean;
  dry_kill: boolean;
  trails: boolean;
  expression: number;
}

// All possible Onward parameters (Rust tagged enum serialization)
export type OnwardParameter =
  // Main knobs
  | { Size: number }
  | { Mix: number }
  | { Octave: number }
  | { Error: number }
  | { Sustain: number }
  | { Texture: number }
  | { RampSpeed: number }
  // Toggles
  | { ErrorType: ErrorType }
  | { FadeMode: FadeMode }
  | { AnimateMode: AnimateMode }
  // Hidden options
  | { Sensitivity: number }
  | { Balance: number }
  | { DuckDepth: number }
  | { ErrorBlend: number }
  | { UserFade: number }
  | { Filter: number }
  | { ErrorRouting: Routing }
  | { SustainRouting: Routing }
  | { EffectsRouting: Routing }
  // Footswitches
  | { FreezeBypass: boolean }
  | { GlitchBypass: boolean }
  | { AltMode: boolean }
  | { GlitchHold: boolean }
  | { FreezeHold: boolean }
  | { RetriggerGlitch: boolean }
  | { RetriggerFreeze: boolean }
  // DIP switches - Left bank
  | { DipSize: boolean }
  | { DipError: boolean }
  | { DipSustain: boolean }
  | { DipTexture: boolean }
  | { DipOctave: boolean }
  | { DipBounce: boolean }
  | { DipSweep: SweepDirection }
  | { DipPolarity: Polarity }
  // DIP switches - Right bank
  | { DipMiso: boolean }
  | { DipSpread: boolean }
  | { DipLatch: boolean }
  | { DipSidechain: boolean }
  | { DipDuck: boolean }
  | { DipReverse: boolean }
  | { DipHalfSpeed: boolean }
  | { DipManual: boolean }
  // Utility
  | { MidiClockIgnore: boolean }
  | { RampBounce: boolean }
  | { DryKill: boolean }
  | { Trails: boolean }
  | { Expression: number }
  | { PresetSave: number };
