type ToggleColor = 'green' | 'blue' | 'red' | 'purple' | 'amber' | 'orange' | 'teal';

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  /** Color accent for the "on" state */
  activeColor?: ToggleColor;
}

const COLOR_MAP: Record<ToggleColor, { hex: string; glow: string }> = {
  green:  { hex: '#10b981', glow: 'rgba(16,185,129,0.4)' },
  blue:   { hex: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
  red:    { hex: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
  purple: { hex: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
  amber:  { hex: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  orange: { hex: '#f97316', glow: 'rgba(249,115,22,0.4)' },
  teal:   { hex: '#14b8a6', glow: 'rgba(20,184,166,0.4)' },
};

export function Toggle({ label, value, onChange, className = '', activeColor = 'green' }: ToggleProps) {
  const { hex, glow } = COLOR_MAP[activeColor];

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <button
        onClick={() => onChange(!value)}
        className="w-12 h-6 rounded-full relative transition-all duration-200"
        style={value
          ? { backgroundColor: hex, boxShadow: `0 0 8px ${glow}` }
          : { backgroundColor: 'var(--color-control-bg)', border: '1px solid var(--color-control-border)' }
        }
      >
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-all duration-200 shadow-sm
            ${value
              ? 'translate-x-6 bg-white'
              : 'translate-x-0.5 bg-text-muted'
            }
          `}
        />
      </button>
      <span className="text-[11px] text-text-secondary leading-tight text-center">
        {label}
      </span>
      <span
        className="text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: value ? hex : 'var(--color-text-muted)' }}
      >
        {value ? 'On' : 'Off'}
      </span>
    </div>
  );
}
