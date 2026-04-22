// Common MIDI types — matches the desktop's type shapes for component compatibility

export type PedalType =
  | 'Microcosm'
  | 'GenLossMkii'
  | 'ChromaConsole'
  | 'PreampMk2'
  | 'Cxm1978'
  | 'Clean'
  | 'Onward'
  | 'BrothersAm'
  | 'ReverseModeC'
  | 'MoodMkii'
  | 'BillyStringsWombtone'
  | 'Lossy';

export interface DeviceInfo {
  name: string;
  pedal_type: PedalType;
  midi_channel: number;
}
