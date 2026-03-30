// Chroma Console-specific API calls to the Rust backend

import { invoke } from '@tauri-apps/api/core';
import type { ChromaConsoleState, ChromaConsoleParameter } from './types';

/**
 * Connect to a Hologram Chroma Console pedal
 */
export async function connectChromaConsole(
  deviceName: string,
  midiChannel: number = 1
): Promise<void> {
  return invoke('connect_chroma_console', { deviceName, midiChannel });
}

/**
 * Send a parameter change to a Chroma Console
 */
export async function sendChromaConsoleParameter(
  deviceName: string,
  param: ChromaConsoleParameter
): Promise<void> {
  return invoke('send_chroma_console_parameter', { deviceName, param });
}

/**
 * Send a program change to a Chroma Console (select preset 0-79)
 */
export async function sendChromaConsoleProgramChange(
  deviceName: string,
  program: number
): Promise<void> {
  return invoke('send_chroma_console_program_change', { deviceName, program });
}

/**
 * Get the current state of a Chroma Console
 */
export async function getChromaConsoleState(deviceName: string): Promise<ChromaConsoleState> {
  return invoke('get_chroma_console_state', { deviceName });
}

/**
 * Recall a preset on a Chroma Console (sends all parameters)
 */
export async function recallChromaConsolePreset(
  deviceName: string,
  state: ChromaConsoleState
): Promise<void> {
  return invoke('recall_chroma_console_preset', { deviceName, state });
}
