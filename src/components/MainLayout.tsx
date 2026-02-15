import { useEffect } from 'react';
import type { DeviceInfo, PedalType } from '../lib/midi/types';
import { SideNav } from './SideNav';
import { useSideNav } from '../hooks/useSideNav';

interface MainLayoutProps {
  deviceInfo: DeviceInfo;
  activePedalType: PedalType;
  onDisconnect: () => void;
  onSwitchPedal: (pedalType: PedalType) => void;
  children: React.ReactNode;
}

export function MainLayout({ 
  deviceInfo, 
  activePedalType,
  onDisconnect, 
  onSwitchPedal,
  children 
}: MainLayoutProps) {
  const { isExpanded, toggle } = useSideNav();

  // Keyboard shortcut: Cmd/Ctrl + B to toggle navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux) + B
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return (
    <div className="min-h-screen bg-app-bg">
      <SideNav 
        deviceInfo={deviceInfo}
        activePedalType={activePedalType}
        onDisconnect={onDisconnect}
        onSwitchPedal={onSwitchPedal}
      />
      
      {/* Main content area with left padding to account for collapsed nav */}
      <main 
        className="transition-all duration-300 ease-in-out py-8 px-6 container mx-auto"
        style={{
          paddingLeft: isExpanded ? '24px' : '88px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
