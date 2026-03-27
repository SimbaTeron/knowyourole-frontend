interface NeonTextProps {
  children: React.ReactNode;
  color?: 'blue' | 'purple' | 'green';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function NeonText({
  children,
  color = 'blue',
  size = 'md',
  className = ''
}: NeonTextProps) {
  const colorClass = `text-glow-${color}`;
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  return (
    <span className={`${colorClass} ${sizeClass} font-display font-bold ${className}`}>
      {children}
    </span>
  );
}
