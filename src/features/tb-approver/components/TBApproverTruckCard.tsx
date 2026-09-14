import React from 'react';
import type { TBApproverTruckLine } from '../types';
import { hapticFeedback } from '../../../utils/haptics';

const CheckIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TruckIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const UserIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface TBApproverTruckCardProps {
  truckLine: TBApproverTruckLine;
  index: number;
  askingRate: number;
  rateBaseLabel?: string;
  defaultRequestedTruckType?: string;
  onApprove: (truckLine: TBApproverTruckLine) => void;
  onReject: (truckLine: TBApproverTruckLine) => void;
  isActionLoading?: boolean;
}

export function TBApproverTruckCard({
  truckLine,
  index,
  askingRate,
  rateBaseLabel = 'Truck',
  defaultRequestedTruckType,
  onApprove,
  onReject,
  isActionLoading = false,
}: TBApproverTruckCardProps) {
  const diff = truckLine.proposal_rate - askingRate;
  const isBelow = diff < 0;
  const isMatch = diff === 0;
  const isAbove = diff > 0;
  const requestedTypeName = truckLine.requested_truck_type_name || defaultRequestedTruckType || 'Standard';

  return (
    <div className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-4 transition-all">
      {/* Card Header: Truck Number Index & ID */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-blue-400 flex items-center justify-center font-extrabold text-xs">
            #{index + 1}
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-text-primary leading-tight">
              Truck Proposal #{index + 1}
            </h4>
            <span className="text-[11px] font-semibold text-text-secondary">
              Line ID: {truckLine.id}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending Approval
        </span>
      </div>

      {/* Proposed Rate vs Asking Rate */}
      <div className="p-3.5 rounded-[18px] bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-slate-800/50 dark:to-slate-800/20 border border-slate-900/5 dark:border-white/5 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Proposed Rate
          </span>
          <div className="text-right">
            <span className="text-[20px] font-extrabold text-primary dark:text-blue-400">
              ₹{truckLine.proposal_rate.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-text-secondary ml-1">
              /{rateBaseLabel}
            </span>
          </div>
        </div>

        {/* Comparison Tag */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-white/5">
          <span className="text-text-secondary">Asking Rate: ₹{askingRate.toLocaleString('en-IN')}</span>
          {isBelow && (
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[11px]">
              -₹{Math.abs(diff).toLocaleString('en-IN')} (Below Asking)
            </span>
          )}
          {isMatch && (
            <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full text-[11px]">
              Matches Asking Rate
            </span>
          )}
          {isAbove && (
            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full text-[11px]">
              +₹{diff.toLocaleString('en-IN')} (Above Asking)
            </span>
          )}
        </div>
      </div>

      {/* Truck Specifications */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            Requested Type
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="text-slate-400 dark:text-slate-500 shrink-0">
              <TruckIcon className="w-3.5 h-3.5" />
            </div>
            <p className="font-bold text-text-primary truncate" title={requestedTypeName}>
              {requestedTypeName}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            Proposed Type
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="text-primary dark:text-blue-400 shrink-0">
              <TruckIcon className="w-3.5 h-3.5" />
            </div>
            <p className="font-bold text-text-primary truncate" title={truckLine.proposed_truck_type}>
              {truckLine.proposed_truck_type || 'Standard'}
            </p>
          </div>
        </div>
      </div>

      {/* Truck Capacity */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-[16px] bg-slate-50 dark:bg-slate-800/30 border border-slate-900/5 dark:border-white/5 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          Truck Capacity
        </span>
        <span className="font-extrabold text-text-primary text-[13px]">
          {truckLine.truck_capacity} Tons
        </span>
      </div>

      {/* Driver & Vehicle Details if provided */}
      {(truckLine.truck_number || truckLine.driver_name) && (
        <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-slate-800/30 border border-slate-900/5 dark:border-white/5 flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5 text-text-secondary" />
            <span className="font-bold text-text-primary">
              {truckLine.driver_name || 'Driver Not Assigned'}
            </span>
            {truckLine.driver_contact && (
              <span className="text-text-secondary font-medium">
                ({truckLine.driver_contact})
              </span>
            )}
          </div>
          {truckLine.truck_number && (
            <div className="flex items-center gap-2 pl-5 font-semibold text-text-secondary">
              Vehicle: <span className="text-text-primary font-bold">{truckLine.truck_number}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons: Individual Reject & Approve */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100 dark:border-white/5">
        <button
          type="button"
          onClick={() => {
            hapticFeedback.light();
            onReject(truckLine);
          }}
          disabled={isActionLoading}
          className="h-11 rounded-[14px] border border-red-200 dark:border-red-900/50 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <XIcon className="w-4 h-4" />
          <span>Reject</span>
        </button>

        <button
          type="button"
          onClick={() => {
            hapticFeedback.light();
            onApprove(truckLine);
          }}
          disabled={isActionLoading}
          className="h-11 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-[0_2px_8px_rgba(16,185,129,0.25)] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Approve</span>
        </button>
      </div>
    </div>
  );
}
