// Gen Loss MKII MIDI API — Web MIDI implementation

import { connectionRegistry } from '../../connectionRegistry';
import { midiAccess } from '../../midiAccess';
import { parameterCCNumber, parameterCCValue, stateToCCMap } from './mapper';
import type { GenLossMkiiState, GenLossMkiiParameter } from './types';

export function defaultGenLossState(): GenLossMkiiState {
  return {
    wow: 63, volume: 63, model: 'None', flutter: 63, saturate: 63,
    failure: 63, ramp_speed: 63,
    dry_mode: 'Dry1', noise_mode: 'Noise1', aux_mode: 'Aux1',
    bypass: false, aux_switch: false, alt_mode: false,
    left_switch: false, center_switch: false, right_switch: false,
    dip_wow: false, dip_flutter: false, dip_sat_gen: false,
    dip_failure_hp: false, dip_model_lp: false, dip_bounce: false,
    dip_random: false, dip_sweep: 'Bottom',
    dip_polarity: 'Forward', dip_classic: false, dip_miso: false,
    dip_spread: false, dip_dry_type: false, dip_drop_byp: false,
    dip_snag_byp: false, dip_hum_byp: false,
    expression: 0, aux_onset_time: 63, hiss_level: 0, mechanical_noise: 0,
    crinkle_pop: 0, input_gain: 'LineLevel', dsp_bypass: 'TrueBypass',
    ramp_bounce: false,
  };
}

function sendCC(output: MIDIOutput, channel: number, cc: number, value: number): void {
  output.send([0xb0 | (channel - 1), cc, value]);
}

export async function connectGenLossMkii(deviceName: string, midiChannel = 2): Promise<void> {
  const output = await midiAccess.getOutput(deviceName);
  if (!output) throw new Error(`MIDI output not found: ${deviceName}`);
  connectionRegistry.set(deviceName, { output, channel: midiChannel, pedalType: 'GenLossMkii' });
}

export async function sendGenLossParameter(
  deviceName: string,
  parameter: GenLossMkiiParameter
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, parameterCCNumber(parameter), parameterCCValue(parameter));
}

export async function getGenLossState(_deviceName: string): Promise<GenLossMkiiState> {
  return defaultGenLossState();
}

export async function recallGenLossPreset(
  deviceName: string,
  state: GenLossMkiiState
): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  for (const [cc, value] of stateToCCMap(state)) {
    sendCC(entry.output, entry.channel, cc, value);
  }
}

export async function saveGenLossPreset(deviceName: string, slot: number): Promise<void> {
  const entry = connectionRegistry.get(deviceName);
  if (!entry) return;
  sendCC(entry.output, entry.channel, 111, slot);
}
