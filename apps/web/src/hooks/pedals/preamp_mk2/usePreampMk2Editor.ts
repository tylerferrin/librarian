// React hook for managing Chase Bliss Preamp MK II editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getPreampMk2State,
  sendPreampMk2Parameter,
  recallPreampMk2Preset,
  type PreampMk2State,
  type Jump,
  type MidsPosition,
  type QResonance,
  type DiodeClipping,
  type FuzzMode,
} from '@/lib/midi/pedals/preamp_mk2';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UsePreampMk2EditorReturn {
  state: PreampMk2State | null;
  isLoading: boolean;
  error: string | null;
  
  // Fader controls
  setVolume: (value: number) => Promise<void>;
  setTreble: (value: number) => Promise<void>;
  setMids: (value: number) => Promise<void>;
  setFrequency: (value: number) => Promise<void>;
  setBass: (value: number) => Promise<void>;
  setGain: (value: number) => Promise<void>;
  
  // Arcade buttons
  setJump: (jump: Jump) => Promise<void>;
  setMidsPosition: (position: MidsPosition) => Promise<void>;
  setQResonance: (q: QResonance) => Promise<void>;
  setDiodeClipping: (diode: DiodeClipping) => Promise<void>;
  setFuzzMode: (fuzz: FuzzMode) => Promise<void>;
  
  // Other controls
  setExpression: (value: number) => Promise<void>;
  setBypass: (bypass: boolean) => Promise<void>;
  
  // Preset management
  loadPreset: (state: PreampMk2State, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

// Default state for the pedal
function createDefaultState(): PreampMk2State {
  return {
    volume: 64,
    treble: 64,
    mids: 64,
    frequency: 64,
    bass: 64,
    gain: 64,
    jump: 'Off',
    mids_position: 'Post',
    q_resonance: 'Mid',
    diode_clipping: 'Off',
    fuzz_mode: 'Off',
    expression: 0,
    bypass: false,
  };
}

export function usePreampMk2Editor(deviceName: string): UsePreampMk2EditorReturn {
  const [state, setState] = useState<PreampMk2State | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Preset tracking
  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<PreampMk2State | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Handle incoming MIDI CC messages from the pedal
  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;
      
      const newState = { ...prev };
      
      // Map CC numbers to state properties
      switch (event.cc_number) {
        // Faders (0-127)
        case 14: newState.volume = event.value; break;
        case 15: newState.treble = event.value; break;
        case 16: newState.mids = event.value; break;
        case 17: newState.frequency = event.value; break;
        case 18: newState.bass = event.value; break;
        case 19: newState.gain = event.value; break;
        
        // Arcade buttons (1-3)
        case 22: // Jump
          newState.jump = event.value === 1 ? 'Off' : event.value === 2 ? 'Zero' : 'Five';
          break;
        case 23: // Mids Position
          newState.mids_position = event.value === 1 ? 'Off' : event.value === 2 ? 'Pre' : 'Post';
          break;
        case 24: // Q Resonance
          newState.q_resonance = event.value === 1 ? 'Low' : event.value === 2 ? 'Mid' : 'High';
          break;
        case 25: // Diode Clipping
          newState.diode_clipping = event.value === 1 ? 'Off' : event.value === 2 ? 'Silicon' : 'Germanium';
          break;
        case 26: // Fuzz Mode
          newState.fuzz_mode = event.value === 1 ? 'Off' : event.value === 2 ? 'Open' : 'Gated';
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
        const initialState = await getPreampMk2State(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load Preamp MK II state:', err);
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
      await sendPreampMk2Parameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Fader controls
  const setVolume = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, volume: value } : null);
    await setParameter({ Volume: value });
  }, [setParameter]);

  const setTreble = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, treble: value } : null);
    await setParameter({ Treble: value });
  }, [setParameter]);

  const setMids = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, mids: value } : null);
    await setParameter({ Mids: value });
  }, [setParameter]);

  const setFrequency = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, frequency: value } : null);
    await setParameter({ Frequency: value });
  }, [setParameter]);

  const setBass = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, bass: value } : null);
    await setParameter({ Bass: value });
  }, [setParameter]);

  const setGain = useCallback(async (value: number) => {
    setState(prev => prev ? { ...prev, gain: value } : null);
    await setParameter({ Gain: value });
  }, [setParameter]);

  // Arcade buttons
  const setJump = useCallback(async (jump: Jump) => {
    setState(prev => prev ? { ...prev, jump } : null);
    await setParameter({ Jump: jump });
  }, [setParameter]);

  const setMidsPosition = useCallback(async (position: MidsPosition) => {
    setState(prev => prev ? { ...prev, mids_position: position } : null);
    await setParameter({ MidsPosition: position });
  }, [setParameter]);

  const setQResonance = useCallback(async (q: QResonance) => {
    setState(prev => prev ? { ...prev, q_resonance: q } : null);
    await setParameter({ QResonance: q });
  }, [setParameter]);

  const setDiodeClipping = useCallback(async (diode: DiodeClipping) => {
    setState(prev => prev ? { ...prev, diode_clipping: diode } : null);
    await setParameter({ DiodeClipping: diode });
  }, [setParameter]);

  const setFuzzMode = useCallback(async (fuzz: FuzzMode) => {
    setState(prev => prev ? { ...prev, fuzz_mode: fuzz } : null);
    await setParameter({ FuzzMode: fuzz });
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
    newState: PreampMk2State,
    presetId?: string,
    presetName?: string,
    skipMidiSend?: boolean,
  ) => {
    try {
      // Update UI immediately so the preset appears selected before faders move
      setState(newState);
      if (presetId && presetName) {
        setActivePreset({ id: presetId, name: presetName });
        setOriginalPresetState(JSON.parse(JSON.stringify(newState)));
      }
      setError(null);
      // Send MIDI after UI update — motorized faders move to match the preset
      if (!skipMidiSend) {
        await recallPreampMk2Preset(deviceName, newState);
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
    setVolume,
    setTreble,
    setMids,
    setFrequency,
    setBass,
    setGain,
    setJump,
    setMidsPosition,
    setQResonance,
    setDiodeClipping,
    setFuzzMode,
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
