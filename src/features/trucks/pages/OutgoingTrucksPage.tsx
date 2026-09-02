import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOutgoingTrucks } from '../services/truckApi';
import type { OutgoingTruck } from '../types';
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

export function OutgoingTrucksPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: trucks = [], isLoading: loading, isError, error, refetch } = useQuery<OutgoingTruck[], Error>({
    queryKey: QUERY_KEYS.outgoingTrucks,
    queryFn: () => getOutgoingTrucks(),
  });

  const filteredTrucks = trucks.filter((t) =>
    t.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.truck_number_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.truck_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4 mb-6">
          <button 
            type="button"
            onClick={() => navigate('/dashboard', { replace: true })}
            aria-label="Back to dashboard"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">Outgoing Trucks</h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-[1200px] mx-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-60">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            placeholder="Search by driver, plate or type..." 
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
            <div className="text-center py-12">
              <p className="text-text-secondary">Loading trucks...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-error">{error instanceof Error ? error.message : 'Failed to fetch trucks'}</p>
            </div>
          ) : filteredTrucks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No trucks found.</p>
            </div>
          ) : (
            filteredTrucks.map((truck) => (
              <div 
                key={truck.id}
                className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col sm:flex-row gap-5"
              >
                {/* Icon & Primary Info */}
                <div className="flex flex-row items-center gap-4 flex-1">
                  <div className="w-12 h-12 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <TruckIcon />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-bold text-text-primary tracking-tight leading-none mb-1.5">
                      {truck.truck_number_plate}
                    </h3>
                    <p className="text-[14px] text-text-secondary font-medium">
                      {truck.driver_name} • {truck.truck_type}
                    </p>
                  </div>
                </div>

                {/* Destination & Action */}
                <div className="flex flex-col justify-center sm:items-end gap-3 border-t sm:border-t-0 sm:border-l border-slate-900/5 pt-4 sm:pt-0 sm:pl-5">
                  <div className="sm:text-right">
                    <p className="text-[12px] text-text-secondary mb-0.5">Destination</p>
                    <p className="text-[14px] font-semibold text-text-primary max-w-[200px] truncate">
                      {truck.delivery_address_name}
                    </p>
                  </div>
                  
                  <button 
                    type="button"
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-[12px] font-semibold text-[14px] transition-transform active:scale-[0.98] ${
                      truck.is_reported 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary text-white shadow-[0_4px_12px_rgba(10,46,99,0.15)] hover:shadow-[0_4px_16px_rgba(10,46,99,0.2)]'
                    }`}
                    disabled={truck.is_reported}
                    onClick={() => navigate(`/trucks/outgoing/report/${truck.id}`, { state: { truck } })}
                  >
                    {truck.is_reported ? 'Reported' : 'Report Arrival'}
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
