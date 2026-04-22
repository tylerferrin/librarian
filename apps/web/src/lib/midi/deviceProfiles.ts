// Device Profile Management — localStorage-backed MIDI interface ↔ pedal mappings

import type { PedalType } from './types';

interface DeviceProfile {
  interfaceName: string;
  pedalType: PedalType;
  midiChannel?: number;
  nickname?: string;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = 'librarian_device_profiles';

export function loadDeviceProfiles(): DeviceProfile[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load device profiles:', error);
    return [];
  }
}

function saveDeviceProfiles(profiles: DeviceProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to save device profiles:', error);
  }
}

export function getPedalTypeForDevice(interfaceName: string): PedalType | null {
  const profiles = loadDeviceProfiles();
  const profile = profiles.find((p) => p.interfaceName === interfaceName);
  return profile?.pedalType || null;
}

export function getMidiChannelForDevice(interfaceName: string): number | null {
  const profiles = loadDeviceProfiles();
  const profile = profiles.find((p) => p.interfaceName === interfaceName);
  return profile?.midiChannel ?? null;
}

export function saveDeviceProfile(
  interfaceName: string,
  pedalType: PedalType,
  midiChannel?: number,
  nickname?: string,
  notes?: string
): void {
  const profiles = loadDeviceProfiles();
  const filtered = profiles.filter((p) => p.interfaceName !== interfaceName);
  filtered.push({
    interfaceName,
    pedalType,
    midiChannel,
    nickname,
    notes,
    createdAt: new Date().toISOString(),
  });
  saveDeviceProfiles(filtered);
}

export function deleteDeviceProfile(interfaceName: string): void {
  const profiles = loadDeviceProfiles();
  saveDeviceProfiles(profiles.filter((p) => p.interfaceName !== interfaceName));
}

export function hasDeviceProfile(interfaceName: string): boolean {
  return getPedalTypeForDevice(interfaceName) !== null;
}

export function getDeviceProfile(interfaceName: string): DeviceProfile | null {
  const profiles = loadDeviceProfiles();
  return profiles.find((p) => p.interfaceName === interfaceName) || null;
}

export function clearAllDeviceProfiles(): void {
  localStorage.removeItem(STORAGE_KEY);
}
