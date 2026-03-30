// Shared preset management hook
// Handles the common preset tracking pattern (activePreset, isDirty, originalPresetState)
// used by all pedal editor hooks.

import { useState, useEffect, useCallback } from 'react';

export interface ActivePreset {
  id: string;
  name: string;
}

export interface UsePresetManagementReturn<TState> {
  /** The currently active/loaded preset, or null if none selected. */
  activePreset: ActivePreset | null;
  /** True when the current state differs from the state when the preset was loaded. */
  isDirty: boolean;
  /** Snapshot of the state at the time the preset was loaded. Used by resetToPreset. */
  originalPresetState: TState | null;
  /**
   * Call this whenever a preset is loaded to start tracking changes.
   * If presetId/presetName are omitted, tracking is cleared (no active preset).
   */
  trackPreset: (presetState: TState, presetId?: string, presetName?: string) => void;
  /** Clear the active preset and stop tracking dirty state. */
  clearActivePreset: () => void;
}

/**
 * Manages preset tracking state shared across all pedal editor hooks:
 * - Tracks which preset is active (id + name)
 * - Tracks the original state snapshot for dirty comparison
 * - Computes isDirty reactively using JSON.stringify comparison
 *
 * @param state - The current pedal state (from the pedal hook's useState)
 */
export function usePresetManagement<TState>(
  state: TState | null,
): UsePresetManagementReturn<TState> {
  const [activePreset, setActivePreset] = useState<ActivePreset | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<TState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Reactively compute isDirty whenever state or the original snapshot changes.
  // This is more reliable than imperative markDirty() calls in each setter.
  useEffect(() => {
    if (state && originalPresetState && activePreset) {
      setIsDirty(JSON.stringify(state) !== JSON.stringify(originalPresetState));
    } else {
      setIsDirty(false);
    }
  }, [state, originalPresetState, activePreset]);

  /**
   * Record that a preset has been loaded. Stores a snapshot of the state
   * so future changes can be detected. Call this from each pedal's loadPreset.
   */
  const trackPreset = useCallback(
    (presetState: TState, presetId?: string, presetName?: string) => {
      if (presetId && presetName) {
        setActivePreset({ id: presetId, name: presetName });
        // Deep-clone so later mutations to presetState don't affect the snapshot
        setOriginalPresetState(JSON.parse(JSON.stringify(presetState)));
        setIsDirty(false);
      } else {
        setActivePreset(null);
        setOriginalPresetState(null);
        setIsDirty(false);
      }
    },
    [],
  );

  const clearActivePreset = useCallback(() => {
    setActivePreset(null);
    setOriginalPresetState(null);
    setIsDirty(false);
  }, []);

  return {
    activePreset,
    isDirty,
    originalPresetState,
    trackPreset,
    clearActivePreset,
  };
}
