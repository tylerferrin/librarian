/**
 * Device Profile Management
 * 
 * Allows users to save mappings between MIDI interface names (e.g., "WIDI Jack")
 * and the actual pedals they're connected to. This is useful when the interface
 * doesn't pass through SysEx identity requests.
 */

import type { PedalType } from './types';

interface DeviceProfile {
  interfaceName: string;
  pedalType: PedalType;
  nickname?: string;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = 'librarian_device_profiles';

/**
 * Load all saved device profiles from localStorage
 */
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

/**
 * Save device profiles to localStorage
 */
function saveDeviceProfiles(profiles: DeviceProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to save device profiles:', error);
  }
}

/**
 * Get the saved pedal type for a device interface
 */
export function getPedalTypeForDevice(interfaceName: string): PedalType | null {
  const profiles = loadDeviceProfiles();
  const profile = profiles.find(p => p.interfaceName === interfaceName);
  return profile?.pedalType || null;
}

/**
 * Save a device profile mapping
 */
export function saveDeviceProfile(
  interfaceName: string,
  pedalType: PedalType,
  nickname?: string,
  notes?: string
): void {
  const profiles = loadDeviceProfiles();
  
  // Remove existing profile for this interface if any
  const filtered = profiles.filter(p => p.interfaceName !== interfaceName);
  
  // Add new profile
  filtered.push({
    interfaceName,
    pedalType,
    nickname,
    notes,
    createdAt: new Date().toISOString(),
  });
  
  saveDeviceProfiles(filtered);
  console.log(`✅ Saved device profile: ${interfaceName} → ${pedalType}`);
}

/**
 * Delete a device profile
 */
export function deleteDeviceProfile(interfaceName: string): void {
  const profiles = loadDeviceProfiles();
  const filtered = profiles.filter(p => p.interfaceName !== interfaceName);
  saveDeviceProfiles(filtered);
  console.log(`🗑️ Deleted device profile: ${interfaceName}`);
}

/**
 * Check if a device has a saved profile
 */
export function hasDeviceProfile(interfaceName: string): boolean {
  return getPedalTypeForDevice(interfaceName) !== null;
}

/**
 * Get the full profile for a device
 */
export function getDeviceProfile(interfaceName: string): DeviceProfile | null {
  const profiles = loadDeviceProfiles();
  return profiles.find(p => p.interfaceName === interfaceName) || null;
}

/**
 * Clear all device profiles (useful for debugging/reset)
 */
export function clearAllDeviceProfiles(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Cleared all device profiles');
}
