// Preset management API - wrappers for Tauri commands
import { invoke } from '@tauri-apps/api/core';
import type { Preset, BankSlot, PresetFilter, SavePresetParams, UpdatePresetParams } from './types';

/**
 * Save a new preset to the library
 */
export async function savePreset(params: SavePresetParams): Promise<Preset> {
  return invoke<Preset>('save_preset', {
    name: params.name,
    pedalType: params.pedalType,
    description: params.description,
    parameters: params.parameters,
    tags: params.tags,
  });
}

/**
 * Update an existing preset
 */
export async function updatePreset(params: UpdatePresetParams): Promise<Preset> {
  return invoke<Preset>('update_preset', {
    id: params.id,
    name: params.name,
    description: params.description,
    tags: params.tags,
    isFavorite: params.isFavorite,
  });
}

/**
 * Get a preset by ID
 */
export async function getPreset(id: string): Promise<Preset> {
  return invoke<Preset>('get_preset', { id });
}

/**
 * List presets with optional filtering
 */
export async function listPresets(filter?: PresetFilter): Promise<Preset[]> {
  return invoke<Preset[]>('list_presets', {
    pedalType: filter?.pedalType,
    tags: filter?.tags,
    isFavorite: filter?.isFavorite,
    searchQuery: filter?.searchQuery,
  });
}

/**
 * Delete a preset from the library
 */
export async function deletePreset(id: string): Promise<void> {
  return invoke<void>('delete_preset', { id });
}

/**
 * Toggle favorite status of a preset
 */
export async function toggleFavorite(id: string): Promise<Preset> {
  return invoke<Preset>('toggle_favorite', { id });
}

/**
 * Get the state of all pedal banks for a specific pedal type
 */
export async function getBankState(pedalType: string): Promise<BankSlot[]> {
  return invoke<BankSlot[]>('get_bank_state', { pedalType });
}

/**
 * Assign a preset to a specific bank (tracking only, doesn't send to pedal)
 */
export async function assignToBank(
  pedalType: string,
  bankNumber: number,
  presetId: string
): Promise<void> {
  return invoke<void>('assign_to_bank', {
    pedalType,
    bankNumber,
    presetId,
  });
}

/**
 * Save a preset to a specific pedal bank
 * This will:
 * 1. Send program change to switch to the bank
 * 2. Send all preset parameters
 * 3. Send CC 46 to save to the pedal
 * 4. Update the bank assignment in the database
 */
export async function savePresetToBank(
  deviceName: string,
  presetId: string,
  bankNumber: number
): Promise<void> {
  return invoke<void>('save_preset_to_bank', {
    deviceName,
    presetId,
    bankNumber,
  });
}
