import { useState, useEffect } from 'react';
import { pedalRegistry } from '@/lib/midi/pedalRegistry';
import type { PedalType } from '@/lib/midi/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeviceIdentityDebug } from './DeviceIdentityDebug';
import { getPedalTypeForDevice, saveDeviceProfile, hasDeviceProfile } from '@/lib/midi/deviceProfiles';

interface DeviceSelectorProps {
  devices: string[];
  isRefreshing: boolean;
  isConnecting: boolean;
  error: string | null;
  onConnect: (deviceName: string, channel: number, pedalType: PedalType) => void;
  onRefresh: () => void;
}

// Detect pedal type from device name
function detectPedalType(deviceName: string): PedalType | null {
  const allPedals = pedalRegistry.getAll();
  const lowerName = deviceName.toLowerCase();
  
  // Try to match device name to pedal
  const detected = allPedals.find(pedal => {
    const pedalNameLower = pedal.name.toLowerCase();
    // Check if device name contains the pedal name or manufacturer
    return lowerName.includes(pedalNameLower) || 
           lowerName.includes(pedal.manufacturer.toLowerCase());
  });
  
  return detected ? (detected.type as PedalType) : null;
}

interface DeviceItemProps {
  deviceName: string;
  isConnecting: boolean;
  onConnect: (deviceName: string, channel: number, pedalType: PedalType) => void;
}

function DeviceItem({ deviceName, isConnecting, onConnect }: DeviceItemProps) {
  const availablePedals = pedalRegistry.getAll();
  const detectedType = detectPedalType(deviceName);
  const savedProfile = getPedalTypeForDevice(deviceName);
  
  // Priority: 1) Saved profile, 2) Name detection, 3) Default
  const [selectedPedalType, setSelectedPedalType] = useState<string>(
    savedProfile || detectedType || availablePedals[0]?.type || 'Microcosm'
  );
  const [showDropdown, setShowDropdown] = useState(!detectedType && !savedProfile);
  const [showIdentityDebug, setShowIdentityDebug] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(hasDeviceProfile(deviceName));
  
  const selectedPedal = pedalRegistry.get(selectedPedalType);

  // Update remember device state when pedal type changes
  useEffect(() => {
    if (rememberDevice && selectedPedalType) {
      saveDeviceProfile(deviceName, selectedPedalType as PedalType);
    }
  }, [rememberDevice, selectedPedalType, deviceName]);

  // Preamp MKII defaults to MIDI channel 2 per the manual
  const midiChannel = selectedPedalType === 'PreampMk2' ? 2 : 1;

  const handleConnect = () => {
    onConnect(deviceName, midiChannel, selectedPedalType as PedalType);
  };

  return (
    <div className="p-4 bg-card-header rounded-md transition-colors border border-border-light">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">{selectedPedal?.icon || '🎹'}</div>
          <div className="flex-1">
            <p className="font-medium text-text-primary">{deviceName}</p>
            <p className="text-sm text-text-secondary">MIDI Channel {midiChannel}</p>
          </div>
        </div>

        {/* Pedal Type Selection */}
        <div className="flex items-center gap-3">
          {showDropdown || !detectedType ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Pedal Type:</label>
              <Select
                value={selectedPedalType}
                onValueChange={setSelectedPedalType}
                disabled={isConnecting}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#ffffff' }}>
                  {availablePedals.map((pedal) => (
                    <SelectItem key={pedal.type} value={pedal.type}>
                      {pedal.icon} {pedal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <button
              onClick={() => setShowDropdown(true)}
              className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary border border-control-border rounded-md hover:bg-control-hover transition-colors"
              disabled={isConnecting}
            >
              Change Type
            </button>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
      
      {/* Auto-detection indicator */}
      {detectedType && !showDropdown && !savedProfile && (
        <div className="mt-2 text-xs text-success flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Auto-detected: {selectedPedal?.name}
        </div>
      )}

      {/* Saved profile indicator */}
      {savedProfile && (
        <div className="mt-2 text-xs text-accent-blue flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Remembered: {selectedPedal?.name}
        </div>
      )}

      {/* Remember device checkbox */}
      {!detectedType && (showDropdown || savedProfile) && (
        <div className="mt-2">
          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-text-primary">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="rounded border-control-border text-accent-blue focus:ring-accent-blue"
            />
            Remember this device
          </label>
          {rememberDevice && (
            <p className="text-xs text-text-muted mt-1 ml-5">
              App will auto-select {selectedPedal?.name} for "{deviceName}"
            </p>
          )}
        </div>
      )}

      {/* Device Identity Debug (DEV only) */}
      {import.meta.env.DEV && (
        <div className="mt-3">
          <button
            onClick={() => setShowIdentityDebug(!showIdentityDebug)}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            {showIdentityDebug ? '▼' : '▶'} Developer: Show Device Identity
          </button>
          {showIdentityDebug && (
            <div className="mt-2">
              <DeviceIdentityDebug deviceName={deviceName} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DeviceSelector({
  devices,
  isRefreshing,
  isConnecting,
  error,
  onConnect,
  onRefresh,
}: DeviceSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-text-primary">Librarian</h1>
          <p className="text-text-secondary">
            Connect to your MIDI pedal to get started
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card-bg border border-border-light rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Available MIDI Devices</h2>
            <button
              onClick={onRefresh}
              disabled={isRefreshing || isConnecting}
              className="px-4 py-2 text-sm bg-card-bg hover:bg-control-hover border border-control-border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? 'Scanning...' : 'Refresh'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-md">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Device List */}
          {devices.length === 0 && !isRefreshing ? (
            <div className="text-center py-12">
              <div className="text-text-muted mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
                <p className="text-lg mb-2 text-text-primary">No MIDI devices found</p>
                <p className="text-sm text-text-secondary">
                  Make sure your pedal is powered on and connected via USB or Bluetooth
                </p>
              </div>
              <button
                onClick={onRefresh}
                className="mt-4 px-6 py-2 rounded-md transition-colors"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                Scan for Devices
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((deviceName) => (
                <DeviceItem
                  key={deviceName}
                  deviceName={deviceName}
                  isConnecting={isConnecting}
                  onConnect={onConnect}
                />
              ))}
            </div>
          )}

          {/* Help Text */}
          {devices.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border-light">
              <p className="text-sm text-text-secondary">
                <strong>Tip:</strong> If you don't see your pedal, try:
              </p>
              <ul className="mt-2 text-sm text-text-secondary space-y-1 ml-4">
                <li>• Checking if it's powered on</li>
                <li>• Reconnecting the USB or Bluetooth connection</li>
                <li>• Clicking "Refresh" to scan again</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-text-secondary">
          <p>
            For setup instructions, see{' '}
            <span className="text-accent-blue font-medium">docs/midi/</span>
          </p>
        </div>
      </div>
    </div>
  );
}
