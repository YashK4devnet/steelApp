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
        className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left transition-all hover:bg-slate-50 active:scale-95"
      >
        <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
          <FileTextIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-text-primary leading-tight">Booking</h3>
          <p className="text-[12px] font-semibold text-text-secondary mt-1">Manage & Add</p>
        </div>
      </button>

      {/* Tile 2: Reporting status */}
      <div className="bg-white/60 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
          Coming Soon
        </div>
        <div className="w-12 h-12 flex-shrink-0 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-400">
          <ClockIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-slate-400 leading-tight">Reporting Status</h3>
        </div>
      </div>
    </div>
  );
}
