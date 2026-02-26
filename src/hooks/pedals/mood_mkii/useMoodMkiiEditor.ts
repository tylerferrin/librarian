// React hook for managing Chase Bliss Mood MkII editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getMoodMkiiState,
  sendMoodMkiiParameter,
  recallMoodMkiiPreset,
} from '@/lib/midi/pedals/mood-mkii';
import type {
  MoodMkiiState,
  WetChannelRouting,
  MoodRouting,
  MicroLooper,
  MoodSync,
  MoodSpread,
  SweepDirection,
  Polarity,
} from '@/lib/midi/pedals/mood-mkii';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UseMoodMkiiEditorReturn {
  state: MoodMkiiState | null;
  isLoading: boolean;
  error: string | null;

  // Main knobs
  setTime: (value: number) => Promise<void>;
  setMix: (value: number) => Promise<void>;
  setLength: (value: number) => Promise<void>;
  setModifyWet: (value: number) => Promise<void>;
  setClock: (value: number) => Promise<void>;
  setModifyLooper: (value: number) => Promise<void>;
  setRampSpeed: (value: number) => Promise<void>;

  // Toggles
  setWetChannelRouting: (v: WetChannelRouting) => Promise<void>;
  setRouting: (v: MoodRouting) => Promise<void>;
  setMicroLooper: (v: MicroLooper) => Promise<void>;

  // Hidden knobs
  setStereoWidth: (value: number) => Promise<void>;
  setRampingWaveform: (value: number) => Promise<void>;
  setFade: (value: number) => Promise<void>;
  setTone: (value: number) => Promise<void>;
  setLevelBalance: (value: number) => Promise<void>;
  setDirectMicroLoop: (value: number) => Promise<void>;

  // Sync / spread / buffer
  setSync: (v: MoodSync) => Promise<void>;
  setSpread: (v: MoodSpread) => Promise<void>;
  setBufferLength: (v: boolean) => Promise<void>;

  // Footswitches
  setBypassLeft: (v: boolean) => Promise<void>;
  setBypassRight: (v: boolean) => Promise<void>;
  setHiddenMenu: (v: boolean) => Promise<void>;
  setFreeze: (v: boolean) => Promise<void>;
  setOverdub: (v: boolean) => Promise<void>;

  // DIP switches - Left bank
  setDipTime: (v: boolean) => Promise<void>;
  setDipModifyWet: (v: boolean) => Promise<void>;
  setDipClock: (v: boolean) => Promise<void>;
  setDipModifyLooper: (v: boolean) => Promise<void>;
  setDipLength: (v: boolean) => Promise<void>;
  setDipBounce: (v: boolean) => Promise<void>;
  setDipSweep: (v: SweepDirection) => Promise<void>;
  setDipPolarity: (v: Polarity) => Promise<void>;

  // DIP switches - Right bank
  setDipClassic: (v: boolean) => Promise<void>;
  setDipMiso: (v: boolean) => Promise<void>;
  setDipSpread: (v: boolean) => Promise<void>;
  setDipDryKill: (v: boolean) => Promise<void>;
  setDipTrails: (v: boolean) => Promise<void>;
  setDipLatch: (v: boolean) => Promise<void>;
  setDipNoDub: (v: boolean) => Promise<void>;
  setDipSmooth: (v: boolean) => Promise<void>;

  // Advanced
  setMidiClockIgnore: (v: boolean) => Promise<void>;
  setRampBounce: (v: boolean) => Promise<void>;
  setExpression: (value: number) => Promise<void>;

  // Preset management
  loadPreset: (state: MoodMkiiState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

function wetChannelRoutingFromCC(value: number): WetChannelRouting {
  if (value === 2) return 'Delay';
  if (value === 3) return 'Slip';
  return 'Reverb';
}

function moodRoutingFromCC(value: number): MoodRouting {
  if (value === 2) return 'Mid';
  if (value === 3) return 'Env';
  return 'Lfo';
}

function microLooperFromCC(value: number): MicroLooper {
  if (value === 2) return 'Tape';
  if (value === 3) return 'Stretch';
  return 'Env';
}

function moodSyncFromCC(value: number): MoodSync {
  if (value === 2) return 'NoSync';
  if (value === 3) return 'Auto';
  return 'On';
}

function moodSpreadFromCC(value: number): MoodSpread {
  if (value === 2) return 'Both';
  if (value === 3) return 'OnlyAlt';
  return 'Only';
}

function createDefaultState(): MoodMkiiState {
  return {
    time: 64, mix: 64, length: 64, modify_wet: 64, clock: 64,
    modify_looper: 64, ramp_speed: 64,
    wet_channel_routing: 'Reverb', routing: 'Lfo', micro_looper: 'Env',
    stereo_width: 64, ramping_waveform: 64, fade: 64, tone: 64,
    level_balance: 64, direct_micro_loop: 64,
    sync: 'On', spread: 'Only', buffer_length: false,
    bypass_left: true, bypass_right: true,
    hidden_menu: false, freeze: false, overdub: false,
    dip_time: false, dip_modify_wet: false, dip_clock: false,
    dip_modify_looper: false, dip_length: false, dip_bounce: false,
    dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_classic: false, dip_miso: false, dip_spread: false,
    dip_dry_kill: false, dip_trails: false, dip_latch: false,
    dip_no_dub: false, dip_smooth: false,
    midi_clock_ignore: false, ramp_bounce: false, expression: 0,
  };
}

export function useMoodMkiiEditor(deviceName: string): UseMoodMkiiEditorReturn {
  const [state, setState] = useState<MoodMkiiState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<MoodMkiiState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;
      const s = { ...prev };

      switch (event.cc_number) {
        case 14: s.time = event.value; break;
        case 15: s.mix = event.value; break;
        case 16: s.length = event.value; break;
        case 17: s.modify_wet = event.value; break;
        case 18: s.clock = event.value; break;
        case 19: s.modify_looper = event.value; break;
        case 20: s.ramp_speed = event.value; break;
        case 21: s.wet_channel_routing = wetChannelRoutingFromCC(event.value); break;
        case 22: s.routing = moodRoutingFromCC(event.value); break;
        case 23: s.micro_looper = microLooperFromCC(event.value); break;
        case 24: s.stereo_width = event.value; break;
        case 25: s.ramping_waveform = event.value; break;
        case 26: s.fade = event.value; break;
        case 27: s.tone = event.value; break;
        case 28: s.level_balance = event.value; break;
        case 29: s.direct_micro_loop = event.value; break;
        case 31: s.sync = moodSyncFromCC(event.value); break;
        case 32: s.spread = moodSpreadFromCC(event.value); break;
        case 33: s.buffer_length = event.value >= 2; break;
        case 51: s.midi_clock_ignore = event.value >= 64; break;
        case 52: s.ramp_bounce = event.value >= 64; break;
        case 61: s.dip_time = event.value >= 64; break;
        case 62: s.dip_modify_wet = event.value >= 64; break;
        case 63: s.dip_clock = event.value >= 64; break;
        case 64: s.dip_modify_looper = event.value >= 64; break;
        case 65: s.dip_length = event.value >= 64; break;
        case 66: s.dip_bounce = event.value >= 64; break;
        case 67: s.dip_sweep = event.value < 1 ? 'Bottom' : 'Top'; break;
        case 68: s.dip_polarity = event.value < 1 ? 'Forward' : 'Reverse'; break;
        case 71: s.dip_classic = event.value >= 64; break;
        case 72: s.dip_miso = event.value >= 64; break;
        case 73: s.dip_spread = event.value >= 64; break;
        case 74: s.dip_dry_kill = event.value >= 64; break;
        case 75: s.dip_trails = event.value >= 64; break;
        case 76: s.dip_latch = event.value >= 64; break;
        case 77: s.dip_no_dub = event.value >= 64; break;
        case 78: s.dip_smooth = event.value >= 64; break;
        case 100: s.expression = event.value; break;
        case 102: s.bypass_left = event.value >= 64; break;
        case 103: s.bypass_right = event.value >= 64; break;
        case 104: s.hidden_menu = event.value >= 64; break;
        case 105: s.freeze = event.value >= 64; break;
        case 106: s.overdub = event.value >= 64; break;
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
        const initialState = await getMoodMkiiState(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load Mood MkII state:', err);
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
      await sendMoodMkiiParameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Main knobs
  const setTime = useCallback(async (v: number) => { setState(p => p ? { ...p, time: v } : null); await sendParam({ Time: v }); }, [sendParam]);
  const setMix = useCallback(async (v: number) => { setState(p => p ? { ...p, mix: v } : null); await sendParam({ Mix: v }); }, [sendParam]);
  const setLength = useCallback(async (v: number) => { setState(p => p ? { ...p, length: v } : null); await sendParam({ Length: v }); }, [sendParam]);
  const setModifyWet = useCallback(async (v: number) => { setState(p => p ? { ...p, modify_wet: v } : null); await sendParam({ ModifyWet: v }); }, [sendParam]);
  const setClock = useCallback(async (v: number) => { setState(p => p ? { ...p, clock: v } : null); await sendParam({ Clock: v }); }, [sendParam]);
  const setModifyLooper = useCallback(async (v: number) => { setState(p => p ? { ...p, modify_looper: v } : null); await sendParam({ ModifyLooper: v }); }, [sendParam]);
  const setRampSpeed = useCallback(async (v: number) => { setState(p => p ? { ...p, ramp_speed: v } : null); await sendParam({ RampSpeed: v }); }, [sendParam]);

  // Toggles
  const setWetChannelRouting = useCallback(async (v: WetChannelRouting) => { setState(p => p ? { ...p, wet_channel_routing: v } : null); await sendParam({ WetChannelRouting: v }); }, [sendParam]);
  const setRouting = useCallback(async (v: MoodRouting) => { setState(p => p ? { ...p, routing: v } : null); await sendParam({ Routing: v }); }, [sendParam]);
  const setMicroLooper = useCallback(async (v: MicroLooper) => { setState(p => p ? { ...p, micro_looper: v } : null); await sendParam({ MicroLooper: v }); }, [sendParam]);

  // Hidden knobs
  const setStereoWidth = useCallback(async (v: number) => { setState(p => p ? { ...p, stereo_width: v } : null); await sendParam({ StereoWidth: v }); }, [sendParam]);
  const setRampingWaveform = useCallback(async (v: number) => { setState(p => p ? { ...p, ramping_waveform: v } : null); await sendParam({ RampingWaveform: v }); }, [sendParam]);
  const setFade = useCallback(async (v: number) => { setState(p => p ? { ...p, fade: v } : null); await sendParam({ Fade: v }); }, [sendParam]);
  const setTone = useCallback(async (v: number) => { setState(p => p ? { ...p, tone: v } : null); await sendParam({ Tone: v }); }, [sendParam]);
  const setLevelBalance = useCallback(async (v: number) => { setState(p => p ? { ...p, level_balance: v } : null); await sendParam({ LevelBalance: v }); }, [sendParam]);
  const setDirectMicroLoop = useCallback(async (v: number) => { setState(p => p ? { ...p, direct_micro_loop: v } : null); await sendParam({ DirectMicroLoop: v }); }, [sendParam]);

  // Sync / spread / buffer
  const setSync = useCallback(async (v: MoodSync) => { setState(p => p ? { ...p, sync: v } : null); await sendParam({ Sync: v }); }, [sendParam]);
  const setSpread = useCallback(async (v: MoodSpread) => { setState(p => p ? { ...p, spread: v } : null); await sendParam({ Spread: v }); }, [sendParam]);
  const setBufferLength = useCallback(async (v: boolean) => { setState(p => p ? { ...p, buffer_length: v } : null); await sendParam({ BufferLength: v }); }, [sendParam]);

  // Footswitches
  const setBypassLeft = useCallback(async (v: boolean) => { setState(p => p ? { ...p, bypass_left: v } : null); await sendParam({ BypassLeft: v }); }, [sendParam]);
  const setBypassRight = useCallback(async (v: boolean) => { setState(p => p ? { ...p, bypass_right: v } : null); await sendParam({ BypassRight: v }); }, [sendParam]);
  const setHiddenMenu = useCallback(async (v: boolean) => { setState(p => p ? { ...p, hidden_menu: v } : null); await sendParam({ HiddenMenu: v }); }, [sendParam]);
  const setFreeze = useCallback(async (v: boolean) => { setState(p => p ? { ...p, freeze: v } : null); await sendParam({ Freeze: v }); }, [sendParam]);
  const setOverdub = useCallback(async (v: boolean) => { setState(p => p ? { ...p, overdub: v } : null); await sendParam({ Overdub: v }); }, [sendParam]);

  // DIP switches - Left bank
  const setDipTime = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_time: v } : null); await sendParam({ DipTime: v }); }, [sendParam]);
  const setDipModifyWet = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_modify_wet: v } : null); await sendParam({ DipModifyWet: v }); }, [sendParam]);
  const setDipClock = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_clock: v } : null); await sendParam({ DipClock: v }); }, [sendParam]);
  const setDipModifyLooper = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_modify_looper: v } : null); await sendParam({ DipModifyLooper: v }); }, [sendParam]);
  const setDipLength = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_length: v } : null); await sendParam({ DipLength: v }); }, [sendParam]);
  const setDipBounce = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_bounce: v } : null); await sendParam({ DipBounce: v }); }, [sendParam]);
  const setDipSweep = useCallback(async (v: SweepDirection) => { setState(p => p ? { ...p, dip_sweep: v } : null); await sendParam({ DipSweep: v }); }, [sendParam]);
  const setDipPolarity = useCallback(async (v: Polarity) => { setState(p => p ? { ...p, dip_polarity: v } : null); await sendParam({ DipPolarity: v }); }, [sendParam]);

  // DIP switches - Right bank
  const setDipClassic = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_classic: v } : null); await sendParam({ DipClassic: v }); }, [sendParam]);
  const setDipMiso = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_miso: v } : null); await sendParam({ DipMiso: v }); }, [sendParam]);
  const setDipSpread = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_spread: v } : null); await sendParam({ DipSpread: v }); }, [sendParam]);
  const setDipDryKill = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_dry_kill: v } : null); await sendParam({ DipDryKill: v }); }, [sendParam]);
  const setDipTrails = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_trails: v } : null); await sendParam({ DipTrails: v }); }, [sendParam]);
  const setDipLatch = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_latch: v } : null); await sendParam({ DipLatch: v }); }, [sendParam]);
  const setDipNoDub = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_no_dub: v } : null); await sendParam({ DipNoDub: v }); }, [sendParam]);
  const setDipSmooth = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_smooth: v } : null); await sendParam({ DipSmooth: v }); }, [sendParam]);

  // Advanced
  const setMidiClockIgnore = useCallback(async (v: boolean) => { setState(p => p ? { ...p, midi_clock_ignore: v } : null); await sendParam({ MidiClockIgnore: v }); }, [sendParam]);
  const setRampBounce = useCallback(async (v: boolean) => { setState(p => p ? { ...p, ramp_bounce: v } : null); await sendParam({ RampBounce: v }); }, [sendParam]);
  const setExpression = useCallback(async (v: number) => { setState(p => p ? { ...p, expression: v } : null); await sendParam({ Expression: v }); }, [sendParam]);

  // Preset management
  const loadPreset = useCallback(async (
    newState: MoodMkiiState,
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
        await recallMoodMkiiPreset(deviceName, newState);
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
    setTime, setMix, setLength, setModifyWet, setClock, setModifyLooper, setRampSpeed,
    setWetChannelRouting, setRouting, setMicroLooper,
    setStereoWidth, setRampingWaveform, setFade, setTone, setLevelBalance, setDirectMicroLoop,
    setSync, setSpread, setBufferLength,
    setBypassLeft, setBypassRight, setHiddenMenu, setFreeze, setOverdub,
    setDipTime, setDipModifyWet, setDipClock, setDipModifyLooper, setDipLength,
    setDipBounce, setDipSweep, setDipPolarity,
    setDipClassic, setDipMiso, setDipSpread, setDipDryKill, setDipTrails,
    setDipLatch, setDipNoDub, setDipSmooth,
    setMidiClockIgnore, setRampBounce, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  };
}
