// React hook for managing Chase Bliss Reverse Mode C editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getReverseModeCState,
  sendReverseModeCParameter,
  recallReverseModeCPreset,
} from '@/lib/midi/pedals/reverse-mode-c';
import type {
  ReverseModeCState,
  ModSync,
  ModType,
  SequenceMode,
  OctaveType,
  SweepDirection,
  Polarity,
} from '@/lib/midi/pedals/reverse-mode-c';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UseReverseModeCEditorReturn {
  state: ReverseModeCState | null;
  isLoading: boolean;
  error: string | null;

  // Main knobs
  setTime: (value: number) => Promise<void>;
  setMix: (value: number) => Promise<void>;
  setFeedback: (value: number) => Promise<void>;
  setOffset: (value: number) => Promise<void>;
  setBalance: (value: number) => Promise<void>;
  setFilter: (value: number) => Promise<void>;
  setRampSpeed: (value: number) => Promise<void>;

  // Three-position selectors
  setModSync: (sync: ModSync) => Promise<void>;
  setModType: (type: ModType) => Promise<void>;
  setSequenceMode: (mode: SequenceMode) => Promise<void>;

  // Alt knobs
  setSequencerSubdivision: (value: number) => Promise<void>;
  setRampingWaveform: (value: number) => Promise<void>;
  setModDepth: (value: number) => Promise<void>;
  setModRate: (value: number) => Promise<void>;

  // Octave and spacing
  setOctaveType: (type: OctaveType) => Promise<void>;
  setSequenceSpacing: (value: boolean) => Promise<void>;

  // Footswitches
  setBypass: (value: boolean) => Promise<void>;
  setTap: (value: boolean) => Promise<void>;
  setAltMode: (value: boolean) => Promise<void>;
  setFreeze: (value: boolean) => Promise<void>;
  setHalfSpeed: (value: boolean) => Promise<void>;

  // DIP switches - Left bank
  setDipTime: (value: boolean) => Promise<void>;
  setDipOffset: (value: boolean) => Promise<void>;
  setDipBalance: (value: boolean) => Promise<void>;
  setDipFilter: (value: boolean) => Promise<void>;
  setDipFeed: (value: boolean) => Promise<void>;
  setDipBounce: (value: boolean) => Promise<void>;
  setDipSweep: (direction: SweepDirection) => Promise<void>;
  setDipPolarity: (polarity: Polarity) => Promise<void>;

  // DIP switches - Right bank
  setDipSwap: (value: boolean) => Promise<void>;
  setDipMiso: (value: boolean) => Promise<void>;
  setDipSpread: (value: boolean) => Promise<void>;
  setDipTrails: (value: boolean) => Promise<void>;
  setDipLatch: (value: boolean) => Promise<void>;
  setDipFeedType: (value: boolean) => Promise<void>;
  setDipFadeType: (value: boolean) => Promise<void>;
  setDipModType: (value: boolean) => Promise<void>;

  // Advanced
  setMidiClockIgnore: (value: boolean) => Promise<void>;
  setRampBounce: (value: boolean) => Promise<void>;
  setDryKill: (value: boolean) => Promise<void>;
  setExpression: (value: number) => Promise<void>;

  // Preset management
  loadPreset: (state: ReverseModeCState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

// CC 21: 1=Sync, 2=Off, 3=Free
function modSyncFromCC(value: number): ModSync {
  if (value === 2) return 'Off';
  if (value === 3) return 'Free';
  return 'Sync';
}

// CC 22: 1=Vib, 2=Trem, 3=Freq
function modTypeFromCC(value: number): ModType {
  if (value === 2) return 'Trem';
  if (value === 3) return 'Freq';
  return 'Vib';
}

// CC 23: 1=Run, 2=Off, 3=Env
function sequenceModeFromCC(value: number): SequenceMode {
  if (value === 2) return 'Off';
  if (value === 3) return 'Env';
  return 'Run';
}

// CC 31: 1=OctDown, 2=BothOct, 3=OctUp
function octaveTypeFromCC(value: number): OctaveType {
  if (value === 2) return 'BothOct';
  if (value === 3) return 'OctUp';
  return 'OctDown';
}

function createDefaultState(): ReverseModeCState {
  return {
    time: 64, mix: 64, feedback: 64, offset: 64,
    balance: 64, filter: 64, ramp_speed: 64,
    mod_sync: 'Off', mod_type: 'Vib', sequence_mode: 'Off',
    sequencer_subdivision: 64, ramping_waveform: 0,
    mod_depth: 0, mod_rate: 64,
    octave_type: 'OctDown', sequence_spacing: false,
    bypass: true, tap: false, alt_mode: false, freeze: false, half_speed: false,
    dip_time: false, dip_offset: false, dip_balance: false, dip_filter: false,
    dip_feed: false, dip_bounce: false,
    dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_swap: false, dip_miso: false, dip_spread: false, dip_trails: false,
    dip_latch: false, dip_feed_type: false, dip_fade_type: false, dip_mod_type: false,
    midi_clock_ignore: false, ramp_bounce: false, dry_kill: false, expression: 0,
  };
}

export function useReverseModeCEditor(deviceName: string): UseReverseModeCEditorReturn {
  const [state, setState] = useState<ReverseModeCState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<ReverseModeCState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;
      const s = { ...prev };

      switch (event.cc_number) {
        // Main knobs
        case 14: s.time = event.value; break;
        case 15: s.mix = event.value; break;
        case 16: s.feedback = event.value; break;
        case 17: s.offset = event.value; break;
        case 18: s.balance = event.value; break;
        case 19: s.filter = event.value; break;
        case 20: s.ramp_speed = event.value; break;
        // Three-position selectors
        case 21: s.mod_sync = modSyncFromCC(event.value); break;
        case 22: s.mod_type = modTypeFromCC(event.value); break;
        case 23: s.sequence_mode = sequenceModeFromCC(event.value); break;
        // Alt knobs
        case 24: s.sequencer_subdivision = event.value; break;
        case 25: s.ramping_waveform = event.value; break;
        case 27: s.mod_depth = event.value; break;
        case 28: s.mod_rate = event.value; break;
        // Octave and spacing
        case 31: s.octave_type = octaveTypeFromCC(event.value); break;
        case 33: s.sequence_spacing = event.value >= 2; break;
        // Advanced
        case 51: s.midi_clock_ignore = event.value >= 64; break;
        case 52: s.ramp_bounce = event.value >= 64; break;
        case 57: s.dry_kill = event.value >= 64; break;
        // DIP switches - Left bank
        case 61: s.dip_time = event.value >= 64; break;
        case 62: s.dip_offset = event.value >= 64; break;
        case 63: s.dip_balance = event.value >= 64; break;
        case 64: s.dip_filter = event.value >= 64; break;
        case 65: s.dip_feed = event.value >= 64; break;
        case 66: s.dip_bounce = event.value >= 64; break;
        case 67: s.dip_sweep = event.value < 1 ? 'Bottom' : 'Top'; break;
        case 68: s.dip_polarity = event.value < 1 ? 'Forward' : 'Reverse'; break;
        // DIP switches - Right bank
        case 71: s.dip_swap = event.value >= 64; break;
        case 72: s.dip_miso = event.value >= 64; break;
        case 73: s.dip_spread = event.value >= 64; break;
        case 74: s.dip_trails = event.value >= 64; break;
        case 75: s.dip_latch = event.value >= 64; break;
        case 76: s.dip_feed_type = event.value >= 64; break;
        case 77: s.dip_fade_type = event.value >= 64; break;
        case 78: s.dip_mod_type = event.value >= 64; break;
        // Expression and footswitches
        case 100: s.expression = event.value; break;
        case 102: s.bypass = event.value >= 64; break;
        case 103: s.tap = event.value >= 64; break;
        case 104: s.alt_mode = event.value >= 64; break;
        case 105: s.freeze = event.value >= 64; break;
        case 106: s.half_speed = event.value >= 64; break;
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
        const initialState = await getReverseModeCState(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load Reverse Mode C state:', err);
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
      await sendReverseModeCParameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Main knobs
  const setTime = useCallback(async (v: number) => {
    setState(p => p ? { ...p, time: v } : null);
    await sendParam({ Time: v });
  }, [sendParam]);

  const setMix = useCallback(async (v: number) => {
    setState(p => p ? { ...p, mix: v } : null);
    await sendParam({ Mix: v });
  }, [sendParam]);

  const setFeedback = useCallback(async (v: number) => {
    setState(p => p ? { ...p, feedback: v } : null);
    await sendParam({ Feedback: v });
  }, [sendParam]);

  const setOffset = useCallback(async (v: number) => {
    setState(p => p ? { ...p, offset: v } : null);
    await sendParam({ Offset: v });
  }, [sendParam]);

  const setBalance = useCallback(async (v: number) => {
    setState(p => p ? { ...p, balance: v } : null);
    await sendParam({ Balance: v });
  }, [sendParam]);

  const setFilter = useCallback(async (v: number) => {
    setState(p => p ? { ...p, filter: v } : null);
    await sendParam({ Filter: v });
  }, [sendParam]);

  const setRampSpeed = useCallback(async (v: number) => {
    setState(p => p ? { ...p, ramp_speed: v } : null);
    await sendParam({ RampSpeed: v });
  }, [sendParam]);

  // Three-position selectors
  const setModSync = useCallback(async (sync: ModSync) => {
    setState(p => p ? { ...p, mod_sync: sync } : null);
    await sendParam({ ModSync: sync });
  }, [sendParam]);

  const setModType = useCallback(async (type: ModType) => {
    setState(p => p ? { ...p, mod_type: type } : null);
    await sendParam({ ModType: type });
  }, [sendParam]);

  const setSequenceMode = useCallback(async (mode: SequenceMode) => {
    setState(p => p ? { ...p, sequence_mode: mode } : null);
    await sendParam({ SequenceMode: mode });
  }, [sendParam]);

  // Alt knobs
  const setSequencerSubdivision = useCallback(async (v: number) => {
    setState(p => p ? { ...p, sequencer_subdivision: v } : null);
    await sendParam({ SequencerSubdivision: v });
  }, [sendParam]);

  const setRampingWaveform = useCallback(async (v: number) => {
    setState(p => p ? { ...p, ramping_waveform: v } : null);
    await sendParam({ RampingWaveform: v });
  }, [sendParam]);

  const setModDepth = useCallback(async (v: number) => {
    setState(p => p ? { ...p, mod_depth: v } : null);
    await sendParam({ ModDepth: v });
  }, [sendParam]);

  const setModRate = useCallback(async (v: number) => {
    setState(p => p ? { ...p, mod_rate: v } : null);
    await sendParam({ ModRate: v });
  }, [sendParam]);

  // Octave and spacing
  const setOctaveType = useCallback(async (type: OctaveType) => {
    setState(p => p ? { ...p, octave_type: type } : null);
    await sendParam({ OctaveType: type });
  }, [sendParam]);

  const setSequenceSpacing = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, sequence_spacing: v } : null);
    await sendParam({ SequenceSpacing: v });
  }, [sendParam]);

  // Footswitches
  const setBypass = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, bypass: v } : null);
    await sendParam({ Bypass: v });
  }, [sendParam]);

  const setTap = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, tap: v } : null);
    await sendParam({ Tap: v });
  }, [sendParam]);

  const setAltMode = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, alt_mode: v } : null);
    await sendParam({ AltMode: v });
  }, [sendParam]);

  const setFreeze = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, freeze: v } : null);
    await sendParam({ Freeze: v });
  }, [sendParam]);

  const setHalfSpeed = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, half_speed: v } : null);
    await sendParam({ HalfSpeed: v });
  }, [sendParam]);

  // DIP switches - Left bank
  const setDipTime = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_time: v } : null);
    await sendParam({ DipTime: v });
  }, [sendParam]);

  const setDipOffset = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_offset: v } : null);
    await sendParam({ DipOffset: v });
  }, [sendParam]);

  const setDipBalance = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_balance: v } : null);
    await sendParam({ DipBalance: v });
  }, [sendParam]);

  const setDipFilter = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_filter: v } : null);
    await sendParam({ DipFilter: v });
  }, [sendParam]);

  const setDipFeed = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_feed: v } : null);
    await sendParam({ DipFeed: v });
  }, [sendParam]);

  const setDipBounce = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_bounce: v } : null);
    await sendParam({ DipBounce: v });
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
  const setDipSwap = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_swap: v } : null);
    await sendParam({ DipSwap: v });
  }, [sendParam]);

  const setDipMiso = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_miso: v } : null);
    await sendParam({ DipMiso: v });
  }, [sendParam]);

  const setDipSpread = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_spread: v } : null);
    await sendParam({ DipSpread: v });
  }, [sendParam]);

  const setDipTrails = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_trails: v } : null);
    await sendParam({ DipTrails: v });
  }, [sendParam]);

  const setDipLatch = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_latch: v } : null);
    await sendParam({ DipLatch: v });
  }, [sendParam]);

  const setDipFeedType = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_feed_type: v } : null);
    await sendParam({ DipFeedType: v });
  }, [sendParam]);

  const setDipFadeType = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_fade_type: v } : null);
    await sendParam({ DipFadeType: v });
  }, [sendParam]);

  const setDipModType = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_mod_type: v } : null);
    await sendParam({ DipModType: v });
  }, [sendParam]);

  // Advanced
  const setMidiClockIgnore = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, midi_clock_ignore: v } : null);
    await sendParam({ MidiClockIgnore: v });
  }, [sendParam]);

  const setRampBounce = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, ramp_bounce: v } : null);
    await sendParam({ RampBounce: v });
  }, [sendParam]);

  const setDryKill = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dry_kill: v } : null);
    await sendParam({ DryKill: v });
  }, [sendParam]);

  const setExpression = useCallback(async (v: number) => {
    setState(p => p ? { ...p, expression: v } : null);
    await sendParam({ Expression: v });
  }, [sendParam]);

  // Preset management
  const loadPreset = useCallback(async (
    newState: ReverseModeCState,
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
        await recallReverseModeCPreset(deviceName, newState);
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
    setTime, setMix, setFeedback, setOffset, setBalance, setFilter, setRampSpeed,
    setModSync, setModType, setSequenceMode,
    setSequencerSubdivision, setRampingWaveform, setModDepth, setModRate,
    setOctaveType, setSequenceSpacing,
    setBypass, setTap, setAltMode, setFreeze, setHalfSpeed,
    setDipTime, setDipOffset, setDipBalance, setDipFilter, setDipFeed, setDipBounce,
    setDipSweep, setDipPolarity,
    setDipSwap, setDipMiso, setDipSpread, setDipTrails, setDipLatch,
    setDipFeedType, setDipFadeType, setDipModType,
    setMidiClockIgnore, setRampBounce, setDryKill, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  };
}
