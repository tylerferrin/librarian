interface ParameterCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ParameterCard({ title, children, className = '' }: ParameterCardProps) {
  return (
    <div className={`bg-card-bg border border-border-light rounded-lg overflow-hidden shadow-sm select-none flex flex-col ${className}`}>
      <div className="px-4 py-2 bg-card-header border-b border-border-light">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {title}
        </h3>
      </div>
      <div className="p-4 flex flex-wrap gap-4 justify-center items-start flex-1">
        {children}
      </div>
    </div>
  );
}
