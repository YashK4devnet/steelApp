import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, ReceiptIcon, FileTextIcon, WarehouseIcon } from './Icons';

// Mock data structure matching Odoo Mobile API schema for /booking/trucks/loading
export interface MockLoadingTruck {
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

export const MOCK_LOADING_TRUCKS: MockLoadingTruck[] = [
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
  }
];

export function SellerDashboard() {
  const navigate = useNavigate();

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
          <div className="flex flex-col gap-1">
            <h3 className="text-[16px] font-semibold text-text-primary leading-tight">
              Loading Trucks
            </h3>
            <span className="text-[12px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
              {MOCK_LOADING_TRUCKS.length} Pending
            </span>
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
