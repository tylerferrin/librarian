// Chroma Console helper functions

import type { ChromaConsoleState } from './types';

/**
 * Get a human-readable label for a parameter value (0-127)
 */
export function getParameterLabel(value: number): string {
  return Math.round((value / 127) * 100) + '%';
}

/**
 * Convert a percentage (0-100) to MIDI value (0-127)
 */
export function percentageToMidi(percentage: number): number {
  return Math.round((percentage / 100) * 127);
}

/**
 * Convert a MIDI value (0-127) to percentage (0-100)
 */
export function midiToPercentage(value: number): number {
  return Math.round((value / 127) * 100);
}

/**
 * Create a default Chroma Console state
 */
export function createDefaultState(): ChromaConsoleState {
  return {
    // Primary controls
    tilt: 64,
    rate: 64,
    time: 64,
    mix: 64,
    amount_character: 64,
    amount_movement: 64,
    amount_diffusion: 64,
    amount_texture: 64,
    
    // Secondary controls
    sensitivity: 64,
    drift_movement: 64,
    drift_diffusion: 64,
    output_level: 100,
    effect_vol_character: 100,
    effect_vol_movement: 100,
    effect_vol_diffusion: 100,
    effect_vol_texture: 100,
    
    // Module selections
    character_module: 'Off',
    movement_module: 'Off',
    diffusion_module: 'Off',
    texture_module: 'Off',
    
    // Bypass controls
    bypass_state: 'Bypass',
    character_bypass: false,
    movement_bypass: false,
    diffusion_bypass: false,
    texture_bypass: false,
    
    // Other functions
    gesture_mode: 'Play',
    capture_mode: 'Stop',
    capture_routing: 'PostFx',
    filter_mode: 'Lpf',
    calibration_level: 'Medium',
  };
}

/**
 * Deep clone a Chroma Console state
 */
export function cloneState(state: ChromaConsoleState): ChromaConsoleState {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Compare two states for equality
 */
export function statesEqual(a: ChromaConsoleState, b: ChromaConsoleState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
