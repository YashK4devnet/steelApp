import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, rightElement, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-semibold text-text-primary">
          {label}
        </label>
        <div className="relative flex items-center w-full">
          <input
            ref={ref}
            className={`w-full h-[48px] rounded-[12px] bg-surface px-4 ${
              rightElement ? 'pr-11' : ''
            } border ${
              error ? 'border-error focus:border-error' : 'border-border focus:border-primary'
            } outline-none transition-colors ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <span className={`text-xs ${error ? 'text-error' : 'text-text-secondary'}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
