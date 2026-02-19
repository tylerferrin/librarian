// Chase Bliss / Meris CXM 1978 API calls to the Rust backend

import { invoke } from '@tauri-apps/api/core';
import type { Cxm1978State, Cxm1978Parameter } from './types';

/**
 * Connect to a Chase Bliss / Meris CXM 1978 pedal
 */
export async function connectCxm1978(
  deviceName: string,
  midiChannel: number = 2
): Promise<void> {
  return invoke('connect_cxm1978', { deviceName, midiChannel });
}

/**
 * Send a parameter change to a CXM 1978
 */
export async function sendCxm1978Parameter(
  deviceName: string,
  param: Cxm1978Parameter
): Promise<void> {
  return invoke('send_cxm1978_parameter', { deviceName, param });
}

/**
 * Get the current state of a CXM 1978
 */
export async function getCxm1978State(deviceName: string): Promise<Cxm1978State> {
  return invoke('get_cxm1978_state', { deviceName });
}

/**
 * Recall a preset on a CXM 1978 (sends all parameters)
 */
export async function recallCxm1978Preset(
  deviceName: string,
  state: Cxm1978State
): Promise<void> {
  return invoke('recall_cxm1978_preset', { deviceName, state });
}

/**
 * Send a Program Change to recall a preset on the CXM 1978 (PC 0-29)
 * Per the manual: "Presets 0-29 are recalled using program changes 0-29"
 */
export async function sendCxm1978ProgramChange(
  deviceName: string,
  program: number
): Promise<void> {
  return invoke('send_cxm1978_program_change', { deviceName, program });
}

/**
 * Save current state to a CXM 1978 preset slot (0-29)
 */
export async function saveCxm1978Preset(
  deviceName: string,
  slot: number
): Promise<void> {
  return invoke('save_cxm1978_preset', { deviceName, slot });
}
