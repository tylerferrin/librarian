// Lossy API - Tauri command wrappers
import { invoke } from '@tauri-apps/api/core';
import type { LossyParameter, LossyState } from './types';

export async function connectLossy(
  deviceName: string,
  midiChannel: number = 2
): Promise<void> {
  return invoke('connect_lossy', { deviceName, midiChannel });
}

export async function sendLossyParameter(
  deviceName: string,
  parameter: LossyParameter
): Promise<void> {
  return invoke('send_lossy_parameter', { deviceName, param: parameter });
}

export async function getLossyState(deviceName: string): Promise<LossyState> {
  return invoke('get_lossy_state', { deviceName });
}

export async function recallLossyPreset(
  deviceName: string,
  state: LossyState
): Promise<void> {
  return invoke('recall_lossy_preset', { deviceName, state });
}

export async function saveLossyPreset(
  deviceName: string,
  slot: number
): Promise<void> {
  return invoke('save_lossy_preset', { deviceName, slot });
}
