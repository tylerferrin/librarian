// Device Identity — stub for the web app
// In Phase 5, requestDeviceIdentity will use the Web MIDI API SysEx.

import type { PedalType } from './types';

export interface DeviceIdentity {
  manufacturer_id: number[];
  manufacturer_name: string | null;
  device_family: number;
  device_model: number;
  software_version: number[];
  description: string;
}

/**
 * Stub — Phase 5 will implement this using navigator.requestMIDIAccess() SysEx.
 */
export async function requestDeviceIdentity(
  _deviceName: string,
  _timeoutMs: number = 2000
): Promise<DeviceIdentity | null> {
  console.warn('[MIDI stub] requestDeviceIdentity — Phase 5 not yet implemented');
  return null;
}

export function isKnownMidiInterface(_identity: DeviceIdentity | null): boolean {
  return false;
}

export function detectPedalTypeFromIdentity(_identity: DeviceIdentity | null): PedalType | null {
  return null;
}

export async function detectPedalTypeEnhanced(_deviceName: string): Promise<PedalType | null> {
  return null;
}

export function addKnownDevice(_mapping: unknown): void {
  // no-op stub
}

export function getKnownDevices(): unknown[] {
  return [];
}
