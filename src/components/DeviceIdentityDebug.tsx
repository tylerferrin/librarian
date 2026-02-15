/**
 * Device Identity Debug Panel
 * 
 * Shows device identity information and helps discover manufacturer IDs
 * for new pedals during development
 */

import { useState } from 'react';
import { requestDeviceIdentity, type DeviceIdentity } from '@/lib/midi/deviceIdentity';

interface DeviceIdentityDebugProps {
  deviceName: string;
}

export function DeviceIdentityDebug({ deviceName }: DeviceIdentityDebugProps) {
  const [identity, setIdentity] = useState<DeviceIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    setIsLoading(true);
    setError(null);
    setIdentity(null);

    try {
      const result = await requestDeviceIdentity(deviceName, 3000);
      if (result) {
        setIdentity(result);
      } else {
        setError('No response from device (timeout or device does not support identity request)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number[]) => {
    return bytes.map(b => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`).join(', ');
  };

  const formatU16 = (value: number) => {
    return `0x${value.toString(16).padStart(4, '0').toUpperCase()} (${value})`;
  };

  const formatVersion = (bytes: number[]) => {
    // Try to interpret as ASCII
    const ascii = bytes.map(b => {
      if (b >= 0x20 && b <= 0x7E) {
        return String.fromCharCode(b);
      }
      return null;
    }).filter(c => c !== null).join('');
    
    if (ascii.length > 0) {
      return `[${formatBytes(bytes)}] = "${ascii}"`;
    }
    return `[${formatBytes(bytes)}]`;
  };

  const copyToClipboard = () => {
    if (!identity) return;
    
    const text = `// ${deviceName}
{
  manufacturer_id: [${identity.manufacturer_id.map(b => `0x${b.toString(16).padStart(2, '0')}`).join(', ')}],
  device_family: 0x${identity.device_family.toString(16).padStart(4, '0')},
  device_model: 0x${identity.device_model.toString(16).padStart(4, '0')},
  pedal_type: '???', // Update with correct pedal type
}`;
    
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard! Add this to KNOWN_DEVICES in deviceIdentity.ts');
  };

  return (
    <div className="border border-border-light rounded-lg p-4 bg-card-bg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">
          🔍 Device Identity (SysEx)
        </h3>
        <button
          onClick={handleRequest}
          disabled={isLoading}
          className="px-3 py-1 text-xs bg-accent-blue text-white rounded hover:bg-accent-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Requesting...' : 'Request Identity'}
        </button>
      </div>

      <p className="text-xs text-text-secondary mb-3">
        Send MIDI Universal Device Inquiry to discover manufacturer ID
      </p>

      {error && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded text-xs text-warning mb-3">
          {error}
        </div>
      )}

      {identity && (
        <div className="space-y-3">
          <div className="p-3 bg-success/10 border border-success/30 rounded">
            <div className="text-xs font-mono space-y-2">
              <div>
                <span className="text-text-secondary">Manufacturer:</span>{' '}
                <span className="text-text-primary font-semibold">
                  {identity.manufacturer_name || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-text-secondary">Manufacturer ID:</span>{' '}
                <span className="text-text-primary">[{formatBytes(identity.manufacturer_id)}]</span>
              </div>
              <div>
                <span className="text-text-secondary">Device Family:</span>{' '}
                <span className="text-text-primary">{formatU16(identity.device_family)}</span>
              </div>
              <div>
                <span className="text-text-secondary">Device Model:</span>{' '}
                <span className="text-text-primary">{formatU16(identity.device_model)}</span>
              </div>
              {identity.software_version.length > 0 && (
                <div>
                  <span className="text-text-secondary">Software Version:</span>{' '}
                  <span className="text-text-primary">{formatVersion(identity.software_version)}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full px-3 py-2 text-xs bg-card-bg hover:bg-control-hover border border-control-border rounded transition-colors"
          >
            📋 Copy Mapping Code
          </button>

          <div className="text-xs text-text-secondary italic">
            💡 This information can be used to auto-detect the pedal type,
            even when using generic MIDI interfaces like WIDI Jack.
          </div>
        </div>
      )}
    </div>
  );
}
