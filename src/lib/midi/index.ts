// Common MIDI API - device connection and management
// This file provides type-safe access to the Rust MIDI backend

import { invoke } from '@tauri-apps/api/core';
import type { DeviceInfo } from './types';

// ============================================================================
// Common MIDI Manager API
// ============================================================================

/**
 * List all available MIDI devices
 */
export async function listMidiDevices(): Promise<string[]> {
  return invoke('list_midi_devices');
}

/**
 * Disconnect from a device
 */
export async function disconnectDevice(deviceName: string): Promise<void> {
  return invoke('disconnect_device', { deviceName });
}

/**
 * List all currently connected devices
 */
export async function listConnectedDevices(): Promise<DeviceInfo[]> {
  return invoke('list_connected_devices');
}

/**
 * Check if a device is currently connected
 */
export async function isDeviceConnected(deviceName: string): Promise<boolean> {
  return invoke('is_device_connected', { deviceName });
}

// ============================================================================
// Re-export types
// ============================================================================

export type { DeviceInfo };
