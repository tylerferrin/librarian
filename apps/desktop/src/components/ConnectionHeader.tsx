import type { DeviceInfo } from '../types/midi';

interface ConnectionHeaderProps {
  deviceInfo: DeviceInfo;
  onDisconnect: () => void;
}

export function ConnectionHeader({ deviceInfo, onDisconnect }: ConnectionHeaderProps) {
  const getPedalTypeBadge = (type: string) => {
    switch (type) {
      case 'Microcosm':
        return 'Hologram Microcosm';
      case 'GenLossMkii':
        return 'Gen Loss MKII';
      default:
        return type;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card-bg/95 backdrop-blur-sm border-b border-border-light shadow-sm">
      <div className="container mx-auto px-6 h-16 grid grid-cols-3 items-center">
        {/* Left: Device Info */}
        <div className="flex items-center gap-4">
          <div className="text-2xl">🎹</div>
          <div>
            <h1 className="font-semibold text-sm text-text-primary">{deviceInfo.name}</h1>
            <p className="text-xs text-text-secondary">
              {getPedalTypeBadge(deviceInfo.pedal_type)} • Channel {deviceInfo.midi_channel}
            </p>
          </div>
        </div>

        {/* Center: Connection Status */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-text-secondary">Connected</span>
        </div>

        {/* Right: Disconnect Button */}
        <div className="flex justify-end">
          <button
            onClick={onDisconnect}
            className="px-4 py-2 text-sm bg-card-bg hover:bg-error/10 hover:text-error border border-control-border hover:border-error/30 rounded-md transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </header>
  );
}
