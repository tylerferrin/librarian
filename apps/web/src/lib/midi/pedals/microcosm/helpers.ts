// Microcosm helper functions

import type { 
  EffectType, 
  EffectVariation, 
  MicrocosmParameter,
  SubdivisionValue,
  WaveformShape,
  PlaybackDirection,
  LooperRouting
} from './types';

/**
 * Get the MIDI program number for an effect + variation
 * 
 * Note: The UI labels are swapped from the pedal's internal labels for some effects.
 * This mapping handles that translation.
 */
export function getEffectProgramNumber(effect: EffectType, variation: EffectVariation): number {
  const effectBaseMap: Record<EffectType, number> = {
    // Glitch bank (programs 0-11) - UI/pedal label swaps
    Blocks: 8,      // UI: Blocks → Pedal: Arp
    Interrupt: 4,   // UI: Interrupt → Pedal: Interrupt
    Arp: 0,         // UI: Arp → Pedal: Blocks
    // Micro Loop bank (programs 12-23) - UI/pedal label swaps
    Mosaic: 20,     // UI: Mosaic → Pedal: Glide
    Seq: 16,        // UI: Seq → Pedal: Seq
    Glide: 12,      // UI: Glide → Pedal: Mosaic
    // Granules bank (programs 24-35)
    Haze: 24, Tunnel: 28, Strum: 32,
    // Multi Delay bank (programs 36-43)
    Pattern: 36, Warp: 40,
  };
  const variationOffset: Record<EffectVariation, number> = { A: 0, B: 1, C: 2, D: 3 };
  return effectBaseMap[effect] + variationOffset[variation];
}

/**
 * Helper functions for building Microcosm parameters
 * These create properly typed parameter objects for sending to the backend
 */
export const MicrocosmParams = {
  // Time
  subdivision: (value: SubdivisionValue): MicrocosmParameter => ({ Subdivision: value }),
  time: (value: number): MicrocosmParameter => ({ Time: value }),
  holdSampler: (value: boolean): MicrocosmParameter => ({ HoldSampler: value }),
  tapTempo: (): MicrocosmParameter => 'TapTempo',
  
  // Special Sauce
  activity: (value: number): MicrocosmParameter => ({ Activity: value }),
  repeats: (value: number): MicrocosmParameter => ({ Repeats: value }),
  
  // Modulation
  shape: (value: WaveformShape): MicrocosmParameter => ({ Shape: value }),
  frequency: (value: number): MicrocosmParameter => ({ Frequency: value }),
  depth: (value: number): MicrocosmParameter => ({ Depth: value }),
  
  // Filter
  cutoff: (value: number): MicrocosmParameter => ({ Cutoff: value }),
  resonance: (value: number): MicrocosmParameter => ({ Resonance: value }),
  
  // Effect
  mix: (value: number): MicrocosmParameter => ({ Mix: value }),
  volume: (value: number): MicrocosmParameter => ({ Volume: value }),
  reverseEffect: (value: boolean): MicrocosmParameter => ({ ReverseEffect: value }),
  bypass: (value: boolean): MicrocosmParameter => ({ Bypass: value }),
  
  // Reverb
  space: (value: number): MicrocosmParameter => ({ Space: value }),
  reverbTime: (value: number): MicrocosmParameter => ({ ReverbTime: value }),
  
  // Looper
  loopLevel: (value: number): MicrocosmParameter => ({ LoopLevel: value }),
  looperSpeed: (value: number): MicrocosmParameter => ({ LooperSpeed: value }),
  looperSpeedStepped: (value: SubdivisionValue): MicrocosmParameter => ({ LooperSpeedStepped: value }),
  fadeTime: (value: number): MicrocosmParameter => ({ FadeTime: value }),
  looperEnabled: (value: boolean): MicrocosmParameter => ({ LooperEnabled: value }),
  playbackDirection: (value: PlaybackDirection): MicrocosmParameter => ({ PlaybackDirection: value }),
  routing: (value: LooperRouting): MicrocosmParameter => ({ Routing: value }),
  looperOnly: (value: boolean): MicrocosmParameter => ({ LooperOnly: value }),
  burstMode: (value: boolean): MicrocosmParameter => ({ BurstMode: value }),
  quantized: (value: boolean): MicrocosmParameter => ({ Quantized: value }),
  
  // Looper transport
  looperRecord: (): MicrocosmParameter => 'LooperRecord',
  looperPlay: (): MicrocosmParameter => 'LooperPlay',
  looperOverdub: (): MicrocosmParameter => 'LooperOverdub',
  looperStop: (): MicrocosmParameter => 'LooperStop',
  looperErase: (): MicrocosmParameter => 'LooperErase',
  looperUndo: (): MicrocosmParameter => 'LooperUndo',
  
  // Preset
  presetCopy: (): MicrocosmParameter => 'PresetCopy',
  presetSave: (): MicrocosmParameter => 'PresetSave',
};
