import { useState, useCallback, useEffect, useRef } from 'react';
import * as midi from '../../../lib/midi/pedals/microcosm';
import type { MicrocosmState, MicrocosmParameter, EffectType, EffectVariation } from '../../../lib/midi/pedals/microcosm';

export function useMicrocosmEditor(deviceName: string) {
  const [state, setState] = useState<MicrocosmState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePreset, setActivePreset] = useState<{ id: string; name: string; state: MicrocosmState } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const throttleTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load initial state from backend
  useEffect(() => {
    midi.getMicrocosmState(deviceName)
      .then((s) => {
        setState(s);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Microcosm state:', err);
        setIsLoading(false);
      });
  }, [deviceName]);

  // Send a parameter with throttling for continuous controls
  const sendParam = useCallback(
    (param: MicrocosmParameter, throttleMs = 30) => {
      // Get a key for throttling
      const key = typeof param === 'string' ? param : Object.keys(param)[0];

      // Clear existing timer for this param
      const existing = throttleTimers.current.get(key);
      if (existing) clearTimeout(existing);

      // Set new throttled send
      const timer = setTimeout(() => {
        midi.sendMicrocosmParameter(deviceName, param).catch((err) => {
          console.error('MIDI send error:', err);
        });
        throttleTimers.current.delete(key);
      }, throttleMs);

      throttleTimers.current.set(key, timer);
    },
    [deviceName]
  );

  // Convenience methods that update local state + send MIDI

  // Mark as dirty when any parameter changes
  const markDirty = useCallback(() => {
    if (activePreset && !isDirty) {
      setIsDirty(true);
    }
  }, [activePreset, isDirty]);

  // Continuous parameters (0-127)
  const setActivity = useCallback((v: number) => {
    setState((s) => s ? { ...s, activity: v } : s);
    sendParam(midi.MicrocosmParams.activity(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setRepeats = useCallback((v: number) => {
    setState((s) => s ? { ...s, repeats: v } : s);
    sendParam(midi.MicrocosmParams.repeats(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setTime = useCallback((v: number) => {
    setState((s) => s ? { ...s, time: v } : s);
    sendParam(midi.MicrocosmParams.time(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setFrequency = useCallback((v: number) => {
    setState((s) => s ? { ...s, frequency: v } : s);
    sendParam(midi.MicrocosmParams.frequency(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setDepth = useCallback((v: number) => {
    setState((s) => s ? { ...s, depth: v } : s);
    sendParam(midi.MicrocosmParams.depth(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setCutoff = useCallback((v: number) => {
    setState((s) => s ? { ...s, cutoff: v } : s);
    sendParam(midi.MicrocosmParams.cutoff(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setResonance = useCallback((v: number) => {
    setState((s) => s ? { ...s, resonance: v } : s);
    sendParam(midi.MicrocosmParams.resonance(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setMix = useCallback((v: number) => {
    setState((s) => s ? { ...s, mix: v } : s);
    sendParam(midi.MicrocosmParams.mix(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setVolume = useCallback((v: number) => {
    setState((s) => s ? { ...s, volume: v } : s);
    sendParam(midi.MicrocosmParams.volume(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setSpace = useCallback((v: number) => {
    setState((s) => s ? { ...s, space: v } : s);
    sendParam(midi.MicrocosmParams.space(v));
    markDirty();
  }, [sendParam, markDirty]);

  // Looper continuous
  const setLoopLevel = useCallback((v: number) => {
    setState((s) => s ? { ...s, loop_level: v } : s);
    sendParam(midi.MicrocosmParams.loopLevel(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setLooperSpeed = useCallback((v: number) => {
    setState((s) => s ? { ...s, looper_speed: v } : s);
    sendParam(midi.MicrocosmParams.looperSpeed(v));
    markDirty();
  }, [sendParam, markDirty]);

  const setFadeTime = useCallback((v: number) => {
    setState((s) => s ? { ...s, fade_time: v } : s);
    sendParam(midi.MicrocosmParams.fadeTime(v));
    markDirty();
  }, [sendParam, markDirty]);

  // Stepped / Enum parameters
  const setSubdivision = useCallback((v: midi.SubdivisionValue) => {
    setState((s) => s ? { ...s, subdivision: v } : s);
    sendParam(midi.MicrocosmParams.subdivision(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setShape = useCallback((v: midi.WaveformShape) => {
    setState((s) => s ? { ...s, shape: v } : s);
    sendParam(midi.MicrocosmParams.shape(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setReverbTime = useCallback((v: number) => {
    setState((s) => s ? { ...s, reverb_time: v } : s);
    sendParam(midi.MicrocosmParams.reverbTime(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setLooperSpeedStepped = useCallback((v: midi.SubdivisionValue) => {
    setState((s) => s ? { ...s, looper_speed_stepped: v } : s);
    sendParam(midi.MicrocosmParams.looperSpeedStepped(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setPlaybackDirection = useCallback((v: midi.PlaybackDirection) => {
    setState((s) => s ? { ...s, playback_direction: v } : s);
    sendParam(midi.MicrocosmParams.playbackDirection(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setRouting = useCallback((v: midi.LooperRouting) => {
    setState((s) => s ? { ...s, routing: v } : s);
    sendParam(midi.MicrocosmParams.routing(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  // Boolean parameters
  const setBypass = useCallback((v: boolean) => {
    setState((s) => s ? { ...s, bypass: v } : s);
    sendParam(midi.MicrocosmParams.bypass(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setHoldSampler = useCallback((v: boolean) => {
    setState((s) => s ? { ...s, hold_sampler: v } : s);
    sendParam(midi.MicrocosmParams.holdSampler(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setLooperEnabled = useCallback((v: boolean) => {
    setState((s) => s ? { ...s, looper_enabled: v } : s);
    sendParam(midi.MicrocosmParams.looperEnabled(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setLooperOnly = useCallback((v: boolean) => {
    setState((s) => s ? { ...s, looper_only: v } : s);
    sendParam(midi.MicrocosmParams.looperOnly(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setBurstMode = useCallback((v: boolean) => {
    setState((s) => s ? { ...s, burst_mode: v } : s);
    sendParam(midi.MicrocosmParams.burstMode(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const setQuantized = useCallback((v: boolean) => {
    setState((s) => s ? { ...s, quantized: v } : s);
    sendParam(midi.MicrocosmParams.quantized(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  // Trigger actions (fire-and-forget)
  const tapTempo = useCallback(() => {
    sendParam(midi.MicrocosmParams.tapTempo(), 0);
  }, [sendParam]);

  const setReverseEffect = useCallback((v: boolean) => {
    setState((s) => s ? { ...s, reverse_effect: v } : s);
    sendParam(midi.MicrocosmParams.reverseEffect(v), 0);
    markDirty();
  }, [sendParam, markDirty]);

  const looperRecord = useCallback(() => {
    sendParam(midi.MicrocosmParams.looperRecord(), 0);
  }, [sendParam]);

  const looperPlay = useCallback(() => {
    sendParam(midi.MicrocosmParams.looperPlay(), 0);
  }, [sendParam]);

  const looperOverdub = useCallback(() => {
    sendParam(midi.MicrocosmParams.looperOverdub(), 0);
  }, [sendParam]);

  const looperStop = useCallback(() => {
    sendParam(midi.MicrocosmParams.looperStop(), 0);
  }, [sendParam]);

  const looperErase = useCallback(() => {
    sendParam(midi.MicrocosmParams.looperErase(), 0);
  }, [sendParam]);

  const looperUndo = useCallback(() => {
    sendParam(midi.MicrocosmParams.looperUndo(), 0);
  }, [sendParam]);

  const presetSave = useCallback(() => {
    sendParam(midi.MicrocosmParams.presetSave(), 0);
  }, [sendParam]);

  const presetCopy = useCallback(() => {
    sendParam(midi.MicrocosmParams.presetCopy(), 0);
  }, [sendParam]);

  // Effect / Preset selection (sends MIDI Program Change)
  const setEffect = useCallback((effect: EffectType, variation: EffectVariation) => {
    setState((s) => s ? { ...s, current_effect: effect, current_variation: variation } : s);
    const program = midi.getEffectProgramNumber(effect, variation);
    midi.sendMicrocosmProgramChange(deviceName, program).catch((err) => {
      console.error('MIDI program change error:', err);
    });
    markDirty();
  }, [deviceName, markDirty]);

  // Load a preset (updates both MIDI and local state)
  const loadPreset = useCallback(async (presetState: MicrocosmState, presetId?: string, presetName?: string) => {
    try {
      // Send to pedal
      await midi.recallMicrocosmPreset(deviceName, presetState);
      // Update local state
      setState(presetState);
      // Track the active preset
      if (presetId && presetName) {
        setActivePreset({ id: presetId, name: presetName, state: presetState });
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Failed to load preset:', err);
      throw err;
    }
  }, [deviceName]);

  // Reset to the active preset
  const resetToPreset = useCallback(async () => {
    if (activePreset) {
      await loadPreset(activePreset.state, activePreset.id, activePreset.name);
    }
  }, [activePreset, loadPreset]);

  // Clear the active preset (e.g., when manually creating new sounds)
  const clearActivePreset = useCallback(() => {
    setActivePreset(null);
    setIsDirty(false);
  }, []);

  // Refresh state from backend (useful after external changes)
  const refreshState = useCallback(async () => {
    try {
      const freshState = await midi.getMicrocosmState(deviceName);
      setState(freshState);
    } catch (err) {
      console.error('Failed to refresh state:', err);
    }
  }, [deviceName]);

  return {
    state,
    isLoading,
    // Preset tracking
    activePreset,
    isDirty,
    // State management
    loadPreset,
    resetToPreset,
    clearActivePreset,
    refreshState,
    // Continuous
    setActivity, setRepeats, setTime,
    setFrequency, setDepth,
    setCutoff, setResonance,
    setMix, setVolume, setSpace,
    // Looper continuous
    setLoopLevel, setLooperSpeed, setFadeTime,
    // Reverb
    setReverbTime,
    // Stepped
    setSubdivision, setShape,
    setLooperSpeedStepped, setPlaybackDirection, setRouting,
    // Boolean
    setBypass, setHoldSampler, setLooperEnabled,
    setLooperOnly, setBurstMode, setQuantized,
    // Boolean
    setReverseEffect,
    // Triggers
    tapTempo,
    looperRecord, looperPlay, looperOverdub, looperStop, looperErase, looperUndo,
    presetSave, presetCopy,
    // Effect selection
    setEffect,
  };
}
