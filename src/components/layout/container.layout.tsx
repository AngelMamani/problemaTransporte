import type { ReactNode } from 'react';
import './container.layout.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`container ${className}`}>
      {children}
    </div>
  );
}

