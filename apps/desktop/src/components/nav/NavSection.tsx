// Reusable collapsible navigation section component

interface NavSectionProps {
  id: string;
  icon: string;
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  isNavCollapsed: boolean;
}

export function NavSection({
  id,
  icon,
  title,
  children,
  isExpanded,
  onToggle,
  isNavCollapsed,
}: NavSectionProps) {
  if (isNavCollapsed) {
    // When nav is collapsed, don't show sections
    return null;
  }

  return (
    <div className="border-t border-border-light">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-control-hover transition-colors text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-text-primary">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-text-secondary transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
