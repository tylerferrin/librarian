// Brothers AM MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { BrothersAmState, BrothersAmParameter } from './types';

export function defaultBrothersAmState(): BrothersAmState {
  return {
    gain2: 63, volume2: 63, tone2: 63, presence2: 63,
    gain1: 63, volume1: 63, tone1: 63, presence1: 63,
    gain2_type: 'OD', treble_boost: 'Off', gain1_type: 'OD',
    channel1_bypass: false, channel2_bypass: false,
    dip_volume1: false, dip_volume2: false, dip_gain1: false, dip_gain2: false,
    dip_tone1: false, dip_tone2: false, dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_hi_gain1: false, dip_hi_gain2: false, dip_moto_byp1: false,
    dip_moto_byp2: false, dip_pres_link1: false, dip_pres_link2: false, dip_master: false,
    expression: 0,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectBrothersAm(deviceName: string, midiChannel = 2): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'BrothersAm' });
}

export async function sendBrothersAmParameter(
  deviceName: string,
  param: BrothersAmParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function getBrothersAmState(_deviceName: string): Promise<BrothersAmState> {
  return defaultBrothersAmState();
}

export async function recallBrothersAmPreset(
  deviceName: string,
  state: BrothersAmState
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function saveBrothersAmPreset(deviceName: string, slot: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
