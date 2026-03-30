// Clean API - Tauri command wrappers
import { invoke } from '@tauri-apps/api/core';
import type { CleanParameter, CleanState } from './types';

/**
 * Connect to a Clean pedal
 */
export async function connectClean(
  deviceName: string,
  midiChannel: number = 2
): Promise<void> {
  return invoke('connect_clean', { deviceName, midiChannel });
}

/**
 * Send a parameter change to the Clean
 */
export async function sendCleanParameter(
  deviceName: string,
  parameter: CleanParameter
): Promise<void> {
  return invoke('send_clean_parameter', { deviceName, param: parameter });
}

/**
 * Get current state of the Clean
 */
export async function getCleanState(deviceName: string): Promise<CleanState> {
  return invoke('get_clean_state', { deviceName });
}

/**
 * Recall a preset on the Clean (sends all parameters)
 */
export async function recallCleanPreset(
  deviceName: string,
  state: CleanState
): Promise<void> {
  return invoke('recall_clean_preset', { deviceName, state });
}

/**
 * Save current state to a Clean preset slot (1-122)
 */
export async function saveCleanPreset(
  deviceName: string,
  slot: number
): Promise<void> {
  return invoke('save_clean_preset', { deviceName, slot });
}
