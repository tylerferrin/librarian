// CXM 1978 MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { Cxm1978State, Cxm1978Parameter } from './types';

export function defaultCxm1978State(): Cxm1978State {
  return {
    bass: 63, mids: 63, cross: 63, treble: 63, mix: 63, pre_dly: 0,
    jump: 'Off', reverb_type: 'Room', diffusion: 'Low',
    tank_mod: 'Low', clock: 'HiFi',
    expression: 0, bypass: false,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectCxm1978(deviceName: string, midiChannel = 1): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'Cxm1978' });
}

export async function sendCxm1978Parameter(
  deviceName: string,
  param: Cxm1978Parameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function sendCxm1978ProgramChange(deviceName: string, program: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  entry.output.send([0xc0 | (entry.channel - 1), program]);
}

export async function getCxm1978State(_deviceName: string): Promise<Cxm1978State> {
  return defaultCxm1978State();
}

export async function recallCxm1978Preset(deviceName: string, state: Cxm1978State): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function saveCxm1978Preset(deviceName: string, slot: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
