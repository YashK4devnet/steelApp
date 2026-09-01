import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTransporterLoadingTrucks } from '../services/transporterApi';
import { PullToRefresh } from '../../../components/ui/PullToRefresh';
import { QUERY_KEYS } from '../../../constants/queryKeys';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

function TruckSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((n) => (
        <div 
          key={n} 
          className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col sm:flex-row gap-5 animate-pulse"
        >
          <div className="flex flex-row items-center gap-4 flex-1">
            <div className="w-12 h-12 flex-shrink-0 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 bg-slate-200 rounded-md w-32" />
                <div className="h-4 bg-slate-200 rounded-full w-16" />
              </div>
              <div className="h-4 bg-slate-200 rounded-md w-48" />
              <div className="h-3.5 bg-slate-100 rounded-md w-full max-w-sm mt-1" />
            </div>
          </div>
          <div className="flex flex-col justify-center sm:items-end gap-3 border-t sm:border-t-0 sm:border-l border-slate-900/5 pt-4 sm:pt-0 sm:pl-5">
            <div className="sm:text-right space-y-1">
              <div className="h-3 bg-slate-100 rounded w-20 sm:ml-auto" />
              <div className="h-4 bg-slate-200 rounded w-36 sm:ml-auto" />
            </div>
            <div className="h-10 bg-slate-200 rounded-[12px] w-full sm:w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransporterLoadingTrucksPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: trucks = [], isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.transporterLoadingTrucks,
    queryFn: getTransporterLoadingTrucks,
  });

  const filteredTrucks = trucks.filter((t) =>
    (t.driver_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.truck_number_plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.truck_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.pickup_location_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.delivery_address_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard', { replace: true }))}
              aria-label="Back"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="text-[24px] font-bold text-text-primary tracking-tight">Upload Bilty</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-[1200px] mx-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-60">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            placeholder="Search by driver, plate or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white rounded-[16px] border border-slate-900/5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] outline-none focus:border-primary transition-colors text-[15px] font-medium placeholder:text-text-secondary placeholder:font-normal"
          />
        </div>
      </div>

      {/* List Content wrapped in PullToRefresh */}
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col gap-4">
          {loading ? (
            <TruckSkeleton />
          ) : isError ? (
            <div className="bg-white rounded-[24px] p-8 text-center shadow-sm border border-slate-900/5 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xl font-bold">
                ⚠️
              </div>
              <h3 className="text-base font-bold text-text-primary">Unable to Load Trucks</h3>
              <p className="text-xs text-text-secondary max-w-md">
                {error instanceof Error ? error.message : 'Failed to connect to server.'}
              </p>
              <button 
                type="button"
                onClick={() => handleRefresh()}
                className="mt-2 px-5 py-2 bg-primary text-white text-xs font-semibold rounded-full shadow-sm active:scale-95 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : filteredTrucks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[24px] p-6 shadow-sm border border-slate-900/5">
              <p className="text-text-secondary font-medium">No loading trucks assigned.</p>
            </div>
          ) : (
            filteredTrucks.map((truck) => (
              <div 
                key={truck.id}
                className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col sm:flex-row gap-5"
              >
                {/* Icon & Primary Info */}
                <div className="flex flex-row items-center gap-4 flex-1">
                  <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <TruckIcon />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-[18px] font-bold text-text-primary tracking-tight leading-none">
                        {truck.truck_number_plate}
                      </h3>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        truck.is_bilty_submitted 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {truck.is_bilty_submitted ? 'Bilty Submitted' : truck.state || 'Loading'}
                      </span>
                    </div>
                    <p className="text-[14px] text-text-secondary font-medium">
                      {truck.driver_name} {truck.truck_type ? `• ${truck.truck_type}` : ''}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-1">
                      <span className="font-semibold text-slate-700">Pickup:</span> {truck.pickup_location_name}
                    </p>
                  </div>
                </div>

                {/* Destination & Action */}
                <div className="flex flex-col justify-center sm:items-end gap-3 border-t sm:border-t-0 sm:border-l border-slate-900/5 pt-4 sm:pt-0 sm:pl-5">
                  <div className="sm:text-right">
                    <p className="text-[12px] text-text-secondary mb-0.5">Delivery Destination</p>
                    <p className="text-[14px] font-semibold text-text-primary max-w-[220px] truncate">
                      {truck.delivery_address_name}
                    </p>
                  </div>
                  
                  <button 
                    type="button"
                    disabled={truck.is_bilty_submitted}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-[12px] font-semibold text-[14px] transition-all ${
                      truck.is_bilty_submitted 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none' 
                        : 'bg-primary text-white shadow-[0_4px_12px_rgba(10,46,99,0.15)] hover:shadow-[0_4px_16px_rgba(10,46,99,0.2)] active:scale-[0.98]'
                    }`}
                  >
                    {truck.is_bilty_submitted ? 'Bilty Submitted' : 'Submit Bilty'}
                  </button>
                </div>
              </div>
            ))
          )}
        </main>
      </PullToRefresh>
    </div>
  );
}
