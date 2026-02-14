interface DeviceSelectorProps {
  devices: string[];
  isRefreshing: boolean;
  isConnecting: boolean;
  error: string | null;
  onConnect: (deviceName: string, channel: number) => void;
  onRefresh: () => void;
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
            <div className="space-y-2">
              {devices.map((deviceName) => (
                <div
                  key={deviceName}
                  className="flex items-center justify-between p-4 bg-card-header hover:bg-control-hover rounded-md transition-colors border border-border-light"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🎹</div>
                    <div>
                      <p className="font-medium text-text-primary">{deviceName}</p>
                      <p className="text-sm text-text-secondary">
                        MIDI Channel 1
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onConnect(deviceName, 1)}
                    disabled={isConnecting}
                    className="px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
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
