import React, { type ButtonHTMLAttributes } from 'react';
import { hapticFeedback } from '../../utils/haptics';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  enableHaptic?: boolean;
}

export function Button({ 
  variant = 'primary', 
  className = '', 
  children, 
  enableHaptic = true,
  onClick,
  ...props 
}: ButtonProps) {
  const baseClasses = 'min-h-[48px] rounded-[12px] px-4 py-2 font-semibold transition-all duration-150 ease-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-surface hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 shadow-sm active:shadow-none',
    secondary: 'bg-surface text-primary border border-primary hover:bg-gray-50',
    danger: 'bg-error text-surface hover:bg-error/90 shadow-sm active:shadow-none',
    ghost: 'bg-transparent text-text-secondary hover:bg-gray-100 hover:text-text-primary border-none shadow-none'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableHaptic && !props.disabled) {
      hapticFeedback.light();
    }
    onClick?.(e);
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
