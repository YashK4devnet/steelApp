import React, { useState } from 'react';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { DonutProgressChart } from '../../../components/charts/DonutProgressChart';
import { ActivityBarChart } from '../../../components/charts/ActivityBarChart';
import type { BarChartDataPoint } from '../../../components/charts/ActivityBarChart';
import { useGateAnalytics } from '../hooks/useGateAnalytics';

const ChartIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
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
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

export function SecurityGateAnalyticsCard({ className = '' }: { className?: string }) {
  const [period, setPeriod] = useState<'today' | 'week'>('today');
  const { data: stats, isLoading } = useGateAnalytics(period);

  const inboundColor = '#0A2E63'; // RNE Navy / Blue
  const outboundColor = '#C8102E'; // RNE Corporate Red

  const donutSegments = [
    {
      label: 'Inbound Arrivals',
      value: stats?.inbound || 0,
      color: inboundColor,
    },
    {
      label: 'Outbound Exits',
      value: stats?.outbound || 0,
      color: outboundColor,
    },
  ];

  const barData: BarChartDataPoint[] = (stats?.breakdown || []).map((item) => ({
    label: item.label,
    primaryValue: item.inbound,
    secondaryValue: item.outbound,
    total: item.total,
  }));

  const kpis = [
    {
      label: 'Total Cleared',
      value: stats?.total ?? 0,
      colorClass: 'text-text-primary',
      sublabel: 'trucks',
    },
    {
      label: 'Inbound',
      value: stats?.inbound ?? 0,
      colorClass: 'text-primary dark:text-blue-400',
      sublabel: 'reported',
    },
    {
      label: 'Outbound',
      value: stats?.outbound ?? 0,
      colorClass: 'text-accent dark:text-red-400',
      sublabel: 'exited',
    },
  ];

  return (
    <ChartContainer
      title="Gate Activity & Throughput"
      subtitle={period === 'today' ? "Today's shift clearance" : 'Past 7 days traffic volume'}
      icon={<ChartIcon />}
      periods={[
        { key: 'today', label: "Today" },
        { key: 'week', label: '7 Days' },
      ]}
      activePeriod={period}
      onPeriodChange={(key) => setPeriod(key as 'today' | 'week')}
      kpis={kpis}
      className={className}
    >
      {isLoading ? (
        <div className="h-36 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : period === 'today' ? (
        <div className="flex flex-col gap-5">
          {/* Dual Segment Ring */}
          <DonutProgressChart
            segments={donutSegments}
            totalLabel="Shift Cleared"
            size={135}
          />

          {/* Hourly Traffic Spark Bars */}
          {barData.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Hourly Peak Traffic (Shift Distribution)
                </span>
              </div>
              <ActivityBarChart
                data={barData}
                primaryColor={inboundColor}
                secondaryColor={outboundColor}
                primaryLabel="Inbound"
                secondaryLabel="Outbound"
                height={85}
              />
            </div>
          )}
        </div>
      ) : (
        /* 7-Day Daily Volume Bar Chart */
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Daily Gate Volume (Inbound vs Outbound)
            </span>
          </div>
          <ActivityBarChart
            data={barData}
            primaryColor={inboundColor}
            secondaryColor={outboundColor}
            primaryLabel="Inbound"
            secondaryLabel="Outbound"
            height={110}
          />
        </div>
      )}
    </ChartContainer>
  );
}
