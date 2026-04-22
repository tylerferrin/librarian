// React hook for managing Chase Bliss Brothers AM editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getBrothersAmState,
  sendBrothersAmParameter,
  recallBrothersAmPreset,
} from '@/lib/midi/pedals/brothers-am';
import type {
  BrothersAmState,
  Gain2Type,
  TrebleBoost,
  Gain1Type,
  SweepDirection,
  Polarity,
} from '@/lib/midi/pedals/brothers-am';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UseBrothersAmEditorReturn {
  state: BrothersAmState | null;
  isLoading: boolean;
  error: string | null;

  // Channel 2 knobs
  setGain2: (value: number) => Promise<void>;
  setVolume2: (value: number) => Promise<void>;
  setTone2: (value: number) => Promise<void>;
  setPresence2: (value: number) => Promise<void>;

  // Channel 1 knobs
  setGain1: (value: number) => Promise<void>;
  setVolume1: (value: number) => Promise<void>;
  setTone1: (value: number) => Promise<void>;
  setPresence1: (value: number) => Promise<void>;

  // Three-position selectors
  setGain2Type: (type: Gain2Type) => Promise<void>;
  setTrebleBoost: (boost: TrebleBoost) => Promise<void>;
  setGain1Type: (type: Gain1Type) => Promise<void>;

  // Channel bypass
  setChannel1Bypass: (value: boolean) => Promise<void>;
  setChannel2Bypass: (value: boolean) => Promise<void>;

  // DIP switches - Left bank
  setDipVolume1: (value: boolean) => Promise<void>;
  setDipVolume2: (value: boolean) => Promise<void>;
  setDipGain1: (value: boolean) => Promise<void>;
  setDipGain2: (value: boolean) => Promise<void>;
  setDipTone1: (value: boolean) => Promise<void>;
  setDipTone2: (value: boolean) => Promise<void>;
  setDipSweep: (direction: SweepDirection) => Promise<void>;
  setDipPolarity: (polarity: Polarity) => Promise<void>;

  // DIP switches - Right bank
  setDipHiGain1: (value: boolean) => Promise<void>;
  setDipHiGain2: (value: boolean) => Promise<void>;
  setDipMotoByp1: (value: boolean) => Promise<void>;
  setDipMotoByp2: (value: boolean) => Promise<void>;
  setDipPresLink1: (value: boolean) => Promise<void>;
  setDipPresLink2: (value: boolean) => Promise<void>;
  setDipMaster: (value: boolean) => Promise<void>;

  // Expression
  setExpression: (value: number) => Promise<void>;

  // Preset management
  loadPreset: (state: BrothersAmState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

// CC 21: 1=Boost, 2=OD, 3=Dist
function gain2TypeFromCC(value: number): Gain2Type {
  if (value === 2) return 'OD';
  if (value === 3) return 'Dist';
  return 'Boost';
}

// CC 22: 1=FullSun, 2=Off, 3=HalfSun
function trebleBoostFromCC(value: number): TrebleBoost {
  if (value === 2) return 'Off';
  if (value === 3) return 'HalfSun';
  return 'FullSun';
}

// CC 23: 1=Dist, 2=OD, 3=Boost
function gain1TypeFromCC(value: number): Gain1Type {
  if (value === 2) return 'OD';
  if (value === 3) return 'Boost';
  return 'Dist';
}

function createDefaultState(): BrothersAmState {
  return {
    gain2: 64, volume2: 64, tone2: 64, presence2: 64,
    gain1: 64, volume1: 64, tone1: 64, presence1: 64,
    gain2_type: 'OD', treble_boost: 'Off', gain1_type: 'OD',
    channel1_bypass: true, channel2_bypass: true,
    dip_volume1: false, dip_volume2: false,
    dip_gain1: false, dip_gain2: false,
    dip_tone1: false, dip_tone2: false,
    dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_hi_gain1: false, dip_hi_gain2: false,
    dip_moto_byp1: false, dip_moto_byp2: false,
    dip_pres_link1: false, dip_pres_link2: false,
    dip_master: false,
    expression: 0,
  };
}

export function useBrothersAmEditor(deviceName: string): UseBrothersAmEditorReturn {
  const [state, setState] = useState<BrothersAmState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<BrothersAmState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;
      const s = { ...prev };

      switch (event.cc_number) {
        // Channel 2 knobs
        case 14: s.gain2 = event.value; break;
        case 15: s.volume2 = event.value; break;
        case 17: s.tone2 = event.value; break;
        case 27: s.presence2 = event.value; break;
        // Channel 1 knobs
        case 16: s.gain1 = event.value; break;
        case 18: s.volume1 = event.value; break;
        case 19: s.tone1 = event.value; break;
        case 29: s.presence1 = event.value; break;
        // Three-position selectors
        case 21: s.gain2_type = gain2TypeFromCC(event.value); break;
        case 22: s.treble_boost = trebleBoostFromCC(event.value); break;
        case 23: s.gain1_type = gain1TypeFromCC(event.value); break;
        // DIP switches - Left bank
        case 61: s.dip_volume1 = event.value >= 64; break;
        case 62: s.dip_volume2 = event.value >= 64; break;
        case 63: s.dip_gain1 = event.value >= 64; break;
        case 64: s.dip_gain2 = event.value >= 64; break;
        case 65: s.dip_tone1 = event.value >= 64; break;
        case 66: s.dip_tone2 = event.value >= 64; break;
        case 67: s.dip_sweep = event.value < 1 ? 'Bottom' : 'Top'; break;
        case 68: s.dip_polarity = event.value < 1 ? 'Forward' : 'Reverse'; break;
        // DIP switches - Right bank
        case 71: s.dip_hi_gain1 = event.value >= 64; break;
        case 72: s.dip_hi_gain2 = event.value >= 64; break;
        case 73: s.dip_moto_byp1 = event.value >= 64; break;
        case 74: s.dip_moto_byp2 = event.value >= 64; break;
        case 75: s.dip_pres_link1 = event.value >= 64; break;
        case 76: s.dip_pres_link2 = event.value >= 64; break;
        case 77: s.dip_master = event.value >= 64; break;
        // Expression and bypass
        case 100: s.expression = event.value; break;
        case 102: s.channel1_bypass = event.value >= 64; break;
        case 103: s.channel2_bypass = event.value >= 64; break;
        default:
          return prev;
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
        const initialState = await getBrothersAmState(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load Brothers AM state:', err);
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
      await sendBrothersAmParameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Channel 2 knobs
  const setGain2 = useCallback(async (v: number) => {
    setState(p => p ? { ...p, gain2: v } : null);
    await sendParam({ Gain2: v });
  }, [sendParam]);

  const setVolume2 = useCallback(async (v: number) => {
    setState(p => p ? { ...p, volume2: v } : null);
    await sendParam({ Volume2: v });
  }, [sendParam]);

  const setTone2 = useCallback(async (v: number) => {
    setState(p => p ? { ...p, tone2: v } : null);
    await sendParam({ Tone2: v });
  }, [sendParam]);

  const setPresence2 = useCallback(async (v: number) => {
    setState(p => p ? { ...p, presence2: v } : null);
    await sendParam({ Presence2: v });
  }, [sendParam]);

  // Channel 1 knobs
  const setGain1 = useCallback(async (v: number) => {
    setState(p => p ? { ...p, gain1: v } : null);
    await sendParam({ Gain1: v });
  }, [sendParam]);

  const setVolume1 = useCallback(async (v: number) => {
    setState(p => p ? { ...p, volume1: v } : null);
    await sendParam({ Volume1: v });
  }, [sendParam]);

  const setTone1 = useCallback(async (v: number) => {
    setState(p => p ? { ...p, tone1: v } : null);
    await sendParam({ Tone1: v });
  }, [sendParam]);

  const setPresence1 = useCallback(async (v: number) => {
    setState(p => p ? { ...p, presence1: v } : null);
    await sendParam({ Presence1: v });
  }, [sendParam]);

  // Three-position selectors
  const setGain2Type = useCallback(async (t: Gain2Type) => {
    setState(p => p ? { ...p, gain2_type: t } : null);
    await sendParam({ Gain2Type: t });
  }, [sendParam]);

  const setTrebleBoost = useCallback(async (b: TrebleBoost) => {
    setState(p => p ? { ...p, treble_boost: b } : null);
    await sendParam({ TrebleBoost: b });
  }, [sendParam]);

  const setGain1Type = useCallback(async (t: Gain1Type) => {
    setState(p => p ? { ...p, gain1_type: t } : null);
    await sendParam({ Gain1Type: t });
  }, [sendParam]);

  // Channel bypass
  const setChannel1Bypass = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, channel1_bypass: v } : null);
    await sendParam({ Channel1Bypass: v });
  }, [sendParam]);

  const setChannel2Bypass = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, channel2_bypass: v } : null);
    await sendParam({ Channel2Bypass: v });
  }, [sendParam]);

  // DIP switches - Left bank
  const setDipVolume1 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_volume1: v } : null);
    await sendParam({ DipVolume1: v });
  }, [sendParam]);

  const setDipVolume2 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_volume2: v } : null);
    await sendParam({ DipVolume2: v });
  }, [sendParam]);

  const setDipGain1 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_gain1: v } : null);
    await sendParam({ DipGain1: v });
  }, [sendParam]);

  const setDipGain2 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_gain2: v } : null);
    await sendParam({ DipGain2: v });
  }, [sendParam]);

  const setDipTone1 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_tone1: v } : null);
    await sendParam({ DipTone1: v });
  }, [sendParam]);

  const setDipTone2 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_tone2: v } : null);
    await sendParam({ DipTone2: v });
  }, [sendParam]);

  const setDipSweep = useCallback(async (d: SweepDirection) => {
    setState(p => p ? { ...p, dip_sweep: d } : null);
    await sendParam({ DipSweep: d });
  }, [sendParam]);

  const setDipPolarity = useCallback(async (pol: Polarity) => {
    setState(prev => prev ? { ...prev, dip_polarity: pol } : null);
    await sendParam({ DipPolarity: pol });
  }, [sendParam]);

  // DIP switches - Right bank
  const setDipHiGain1 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_hi_gain1: v } : null);
    await sendParam({ DipHiGain1: v });
  }, [sendParam]);

  const setDipHiGain2 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_hi_gain2: v } : null);
    await sendParam({ DipHiGain2: v });
  }, [sendParam]);

  const setDipMotoByp1 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_moto_byp1: v } : null);
    await sendParam({ DipMotoByp1: v });
  }, [sendParam]);

  const setDipMotoByp2 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_moto_byp2: v } : null);
    await sendParam({ DipMotoByp2: v });
  }, [sendParam]);

  const setDipPresLink1 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_pres_link1: v } : null);
    await sendParam({ DipPresLink1: v });
  }, [sendParam]);

  const setDipPresLink2 = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_pres_link2: v } : null);
    await sendParam({ DipPresLink2: v });
  }, [sendParam]);

  const setDipMaster = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_master: v } : null);
    await sendParam({ DipMaster: v });
  }, [sendParam]);

  // Expression
  const setExpression = useCallback(async (v: number) => {
    setState(p => p ? { ...p, expression: v } : null);
    await sendParam({ Expression: v });
  }, [sendParam]);

  // Preset management
  const loadPreset = useCallback(async (
    newState: BrothersAmState,
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
        await recallBrothersAmPreset(deviceName, newState);
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
    setGain2, setVolume2, setTone2, setPresence2,
    setGain1, setVolume1, setTone1, setPresence1,
    setGain2Type, setTrebleBoost, setGain1Type,
    setChannel1Bypass, setChannel2Bypass,
    setDipVolume1, setDipVolume2, setDipGain1, setDipGain2,
    setDipTone1, setDipTone2, setDipSweep, setDipPolarity,
    setDipHiGain1, setDipHiGain2, setDipMotoByp1, setDipMotoByp2,
    setDipPresLink1, setDipPresLink2, setDipMaster,
    setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  };
}
