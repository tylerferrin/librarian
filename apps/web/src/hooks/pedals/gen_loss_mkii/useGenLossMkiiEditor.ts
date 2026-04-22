// React hook for managing Chase Bliss Gen Loss MKII editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getGenLossState,
  sendGenLossParameter,
  recallGenLossPreset,
} from '@/lib/midi/pedals/gen-loss-mkii';
import type {
  GenLossMkiiState,
  TapeModel,
  DryMode,
  NoiseMode,
  AuxMode,
  SweepDirection,
  Polarity,
  InputGain,
  DspBypassMode,
} from '@/lib/midi/pedals/gen-loss-mkii';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UseGenLossMkiiEditorReturn {
  state: GenLossMkiiState | null;
  isLoading: boolean;
  error: string | null;

  // Main knobs
  setWow: (value: number) => Promise<void>;
  setVolume: (value: number) => Promise<void>;
  setModel: (model: TapeModel) => Promise<void>;
  setFlutter: (value: number) => Promise<void>;
  setSaturate: (value: number) => Promise<void>;
  setFailure: (value: number) => Promise<void>;
  setRampSpeed: (value: number) => Promise<void>;

  // Three-position toggles
  setDryMode: (mode: DryMode) => Promise<void>;
  setNoiseMode: (mode: NoiseMode) => Promise<void>;
  setAuxMode: (mode: AuxMode) => Promise<void>;

  // Footswitches
  setBypass: (value: boolean) => Promise<void>;
  setAuxSwitch: (value: boolean) => Promise<void>;
  setAltMode: (value: boolean) => Promise<void>;

  // DIP switches - Left bank
  setDipWow: (value: boolean) => Promise<void>;
  setDipFlutter: (value: boolean) => Promise<void>;
  setDipSatGen: (value: boolean) => Promise<void>;
  setDipFailureHp: (value: boolean) => Promise<void>;
  setDipModelLp: (value: boolean) => Promise<void>;
  setDipBounce: (value: boolean) => Promise<void>;
  setDipRandom: (value: boolean) => Promise<void>;
  setDipSweep: (direction: SweepDirection) => Promise<void>;

  // DIP switches - Right bank
  setDipPolarity: (polarity: Polarity) => Promise<void>;
  setDipClassic: (value: boolean) => Promise<void>;
  setDipMiso: (value: boolean) => Promise<void>;
  setDipSpread: (value: boolean) => Promise<void>;
  setDipDryType: (value: boolean) => Promise<void>;
  setDipDropByp: (value: boolean) => Promise<void>;
  setDipSnagByp: (value: boolean) => Promise<void>;
  setDipHumByp: (value: boolean) => Promise<void>;

  // Advanced
  setExpression: (value: number) => Promise<void>;
  setAuxOnsetTime: (value: number) => Promise<void>;
  setHissLevel: (value: number) => Promise<void>;
  setMechanicalNoise: (value: number) => Promise<void>;
  setCrinklePop: (value: number) => Promise<void>;
  setInputGain: (gain: InputGain) => Promise<void>;
  setDspBypass: (mode: DspBypassMode) => Promise<void>;
  setRampBounce: (value: boolean) => Promise<void>;

  // Preset management
  loadPreset: (state: GenLossMkiiState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

function tapeModelFromCC(value: number): TapeModel {
  if (value <= 7) return 'None';
  if (value <= 19) return 'CPR3300Gen1';
  if (value <= 28) return 'CPR3300Gen2';
  if (value <= 38) return 'CPR3300Gen3';
  if (value <= 48) return 'PortamaxRT';
  if (value <= 57) return 'PortamaxHT';
  if (value <= 67) return 'CAM8';
  if (value <= 77) return 'DictatronEX';
  if (value <= 86) return 'DictatronIN';
  if (value <= 96) return 'Fishy60';
  if (value <= 106) return 'MSWalker';
  if (value <= 119) return 'AMU2';
  return 'MPEX';
}

function dryModeFromCC(value: number): DryMode {
  if (value === 2) return 'Dry2';
  if (value === 3) return 'Dry3';
  return 'Dry1';
}

function noiseModeFromCC(value: number): NoiseMode {
  if (value === 2) return 'Noise2';
  if (value === 3) return 'Noise3';
  return 'Noise1';
}

function auxModeFromCC(value: number): AuxMode {
  if (value === 2) return 'Aux2';
  if (value === 3) return 'Aux3';
  return 'Aux1';
}

function createDefaultState(): GenLossMkiiState {
  return {
    wow: 64, volume: 100, model: 'None', flutter: 64,
    saturate: 64, failure: 0, ramp_speed: 64,
    dry_mode: 'Dry1', noise_mode: 'Noise1', aux_mode: 'Aux1',
    bypass: true, aux_switch: false, alt_mode: false,
    left_switch: false, center_switch: false, right_switch: false,
    dip_wow: false, dip_flutter: false, dip_sat_gen: false,
    dip_failure_hp: false, dip_model_lp: false, dip_bounce: false,
    dip_random: false, dip_sweep: 'Bottom',
    dip_polarity: 'Forward', dip_classic: false, dip_miso: false,
    dip_spread: false, dip_dry_type: false, dip_drop_byp: false,
    dip_snag_byp: false, dip_hum_byp: false,
    expression: 0, aux_onset_time: 64, hiss_level: 32,
    mechanical_noise: 32, crinkle_pop: 32,
    input_gain: 'InstrumentLevel', dsp_bypass: 'TrueBypass',
    ramp_bounce: false,
  };
}

export function useGenLossMkiiEditor(deviceName: string): UseGenLossMkiiEditorReturn {
  const [state, setState] = useState<GenLossMkiiState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preset tracking
  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<GenLossMkiiState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Handle incoming MIDI CC messages from the pedal
  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;
      const s = { ...prev };

      switch (event.cc_number) {
        // Main knobs
        case 14: s.wow = event.value; break;
        case 15: s.volume = event.value; break;
        case 16: s.model = tapeModelFromCC(event.value); break;
        case 17: s.flutter = event.value; break;
        case 18: s.saturate = event.value; break;
        case 19: s.failure = event.value; break;
        case 20: s.ramp_speed = event.value; break;

        // Toggles
        case 21: s.aux_mode = auxModeFromCC(event.value); break;
        case 22: s.dry_mode = dryModeFromCC(event.value); break;
        case 23: s.noise_mode = noiseModeFromCC(event.value); break;

        // Advanced
        case 24: s.aux_onset_time = event.value; break;
        case 26: s.dsp_bypass = event.value < 64 ? 'TrueBypass' : 'DspBypass'; break;
        case 27: s.hiss_level = event.value; break;
        case 28: s.mechanical_noise = event.value; break;
        case 29: s.crinkle_pop = event.value; break;
        case 32:
          if (event.value === 1) s.input_gain = 'LineLevel';
          else if (event.value === 2) s.input_gain = 'InstrumentLevel';
          else if (event.value === 3) s.input_gain = 'HighGain';
          break;
        case 52: s.ramp_bounce = event.value >= 64; break;

        // DIP switches - Left bank
        case 61: s.dip_wow = event.value >= 64; break;
        case 62: s.dip_flutter = event.value >= 64; break;
        case 63: s.dip_sat_gen = event.value >= 64; break;
        case 64: s.dip_failure_hp = event.value >= 64; break;
        case 65: s.dip_model_lp = event.value >= 64; break;
        case 66: s.dip_bounce = event.value >= 64; break;
        case 67: s.dip_random = event.value >= 64; break;
        case 68: s.dip_sweep = event.value < 64 ? 'Bottom' : 'Top'; break;

        // DIP switches - Right bank
        case 71: s.dip_polarity = event.value < 64 ? 'Forward' : 'Reverse'; break;
        case 72: s.dip_classic = event.value >= 64; break;
        case 73: s.dip_miso = event.value >= 64; break;
        case 74: s.dip_spread = event.value >= 64; break;
        case 75: s.dip_dry_type = event.value >= 64; break;
        case 76: s.dip_drop_byp = event.value >= 64; break;
        case 77: s.dip_snag_byp = event.value >= 64; break;
        case 78: s.dip_hum_byp = event.value >= 64; break;

        // Other
        case 100: s.expression = event.value; break;
        case 102: s.bypass = event.value >= 64; break;
        case 103: s.aux_switch = event.value >= 64; break;
        case 104: s.alt_mode = event.value >= 64; break;
        case 105: s.left_switch = event.value >= 64; break;
        case 106: s.center_switch = event.value >= 64; break;
        case 107: s.right_switch = event.value >= 64; break;

        default:
          return prev;
      }

      return s;
    });
  }, []);

  useMIDIInput(handleMidiCC, deviceName);

  // Load initial state
  useEffect(() => {
    let mounted = true;

    async function loadState() {
      try {
        setIsLoading(true);
        const initialState = await getGenLossState(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load Gen Loss MKII state:', err);
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

  // Dirty state tracking
  useEffect(() => {
    if (state && originalPresetState && activePreset) {
      setIsDirty(JSON.stringify(state) !== JSON.stringify(originalPresetState));
    } else {
      setIsDirty(false);
    }
  }, [state, originalPresetState, activePreset]);

  // Generic parameter sender
  const sendParam = useCallback(async (param: any) => {
    try {
      await sendGenLossParameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Main knobs
  const setWow = useCallback(async (v: number) => {
    setState(p => p ? { ...p, wow: v } : null);
    await sendParam({ Wow: v });
  }, [sendParam]);

  const setVolume = useCallback(async (v: number) => {
    setState(p => p ? { ...p, volume: v } : null);
    await sendParam({ Volume: v });
  }, [sendParam]);

  const setModel = useCallback(async (m: TapeModel) => {
    setState(p => p ? { ...p, model: m } : null);
    await sendParam({ Model: m });
  }, [sendParam]);

  const setFlutter = useCallback(async (v: number) => {
    setState(p => p ? { ...p, flutter: v } : null);
    await sendParam({ Flutter: v });
  }, [sendParam]);

  const setSaturate = useCallback(async (v: number) => {
    setState(p => p ? { ...p, saturate: v } : null);
    await sendParam({ Saturate: v });
  }, [sendParam]);

  const setFailure = useCallback(async (v: number) => {
    setState(p => p ? { ...p, failure: v } : null);
    await sendParam({ Failure: v });
  }, [sendParam]);

  const setRampSpeed = useCallback(async (v: number) => {
    setState(p => p ? { ...p, ramp_speed: v } : null);
    await sendParam({ RampSpeed: v });
  }, [sendParam]);

  // Three-position toggles
  const setDryMode = useCallback(async (m: DryMode) => {
    setState(p => p ? { ...p, dry_mode: m } : null);
    await sendParam({ DryMode: m });
  }, [sendParam]);

  const setNoiseMode = useCallback(async (m: NoiseMode) => {
    setState(p => p ? { ...p, noise_mode: m } : null);
    await sendParam({ NoiseMode: m });
  }, [sendParam]);

  const setAuxMode = useCallback(async (m: AuxMode) => {
    setState(p => p ? { ...p, aux_mode: m } : null);
    await sendParam({ AuxMode: m });
  }, [sendParam]);

  // Footswitches
  const setBypass = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, bypass: v } : null);
    await sendParam({ Bypass: v });
  }, [sendParam]);

  const setAuxSwitch = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, aux_switch: v } : null);
    await sendParam({ AuxSwitch: v });
  }, [sendParam]);

  const setAltMode = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, alt_mode: v } : null);
    await sendParam({ AltMode: v });
  }, [sendParam]);

  // DIP switches - Left bank
  const setDipWow = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_wow: v } : null);
    await sendParam({ DipWow: v });
  }, [sendParam]);

  const setDipFlutter = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_flutter: v } : null);
    await sendParam({ DipFlutter: v });
  }, [sendParam]);

  const setDipSatGen = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_sat_gen: v } : null);
    await sendParam({ DipSatGen: v });
  }, [sendParam]);

  const setDipFailureHp = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_failure_hp: v } : null);
    await sendParam({ DipFailureHp: v });
  }, [sendParam]);

  const setDipModelLp = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_model_lp: v } : null);
    await sendParam({ DipModelLp: v });
  }, [sendParam]);

  const setDipBounce = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_bounce: v } : null);
    await sendParam({ DipBounce: v });
  }, [sendParam]);

  const setDipRandom = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_random: v } : null);
    await sendParam({ DipRandom: v });
  }, [sendParam]);

  const setDipSweep = useCallback(async (d: SweepDirection) => {
    setState(p => p ? { ...p, dip_sweep: d } : null);
    await sendParam({ DipSweep: d });
  }, [sendParam]);

  // DIP switches - Right bank
  const setDipPolarity = useCallback(async (p: Polarity) => {
    setState(prev => prev ? { ...prev, dip_polarity: p } : null);
    await sendParam({ DipPolarity: p });
  }, [sendParam]);

  const setDipClassic = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_classic: v } : null);
    await sendParam({ DipClassic: v });
  }, [sendParam]);

  const setDipMiso = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_miso: v } : null);
    await sendParam({ DipMiso: v });
  }, [sendParam]);

  const setDipSpread = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_spread: v } : null);
    await sendParam({ DipSpread: v });
  }, [sendParam]);

  const setDipDryType = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_dry_type: v } : null);
    await sendParam({ DipDryType: v });
  }, [sendParam]);

  const setDipDropByp = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_drop_byp: v } : null);
    await sendParam({ DipDropByp: v });
  }, [sendParam]);

  const setDipSnagByp = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_snag_byp: v } : null);
    await sendParam({ DipSnagByp: v });
  }, [sendParam]);

  const setDipHumByp = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_hum_byp: v } : null);
    await sendParam({ DipHumByp: v });
  }, [sendParam]);

  // Advanced
  const setExpression = useCallback(async (v: number) => {
    setState(p => p ? { ...p, expression: v } : null);
    await sendParam({ Expression: v });
  }, [sendParam]);

  const setAuxOnsetTime = useCallback(async (v: number) => {
    setState(p => p ? { ...p, aux_onset_time: v } : null);
    await sendParam({ AuxOnsetTime: v });
  }, [sendParam]);

  const setHissLevel = useCallback(async (v: number) => {
    setState(p => p ? { ...p, hiss_level: v } : null);
    await sendParam({ HissLevel: v });
  }, [sendParam]);

  const setMechanicalNoise = useCallback(async (v: number) => {
    setState(p => p ? { ...p, mechanical_noise: v } : null);
    await sendParam({ MechanicalNoise: v });
  }, [sendParam]);

  const setCrinklePop = useCallback(async (v: number) => {
    setState(p => p ? { ...p, crinkle_pop: v } : null);
    await sendParam({ CrinklePop: v });
  }, [sendParam]);

  const setInputGain = useCallback(async (g: InputGain) => {
    setState(p => p ? { ...p, input_gain: g } : null);
    await sendParam({ InputGain: g });
  }, [sendParam]);

  const setDspBypass = useCallback(async (m: DspBypassMode) => {
    setState(p => p ? { ...p, dsp_bypass: m } : null);
    await sendParam({ DspBypass: m });
  }, [sendParam]);

  const setRampBounce = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, ramp_bounce: v } : null);
    await sendParam({ RampBounce: v });
  }, [sendParam]);

  // Preset management
  const loadPreset = useCallback(async (
    newState: GenLossMkiiState,
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
        await recallGenLossPreset(deviceName, newState);
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
    setWow, setVolume, setModel, setFlutter, setSaturate, setFailure, setRampSpeed,
    setDryMode, setNoiseMode, setAuxMode,
    setBypass, setAuxSwitch, setAltMode,
    setDipWow, setDipFlutter, setDipSatGen, setDipFailureHp,
    setDipModelLp, setDipBounce, setDipRandom, setDipSweep,
    setDipPolarity, setDipClassic, setDipMiso, setDipSpread,
    setDipDryType, setDipDropByp, setDipSnagByp, setDipHumByp,
    setExpression, setAuxOnsetTime, setHissLevel, setMechanicalNoise,
    setCrinklePop, setInputGain, setDspBypass, setRampBounce,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  };
}
