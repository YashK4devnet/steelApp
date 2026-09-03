import React from 'react';

interface QueryErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void | Promise<unknown>;
  isRetrying?: boolean;
  className?: string;
}

const AlertTriangleIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-6 h-6 text-red-500"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const RefreshIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

export function QueryErrorState({
  title = 'Unable to Load Data',
  message = 'A connection or server issue occurred. Please check your network and try again.',
  onRetry,
  isRetrying = false,
  className = '',
}: QueryErrorStateProps) {
  return (
    <div className={`bg-white rounded-[24px] p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-red-100 flex flex-col items-center text-center gap-4 my-4 max-w-md mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border border-red-100/80 shadow-inner">
        <AlertTriangleIcon />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-text-primary tracking-tight">{title}</h3>
        <p className="text-xs font-medium text-text-secondary leading-relaxed max-w-xs">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="mt-1 px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
        </button>
      )}
    </div>
  );
}
