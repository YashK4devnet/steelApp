import React, { useState, type ReactNode } from 'react';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function Accordion({ title, children, defaultExpanded = false }: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3.5 px-5 focus:outline-none transition-colors hover:bg-slate-50/50"
      >
        <h2 className="text-[16px] font-bold text-text-primary tracking-tight">
          {title}
        </h2>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="p-5 pt-4 border-t border-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}
