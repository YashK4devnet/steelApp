import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileTextIcon, ClockIcon } from './Icons';

export function CustomerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Tile 1: Booking */}
      <button 
        onClick={() => navigate('/bookings')}
        className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col items-start gap-4 w-full text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-95 cursor-pointer"
      >
        <div className="w-12 h-12 flex-shrink-0 bg-blue-100 dark:bg-blue-950/60 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm transition-colors">
          <FileTextIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-text-primary leading-tight">Booking</h3>
          <p className="text-[12px] font-semibold text-text-secondary mt-1">Manage & Add</p>
        </div>
      </button>

      {/* Tile 2: Reporting status */}
      <div className="bg-white/60 dark:bg-surface/50 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-slate-900/5 dark:border-white/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
          Coming Soon
        </div>
        <div className="w-12 h-12 flex-shrink-0 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-400 dark:text-emerald-500/60">
          <ClockIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">Reporting Status</h3>
        </div>
      </div>
    </div>
  );
}
