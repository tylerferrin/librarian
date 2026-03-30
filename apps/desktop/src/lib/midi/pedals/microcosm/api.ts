// Microcosm-specific API calls to the Rust backend

import { invoke } from '@tauri-apps/api/core';
import type { MicrocosmState, MicrocosmParameter } from './types';

/**
 * Connect to a Hologram Microcosm pedal
 */
export async function connectMicrocosm(
  deviceName: string,
  midiChannel: number = 1
): Promise<void> {
  return invoke('connect_microcosm', { deviceName, midiChannel });
}

/**
 * Send a parameter change to a Microcosm
 */
export async function sendMicrocosmParameter(
  deviceName: string,
  param: MicrocosmParameter
): Promise<void> {
  return invoke('send_microcosm_parameter', { deviceName, param });
}

/**
 * Send a program change to a Microcosm (select effect/preset)
 */
export async function sendMicrocosmProgramChange(
  deviceName: string,
  program: number
): Promise<void> {
  return invoke('send_microcosm_program_change', { deviceName, program });
}

/**
 * Get the current state of a Microcosm
 */
export async function getMicrocosmState(deviceName: string): Promise<MicrocosmState> {
  return invoke('get_microcosm_state', { deviceName });
}

/**
 * Recall a preset on a Microcosm (sends all parameters)
 */
export async function recallMicrocosmPreset(
  deviceName: string,
  state: MicrocosmState
): Promise<void> {
  return invoke('recall_microcosm_preset', { deviceName, state });
}
