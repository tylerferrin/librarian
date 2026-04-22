// Preset API — HTTP calls to Cathedral backend
// Replaces the Tauri invoke() calls used in apps/desktop

import { apiRequest } from '../api/client';
import type {
  Preset,
  PresetWithBanks,
  BankSlot,
  PresetFilter,
  SavePresetParams,
  UpdatePresetParams,
  SaveToBankResult,
} from './types';

// ─── Shape of responses from Cathedral ───────────────────────────────────────

interface CathedralPreset {
  id: string;
  userId: string;
  name: string;
  pedalName: string;
  description: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any;
  tags: string[];
  isFavorite: boolean;
  createdAt: string; // ISO date string
  updatedAt: string;
}

interface CathedralPresetWithBanks extends CathedralPreset {
  bankNumbers: number[];
}

interface CathedralBankSlot {
  bankNumber: number;
  pedalName: string;
  presetId: string | null;
  preset: CathedralPreset | null;
  syncedAt: string | null;
}

// ─── Converters ───────────────────────────────────────────────────────────────

function toPreset(dto: CathedralPreset): Preset {
  return {
    id: dto.id,
    name: dto.name,
    pedalType: dto.pedalName,
    description: dto.description ?? undefined,
    parameters: dto.parameters,
    tags: dto.tags,
    isFavorite: dto.isFavorite,
    createdAt: new Date(dto.createdAt).getTime(),
    updatedAt: new Date(dto.updatedAt).getTime(),
  };
}

function toPresetWithBanks(dto: CathedralPresetWithBanks): PresetWithBanks {
  return { ...toPreset(dto), bankNumbers: dto.bankNumbers };
}

function toBankSlot(dto: CathedralBankSlot, pedalType: string): BankSlot {
  const slot: BankSlot = {
    bankNumber: dto.bankNumber,
    bankLabel: `Bank ${dto.bankNumber}`,
    color: 'gray',
    preset: dto.preset ? toPreset(dto.preset) : undefined,
    syncedAt: dto.syncedAt ? new Date(dto.syncedAt).getTime() : undefined,
  };
  // bankLabel and color will be filled in by the caller using BankConfig
  void pedalType;
  return slot;
}

// ─── API Functions (same signatures as desktop's Tauri-backed api.ts) ─────────

export async function savePreset(params: SavePresetParams): Promise<Preset> {
  const dto = await apiRequest<CathedralPreset>('/presets', {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      pedalName: params.pedalType,
      description: params.description,
      parameters: params.parameters,
      tags: params.tags,
    }),
  });
  return toPreset(dto);
}

export async function updatePreset(params: UpdatePresetParams): Promise<Preset> {
  const dto = await apiRequest<CathedralPreset>(`/presets/${params.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: params.name,
      description: params.description,
      tags: params.tags,
      isFavorite: params.isFavorite,
      parameters: params.parameters,
    }),
  });
  return toPreset(dto);
}

export async function getPreset(id: string): Promise<Preset> {
  const dto = await apiRequest<CathedralPreset>(`/presets/${id}`);
  return toPreset(dto);
}

export async function listPresets(filter?: PresetFilter): Promise<Preset[]> {
  const params = new URLSearchParams();
  if (filter?.pedalType) params.set('pedalName', filter.pedalType);
  if (filter?.isFavorite !== undefined) params.set('isFavorite', String(filter.isFavorite));
  if (filter?.searchQuery) params.set('search', filter.searchQuery);
  if (filter?.tags?.length) params.set('tags', filter.tags.join(','));

  const query = params.toString();
  const dtos = await apiRequest<CathedralPresetWithBanks[]>(`/presets${query ? `?${query}` : ''}`);
  return dtos.map(toPreset);
}

export async function deletePreset(id: string): Promise<void> {
  await apiRequest<void>(`/presets/${id}`, { method: 'DELETE' });
}

export async function toggleFavorite(id: string): Promise<Preset> {
  const preset = await getPreset(id);
  return updatePreset({ id, isFavorite: !preset.isFavorite });
}

export async function getBankState(pedalType: string): Promise<BankSlot[]> {
  const dtos = await apiRequest<CathedralBankSlot[]>(`/presets/pedal/${pedalType}/banks`);
  return dtos.map((dto) => toBankSlot(dto, pedalType));
}

export async function assignToBank(
  pedalType: string,
  bankNumber: number,
  presetId: string
): Promise<void> {
  await apiRequest<void>(`/presets/pedal/${pedalType}/banks/${bankNumber}`, {
    method: 'POST',
    body: JSON.stringify({ presetId }),
  });
}

export async function clearBank(pedalType: string, bankNumber: number): Promise<void> {
  await apiRequest<void>(`/presets/pedal/${pedalType}/banks/${bankNumber}`, {
    method: 'DELETE',
  });
}

/**
 * Save a preset to a bank slot.
 * In the web app this splits into two operations:
 *  1. Assign the preset in the Cathedral database
 *  2. Recall the preset via MIDI (stub until Phase 5)
 *
 * @param pedalType Optional — if omitted the preset is fetched to retrieve its pedalType.
 */
export async function savePresetToBank(
  _deviceName: string,
  presetId: string,
  bankNumber: number,
  pedalType?: string
): Promise<SaveToBankResult> {
  const effectivePedalType = pedalType ?? (await getPreset(presetId)).pedalType;
  await assignToBank(effectivePedalType, bankNumber, presetId);
  console.warn('[MIDI stub] savePresetToBank: MIDI recall deferred to Phase 5');
  return { success: true, savedViaMidi: false, manualSaveRequired: true };
}

export async function getPresetsWithBanks(pedalType: string): Promise<PresetWithBanks[]> {
  const params = new URLSearchParams({ pedalName: pedalType });
  const dtos = await apiRequest<CathedralPresetWithBanks[]>(`/presets?${params}`);
  return dtos.map(toPresetWithBanks);
}
