import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { ProposedTruckDetail } from '../types';

interface DriverAssignmentCardProps {
  index: number;
  truck: ProposedTruckDetail;
  onUpdate: (index: number, field: keyof ProposedTruckDetail, value: string | number) => void;
}

export function DriverAssignmentCard({ index, truck, onUpdate }: DriverAssignmentCardProps) {
  return (
    <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-4">
      {/* Header with Truck Index & Spec */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs flex items-center justify-center border border-emerald-200/60">
            {index + 1}
          </span>
          <div>
            <h4 className="font-bold text-text-primary text-[15px] leading-tight">
              Truck #{index + 1} Assignment
            </h4>
            <p className="text-xs font-semibold text-text-secondary mt-0.5">
              {truck.vehicle_type} • {truck.capacity_tons} MT Capacity
            </p>
          </div>
        </div>
      </div>

      {/* Driver & Truck Details Inputs */}
      <div className="flex flex-col gap-4">
        {/* Truck Number Plate */}
        <Input
          id={`truck_number_plate_${index}`}
          name={`truck_number_plate_${index}`}
          label="Truck Number Plate *"
          placeholder="e.g. AS-01-EA-1234"
          value={truck.truck_number_plate || ''}
          onChange={(e) => onUpdate(index, 'truck_number_plate', e.target.value)}
        />

        {/* Driver Name */}
        <Input
          id={`driver_name_${index}`}
          name={`driver_name_${index}`}
          label="Driver Name *"
          placeholder="Enter driver name"
          value={truck.driver_name || ''}
          onChange={(e) => onUpdate(index, 'driver_name', e.target.value)}
        />

        {/* Driver Contact Number */}
        <Input
          id={`driver_contact_${index}`}
          name={`driver_contact_${index}`}
          label="Driver Contact Number *"
          type="tel"
          placeholder="Enter phone number"
          value={truck.driver_contact || ''}
          onChange={(e) => onUpdate(index, 'driver_contact', e.target.value)}
        />

        {/* Driver License Number */}
        <Input
          id={`driver_license_number_${index}`}
          name={`driver_license_number_${index}`}
          label="Driver License Number"
          placeholder="Enter driver license number"
          value={truck.driver_license_number || ''}
          onChange={(e) => onUpdate(index, 'driver_license_number', e.target.value)}
        />
      </div>
    </div>
  );
}
