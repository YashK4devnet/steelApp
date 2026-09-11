import React, { useState } from 'react';
import { hapticFeedback } from '../../utils/haptics';

export interface BarChartDataPoint {
  label: string;
  primaryValue: number;
  secondaryValue?: number;
  total: number;
  sublabel?: string;
}

interface ActivityBarChartProps {
  data: BarChartDataPoint[];
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
  className?: string;
}

export function ActivityBarChart({
  data,
  primaryColor = '#0A2E63',
  secondaryColor = '#C8102E',
  primaryLabel = 'Inbound',
  secondaryLabel = 'Outbound',
  height = 110,
  className = '',
}: ActivityBarChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => d.total), 1);

  const handleBarTap = (idx: number) => {
    hapticFeedback.light();
    setSelectedIndex(idx === selectedIndex ? null : idx);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Selected Tooltip Inspection Pill */}
      <div className="h-6 flex items-center justify-between px-1 text-xs">
        {selectedIndex !== null && data[selectedIndex] ? (
          <div className="flex items-center justify-between w-full animate-fade-in">
            <span className="font-extrabold text-text-primary">
              {data[selectedIndex].label} ({data[selectedIndex].total} total):
            </span>
            <div className="flex items-center gap-3">
              <span className="font-semibold" style={{ color: primaryColor }}>
                {primaryLabel}: {data[selectedIndex].primaryValue}
              </span>
              {data[selectedIndex].secondaryValue !== undefined && (
                <span className="font-semibold" style={{ color: secondaryColor }}>
                  {secondaryLabel}: {data[selectedIndex].secondaryValue}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-[11px] font-medium text-text-secondary">
            Tap on any bar to inspect clearance breakdown
          </span>
        )}
      </div>

      {/* Bar Columns Container */}
      <div className="flex items-end justify-between gap-2 pt-2" style={{ height }}>
        {data.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          const totalHeightPercent = Math.max((item.total / maxVal) * 100, 6);
          const primaryPercent = item.total > 0 ? (item.primaryValue / item.total) * 100 : 100;
          const secondaryPercent = item.total > 0 ? ((item.secondaryValue || 0) / item.total) * 100 : 0;

          return (
            <div
              key={idx}
              onClick={() => handleBarTap(idx)}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group select-none"
            >
              {/* Stacked Vertical Bar */}
              <div
                className={`w-full max-w-[28px] rounded-t-[10px] overflow-hidden flex flex-col justify-end transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-surface scale-105 shadow-md'
                    : 'opacity-90 hover:opacity-100 group-hover:scale-105'
                }`}
                style={{
                  height: `${totalHeightPercent}%`,
                  backgroundColor: item.total === 0 ? 'rgba(148, 163, 184, 0.15)' : undefined,
                }}
              >
                {item.total > 0 && (
                  <>
                    {/* Secondary segment (e.g. Outbound) */}
                    {secondaryPercent > 0 && (
                      <div
                        style={{
                          height: `${secondaryPercent}%`,
                          backgroundColor: secondaryColor,
                        }}
                        className="w-full transition-all duration-500"
                      />
                    )}

                    {/* Primary segment (e.g. Inbound) */}
                    <div
                      style={{
                        height: `${primaryPercent}%`,
                        backgroundColor: primaryColor,
                      }}
                      className="w-full transition-all duration-500"
                    />
                  </>
                )}
              </div>

              {/* Column X-Axis Label */}
              <span
                className={`text-[10px] font-extrabold uppercase tracking-tight transition-colors ${
                  isSelected ? 'text-primary dark:text-blue-400 font-black' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
