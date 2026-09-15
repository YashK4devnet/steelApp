import React from 'react';
import type { TBApproverQuotation } from '../types';
import { hapticFeedback } from '../../../utils/haptics';

interface TBApproverQuoteCardProps {
  quote: TBApproverQuotation;
  onReview?: (quote: TBApproverQuotation) => void;
}

const TruckIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const LocationPinIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BuildingIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  </svg>
);

const PhoneIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export function TBApproverQuoteCard({ quote, onReview }: TBApproverQuoteCardProps) {
  const rateBaseLabel = quote.by_truck ? 'Truck' : 'Ton';
  const formattedAskingRate = typeof quote.asking_rate === 'number'
    ? `₹${quote.asking_rate.toLocaleString('en-IN')}`
    : `₹${quote.asking_rate}`;

  const hasProposedTrucks = (quote.proposed_truck_count || 0) > 0;
  const isFullyProposed = (quote.proposed_truck_count || 0) >= (quote.requested_truck_count || 1);

  const handleCardClick = () => {
    if (hasProposedTrucks && onReview) {
      hapticFeedback.light();
      onReview(quote);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`animate-filter-scale bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-4 transition-all duration-200 ${
        hasProposedTrucks 
          ? 'hover:border-primary/30 dark:hover:border-blue-500/30 cursor-pointer active:scale-[0.99]' 
          : ''
      }`}
    >
      {/* Header: Booking Number & Status Badge */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Booking
          </span>
          <h3 className="text-[17px] font-bold text-text-primary tracking-tight">
            {quote.booking_number}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1">
          {hasProposedTrucks ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Waiting Approval
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Awaiting Proposal
            </span>
          )}
        </div>
      </div>

      {/* Transporter Info */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[16px] bg-slate-50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BuildingIcon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-text-primary truncate">
              {quote.transporter_name || 'Assigned Transporter'}
            </p>
            {quote.transporter_phone && (
              <p className="text-[11px] font-medium text-text-secondary flex items-center gap-1 mt-0.5">
                <PhoneIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{quote.transporter_phone}</span>
              </p>
            )}
            {quote.transporter_address && (
              <p className="text-[11px] font-normal text-text-secondary break-words leading-relaxed mt-0.5">
                {quote.transporter_address}
              </p>
            )}
          </div>
        </div>

        {quote.transporter_phone && (
          <a
            href={`tel:${quote.transporter_phone}`}
            onClick={(e) => {
              e.stopPropagation();
              hapticFeedback.light();
            }}
            aria-label={`Call transporter at ${quote.transporter_phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 transition-all shrink-0 cursor-pointer shadow-sm"
            title={`Call ${quote.transporter_phone}`}
          >
            <PhoneIcon className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        )}
      </div>

      {/* Route: Pickup -> Delivery */}
      <div className="flex flex-col gap-2 p-3.5 rounded-[18px] bg-gradient-to-br from-slate-50/80 to-slate-100/40 dark:from-slate-800/40 dark:to-slate-800/20 border border-slate-900/5 dark:border-white/5">
        {/* Pickup */}
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 text-primary dark:text-blue-400 shrink-0">
            <LocationPinIcon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">Pickup:</span>
              <span className="text-xs font-bold text-text-primary">{quote.pickup_location_code || 'WH'}</span>
            </div>
            <p className="text-[11px] text-text-secondary break-words leading-relaxed mt-0.5">{quote.pickup_location_name}</p>
          </div>
        </div>

        {/* Route divider */}
        <div className="ml-1.5 pl-2.5 border-l-2 border-dashed border-slate-200 dark:border-slate-700 h-2" />

        {/* Delivery */}
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 text-accent shrink-0">
            <LocationPinIcon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">Delivery:</span>
              <span className="text-xs font-bold text-text-primary">{quote.delivery_address_code || 'DEST'}</span>
            </div>
            <p className="text-[11px] text-text-secondary break-words leading-relaxed mt-0.5">{quote.delivery_address_name}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid: Asking Rate, Trucks Breakdown, Truck Type */}
      <div className="grid grid-cols-2 gap-2">
        {/* Asking Rate */}
        <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            Asking Rate
          </span>
          <p className="text-[15px] font-extrabold text-primary dark:text-blue-400 mt-0.5">
            {formattedAskingRate} <span className="text-[11px] font-semibold text-text-secondary">/{rateBaseLabel}</span>
          </p>
        </div>

        {/* Truck Progress */}
        <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            Proposed / Requested
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className={`text-[15px] font-extrabold ${hasProposedTrucks ? 'text-text-primary' : 'text-text-secondary'}`}>
              {quote.proposed_truck_count || 0} / {quote.requested_truck_count || 0}
            </p>
            {isFullyProposed && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                Full
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Truck Type & Review Action */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="text-text-secondary shrink-0">
            <TruckIcon className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="font-bold text-text-primary">Requested Truck Type:</span>
            <span className="font-semibold text-text-secondary">
              {quote.requested_truck_type || 'Standard Truck'}
            </span>
          </div>
        </div>

        {hasProposedTrucks ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary-hover dark:bg-blue-600 dark:hover:bg-blue-500 shadow-[0_2px_8px_rgba(10,46,99,0.2)] active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>Review Trucks</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[11px] font-bold text-text-secondary italic">
            Waiting for transporter
          </span>
        )}
      </div>
    </div>
  );
}
