import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 ${className}`}>
      {children}
    </div>
  );
}
