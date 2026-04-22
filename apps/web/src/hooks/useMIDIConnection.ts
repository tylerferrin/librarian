import { useState, useCallback, useEffect } from 'react';
import { midiAccess } from '../lib/midi/midiAccess';
import { connectionRegistry } from '../lib/midi/connectionRegistry';
import { connectMicrocosm } from '../lib/midi/pedals/microcosm';
import { connectGenLossMkii } from '../lib/midi/pedals/gen-loss-mkii';
import { connectChromaConsole } from '../lib/midi/pedals/chroma_console';
import { connectPreampMk2 } from '../lib/midi/pedals/preamp_mk2';
import { connectCxm1978 } from '../lib/midi/pedals/cxm1978';
import { connectClean } from '../lib/midi/pedals/clean';
import { connectOnward } from '../lib/midi/pedals/onward';
import { connectBrothersAm } from '../lib/midi/pedals/brothers-am';
import { connectReverseModeC } from '../lib/midi/pedals/reverse-mode-c';
import { connectMoodMkii } from '../lib/midi/pedals/mood-mkii';
import { connectBillyStringsWombtone } from '../lib/midi/pedals/billy-strings-wombtone';
import { connectLossy } from '../lib/midi/pedals/lossy';
import type { DeviceInfo, PedalType } from '../lib/midi/types';

export function useMIDIConnection() {
  const [devices, setDevices] = useState<string[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<DeviceInfo | null>(() => {
    const existing = connectionRegistry.all();
    return existing.length > 0 ? existing[0] : null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const outputs = await midiAccess.listOutputNames();
      setDevices(outputs);
      if (outputs.length === 0) {
        const inputs = await midiAccess.listInputNames();
        if (inputs.length > 0) {
          setError(
            `Found ${inputs.length} MIDI input(s) but no outputs. Your device may be input-only, or check its USB connection.`
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list MIDI devices');
      setDevices([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Re-scan when devices are plugged/unplugged
  useEffect(() => {
    return midiAccess.onDeviceChange(() => {
      void refreshDevices();
    });
  }, [refreshDevices]);

  const connect = useCallback(
    async (deviceName: string, channel = 1, pedalType: PedalType = 'Microcosm') => {
      setIsConnecting(true);
      setError(null);

      try {
        switch (pedalType) {
          case 'Microcosm':
            await connectMicrocosm(deviceName, channel);
            break;
          case 'GenLossMkii':
            await connectGenLossMkii(deviceName, channel);
            break;
          case 'ChromaConsole':
            await connectChromaConsole(deviceName, channel);
            break;
          case 'PreampMk2':
            await connectPreampMk2(deviceName, channel);
            break;
          case 'Cxm1978':
            await connectCxm1978(deviceName, channel);
            break;
          case 'Clean':
            await connectClean(deviceName, channel);
            break;
          case 'Onward':
            await connectOnward(deviceName, channel);
            break;
          case 'BrothersAm':
            await connectBrothersAm(deviceName, channel);
            break;
          case 'ReverseModeC':
            await connectReverseModeC(deviceName, channel);
            break;
          case 'MoodMkii':
            await connectMoodMkii(deviceName, channel);
            break;
          case 'BillyStringsWombtone':
            await connectBillyStringsWombtone(deviceName, channel);
            break;
          case 'Lossy':
            await connectLossy(deviceName, channel);
            break;
          default:
            throw new Error(`Unknown pedal type: ${pedalType}`);
        }

        setConnectedDevice({ name: deviceName, pedal_type: pedalType, midi_channel: channel });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to device');
        setConnectedDevice(null);
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  const disconnect = useCallback(async () => {
    if (!connectedDevice) return;
    connectionRegistry.delete(connectedDevice.name);
    setConnectedDevice(null);
    setError(null);
    await refreshDevices();
  }, [connectedDevice, refreshDevices]);

  /**
   * Dev-only bypass: sets a fake DeviceInfo so editors are accessible without hardware.
   * Available only in import.meta.env.DEV builds.
   */
  const connectMock = useCallback(
    (pedalType: PedalType = 'Microcosm', channel = 1) => {
      if (!import.meta.env.DEV) return;
      setError(null);
      setConnectedDevice({
        name: `[Dev Mock] ${pedalType}`,
        pedal_type: pedalType,
        midi_channel: channel,
      });
    },
    []
  );

  return {
    devices,
    connectedDevice,
    isConnecting,
    isRefreshing,
    error,
    refreshDevices,
    connect,
    disconnect,
    /** Dev-only: simulate a connected device without real MIDI hardware */
    connectMock: import.meta.env.DEV ? connectMock : undefined,
  };
}
