// React hook for managing Chase Bliss / Meris CXM 1978 editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getCxm1978State,
  sendCxm1978Parameter,
  recallCxm1978Preset,
  type Cxm1978State,
  type Jump,
  type ReverbType,
  type Diffusion,
  type TankMod,
  type Clock,
} from '@/lib/midi/pedals/cxm1978';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UseCxm1978EditorReturn {
  state: Cxm1978State | null;
  isLoading: boolean;
  error: string | null;

  // Fader controls
  setBass: (value: number) => Promise<void>;
  setMids: (value: number) => Promise<void>;
  setCross: (value: number) => Promise<void>;
  setTreble: (value: number) => Promise<void>;
  setMix: (value: number) => Promise<void>;
  setPreDly: (value: number) => Promise<void>;

  // Arcade buttons
  setJump: (jump: Jump) => Promise<void>;
  setReverbType: (type: ReverbType) => Promise<void>;
  setDiffusion: (diffusion: Diffusion) => Promise<void>;
  setTankMod: (tankMod: TankMod) => Promise<void>;
  setClock: (clock: Clock) => Promise<void>;

  // Other controls
  setExpression: (value: number) => Promise<void>;
  setBypass: (bypass: boolean) => Promise<void>;

  // Preset management
  loadPreset: (state: Cxm1978State, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

function createDefaultState(): Cxm1978State {
  return {
    bass: 64,
    mids: 64,
    cross: 64,
    treble: 64,
    mix: 64,
    pre_dly: 0,
    jump: 'Off',
    reverb_type: 'Room',
    diffusion: 'Med',
    tank_mod: 'Low',
    clock: 'Standard',
    expression: 0,
    bypass: false,
  };
}

export function useCxm1978Editor(deviceName: string): UseCxm1978EditorReturn {
  const [state, setState] = useState<Cxm1978State | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preset tracking
  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<Cxm1978State | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Handle incoming MIDI CC messages from the pedal
  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;

      const newState = { ...prev };

      switch (event.cc_number) {
        // Faders (0-127)
        case 14: newState.bass = event.value; break;
        case 15: newState.mids = event.value; break;
        case 16: newState.cross = event.value; break;
        case 17: newState.treble = event.value; break;
        case 18: newState.mix = event.value; break;
        case 19: newState.pre_dly = event.value; break;

        // Arcade buttons (1-3)
        case 22: // Jump
          newState.jump = event.value === 2 ? 'Zero' : event.value === 3 ? 'Five' : 'Off';
          break;
        case 23: // Type
          newState.reverb_type = event.value === 2 ? 'Plate' : event.value === 3 ? 'Hall' : 'Room';
          break;
        case 24: // Diffusion
          newState.diffusion = event.value === 1 ? 'Low' : event.value === 3 ? 'High' : 'Med';
          break;
        case 25: // Tank Mod
          newState.tank_mod = event.value === 1 ? 'Low' : event.value === 3 ? 'High' : 'Med';
          break;
        case 26: // Clock
          newState.clock = event.value === 1 ? 'HiFi' : event.value === 3 ? 'LoFi' : 'Standard';
          break;

        // Other controls
        case 100: newState.expression = event.value; break;
        case 102: newState.bypass = event.value === 0; break; // 0 = bypass, 1-127 = engage

        default:
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
        const initialState = await getCxm1978State(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load CXM 1978 state:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load state');
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
      const hasChanged = JSON.stringify(state) !== JSON.stringify(originalPresetState);
      setIsDirty(hasChanged);
    } else {
      setIsDirty(false);
    }
  }, [state, originalPresetState, activePreset]);

  // Generic parameter setter
  const setParameter = useCallback(async (param: any) => {
    try {
      await sendCxm1978Parameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Fader controls
  const setBass = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, bass: value } : null);
    await setParameter({ Bass: value });
  }, [setParameter]);

  const setMids = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, mids: value } : null);
    await setParameter({ Mids: value });
  }, [setParameter]);

  const setCross = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, cross: value } : null);
    await setParameter({ Cross: value });
  }, [setParameter]);

  const setTreble = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, treble: value } : null);
    await setParameter({ Treble: value });
  }, [setParameter]);

  const setMix = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, mix: value } : null);
    await setParameter({ Mix: value });
  }, [setParameter]);

  const setPreDly = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, pre_dly: value } : null);
    await setParameter({ PreDly: value });
  }, [setParameter]);

  // Arcade buttons
  const setJump = useCallback(async (jump: Jump) => {
    setState(prev => prev ? { ...prev, jump } : null);
    await setParameter({ Jump: jump });
  }, [setParameter]);

  const setReverbType = useCallback(async (type: ReverbType) => {
    setState(prev => prev ? { ...prev, reverb_type: type } : null);
    await setParameter({ ReverbType: type });
  }, [setParameter]);

  const setDiffusion = useCallback(async (diffusion: Diffusion) => {
    setState(prev => prev ? { ...prev, diffusion } : null);
    await setParameter({ Diffusion: diffusion });
  }, [setParameter]);

  const setTankMod = useCallback(async (tankMod: TankMod) => {
    setState(prev => prev ? { ...prev, tank_mod: tankMod } : null);
    await setParameter({ TankMod: tankMod });
  }, [setParameter]);

  const setClock = useCallback(async (clock: Clock) => {
    setState(prev => prev ? { ...prev, clock } : null);
    await setParameter({ Clock: clock });
  }, [setParameter]);

  // Other controls
  const setExpression = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, expression: value } : null);
    await setParameter({ Expression: value });
  }, [setParameter]);

  const setBypass = useCallback(async (bypass: boolean) => {
    setState(prev => prev ? { ...prev, bypass } : null);
    await setParameter({ Bypass: bypass });
  }, [setParameter]);

  // Load a preset
  const loadPreset = useCallback(async (
    newState: Cxm1978State,
    presetId?: string,
    presetName?: string,
    skipMidiSend?: boolean,
  ) => {
    try {
      setState(newState);
      if (presetId && presetName) {
        setActivePreset({ id: presetId, name: presetName });
        setOriginalPresetState(JSON.parse(JSON.stringify(newState)));
      }
      setError(null);
      if (!skipMidiSend) {
        await recallCxm1978Preset(deviceName, newState);
      }
    } catch (err) {
      console.error('Failed to load preset:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preset');
    }
  }, [deviceName]);

  // Reset to the original preset state
  const resetToPreset = useCallback(() => {
    if (originalPresetState) {
      loadPreset(originalPresetState, activePreset?.id, activePreset?.name);
    }
  }, [originalPresetState, activePreset, loadPreset]);

  // Reset to pedal default values
  const resetToPedalDefault = useCallback(() => {
    const defaultState = createDefaultState();
    loadPreset(defaultState);
  }, [loadPreset]);

  // Clear active preset tracking
  const clearActivePreset = useCallback(() => {
    setActivePreset(null);
    setOriginalPresetState(null);
    setIsDirty(false);
  }, []);

  return {
    state,
    isLoading,
    error,
    setBass,
    setMids,
    setCross,
    setTreble,
    setMix,
    setPreDly,
    setJump,
    setReverbType,
    setDiffusion,
    setTankMod,
    setClock,
    setExpression,
    setBypass,
    loadPreset,
    activePreset,
    isDirty,
    resetToPreset,
    resetToPedalDefault,
    clearActivePreset,
  };
}
