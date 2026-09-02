import React from 'react';
import type { TransporterQuotation, QuotationLineState } from '../types';

const TruckIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

interface QuoteCardProps {
  quote: TransporterQuotation;
  onSubmitQuote?: (quote: TransporterQuotation) => void;
  onAssignDrivers?: (quote: TransporterQuotation) => void;
}

function getStateConfig(state: QuotationLineState | string) {
  switch (state) {
    case 'draft':
      return {
        label: 'Draft',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
      };
    case 'waiting_team_approval':
      return {
        label: 'Waiting for Approval',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
      };
    case 'done':
      return {
        label: 'All Approved',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      };
    case 'partially_cancelled':
      return {
        label: 'Partially Cancelled',
        badgeClass: 'bg-red-50 text-red-700 border-red-200/60',
      };
    default:
      return {
        label: String(state).replace(/_/g, ' ').toUpperCase(),
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200/60',
      };
  }
}

export function QuoteCard({ quote, onSubmitQuote, onAssignDrivers }: QuoteCardProps) {
  const isDraft = quote.state === 'draft';
  const isApproved = quote.state === 'done';
  const isWaitingApproval = quote.state === 'waiting_team_approval';
  const stateConfig = getStateConfig(quote.state);

  const rateBaseLabel = quote.by_truck ? 'Truck' : 'Ton';
  const formattedAskingRate = typeof quote.asking_rate === 'number'
    ? `₹${quote.asking_rate.toLocaleString('en-IN')} / ${rateBaseLabel}`
    : `₹${quote.asking_rate} / ${rateBaseLabel}`;

  const handleCardClick = () => {
    if (isApproved && onAssignDrivers) {
      onAssignDrivers(quote);
    } else if (onSubmitQuote) {
      onSubmitQuote(quote);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-3.5 relative overflow-hidden transition-all cursor-pointer hover:border-primary/20 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] active:scale-[0.99]"
    >
      {/* Header Row: Booking Number & State */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-text-primary text-[16px] tracking-tight">{quote.booking_number}</h3>
          <p className="text-xs font-semibold text-text-secondary mt-0.5">Quotation #{quote.id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${stateConfig.badgeClass}`}>
          {stateConfig.label}
        </div>
      </div>

      {/* Information Details */}
      <div className="flex flex-col gap-2 bg-slate-50/80 p-3.5 rounded-[16px] border border-slate-900/5">
        {/* Route: From & Where To */}
        <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-200/60">
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-text-secondary w-20 shrink-0 pt-0.5">From:</span>
            <span className="text-xs sm:text-sm font-semibold text-text-primary">{quote.pickup_location_name}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-text-secondary w-20 shrink-0 pt-0.5">Where To:</span>
            <span className="text-xs sm:text-sm font-semibold text-text-primary">{quote.delivery_address_name}</span>
          </div>
        </div>

        {/* Rates & Trucks Counts */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary w-20 shrink-0">Asking Rate:</span>
            <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              {formattedAskingRate}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            <TruckIcon className="w-3.5 h-3.5" />
            <span>{quote.requested_truck_count} Trucks Requested</span>
          </div>
        </div>

        {/* Proposed & Approved Breakdown for Quoted items */}
        {!isDraft && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 mt-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              <span className="font-semibold text-slate-700">Proposed:</span> {quote.proposed_truck_count} Trucks
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="font-semibold text-emerald-800">Approved:</span> {quote.approved_truck_count} Trucks
            </div>
          </div>
        )}
      </div>

      {/* Action Row for Draft / Pending Quotes */}
      {isDraft && onSubmitQuote && (
        <div className="flex justify-end gap-2 pt-1">
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
        </div>
      )}

      {/* Action Row for Waiting Team Approval */}
      {isWaitingApproval && (
        <div className="flex justify-between items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            ⏳ Waiting for Internal Team Approval
          </span>
        </div>
      )}

      {/* Action Row for Approved Quotes */}
      {isApproved && onAssignDrivers && (
        <div className="flex justify-between items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Approved ({quote.approved_truck_count} Trucks)
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAssignDrivers(quote);
            }}
            className="px-5 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <TruckIcon className="w-3.5 h-3.5" />
            <span>Enter Driver Details</span>
          </button>
        </div>
      )}
    </div>
  );
}
