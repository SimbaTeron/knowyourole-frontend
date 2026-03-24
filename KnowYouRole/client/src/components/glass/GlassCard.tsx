import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'interactive' | 'selected' | 'premium';
  className?: string;
  onClick?: () => void;
  glowColor?: 'blue' | 'purple' | 'green';
}

export function GlassCard({
  children,
  variant = 'default',
  className = '',
  onClick,
  glowColor = 'blue'
}: GlassCardProps) {
  const variantClass = {
    default: 'glass',
    interactive: 'glass glass-interactive',
    selected: 'glass-selected',
    premium: 'glass-premium',
  }[variant];

  return (
    <div className={`${variantClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
