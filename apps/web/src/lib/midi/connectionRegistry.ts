// In-memory registry of active MIDI device connections.
// Replaces the Rust MIDI manager's per-device state for the web layer.
// All per-pedal api.ts files read from this to resolve MIDIOutput + channel synchronously.

import type { DeviceInfo, PedalType } from './types';

export interface ConnectionEntry {
  output: MIDIOutput;
  channel: number;
  pedalType: PedalType;
}

const registry = new Map<string, ConnectionEntry>();

export const connectionRegistry = {
  set(deviceName: string, entry: ConnectionEntry): void {
    registry.set(deviceName, entry);
  },

  get(deviceName: string): ConnectionEntry | undefined {
    return registry.get(deviceName);
  },

  delete(deviceName: string): void {
    registry.delete(deviceName);
  },

  all(): DeviceInfo[] {
    return Array.from(registry.entries()).map(([name, { channel, pedalType }]) => ({
      name,
      pedal_type: pedalType,
      midi_channel: channel,
    }));
  },

  has(deviceName: string): boolean {
    return registry.has(deviceName);
  },
};
