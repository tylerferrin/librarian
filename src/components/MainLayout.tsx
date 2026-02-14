import { ConnectionHeader } from './ConnectionHeader';
import type { DeviceInfo } from '../types/midi';

interface MainLayoutProps {
  deviceInfo: DeviceInfo;
  onDisconnect: () => void;
  children: React.ReactNode;
}

export function MainLayout({ deviceInfo, onDisconnect, children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-app-bg">
      <ConnectionHeader deviceInfo={deviceInfo} onDisconnect={onDisconnect} />
      
      {/* Main content area with padding for fixed header */}
      <main className="pt-24 pb-8 px-6 container mx-auto">
        {children}
      </main>
    </div>
  );
}
