import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, ClipboardIcon, BoxIcon, ShieldIcon, ClockIcon } from './Icons';

export function SecurityDashboard() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Card 1: Inbound Trucks */}
      <button 
        onClick={() => navigate('/trucks/loaded')}
        className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 w-full text-left active:scale-[0.98] transition-all duration-150"
      >
        <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 transition-colors">
          <TruckIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-text-primary leading-tight">Trucks to warehouse</h3>
        </div>
      </button>

      {/* Card 2: Outbound Trucks */}
      <div className="bg-white/60 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
          Coming Soon
        </div>
        <div className="w-12 h-12 flex-shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
          <div style={{ transform: 'scaleX(-1)' }}>
            <TruckIcon className="w-6 h-6" />
          </div>
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-slate-400 leading-tight">Trucks from warehouse</h3>
        </div>
      </div>

      {/* Card 3: Gate Pass */}
      <div className="bg-white/60 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
          Coming Soon
        </div>
        <div className="w-12 h-12 flex-shrink-0 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-400">
          <ClipboardIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-slate-400 leading-tight">Gate Pass Creation</h3>
        </div>
      </div>

      {/* Card 5: Security Logs */}
      <div className="bg-white/60 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
          Coming Soon
        </div>
        <div className="w-12 h-12 flex-shrink-0 bg-violet-50 rounded-full flex items-center justify-center text-violet-400">
          <ShieldIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-slate-400 leading-tight">Security Logs</h3>
        </div>
      </div>
    </div>
  );
}
