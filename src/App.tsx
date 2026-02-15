import './styles/globals.css';
import { useEffect, useState } from 'react';
import { useMIDIConnection } from './hooks/useMIDIConnection';
import { DeviceSelector } from './components/DeviceSelector';
import { MainLayout } from './components/MainLayout';
import { MicrocosmEditor } from './components/pedals/microcosm';
import { ChromaConsoleEditor } from './components/pedals/chroma_console';
import { DeviceMismatchWarning } from './components/DeviceMismatchWarning';
import { pedalRegistry } from './lib/midi/pedalRegistry';
import { detectDeviceMismatch } from './lib/midi/deviceMismatchDetection';
import type { PedalType } from './lib/midi/types';

// Import all pedal modules to trigger self-registration
import './lib/midi/pedals/microcosm';
import './lib/midi/pedals/gen-loss-mkii';
import './lib/midi/pedals/chroma_console';

// Expose MIDI for console testing (dev only)
import * as midi from './lib/midi/pedals/microcosm';

// Coming Soon component for pedals without editors
function ComingSoonEditor({ pedalType }: { pedalType: PedalType }) {
  const pedalDef = pedalRegistry.get(pedalType);
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">{pedalDef?.icon || '🎛️'}</div>
        <h2 className="text-2xl font-bold mb-2 text-text-primary">
          {pedalDef?.name || pedalType}
        </h2>
        <p className="text-text-secondary mb-4">{pedalDef?.manufacturer}</p>
        <div className="px-4 py-2 bg-warning/10 border border-warning/30 rounded-md inline-block">
          <p className="text-sm text-warning">Editor coming soon!</p>
        </div>
      </div>
    </div>
  );
}

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

  // Active pedal type state - defaults to connected device's type
  const [activePedalType, setActivePedalType] = useState<PedalType>('Microcosm');
  const [showMismatchWarning, setShowMismatchWarning] = useState(false);

  // Update active pedal type when device connects
  useEffect(() => {
    if (connectedDevice) {
      setActivePedalType(connectedDevice.pedal_type);
      setShowMismatchWarning(false); // Reset warning on new connection
    }
  }, [connectedDevice]);

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

  // Handle pedal switching
  const handleSwitchPedal = (newPedalType: PedalType) => {
    // TODO: Add unsaved changes warning in future
    // For now, just switch directly
    setActivePedalType(newPedalType);
    setShowMismatchWarning(true); // Show warning after switching
  };

  // Detect device mismatch
  const deviceMismatch = connectedDevice
    ? detectDeviceMismatch(connectedDevice.name, activePedalType)
    : null;

  // Render the appropriate editor based on active pedal type
  const renderEditor = () => {
    if (!connectedDevice) return null;

    const pedalDef = pedalRegistry.get(activePedalType);
    
    // Check if pedal has an editor
    if (!pedalDef?.hasEditor) {
      return <ComingSoonEditor pedalType={activePedalType} />;
    }

    // Render the appropriate editor
    switch (activePedalType) {
      case 'Microcosm':
        return <MicrocosmEditor deviceName={connectedDevice.name} />;
      case 'ChromaConsole':
        return <ChromaConsoleEditor deviceName={connectedDevice.name} />;
      case 'GenLossMkii':
        return <ComingSoonEditor pedalType={activePedalType} />;
      default:
        return <ComingSoonEditor pedalType={activePedalType} />;
    }
  };

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
        <MainLayout 
          deviceInfo={connectedDevice} 
          activePedalType={activePedalType}
          onDisconnect={disconnect}
          onSwitchPedal={handleSwitchPedal}
        >
          {/* Device Mismatch Warning */}
          {deviceMismatch?.isMismatch && showMismatchWarning && (
            <div className="px-6 pt-4">
              <DeviceMismatchWarning
                mismatch={deviceMismatch}
                onDismiss={() => setShowMismatchWarning(false)}
                onDisconnect={disconnect}
              />
            </div>
          )}
          
          {renderEditor()}
        </MainLayout>
      )}
    </div>
  );
}

export default App;
