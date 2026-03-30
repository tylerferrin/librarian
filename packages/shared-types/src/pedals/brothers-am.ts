// Brothers AM types and enums — mirrors tauri/src/midi/pedals/brothers_am/types.rs

import type { SweepDirection, Polarity } from '../common';

export type { SweepDirection, Polarity };

// Channel 2 gain type (CC 21: 1=Boost, 2=OD, 3=Dist)
export type Gain2Type = 'Boost' | 'OD' | 'Dist';

export const GAIN2_TYPE_NAMES: Record<Gain2Type, string> = {
  Boost: 'Boost',
  OD: 'Overdrive',
  Dist: 'Distortion',
};

// Treble boost mode (CC 22: 1=FullSun, 2=Off, 3=HalfSun)
export type TrebleBoost = 'FullSun' | 'Off' | 'HalfSun';

export const TREBLE_BOOST_NAMES: Record<TrebleBoost, string> = {
  FullSun: 'Full Sun',
  Off: 'Off',
  HalfSun: 'Half Sun',
};

// Channel 1 gain type (CC 23: 1=Dist, 2=OD, 3=Boost)
export type Gain1Type = 'Dist' | 'OD' | 'Boost';

export const GAIN1_TYPE_NAMES: Record<Gain1Type, string> = {
  Dist: 'Distortion',
  OD: 'Overdrive',
  Boost: 'Boost',
};

// Complete state of all Brothers AM parameters
export interface BrothersAmState {
  // Channel 2 knobs
  gain2: number;
  volume2: number;
  tone2: number;
  presence2: number;

  // Channel 1 knobs
  gain1: number;
  volume1: number;
  tone1: number;
  presence1: number;

  // Three-position selectors
  gain2_type: Gain2Type;
  treble_boost: TrebleBoost;
  gain1_type: Gain1Type;

  // Channel bypass switches
  channel1_bypass: boolean;
  channel2_bypass: boolean;

  // DIP switches - Left bank
  dip_volume1: boolean;
  dip_volume2: boolean;
  dip_gain1: boolean;
  dip_gain2: boolean;
  dip_tone1: boolean;
  dip_tone2: boolean;
  dip_sweep: SweepDirection;
  dip_polarity: Polarity;

  // DIP switches - Right bank
  dip_hi_gain1: boolean;
  dip_hi_gain2: boolean;
  dip_moto_byp1: boolean;
  dip_moto_byp2: boolean;
  dip_pres_link1: boolean;
  dip_pres_link2: boolean;
  dip_master: boolean;

  // Expression
  expression: number;
}

// All possible Brothers AM parameters (Rust tagged enum serialization)
export type BrothersAmParameter =
  // Channel 2 knobs
  | { Gain2: number }
  | { Volume2: number }
  | { Tone2: number }
  | { Presence2: number }
  // Channel 1 knobs
  | { Gain1: number }
  | { Volume1: number }
  | { Tone1: number }
  | { Presence1: number }
  // Three-position selectors
  | { Gain2Type: Gain2Type }
  | { TrebleBoost: TrebleBoost }
  | { Gain1Type: Gain1Type }
  // Channel bypass
  | { Channel1Bypass: boolean }
  | { Channel2Bypass: boolean }
  // DIP switches - Left bank
  | { DipVolume1: boolean }
  | { DipVolume2: boolean }
  | { DipGain1: boolean }
  | { DipGain2: boolean }
  | { DipTone1: boolean }
  | { DipTone2: boolean }
  | { DipSweep: SweepDirection }
  | { DipPolarity: Polarity }
  // DIP switches - Right bank
  | { DipHiGain1: boolean }
  | { DipHiGain2: boolean }
  | { DipMotoByp1: boolean }
  | { DipMotoByp2: boolean }
  | { DipPresLink1: boolean }
  | { DipPresLink2: boolean }
  | { DipMaster: boolean }
  // Expression
  | { Expression: number }
  | { PresetSave: number };
