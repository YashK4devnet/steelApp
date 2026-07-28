import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-semibold text-text-primary">
          {label}
        </label>
        <input
          ref={ref}
          className={`h-[48px] rounded-[12px] bg-surface px-4 border ${
            error ? 'border-error focus:border-error' : 'border-border focus:border-primary'
          } outline-none transition-colors ${className}`}
          {...props}
        />
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
