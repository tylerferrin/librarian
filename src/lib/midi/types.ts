// Common MIDI types shared across all pedals

export type PedalType = 'Microcosm' | 'GenLossMkii' | 'ChromaConsole' | 'PreampMk2' | 'Cxm1978';

export interface DeviceInfo {
  name: string;
  pedal_type: PedalType;
  midi_channel: number;
}
