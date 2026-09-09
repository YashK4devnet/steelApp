import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPendingPOApprovals } from '../../po/services/poApi';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { ClipboardCheckIcon, HistoryIcon } from './Icons';

export function POApproverDashboard() {
  const navigate = useNavigate();

  const { data: pos = [] } = useQuery({
    queryKey: QUERY_KEYS.poApprovals,
    queryFn: getPendingPOApprovals,
  });

  const pendingCount = pos.length;

  return (
    <div className="space-y-6">
      {/* 2-Column Action Cards Grid (Strict RNE Mobile Standard) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tile 1: PO Approval (Primary Active Feature) */}
        <button 
          onClick={() => navigate('/po/approval')}
          className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col items-start gap-4 w-full text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-[0.98] group cursor-pointer relative overflow-hidden"
        >
          {pendingCount > 0 && (
            <span className="absolute top-4 right-4 bg-amber-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              {pendingCount}
            </span>
          )}
          <div className="w-12 h-12 flex-shrink-0 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
            <ClipboardCheckIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <h3 className="text-[16px] font-bold text-text-primary leading-tight">
              PO Approval
            </h3>
            <p className="text-[12px] font-semibold text-text-secondary mt-0.5">
              Review & Authorize
            </p>
          </div>
        </button>

        {/* Tile 2: Approval History (Coming Soon Placeholder) */}
        <div className="bg-white/60 dark:bg-surface/50 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-slate-900/5 dark:border-white/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
            Coming Soon
          </div>
          <div className="w-12 h-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800/70 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
              Approval History
            </h3>
            <p className="text-[12px] font-medium text-slate-400/80 dark:text-slate-500/80 mt-1">
              Archived Logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
