interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  /** Color accent for the "on" state */
  activeColor?: 'green' | 'blue' | 'red';
}

export function Toggle({ label, value, onChange, className = '', activeColor = 'green' }: ToggleProps) {
  const colorStyles = {
    green: {
      track: 'bg-accent-green',
      glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
      text: 'text-accent-green',
    },
    blue: {
      track: 'bg-accent-blue',
      glow: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]',
      text: 'text-accent-blue',
    },
    red: {
      track: 'bg-accent-red',
      glow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]',
      text: 'text-accent-red',
    },
  }[activeColor];

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <button
        onClick={() => onChange(!value)}
        className={`
          w-12 h-6 rounded-full relative transition-all duration-200 
          ${value
            ? `${colorStyles.track} ${colorStyles.glow}`
            : 'bg-control-bg border border-control-border'
          }
        `}
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
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${value ? colorStyles.text : 'text-text-muted'}`}>
        {value ? 'On' : 'Off'}
      </span>
    </div>
  );
}
