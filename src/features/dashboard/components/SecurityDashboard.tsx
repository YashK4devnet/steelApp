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
      <button className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-red-500 w-full text-left active:scale-[0.98] transition-all duration-150">
        <div className="w-12 h-12 flex-shrink-0 bg-red-100 rounded-full flex items-center justify-center text-red-600 transition-colors">
          <div style={{ transform: 'scaleX(-1)' }}>
            <TruckIcon className="w-6 h-6" />
          </div>
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-text-primary leading-tight">Trucks from warehouse</h3>
        </div>
      </button>

      {/* Card 3: Gate Pass */}
      <button className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500 w-full text-left active:scale-[0.98] transition-all duration-150">
        <div className="w-12 h-12 flex-shrink-0 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 transition-colors">
          <ClipboardIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-text-primary leading-tight">Gate Pass Creation</h3>
        </div>
      </button>

      {/* Card 4: Inventory */}
      <button className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-amber-500 w-full text-left active:scale-[0.98] transition-all duration-150">
        <div className="w-12 h-12 flex-shrink-0 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 transition-colors">
          <BoxIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-text-primary leading-tight">Material Inventory</h3>
        </div>
      </button>

      {/* Card 5: Security Logs */}
      <button className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-violet-500 w-full text-left active:scale-[0.98] transition-all duration-150">
        <div className="w-12 h-12 flex-shrink-0 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 transition-colors">
          <ShieldIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-text-primary leading-tight">Security Logs</h3>
        </div>
      </button>

      {/* Card 6: Shift Schedule */}
      <button className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-teal-500 w-full text-left active:scale-[0.98] transition-all duration-150">
        <div className="w-12 h-12 flex-shrink-0 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 transition-colors">
          <ClockIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-text-primary leading-tight">Shift Schedule</h3>
        </div>
      </button>
    </div>
  );
}
