// Chase Bliss Audio Clean types — mirrors tauri/src/midi/pedals/clean/types.rs

import type { SweepDirection, Polarity } from '../common';

export type { SweepDirection, Polarity };

// Three-position release mode (CC 21)
export type ReleaseMode = 'Fast' | 'User' | 'Slow';

export const RELEASE_MODE_NAMES: Record<ReleaseMode, string> = {
  Fast: 'Fast',
  User: 'User',
  Slow: 'Slow',
};

export const RELEASE_MODES: ReleaseMode[] = ['Fast', 'User', 'Slow'];

// Three-position effect mode (CC 22)
export type EffectMode = 'Shifty' | 'Manual' | 'Modulated';

export const EFFECT_MODE_NAMES: Record<EffectMode, string> = {
  Shifty: 'Shifty',
  Manual: 'Manual',
  Modulated: 'Modulated',
};

export const EFFECT_MODES: EffectMode[] = ['Shifty', 'Manual', 'Modulated'];

// Three-position physics mode (CC 23)
export type PhysicsMode = 'Wobbly' | 'Off' | 'Twitchy';

export const PHYSICS_MODE_NAMES: Record<PhysicsMode, string> = {
  Wobbly: 'Wobbly',
  Off: 'Off',
  Twitchy: 'Twitchy',
};

export const PHYSICS_MODES: PhysicsMode[] = ['Wobbly', 'Off', 'Twitchy'];

// Three-position envelope mode (CC 31)
export type EnvelopeMode = 'Analog' | 'Hybrid' | 'Adaptive';

export const ENVELOPE_MODE_NAMES: Record<EnvelopeMode, string> = {
  Analog: 'Analog',
  Hybrid: 'Hybrid',
  Adaptive: 'Adaptive',
};

export const ENVELOPE_MODES: EnvelopeMode[] = ['Analog', 'Hybrid', 'Adaptive'];

// Three-position spread routing (CC 33)
export type SpreadRouting = 'Eq' | 'Both' | 'VolComp';

export const SPREAD_ROUTING_NAMES: Record<SpreadRouting, string> = {
  Eq: 'EQ',
  Both: 'Both',
  VolComp: 'Vol/Comp',
};

export const SPREAD_ROUTINGS: SpreadRouting[] = ['Eq', 'Both', 'VolComp'];

// Complete state of all Clean parameters
export interface CleanState {
  // Main control knobs
  dynamics: number;
  sensitivity: number;
  wet: number;
  attack: number;
  eq: number;
  dry: number;
  ramp_speed: number;

  // Three-position toggles
  release_mode: ReleaseMode;
  effect_mode: EffectMode;
  physics_mode: PhysicsMode;

  // Hidden options
  noise_gate_release: number;
  noise_gate_sens: number;
  swell_in: number;
  user_release: number;
  balance_filter: number;
  swell_out: number;
  envelope_mode: EnvelopeMode;
  shifty_mode: number;
  spread_routing: SpreadRouting;

  // Footswitches
  bypass: boolean;
  swell: boolean;
  alt_mode: boolean;
  swell_hold: boolean;
  dynamics_max: boolean;

  // DIP switches - Left bank
  dip_dynamics: boolean;
  dip_attack: boolean;
  dip_eq: boolean;
  dip_dry: boolean;
  dip_wet: boolean;
  dip_bounce: boolean;
  dip_sweep: SweepDirection;
  dip_polarity: Polarity;

  // DIP switches - Right bank
  dip_miso: boolean;
  dip_spread: boolean;
  dip_latch: boolean;
  dip_sidechain: boolean;
  dip_noise_gate: boolean;
  dip_motion: boolean;
  dip_swell_aux: boolean;
  dip_dusty: boolean;

  // Utility
  ramp_bounce: boolean;
  expression: number;
}

// All possible Clean parameters (Rust tagged enum serialization)
export type CleanParameter =
  // Main knobs
  | { Dynamics: number }
  | { Sensitivity: number }
  | { Wet: number }
  | { Attack: number }
  | { Eq: number }
  | { Dry: number }
  | { RampSpeed: number }
  // Toggles
  | { ReleaseMode: ReleaseMode }
  | { EffectMode: EffectMode }
  | { PhysicsMode: PhysicsMode }
  // Hidden options
  | { NoiseGateRelease: number }
  | { NoiseGateSens: number }
  | { SwellIn: number }
  | { UserRelease: number }
  | { BalanceFilter: number }
  | { SwellOut: number }
  | { EnvelopeMode: EnvelopeMode }
  | { ShiftyMode: number }
  | { SpreadRouting: SpreadRouting }
  // Footswitches
  | { Bypass: boolean }
  | { Swell: boolean }
  | { AltMode: boolean }
  | { SwellHold: boolean }
  | { DynamicsMax: boolean }
  // DIP switches - Left bank
  | { DipDynamics: boolean }
  | { DipAttack: boolean }
  | { DipEq: boolean }
  | { DipDry: boolean }
  | { DipWet: boolean }
  | { DipBounce: boolean }
  | { DipSweep: SweepDirection }
  | { DipPolarity: Polarity }
  // DIP switches - Right bank
  | { DipMiso: boolean }
  | { DipSpread: boolean }
  | { DipLatch: boolean }
  | { DipSidechain: boolean }
  | { DipNoiseGate: boolean }
  | { DipMotion: boolean }
  | { DipSwellAux: boolean }
  | { DipDusty: boolean }
  // Utility
  | { RampBounce: boolean }
  | { Expression: number }
  | { PresetSave: number };
