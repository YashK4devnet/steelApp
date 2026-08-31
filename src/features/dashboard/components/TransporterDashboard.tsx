import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BillCheckIcon, QuoteIcon } from './Icons';

export function TransporterDashboard() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Tile 1: Upload Bill Tick */}
      <button 
        onClick={() => navigate('/transporter/upload-bill')}
        className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left transition-all hover:bg-slate-50 active:scale-[0.98] group cursor-pointer"
      >
        <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
          <BillCheckIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-text-primary leading-tight">Upload Bill Tick</h3>
          <p className="text-[12px] font-semibold text-text-secondary mt-1">Submit & View</p>
        </div>
      </button>

      {/* Tile 2: Quotes */}
      <button 
        onClick={() => navigate('/transporter/quotes')}
        className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left transition-all hover:bg-slate-50 active:scale-[0.98] group cursor-pointer"
      >
        <div className="w-12 h-12 flex-shrink-0 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
          <QuoteIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-text-primary leading-tight">Quotes</h3>
          <p className="text-[12px] font-semibold text-text-secondary mt-1">Rate & Inquiries</p>
        </div>
      </button>
    </div>
  );
}
