/**
 * MIDI Device Identity API
 * 
 * Uses MIDI Universal Device Inquiry (SysEx) to identify connected pedals
 * regardless of the MIDI interface name (e.g., WIDI Jack, USB MIDI, etc.)
 */

import { invoke } from '@tauri-apps/api/core';
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
 * Known manufacturer IDs mapped to pedal types
 * We'll discover these empirically by testing with real devices
 */
interface ManufacturerMapping {
  manufacturer_id: number[];
  device_family?: number;
  device_model?: number;
  pedal_type: PedalType;
}

// Known MIDI interfaces (not pedals - these respond to identity requests)
// Verified against official MMA table: https://midi.org/SysExIDtable
const KNOWN_INTERFACES = [
  {
    manufacturer_id: [0x00, 0x20, 0x63],  // Central Music Co. (CME) - WIDI Jack
    device_family: 0x22C8,
    device_model: 0x21C3,
    name: 'WIDI Jack',
    note: 'Bluetooth MIDI adapter - forwards SysEx with firmware v0225+'
  }
];

// Known pedals discovered through testing
// Verified against official MMA table: https://midi.org/SysExIDtable
const KNOWN_DEVICES: ManufacturerMapping[] = [
  // Hologram Electronics LLC pedals
  // NOTE: Both Chroma Console and Microcosm report IDENTICAL device identities!
  // Cannot distinguish between them via SysEx alone.
  // Family 0x048F, Model 0x0000 = Generic Hologram pedal
  // Use Device Profiles or CC fingerprinting to distinguish.
  {
    manufacturer_id: [0x00, 0x02, 0x4D],  // Hologram Electronics LLC  
    device_family: 0x048F,                 // 1167
    device_model: 0x0000,                  // Generic (both pedals report this)
    pedal_type: 'Microcosm'                // Default to Microcosm as it was first
  },
];

/**
 * Request device identity from a MIDI device using Universal Device Inquiry
 * 
 * @param deviceName - Name of the MIDI device to query
 * @param timeoutMs - Timeout in milliseconds (default: 2000)
 * @returns Device identity information or null if no response
 */
export async function requestDeviceIdentity(
  deviceName: string,
  timeoutMs: number = 2000
): Promise<DeviceIdentity | null> {
  try {
    console.log(`🔍 Requesting device identity from: ${deviceName}`);
    
    const identity = await invoke<DeviceIdentity | null>(
      'request_midi_device_identity',
      { deviceName, timeoutMs }
    );
    
    if (identity) {
      console.log('✅ Received device identity:', identity);
      console.log(`   Manufacturer: ${identity.manufacturer_name || 'Unknown'}`);
      console.log(`   ID: [${identity.manufacturer_id.map(b => `0x${b.toString(16).padStart(2, '0')}`).join(', ')}]`);
      console.log(`   Family: 0x${identity.device_family.toString(16).padStart(4, '0')}`);
      console.log(`   Model: 0x${identity.device_model.toString(16).padStart(4, '0')}`);
    } else {
      console.log('⏱️ No response from device (timeout or device does not support identity request)');
    }
    
    return identity;
  } catch (error) {
    console.error('❌ Error requesting device identity:', error);
    return null;
  }
}

/**
 * Check if the identity matches a known MIDI interface (not a pedal)
 * 
 * @param identity - Device identity information
 * @returns True if this is a known interface like WIDI Jack
 */
export function isKnownMidiInterface(identity: DeviceIdentity | null): boolean {
  if (!identity) return false;
  
  for (const iface of KNOWN_INTERFACES) {
    if (arraysEqual(iface.manufacturer_id, identity.manufacturer_id)) {
      if (iface.device_family !== undefined && iface.device_family !== identity.device_family) {
        continue;
      }
      if (iface.device_model !== undefined && iface.device_model !== identity.device_model) {
        continue;
      }
      console.log(`🔍 Detected known MIDI interface: ${iface.name}`);
      console.log(`   Note: ${iface.note}`);
      return true;
    }
  }
  
  return false;
}

/**
 * Detect pedal type from device identity
 * 
 * @param identity - Device identity information
 * @returns Detected pedal type or null if unknown
 * 
 * Note: Some manufacturers (like Hologram) use identical identities for multiple pedals.
 * In these cases, use Device Profiles or name-based detection.
 */
export function detectPedalTypeFromIdentity(identity: DeviceIdentity | null): PedalType | null {
  if (!identity) return null;
  
  // Check if this is a known MIDI interface (not a pedal)
  if (isKnownMidiInterface(identity)) {
    console.log('⚠️ This is a MIDI interface, not a pedal. Use Device Profiles to configure.');
    return null;
  }
  
  // Special case: Hologram Electronics LLC
  // Both Microcosm and Chroma Console report identical identities
  if (arraysEqual(identity.manufacturer_id, [0x00, 0x02, 0x4D]) &&
      identity.device_family === 0x048F &&
      identity.device_model === 0x0000) {
    console.log('⚠️ Detected Hologram pedal, but cannot distinguish between Microcosm and Chroma Console');
    console.log('   Both pedals report identical device identities');
    console.log('   Use Device Profiles or check device name for accurate detection');
    return null; // Return null to force manual selection or profile lookup
  }
  
  // Check against known device mappings
  for (const mapping of KNOWN_DEVICES) {
    // Check manufacturer ID match
    if (arraysEqual(mapping.manufacturer_id, identity.manufacturer_id)) {
      // If specific device family/model specified, check those too
      if (mapping.device_family !== undefined && mapping.device_family !== identity.device_family) {
        continue;
      }
      if (mapping.device_model !== undefined && mapping.device_model !== identity.device_model) {
        continue;
      }
      
      return mapping.pedal_type;
    }
  }
  
  return null;
}

/**
 * Enhanced device detection combining name-based and identity-based detection
 * 
 * @param deviceName - MIDI device name
 * @returns Detected pedal type or null
 */
export async function detectPedalTypeEnhanced(deviceName: string): Promise<PedalType | null> {
  // First try name-based detection (fast)
  const nameBasedDetection = detectFromName(deviceName);
  if (nameBasedDetection) {
    console.log(`✅ Detected pedal from name: ${nameBasedDetection}`);
    return nameBasedDetection;
  }
  
  // If name-based detection fails (e.g., generic MIDI interface like "WIDI Jack"),
  // try SysEx identity request (slower but more reliable)
  console.log('🔍 Name-based detection failed, trying SysEx identity request...');
  const identity = await requestDeviceIdentity(deviceName);
  const identityBasedDetection = detectPedalTypeFromIdentity(identity);
  
  if (identityBasedDetection) {
    console.log(`✅ Detected pedal from identity: ${identityBasedDetection}`);
  } else {
    console.log('⚠️ Could not detect pedal type from identity');
  }
  
  return identityBasedDetection;
}

/**
 * Simple name-based detection (existing logic)
 */
function detectFromName(deviceName: string): PedalType | null {
  const lowerName = deviceName.toLowerCase();
  
  if (lowerName.includes('microcosm')) {
    return 'Microcosm';
  }
  
  if (lowerName.includes('chroma') || 
      (lowerName.includes('console') && lowerName.includes('chase'))) {
    return 'ChromaConsole';
  }
  
  if (lowerName.includes('gen loss') || 
      lowerName.includes('generation loss') ||
      lowerName.includes('genloss')) {
    return 'GenLossMkii';
  }
  
  if (lowerName.includes('preamp') && (lowerName.includes('mk') || lowerName.includes('mkii') || lowerName.includes('mk2'))) {
    return 'PreampMk2';
  }
  
  return null;
}

/**
 * Helper to compare arrays
 */
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

/**
 * Add a discovered device mapping to the known devices list
 * This is useful during development/testing
 */
export function addKnownDevice(mapping: ManufacturerMapping): void {
  KNOWN_DEVICES.push(mapping);
  console.log('📝 Added known device mapping:', mapping);
}

/**
 * Get all known device mappings (for debugging)
 */
export function getKnownDevices(): ManufacturerMapping[] {
  return [...KNOWN_DEVICES];
}
