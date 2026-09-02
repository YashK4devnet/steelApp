import React, { useState } from 'react';
import type { ProposedTruckDetail, PricingBase, ActiveTruckType } from '../types';
import { PRICING_BASE_OPTIONS } from '../constants';

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 pointer-events-none">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

interface TruckDetailFormCardProps {
  index: number;
  truck: ProposedTruckDetail;
  truckTypes?: ActiveTruckType[];
  onUpdate: (index: number, field: keyof ProposedTruckDetail, value: unknown) => void;
}

export function TruckDetailFormCard({ index, truck, truckTypes = [], onUpdate }: TruckDetailFormCardProps) {
  const currentPricingBase = truck.pricing_base || 'per_ton';
  const unitLabel = currentPricingBase === 'per_truck' ? 'Truck' : 'TON';

  // Toggle for custom truck type vs existing dropdown
  const [isCustomType, setIsCustomType] = useState<boolean>(Boolean(truck.is_new_truck_type));

  const handleTruckTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomType(true);
      onUpdate(index, 'is_new_truck_type', true);
      onUpdate(index, 'proposed_truck_type_id', null);
      onUpdate(index, 'vehicle_type', '');
    } else {
      setIsCustomType(false);
      const selectedId = parseInt(val, 10);
      const matched = truckTypes.find((t) => t.id === selectedId);
      onUpdate(index, 'is_new_truck_type', false);
      onUpdate(index, 'proposed_truck_type_id', !isNaN(selectedId) ? selectedId : null);
      onUpdate(index, 'vehicle_type', matched ? matched.name : val);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-4 transition-all">
      {/* Truck Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center border border-primary/20">
            {index + 1}
          </span>
          <h4 className="font-bold text-text-primary text-[15px] leading-tight">
            Truck #{index + 1} Details & Rate
          </h4>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {/* 1. Vehicle Type Dropdown / Custom Input */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-bold text-text-primary">
              Vehicle Type *
            </label>
            <button
              type="button"
              onClick={() => {
                const nextCustom = !isCustomType;
                setIsCustomType(nextCustom);
                onUpdate(index, 'is_new_truck_type', nextCustom);
                if (!nextCustom && truckTypes.length > 0) {
                  onUpdate(index, 'proposed_truck_type_id', truckTypes[0].id);
                  onUpdate(index, 'vehicle_type', truckTypes[0].name);
                }
              }}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
            >
              {isCustomType ? '← Choose from active types' : '+ Custom Type'}
            </button>
          </div>

          {isCustomType ? (
            <input
              type="text"
              placeholder="e.g. 32 Ft Multi-Axle Container"
              value={truck.truck_type_name || truck.vehicle_type || ''}
              onChange={(e) => {
                onUpdate(index, 'truck_type_name', e.target.value);
                onUpdate(index, 'vehicle_type', e.target.value);
              }}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-[12px] outline-none focus:border-primary focus:bg-white text-xs sm:text-sm font-semibold text-text-primary transition-all"
            />
          ) : (
            <div className="relative">
              <select
                value={truck.proposed_truck_type_id ?? ''}
                onChange={handleTruckTypeSelect}
                className="w-full h-11 pl-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-[12px] appearance-none outline-none focus:border-primary focus:bg-white text-xs sm:text-sm font-semibold text-text-primary cursor-pointer transition-all"
              >
                <option value="">Select active truck type</option>
                {truckTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
                {truck.vehicle_type && !truckTypes.some((t) => t.name.toLowerCase() === truck.vehicle_type?.toLowerCase() || t.id === truck.proposed_truck_type_id) && (
                  <option value={truck.proposed_truck_type_id ?? truck.vehicle_type}>
                    {truck.vehicle_type}
                  </option>
                )}
                <option value="__custom__">+ Enter custom truck type...</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </div>
            </div>
          )}
        </div>

        {/* 2. Capacity & 3. Pricing Base Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Capacity (in TONs) */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-text-primary">
              Capacity (TONs) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 16.5"
                value={truck.capacity_tons}
                onChange={(e) => onUpdate(index, 'capacity_tons', e.target.value)}
                className="w-full h-11 pl-3.5 pr-14 bg-slate-50 border border-slate-200 rounded-[12px] outline-none focus:border-primary focus:bg-white text-xs sm:text-sm font-semibold text-text-primary transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary pointer-events-none">
                TON
              </span>
            </div>
          </div>

          {/* Pricing Base Toggle (By TON vs By Truck) */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-text-primary">
              Pricing Base *
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-[12px] border border-slate-200/60 h-11 items-center">
              {PRICING_BASE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdate(index, 'pricing_base', opt.value as PricingBase)}
                  className={`h-full rounded-[9px] text-[11px] font-bold transition-all flex items-center justify-center ${
                    currentPricingBase === opt.value
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Proposed Rate for this Truck */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-text-primary">
            Proposal Rate ({currentPricingBase === 'per_truck' ? 'Per Truck' : 'Per TON'}) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-primary">
              ₹
            </span>
            <input
              type="number"
              min="1"
              step="1"
              required
              placeholder="e.g. 24000 (Whole numbers only)"
              value={truck.proposed_rate}
              onChange={(e) => {
                const raw = e.target.value;
                // Proposal rate must be integer
                onUpdate(index, 'proposed_rate', raw);
              }}
              className="w-full h-11 pl-8 pr-20 bg-slate-50 border border-slate-200 rounded-[12px] outline-none focus:border-primary focus:bg-white text-xs sm:text-sm font-bold text-text-primary transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary uppercase">
              / {unitLabel}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Integer whole number (no decimals)</p>
        </div>
      </div>
    </div>
  );
}
