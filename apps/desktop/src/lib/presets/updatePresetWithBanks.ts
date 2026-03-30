// Utility for updating an active preset and syncing all bank assignments.
// Extracts the duplicated handleUpdatePreset pattern from pedal editor components.

import { updatePreset, savePresetToBank, getBankState } from '@/lib/presets';
import type { ActivePreset } from '@/hooks/usePresetManagement';

/**
 * Updates an existing preset's parameters in the library, then re-saves it to
 * every bank slot that currently references this preset.
 *
 * @param deviceName  - The connected MIDI device name
 * @param pedalType   - The pedal type string (e.g. 'PreampMk2', 'Microcosm')
 * @param activePreset - The currently active preset to update
 * @param state        - The new parameter values to save
 */
export async function updatePresetWithBanks<TState>(
  deviceName: string,
  pedalType: string,
  activePreset: ActivePreset,
  state: TState,
): Promise<void> {
  // Persist new parameter values
  await updatePreset({ id: activePreset.id, parameters: state });

  // Re-send to every bank slot that references this preset
  const bankState = await getBankState(pedalType);
  const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
  for (const bank of assignedBanks) {
    await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
  }
}
