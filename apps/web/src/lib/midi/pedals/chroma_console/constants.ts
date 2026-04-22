// Chroma Console module metadata and constants

import type { 
  CharacterModule, 
  MovementModule, 
  DiffusionModule, 
  TextureModule,
  FilterMode,
  CalibrationLevel,
  GestureMode,
  CaptureMode,
  CaptureRouting
} from './types';

/** Module option metadata for UI rendering */
export interface ModuleOption<T> {
  id: T;
  name: string;
  color?: string;
}

/** Character module options */
export const CHARACTER_MODULES: ModuleOption<CharacterModule>[] = [
  { id: 'Drive', name: 'Drive', color: '#ef4444' },
  { id: 'Sweeten', name: 'Sweeten', color: '#f97316' },
  { id: 'Fuzz', name: 'Fuzz', color: '#eab308' },
  { id: 'Howl', name: 'Howl', color: '#84cc16' },
  { id: 'Swell', name: 'Swell', color: '#22c55e' },
  { id: 'Off', name: 'Off', color: '#6b7280' },
];

/** Movement module options */
export const MOVEMENT_MODULES: ModuleOption<MovementModule>[] = [
  { id: 'Doubler', name: 'Doubler', color: '#06b6d4' },
  { id: 'Vibrato', name: 'Vibrato', color: '#3b82f6' },
  { id: 'Phaser', name: 'Phaser', color: '#6366f1' },
  { id: 'Tremolo', name: 'Tremolo', color: '#8b5cf6' },
  { id: 'Pitch', name: 'Pitch', color: '#a855f7' },
  { id: 'Off', name: 'Off', color: '#6b7280' },
];

/** Diffusion module options */
export const DIFFUSION_MODULES: ModuleOption<DiffusionModule>[] = [
  { id: 'Cascade', name: 'Cascade', color: '#ec4899' },
  { id: 'Reels', name: 'Reels', color: '#f43f5e' },
  { id: 'Space', name: 'Space', color: '#14b8a6' },
  { id: 'Collage', name: 'Collage', color: '#10b981' },
  { id: 'Reverse', name: 'Reverse', color: '#059669' },
  { id: 'Off', name: 'Off', color: '#6b7280' },
];

/** Texture module options */
export const TEXTURE_MODULES: ModuleOption<TextureModule>[] = [
  { id: 'Filter', name: 'Filter', color: '#d946ef' },
  { id: 'Squash', name: 'Squash', color: '#c026d3' },
  { id: 'Cassette', name: 'Cassette', color: '#a21caf' },
  { id: 'Broken', name: 'Broken', color: '#86198f' },
  { id: 'Interference', name: 'Interference', color: '#701a75' },
  { id: 'Off', name: 'Off', color: '#6b7280' },
];

/** Filter mode options */
export const FILTER_MODES: ModuleOption<FilterMode>[] = [
  { id: 'Lpf', name: 'LPF' },
  { id: 'Tilt', name: 'Tilt' },
  { id: 'Hpf', name: 'HPF' },
];

/** Calibration level options */
export const CALIBRATION_LEVELS: ModuleOption<CalibrationLevel>[] = [
  { id: 'Low', name: 'Low' },
  { id: 'Medium', name: 'Medium' },
  { id: 'High', name: 'High' },
  { id: 'VeryHigh', name: 'Very High' },
];

/** Gesture mode options */
export const GESTURE_MODES: ModuleOption<GestureMode>[] = [
  { id: 'Play', name: 'Play' },
  { id: 'Record', name: 'Record' },
];

/** Capture mode options */
export const CAPTURE_MODES: ModuleOption<CaptureMode>[] = [
  { id: 'Stop', name: 'Stop/Clear' },
  { id: 'Play', name: 'Play' },
  { id: 'Record', name: 'Record' },
];

/** Capture routing options */
export const CAPTURE_ROUTING_OPTIONS: ModuleOption<CaptureRouting>[] = [
  { id: 'PostFx', name: 'Post-FX' },
  { id: 'PreFx', name: 'Pre-FX' },
];

/** Preset banks */
export const PRESET_BANKS = ['A', 'B', 'C', 'D'] as const;

/** Number of presets per bank */
export const PRESETS_PER_BANK = 20;

/** Total number of presets */
export const TOTAL_PRESETS = 80;

/**
 * Get preset bank and number from program change (0-79)
 */
export function getPresetInfo(program: number): { bank: string; number: number } {
  const bankIndex = Math.floor(program / PRESETS_PER_BANK);
  const presetNumber = (program % PRESETS_PER_BANK) + 1;
  return {
    bank: PRESET_BANKS[bankIndex],
    number: presetNumber,
  };
}

/**
 * Get program change from bank and preset number
 */
export function getProgramChange(bank: string, presetNumber: number): number {
  const bankIndex = PRESET_BANKS.indexOf(bank as any);
  return bankIndex * PRESETS_PER_BANK + (presetNumber - 1);
}
