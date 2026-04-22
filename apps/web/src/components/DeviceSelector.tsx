import { useState, useEffect } from 'react';
import { pedalRegistry } from '@/lib/midi/pedalRegistry';
import type { PedalType } from '@/lib/midi/types';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeviceIdentityDebug } from './DeviceIdentityDebug';
import { getPedalTypeForDevice, getMidiChannelForDevice, saveDeviceProfile, hasDeviceProfile } from '@/lib/midi/deviceProfiles';
import { assignChannelPc } from '@/lib/midi/api';

interface DeviceSelectorProps {
  devices: string[];
  isRefreshing: boolean;
  isConnecting: boolean;
  error: string | null;
  onConnect: (deviceName: string, channel: number, pedalType: PedalType) => void;
  onRefresh: () => void;
  /** Dev-only: simulate a connected pedal without real MIDI hardware */
  onConnectMock?: (pedalType: PedalType, channel?: number) => void;
}

function detectPedalType(deviceName: string): PedalType | null {
  const allPedals = pedalRegistry.getAll();
  const lowerName = deviceName.toLowerCase();
  const detected = allPedals.find((pedal) =>
    lowerName.includes(pedal.name.toLowerCase()) ||
    lowerName.includes(pedal.manufacturer.toLowerCase())
  );
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
  const savedChannel = getMidiChannelForDevice(deviceName);

  const [selectedPedalType, setSelectedPedalType] = useState<string>(
    savedProfile || detectedType || availablePedals[0]?.type || 'Microcosm'
  );
  const [showDropdown, setShowDropdown] = useState(!detectedType && !savedProfile);
  const [showIdentityDebug, setShowIdentityDebug] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(hasDeviceProfile(deviceName));
  const [showChannelAssign, setShowChannelAssign] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<{ ok: boolean; message: string } | null>(null);

  const selectedPedal = pedalRegistry.get(selectedPedalType);
  const defaultChannel = selectedPedal?.defaultMidiChannel ?? 1;
  const [selectedChannel, setSelectedChannel] = useState<number>(savedChannel ?? defaultChannel);

  useEffect(() => {
    if (!savedChannel) {
      const pedal = pedalRegistry.get(selectedPedalType);
      setSelectedChannel(pedal?.defaultMidiChannel ?? 1);
    }
  }, [selectedPedalType, savedChannel]);

  useEffect(() => {
    if (rememberDevice && selectedPedalType) {
      saveDeviceProfile(deviceName, selectedPedalType as PedalType, selectedChannel);
    }
  }, [rememberDevice, selectedPedalType, selectedChannel, deviceName]);

  useEffect(() => {
    setAssignResult(null);
  }, [selectedChannel]);

  const handleConnect = () => {
    onConnect(deviceName, selectedChannel, selectedPedalType as PedalType);
  };

  const handleAssignChannel = async () => {
    setIsAssigning(true);
    setAssignResult(null);
    try {
      await assignChannelPc(deviceName, selectedChannel);
      setAssignResult({ ok: true, message: `PC sent on channel ${selectedChannel}.` });
    } catch (err) {
      setAssignResult({ ok: false, message: String(err) });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="p-4 bg-card-header rounded-md transition-colors border border-border-light">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">{selectedPedal?.icon || '🎹'}</div>
          <div className="flex-1">
            <p className="font-medium text-text-primary">{deviceName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showDropdown || !detectedType ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Pedal Type:</label>
              <Select value={selectedPedalType} onValueChange={setSelectedPedalType} disabled={isConnecting}>
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

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary">MIDI Channel:</label>
            <Select
              value={String(selectedChannel)}
              onValueChange={(v) => setSelectedChannel(Number(v))}
              disabled={isConnecting}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#ffffff' }}>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
                  <SelectItem key={ch} value={String(ch)}>
                    {ch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

      {detectedType && !showDropdown && !savedProfile && (
        <div className="mt-2 text-xs text-success flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Auto-detected: {selectedPedal?.name}
        </div>
      )}

      {savedProfile && (
        <div className="mt-2 text-xs text-accent-blue flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Remembered: {selectedPedal?.name}
        </div>
      )}

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
        </div>
      )}

      <div className="mt-3 border-t border-border-light pt-3">
        <button
          onClick={() => { setShowChannelAssign(!showChannelAssign); setAssignResult(null); }}
          className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className={`w-3 h-3 transition-transform ${showChannelAssign ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Assign channel to pedal
        </button>
        {showChannelAssign && (
          <div className="mt-2 p-3 rounded-md border border-border-default" style={{ backgroundColor: '#f9fafb' }}>
            <p className="text-xs text-text-secondary mb-2">
              Put the pedal in channel reassignment mode, then click below.
            </p>
            <button
              onClick={handleAssignChannel}
              disabled={isAssigning || isConnecting}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
            >
              {isAssigning ? 'Sending...' : `Send PC on channel ${selectedChannel}`}
            </button>
            {assignResult && (
              <p className={`mt-2 text-xs ${assignResult.ok ? 'text-accent-green' : 'text-accent-red'}`}>
                {assignResult.ok ? '✓' : '✗'} {assignResult.message}
              </p>
            )}
          </div>
        )}
      </div>

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
  onConnectMock,
}: DeviceSelectorProps) {
  const availablePedals = pedalRegistry.getAll();
  const [mockPedalType, setMockPedalType] = useState<string>(
    availablePedals[0]?.type || 'Microcosm'
  );
  const [hasScanned, setHasScanned] = useState(false);
  const { user, logout } = useAuth();

  const midiSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;

  const handleRefresh = () => {
    setHasScanned(true);
    onRefresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="absolute top-4 right-6 flex items-center gap-3">
        <span className="text-sm text-text-muted">{user?.email}</span>
        <button onClick={logout} className="text-sm text-text-muted hover:text-text-primary transition-colors">
          Sign out
        </button>
      </div>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-text-primary">Librarian</h1>
          <p className="text-text-secondary">Connect to your MIDI pedal to get started</p>
        </div>

        <div className="bg-card-bg border border-border-light rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Available MIDI Devices</h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isConnecting || !midiSupported}
              className="cursor-pointer px-4 py-2 text-sm bg-card-bg hover:bg-control-hover border border-control-border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? 'Scanning...' : 'Refresh'}
            </button>
          </div>

          {!midiSupported && (
            <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-md">
              <p className="text-sm text-warning font-medium">Web MIDI is not supported in this browser.</p>
              <p className="text-xs text-text-secondary mt-1">
                Please use Chrome, Edge, or Opera. Safari and Firefox do not support the Web MIDI API.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-md">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {isRefreshing ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 mx-auto mb-4 border-2 border-accent-blue border-t-transparent rounded-full" />
              <p className="text-sm text-text-secondary">Scanning for MIDI devices...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-text-muted mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <p className="text-lg mb-2 text-text-primary">
                  {hasScanned ? 'No MIDI devices found' : 'No MIDI devices found'}
                </p>
                <p className="text-sm text-text-secondary">
                  {hasScanned
                    ? 'Make sure your device is plugged in and powered on, then try again.'
                    : 'Make sure your device is plugged in and powered on, then click Scan for Devices.'}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={!midiSupported}
                className="cursor-pointer mt-2 px-6 py-2 rounded-md transition-colors hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                {hasScanned ? 'Scan Again' : 'Scan for Devices'}
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
        </div>

        {/* Dev-mode mock connection */}
        {import.meta.env.DEV && onConnectMock && (
          <div className="mt-6 bg-warning/5 border border-warning/20 rounded-lg p-4">
            <p className="text-sm font-medium text-warning mb-3">
              Dev Mode — simulate a connected pedal
            </p>
            <div className="flex items-center gap-3">
              <Select value={mockPedalType} onValueChange={setMockPedalType}>
                <SelectTrigger className="flex-1">
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
              <button
                onClick={() => onConnectMock(mockPedalType as PedalType)}
                className="px-4 py-2 text-sm rounded-md whitespace-nowrap"
                style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
              >
                Open Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
