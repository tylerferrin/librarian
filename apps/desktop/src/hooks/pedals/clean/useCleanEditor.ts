// React hook for managing Chase Bliss Clean editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getCleanState,
  sendCleanParameter,
  recallCleanPreset,
} from '@/lib/midi/pedals/clean';
import type {
  CleanState,
  ReleaseMode,
  EffectMode,
  PhysicsMode,
  EnvelopeMode,
  SpreadRouting,
  SweepDirection,
  Polarity,
} from '@/lib/midi/pedals/clean';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UseCleanEditorReturn {
  state: CleanState | null;
  isLoading: boolean;
  error: string | null;

  // Main knobs
  setDynamics: (value: number) => Promise<void>;
  setSensitivity: (value: number) => Promise<void>;
  setWet: (value: number) => Promise<void>;
  setAttack: (value: number) => Promise<void>;
  setEq: (value: number) => Promise<void>;
  setDry: (value: number) => Promise<void>;
  setRampSpeed: (value: number) => Promise<void>;

  // Three-position toggles
  setReleaseMode: (mode: ReleaseMode) => Promise<void>;
  setEffectMode: (mode: EffectMode) => Promise<void>;
  setPhysicsMode: (mode: PhysicsMode) => Promise<void>;

  // Hidden options
  setNoiseGateRelease: (value: number) => Promise<void>;
  setNoiseGateSens: (value: number) => Promise<void>;
  setSwellIn: (value: number) => Promise<void>;
  setUserRelease: (value: number) => Promise<void>;
  setBalanceFilter: (value: number) => Promise<void>;
  setSwellOut: (value: number) => Promise<void>;
  setEnvelopeMode: (mode: EnvelopeMode) => Promise<void>;
  setShiftyMode: (value: number) => Promise<void>;
  setSpreadRouting: (routing: SpreadRouting) => Promise<void>;

  // Footswitches
  setBypass: (value: boolean) => Promise<void>;
  setSwell: (value: boolean) => Promise<void>;
  setAltMode: (value: boolean) => Promise<void>;
  setSwellHold: (value: boolean) => Promise<void>;
  setDynamicsMax: (value: boolean) => Promise<void>;

  // DIP switches - Left bank
  setDipDynamics: (value: boolean) => Promise<void>;
  setDipAttack: (value: boolean) => Promise<void>;
  setDipEq: (value: boolean) => Promise<void>;
  setDipDry: (value: boolean) => Promise<void>;
  setDipWet: (value: boolean) => Promise<void>;
  setDipBounce: (value: boolean) => Promise<void>;
  setDipSweep: (direction: SweepDirection) => Promise<void>;
  setDipPolarity: (polarity: Polarity) => Promise<void>;

  // DIP switches - Right bank
  setDipMiso: (value: boolean) => Promise<void>;
  setDipSpread: (value: boolean) => Promise<void>;
  setDipLatch: (value: boolean) => Promise<void>;
  setDipSidechain: (value: boolean) => Promise<void>;
  setDipNoiseGate: (value: boolean) => Promise<void>;
  setDipMotion: (value: boolean) => Promise<void>;
  setDipSwellAux: (value: boolean) => Promise<void>;
  setDipDusty: (value: boolean) => Promise<void>;

  // Utility
  setRampBounce: (value: boolean) => Promise<void>;
  setExpression: (value: number) => Promise<void>;

  // Preset management
  loadPreset: (state: CleanState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

function releaseModeFromCC(value: number): ReleaseMode {
  if (value === 2) return 'User';
  if (value === 3) return 'Slow';
  return 'Fast';
}

function effectModeFromCC(value: number): EffectMode {
  if (value === 2) return 'Manual';
  if (value === 3) return 'Modulated';
  return 'Shifty';
}

function physicsModeFromCC(value: number): PhysicsMode {
  if (value === 2) return 'Off';
  if (value === 3) return 'Twitchy';
  return 'Wobbly';
}

function envelopeModeFromCC(value: number): EnvelopeMode {
  if (value === 2) return 'Hybrid';
  if (value === 3) return 'Adaptive';
  return 'Analog';
}

function spreadRoutingFromCC(value: number): SpreadRouting {
  if (value === 2) return 'Both';
  if (value === 3) return 'VolComp';
  return 'Eq';
}

function createDefaultState(): CleanState {
  return {
    dynamics: 64,
    sensitivity: 64,
    wet: 64,
    attack: 64,
    eq: 64,
    dry: 64,
    ramp_speed: 64,
    release_mode: 'Fast',
    effect_mode: 'Shifty',
    physics_mode: 'Wobbly',
    noise_gate_release: 64,
    noise_gate_sens: 64,
    swell_in: 64,
    user_release: 64,
    balance_filter: 64,
    swell_out: 64,
    envelope_mode: 'Analog',
    shifty_mode: 1,
    spread_routing: 'Eq',
    bypass: false,
    swell: false,
    alt_mode: false,
    swell_hold: false,
    dynamics_max: false,
    dip_dynamics: false,
    dip_attack: false,
    dip_eq: false,
    dip_dry: false,
    dip_wet: false,
    dip_bounce: false,
    dip_sweep: 'Bottom',
    dip_polarity: 'Forward',
    dip_miso: false,
    dip_spread: false,
    dip_latch: false,
    dip_sidechain: false,
    dip_noise_gate: false,
    dip_motion: false,
    dip_swell_aux: false,
    dip_dusty: false,
    ramp_bounce: false,
    expression: 0,
  };
}

export function useCleanEditor(deviceName: string): UseCleanEditorReturn {
  const [state, setState] = useState<CleanState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preset tracking
  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<CleanState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Handle incoming MIDI CC messages from the pedal
  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;
      const s = { ...prev };

      switch (event.cc_number) {
        // Main knobs
        case 14: s.dynamics = event.value; break;
        case 15: s.sensitivity = event.value; break;
        case 16: s.wet = event.value; break;
        case 17: s.attack = event.value; break;
        case 18: s.eq = event.value; break;
        case 19: s.dry = event.value; break;
        case 20: s.ramp_speed = event.value; break;

        // Toggles
        case 21: s.release_mode = releaseModeFromCC(event.value); break;
        case 22: s.effect_mode = effectModeFromCC(event.value); break;
        case 23: s.physics_mode = physicsModeFromCC(event.value); break;

        // Hidden options
        case 24: s.noise_gate_release = event.value; break;
        case 25: s.noise_gate_sens = event.value; break;
        case 26: s.swell_in = event.value; break;
        case 27: s.user_release = event.value; break;
        case 28: s.balance_filter = event.value; break;
        case 29: s.swell_out = event.value; break;
        case 31: s.envelope_mode = envelopeModeFromCC(event.value); break;
        case 32: s.shifty_mode = event.value; break;
        case 33: s.spread_routing = spreadRoutingFromCC(event.value); break;

        // Utility
        case 52: s.ramp_bounce = event.value >= 64; break;

        // DIP switches - Left bank
        case 61: s.dip_dynamics = event.value >= 64; break;
        case 62: s.dip_attack = event.value >= 64; break;
        case 63: s.dip_eq = event.value >= 64; break;
        case 64: s.dip_dry = event.value >= 64; break;
        case 65: s.dip_wet = event.value >= 64; break;
        case 66: s.dip_bounce = event.value >= 64; break;
        case 67: s.dip_sweep = event.value < 64 ? 'Bottom' : 'Top'; break;
        case 68: s.dip_polarity = event.value < 64 ? 'Forward' : 'Reverse'; break;

        // DIP switches - Right bank
        case 71: s.dip_miso = event.value >= 64; break;
        case 72: s.dip_spread = event.value >= 64; break;
        case 73: s.dip_latch = event.value >= 64; break;
        case 74: s.dip_sidechain = event.value >= 64; break;
        case 75: s.dip_noise_gate = event.value >= 64; break;
        case 76: s.dip_motion = event.value >= 64; break;
        case 77: s.dip_swell_aux = event.value >= 64; break;
        case 78: s.dip_dusty = event.value >= 64; break;

        // Other
        case 100: s.expression = event.value; break;
        case 102: s.bypass = event.value >= 64; break;
        case 103: s.swell = event.value >= 64; break;
        case 104: s.alt_mode = event.value >= 64; break;
        case 105: s.swell_hold = event.value >= 64; break;
        case 106: s.dynamics_max = event.value >= 64; break;

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
        const initialState = await getCleanState(deviceName);
        if (mounted) {
          setState(initialState);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load Clean state:', err);
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
      await sendCleanParameter(deviceName, param);
      setError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Main knobs
  const setDynamics = useCallback(async (v: number) => {
    setState(p => p ? { ...p, dynamics: v } : null);
    await sendParam({ Dynamics: v });
  }, [sendParam]);

  const setSensitivity = useCallback(async (v: number) => {
    setState(p => p ? { ...p, sensitivity: v } : null);
    await sendParam({ Sensitivity: v });
  }, [sendParam]);

  const setWet = useCallback(async (v: number) => {
    setState(p => p ? { ...p, wet: v } : null);
    await sendParam({ Wet: v });
  }, [sendParam]);

  const setAttack = useCallback(async (v: number) => {
    setState(p => p ? { ...p, attack: v } : null);
    await sendParam({ Attack: v });
  }, [sendParam]);

  const setEq = useCallback(async (v: number) => {
    setState(p => p ? { ...p, eq: v } : null);
    await sendParam({ Eq: v });
  }, [sendParam]);

  const setDry = useCallback(async (v: number) => {
    setState(p => p ? { ...p, dry: v } : null);
    await sendParam({ Dry: v });
  }, [sendParam]);

  const setRampSpeed = useCallback(async (v: number) => {
    setState(p => p ? { ...p, ramp_speed: v } : null);
    await sendParam({ RampSpeed: v });
  }, [sendParam]);

  // Three-position toggles
  const setReleaseMode = useCallback(async (m: ReleaseMode) => {
    setState(p => p ? { ...p, release_mode: m } : null);
    await sendParam({ ReleaseMode: m });
  }, [sendParam]);

  const setEffectMode = useCallback(async (m: EffectMode) => {
    setState(p => p ? { ...p, effect_mode: m } : null);
    await sendParam({ EffectMode: m });
  }, [sendParam]);

  const setPhysicsMode = useCallback(async (m: PhysicsMode) => {
    setState(p => p ? { ...p, physics_mode: m } : null);
    await sendParam({ PhysicsMode: m });
  }, [sendParam]);

  // Hidden options
  const setNoiseGateRelease = useCallback(async (v: number) => {
    setState(p => p ? { ...p, noise_gate_release: v } : null);
    await sendParam({ NoiseGateRelease: v });
  }, [sendParam]);

  const setNoiseGateSens = useCallback(async (v: number) => {
    setState(p => p ? { ...p, noise_gate_sens: v } : null);
    await sendParam({ NoiseGateSens: v });
  }, [sendParam]);

  const setSwellIn = useCallback(async (v: number) => {
    setState(p => p ? { ...p, swell_in: v } : null);
    await sendParam({ SwellIn: v });
  }, [sendParam]);

  const setUserRelease = useCallback(async (v: number) => {
    setState(p => p ? { ...p, user_release: v } : null);
    await sendParam({ UserRelease: v });
  }, [sendParam]);

  const setBalanceFilter = useCallback(async (v: number) => {
    setState(p => p ? { ...p, balance_filter: v } : null);
    await sendParam({ BalanceFilter: v });
  }, [sendParam]);

  const setSwellOut = useCallback(async (v: number) => {
    setState(p => p ? { ...p, swell_out: v } : null);
    await sendParam({ SwellOut: v });
  }, [sendParam]);

  const setEnvelopeMode = useCallback(async (m: EnvelopeMode) => {
    setState(p => p ? { ...p, envelope_mode: m } : null);
    await sendParam({ EnvelopeMode: m });
  }, [sendParam]);

  const setShiftyMode = useCallback(async (v: number) => {
    setState(p => p ? { ...p, shifty_mode: v } : null);
    await sendParam({ ShiftyMode: v });
  }, [sendParam]);

  const setSpreadRouting = useCallback(async (r: SpreadRouting) => {
    setState(p => p ? { ...p, spread_routing: r } : null);
    await sendParam({ SpreadRouting: r });
  }, [sendParam]);

  // Footswitches
  const setBypass = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, bypass: v } : null);
    await sendParam({ Bypass: v });
  }, [sendParam]);

  const setSwell = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, swell: v } : null);
    await sendParam({ Swell: v });
  }, [sendParam]);

  const setAltMode = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, alt_mode: v } : null);
    await sendParam({ AltMode: v });
  }, [sendParam]);

  const setSwellHold = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, swell_hold: v } : null);
    await sendParam({ SwellHold: v });
  }, [sendParam]);

  const setDynamicsMax = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dynamics_max: v } : null);
    await sendParam({ DynamicsMax: v });
  }, [sendParam]);

  // DIP switches - Left bank
  const setDipDynamics = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_dynamics: v } : null);
    await sendParam({ DipDynamics: v });
  }, [sendParam]);

  const setDipAttack = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_attack: v } : null);
    await sendParam({ DipAttack: v });
  }, [sendParam]);

  const setDipEq = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_eq: v } : null);
    await sendParam({ DipEq: v });
  }, [sendParam]);

  const setDipDry = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_dry: v } : null);
    await sendParam({ DipDry: v });
  }, [sendParam]);

  const setDipWet = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_wet: v } : null);
    await sendParam({ DipWet: v });
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
  const setDipMiso = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_miso: v } : null);
    await sendParam({ DipMiso: v });
  }, [sendParam]);

  const setDipSpread = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_spread: v } : null);
    await sendParam({ DipSpread: v });
  }, [sendParam]);

  const setDipLatch = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_latch: v } : null);
    await sendParam({ DipLatch: v });
  }, [sendParam]);

  const setDipSidechain = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_sidechain: v } : null);
    await sendParam({ DipSidechain: v });
  }, [sendParam]);

  const setDipNoiseGate = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_noise_gate: v } : null);
    await sendParam({ DipNoiseGate: v });
  }, [sendParam]);

  const setDipMotion = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_motion: v } : null);
    await sendParam({ DipMotion: v });
  }, [sendParam]);

  const setDipSwellAux = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_swell_aux: v } : null);
    await sendParam({ DipSwellAux: v });
  }, [sendParam]);

  const setDipDusty = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_dusty: v } : null);
    await sendParam({ DipDusty: v });
  }, [sendParam]);

  // Utility
  const setRampBounce = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, ramp_bounce: v } : null);
    await sendParam({ RampBounce: v });
  }, [sendParam]);

  const setExpression = useCallback(async (v: number) => {
    setState(p => p ? { ...p, expression: v } : null);
    await sendParam({ Expression: v });
  }, [sendParam]);

  // Preset management
  const loadPreset = useCallback(async (
    newState: CleanState,
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
        await recallCleanPreset(deviceName, newState);
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
    setDynamics, setSensitivity, setWet, setAttack, setEq, setDry, setRampSpeed,
    setReleaseMode, setEffectMode, setPhysicsMode,
    setNoiseGateRelease, setNoiseGateSens, setSwellIn, setUserRelease,
    setBalanceFilter, setSwellOut, setEnvelopeMode, setShiftyMode, setSpreadRouting,
    setBypass, setSwell, setAltMode, setSwellHold, setDynamicsMax,
    setDipDynamics, setDipAttack, setDipEq, setDipDry, setDipWet,
    setDipBounce, setDipSweep, setDipPolarity,
    setDipMiso, setDipSpread, setDipLatch, setDipSidechain,
    setDipNoiseGate, setDipMotion, setDipSwellAux, setDipDusty,
    setRampBounce, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  };
}
