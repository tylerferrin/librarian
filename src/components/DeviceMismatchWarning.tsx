/**
 * Device Mismatch Warning Banner
 * 
 * Displays a prominent warning when the selected pedal editor doesn't match
 * the physically connected MIDI device.
 */

import { useState } from 'react';
import type { DeviceMismatch } from '@/lib/midi/deviceMismatchDetection';

interface DeviceMismatchWarningProps {
  mismatch: DeviceMismatch;
  onDismiss?: () => void;
  onDisconnect?: () => void;
}

export function DeviceMismatchWarning({ 
  mismatch, 
  onDismiss, 
  onDisconnect 
}: DeviceMismatchWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!mismatch.isMismatch || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleDisconnect = () => {
    onDisconnect?.();
  };

  // Color coding based on confidence level
  const colorScheme = {
    high: {
      bg: 'bg-error/10',
      border: 'border-error',
      text: 'text-error',
      icon: '⚠️',
    },
    medium: {
      bg: 'bg-warning/10',
      border: 'border-warning',
      text: 'text-warning',
      icon: '⚠️',
    },
    low: {
      bg: 'bg-info/10',
      border: 'border-info',
      text: 'text-info',
      icon: 'ℹ️',
    },
  };

  const colors = colorScheme[mismatch.confidence];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 mb-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0 mt-0.5">
          {colors.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className={`font-semibold ${colors.text} mb-1`}>
                Possible Device Mismatch Detected
              </h3>
              <p className="text-sm text-text-primary mb-3">
                {mismatch.message}
              </p>
              
              <div className="text-xs text-text-secondary space-y-1 mb-3">
                <div>
                  <span className="font-medium">Connected device:</span>{' '}
                  {mismatch.connectedDeviceName}
                </div>
                <div>
                  <span className="font-medium">Selected editor:</span>{' '}
                  {mismatch.selectedPedalType}
                </div>
                {mismatch.detectedPedalType && (
                  <div>
                    <span className="font-medium">Detected pedal:</span>{' '}
                    {mismatch.detectedPedalType}
                  </div>
                )}
              </div>

              <p className="text-xs text-text-secondary italic">
                Sending MIDI messages to the wrong pedal may have unexpected results or no effect.
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
              title="Dismiss warning"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-sm bg-card-bg hover:bg-control-hover border border-control-border rounded-md transition-colors"
            >
              Disconnect & Reconnect
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              I know what I'm doing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
