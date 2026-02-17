// Hook for listening to incoming MIDI CC messages from connected pedals
// Updates UI state when knobs are turned on the physical device

import { useEffect, useCallback } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export interface MidiCCEvent {
  device_name: string;
  pedal_type: string;
  channel: number;
  cc_number: number;
  value: number;
}

export type MidiCCCallback = (event: MidiCCEvent) => void;

/**
 * Hook to listen for incoming MIDI CC messages from connected pedals
 * @param callback Function to call when a MIDI CC message is received
 * @param deviceName Optional device name to filter messages for a specific device
 */
export function useMIDIInput(callback: MidiCCCallback, deviceName?: string) {
  const handleMidiCC = useCallback((event: MidiCCEvent) => {
    // Filter by device name if specified
    if (deviceName && event.device_name !== deviceName) {
      return;
    }
    
    console.log('📥 MIDI CC received in UI:', {
      device: event.device_name,
      cc: event.cc_number,
      value: event.value,
    });
    
    callback(event);
  }, [callback, deviceName]);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    // Setup event listener
    const setupListener = async () => {
      try {
        unlisten = await listen<MidiCCEvent>('midi-cc-received', (event) => {
          handleMidiCC(event.payload);
        });
        
        console.log('✅ MIDI input listener registered');
      } catch (error) {
        console.error('❌ Failed to setup MIDI input listener:', error);
      }
    };

    setupListener();

    // Cleanup listener on unmount
    return () => {
      if (unlisten) {
        unlisten();
        console.log('🔌 MIDI input listener unregistered');
      }
    };
  }, [handleMidiCC]);
}
