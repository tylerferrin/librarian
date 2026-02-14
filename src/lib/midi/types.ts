// Common MIDI types shared across all pedals

export interface DeviceInfo {
  name: string;
  pedal_type: 'Microcosm' | 'GenLossMkii';
  midi_channel: number;
}
