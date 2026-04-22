// Reverse Mode C MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { ReverseModeCState, ReverseModeCParameter } from './types';

export function defaultReverseModeCState(): ReverseModeCState {
  return {
    time: 63, mix: 63, feedback: 63, offset: 63, balance: 63, filter: 63, ramp_speed: 63,
    mod_sync: 'Off', mod_type: 'Vib', sequence_mode: 'Off',
    sequencer_subdivision: 63, ramping_waveform: 0, mod_depth: 0, mod_rate: 63,
    octave_type: 'BothOct', sequence_spacing: false,
    bypass: false, tap: false, alt_mode: false, freeze: false, half_speed: false,
    dip_time: false, dip_offset: false, dip_balance: false, dip_filter: false,
    dip_feed: false, dip_bounce: false, dip_sweep: 'Bottom', dip_polarity: 'Forward',
    dip_swap: false, dip_miso: false, dip_spread: false, dip_trails: false,
    dip_latch: false, dip_feed_type: false, dip_fade_type: false, dip_mod_type: false,
    midi_clock_ignore: false, ramp_bounce: false, dry_kill: false, expression: 0,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectReverseModeC(deviceName: string, midiChannel = 2): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'ReverseModeC' });
}

export async function sendReverseModeCParameter(
  deviceName: string,
  param: ReverseModeCParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(param), parameterCCValue(param));
}

export async function getReverseModeCState(_deviceName: string): Promise<ReverseModeCState> {
  return defaultReverseModeCState();
}

export async function recallReverseModeCPreset(
  deviceName: string,
  state: ReverseModeCState
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function saveReverseModeCPreset(deviceName: string, slot: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
