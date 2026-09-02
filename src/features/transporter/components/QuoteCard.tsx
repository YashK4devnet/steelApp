import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TransporterQuotation } from '../types';
import { getQuotationDetail } from '../services/transporterApi';
import { QUERY_KEYS } from '../../../constants/queryKeys';

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

interface QuoteCardProps {
  quote: TransporterQuotation;
  onSubmitQuote?: (quote: TransporterQuotation) => void;
  onAssignDrivers?: (quote: TransporterQuotation) => void;
}

function getTruckLineStateBadge(state: string) {
  switch (state) {
    case 'waiting_team_approval':
      return {
        label: 'Waiting Approval',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
      };
    case 'waiting_management_approval':
      return {
        label: 'Mgmt Approval',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
      };
    case 'management_approved':
    case 'done':
      return {
        label: 'Approved',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      };
    case 'loading':
      return {
        label: 'Loading',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
      };
    case 'loaded':
      return {
        label: 'Loaded',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/60',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        badgeClass: 'bg-red-50 text-red-700 border-red-200/60',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200/60',
      };
    default:
      return {
        label: String(state).replace(/_/g, ' ').toUpperCase(),
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200/60',
      };
  }
}

export function QuoteCard({ quote, onSubmitQuote, onAssignDrivers }: QuoteCardProps) {
  // Fetch detailed quotation to show individual truck lines and their specific status
  const { data: detail } = useQuery({
    queryKey: QUERY_KEYS.transporterQuotationDetail(quote.id),
    queryFn: () => getQuotationDetail(quote.id),
    staleTime: 30000,
  });

  const truckLines = detail?.truck_lines || quote.truck_lines || [];
  const rateBaseLabel = quote.by_truck ? 'Truck' : 'Ton';
  const formattedAskingRate = typeof quote.asking_rate === 'number'
    ? `₹${quote.asking_rate.toLocaleString('en-IN')} / ${rateBaseLabel}`
    : `₹${quote.asking_rate} / ${rateBaseLabel}`;

  const isPendingSubmission = quote.state === 'waiting_team_approval' && (quote.proposed_truck_count || 0) === 0;
  
  // Check if any truck line is approved by management or waiting management approval and eligible for driver assignment
  const hasApprovedTrucks = truckLines.some(
    (tl) => tl.state === 'management_approved' || tl.state === 'waiting_management_approval'
  );

  const hasDriversAssigned = truckLines.some(
    (tl) =>
      (tl.state === 'management_approved' || tl.state === 'waiting_management_approval') &&
      Boolean(tl.truck_number && tl.driver_name)
  );

  const handleCardClick = () => {
    if (hasApprovedTrucks && onAssignDrivers) {
      onAssignDrivers(quote);
    } else if (isPendingSubmission && onSubmitQuote) {
      onSubmitQuote(quote);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-3.5 relative overflow-hidden transition-all cursor-pointer hover:border-primary/20 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] active:scale-[0.99]"
    >
      {/* Header Row: Booking Number without misleading single global status badge */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-text-primary text-[16px] tracking-tight">{quote.booking_number}</h3>
          <p className="text-xs font-semibold text-text-secondary mt-0.5">Quotation #{quote.id}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <TruckIcon className="w-3.5 h-3.5" />
          <span>{quote.requested_truck_count} Truck{quote.requested_truck_count > 1 ? 's' : ''} Requested</span>
        </div>
      </div>

      {/* Information Details */}
      <div className="flex flex-col gap-2 bg-slate-50/80 p-3.5 rounded-[16px] border border-slate-900/5">
        {/* Route: From & Where To */}
        <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-200/60">
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-text-secondary w-20 shrink-0 pt-0.5">From:</span>
            <span className="text-xs sm:text-sm font-semibold text-text-primary leading-snug">{quote.pickup_location_name}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-text-secondary w-20 shrink-0 pt-0.5">Where To:</span>
            <span className="text-xs sm:text-sm font-semibold text-text-primary leading-snug">{quote.delivery_address_name}</span>
          </div>
        </div>

        {/* Asking Rate Row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-xs font-semibold text-text-secondary">Asking Rate:</span>
          <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
            {formattedAskingRate}
          </span>
        </div>
      </div>

      {/* Individual Truck Lines Breakdown (Only shown for Already Quoted items) */}
      {!isPendingSubmission && truckLines.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wide px-0.5">
            Trucks & Status ({truckLines.length})
          </span>

          <div className="flex flex-col gap-2">
            {truckLines.map((tl, idx) => {
              const statusBadge = getTruckLineStateBadge(tl.state);
              const vehicleName = tl.proposed_truck_type || tl.requested_truck_type_name || 'Vehicle';
              const capacityLabel = tl.truck_capacity && tl.truck_capacity > 0 ? ` (${tl.truck_capacity} MT)` : '';
              const proposedRateLabel = tl.proposal_rate && tl.proposal_rate > 0
                ? `₹${tl.proposal_rate.toLocaleString('en-IN')} / ${rateBaseLabel}`
                : null;

              return (
                <div
                  key={tl.id || idx}
                  className="p-3 bg-slate-50/90 rounded-[14px] border border-slate-200/60 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-text-primary truncate">
                        {vehicleName}{capacityLabel}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0 ${statusBadge.badgeClass}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 pl-7">
                    {proposedRateLabel && (
                      <span className="font-semibold text-primary">
                        Proposed: {proposedRateLabel}
                      </span>
                    )}

                    {tl.truck_number && (
                      <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                        {tl.truck_number}
                      </span>
                    )}

                    {tl.driver_name && (
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span>{tl.driver_name}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Row */}
      <div className="flex justify-end gap-2 pt-1 mt-0.5">
        {isPendingSubmission && onSubmitQuote && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSubmitQuote(quote);
            }}
            className="px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Submit Quote
          </button>
        )}

        {hasApprovedTrucks && onAssignDrivers && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAssignDrivers(quote);
            }}
            className="px-5 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <TruckIcon className="w-3.5 h-3.5" />
            <span>{hasDriversAssigned ? 'Edit Driver Details' : 'Enter Driver Details'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
