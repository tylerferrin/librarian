// React hook for managing Chase Bliss Lossy editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getLossyState,
  sendLossyParameter,
  recallLossyPreset,
} from '@/lib/midi/pedals/lossy';
import type {
  LossyState,
  FilterSlope,
  PacketMode,
  LossEffect,
  Weighting,
  SweepDirection,
  Polarity,
} from '@/lib/midi/pedals/lossy';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UseLossyEditorReturn {
  state: LossyState | null;
  isLoading: boolean;
  error: string | null;

  // Main knobs
  setFilter: (value: number) => Promise<void>;
  setGlobal: (value: number) => Promise<void>;
  setReverb: (value: number) => Promise<void>;
  setFreq: (value: number) => Promise<void>;
  setSpeed: (value: number) => Promise<void>;
  setLoss: (value: number) => Promise<void>;
  setRampSpeed: (value: number) => Promise<void>;

  // Toggles
  setFilterSlope: (v: FilterSlope) => Promise<void>;
  setPacketMode: (v: PacketMode) => Promise<void>;
  setLossEffect: (v: LossEffect) => Promise<void>;

  // Hidden knobs
  setGate: (value: number) => Promise<void>;
  setFreezer: (value: number) => Promise<void>;
  setVerbDecay: (value: number) => Promise<void>;
  setLimiterThreshold: (value: number) => Promise<void>;
  setAutoGain: (value: number) => Promise<void>;
  setLossGain: (value: number) => Promise<void>;
  setWeighting: (v: Weighting) => Promise<void>;

  // Footswitches
  setBypass: (v: boolean) => Promise<void>;
  setFreezeSlushie: (v: boolean) => Promise<void>;
  setAltMode: (v: boolean) => Promise<void>;
  setFreezeSolid: (v: boolean) => Promise<void>;
  setGateSwitch: (v: boolean) => Promise<void>;

  // DIP switches - Left bank
  setDipFilter: (v: boolean) => Promise<void>;
  setDipFreq: (v: boolean) => Promise<void>;
  setDipSpeed: (v: boolean) => Promise<void>;
  setDipLoss: (v: boolean) => Promise<void>;
  setDipVerb: (v: boolean) => Promise<void>;
  setDipBounce: (v: boolean) => Promise<void>;
  setDipSweep: (v: SweepDirection) => Promise<void>;
  setDipPolarity: (v: Polarity) => Promise<void>;

  // DIP switches - Right bank
  setDipMiso: (v: boolean) => Promise<void>;
  setDipSpread: (v: boolean) => Promise<void>;
  setDipTrails: (v: boolean) => Promise<void>;
  setDipLatch: (v: boolean) => Promise<void>;
  setDipPrePost: (v: boolean) => Promise<void>;
  setDipSlow: (v: boolean) => Promise<void>;
  setDipInvert: (v: boolean) => Promise<void>;
  setDipAllWet: (v: boolean) => Promise<void>;

  // Advanced
  setRampBounce: (v: boolean) => Promise<void>;
  setDryKill: (v: boolean) => Promise<void>;
  setExpression: (value: number) => Promise<void>;

  // Preset management
  loadPreset: (state: LossyState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

function filterSlopeFromCC(value: number): FilterSlope {
  if (value === 2) return 'Db24';
  if (value === 3) return 'Db96';
  return 'Db6';
}

function packetModeFromCC(value: number): PacketMode {
  if (value === 2) return 'Clean';
  if (value === 3) return 'LossMode';
  return 'Repeat';
}

function lossEffectFromCC(value: number): LossEffect {
  if (value === 2) return 'Standard';
  if (value === 3) return 'Jitter';
  return 'Inverse';
}

function weightingFromCC(value: number): Weighting {
  if (value === 2) return 'Neutral';
  if (value === 3) return 'Bright';
  return 'Dark';
}

function createDefaultState(): LossyState {
  return {
    filter: 64, global: 64, reverb: 64, freq: 64, speed: 64,
    loss: 64, ramp_speed: 64,
    filter_slope: 'Db6', packet_mode: 'Repeat', loss_effect: 'Standard',
    gate: 64, freezer: 64, verb_decay: 64, limiter_threshold: 64,
    auto_gain: 64, loss_gain: 64,
    weighting: 'Neutral',
    bypass: true, freeze_slushie: false, alt_mode: false,
    freeze_solid: false, gate_switch: false,
    dip_filter: false, dip_freq: false, dip_speed: false, dip_loss: false,
    dip_verb: false, dip_bounce: false,
    dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_miso: false, dip_spread: false, dip_trails: false, dip_latch: false,
    dip_pre_post: false, dip_slow: false, dip_invert: false, dip_all_wet: false,
    ramp_bounce: false, dry_kill: false, expression: 0,
  };
}

export function useLossyEditor(deviceName: string): UseLossyEditorReturn {
  const [state, setState] = useState<LossyState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<LossyState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;
      const s = { ...prev };

      switch (event.cc_number) {
        case 14: s.filter = event.value; break;
        case 15: s.global = event.value; break;
        case 16: s.reverb = event.value; break;
        case 17: s.freq = event.value; break;
        case 18: s.speed = event.value; break;
        case 19: s.loss = event.value; break;
        case 20: s.ramp_speed = event.value; break;
        case 21: s.filter_slope = filterSlopeFromCC(event.value); break;
        case 22: s.packet_mode = packetModeFromCC(event.value); break;
        case 23: s.loss_effect = lossEffectFromCC(event.value); break;
        case 24: s.gate = event.value; break;
        case 25: s.freezer = event.value; break;
        case 26: s.verb_decay = event.value; break;
        case 27: s.limiter_threshold = event.value; break;
        case 28: s.auto_gain = event.value; break;
        case 29: s.loss_gain = event.value; break;
        case 33: s.weighting = weightingFromCC(event.value); break;
        case 52: s.ramp_bounce = event.value >= 64; break;
        case 57: s.dry_kill = event.value >= 64; break;
        case 61: s.dip_filter = event.value >= 64; break;
        case 62: s.dip_freq = event.value >= 64; break;
        case 63: s.dip_speed = event.value >= 64; break;
        case 64: s.dip_loss = event.value >= 64; break;
        case 65: s.dip_verb = event.value >= 64; break;
        case 66: s.dip_bounce = event.value >= 64; break;
        case 67: s.dip_sweep = event.value < 1 ? 'Bottom' : 'Top'; break;
        case 68: s.dip_polarity = event.value < 1 ? 'Forward' : 'Reverse'; break;
        case 71: s.dip_miso = event.value >= 64; break;
        case 72: s.dip_spread = event.value >= 64; break;
        case 73: s.dip_trails = event.value >= 64; break;
        case 74: s.dip_latch = event.value >= 64; break;
        case 75: s.dip_pre_post = event.value >= 64; break;
        case 76: s.dip_slow = event.value >= 64; break;
        case 77: s.dip_invert = event.value >= 64; break;
        case 78: s.dip_all_wet = event.value >= 64; break;
        case 100: s.expression = event.value; break;
        case 102: s.bypass = event.value >= 64; break;
        case 103: s.freeze_slushie = event.value >= 64; break;
        case 104: s.alt_mode = event.value >= 64; break;
        case 105: s.freeze_solid = event.value >= 64; break;
        case 106: s.gate_switch = event.value >= 64; break;
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
        const initialState = await getLossyState(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load Lossy state:', err);
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
      await sendLossyParameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Main knobs
  const setFilter = useCallback(async (v: number) => { setState(p => p ? { ...p, filter: v } : null); await sendParam({ Filter: v }); }, [sendParam]);
  const setGlobal = useCallback(async (v: number) => { setState(p => p ? { ...p, global: v } : null); await sendParam({ Global: v }); }, [sendParam]);
  const setReverb = useCallback(async (v: number) => { setState(p => p ? { ...p, reverb: v } : null); await sendParam({ Reverb: v }); }, [sendParam]);
  const setFreq = useCallback(async (v: number) => { setState(p => p ? { ...p, freq: v } : null); await sendParam({ Freq: v }); }, [sendParam]);
  const setSpeed = useCallback(async (v: number) => { setState(p => p ? { ...p, speed: v } : null); await sendParam({ Speed: v }); }, [sendParam]);
  const setLoss = useCallback(async (v: number) => { setState(p => p ? { ...p, loss: v } : null); await sendParam({ Loss: v }); }, [sendParam]);
  const setRampSpeed = useCallback(async (v: number) => { setState(p => p ? { ...p, ramp_speed: v } : null); await sendParam({ RampSpeed: v }); }, [sendParam]);

  // Toggles
  const setFilterSlope = useCallback(async (v: FilterSlope) => { setState(p => p ? { ...p, filter_slope: v } : null); await sendParam({ FilterSlope: v }); }, [sendParam]);
  const setPacketMode = useCallback(async (v: PacketMode) => { setState(p => p ? { ...p, packet_mode: v } : null); await sendParam({ PacketMode: v }); }, [sendParam]);
  const setLossEffect = useCallback(async (v: LossEffect) => { setState(p => p ? { ...p, loss_effect: v } : null); await sendParam({ LossEffect: v }); }, [sendParam]);

  // Hidden knobs
  const setGate = useCallback(async (v: number) => { setState(p => p ? { ...p, gate: v } : null); await sendParam({ Gate: v }); }, [sendParam]);
  const setFreezer = useCallback(async (v: number) => { setState(p => p ? { ...p, freezer: v } : null); await sendParam({ Freezer: v }); }, [sendParam]);
  const setVerbDecay = useCallback(async (v: number) => { setState(p => p ? { ...p, verb_decay: v } : null); await sendParam({ VerbDecay: v }); }, [sendParam]);
  const setLimiterThreshold = useCallback(async (v: number) => { setState(p => p ? { ...p, limiter_threshold: v } : null); await sendParam({ LimiterThreshold: v }); }, [sendParam]);
  const setAutoGain = useCallback(async (v: number) => { setState(p => p ? { ...p, auto_gain: v } : null); await sendParam({ AutoGain: v }); }, [sendParam]);
  const setLossGain = useCallback(async (v: number) => { setState(p => p ? { ...p, loss_gain: v } : null); await sendParam({ LossGain: v }); }, [sendParam]);
  const setWeighting = useCallback(async (v: Weighting) => { setState(p => p ? { ...p, weighting: v } : null); await sendParam({ Weighting: v }); }, [sendParam]);

  // Footswitches
  const setBypass = useCallback(async (v: boolean) => { setState(p => p ? { ...p, bypass: v } : null); await sendParam({ Bypass: v }); }, [sendParam]);
  const setFreezeSlushie = useCallback(async (v: boolean) => { setState(p => p ? { ...p, freeze_slushie: v } : null); await sendParam({ FreezeSlushie: v }); }, [sendParam]);
  const setAltMode = useCallback(async (v: boolean) => { setState(p => p ? { ...p, alt_mode: v } : null); await sendParam({ AltMode: v }); }, [sendParam]);
  const setFreezeSolid = useCallback(async (v: boolean) => { setState(p => p ? { ...p, freeze_solid: v } : null); await sendParam({ FreezeSolid: v }); }, [sendParam]);
  const setGateSwitch = useCallback(async (v: boolean) => { setState(p => p ? { ...p, gate_switch: v } : null); await sendParam({ GateSwitch: v }); }, [sendParam]);

  // DIP switches - Left bank
  const setDipFilter = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_filter: v } : null); await sendParam({ DipFilter: v }); }, [sendParam]);
  const setDipFreq = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_freq: v } : null); await sendParam({ DipFreq: v }); }, [sendParam]);
  const setDipSpeed = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_speed: v } : null); await sendParam({ DipSpeed: v }); }, [sendParam]);
  const setDipLoss = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_loss: v } : null); await sendParam({ DipLoss: v }); }, [sendParam]);
  const setDipVerb = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_verb: v } : null); await sendParam({ DipVerb: v }); }, [sendParam]);
  const setDipBounce = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_bounce: v } : null); await sendParam({ DipBounce: v }); }, [sendParam]);
  const setDipSweep = useCallback(async (v: SweepDirection) => { setState(p => p ? { ...p, dip_sweep: v } : null); await sendParam({ DipSweep: v }); }, [sendParam]);
  const setDipPolarity = useCallback(async (v: Polarity) => { setState(p => p ? { ...p, dip_polarity: v } : null); await sendParam({ DipPolarity: v }); }, [sendParam]);

  // DIP switches - Right bank
  const setDipMiso = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_miso: v } : null); await sendParam({ DipMiso: v }); }, [sendParam]);
  const setDipSpread = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_spread: v } : null); await sendParam({ DipSpread: v }); }, [sendParam]);
  const setDipTrails = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_trails: v } : null); await sendParam({ DipTrails: v }); }, [sendParam]);
  const setDipLatch = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_latch: v } : null); await sendParam({ DipLatch: v }); }, [sendParam]);
  const setDipPrePost = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_pre_post: v } : null); await sendParam({ DipPrePost: v }); }, [sendParam]);
  const setDipSlow = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_slow: v } : null); await sendParam({ DipSlow: v }); }, [sendParam]);
  const setDipInvert = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_invert: v } : null); await sendParam({ DipInvert: v }); }, [sendParam]);
  const setDipAllWet = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dip_all_wet: v } : null); await sendParam({ DipAllWet: v }); }, [sendParam]);

  // Advanced
  const setRampBounce = useCallback(async (v: boolean) => { setState(p => p ? { ...p, ramp_bounce: v } : null); await sendParam({ RampBounce: v }); }, [sendParam]);
  const setDryKill = useCallback(async (v: boolean) => { setState(p => p ? { ...p, dry_kill: v } : null); await sendParam({ DryKill: v }); }, [sendParam]);
  const setExpression = useCallback(async (v: number) => { setState(p => p ? { ...p, expression: v } : null); await sendParam({ Expression: v }); }, [sendParam]);

  // Preset management
  const loadPreset = useCallback(async (
    newState: LossyState,
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
        await recallLossyPreset(deviceName, newState);
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
    setFilter, setGlobal, setReverb, setFreq, setSpeed, setLoss, setRampSpeed,
    setFilterSlope, setPacketMode, setLossEffect,
    setGate, setFreezer, setVerbDecay, setLimiterThreshold, setAutoGain, setLossGain, setWeighting,
    setBypass, setFreezeSlushie, setAltMode, setFreezeSolid, setGateSwitch,
    setDipFilter, setDipFreq, setDipSpeed, setDipLoss, setDipVerb, setDipBounce,
    setDipSweep, setDipPolarity,
    setDipMiso, setDipSpread, setDipTrails, setDipLatch, setDipPrePost,
    setDipSlow, setDipInvert, setDipAllWet,
    setRampBounce, setDryKill, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  };
}
