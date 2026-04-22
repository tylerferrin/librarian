// Chroma Console MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { ChromaConsoleState, ChromaConsoleParameter } from './types';

export function defaultChromaConsoleState(): ChromaConsoleState {
  return {
    tilt: 63, rate: 63, time: 63, mix: 63,
    amount_character: 63, amount_movement: 63, amount_diffusion: 63, amount_texture: 63,
    sensitivity: 63, drift_movement: 0, drift_diffusion: 0, output_level: 100,
    effect_vol_character: 63, effect_vol_movement: 63, effect_vol_diffusion: 63, effect_vol_texture: 63,
    character_module: 'Drive', movement_module: 'Doubler',
    diffusion_module: 'Cascade', texture_module: 'Filter',
    bypass_state: 'Engaged',
    character_bypass: false, movement_bypass: false,
    diffusion_bypass: false, texture_bypass: false,
    gesture_mode: 'Play', capture_mode: 'Stop',
    capture_routing: 'PostFx', filter_mode: 'Lpf',
    calibration_level: 'Low',
    signal_path: ['character', 'movement', 'diffusion', 'texture'],
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectChromaConsole(deviceName: string, midiChannel = 1): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'ChromaConsole' });
}

export async function sendChromaConsoleParameter(
  deviceName: string,
  param: ChromaConsoleParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function sendChromaConsoleProgramChange(
  deviceName: string,
  program: number
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  entry.output.send([0xc0 | (entry.channel - 1), program]);
}

export async function getChromaConsoleState(_deviceName: string): Promise<ChromaConsoleState> {
  return defaultChromaConsoleState();
}

export async function recallChromaConsolePreset(
  deviceName: string,
  state: ChromaConsoleState
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}
