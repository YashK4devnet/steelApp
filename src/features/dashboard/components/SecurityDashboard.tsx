import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, ClipboardIcon, ShieldIcon } from './Icons';
import { SecurityGateAnalyticsCard } from './SecurityGateAnalyticsCard';

interface SecurityDashboardProps {
  viewMode?: 'actions' | 'analytics';
}

export function SecurityDashboard({ viewMode = 'actions' }: SecurityDashboardProps) {
  const navigate = useNavigate();
  const isAnalytics = viewMode === 'analytics';
  const actionsRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const [actionsHeight, setActionsHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (actionsRef.current) {
      const h = actionsRef.current.offsetHeight;
      if (h > 0) {
        setActionsHeight(h);
      }
    }
  }, []);

  useEffect(() => {
    if (!actionsRef.current || typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(() => {
      if (actionsRef.current) {
        const h = actionsRef.current.offsetHeight;
        if (h > 0) setActionsHeight(h);
      }
    });
    obs.observe(actionsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div 
      className="overflow-hidden w-full relative"
      style={{
        maxHeight: !isAnalytics && actionsHeight ? `${actionsHeight}px` : undefined,
      }}
    >
      {/* Pre-rendered 2-Panel Side-Sliding Track */}
      <div 
        className="flex w-[200%] transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform items-start"
        style={{
          transform: isAnalytics ? 'translate3d(-50%, 0, 0)' : 'translate3d(0%, 0, 0)',
        }}
      >
        {/* Panel 1: Quick Actions (2-Column Grid) */}
        <div 
          ref={actionsRef}
          className={`w-1/2 shrink-0 pr-1.5 transition-opacity duration-250 ${
            !isAnalytics ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={isAnalytics}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Inbound Trucks */}
            <button 
              onClick={() => navigate('/trucks/loaded')}
              className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 w-full text-left active:scale-[0.98] transition-all duration-150"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-blue-100 dark:bg-blue-950/60 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors">
                <TruckIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-text-primary leading-tight">Trucks to warehouse</h3>
              </div>
            </button>

            {/* Card 2: Outbound Trucks */}
            <button 
              onClick={() => navigate('/trucks/outgoing')}
              className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 w-full text-left active:scale-[0.98] transition-all duration-150"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-red-50 dark:bg-red-950/60 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 transition-colors">
                <div style={{ transform: 'scaleX(-1)' }}>
                  <TruckIcon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-text-primary leading-tight">Trucks from warehouse</h3>
              </div>
            </button>

            {/* Card 3: Gate Pass */}
            <div className="bg-white/60 dark:bg-surface/50 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] border border-slate-900/5 dark:border-white/10 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
                Coming Soon
              </div>
              <div className="w-12 h-12 flex-shrink-0 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-400">
                <ClipboardIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">Gate Pass Creation</h3>
              </div>
            </div>

            {/* Card 5: Security Logs */}
            <div className="bg-white/60 dark:bg-surface/50 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] border border-slate-900/5 dark:border-white/10 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
                Coming Soon
              </div>
              <div className="w-12 h-12 flex-shrink-0 bg-violet-50 dark:bg-violet-950/40 rounded-full flex items-center justify-center text-violet-400">
                <ShieldIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">Security Logs</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Gate Analytics (Charts) */}
        <div 
          ref={analyticsRef}
          className={`w-1/2 shrink-0 pl-1.5 transition-opacity duration-250 ${
            isAnalytics ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isAnalytics}
        >
          <SecurityGateAnalyticsCard />
        </div>
      </div>
    </div>
  );
}
