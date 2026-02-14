interface GridSelectorOption {
  value: string;
  label: string;
}

interface GridSelectorProps {
  label: string;
  value: string;
  options: GridSelectorOption[];
  onChange: (value: string) => void;
  columns?: number;
  className?: string;
  /** Active button color (hex or rgb) */
  activeColor?: string;
}

export function GridSelector({ 
  label, 
  value, 
  options, 
  onChange, 
  columns = 3,
  className = '',
  activeColor = '#3b82f6' // Default to accent-blue
}: GridSelectorProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="text-xs font-semibold text-text-secondary text-center">
        {label}
      </span>
      <div 
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                px-3 py-2 rounded-md text-xs font-medium transition-all duration-150
                ${isActive 
                  ? 'text-white shadow-md border-2' 
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
              style={isActive ? {
                backgroundColor: activeColor,
                borderColor: activeColor,
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
