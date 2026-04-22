// Microcosm MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { MicrocosmState, MicrocosmParameter } from './types';

const NOON = 63;

export function defaultMicrocosmState(): MicrocosmState {
  return {
    current_effect: 'Mosaic',
    current_variation: 'A',
    subdivision: 'Tap',
    time: NOON,
    hold_sampler: false,
    tempo_mode: false,
    activity: NOON,
    repeats: NOON,
    shape: 'Triangle',
    frequency: NOON,
    depth: NOON,
    cutoff: NOON,
    resonance: NOON,
    mix: NOON,
    volume: NOON,
    reverse_effect: false,
    bypass: false,
    space: NOON,
    reverb_time: NOON,
    loop_level: NOON,
    looper_speed: NOON,
    looper_speed_stepped: 'Tap',
    fade_time: NOON,
    looper_enabled: false,
    playback_direction: 'Forward',
    routing: 'PostFX',
    looper_only: false,
    burst_mode: false,
    quantized: false,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectMicrocosm(deviceName: string, midiChannel = 1): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'Microcosm' });
}

export async function sendMicrocosmParameter(
  deviceName: string,
  param: MicrocosmParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function sendMicrocosmProgramChange(
  deviceName: string,
  program: number
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  entry.output.send([0xc0 | (entry.channel - 1), program]);
}

export async function getMicrocosmState(_deviceName: string): Promise<MicrocosmState> {
  return defaultMicrocosmState();
}

export async function recallMicrocosmPreset(
  deviceName: string,
  state: MicrocosmState
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}
