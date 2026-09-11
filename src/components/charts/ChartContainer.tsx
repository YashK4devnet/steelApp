import React from 'react';
import { hapticFeedback } from '../../utils/haptics';

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  periods?: Array<{ key: string; label: string }>;
  activePeriod?: string;
  onPeriodChange?: (periodKey: string) => void;
  children: React.ReactNode;
  kpis?: Array<{
    label: string;
    value: string | number;
    colorClass?: string;
    sublabel?: string;
  }>;
  className?: string;
}

export function ChartContainer({
  title,
  subtitle,
  icon,
  periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: '7 Days' },
  ],
  activePeriod = 'today',
  onPeriodChange,
  children,
  kpis,
  className = '',
}: ChartContainerProps) {
  const handlePeriodClick = (key: string) => {
    if (key === activePeriod) return;
    hapticFeedback.light();
    onPeriodChange?.(key);
  };

  return (
    <div
      className={`bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 transition-colors duration-200 flex flex-col gap-4 ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 text-primary dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-[16px] font-bold text-text-primary tracking-tight leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] font-medium text-text-secondary mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Segmented Period Pill Switcher */}
        {periods && periods.length > 1 && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full border border-slate-900/5 dark:border-white/5">
            {periods.map((p) => {
              const isActive = activePeriod === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePeriodClick(p.key)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-white dark:bg-surface text-primary dark:text-blue-400 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Chart Body */}
      <div className="w-full pt-1 pb-1">{children}</div>

      {/* Optional Bottom KPI Stats Row */}
      {kpis && kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="flex flex-col p-2.5 rounded-[16px] bg-slate-50/70 dark:bg-slate-800/30 border border-slate-900/5 dark:border-white/5"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">
                {kpi.label}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-[18px] font-black tracking-tight ${kpi.colorClass || 'text-text-primary'}`}>
                  {kpi.value}
                </span>
                {kpi.sublabel && (
                  <span className="text-[10px] font-semibold text-text-secondary">
                    {kpi.sublabel}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
