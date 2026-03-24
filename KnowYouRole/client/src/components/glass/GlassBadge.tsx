interface GlassBadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'purple' | 'green';
  className?: string;
}

export function GlassBadge({ children, color = 'blue', className = '' }: GlassBadgeProps) {
  return (
    <span className={`badge badge-${color} ${className}`}>
      {children}
    </span>
  );
}
