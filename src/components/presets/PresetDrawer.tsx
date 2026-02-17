/**
 * PresetDrawer - Universal preset UI opened by the Preset button
 *
 * Single entry point for preset management across all pedal editors.
 * Opens with Banks view by default (pedal-bank first).
 * Users can open Library view to browse and load presets.
 *
 * Dynamic content rendering:
 * - Library: Preset list (load to editor or assign to bank slot)
 * - Banks: Bank grid (for pedals with bankConfig)
 */
import { PresetManager } from './PresetManager';
import type { MicrocosmState } from '@/lib/midi/pedals/microcosm/types';

interface PresetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName: string;
  pedalType: string;
  currentState: MicrocosmState | unknown;
  activePresetId?: string | null;
  onLoadPreset?: (state: MicrocosmState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  onPresetSaved?: (presetId: string, presetName: string) => void;
  onPresetCleared?: () => void;
}

export function PresetDrawer(props: PresetDrawerProps) {
  return <PresetManager {...props} defaultView="banks" />;
}
