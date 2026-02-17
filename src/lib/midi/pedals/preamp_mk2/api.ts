// Chase Bliss Preamp MK II API calls to the Rust backend

import { invoke } from '@tauri-apps/api/core';
import type { PreampMk2State, PreampMk2Parameter } from './types';

/**
 * Connect to a Chase Bliss Preamp MK II pedal
 */
export async function connectPreampMk2(
  deviceName: string,
  midiChannel: number = 2
): Promise<void> {
  return invoke('connect_preamp_mk2', { deviceName, midiChannel });
}

/**
 * Send a parameter change to a Preamp MK II
 */
export async function sendPreampMk2Parameter(
  deviceName: string,
  param: PreampMk2Parameter
): Promise<void> {
  return invoke('send_preamp_mk2_parameter', { deviceName, param });
}

/**
 * Get the current state of a Preamp MK II
 */
export async function getPreampMk2State(deviceName: string): Promise<PreampMk2State> {
  return invoke('get_preamp_mk2_state', { deviceName });
}

/**
 * Recall a preset on a Preamp MK II (sends all parameters)
 */
export async function recallPreampMk2Preset(
  deviceName: string,
  state: PreampMk2State
): Promise<void> {
  return invoke('recall_preamp_mk2_preset', { deviceName, state });
}

/**
 * Send a Program Change to recall a preset on the Preamp MK II (PC 0-29)
 * Per the manual: "Presets 0-29 are recalled using Program Changes 0-29"
 */
export async function sendPreampMk2ProgramChange(
  deviceName: string,
  program: number
): Promise<void> {
  return invoke('send_preamp_mk2_program_change', { deviceName, program });
}

/**
 * Save current state to a Preamp MK II preset slot (0-29)
 */
export async function savePreampMk2Preset(
  deviceName: string,
  slot: number
): Promise<void> {
  return invoke('save_preamp_mk2_preset', { deviceName, slot });
}
