// Mood MkII API - Tauri command wrappers
import { invoke } from '@tauri-apps/api/core';
import type { MoodMkiiParameter, MoodMkiiState } from './types';

export async function connectMoodMkii(
  deviceName: string,
  midiChannel: number = 2
): Promise<void> {
  return invoke('connect_mood_mkii', { deviceName, midiChannel });
}

export async function sendMoodMkiiParameter(
  deviceName: string,
  parameter: MoodMkiiParameter
): Promise<void> {
  return invoke('send_mood_mkii_parameter', { deviceName, param: parameter });
}

export async function getMoodMkiiState(deviceName: string): Promise<MoodMkiiState> {
  return invoke('get_mood_mkii_state', { deviceName });
}

export async function recallMoodMkiiPreset(
  deviceName: string,
  state: MoodMkiiState
): Promise<void> {
  return invoke('recall_mood_mkii_preset', { deviceName, state });
}

export async function saveMoodMkiiPreset(
  deviceName: string,
  slot: number
): Promise<void> {
  return invoke('save_mood_mkii_preset', { deviceName, slot });
}
