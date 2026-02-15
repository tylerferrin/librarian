// Common MIDI types shared across all pedals

export type PedalType = 'Microcosm' | 'GenLossMkii' | 'ChromaConsole';

export interface DeviceInfo {
  name: string;
  pedal_type: PedalType;
  midi_channel: number;
}
