import { useState, useCallback } from 'react';
import * as midiCommon from '../lib/midi';
import { connectMicrocosm } from '../lib/midi/pedals/microcosm';
import { connectGenLossMkii } from '../lib/midi/pedals/gen-loss-mkii';
import { connectChromaConsole } from '../lib/midi/pedals/chroma_console';
import { connectPreampMk2 } from '../lib/midi/pedals/preamp_mk2';
import type { DeviceInfo, PedalType } from '../lib/midi';

export function useMIDIConnection() {
  const [devices, setDevices] = useState<string[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<DeviceInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const deviceList = await midiCommon.listMidiDevices();
      setDevices(deviceList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list MIDI devices');
      setDevices([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const connect = useCallback(async (deviceName: string, channel: number = 1, pedalType: PedalType = 'Microcosm') => {
    setIsConnecting(true);
    setError(null);

    try {
      const targetChannel = pedalType === 'PreampMk2' ? 2 : channel;

      // Call the appropriate connect function based on pedal type
      switch (pedalType) {
        case 'Microcosm':
          await connectMicrocosm(deviceName, targetChannel);
          break;
        case 'GenLossMkii':
          await connectGenLossMkii(deviceName, targetChannel);
          break;
        case 'ChromaConsole':
          await connectChromaConsole(deviceName, targetChannel);
          break;
        case 'PreampMk2':
          await connectPreampMk2(deviceName, targetChannel);
          break;
        default:
          throw new Error(`Unknown pedal type: ${pedalType}`);
      }
      
      // Verify connection by getting connected devices
      const connectedDevices = await midiCommon.listConnectedDevices();
      const device = connectedDevices.find(d => d.name === deviceName);
      
      if (device) {
        setConnectedDevice(device);
      } else {
        throw new Error('Device connected but not found in connected devices list');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
      setConnectedDevice(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!connectedDevice) return;

    try {
      await midiCommon.disconnectDevice(connectedDevice.name);
      setConnectedDevice(null);
      setError(null);
      
      // Refresh device list after disconnect
      await refreshDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect from device');
    }
  }, [connectedDevice, refreshDevices]);

  return {
    devices,
    connectedDevice,
    isConnecting,
    isRefreshing,
    error,
    refreshDevices,
    connect,
    disconnect,
  };
}
