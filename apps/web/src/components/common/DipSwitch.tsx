interface DipSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  activeColor?: string;
  /** Render switch inline with label+description to the right */
  horizontal?: boolean;
  description?: string;
}

export function DipSwitch({
  label,
  value,
  onChange,
  className = '',
  activeColor = '#d97706',
  horizontal = false,
  description,
}: DipSwitchProps) {
  const toggle = (
    <button
      onClick={() => onChange(!value)}
      className="relative shrink-0 rounded-sm border border-gray-500 transition-colors"
      style={{
        width: horizontal ? 32 : 20,
        height: horizontal ? 20 : 32,
        backgroundColor: value ? activeColor : '#1f2937',
        boxShadow: value ? `0 0 6px ${activeColor}80` : 'none',
      }}
    >
      {/* Slider nub */}
      <div
        className="absolute rounded-[1px] bg-gray-200 transition-all duration-150"
        style={
          horizontal
            ? {
                top: '3px',
                bottom: '3px',
                width: 12,
                left: value ? 'auto' : '3px',
                right: value ? '3px' : 'auto',
              }
            : {
                left: '2px',
                right: '2px',
                height: 12,
                top: value ? '3px' : 'auto',
                bottom: value ? 'auto' : '3px',
              }
        }
      />
    </button>
  );

  if (horizontal) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {toggle}
        <div className="flex flex-col min-w-0">
          <span
            className="text-xs font-semibold uppercase tracking-wide leading-tight"
            style={{ color: value ? activeColor : '#d1d5db' }}
          >
            {label}
          </span>
          {description && (
            <span className="text-[11px] text-gray-500 leading-tight mt-0.5">
              {description}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`}>
      {toggle}
      <span className="text-[8px] font-semibold text-text-secondary uppercase tracking-wide leading-tight text-center max-w-[32px]">
        {label}
      </span>
    </div>
  );
}
