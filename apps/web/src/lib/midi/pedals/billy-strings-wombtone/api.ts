// Billy Strings Wombtone MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { BillyStringsWombtoneState, BillyStringsWombtoneParameter } from './types';

export function defaultBillyStringsWombtoneState(): BillyStringsWombtoneState {
  return {
    feed: 63, volume: 63, mix: 63, rate: 63, depth: 63, form: 63,
    ramp_speed: 63, note_division: 3,
    bypass: false, tap: false, midi_clock_ignore: false, expression: 0,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectBillyStringsWombtone(
  deviceName: string,
  midiChannel = 1
): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, {
    output,
    channel: midiChannel,
    pedalType: 'BillyStringsWombtone',
  });
}

export async function sendBillyStringsWombtoneParameter(
  deviceName: string,
  param: BillyStringsWombtoneParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function getBillyStringsWombtoneState(
  _deviceName: string
): Promise<BillyStringsWombtoneState> {
  return defaultBillyStringsWombtoneState();
}

export async function recallBillyStringsWombtonePreset(
  deviceName: string,
  state: BillyStringsWombtoneState
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function saveBillyStringsWombtonePreset(
  deviceName: string,
  slot: number
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
