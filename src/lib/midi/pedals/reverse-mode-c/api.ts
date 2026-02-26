// Reverse Mode C API - Tauri command wrappers
import { invoke } from '@tauri-apps/api/core';
import type { ReverseModeCParameter, ReverseModeCState } from './types';

/**
 * Connect to a Reverse Mode C pedal
 */
export async function connectReverseModeC(
  deviceName: string,
  midiChannel: number = 2
): Promise<void> {
  return invoke('connect_reverse_mode_c', { deviceName, midiChannel });
}

/**
 * Send a parameter change to the Reverse Mode C
 */
export async function sendReverseModeCParameter(
  deviceName: string,
  parameter: ReverseModeCParameter
): Promise<void> {
  return invoke('send_reverse_mode_c_parameter', { deviceName, param: parameter });
}

/**
 * Get current state of the Reverse Mode C
 */
export async function getReverseModeCState(deviceName: string): Promise<ReverseModeCState> {
  return invoke('get_reverse_mode_c_state', { deviceName });
}

/**
 * Recall a preset on the Reverse Mode C (sends all parameters)
 */
export async function recallReverseModeCPreset(
  deviceName: string,
  state: ReverseModeCState
): Promise<void> {
  return invoke('recall_reverse_mode_c_preset', { deviceName, state });
}

/**
 * Save current state to a Reverse Mode C preset slot (1-122)
 */
export async function saveReverseModeCPreset(
  deviceName: string,
  slot: number
): Promise<void> {
  return invoke('save_reverse_mode_c_preset', { deviceName, slot });
}
