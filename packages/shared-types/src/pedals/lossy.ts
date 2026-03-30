// Lossy types and enums — mirrors tauri/src/midi/pedals/lossy/types.rs

import type { SweepDirection, Polarity } from '../common';

export type { SweepDirection, Polarity };

export type FilterSlope = 'Db6' | 'Db24' | 'Db96';
export type PacketMode = 'Repeat' | 'Clean' | 'LossMode';
export type LossEffect = 'Inverse' | 'Standard' | 'Jitter';
export type Weighting = 'Dark' | 'Neutral' | 'Bright';

export interface LossyState {
  // Main knobs
  filter: number;
  global: number;
  reverb: number;
  freq: number;
  speed: number;
  loss: number;
  ramp_speed: number;

  // Three-position toggles
  filter_slope: FilterSlope;
  packet_mode: PacketMode;
  loss_effect: LossEffect;

  // Hidden / alt menu knobs
  gate: number;
  freezer: number;
  verb_decay: number;
  limiter_threshold: number;
  auto_gain: number;
  loss_gain: number;

  // Weighting
  weighting: Weighting;

  // Footswitches
  bypass: boolean;
  freeze_slushie: boolean;
  alt_mode: boolean;
  freeze_solid: boolean;
  gate_switch: boolean;

  // DIP switches - Left bank
  dip_filter: boolean;
  dip_freq: boolean;
  dip_speed: boolean;
  dip_loss: boolean;
  dip_verb: boolean;
  dip_bounce: boolean;
  dip_sweep: SweepDirection;
  dip_polarity: Polarity;

  // DIP switches - Right bank
  dip_miso: boolean;
  dip_spread: boolean;
  dip_trails: boolean;
  dip_latch: boolean;
  dip_pre_post: boolean;
  dip_slow: boolean;
  dip_invert: boolean;
  dip_all_wet: boolean;

  // Advanced
  ramp_bounce: boolean;
  dry_kill: boolean;
  expression: number;
}

// All possible Lossy parameters (Rust tagged enum serialization)
export type LossyParameter =
  // Main knobs
  | { Filter: number }
  | { Global: number }
  | { Reverb: number }
  | { Freq: number }
  | { Speed: number }
  | { Loss: number }
  | { RampSpeed: number }
  // Toggles
  | { FilterSlope: FilterSlope }
  | { PacketMode: PacketMode }
  | { LossEffect: LossEffect }
  // Hidden knobs
  | { Gate: number }
  | { Freezer: number }
  | { VerbDecay: number }
  | { LimiterThreshold: number }
  | { AutoGain: number }
  | { LossGain: number }
  | { Weighting: Weighting }
  // Footswitches
  | { Bypass: boolean }
  | { FreezeSlushie: boolean }
  | { AltMode: boolean }
  | { FreezeSolid: boolean }
  | { GateSwitch: boolean }
  // DIP switches - Left bank
  | { DipFilter: boolean }
  | { DipFreq: boolean }
  | { DipSpeed: boolean }
  | { DipLoss: boolean }
  | { DipVerb: boolean }
  | { DipBounce: boolean }
  | { DipSweep: SweepDirection }
  | { DipPolarity: Polarity }
  // DIP switches - Right bank
  | { DipMiso: boolean }
  | { DipSpread: boolean }
  | { DipTrails: boolean }
  | { DipLatch: boolean }
  | { DipPrePost: boolean }
  | { DipSlow: boolean }
  | { DipInvert: boolean }
  | { DipAllWet: boolean }
  // Advanced
  | { RampBounce: boolean }
  | { DryKill: boolean }
  | { Expression: number }
  | { PresetSave: number };
