// Mood MkII MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { MoodMkiiState, MoodMkiiParameter } from './types';

export function defaultMoodMkiiState(): MoodMkiiState {
  return {
    time: 63, mix: 63, length: 63, modify_wet: 63, clock: 63, modify_looper: 63, ramp_speed: 63,
    wet_channel_routing: 'Delay', routing: 'Mid', micro_looper: 'Tape',
    stereo_width: 63, ramping_waveform: 0, fade: 63, tone: 63, level_balance: 63, direct_micro_loop: 0,
    sync: 'NoSync', spread: 'Both', buffer_length: false,
    bypass_left: false, bypass_right: false, hidden_menu: false, freeze: false, overdub: false,
    dip_time: false, dip_modify_wet: false, dip_clock: false, dip_modify_looper: false,
    dip_length: false, dip_bounce: false, dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_classic: false, dip_miso: false, dip_spread: false, dip_dry_kill: false,
    dip_trails: false, dip_latch: false, dip_no_dub: false, dip_smooth: false,
    midi_clock_ignore: false, ramp_bounce: false, expression: 0,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectMoodMkii(deviceName: string, midiChannel = 2): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'MoodMkii' });
}

export async function sendMoodMkiiParameter(
  deviceName: string,
  param: MoodMkiiParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function getMoodMkiiState(_deviceName: string): Promise<MoodMkiiState> {
  return defaultMoodMkiiState();
}

export async function recallMoodMkiiPreset(
  deviceName: string,
  state: MoodMkiiState
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function saveMoodMkiiPreset(deviceName: string, slot: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
