// Reverse Mode C types and enums — mirrors tauri/src/midi/pedals/reverse_mode_c/types.rs

import type { SweepDirection, Polarity } from '../common';

export type { SweepDirection, Polarity };

// Modulation sync (CC 21: 1=Sync, 2=Off, 3=Free)
export type ModSync = 'Sync' | 'Off' | 'Free';

export const MOD_SYNC_NAMES: Record<ModSync, string> = {
  Sync: 'Sync',
  Off: 'Off',
  Free: 'Free',
};

// Modulation type (CC 22: 1=Vib, 2=Trem, 3=Freq)
export type ModType = 'Vib' | 'Trem' | 'Freq';

export const MOD_TYPE_NAMES: Record<ModType, string> = {
  Vib: 'Vibrato',
  Trem: 'Tremolo',
  Freq: 'Frequency',
};

// Sequence mode (CC 23: 1=Run, 2=Off, 3=Env)
export type SequenceMode = 'Run' | 'Off' | 'Env';

export const SEQUENCE_MODE_NAMES: Record<SequenceMode, string> = {
  Run: 'Run',
  Off: 'Off',
  Env: 'Envelope',
};

// Octave type (CC 31: 1=OctDown, 2=BothOct, 3=OctUp)
export type OctaveType = 'OctDown' | 'BothOct' | 'OctUp';

export const OCTAVE_TYPE_NAMES: Record<OctaveType, string> = {
  OctDown: 'Oct Down',
  BothOct: 'Both Oct',
  OctUp: 'Oct Up',
};

// Complete state of all Reverse Mode C parameters
export interface ReverseModeCState {
  // Main knobs
  time: number;
  mix: number;
  feedback: number;
  offset: number;
  balance: number;
  filter: number;
  ramp_speed: number;

  // Three-position selectors
  mod_sync: ModSync;
  mod_type: ModType;
  sequence_mode: SequenceMode;

  // Alt knobs
  sequencer_subdivision: number;
  ramping_waveform: number;
  mod_depth: number;
  mod_rate: number;

  // Octave and spacing
  octave_type: OctaveType;
  sequence_spacing: boolean; // false=Rest, true=Skip

  // Footswitches
  bypass: boolean;
  tap: boolean;
  alt_mode: boolean;
  freeze: boolean;
  half_speed: boolean;

  // DIP switches - Left bank
  dip_time: boolean;
  dip_offset: boolean;
  dip_balance: boolean;
  dip_filter: boolean;
  dip_feed: boolean;
  dip_bounce: boolean;
  dip_sweep: SweepDirection;
  dip_polarity: Polarity;

  // DIP switches - Right bank
  dip_swap: boolean;
  dip_miso: boolean;
  dip_spread: boolean;
  dip_trails: boolean;
  dip_latch: boolean;
  dip_feed_type: boolean;
  dip_fade_type: boolean;
  dip_mod_type: boolean;

  // Advanced
  midi_clock_ignore: boolean;
  ramp_bounce: boolean;
  dry_kill: boolean;
  expression: number;
}

// All possible Reverse Mode C parameters (Rust tagged enum serialization)
export type ReverseModeCParameter =
  // Main knobs
  | { Time: number }
  | { Mix: number }
  | { Feedback: number }
  | { Offset: number }
  | { Balance: number }
  | { Filter: number }
  | { RampSpeed: number }
  // Three-position selectors
  | { ModSync: ModSync }
  | { ModType: ModType }
  | { SequenceMode: SequenceMode }
  // Alt knobs
  | { SequencerSubdivision: number }
  | { RampingWaveform: number }
  | { ModDepth: number }
  | { ModRate: number }
  // Octave and spacing
  | { OctaveType: OctaveType }
  | { SequenceSpacing: boolean }
  // Footswitches
  | { Bypass: boolean }
  | { Tap: boolean }
  | { AltMode: boolean }
  | { Freeze: boolean }
  | { HalfSpeed: boolean }
  // DIP switches - Left bank
  | { DipTime: boolean }
  | { DipOffset: boolean }
  | { DipBalance: boolean }
  | { DipFilter: boolean }
  | { DipFeed: boolean }
  | { DipBounce: boolean }
  | { DipSweep: SweepDirection }
  | { DipPolarity: Polarity }
  // DIP switches - Right bank
  | { DipSwap: boolean }
  | { DipMiso: boolean }
  | { DipSpread: boolean }
  | { DipTrails: boolean }
  | { DipLatch: boolean }
  | { DipFeedType: boolean }
  | { DipFadeType: boolean }
  | { DipModType: boolean }
  // Advanced
  | { MidiClockIgnore: boolean }
  | { RampBounce: boolean }
  | { DryKill: boolean }
  | { Expression: number }
  | { PresetSave: number };
