import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { hapticFeedback } from '../../utils/haptics';

export interface SelectOption {
  value: string | number;
  label: string;
  subLabel?: string;
  badge?: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  sheetTitle?: string;
  searchable?: boolean;
}

const ChevronDownIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SearchIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = 'Select an option',
      sheetTitle,
      searchable,
      className = '',
      value,
      onChange,
      disabled,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);

    // Synchronize forwarded ref and local ref
    const setRefs = (node: HTMLSelectElement | null) => {
      hiddenSelectRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
      }
    };

    // Find current selected option
    const selectedOption = useMemo(() => {
      if (value === undefined || value === null || value === '') return null;
      return options.find((opt) => String(opt.value) === String(value)) || null;
    }, [options, value]);

    // Filter options by search query
    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return options;
      const q = searchQuery.toLowerCase().trim();
      return options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(q) ||
          (opt.subLabel && opt.subLabel.toLowerCase().includes(q))
      );
    }, [options, searchQuery]);

    // Auto-enable search for lists with > 5 items unless explicitly disabled
    const shouldShowSearch = searchable ?? options.length > 5;

    const handleOpen = () => {
      if (disabled) return;
      hapticFeedback.light();
      setSearchQuery('');
      setIsClosing(false);
      setIsOpen(true);
      window.dispatchEvent(new CustomEvent('toggle-modal-overlay', { detail: { open: true } }));
    };

    const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        window.dispatchEvent(new CustomEvent('toggle-modal-overlay', { detail: { open: false } }));
      }, 200);
    };

    // Keyboard and body scroll lock handling
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen]);


    // Clean up modal overlay state if unmounted while open
    useEffect(() => {
      return () => {
        if (isOpen) {
          window.dispatchEvent(new CustomEvent('toggle-modal-overlay', { detail: { open: false } }));
        }
      };
    }, [isOpen]);

    const handleSelectOption = (option: SelectOption) => {
      if (option.disabled) return;
      hapticFeedback.selection();

      if (onChange) {
        // Construct standard synthetic change event so existing handlers work seamlessly
        const syntheticEvent = {
          target: {
            name: name || '',
            value: String(option.value),
            id: id || '',
          },
          currentTarget: {
            name: name || '',
            value: String(option.value),
            id: id || '',
          },
        } as React.ChangeEvent<HTMLSelectElement>;

        onChange(syntheticEvent);
      }

      handleClose();
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={id}
            onClick={handleOpen}
            className={`text-sm font-semibold text-text-primary ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {label}
          </label>
        )}

        {/* Hidden select for standard forms and ref support */}
        <select
          ref={setRefs}
          id={id}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Mobile Input Trigger */}
        <div className="relative flex items-center w-full">
          <button
            type="button"
            onClick={handleOpen}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={`w-full h-[48px] rounded-[14px] bg-slate-50 dark:bg-slate-800/80 text-left pl-4 pr-11 border transition-all text-sm font-medium flex items-center select-none ${
              disabled
                ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-white/5'
                : 'cursor-pointer active:scale-[0.99] hover:bg-slate-100/70 dark:hover:bg-slate-800'
            } ${
              error
                ? 'border-error ring-1 ring-error/20 bg-red-50/20'
                : isOpen
                ? 'border-primary ring-2 ring-primary/10 bg-white dark:bg-slate-800'
                : 'border-slate-200 dark:border-white/10'
            } ${className}`}
          >
            <span
              className={`truncate w-full block ${
                selectedOption
                  ? 'text-text-primary font-semibold'
                  : 'text-text-secondary text-slate-400 dark:text-slate-500'
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </button>

          <div
            className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-transform duration-200 flex items-center justify-center ${
              isOpen ? 'rotate-180 text-primary dark:text-blue-400' : ''
            }`}
          >
            <ChevronDownIcon />
          </div>
        </div>

        {(error || helperText) && (
          <span
            className={`text-xs font-semibold mt-0.5 ${
              error ? 'text-error' : 'text-text-secondary'
            }`}
          >
            {error || helperText}
          </span>
        )}

        {/* Custom Mobile Bottom Sheet Portal */}
        {isOpen &&
          createPortal(
            <div
              className="fixed inset-0 z-[70] flex flex-col justify-end sm:justify-center sm:items-center bg-black/50 backdrop-blur-sm animate-fade-in p-0 sm:p-4"
              onClick={handleClose}
              role="dialog"
              aria-modal="true"
            >
              <div
                className={`bg-white dark:bg-surface rounded-t-[32px] sm:rounded-[28px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(15,23,42,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-slate-900/10 dark:border-white/10 overflow-hidden transition-colors duration-200 ${
                  isClosing ? 'animate-slide-down-bottom' : 'animate-slide-up-bottom'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag Handle on Mobile */}
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 shrink-0 sm:hidden" />

                {/* Sheet Header */}
                <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="text-[17px] font-bold text-text-primary truncate">
                      {sheetTitle || label || placeholder}
                    </h3>
                    <p className="text-xs text-text-secondary font-medium mt-0.5">
                      {options.length} {options.length === 1 ? 'option' : 'options'} available
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close picker"
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <CloseIcon />
                  </button>
                </div>

                {/* Optional Search Bar for lists > 5 items */}
                {shouldShowSearch && (
                  <div className="px-5 pt-3 pb-2 shrink-0">
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <SearchIcon />
                      </div>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search options..."
                        className="w-full h-11 pl-10 pr-9 bg-slate-100/80 dark:bg-slate-800/80 rounded-[14px] text-sm text-text-primary placeholder:text-slate-400 outline-none border border-transparent focus:border-primary/40 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Options List */}
                <div
                  className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1.5 overscroll-contain pb-[calc(env(safe-area-inset-bottom,1rem)+1.5rem)] sm:pb-4"
                  role="listbox"
                >
                  {filteredOptions.length === 0 ? (
                    <div className="py-12 px-4 text-center flex flex-col items-center gap-2 text-text-secondary">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <SearchIcon className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-text-primary">No options found</p>
                      <p className="text-xs">No items match &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  ) : (
                    filteredOptions.map((option) => {
                      const isSelected = selectedOption && String(selectedOption.value) === String(option.value);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={option.disabled}
                          onClick={() => handleSelectOption(option)}
                          className={`animate-filter-scale w-full min-h-[50px] px-4 py-3 rounded-[16px] text-left flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-[0.98] ${
                            option.disabled
                              ? 'opacity-40 cursor-not-allowed'
                              : isSelected
                              ? 'bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-blue-400 font-bold border border-primary/20 dark:border-blue-500/30 shadow-sm'
                              : 'text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate">
                                {option.label}
                              </span>
                              {option.badge && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-text-secondary">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            {option.subLabel && (
                              <span className="text-xs text-text-secondary font-normal truncate mt-0.5">
                                {option.subLabel}
                              </span>
                            )}
                          </div>

                          {/* Selected Checkmark */}
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <CheckIcon />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }
);

Select.displayName = 'Select';
