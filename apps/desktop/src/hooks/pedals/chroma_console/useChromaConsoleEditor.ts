// React hook for managing Chroma Console editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getChromaConsoleState,
  sendChromaConsoleParameter,
  recallChromaConsolePreset,
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
  type ModuleSlot,
  createDefaultState,
  cloneState,
  statesEqual,
} from '@/lib/midi/pedals/chroma_console';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

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
  
  // Signal path (app-only metadata)
  setSignalPath: (newPath: ModuleSlot[]) => void;
  
  // Preset management
  loadPreset: (state: ChromaConsoleState, presetId?: string, presetName?: string) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
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

  // Handle incoming MIDI CC messages from the pedal
  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    // Only update state, don't send MIDI back (avoid feedback loop)
    setState(prev => {
      if (!prev) return null;
      
      const newState = { ...prev };
      
      // Map CC numbers to state properties
      switch (event.cc_number) {
        // Primary controls
        case 64: newState.tilt = event.value; break;
        case 66: newState.rate = event.value; break;
        case 68: newState.time = event.value; break;
        case 70: newState.mix = event.value; break;
        case 65: newState.amount_character = event.value; break;
        case 67: newState.amount_movement = event.value; break;
        case 69: newState.amount_diffusion = event.value; break;
        case 71: newState.amount_texture = event.value; break;
        
        // Secondary controls
        case 72: newState.sensitivity = event.value; break;
        case 74: newState.drift_movement = event.value; break;
        case 76: newState.drift_diffusion = event.value; break;
        case 78: newState.output_level = event.value; break;
        case 73: newState.effect_vol_character = event.value; break;
        case 75: newState.effect_vol_movement = event.value; break;
        case 77: newState.effect_vol_diffusion = event.value; break;
        case 79: newState.effect_vol_texture = event.value; break;
        
        // Module selections (CC 16-19) - also update bypass state
        // Each module uses ranges: 0-21, 22-43, 44-65, 66-87, 88-109, 110-127 (Off)
        case 16: { // Character module
          const module: CharacterModule = 
            event.value < 22 ? 'Drive' :
            event.value < 44 ? 'Sweeten' :
            event.value < 66 ? 'Fuzz' :
            event.value < 88 ? 'Howl' :
            event.value < 110 ? 'Swell' : 'Off';
          newState.character_module = module;
          newState.character_bypass = module === 'Off';
          break;
        }
        case 17: { // Movement module
          const module: MovementModule = 
            event.value < 22 ? 'Doubler' :
            event.value < 44 ? 'Vibrato' :
            event.value < 66 ? 'Phaser' :
            event.value < 88 ? 'Tremolo' :
            event.value < 110 ? 'Pitch' : 'Off';
          newState.movement_module = module;
          newState.movement_bypass = module === 'Off';
          break;
        }
        case 18: { // Diffusion module
          const module: DiffusionModule = 
            event.value < 22 ? 'Cascade' :
            event.value < 44 ? 'Reels' :
            event.value < 66 ? 'Space' :
            event.value < 88 ? 'Collage' :
            event.value < 110 ? 'Reverse' : 'Off';
          newState.diffusion_module = module;
          newState.diffusion_bypass = module === 'Off';
          break;
        }
        case 19: { // Texture module
          const module: TextureModule = 
            event.value < 22 ? 'Filter' :
            event.value < 44 ? 'Squash' :
            event.value < 66 ? 'Cassette' :
            event.value < 88 ? 'Broken' :
            event.value < 110 ? 'Interference' : 'Off';
          newState.texture_module = module;
          newState.texture_bypass = module === 'Off';
          break;
        }
        
        // Bypass controls (0-63 = engaged, 64-127 = bypassed - inverted logic!)
        case 91: 
          newState.bypass_state = event.value < 64 ? 'Engaged' : 'Bypass';
          break;
        case 103: newState.character_bypass = event.value < 64; break;
        case 104: newState.movement_bypass = event.value < 64; break;
        case 105: newState.diffusion_bypass = event.value < 64; break;
        case 106: newState.texture_bypass = event.value < 64; break;
        
        default:
          // Ignore unmapped CC numbers
          return prev;
      }
      
      return newState;
    });
  }, []);

  // Listen for incoming MIDI from the pedal
  useMIDIInput(handleMidiCC, deviceName);

  // Load initial state
  useEffect(() => {
    let mounted = true;

    async function loadState() {
      try {
        setIsLoading(true);
        const initialState = await getChromaConsoleState(deviceName);
        if (mounted) {
          // Ensure signal_path exists (backend doesn't know about this app-only field)
          if (!initialState.signal_path) {
            initialState.signal_path = ['character', 'movement', 'diffusion', 'texture'];
          }
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
  // When a module is selected, automatically manage bypass state:
  // - If module is "Off" → set bypass to true
  // - If module is any effect → set bypass to false
  const setCharacterModule = useCallback(async (module: CharacterModule) => {
    const bypass = module === 'Off';
    setState(prev => prev ? { ...prev, character_module: module, character_bypass: bypass } : null);
    await setParameter({ CharacterModule: module });
    await setParameter({ CharacterBypass: bypass });
  }, [setParameter]);

  const setMovementModule = useCallback(async (module: MovementModule) => {
    const bypass = module === 'Off';
    setState(prev => prev ? { ...prev, movement_module: module, movement_bypass: bypass } : null);
    await setParameter({ MovementModule: module });
    await setParameter({ MovementBypass: bypass });
  }, [setParameter]);

  const setDiffusionModule = useCallback(async (module: DiffusionModule) => {
    const bypass = module === 'Off';
    setState(prev => prev ? { ...prev, diffusion_module: module, diffusion_bypass: bypass } : null);
    await setParameter({ DiffusionModule: module });
    await setParameter({ DiffusionBypass: bypass });
  }, [setParameter]);

  const setTextureModule = useCallback(async (module: TextureModule) => {
    const bypass = module === 'Off';
    setState(prev => prev ? { ...prev, texture_module: module, texture_bypass: bypass } : null);
    await setParameter({ TextureModule: module });
    await setParameter({ TextureBypass: bypass });
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

  // Signal path (app-only metadata, not sent to pedal)
  const setSignalPath = useCallback((newPath: ModuleSlot[]) => {
    setState(prev => prev ? { ...prev, signal_path: newPath } : null);
    // Note: This does NOT send MIDI - it's app-only metadata
  }, []);

  // Preset management
  const loadPreset = useCallback(async (
    presetState: ChromaConsoleState,
    presetId?: string,
    presetName?: string
  ) => {
    // Ensure signal_path exists for older presets saved before this feature
    if (!presetState.signal_path) {
      presetState.signal_path = ['character', 'movement', 'diffusion', 'texture'];
    }
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

  const resetToPedalDefault = useCallback(async () => {
    // Create a state with all knobs at their noon position (63 = middle of 0-127)
    const defaultState = createDefaultState();
    const noonValue = 63;
    
    const pedalDefaultState: ChromaConsoleState = {
      ...defaultState,
      // Set all knob parameters to noon (63)
      tilt: noonValue,
      rate: noonValue,
      time: noonValue,
      mix: noonValue,
      amount_character: noonValue,
      amount_movement: noonValue,
      amount_diffusion: noonValue,
      amount_texture: noonValue,
      sensitivity: noonValue,
      drift_movement: noonValue,
      drift_diffusion: noonValue,
      output_level: noonValue,
      effect_vol_character: noonValue,
      effect_vol_movement: noonValue,
      effect_vol_diffusion: noonValue,
      effect_vol_texture: noonValue,
      // Keep current signal path
      signal_path: state?.signal_path || defaultState.signal_path,
    };
    
    // Send defaults to pedal via MIDI
    await recallChromaConsolePreset(deviceName, pedalDefaultState);
    
    // Update UI state
    setState(pedalDefaultState);
    
    // Clear active preset since we're resetting to pedal default
    setActivePreset(null);
    setOriginalPresetState(null);
    setIsDirty(false);
  }, [state, deviceName]);

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
    
    // Signal path
    setSignalPath,
    
    // Preset management
    loadPreset,
    activePreset,
    isDirty,
    resetToPreset,
    resetToPedalDefault,
    clearActivePreset,
  };
}
