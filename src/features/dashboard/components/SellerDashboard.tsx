import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TruckIcon, ReceiptIcon, FileTextIcon, WarehouseIcon } from './Icons';
import { getLoadingTrucks } from '../../trucks/services/truckApi';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { SellerDispatchAnalyticsCard } from './SellerDispatchAnalyticsCard';

interface SellerDashboardProps {
  viewMode?: 'actions' | 'analytics';
}

function SellerActionGrid() {
  const navigate = useNavigate();

  const { data: trucks = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.loadingTrucks,
    queryFn: getLoadingTrucks,
  });

  const pendingCount = trucks.filter((t) => !t.is_submitted).length;

  return (
    <div className="space-y-6">
      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Loading Trucks (Active) */}
        <button 
          onClick={() => navigate('/trucks/loading')}
          className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-primary w-full text-left active:scale-[0.98] transition-all duration-150 relative overflow-hidden"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-primary/10 dark:bg-blue-950/60 rounded-full flex items-center justify-center text-primary dark:text-blue-400 transition-colors">
            <TruckIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <h3 className="text-[16px] font-semibold text-text-primary leading-tight">
              Loading Trucks
            </h3>
            {loading ? (
              <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse mt-0.5" />
            ) : (
              <span className={`text-[12px] font-medium px-2.5 py-0.5 rounded-full w-fit ${
                pendingCount > 0
                  ? 'text-accent dark:text-red-400 bg-accent/10 dark:bg-red-950/60 border border-transparent dark:border-red-800/40'
                  : 'text-primary dark:text-blue-400 bg-primary/10 dark:bg-blue-950/60 border border-transparent dark:border-blue-800/40'
              }`}>
                {pendingCount ?? 0} Pending
              </span>
            )}
          </div>
        </button>

        {/* Card 2: Submitted Bills (Coming Soon) */}
        <div className="bg-white/60 dark:bg-surface/50 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-slate-900/5 dark:border-white/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
            Coming Soon
          </div>
          <div className="w-12 h-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800/60 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
            <ReceiptIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
              Submitted Bills
            </h3>
          </div>
        </div>

        {/* Card 3: E-Way Bills (Coming Soon) */}
        <div className="bg-white/60 dark:bg-surface/50 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-slate-900/5 dark:border-white/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
            Coming Soon
          </div>
          <div className="w-12 h-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800/60 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
              E-Way Bills
            </h3>
          </div>
        </div>

        {/* Card 4: Godown Dispatches (Coming Soon) */}
        <div className="bg-white/60 dark:bg-surface/50 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-slate-900/5 dark:border-white/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
            Coming Soon
          </div>
          <div className="w-12 h-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800/60 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
            <WarehouseIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
              Godown Dispatches
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SellerDashboard({ viewMode = 'actions' }: SellerDashboardProps) {
  const isAnalytics = viewMode === 'analytics';
  const prevModeRef = useRef<'actions' | 'analytics'>(viewMode);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');

  useEffect(() => {
    if (prevModeRef.current !== viewMode) {
      if (viewMode === 'analytics') {
        setSlideDirection('right');
      } else {
        setSlideDirection('left');
      }
      prevModeRef.current = viewMode;
    }
  }, [viewMode]);

  return (
    <div 
      key={viewMode}
      className={`w-full ${slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
    >
      {isAnalytics ? (
        <SellerDispatchAnalyticsCard />
      ) : (
        <SellerActionGrid />
      )}
    </div>
  );
}
