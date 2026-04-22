// Mood MkII types and enums — mirrors tauri/src/midi/pedals/mood_mkii/types.rs

export type WetChannelRouting = 'Reverb' | 'Delay' | 'Slip';
export type MoodRouting = 'Lfo' | 'Mid' | 'Env';
export type MicroLooper = 'Env' | 'Tape' | 'Stretch';
export type MoodSync = 'On' | 'NoSync' | 'Auto';
export type MoodSpread = 'Only' | 'Both' | 'OnlyAlt';
export type SweepDirection = 'Bottom' | 'Top';
export type Polarity = 'Forward' | 'Reverse';

export interface MoodMkiiState {
  // Main knobs
  time: number;
  mix: number;
  length: number;
  modify_wet: number;
  clock: number;
  modify_looper: number;
  ramp_speed: number;

  // Three-position toggles
  wet_channel_routing: WetChannelRouting;
  routing: MoodRouting;
  micro_looper: MicroLooper;

  // Hidden / alt menu knobs
  stereo_width: number;
  ramping_waveform: number;
  fade: number;
  tone: number;
  level_balance: number;
  direct_micro_loop: number;

  // Sync and spread
  sync: MoodSync;
  spread: MoodSpread;

  // Buffer
  buffer_length: boolean; // false=HalfMki, true=Full

  // Footswitches
  bypass_left: boolean;
  bypass_right: boolean;
  hidden_menu: boolean;
  freeze: boolean;
  overdub: boolean;

  // DIP switches - Left bank
  dip_time: boolean;
  dip_modify_wet: boolean;
  dip_clock: boolean;
  dip_modify_looper: boolean;
  dip_length: boolean;
  dip_bounce: boolean;
  dip_sweep: SweepDirection;
  dip_polarity: Polarity;

  // DIP switches - Right bank
  dip_classic: boolean;
  dip_miso: boolean;
  dip_spread: boolean;
  dip_dry_kill: boolean;
  dip_trails: boolean;
  dip_latch: boolean;
  dip_no_dub: boolean;
  dip_smooth: boolean;

  // Advanced
  midi_clock_ignore: boolean;
  ramp_bounce: boolean;
  expression: number;
}

// All possible Mood MkII parameters (Rust tagged enum serialization)
export type MoodMkiiParameter =
  // Main knobs
  | { Time: number }
  | { Mix: number }
  | { Length: number }
  | { ModifyWet: number }
  | { Clock: number }
  | { ModifyLooper: number }
  | { RampSpeed: number }
  // Toggles
  | { WetChannelRouting: WetChannelRouting }
  | { Routing: MoodRouting }
  | { MicroLooper: MicroLooper }
  // Hidden knobs
  | { StereoWidth: number }
  | { RampingWaveform: number }
  | { Fade: number }
  | { Tone: number }
  | { LevelBalance: number }
  | { DirectMicroLoop: number }
  // Sync / spread
  | { Sync: MoodSync }
  | { Spread: MoodSpread }
  | { BufferLength: boolean }
  // Footswitches
  | { BypassLeft: boolean }
  | { BypassRight: boolean }
  | { HiddenMenu: boolean }
  | { Freeze: boolean }
  | { Overdub: boolean }
  // DIP switches - Left bank
  | { DipTime: boolean }
  | { DipModifyWet: boolean }
  | { DipClock: boolean }
  | { DipModifyLooper: boolean }
  | { DipLength: boolean }
  | { DipBounce: boolean }
  | { DipSweep: SweepDirection }
  | { DipPolarity: Polarity }
  // DIP switches - Right bank
  | { DipClassic: boolean }
  | { DipMiso: boolean }
  | { DipSpread: boolean }
  | { DipDryKill: boolean }
  | { DipTrails: boolean }
  | { DipLatch: boolean }
  | { DipNoDub: boolean }
  | { DipSmooth: boolean }
  // Advanced
  | { MidiClockIgnore: boolean }
  | { RampBounce: boolean }
  | { Expression: number }
  | { PresetSave: number };
