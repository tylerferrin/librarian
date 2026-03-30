// Brothers AM API - Tauri command wrappers
import { invoke } from '@tauri-apps/api/core';
import type { BrothersAmParameter, BrothersAmState } from './types';

/**
 * Connect to a Brothers AM pedal
 */
export async function connectBrothersAm(
  deviceName: string,
  midiChannel: number = 2
): Promise<void> {
  return invoke('connect_brothers_am', { deviceName, midiChannel });
}

/**
 * Send a parameter change to the Brothers AM
 */
export async function sendBrothersAmParameter(
  deviceName: string,
  parameter: BrothersAmParameter
): Promise<void> {
  return invoke('send_brothers_am_parameter', { deviceName, param: parameter });
}

/**
 * Get current state of the Brothers AM
 */
export async function getBrothersAmState(deviceName: string): Promise<BrothersAmState> {
  return invoke('get_brothers_am_state', { deviceName });
}

/**
 * Recall a preset on the Brothers AM (sends all parameters)
 */
export async function recallBrothersAmPreset(
  deviceName: string,
  state: BrothersAmState
): Promise<void> {
  return invoke('recall_brothers_am_preset', { deviceName, state });
}

/**
 * Save current state to a Brothers AM preset slot (1-122)
 */
export async function saveBrothersAmPreset(
  deviceName: string,
  slot: number
): Promise<void> {
  return invoke('save_brothers_am_preset', { deviceName, slot });
}
