// TypeScript types for preset management
import { MicrocosmState } from '../midi/pedals/microcosm/types';

export interface Preset {
  id: string;
  name: string;
  pedalType: string;
  description?: string;
  parameters: MicrocosmState | any; // Can be any pedal state
  tags: string[];
  isFavorite: boolean;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export interface BankSlot {
  bankNumber: number; // 45-60 for Microcosm
  bankLabel: string; // "Bank 1A", "Bank 2C", etc.
  color: string; // "red", "yellow", "green", "blue"
  preset?: Preset; // null if empty
  syncedAt?: number; // Unix timestamp when last synced
}

export interface PresetFilter {
  pedalType?: string;
  tags?: string[];
  isFavorite?: boolean;
  searchQuery?: string;
}

export interface SavePresetParams {
  name: string;
  pedalType: string;
  description?: string;
  parameters: MicrocosmState | any;
  tags: string[];
}

export interface UpdatePresetParams {
  id: string;
  name?: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  parameters?: any; // Updated pedal state
}

/**
 * Preset with bank assignment information.
 * Used by the library drawer to show which banks a preset is loaded into.
 */
export interface PresetWithBanks extends Preset {
  bankNumbers: number[]; // Bank slots this preset is assigned to (45-60)
}
