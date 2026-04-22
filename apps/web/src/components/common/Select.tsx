interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ label, value, options, onChange, className = '' }: SelectProps) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          bg-card-bg border border-control-border rounded-md px-2 py-1 text-xs
          text-text-primary cursor-pointer
          focus:outline-none focus:ring-1 focus:ring-accent-blue
          appearance-none text-center min-w-[90px]
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="text-[11px] text-text-secondary leading-tight text-center">
        {label}
      </span>
    </div>
  );
}
