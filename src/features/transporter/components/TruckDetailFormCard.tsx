import React from 'react';
import type { ProposedTruckDetail } from '../types';
import { VEHICLE_TYPE_OPTIONS } from '../constants';

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 pointer-events-none">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

interface TruckDetailFormCardProps {
  index: number;
  truck: ProposedTruckDetail;
  onUpdate: (index: number, field: keyof ProposedTruckDetail, value: string | number) => void;
}

export function TruckDetailFormCard({ index, truck, onUpdate }: TruckDetailFormCardProps) {
  return (
    <div className="bg-white rounded-[20px] p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,23,42,0.03)] border border-slate-900/5 flex flex-col gap-3.5 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <h4 className="font-bold text-text-primary text-[14px]">
            Truck #{index + 1} Specifications
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Vehicle Type Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-text-primary">
            Vehicle Type *
          </label>
          <div className="relative">
            <select
              value={truck.vehicle_type}
              onChange={(e) => onUpdate(index, 'vehicle_type', e.target.value)}
              className="w-full h-11 pl-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-[12px] appearance-none outline-none focus:border-primary focus:bg-white text-xs sm:text-sm font-semibold text-text-primary cursor-pointer transition-all"
            >
              <option value="">Select vehicle type</option>
              {VEHICLE_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        {/* 2. Capacity (in TONs) */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-text-primary">
            Capacity (TONs) *
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Enter capacity in TONs"
              value={truck.capacity_tons}
              onChange={(e) => onUpdate(index, 'capacity_tons', e.target.value)}
              className="w-full h-11 pl-3.5 pr-14 bg-slate-50 border border-slate-200 rounded-[12px] outline-none focus:border-primary focus:bg-white text-xs sm:text-sm font-semibold text-text-primary transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary pointer-events-none">
              TON
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
