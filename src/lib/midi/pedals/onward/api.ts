// Onward API - Tauri command wrappers
import { invoke } from '@tauri-apps/api/core';
import type { OnwardParameter, OnwardState } from './types';

/**
 * Connect to an Onward pedal
 */
export async function connectOnward(
  deviceName: string,
  midiChannel: number = 2
): Promise<void> {
  return invoke('connect_onward', { deviceName, midiChannel });
}

/**
 * Send a parameter change to the Onward
 */
export async function sendOnwardParameter(
  deviceName: string,
  parameter: OnwardParameter
): Promise<void> {
  return invoke('send_onward_parameter', { deviceName, param: parameter });
}

/**
 * Get current state of the Onward
 */
export async function getOnwardState(deviceName: string): Promise<OnwardState> {
  return invoke('get_onward_state', { deviceName });
}

/**
 * Recall a preset on the Onward (sends all parameters)
 */
export async function recallOnwardPreset(
  deviceName: string,
  state: OnwardState
): Promise<void> {
  return invoke('recall_onward_preset', { deviceName, state });
}

/**
 * Save current state to an Onward preset slot (1-122)
 */
export async function saveOnwardPreset(
  deviceName: string,
  slot: number
): Promise<void> {
  return invoke('save_onward_preset', { deviceName, slot });
}
