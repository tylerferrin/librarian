// The unique PascalCase identifier for each supported pedal
export type PedalName =
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

// Known manufacturers — camelCase identifiers (display names live in definition.ts)
export type PedalManufacturer =
  | 'chaseBlissAudio'
  | 'meris'
  | 'hologramElectronics';

// Array to support collaborative pedals (e.g. CXM 1978 = Chase Bliss + Meris)
export interface DeviceInfo {
  name: string;
  pedalName: PedalName;
  manufacturer: PedalManufacturer[];
  type: string | null; // future: effect category (delay, reverb, etc.)
  midi_channel: number;
}
