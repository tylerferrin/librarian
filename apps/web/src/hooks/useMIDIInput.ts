import { useEffect, useRef } from 'react';
import { midiAccess } from '../lib/midi/midiAccess';

export interface MidiCCEvent {
  device_name: string;
  pedal_type: string;
  channel: number;
  cc_number: number;
  value: number;
}

export type MidiCCCallback = (event: MidiCCEvent) => void;

/**
 * Hook to listen for incoming MIDI CC messages from a connected pedal.
 * Wires into the Web MIDI API input port matching deviceName.
 */
export function useMIDIInput(callback: MidiCCCallback, deviceName?: string): void {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!deviceName) return;

    let cleanup: () => void = () => {};

    midiAccess.getInput(deviceName).then((input) => {
      if (!input) return;

      const handler = (e: Event) => {
        const midiEvent = e as MIDIMessageEvent;
        const data = midiEvent.data;
        if (!data || data.length < 3) return;
        // Only handle Control Change messages (0xB0–0xBF)
        if ((data[0] & 0xf0) !== 0xb0) return;

        cbRef.current({
          device_name: deviceName,
          pedal_type: '',
          channel: (data[0] & 0x0f) + 1,
          cc_number: data[1],
          value: data[2],
        });
      };

      input.addEventListener('midimessage', handler);
      cleanup = () => input.removeEventListener('midimessage', handler);
    });

    return () => cleanup();
  }, [deviceName]);
}
