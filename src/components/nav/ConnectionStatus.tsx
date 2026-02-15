// MIDI connection status display component
import { useState } from 'react';
import type { DeviceInfo, PedalType } from '@/lib/midi/types';
import { pedalRegistry } from '@/lib/midi/pedalRegistry';
import { detectDeviceMismatch } from '@/lib/midi/deviceMismatchDetection';
import { DeviceIdentityDebug } from '../DeviceIdentityDebug';

interface ConnectionStatusProps {
  deviceInfo: DeviceInfo;
  activePedalType: PedalType;
  onDisconnect: () => void;
}

export function ConnectionStatus({ deviceInfo, activePedalType, onDisconnect }: ConnectionStatusProps) {
  const pedalDef = pedalRegistry.get(deviceInfo.pedal_type);
  const mismatch = detectDeviceMismatch(deviceInfo.name, activePedalType);
  const [showIdentityDebug, setShowIdentityDebug] = useState(false);
  
  return (
    <div className="space-y-3">
      {/* Connection indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-sm text-text-secondary">Connected</span>
      </div>

      {/* Device information */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {pedalDef && <span className="text-xl">{pedalDef.icon}</span>}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-text-primary truncate">{deviceInfo.name}</p>
              {mismatch.isMismatch && mismatch.confidence === 'high' && (
                <span className="text-warning" title="Possible device mismatch">⚠️</span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              {pedalDef?.manufacturer || 'Unknown'} • Channel {deviceInfo.midi_channel}
            </p>
          </div>
        </div>
      </div>

      {/* Disconnect button */}
      <button
        onClick={onDisconnect}
        className="w-full px-3 py-2 text-sm bg-card-bg hover:bg-error/10 hover:text-error border border-control-border hover:border-error/30 rounded-md transition-colors"
      >
        Disconnect
      </button>

      {/* Device Identity Debug (DEV only) - Query connected pedal */}
      {import.meta.env.DEV && (
        <div className="mt-3 pt-3 border-t border-border-light">
          <button
            onClick={() => setShowIdentityDebug(!showIdentityDebug)}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors w-full text-left"
          >
            {showIdentityDebug ? '▼' : '▶'} Query Connected Pedal Identity
          </button>
          {showIdentityDebug && (
            <div className="mt-2">
              <DeviceIdentityDebug deviceName={deviceInfo.name} />
              <p className="text-xs text-text-secondary mt-2 italic">
                💡 Trying to detect the actual pedal behind the MIDI interface
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
