// Utility for updating an active preset and syncing all bank assignments.

import { updatePreset, savePresetToBank, getBankState } from '@/lib/presets';
import type { ActivePreset } from '@/hooks/usePresetManagement';

export async function updatePresetWithBanks<TState>(
  deviceName: string,
  pedalType: string,
  activePreset: ActivePreset,
  state: TState,
): Promise<void> {
  await updatePreset({ id: activePreset.id, parameters: state as Record<string, unknown> });

  const bankState = await getBankState(pedalType);
  const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
  for (const bank of assignedBanks) {
    await savePresetToBank(deviceName, activePreset.id, bank.bankNumber, pedalType as string);
  }
}
