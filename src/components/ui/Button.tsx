import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseClasses = 'min-h-[48px] rounded-[12px] px-4 py-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary text-surface hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-surface text-primary border border-primary hover:bg-gray-50',
    danger: 'bg-error text-surface hover:bg-error/90',
    ghost: 'bg-transparent text-text-secondary hover:bg-gray-100 hover:text-text-primary border-none'
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
