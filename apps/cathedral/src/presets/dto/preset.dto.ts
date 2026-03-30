import type { PedalName, PedalState } from '@librarian/plate';

export interface PresetDto {
  id: string;
  userId: string;
  name: string;
  pedalName: PedalName;
  description: string | null;
  parameters: PedalState;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankSlotDto {
  bankNumber: number;
  pedalName: PedalName;
  presetId: string | null;
  preset: PresetDto | null;
  syncedAt: string | null;
}

export interface PresetWithBanksDto extends PresetDto {
  bankNumbers: number[];
}
