// Generic MIDI API — shared operations not tied to a specific pedal type
import { invoke } from '@tauri-apps/api/core';

/**
 * Send a Program Change on the given channel to the named MIDI device without
 * establishing a persistent connection. Intended for triggering channel
 * reassignment on pedals that treat the first received PC as a new channel
 * assignment (e.g. Chase Bliss Audio pedals in reassignment mode).
 */
export async function assignChannelPc(
  deviceName: string,
  channel: number
): Promise<void> {
  return invoke('assign_channel_pc', { deviceName, channel });
}
