/**
 * PedalUtilityCard - Container for pedal-specific utility controls
 * 
 * Displays pedal-specific toggle switches and buttons like bypass, tap tempo,
 * reverse effect, etc. in a consistent card layout.
 */

interface PedalUtilityCardProps {
  children: React.ReactNode;
  className?: string;
}

export function PedalUtilityCard({ children, className = '' }: PedalUtilityCardProps) {
  return (
    <div className={`bg-card-bg border border-border-light rounded-lg p-3 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 flex-wrap">
        {children}
      </div>
    </div>
  );
}

/**
 * Vertical divider for separating groups within utility cards
 */
export function UtilityDivider() {
  return <div className="h-8 w-px bg-border-light" />;
}
