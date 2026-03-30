/**
 * PresetManagementCard - Container for preset management controls
 * 
 * Displays preset-related actions like save, load, and manage presets,
 * as well as active preset state when a preset is loaded.
 */

interface ActivePresetInfo {
  name: string;
  isDirty: boolean;
}

interface PresetManagementCardProps {
  activePreset?: ActivePresetInfo | null;
  children: React.ReactNode;
  className?: string;
}

export function PresetManagementCard({ activePreset, children, className = '' }: PresetManagementCardProps) {
  const hasActivePreset = activePreset && activePreset.name;
  const isDirty = activePreset?.isDirty || false;

  return (
    <div 
      className={`bg-card-bg border rounded-lg p-3 shadow-sm transition-all duration-700 ${
        hasActivePreset && isDirty ? 'animate-gradient-wave' : ''
      } ${className}`}
      style={{
        backgroundImage: hasActivePreset
          ? isDirty
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(251, 146, 60, 0.08) 50%, rgba(239, 68, 68, 0.12) 100%)'
            : 'linear-gradient(135deg, rgba(163, 230, 53, 0.12) 0%, rgba(132, 204, 22, 0.08) 100%)'
          : undefined,
        borderColor: hasActivePreset
          ? isDirty
            ? 'rgba(239, 68, 68, 0.3)'
            : 'rgba(163, 230, 53, 0.3)'
          : undefined,
        backgroundSize: hasActivePreset && isDirty ? '200% 100%' : '100% 100%',
      }}
    >
      <div className="flex items-start gap-4">
        {/* Active Preset Info - Left Side (35%) */}
        <div className="w-[35%] flex flex-col gap-1">
          {hasActivePreset && (
            <>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Active Preset:
              </span>
              <span className="text-sm font-medium text-text-primary">
                {activePreset.name}
              </span>
              {isDirty && (
                <span className="text-xs font-medium px-2 py-0.5 rounded transition-all duration-500 bg-accent-red/10 border border-accent-red/30 text-accent-red inline-block w-fit">
                  Modified
                </span>
              )}
            </>
          )}
        </div>

        {/* Action Buttons - Right Side (65%) */}
        <div className="w-[65%] min-h-[76px] flex items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
