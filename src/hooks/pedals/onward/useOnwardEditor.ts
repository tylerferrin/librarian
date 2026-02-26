// React hook for managing Chase Bliss Onward editor state

import { useState, useEffect, useCallback } from 'react';
import {
  getOnwardState,
  sendOnwardParameter,
  recallOnwardPreset,
} from '@/lib/midi/pedals/onward';
import type {
  OnwardState,
  ErrorType,
  FadeMode,
  AnimateMode,
  Routing,
  SweepDirection,
  Polarity,
} from '@/lib/midi/pedals/onward';
import { useMIDIInput, type MidiCCEvent } from '@/hooks/useMIDIInput';

interface UseOnwardEditorReturn {
  state: OnwardState | null;
  isLoading: boolean;
  error: string | null;

  // Main knobs
  setSize: (value: number) => Promise<void>;
  setMix: (value: number) => Promise<void>;
  setOctave: (value: number) => Promise<void>;
  setError: (value: number) => Promise<void>;
  setSustain: (value: number) => Promise<void>;
  setTexture: (value: number) => Promise<void>;
  setRampSpeed: (value: number) => Promise<void>;

  // Three-position toggles
  setErrorType: (type: ErrorType) => Promise<void>;
  setFadeMode: (mode: FadeMode) => Promise<void>;
  setAnimateMode: (mode: AnimateMode) => Promise<void>;

  // Hidden options
  setSensitivity: (value: number) => Promise<void>;
  setBalance: (value: number) => Promise<void>;
  setDuckDepth: (value: number) => Promise<void>;
  setErrorBlend: (value: number) => Promise<void>;
  setUserFade: (value: number) => Promise<void>;
  setFilter: (value: number) => Promise<void>;
  setErrorRouting: (routing: Routing) => Promise<void>;
  setSustainRouting: (routing: Routing) => Promise<void>;
  setEffectsRouting: (routing: Routing) => Promise<void>;

  // Footswitches
  setFreezeBypass: (value: boolean) => Promise<void>;
  setGlitchBypass: (value: boolean) => Promise<void>;
  setAltMode: (value: boolean) => Promise<void>;
  setGlitchHold: (value: boolean) => Promise<void>;
  setFreezeHold: (value: boolean) => Promise<void>;
  setRetriggerGlitch: (value: boolean) => Promise<void>;
  setRetriggerFreeze: (value: boolean) => Promise<void>;

  // DIP switches - Left bank
  setDipSize: (value: boolean) => Promise<void>;
  setDipError: (value: boolean) => Promise<void>;
  setDipSustain: (value: boolean) => Promise<void>;
  setDipTexture: (value: boolean) => Promise<void>;
  setDipOctave: (value: boolean) => Promise<void>;
  setDipBounce: (value: boolean) => Promise<void>;
  setDipSweep: (direction: SweepDirection) => Promise<void>;
  setDipPolarity: (polarity: Polarity) => Promise<void>;

  // DIP switches - Right bank
  setDipMiso: (value: boolean) => Promise<void>;
  setDipSpread: (value: boolean) => Promise<void>;
  setDipLatch: (value: boolean) => Promise<void>;
  setDipSidechain: (value: boolean) => Promise<void>;
  setDipDuck: (value: boolean) => Promise<void>;
  setDipReverse: (value: boolean) => Promise<void>;
  setDipHalfSpeed: (value: boolean) => Promise<void>;
  setDipManual: (value: boolean) => Promise<void>;

  // Utility
  setMidiClockIgnore: (value: boolean) => Promise<void>;
  setRampBounce: (value: boolean) => Promise<void>;
  setDryKill: (value: boolean) => Promise<void>;
  setTrails: (value: boolean) => Promise<void>;
  setExpression: (value: number) => Promise<void>;

  // Preset management
  loadPreset: (state: OnwardState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => Promise<void>;
  activePreset: { id: string; name: string } | null;
  isDirty: boolean;
  resetToPreset: () => void;
  resetToPedalDefault: () => void;
  clearActivePreset: () => void;
}

function errorTypeFromCC(value: number): ErrorType {
  if (value === 2) return 'Condition';
  if (value === 3) return 'Playback';
  return 'Timing';
}

function fadeModeFromCC(value: number): FadeMode {
  if (value === 2) return 'User';
  if (value === 3) return 'Short';
  return 'Long';
}

function animateModeFromCC(value: number): AnimateMode {
  if (value === 2) return 'Off';
  if (value === 3) return 'Chorus';
  return 'Vibrato';
}

function routingFromCC(value: number): Routing {
  if (value === 2) return 'Both';
  if (value === 3) return 'Freeze';
  return 'Glitch';
}

function createDefaultState(): OnwardState {
  return {
    size: 64,
    mix: 64,
    octave: 64,
    error: 64,
    sustain: 64,
    texture: 64,
    ramp_speed: 64,
    error_type: 'Timing',
    fade_mode: 'Long',
    animate_mode: 'Vibrato',
    sensitivity: 64,
    balance: 64,
    duck_depth: 64,
    error_blend: 64,
    user_fade: 64,
    filter: 64,
    error_routing: 'Glitch',
    sustain_routing: 'Glitch',
    effects_routing: 'Glitch',
    freeze_bypass: false,
    glitch_bypass: false,
    alt_mode: false,
    glitch_hold: false,
    freeze_hold: false,
    retrigger_glitch: false,
    retrigger_freeze: false,
    dip_size: false,
    dip_error: false,
    dip_sustain: false,
    dip_texture: false,
    dip_octave: false,
    dip_bounce: false,
    dip_sweep: 'Bottom',
    dip_polarity: 'Forward',
    dip_miso: false,
    dip_spread: false,
    dip_latch: false,
    dip_sidechain: false,
    dip_duck: false,
    dip_reverse: false,
    dip_half_speed: false,
    dip_manual: false,
    midi_clock_ignore: false,
    ramp_bounce: false,
    dry_kill: false,
    trails: false,
    expression: 0,
  };
}

export function useOnwardEditor(deviceName: string): UseOnwardEditorReturn {
  const [state, setState] = useState<OnwardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setHookError] = useState<string | null>(null);

  // Preset tracking
  const [activePreset, setActivePreset] = useState<{ id: string; name: string } | null>(null);
  const [originalPresetState, setOriginalPresetState] = useState<OnwardState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Handle incoming MIDI CC messages from the pedal
  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    setState(prev => {
      if (!prev) return null;
      const s = { ...prev };

      switch (event.cc_number) {
        // Main knobs
        case 14: s.size = event.value; break;
        case 15: s.mix = event.value; break;
        case 16: s.octave = event.value; break;
        case 17: s.error = event.value; break;
        case 18: s.sustain = event.value; break;
        case 19: s.texture = event.value; break;
        case 20: s.ramp_speed = event.value; break;

        // Toggles
        case 21: s.error_type = errorTypeFromCC(event.value); break;
        case 22: s.fade_mode = fadeModeFromCC(event.value); break;
        case 23: s.animate_mode = animateModeFromCC(event.value); break;

        // Hidden options
        case 24: s.sensitivity = event.value; break;
        case 25: s.balance = event.value; break;
        case 26: s.duck_depth = event.value; break;
        case 27: s.error_blend = event.value; break;
        case 28: s.user_fade = event.value; break;
        case 29: s.filter = event.value; break;
        case 31: s.error_routing = routingFromCC(event.value); break;
        case 32: s.sustain_routing = routingFromCC(event.value); break;
        case 33: s.effects_routing = routingFromCC(event.value); break;

        // Utility
        case 51: s.midi_clock_ignore = event.value >= 64; break;
        case 52: s.ramp_bounce = event.value >= 64; break;
        case 57: s.dry_kill = event.value >= 64; break;
        case 58: s.trails = event.value >= 64; break;

        // DIP switches - Left bank
        case 61: s.dip_size = event.value >= 64; break;
        case 62: s.dip_error = event.value >= 64; break;
        case 63: s.dip_sustain = event.value >= 64; break;
        case 64: s.dip_texture = event.value >= 64; break;
        case 65: s.dip_octave = event.value >= 64; break;
        case 66: s.dip_bounce = event.value >= 64; break;
        case 67: s.dip_sweep = event.value < 64 ? 'Bottom' : 'Top'; break;
        case 68: s.dip_polarity = event.value < 64 ? 'Forward' : 'Reverse'; break;

        // DIP switches - Right bank
        case 71: s.dip_miso = event.value >= 64; break;
        case 72: s.dip_spread = event.value >= 64; break;
        case 73: s.dip_latch = event.value >= 64; break;
        case 74: s.dip_sidechain = event.value >= 64; break;
        case 75: s.dip_duck = event.value >= 64; break;
        case 76: s.dip_reverse = event.value >= 64; break;
        case 77: s.dip_half_speed = event.value >= 64; break;
        case 78: s.dip_manual = event.value >= 64; break;

        // Other
        case 100: s.expression = event.value; break;
        case 102: s.freeze_bypass = event.value >= 64; break;
        case 103: s.glitch_bypass = event.value >= 64; break;
        case 104: s.alt_mode = event.value >= 64; break;
        case 105: s.glitch_hold = event.value >= 64; break;
        case 106: s.freeze_hold = event.value >= 64; break;

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
        const initialState = await getOnwardState(deviceName);
        if (mounted) {
          setState(initialState);
          setHookError(null);
        }
      } catch (err) {
        console.error('Failed to load Onward state:', err);
        if (mounted) {
          setHookError(err instanceof Error ? err.message : 'Failed to load state');
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
      await sendOnwardParameter(deviceName, param);
      setHookError(null);
    } catch (err) {
      console.error('Failed to send parameter:', err);
      setHookError(err instanceof Error ? err.message : 'Failed to send parameter');
    }
  }, [deviceName]);

  // Main knobs
  const setSize = useCallback(async (v: number) => {
    setState(p => p ? { ...p, size: v } : null);
    await sendParam({ Size: v });
  }, [sendParam]);

  const setMix = useCallback(async (v: number) => {
    setState(p => p ? { ...p, mix: v } : null);
    await sendParam({ Mix: v });
  }, [sendParam]);

  const setOctave = useCallback(async (v: number) => {
    setState(p => p ? { ...p, octave: v } : null);
    await sendParam({ Octave: v });
  }, [sendParam]);

  const setError = useCallback(async (v: number) => {
    setState(p => p ? { ...p, error: v } : null);
    await sendParam({ Error: v });
  }, [sendParam]);

  const setSustain = useCallback(async (v: number) => {
    setState(p => p ? { ...p, sustain: v } : null);
    await sendParam({ Sustain: v });
  }, [sendParam]);

  const setTexture = useCallback(async (v: number) => {
    setState(p => p ? { ...p, texture: v } : null);
    await sendParam({ Texture: v });
  }, [sendParam]);

  const setRampSpeed = useCallback(async (v: number) => {
    setState(p => p ? { ...p, ramp_speed: v } : null);
    await sendParam({ RampSpeed: v });
  }, [sendParam]);

  // Three-position toggles
  const setErrorType = useCallback(async (t: ErrorType) => {
    setState(p => p ? { ...p, error_type: t } : null);
    await sendParam({ ErrorType: t });
  }, [sendParam]);

  const setFadeMode = useCallback(async (m: FadeMode) => {
    setState(p => p ? { ...p, fade_mode: m } : null);
    await sendParam({ FadeMode: m });
  }, [sendParam]);

  const setAnimateMode = useCallback(async (m: AnimateMode) => {
    setState(p => p ? { ...p, animate_mode: m } : null);
    await sendParam({ AnimateMode: m });
  }, [sendParam]);

  // Hidden options
  const setSensitivity = useCallback(async (v: number) => {
    setState(p => p ? { ...p, sensitivity: v } : null);
    await sendParam({ Sensitivity: v });
  }, [sendParam]);

  const setBalance = useCallback(async (v: number) => {
    setState(p => p ? { ...p, balance: v } : null);
    await sendParam({ Balance: v });
  }, [sendParam]);

  const setDuckDepth = useCallback(async (v: number) => {
    setState(p => p ? { ...p, duck_depth: v } : null);
    await sendParam({ DuckDepth: v });
  }, [sendParam]);

  const setErrorBlend = useCallback(async (v: number) => {
    setState(p => p ? { ...p, error_blend: v } : null);
    await sendParam({ ErrorBlend: v });
  }, [sendParam]);

  const setUserFade = useCallback(async (v: number) => {
    setState(p => p ? { ...p, user_fade: v } : null);
    await sendParam({ UserFade: v });
  }, [sendParam]);

  const setFilter = useCallback(async (v: number) => {
    setState(p => p ? { ...p, filter: v } : null);
    await sendParam({ Filter: v });
  }, [sendParam]);

  const setErrorRouting = useCallback(async (r: Routing) => {
    setState(p => p ? { ...p, error_routing: r } : null);
    await sendParam({ ErrorRouting: r });
  }, [sendParam]);

  const setSustainRouting = useCallback(async (r: Routing) => {
    setState(p => p ? { ...p, sustain_routing: r } : null);
    await sendParam({ SustainRouting: r });
  }, [sendParam]);

  const setEffectsRouting = useCallback(async (r: Routing) => {
    setState(p => p ? { ...p, effects_routing: r } : null);
    await sendParam({ EffectsRouting: r });
  }, [sendParam]);

  // Footswitches
  const setFreezeBypass = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, freeze_bypass: v } : null);
    await sendParam({ FreezeBypass: v });
  }, [sendParam]);

  const setGlitchBypass = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, glitch_bypass: v } : null);
    await sendParam({ GlitchBypass: v });
  }, [sendParam]);

  const setAltMode = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, alt_mode: v } : null);
    await sendParam({ AltMode: v });
  }, [sendParam]);

  const setGlitchHold = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, glitch_hold: v } : null);
    await sendParam({ GlitchHold: v });
  }, [sendParam]);

  const setFreezeHold = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, freeze_hold: v } : null);
    await sendParam({ FreezeHold: v });
  }, [sendParam]);

  const setRetriggerGlitch = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, retrigger_glitch: v } : null);
    await sendParam({ RetriggerGlitch: v });
  }, [sendParam]);

  const setRetriggerFreeze = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, retrigger_freeze: v } : null);
    await sendParam({ RetriggerFreeze: v });
  }, [sendParam]);

  // DIP switches - Left bank
  const setDipSize = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_size: v } : null);
    await sendParam({ DipSize: v });
  }, [sendParam]);

  const setDipError = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_error: v } : null);
    await sendParam({ DipError: v });
  }, [sendParam]);

  const setDipSustain = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_sustain: v } : null);
    await sendParam({ DipSustain: v });
  }, [sendParam]);

  const setDipTexture = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_texture: v } : null);
    await sendParam({ DipTexture: v });
  }, [sendParam]);

  const setDipOctave = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_octave: v } : null);
    await sendParam({ DipOctave: v });
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

  const setDipDuck = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_duck: v } : null);
    await sendParam({ DipDuck: v });
  }, [sendParam]);

  const setDipReverse = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_reverse: v } : null);
    await sendParam({ DipReverse: v });
  }, [sendParam]);

  const setDipHalfSpeed = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_half_speed: v } : null);
    await sendParam({ DipHalfSpeed: v });
  }, [sendParam]);

  const setDipManual = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, dip_manual: v } : null);
    await sendParam({ DipManual: v });
  }, [sendParam]);

  // Utility
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

  const setTrails = useCallback(async (v: boolean) => {
    setState(p => p ? { ...p, trails: v } : null);
    await sendParam({ Trails: v });
  }, [sendParam]);

  const setExpression = useCallback(async (v: number) => {
    setState(p => p ? { ...p, expression: v } : null);
    await sendParam({ Expression: v });
  }, [sendParam]);

  // Preset management
  const loadPreset = useCallback(async (
    newState: OnwardState,
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
      setHookError(null);
      if (!skipMidiSend) {
        await recallOnwardPreset(deviceName, newState);
      }
    } catch (err) {
      console.error('Failed to load preset:', err);
      setHookError(err instanceof Error ? err.message : 'Failed to load preset');
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
    setSize, setMix, setOctave, setError, setSustain, setTexture, setRampSpeed,
    setErrorType, setFadeMode, setAnimateMode,
    setSensitivity, setBalance, setDuckDepth, setErrorBlend, setUserFade, setFilter,
    setErrorRouting, setSustainRouting, setEffectsRouting,
    setFreezeBypass, setGlitchBypass, setAltMode, setGlitchHold, setFreezeHold,
    setRetriggerGlitch, setRetriggerFreeze,
    setDipSize, setDipError, setDipSustain, setDipTexture, setDipOctave,
    setDipBounce, setDipSweep, setDipPolarity,
    setDipMiso, setDipSpread, setDipLatch, setDipSidechain,
    setDipDuck, setDipReverse, setDipHalfSpeed, setDipManual,
    setMidiClockIgnore, setRampBounce, setDryKill, setTrails, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  };
}
