import React from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, description, disabled }: ToggleProps) {
  return (
    <label 
      className={`flex items-center gap-3 p-4 bg-slate-50 rounded-[16px] border border-slate-200 select-none transition-colors ${
        disabled 
          ? 'opacity-60 cursor-not-allowed' 
          : 'cursor-pointer hover:bg-slate-100/70'
      }`}
    >
      <div className="flex-1">
        <span className="text-sm font-bold text-text-primary block">
          {label}
        </span>
        {description && (
          <span className="text-xs font-medium text-text-secondary block mt-0.5">
            {description}
          </span>
        )}
      </div>
      <div className="relative shrink-0">
        <input 
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out ${checked ? 'bg-primary' : 'bg-slate-300'}`}>
          <div 
            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transform transition-transform duration-300 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`} 
          />
        </div>
      </div>
    </label>
  );
}
