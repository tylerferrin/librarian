// Main side navigation component with collapsible state
import { useEffect, useRef } from 'react';
import type { DeviceInfo, PedalType } from '@/lib/midi/types';
import { useSideNav } from '@/hooks/useSideNav';
import { useAuth } from '@/hooks/useAuth';
import { NavSection } from './nav/NavSection';
import { ConnectionStatus } from './nav/ConnectionStatus';
import { PedalSwitcher } from './nav/PedalSwitcher';
import { pedalRegistry } from '@/lib/midi/pedalRegistry';

interface SideNavProps {
  deviceInfo: DeviceInfo;
  activePedalType: PedalType;
  onDisconnect: () => void;
  onSwitchPedal: (pedalType: PedalType) => void;
}

export function SideNav({ deviceInfo, activePedalType, onDisconnect, onSwitchPedal }: SideNavProps) {
  const { isExpanded, toggle, collapse, toggleSection, isSectionExpanded } = useSideNav();
  const { user, logout } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  // Click outside to close (on mobile/tablet)
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        // Only collapse on smaller screens
        if (window.innerWidth < 1024) {
          collapse();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, collapse]);

  const pedalDef = pedalRegistry.get(activePedalType);

  return (
    <>
      {/* Backdrop overlay for mobile/tablet */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={collapse}
        />
      )}

      {/* Side navigation */}
      <nav
        ref={navRef}
        className={`
          fixed left-0 top-0 bottom-0 z-40
          bg-card-bg border-r border-border-light shadow-lg
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-[280px]' : 'w-16'}
        `}
        style={{ backgroundColor: '#ffffff' }}
        aria-label="Main navigation"
        aria-expanded={isExpanded}
      >
        {/* Header */}
        <div className={`h-16 flex items-center border-b border-border-light ${isExpanded ? 'justify-between px-4' : 'justify-center'}`}>
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggle}
                  className="p-1 hover:bg-control-hover rounded transition-colors"
                  aria-label="Toggle navigation"
                >
                  <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-text-primary">Librarian</h1>
              </div>
              <button
                onClick={collapse}
                className="p-1 hover:bg-control-hover rounded transition-colors"
                aria-label="Close navigation"
              >
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={toggle}
              className="p-2 hover:bg-control-hover rounded transition-colors"
              aria-label="Open navigation"
            >
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Collapsed state icons */}
        {!isExpanded && (
          <div className="flex flex-col items-center py-6 space-y-4 h-[calc(100vh-4rem)] justify-between">
            <div className="flex flex-col items-center space-y-4">
              {pedalDef && (
                <div className="text-2xl" title={pedalDef.name}>
                  {pedalDef.icon}
                </div>
              )}
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" title="Connected" />
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-control-hover rounded transition-colors mb-4"
              title="Sign out"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
            <div className="overflow-y-auto flex-1">
              {/* MIDI Connection Section */}
              <NavSection
                id="connection"
                icon="🔌"
                title="MIDI Connection"
                isExpanded={isSectionExpanded('connection')}
                onToggle={toggleSection}
                isNavCollapsed={!isExpanded}
              >
                <ConnectionStatus 
                  deviceInfo={deviceInfo} 
                  activePedalType={activePedalType}
                  onDisconnect={onDisconnect} 
                />
              </NavSection>

              {/* Active Pedal Section */}
              <NavSection
                id="pedals"
                icon="🎛️"
                title="Active Pedal"
                isExpanded={isSectionExpanded('pedals')}
                onToggle={toggleSection}
                isNavCollapsed={!isExpanded}
              >
                <PedalSwitcher activePedalType={activePedalType} onSwitch={onSwitchPedal} />
              </NavSection>
            </div>

            {/* User / Sign out */}
            <div className="border-t border-border-light px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-text-secondary truncate">{user?.email}</span>
              <button
                onClick={logout}
                className="text-xs text-text-muted hover:text-text-primary transition-colors whitespace-nowrap ml-2"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
