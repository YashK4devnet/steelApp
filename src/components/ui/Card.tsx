import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface text-text-primary rounded-[24px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-border transition-colors duration-200 ${className}`}>
      {children}
    </div>
  );
}
