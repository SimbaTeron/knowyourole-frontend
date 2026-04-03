import { ReactNode } from 'react';
import { AnimatedBackground } from './AnimatedBackground';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function PageContainer({ children, className = '', padded = true }: PageContainerProps) {
  return (
    <main className={`relative z-10 ${padded ? 'page' : ''} ${className}`}>
      <AnimatedBackground />
      <div className="relative z-10">
        {children}
      </div>
    </main>
  );
}
