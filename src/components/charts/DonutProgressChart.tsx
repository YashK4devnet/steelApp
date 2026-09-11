import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  dotColorClass?: string;
  textColorClass?: string;
}

interface DonutProgressChartProps {
  segments: DonutSegment[];
  totalLabel?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function DonutProgressChart({
  segments,
  totalLabel = 'Total Cleared',
  size = 140,
  strokeWidth = 14,
  className = '',
}: DonutProgressChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke dash offsets
  let accumulatedPercent = 0;
  const renderedSegments = segments.map((seg) => {
    const percent = total > 0 ? seg.value / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      ...seg,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className={`flex flex-col items-center sm:flex-row sm:items-center justify-around gap-5 ${className}`}>
      {/* SVG Donut Circle */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800/80"
          />

          {/* Rendered Colored Segments */}
          {total > 0 &&
            renderedSegments.map((seg, idx) => (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            ))}
        </svg>

        {/* Centered Total KPI Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="text-[26px] font-black text-text-primary tracking-tight leading-none">
            {total}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary mt-1 max-w-[70px] line-clamp-1">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown Pills */}
      <div className="flex flex-col gap-2.5 w-full sm:w-auto min-w-[150px]">
        {renderedSegments.map((seg, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 p-2 rounded-[14px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs font-bold text-text-primary">
                {seg.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-xs font-black text-text-primary">
                {seg.value}
              </span>
              <span className="text-[10px] font-semibold text-text-secondary">
                ({seg.percent}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
