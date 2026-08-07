import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface LoadingTruck {
  id: number;
  truck_type_id: number;
  truck_type: string;
  truck_number_plate: string;
  driver_name: string;
  state: string;
  pickup_location_id: number;
  pickup_location_name: string;
  delivery_address_id: number;
  delivery_address_name: string;
}

export const MOCK_LOADING_TRUCKS: LoadingTruck[] = [
  {
    id: 201,
    truck_type_id: 7,
    truck_type: '20 Ft Container',
    truck_number_plate: 'KA-01-AB-1234',
    driver_name: 'Rajesh Kumar',
    state: 'loading',
    pickup_location_id: 32,
    pickup_location_name: 'Vendor Godown, 123 Industrial Area, Bangalore 560001',
    delivery_address_id: 45,
    delivery_address_name: 'Main Warehouse, 123 Industrial Area, Bangalore 560001'
  },
  {
    id: 202,
    truck_type_id: 3,
    truck_type: 'Open Body 16 Ton',
    truck_number_plate: 'MH-12-PQ-9876',
    driver_name: 'Vikram Sharma',
    state: 'loading',
    pickup_location_id: 32,
    pickup_location_name: 'Vendor Godown, 123 Industrial Area, Bangalore 560001',
    delivery_address_id: 48,
    delivery_address_name: 'North Depot, Sector 4, Bangalore 560042'
  },
  {
    id: 203,
    truck_type_id: 5,
    truck_type: '32 Ft Multi-Axle',
    truck_number_plate: 'TN-07-EF-4321',
    driver_name: 'Amit Patel',
    state: 'loading',
    pickup_location_id: 32,
    pickup_location_name: 'Vendor Godown, 123 Industrial Area, Bangalore 560001',
    delivery_address_id: 50,
    delivery_address_name: 'Central Yard, Plot 12, Bangalore 560099'
  }
];

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

export function LoadingTrucksPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [trucks] = useState<LoadingTruck[]>(MOCK_LOADING_TRUCKS);

  const filteredTrucks = trucks.filter(t => 
    t.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.truck_number_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.truck_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pickup_location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.delivery_address_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">Loading Trucks</h1>
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

      {/* List Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col gap-4">
        {filteredTrucks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No loading trucks found.</p>
          </div>
        ) : (
          filteredTrucks.map(truck => (
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
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[18px] font-bold text-text-primary tracking-tight leading-none">
                      {truck.truck_number_plate}
                    </h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {truck.state}
                    </span>
                  </div>
                  <p className="text-[14px] text-text-secondary font-medium">
                    {truck.driver_name} • {truck.truck_type}
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
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-[12px] font-semibold text-[14px] shadow-[0_4px_12px_rgba(10,46,99,0.15)] hover:shadow-[0_4px_16px_rgba(10,46,99,0.2)] transition-transform active:scale-[0.98]"
                  onClick={() => alert(`Submit bill for truck #${truck.truck_number_plate}`)}
                >
                  Submit Vendor Bill
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
