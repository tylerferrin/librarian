// Preset types for the web app — matches the desktop's type shapes for component compatibility

export type MidiSaveCapability =
  | { type: 'supported'; ccNumber: number; description: string }
  | { type: 'manualOnly'; instructions: string }
  | { type: 'autoSave' };

export interface BankConfig {
  programChangeStart: number;
  programChangeEnd: number;
  numBanks: number;
  slotsPerBank: number;
  bankLabels: string[];
  bankColors: string[];
  midiSave: MidiSaveCapability;
}

export interface SaveToBankResult {
  success: boolean;
  savedViaMidi: boolean;
  manualSaveRequired: boolean;
  instructions?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Preset {
  id: string;
  name: string;
  pedalType: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BankSlot {
  bankNumber: number;
  bankLabel: string;
  color: string;
  preset?: Preset;
  syncedAt?: number;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any;
  tags: string[];
}

export interface UpdatePresetParams {
  id: string;
  name?: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters?: any;
}

export interface PresetWithBanks extends Preset {
  bankNumbers: number[];
}
