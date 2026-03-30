// Billy Strings Wombtone types — mirrors tauri/src/midi/pedals/billy_strings_wombtone/types.rs

export interface BillyStringsWombtoneState {
  feed: number;
  volume: number;
  mix: number;
  rate: number;
  depth: number;
  form: number;
  ramp_speed: number;
  note_division: number; // raw 0-5
  bypass: boolean;
  tap: boolean;
  midi_clock_ignore: boolean;
  expression: number;
}

// All possible Billy Strings Wombtone parameters (Rust tagged enum serialization)
export type BillyStringsWombtoneParameter =
  | { Feed: number }
  | { Volume: number }
  | { Mix: number }
  | { Rate: number }
  | { Depth: number }
  | { Form: number }
  | { RampSpeed: number }
  | { NoteDivision: number }
  | { Bypass: boolean }
  | { Tap: boolean }
  | { MidiClockIgnore: boolean }
  | { Expression: number }
  | { PresetSave: number };

export const NOTE_DIVISION_LABELS: Record<number, string> = {
  0: 'Whole',
  1: 'Half',
  2: 'Quarter Triplet',
  3: 'Quarter',
  4: 'Eighth',
  5: 'Sixteenth',
};
