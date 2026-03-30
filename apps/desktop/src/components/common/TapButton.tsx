import { useState, useEffect } from 'react';

interface TapButtonProps {
  label: string;
  onTap: () => void;
  className?: string;
  variant?: 'default' | 'danger' | 'accent';
}

export function TapButton({ label, onTap, className = '', variant = 'default' }: TapButtonProps) {
  const [isTapped, setIsTapped] = useState(false);
  
  const variantClasses = {
    default: 'bg-card-bg hover:bg-control-hover border-control-border text-text-primary',
    danger: 'bg-accent-red/10 hover:bg-accent-red/20 border-accent-red/30 text-accent-red',
    accent: 'bg-accent-blue/10 hover:bg-accent-blue/20 border-accent-blue/30 text-accent-blue',
  };

  const variantTapClasses = {
    default: 'bg-control-hover border-text-primary',
    danger: 'bg-accent-red/40 border-accent-red',
    accent: 'bg-accent-blue/40 border-accent-blue',
  };

  useEffect(() => {
    if (isTapped) {
      const timer = setTimeout(() => setIsTapped(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isTapped]);

  const handleTap = () => {
    setIsTapped(true);
    onTap();
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <button
        onClick={handleTap}
        className={`
          px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-150
          active:scale-95
          ${isTapped ? variantTapClasses[variant] : variantClasses[variant]}
        `}
      >
        {label}
      </button>
    </div>
  );
}
