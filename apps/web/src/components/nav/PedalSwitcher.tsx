// Pedal type selector - queries registry dynamically
import { pedalRegistry } from '@/lib/midi/pedalRegistry';
import type { PedalType } from '@/lib/midi/types';

interface PedalSwitcherProps {
  activePedalType: PedalType;
  onSwitch: (pedalType: PedalType) => void;
}

export function PedalSwitcher({ activePedalType, onSwitch }: PedalSwitcherProps) {
  const availablePedals = pedalRegistry.getAll();

  return (
    <div className="space-y-2">
      {availablePedals.map((pedal) => {
        const isActive = pedal.type === activePedalType;
        const isDisabled = !pedal.hasEditor;

        return (
          <button
            key={pedal.type}
            onClick={() => !isDisabled && onSwitch(pedal.type as PedalType)}
            disabled={isDisabled}
            className={`
              w-full flex items-center justify-between p-3 rounded-md transition-colors
              ${
                isActive
                  ? 'bg-accent-blue/10 border-2 border-accent-blue'
                  : 'bg-card-header border border-border-light hover:bg-control-hover'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{pedal.icon}</span>
              <div className="text-left">
                <div className="text-sm font-medium text-text-primary">{pedal.name}</div>
                <div className="text-xs text-text-secondary">{pedal.manufacturer}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!pedal.hasEditor && (
                <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded">
                  Coming Soon
                </span>
              )}
              {isActive && (
                <svg className="w-5 h-5 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
