interface TapButtonProps {
  label: string;
  onTap: () => void;
  className?: string;
  variant?: 'default' | 'danger' | 'accent';
}

export function TapButton({ label, onTap, className = '', variant = 'default' }: TapButtonProps) {
  const variantClasses = {
    default: 'bg-card-bg hover:bg-control-hover border-control-border text-text-primary',
    danger: 'bg-accent-red/10 hover:bg-accent-red/20 border-accent-red/30 text-accent-red',
    accent: 'bg-accent-blue/10 hover:bg-accent-blue/20 border-accent-blue/30 text-accent-blue',
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <button
        onClick={onTap}
        className={`
          px-3 py-1.5 text-xs font-medium rounded-md border transition-colors
          active:scale-95
          ${variantClasses[variant]}
        `}
      >
        {label}
      </button>
    </div>
  );
}
