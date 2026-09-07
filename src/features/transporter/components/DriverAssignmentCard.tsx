import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { ProposedTruckDetail } from '../types';

interface DriverAssignmentCardProps {
  index: number;
  truck: ProposedTruckDetail;
  onUpdate: (index: number, field: keyof ProposedTruckDetail, value: string | number) => void;
}

function getTruckStateBadge(state?: string) {
  switch (state) {
    case 'management_approved':
      return {
        label: 'Approved by Management',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50',
      };
    case 'waiting_management_approval':
      return {
        label: 'Waiting Mgmt Approval',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/50',
      };
    case 'waiting_team_approval':
      return {
        label: 'Waiting Team Approval',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/50',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        badgeClass: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800/50',
      };
    case 'loading':
      return {
        label: 'Loading',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/50',
      };
    case 'loaded':
      return {
        label: 'Loaded',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/50',
      };
    default:
      return {
        label: state ? state.replace(/_/g, ' ') : 'Pending',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      };
  }
}

function getReadOnlyReason(state?: string, defaultLabel?: string): string {
  switch (state) {
    case 'waiting_team_approval':
      return 'Read-only: Awaiting team approval before driver details can be assigned.';
    case 'rejected':
      return 'Read-only: This truck quote was rejected.';
    case 'cancelled':
      return 'Read-only: This truck line has been cancelled.';
    case 'loading':
    case 'loaded':
      return `Read-only: Truck has already progressed to ${state}.`;
    default:
      return `Read-only: Truck status is ${defaultLabel?.toLowerCase() || 'pending'}.`;
  }
}

export function DriverAssignmentCard({ index, truck, onUpdate }: DriverAssignmentCardProps) {
  // Trucks in 'management_approved' or 'waiting_management_approval' state can have driver details added or edited
  const isEditable = truck.state === 'management_approved' || truck.state === 'waiting_management_approval';
  const stateBadge = getTruckStateBadge(truck.state);

  return (
    <div className={`rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border flex flex-col gap-4 transition-all ${
      isEditable 
        ? 'bg-white dark:bg-surface border-slate-900/5 dark:border-white/10' 
        : 'border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-slate-800/30 opacity-90'
    }`}>
      {/* Header with Truck Index & Spec & Status Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-7 h-7 rounded-full font-extrabold text-xs flex items-center justify-center border shrink-0 ${
            isEditable
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
          }`}>
            {index + 1}
          </span>
          <div className="min-w-0">
            <h4 className="font-bold text-text-primary text-[15px] leading-tight truncate">
              Truck #{index + 1} {truck.vehicle_type ? `• ${truck.vehicle_type}` : ''}
            </h4>
            <p className="text-xs font-semibold text-text-secondary mt-0.5 truncate">
              {truck.capacity_tons ? `${truck.capacity_tons} MT Capacity` : 'Custom Truck'}
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0 ${stateBadge.badgeClass}`}>
          {stateBadge.label}
        </span>
      </div>

      {/* Read-Only Informational Notice for Non-Approved Trucks */}
      {!isEditable && (
        <div className="p-3 bg-slate-100/80 dark:bg-slate-800/60 rounded-[12px] border border-slate-200/80 dark:border-white/10 text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <span>🔒</span>
          <span>{getReadOnlyReason(truck.state, stateBadge.label)}</span>
        </div>
      )}

      {/* Driver & Truck Details Inputs */}
      <div className="flex flex-col gap-4">
        {/* Truck Number Plate */}
        <Input
          id={`truck_number_plate_${index}`}
          name={`truck_number_plate_${index}`}
          label={`Truck Number Plate ${isEditable ? '*' : ''}`}
          placeholder="e.g. AS-01-EA-1234"
          disabled={!isEditable}
          value={truck.truck_number_plate || ''}
          onChange={(e) => onUpdate(index, 'truck_number_plate', e.target.value)}
        />

        {/* Driver Name */}
        <Input
          id={`driver_name_${index}`}
          name={`driver_name_${index}`}
          label={`Driver Name ${isEditable ? '*' : ''}`}
          placeholder="Enter driver name"
          disabled={!isEditable}
          value={truck.driver_name || ''}
          onChange={(e) => onUpdate(index, 'driver_name', e.target.value)}
        />

        {/* Driver Contact Number */}
        <Input
          id={`driver_contact_${index}`}
          name={`driver_contact_${index}`}
          label={`Driver Contact Number ${isEditable ? '*' : ''}`}
          type="tel"
          placeholder="Enter phone number"
          disabled={!isEditable}
          value={truck.driver_contact || ''}
          onChange={(e) => onUpdate(index, 'driver_contact', e.target.value)}
        />

        {/* Driver License Number */}
        <Input
          id={`driver_license_number_${index}`}
          name={`driver_license_number_${index}`}
          label="Driver License Number"
          placeholder="Enter driver license number"
          disabled={!isEditable}
          value={truck.driver_license_number || ''}
          onChange={(e) => onUpdate(index, 'driver_license_number', e.target.value)}
        />
      </div>
    </div>
  );
}
