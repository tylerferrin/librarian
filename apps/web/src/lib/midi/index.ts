import { midiAccess } from './midiAccess';
import { connectionRegistry } from './connectionRegistry';
import type { DeviceInfo, PedalType } from './types';

export async function listMidiDevices(): Promise<string[]> {
  return midiAccess.listOutputNames();
}

export async function disconnectDevice(deviceName: string): Promise<void> {
  connectionRegistry.delete(deviceName);
}

export async function listConnectedDevices(): Promise<DeviceInfo[]> {
  return connectionRegistry.all();
}

export async function isDeviceConnected(deviceName: string): Promise<boolean> {
  return connectionRegistry.has(deviceName);
}

export type { DeviceInfo, PedalType };
