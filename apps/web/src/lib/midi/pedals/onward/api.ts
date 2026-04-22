// Onward MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { OnwardState, OnwardParameter } from './types';

export function defaultOnwardState(): OnwardState {
  return {
    size: 63, mix: 63, octave: 63, error: 63, sustain: 63, texture: 63, ramp_speed: 63,
    error_type: 'Timing', fade_mode: 'User', animate_mode: 'Off',
    sensitivity: 63, balance: 63, duck_depth: 0, error_blend: 63,
    user_fade: 63, filter: 63,
    error_routing: 'Both', sustain_routing: 'Both', effects_routing: 'Both',
    freeze_bypass: false, glitch_bypass: false, alt_mode: false,
    glitch_hold: false, freeze_hold: false,
    retrigger_glitch: false, retrigger_freeze: false,
    dip_size: false, dip_error: false, dip_sustain: false,
    dip_texture: false, dip_octave: false, dip_bounce: false,
    dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_miso: false, dip_spread: false, dip_latch: false, dip_sidechain: false,
    dip_duck: false, dip_reverse: false, dip_half_speed: false, dip_manual: false,
    midi_clock_ignore: false, ramp_bounce: false, dry_kill: false, trails: false,
    expression: 0,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectOnward(deviceName: string, midiChannel = 2): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'Onward' });
}

export async function sendOnwardParameter(
  deviceName: string,
  param: OnwardParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function getOnwardState(_deviceName: string): Promise<OnwardState> {
  return defaultOnwardState();
}

export async function recallOnwardPreset(deviceName: string, state: OnwardState): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function saveOnwardPreset(deviceName: string, slot: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
