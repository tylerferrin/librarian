// Preamp MK II MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { PreampMk2State, PreampMk2Parameter } from './types';

export function defaultPreampMk2State(): PreampMk2State {
  return {
    volume: 63, treble: 63, mids: 63, frequency: 63, bass: 63, gain: 63,
    jump: 'Off', mids_position: 'Off', q_resonance: 'Low',
    diode_clipping: 'Off', fuzz_mode: 'Off',
    expression: 0, bypass: false,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectPreampMk2(deviceName: string, midiChannel = 1): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'PreampMk2' });
}

export async function sendPreampMk2Parameter(
  deviceName: string,
  param: PreampMk2Parameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function sendPreampMk2ProgramChange(
  deviceName: string,
  program: number
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  entry.output.send([0xc0 | (entry.channel - 1), program]);
}

export async function getPreampMk2State(_deviceName: string): Promise<PreampMk2State> {
  return defaultPreampMk2State();
}

export async function recallPreampMk2Preset(
  deviceName: string,
  state: PreampMk2State
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function savePreampMk2Preset(deviceName: string, slot: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
