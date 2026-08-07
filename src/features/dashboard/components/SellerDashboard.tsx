import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, ReceiptIcon, FileTextIcon, WarehouseIcon } from './Icons';
import { getLoadingTrucks } from '../../trucks/services/truckApi';

export function SellerDashboard() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const trucks = await getLoadingTrucks();
        if (isMounted) {
          const pending = trucks.filter(t => !t.is_submitted).length;
          setPendingCount(pending);
        }
      } catch (err) {
        console.warn('Failed to fetch seller loading trucks count:', err);
        if (isMounted) {
          setPendingCount(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCounts();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Loading Trucks (Active) */}
        <button 
          onClick={() => navigate('/trucks/loading')}
          className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-start gap-4 group cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 w-full text-left active:scale-[0.98] transition-all duration-150 relative overflow-hidden"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 transition-colors">
            <TruckIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <h3 className="text-[16px] font-semibold text-text-primary leading-tight">
              Loading Trucks
            </h3>
            {loading ? (
              <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse mt-0.5" />
            ) : (
              <span className="text-[12px] font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full w-fit">
                {pendingCount ?? 0} Pending
              </span>
            )}
          </div>
        </button>

        {/* Card 2: Submitted Bills (Coming Soon) */}
        <div className="bg-white/60 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
            Coming Soon
          </div>
          <div className="w-12 h-12 flex-shrink-0 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-400">
            <ReceiptIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-slate-400 leading-tight">
              Submitted Bills
            </h3>
          </div>
        </div>

        {/* Card 3: E-Way Bills (Coming Soon) */}
        <div className="bg-white/60 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
            Coming Soon
          </div>
          <div className="w-12 h-12 flex-shrink-0 bg-amber-50 rounded-full flex items-center justify-center text-amber-400">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-slate-400 leading-tight">
              E-Way Bills
            </h3>
          </div>
        </div>

        {/* Card 4: Godown Dispatches (Coming Soon) */}
        <div className="bg-white/60 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.02)] border border-slate-900/5 flex flex-col items-start gap-4 w-full text-left cursor-not-allowed relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-[16px]">
            Coming Soon
          </div>
          <div className="w-12 h-12 flex-shrink-0 bg-purple-50 rounded-full flex items-center justify-center text-purple-400">
            <WarehouseIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-slate-400 leading-tight">
              Godown Dispatches
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
