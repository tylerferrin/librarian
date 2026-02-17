interface VerticalSelectorOption {
  value: string;
  label: string;
}

interface VerticalSelectorProps {
  label: string;
  value: string;
  options: VerticalSelectorOption[];
  onChange: (value: string) => void;
  className?: string;
  /** Active button color (hex or rgb) - used when optionColors is not provided */
  activeColor?: string;
  /** Array of colors for each option in order */
  optionColors?: string[];
}

export function VerticalSelector({ 
  label, 
  value, 
  options, 
  onChange, 
  className = '',
  activeColor = '#3b82f6', // Default to accent-blue
  optionColors
}: VerticalSelectorProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="text-xs font-semibold text-text-secondary text-center uppercase tracking-wide">
        {label}
      </span>
      <div className="flex flex-col gap-1">
        {options.map((option, index) => {
          const isActive = value === option.value;
          // Use optionColors if provided, otherwise fall back to activeColor
          const buttonColor = optionColors 
            ? optionColors[index % optionColors.length] 
            : activeColor;
          
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                px-2 py-1.5 rounded text-[11px] font-medium transition-all duration-150 text-left
                ${isActive 
                  ? 'text-white shadow-sm border animate-breathe' 
                  : 'bg-card-bg border border-control-border text-text-primary hover:border-control-hover hover:bg-control-hover'
                }
              `}
              style={isActive ? {
                backgroundColor: buttonColor,
                borderColor: buttonColor,
              } : {}}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
