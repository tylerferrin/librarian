import './styles/globals.css';
import { useEffect } from 'react';
import { useMIDIConnection } from './hooks/useMIDIConnection';
import { DeviceSelector } from './components/DeviceSelector';
import { MainLayout } from './components/MainLayout';
import { MicrocosmEditor } from './components/pedals/microcosm';
import * as midi from './lib/midi/pedals/microcosm';

function App() {
  const { 
    devices, 
    connectedDevice, 
    isConnecting, 
    isRefreshing,
    error,
    refreshDevices, 
    connect, 
    disconnect 
  } = useMIDIConnection();

  // Expose MIDI functions to window for console testing (dev only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).midi = midi;
      console.log('✅ MIDI functions available via window.midi');
    }
  }, []);

  // Refresh device list on mount
  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  return (
    <div className="min-h-screen bg-app-bg text-text-primary">
      {!connectedDevice ? (
        <DeviceSelector
          devices={devices}
          isRefreshing={isRefreshing}
          isConnecting={isConnecting}
          error={error}
          onConnect={connect}
          onRefresh={refreshDevices}
        />
      ) : (
        <MainLayout deviceInfo={connectedDevice} onDisconnect={disconnect}>
          <MicrocosmEditor deviceName={connectedDevice.name} />
        </MainLayout>
      )}
    </div>
  );
}

export default App;
