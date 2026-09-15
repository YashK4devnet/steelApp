import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { DonutProgressChart } from '../../../components/charts/DonutProgressChart';
import { ActivityBarChart } from '../../../components/charts/ActivityBarChart';
import type { BarChartDataPoint } from '../../../components/charts/ActivityBarChart';
import { getLoadingTrucks } from '../../trucks/services/truckApi';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { ReceiptIcon, TruckIcon } from './Icons';
import { hapticFeedback } from '../../../utils/haptics';

export function SellerDispatchAnalyticsCard({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const [viewBy, setViewBy] = useState<'destination' | 'truck_type'>('destination');

  const { data: trucks = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.loadingTrucks,
    queryFn: getLoadingTrucks,
  });

  // Strict RNE Theme Colors
  const submittedColor = '#0A2E63'; // RNE Navy (Primary)
  const pendingColor = '#C8102E';   // RNE Corporate Red (Accent)

  const total = trucks.length;
  const submittedTrucks = useMemo(() => trucks.filter((t) => t.is_submitted), [trucks]);
  const pendingTrucks = useMemo(() => trucks.filter((t) => !t.is_submitted), [trucks]);
  const submittedCount = submittedTrucks.length;
  const pendingCount = pendingTrucks.length;
  const clearanceRate = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

  // Donut chart segments
  const donutSegments = [
    {
      label: 'Bills Submitted',
      value: submittedCount,
      color: submittedColor,
      textColorClass: 'text-primary dark:text-blue-400',
    },
    {
      label: 'Pending Submission',
      value: pendingCount,
      color: pendingColor,
      textColorClass: 'text-accent dark:text-red-400',
    },
  ];

  // Bar chart breakdown by Destination or Truck Type
  const barData: BarChartDataPoint[] = useMemo(() => {
    const map = new Map<string, { submitted: number; pending: number; total: number }>();

    trucks.forEach((truck) => {
      let key = viewBy === 'destination' 
        ? (truck.delivery_address_name || 'Unassigned')
        : (truck.truck_type || 'Standard');

      // Shorten lengthy destination addresses for clean chart display
      if (key.length > 18) {
        key = key.split(',')[0].trim();
        if (key.length > 16) {
          key = key.slice(0, 14) + '..';
        }
      }

      const existing = map.get(key) || { submitted: 0, pending: 0, total: 0 };
      if (truck.is_submitted) {
        existing.submitted += 1;
      } else {
        existing.pending += 1;
      }
      existing.total += 1;
      map.set(key, existing);
    });

    return Array.from(map.entries())
      .map(([label, counts]) => ({
        label,
        primaryValue: counts.submitted,
        secondaryValue: counts.pending,
        total: counts.total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [trucks, viewBy]);

  const kpis = [
    {
      label: 'Total Trucks',
      value: total,
      colorClass: 'text-text-primary',
      sublabel: 'assigned',
    },
    {
      label: 'Bills Submitted',
      value: submittedCount,
      colorClass: 'text-primary dark:text-blue-400',
      sublabel: 'cleared',
    },
    {
      label: 'Pending Bills',
      value: pendingCount,
      colorClass: 'text-accent dark:text-red-400',
      sublabel: 'action needed',
    },
  ];

  const handleActionClick = (truckId: number) => {
    hapticFeedback.light();
    navigate(`/trucks/loading/${truckId}/bill`);
  };

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer
        title="Dispatch & Billing Analytics"
        subtitle={
          viewBy === 'destination'
            ? 'Clearance & volume by destination location'
            : 'Clearance & volume by vehicle fleet type'
        }
        icon={<ReceiptIcon className="w-5 h-5" />}
        periods={[
          { key: 'destination', label: 'By Location' },
          { key: 'truck_type', label: 'By Truck' },
        ]}
        activePeriod={viewBy}
        onPeriodChange={(key) => setViewBy(key as 'destination' | 'truck_type')}
        kpis={kpis}
        className={className}
      >
        {isLoading ? (
          <div className="h-44 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            No loading trucks assigned to your pickup location yet.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Donut Progress Chart: Submitted vs Pending */}
            <DonutProgressChart
              segments={donutSegments}
              totalLabel="Total Trucks"
              size={135}
            />

            {/* Breakdown Bar Chart */}
            {barData.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    {viewBy === 'destination' ? 'Top Delivery Locations' : 'Vehicle Type Distribution'}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span className="flex items-center gap-1 text-primary dark:text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Submitted
                    </span>
                    <span className="flex items-center gap-1 text-accent dark:text-red-400">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      Pending
                    </span>
                  </div>
                </div>

                <ActivityBarChart
                  data={barData}
                  primaryColor={submittedColor}
                  secondaryColor={pendingColor}
                  primaryLabel="Submitted"
                  secondaryLabel="Pending"
                  height={100}
                />
              </div>
            )}
          </div>
        )}
      </ChartContainer>

      {/* Actionable Pending Bills Queue (Top 3 Unsubmitted Trucks) */}
      {pendingTrucks.length > 0 && (
        <div className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <h4 className="text-[14px] font-bold text-text-primary tracking-tight">
                Pending Bill Submissions ({pendingTrucks.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                hapticFeedback.light();
                navigate('/trucks/loading');
              }}
              className="text-xs font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {pendingTrucks.slice(0, 3).map((truck) => (
              <div
                key={truck.id}
                className="flex items-center justify-between gap-3 p-3 rounded-[16px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-accent/10 dark:bg-red-500/20 text-accent dark:text-red-400 flex items-center justify-center shrink-0">
                    <TruckIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {truck.truck_number_plate}
                    </p>
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">
                      {truck.truck_type} • {truck.delivery_address_name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleActionClick(truck.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary hover:bg-primary-hover active:scale-95 text-white shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  Submit Bill
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
