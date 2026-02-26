// React hook for managing Chase Bliss Billy Strings Wombtone editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getBillyStringsWombtoneState,
  sendBillyStringsWombtoneParameter,
  recallBillyStringsWombtonePreset,
} from '@/lib/midi/pedals/billy-strings-wombtone';
import type { BillyStringsWombtoneState } from '@/lib/midi/pedals/billy-strings-wombtone';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UseBillyStringsWombtoneEditorReturn {
  state: BillyStringsWombtoneState | null;
  isLoading: boolean;
  error: string | null;

  setFeed: (value: number) => Promise<void>;
  setVolume: (value: number) => Promise<void>;
  setMix: (value: number) => Promise<void>;
  setRate: (value: number) => Promise<void>;
  setDepth: (value: number) => Promise<void>;
  setForm: (value: number) => Promise<void>;
  setRampSpeed: (value: number) => Promise<void>;
  setNoteDivision: (value: number) => Promise<void>;
  setBypass: (value: boolean) => Promise<void>;
  setTap: (value: boolean) => Promise<void>;
  setMidiClockIgnore: (value: boolean) => Promise<void>;
  setExpression: (value: number) => Promise<void>;

  loadPreset: (state: BillyStringsWombtoneState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

function createDefaultState(): BillyStringsWombtoneState {
  return {
    feed: 64, volume: 100, mix: 64, rate: 64, depth: 64,
    form: 64, ramp_speed: 64, note_division: 3,
    bypass: true, tap: false, midi_clock_ignore: false, expression: 0,
  };
}

export function useBillyStringsWombtoneEditor(deviceName: string): UseBillyStringsWombtoneEditorReturn {
  const [state, setState] = useState<BillyStringsWombtoneState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<BillyStringsWombtoneState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;
      const s = { ...prev };

      switch (event.cc_number) {
        case 14: s.feed = event.value; break;
        case 15: s.volume = event.value; break;
        case 16: s.mix = event.value; break;
        case 17: s.rate = event.value; break;
        case 18: s.depth = event.value; break;
        case 19: s.form = event.value; break;
        case 20: s.ramp_speed = event.value; break;
        case 21: s.note_division = Math.min(5, Math.max(0, event.value)); break;
        case 51: s.midi_clock_ignore = event.value >= 64; break;
        case 93: s.tap = event.value >= 64; break;
        case 100: s.expression = event.value; break;
        case 102: s.bypass = event.value >= 64; break;
        default: return prev;
      }

      return s;
    });
  }, []);

  useMIDIInput(handleMidiCC, deviceName);

  useEffect(() => {
    let mounted = true;

    async function loadState() {
      try {
        setIsLoading(true);
        const initialState = await getBillyStringsWombtoneState(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load Billy Strings Wombtone state:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load state');
          setState(createDefaultState());
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadState();
    return () => { mounted = false; };
  }, [deviceName]);

  useEffect(() => {
    if (state && originalPresetState && activePreset) {
      setIsDirty(JSON.stringify(state) !== JSON.stringify(originalPresetState));
    } else {
      setIsDirty(false);
    }
  }, [state, originalPresetState, activePreset]);

  const sendParam = useCallback(async (param: any) => {
    try {
      await sendBillyStringsWombtoneParameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  const setFeed = useCallback(async (v: number) => { setState(p => p ? { ...p, feed: v } : null); await sendParam({ Feed: v }); }, [sendParam]);
  const setVolume = useCallback(async (v: number) => { setState(p => p ? { ...p, volume: v } : null); await sendParam({ Volume: v }); }, [sendParam]);
  const setMix = useCallback(async (v: number) => { setState(p => p ? { ...p, mix: v } : null); await sendParam({ Mix: v }); }, [sendParam]);
  const setRate = useCallback(async (v: number) => { setState(p => p ? { ...p, rate: v } : null); await sendParam({ Rate: v }); }, [sendParam]);
  const setDepth = useCallback(async (v: number) => { setState(p => p ? { ...p, depth: v } : null); await sendParam({ Depth: v }); }, [sendParam]);
  const setForm = useCallback(async (v: number) => { setState(p => p ? { ...p, form: v } : null); await sendParam({ Form: v }); }, [sendParam]);
  const setRampSpeed = useCallback(async (v: number) => { setState(p => p ? { ...p, ramp_speed: v } : null); await sendParam({ RampSpeed: v }); }, [sendParam]);
  const setNoteDivision = useCallback(async (v: number) => { setState(p => p ? { ...p, note_division: v } : null); await sendParam({ NoteDivision: v }); }, [sendParam]);
  const setBypass = useCallback(async (v: boolean) => { setState(p => p ? { ...p, bypass: v } : null); await sendParam({ Bypass: v }); }, [sendParam]);
  const setTap = useCallback(async (v: boolean) => { setState(p => p ? { ...p, tap: v } : null); await sendParam({ Tap: v }); }, [sendParam]);
  const setMidiClockIgnore = useCallback(async (v: boolean) => { setState(p => p ? { ...p, midi_clock_ignore: v } : null); await sendParam({ MidiClockIgnore: v }); }, [sendParam]);
  const setExpression = useCallback(async (v: number) => { setState(p => p ? { ...p, expression: v } : null); await sendParam({ Expression: v }); }, [sendParam]);

  const loadPreset = useCallback(async (
    newState: BillyStringsWombtoneState,
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
        await recallBillyStringsWombtonePreset(deviceName, newState);
      }
    } catch (err) {
      console.error('Failed to load preset:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preset');
    }
  }, [deviceName]);

  const resetToPreset = useCallback(() => {
    if (originalPresetState) {
      loadPreset(originalPresetState, activePreset?.id, activePreset?.name);
    }
  }, [originalPresetState, activePreset, loadPreset]);

  const resetToPedalDefault = useCallback(() => {
    loadPreset(createDefaultState());
  }, [loadPreset]);

  const clearActivePreset = useCallback(() => {
    setActivePreset(null);
    setOriginalPresetState(null);
    setIsDirty(false);
  }, []);

  return {
    state, isLoading, error,
    setFeed, setVolume, setMix, setRate, setDepth, setForm, setRampSpeed,
    setNoteDivision, setBypass, setTap, setMidiClockIgnore, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  };
}
