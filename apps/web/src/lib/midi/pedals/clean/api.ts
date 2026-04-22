// Clean MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { CleanState, CleanParameter } from './types';

export function defaultCleanState(): CleanState {
  return {
    dynamics: 63, sensitivity: 63, wet: 63, attack: 63, eq: 63, dry: 63, ramp_speed: 63,
    release_mode: 'User', effect_mode: 'Manual', physics_mode: 'Off',
    noise_gate_release: 63, noise_gate_sens: 63, swell_in: 63, user_release: 63,
    balance_filter: 63, swell_out: 63, envelope_mode: 'Hybrid',
    shifty_mode: 0, spread_routing: 'Both',
    bypass: false, swell: false, alt_mode: false, swell_hold: false, dynamics_max: false,
    dip_dynamics: false, dip_attack: false, dip_eq: false, dip_dry: false,
    dip_wet: false, dip_bounce: false, dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_miso: false, dip_spread: false, dip_latch: false, dip_sidechain: false,
    dip_noise_gate: false, dip_motion: false, dip_swell_aux: false, dip_dusty: false,
    ramp_bounce: false, expression: 0,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectClean(deviceName: string, midiChannel = 2): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'Clean' });
}

export async function sendCleanParameter(
  deviceName: string,
  param: CleanParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function getCleanState(_deviceName: string): Promise<CleanState> {
  return defaultCleanState();
}

export async function recallCleanPreset(deviceName: string, state: CleanState): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function saveCleanPreset(deviceName: string, slot: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
