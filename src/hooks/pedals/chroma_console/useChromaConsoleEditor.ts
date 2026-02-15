// React hook for managing Chroma Console editor state

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getChromaConsoleState,
  sendChromaConsoleParameter,
  type ChromaConsoleState,
  type CharacterModule,
  type MovementModule,
  type DiffusionModule,
  type TextureModule,
  type BypassState,
  type GestureMode,
  type CaptureMode,
  type CaptureRouting,
  type FilterMode,
  type CalibrationLevel,
  createDefaultState,
  cloneState,
  statesEqual,
} from '@/lib/midi/pedals/chroma_console';

interface UseChromaConsoleEditorReturn {
  state: ChromaConsoleState | null;
  isLoading: boolean;
  error: string | null;
  
  // Primary controls
  setTilt: (value: number) => Promise<void>;
  setRate: (value: number) => Promise<void>;
  setTime: (value: number) => Promise<void>;
  setMix: (value: number) => Promise<void>;
  setAmountCharacter: (value: number) => Promise<void>;
  setAmountMovement: (value: number) => Promise<void>;
  setAmountDiffusion: (value: number) => Promise<void>;
  setAmountTexture: (value: number) => Promise<void>;
  
  // Secondary controls
  setSensitivity: (value: number) => Promise<void>;
  setDriftMovement: (value: number) => Promise<void>;
  setDriftDiffusion: (value: number) => Promise<void>;
  setOutputLevel: (value: number) => Promise<void>;
  setEffectVolCharacter: (value: number) => Promise<void>;
  setEffectVolMovement: (value: number) => Promise<void>;
  setEffectVolDiffusion: (value: number) => Promise<void>;
  setEffectVolTexture: (value: number) => Promise<void>;
  
  // Module selections
  setCharacterModule: (module: CharacterModule) => Promise<void>;
  setMovementModule: (module: MovementModule) => Promise<void>;
  setDiffusionModule: (module: DiffusionModule) => Promise<void>;
  setTextureModule: (module: TextureModule) => Promise<void>;
  
  // Bypass controls
  setBypassState: (state: BypassState) => Promise<void>;
  setCharacterBypass: (bypass: boolean) => Promise<void>;
  setMovementBypass: (bypass: boolean) => Promise<void>;
  setDiffusionBypass: (bypass: boolean) => Promise<void>;
  setTextureBypass: (bypass: boolean) => Promise<void>;
  
  // Other functions
  setGestureMode: (mode: GestureMode) => Promise<void>;
  gestureStop: () => Promise<void>;
  setCaptureMode: (mode: CaptureMode) => Promise<void>;
  setCaptureRouting: (routing: CaptureRouting) => Promise<void>;
  tapTempo: () => Promise<void>;
  setFilterMode: (mode: FilterMode) => Promise<void>;
  setCalibrationLevel: (level: CalibrationLevel) => Promise<void>;
  
  // Preset management
  loadPreset: (state: ChromaConsoleState, presetId?: string, presetName?: string) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  clearActivePreset: () => void;
}

export function useChromaConsoleEditor(deviceName: string): UseChromaConsoleEditorReturn {
  const [state, setState] = useState<ChromaConsoleState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Preset tracking
  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<ChromaConsoleState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load initial state
  useEffect(() => {
    let mounted = true;

    async function loadState() {
      try {
        setIsLoading(true);
        const initialState = await getChromaConsoleState(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load Chroma Console state:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load state');
          // Use default state as fallback
          setState(createDefaultState());
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadState();

    return () => {
      mounted = false;
    };
  }, [deviceName]);

  // Check if state has been modified from original preset
  useEffect(() => {
    if (state && originalPresetState && activePreset) {
      const hasChanged = !statesEqual(state, originalPresetState);
      setIsDirty(hasChanged);
    } else {
      setIsDirty(false);
    }
  }, [state, originalPresetState, activePreset]);

  // Generic parameter setter
  const setParameter = useCallback(async (param: any) => {
    try {
      await sendChromaConsoleParameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Primary controls
  const setTilt = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, tilt: value } : null);
    await setParameter({ Tilt: value });
  }, [setParameter]);

  const setRate = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, rate: value } : null);
    await setParameter({ Rate: value });
  }, [setParameter]);

  const setTime = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, time: value } : null);
    await setParameter({ Time: value });
  }, [setParameter]);

  const setMix = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, mix: value } : null);
    await setParameter({ Mix: value });
  }, [setParameter]);

  const setAmountCharacter = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, amount_character: value } : null);
    await setParameter({ AmountCharacter: value });
  }, [setParameter]);

  const setAmountMovement = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, amount_movement: value } : null);
    await setParameter({ AmountMovement: value });
  }, [setParameter]);

  const setAmountDiffusion = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, amount_diffusion: value } : null);
    await setParameter({ AmountDiffusion: value });
  }, [setParameter]);

  const setAmountTexture = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, amount_texture: value } : null);
    await setParameter({ AmountTexture: value });
  }, [setParameter]);

  // Secondary controls
  const setSensitivity = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, sensitivity: value } : null);
    await setParameter({ Sensitivity: value });
  }, [setParameter]);

  const setDriftMovement = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, drift_movement: value } : null);
    await setParameter({ DriftMovement: value });
  }, [setParameter]);

  const setDriftDiffusion = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, drift_diffusion: value } : null);
    await setParameter({ DriftDiffusion: value });
  }, [setParameter]);

  const setOutputLevel = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, output_level: value } : null);
    await setParameter({ OutputLevel: value });
  }, [setParameter]);

  const setEffectVolCharacter = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, effect_vol_character: value } : null);
    await setParameter({ EffectVolCharacter: value });
  }, [setParameter]);

  const setEffectVolMovement = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, effect_vol_movement: value } : null);
    await setParameter({ EffectVolMovement: value });
  }, [setParameter]);

  const setEffectVolDiffusion = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, effect_vol_diffusion: value } : null);
    await setParameter({ EffectVolDiffusion: value });
  }, [setParameter]);

  const setEffectVolTexture = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, effect_vol_texture: value } : null);
    await setParameter({ EffectVolTexture: value });
  }, [setParameter]);

  // Module selections
  const setCharacterModule = useCallback(async (module: CharacterModule) => {
    setState(prev => prev ? { ...prev, character_module: module } : null);
    await setParameter({ CharacterModule: module });
  }, [setParameter]);

  const setMovementModule = useCallback(async (module: MovementModule) => {
    setState(prev => prev ? { ...prev, movement_module: module } : null);
    await setParameter({ MovementModule: module });
  }, [setParameter]);

  const setDiffusionModule = useCallback(async (module: DiffusionModule) => {
    setState(prev => prev ? { ...prev, diffusion_module: module } : null);
    await setParameter({ DiffusionModule: module });
  }, [setParameter]);

  const setTextureModule = useCallback(async (module: TextureModule) => {
    setState(prev => prev ? { ...prev, texture_module: module } : null);
    await setParameter({ TextureModule: module });
  }, [setParameter]);

  // Bypass controls
  const setBypassState = useCallback(async (bypassState: BypassState) => {
    setState(prev => prev ? { ...prev, bypass_state: bypassState } : null);
    await setParameter({ BypassState: bypassState });
  }, [setParameter]);

  const setCharacterBypass = useCallback(async (bypass: boolean) => {
    setState(prev => prev ? { ...prev, character_bypass: bypass } : null);
    await setParameter({ CharacterBypass: bypass });
  }, [setParameter]);

  const setMovementBypass = useCallback(async (bypass: boolean) => {
    setState(prev => prev ? { ...prev, movement_bypass: bypass } : null);
    await setParameter({ MovementBypass: bypass });
  }, [setParameter]);

  const setDiffusionBypass = useCallback(async (bypass: boolean) => {
    setState(prev => prev ? { ...prev, diffusion_bypass: bypass } : null);
    await setParameter({ DiffusionBypass: bypass });
  }, [setParameter]);

  const setTextureBypass = useCallback(async (bypass: boolean) => {
    setState(prev => prev ? { ...prev, texture_bypass: bypass } : null);
    await setParameter({ TextureBypass: bypass });
  }, [setParameter]);

  // Other functions
  const setGestureMode = useCallback(async (mode: GestureMode) => {
    setState(prev => prev ? { ...prev, gesture_mode: mode } : null);
    await setParameter({ GestureMode: mode });
  }, [setParameter]);

  const gestureStop = useCallback(async () => {
    await setParameter('GestureStop');
  }, [setParameter]);

  const setCaptureMode = useCallback(async (mode: CaptureMode) => {
    setState(prev => prev ? { ...prev, capture_mode: mode } : null);
    await setParameter({ CaptureMode: mode });
  }, [setParameter]);

  const setCaptureRouting = useCallback(async (routing: CaptureRouting) => {
    setState(prev => prev ? { ...prev, capture_routing: routing } : null);
    await setParameter({ CaptureRouting: routing });
  }, [setParameter]);

  const tapTempo = useCallback(async () => {
    await setParameter('TapTempo');
  }, [setParameter]);

  const setFilterMode = useCallback(async (mode: FilterMode) => {
    setState(prev => prev ? { ...prev, filter_mode: mode } : null);
    await setParameter({ FilterMode: mode });
  }, [setParameter]);

  const setCalibrationLevel = useCallback(async (level: CalibrationLevel) => {
    setState(prev => prev ? { ...prev, calibration_level: level } : null);
    await setParameter({ CalibrationLevel: level });
  }, [setParameter]);

  // Preset management
  const loadPreset = useCallback(async (
    presetState: ChromaConsoleState,
    presetId?: string,
    presetName?: string
  ) => {
    setState(presetState);
    if (presetId && presetName) {
      setActivePreset({ id: presetId, name: presetName });
      setOriginalPresetState(cloneState(presetState));
      setIsDirty(false);
    } else {
      setActivePreset(null);
      setOriginalPresetState(null);
      setIsDirty(false);
    }
  }, []);

  const resetToPreset = useCallback(() => {
    if (originalPresetState) {
      setState(cloneState(originalPresetState));
      setIsDirty(false);
    }
  }, [originalPresetState]);

  const clearActivePreset = useCallback(() => {
    setActivePreset(null);
    setOriginalPresetState(null);
    setIsDirty(false);
  }, []);

  return {
    state,
    isLoading,
    error,
    
    // Primary controls
    setTilt,
    setRate,
    setTime,
    setMix,
    setAmountCharacter,
    setAmountMovement,
    setAmountDiffusion,
    setAmountTexture,
    
    // Secondary controls
    setSensitivity,
    setDriftMovement,
    setDriftDiffusion,
    setOutputLevel,
    setEffectVolCharacter,
    setEffectVolMovement,
    setEffectVolDiffusion,
    setEffectVolTexture,
    
    // Module selections
    setCharacterModule,
    setMovementModule,
    setDiffusionModule,
    setTextureModule,
    
    // Bypass controls
    setBypassState,
    setCharacterBypass,
    setMovementBypass,
    setDiffusionBypass,
    setTextureBypass,
    
    // Other functions
    setGestureMode,
    gestureStop,
    setCaptureMode,
    setCaptureRouting,
    tapTempo,
    setFilterMode,
    setCalibrationLevel,
    
    // Preset management
    loadPreset,
    activePreset,
    isDirty,
    resetToPreset,
    clearActivePreset,
  };
}
