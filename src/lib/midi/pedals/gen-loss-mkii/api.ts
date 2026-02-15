// Gen Loss MKII API - Tauri command wrappers
import { invoke } from '@tauri-apps/api/core';
import type { GenLossMkiiParameter, GenLossMkiiState } from './types';

/**
 * Connect to a Gen Loss MKII pedal
 */
export async function connectGenLossMkii(
  deviceName: string,
  midiChannel: number = 1
): Promise<void> {
  return invoke('connect_gen_loss_mkii', { deviceName, midiChannel });
}

/**
 * Send a parameter change to the Gen Loss MKII
 */
export async function sendGenLossParameter(
  deviceName: string,
  parameter: GenLossMkiiParameter
): Promise<void> {
  return invoke('send_gen_loss_parameter', { deviceName, parameter });
}

/**
 * Get current state of the Gen Loss MKII
 */
export async function getGenLossState(deviceName: string): Promise<GenLossMkiiState> {
  return invoke('get_gen_loss_state', { deviceName });
}

/**
 * Recall a preset on the Gen Loss MKII
 */
export async function recallGenLossPreset(
  deviceName: string,
  preset: GenLossMkiiState
): Promise<void> {
  return invoke('recall_gen_loss_preset', { deviceName, preset });
}
