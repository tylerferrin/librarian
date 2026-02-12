// TypeScript bindings for Tauri MIDI commands
// This file provides type-safe access to the Rust MIDI backend

import { invoke } from '@tauri-apps/api/core';

// ============================================================================
// Types (matching Rust definitions)
// ============================================================================

export interface DeviceInfo {
  name: string;
  pedal_type: 'Microcosm' | 'GenLossMkii';
  midi_channel: number;
}

// Microcosm Types
export type SubdivisionValue = 
  | 'QuarterNote' 
  | 'HalfNote' 
  | 'Tap' 
  | 'Double' 
  | 'Quadruple' 
  | 'Octuple';

export type WaveformShape = 'Square' | 'Ramp' | 'Triangle' | 'Saw';

export type ReverbMode = 'BrightRoom' | 'DarkMedium' | 'LargeHall' | 'Ambient';

export type PlaybackDirection = 'Forward' | 'Reverse';

export type LooperRouting = 'PostFX' | 'PreFX';

export interface MicrocosmState {
  // Time controls
  subdivision: SubdivisionValue;
  time: number;
  hold_sampler: boolean;
  
  // Special Sauce
  activity: number;
  repeats: number;
  
  // Modulation
  shape: WaveformShape;
  frequency: number;
  depth: number;
  
  // Filter
  cutoff: number;
  resonance: number;
  
  // Effect
  mix: number;
  volume: number;
  bypass: boolean;
  
  // Reverb
  space: number;
  reverb_mode: ReverbMode;
  
  // Looper
  loop_level: number;
  looper_speed: number;
  looper_speed_stepped: SubdivisionValue;
  fade_time: number;
  looper_enabled: boolean;
  playback_direction: PlaybackDirection;
  routing: LooperRouting;
  looper_only: boolean;
  burst_mode: boolean;
  quantized: boolean;
}

// Microcosm Parameter (union type matching Rust enum)
export type MicrocosmParameter =
  | { Subdivision: SubdivisionValue }
  | { Time: number }
  | { HoldSampler: boolean }
  | 'TapTempo'
  | { Activity: number }
  | { Repeats: number }
  | { Shape: WaveformShape }
  | { Frequency: number }
  | { Depth: number }
  | { Cutoff: number }
  | { Resonance: number }
  | { Mix: number }
  | { Volume: number }
  | 'ReverseEffect'
  | { Bypass: boolean }
  | { Space: number }
  | { ReverbMode: ReverbMode }
  | { LoopLevel: number }
  | { LooperSpeed: number }
  | { LooperSpeedStepped: SubdivisionValue }
  | { FadeTime: number }
  | { LooperEnabled: boolean }
  | { PlaybackDirection: PlaybackDirection }
  | { Routing: LooperRouting }
  | { LooperOnly: boolean }
  | { BurstMode: boolean }
  | { Quantized: boolean }
  | 'LooperRecord'
  | 'LooperPlay'
  | 'LooperOverdub'
  | 'LooperStop'
  | 'LooperErase'
  | 'LooperUndo'
  | 'PresetCopy'
  | 'PresetSave';

// Gen Loss MKII Types (simplified for now - can be expanded)
export interface GenLossMkiiState {
  // Add Gen Loss types when needed
  [key: string]: any;
}

export type GenLossMkiiParameter = any; // Expand when needed

// ============================================================================
// MIDI Manager API
// ============================================================================

/**
 * List all available MIDI devices
 */
export async function listMidiDevices(): Promise<string[]> {
  return invoke('list_midi_devices');
}

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
 * Connect to a Chase Bliss Gen Loss MKII pedal
 */
export async function connectGenLossMkii(
  deviceName: string,
  midiChannel: number = 1
): Promise<void> {
  return invoke('connect_gen_loss_mkii', { deviceName, midiChannel });
}

/**
 * Disconnect from a device
 */
export async function disconnectDevice(deviceName: string): Promise<void> {
  return invoke('disconnect_device', { deviceName });
}

/**
 * List all currently connected devices
 */
export async function listConnectedDevices(): Promise<DeviceInfo[]> {
  return invoke('list_connected_devices');
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
 * Send a parameter change to a Gen Loss MKII
 */
export async function sendGenLossParameter(
  deviceName: string,
  param: GenLossMkiiParameter
): Promise<void> {
  return invoke('send_gen_loss_parameter', { deviceName, param });
}

/**
 * Get the current state of a Microcosm
 */
export async function getMicrocosmState(deviceName: string): Promise<MicrocosmState> {
  return invoke('get_microcosm_state', { deviceName });
}

/**
 * Get the current state of a Gen Loss MKII
 */
export async function getGenLossState(deviceName: string): Promise<GenLossMkiiState> {
  return invoke('get_gen_loss_state', { deviceName });
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

/**
 * Recall a preset on a Gen Loss MKII (sends all parameters)
 */
export async function recallGenLossPreset(
  deviceName: string,
  state: GenLossMkiiState
): Promise<void> {
  return invoke('recall_gen_loss_preset', { deviceName, state });
}

/**
 * Check if a device is currently connected
 */
export async function isDeviceConnected(deviceName: string): Promise<boolean> {
  return invoke('is_device_connected', { deviceName });
}

// ============================================================================
// Helper functions for building parameters
// ============================================================================

export const MicrocosmParams = {
  // Time
  subdivision: (value: SubdivisionValue): MicrocosmParameter => ({ Subdivision: value }),
  time: (value: number): MicrocosmParameter => ({ Time: value }),
  holdSampler: (value: boolean): MicrocosmParameter => ({ HoldSampler: value }),
  tapTempo: (): MicrocosmParameter => 'TapTempo',
  
  // Special Sauce
  activity: (value: number): MicrocosmParameter => ({ Activity: value }),
  repeats: (value: number): MicrocosmParameter => ({ Repeats: value }),
  
  // Modulation
  shape: (value: WaveformShape): MicrocosmParameter => ({ Shape: value }),
  frequency: (value: number): MicrocosmParameter => ({ Frequency: value }),
  depth: (value: number): MicrocosmParameter => ({ Depth: value }),
  
  // Filter
  cutoff: (value: number): MicrocosmParameter => ({ Cutoff: value }),
  resonance: (value: number): MicrocosmParameter => ({ Resonance: value }),
  
  // Effect
  mix: (value: number): MicrocosmParameter => ({ Mix: value }),
  volume: (value: number): MicrocosmParameter => ({ Volume: value }),
  reverseEffect: (): MicrocosmParameter => 'ReverseEffect',
  bypass: (value: boolean): MicrocosmParameter => ({ Bypass: value }),
  
  // Reverb
  space: (value: number): MicrocosmParameter => ({ Space: value }),
  reverbMode: (value: ReverbMode): MicrocosmParameter => ({ ReverbMode: value }),
  
  // Looper
  loopLevel: (value: number): MicrocosmParameter => ({ LoopLevel: value }),
  looperSpeed: (value: number): MicrocosmParameter => ({ LooperSpeed: value }),
  looperSpeedStepped: (value: SubdivisionValue): MicrocosmParameter => ({ LooperSpeedStepped: value }),
  fadeTime: (value: number): MicrocosmParameter => ({ FadeTime: value }),
  looperEnabled: (value: boolean): MicrocosmParameter => ({ LooperEnabled: value }),
  playbackDirection: (value: PlaybackDirection): MicrocosmParameter => ({ PlaybackDirection: value }),
  routing: (value: LooperRouting): MicrocosmParameter => ({ Routing: value }),
  looperOnly: (value: boolean): MicrocosmParameter => ({ LooperOnly: value }),
  burstMode: (value: boolean): MicrocosmParameter => ({ BurstMode: value }),
  quantized: (value: boolean): MicrocosmParameter => ({ Quantized: value }),
  
  // Looper transport
  looperRecord: (): MicrocosmParameter => 'LooperRecord',
  looperPlay: (): MicrocosmParameter => 'LooperPlay',
  looperOverdub: (): MicrocosmParameter => 'LooperOverdub',
  looperStop: (): MicrocosmParameter => 'LooperStop',
  looperErase: (): MicrocosmParameter => 'LooperErase',
  looperUndo: (): MicrocosmParameter => 'LooperUndo',
  
  // Preset
  presetCopy: (): MicrocosmParameter => 'PresetCopy',
  presetSave: (): MicrocosmParameter => 'PresetSave',
};

// ============================================================================
// Usage Example
// ============================================================================

/*
// List available devices
const devices = await listMidiDevices();
console.log('Available MIDI devices:', devices);

// Connect to Microcosm
await connectMicrocosm('WIDI Jack', 1);

// Send parameter changes
await sendMicrocosmParameter('WIDI Jack', MicrocosmParams.activity(80));
await sendMicrocosmParameter('WIDI Jack', MicrocosmParams.bypass(false));
await sendMicrocosmParameter('WIDI Jack', MicrocosmParams.looperRecord());

// Get current state
const state = await getMicrocosmState('WIDI Jack');
console.log('Current activity:', state.activity);

// Recall a preset
await recallMicrocosmPreset('WIDI Jack', myPresetState);
*/
