// Lossy MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { LossyState, LossyParameter } from './types';

export function defaultLossyState(): LossyState {
  return {
    filter: 63, global: 63, reverb: 63, freq: 63, speed: 63, loss: 63, ramp_speed: 63,
    filter_slope: 'Db24', packet_mode: 'Clean', loss_effect: 'Standard',
    gate: 0, freezer: 0, verb_decay: 63, limiter_threshold: 127, auto_gain: 63, loss_gain: 63,
    weighting: 'Neutral',
    bypass: false, freeze_slushie: false, alt_mode: false, freeze_solid: false, gate_switch: false,
    dip_filter: false, dip_freq: false, dip_speed: false, dip_loss: false,
    dip_verb: false, dip_bounce: false, dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_miso: false, dip_spread: false, dip_trails: false, dip_latch: false,
    dip_pre_post: false, dip_slow: false, dip_invert: false, dip_all_wet: false,
    ramp_bounce: false, dry_kill: false, expression: 0,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectLossy(deviceName: string, midiChannel = 2): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'Lossy' });
}

export async function sendLossyParameter(
  deviceName: string,
  param: LossyParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function getLossyState(_deviceName: string): Promise<LossyState> {
  return defaultLossyState();
}

export async function recallLossyPreset(deviceName: string, state: LossyState): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function saveLossyPreset(deviceName: string, slot: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
