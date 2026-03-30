// Billy Strings Wombtone API - Tauri command wrappers
import { invoke } from '@tauri-apps/api/core';
import type { BillyStringsWombtoneParameter, BillyStringsWombtoneState } from './types';

export async function connectBillyStringsWombtone(
  deviceName: string,
  midiChannel: number = 2
): Promise<void> {
  return invoke('connect_billy_strings_wombtone', { deviceName, midiChannel });
}

export async function sendBillyStringsWombtoneParameter(
  deviceName: string,
  parameter: BillyStringsWombtoneParameter
): Promise<void> {
  return invoke('send_billy_strings_wombtone_parameter', { deviceName, param: parameter });
}

export async function getBillyStringsWombtoneState(deviceName: string): Promise<BillyStringsWombtoneState> {
  return invoke('get_billy_strings_wombtone_state', { deviceName });
}

export async function recallBillyStringsWombtonePreset(
  deviceName: string,
  state: BillyStringsWombtoneState
): Promise<void> {
  return invoke('recall_billy_strings_wombtone_preset', { deviceName, state });
}

export async function saveBillyStringsWombtonePreset(
  deviceName: string,
  slot: number
): Promise<void> {
  return invoke('save_billy_strings_wombtone_preset', { deviceName, slot });
}
