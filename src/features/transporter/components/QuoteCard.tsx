import React from 'react';
import type { QuoteItem } from '../types';

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
  quote: QuoteItem;
  onSubmitQuote?: (quote: QuoteItem) => void;
}

export function QuoteCard({ quote, onSubmitQuote }: QuoteCardProps) {
  const isPendingQuote = quote.status === 'pending_quote';
  const isAccepted = quote.status === 'accepted';
  const isRejected = quote.status === 'rejected';

  const statusBadgeClass = isPendingQuote
    ? 'bg-blue-50 text-blue-700 border-blue-200/50'
    : isAccepted
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
    : isRejected
    ? 'bg-red-50 text-red-700 border-red-200/50'
    : 'bg-amber-50 text-amber-700 border-amber-200/50';

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-3.5 relative overflow-hidden">
      {/* Header Row: Quote No & Status */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-text-primary text-[16px] tracking-tight">{quote.quote_no}</h3>
          <p className="text-xs font-semibold text-text-secondary mt-0.5">{quote.created_date}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${statusBadgeClass}`}>
          {quote.state_label || (isPendingQuote ? 'Pending Quote' : isAccepted ? 'Accepted' : isRejected ? 'Rejected' : 'Pending')}
        </div>
      </div>

      {/* Information Details */}
      <div className="flex flex-col gap-2 bg-slate-50/80 p-3.5 rounded-[16px] border border-slate-900/5">
        {/* Route: From & To */}
        <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-200/60">
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-text-secondary w-20 shrink-0 pt-0.5">From:</span>
            <span className="text-xs sm:text-sm font-semibold text-text-primary">{quote.from_location}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-text-secondary w-20 shrink-0 pt-0.5">Where To:</span>
            <span className="text-xs sm:text-sm font-semibold text-text-primary">{quote.to_location}</span>
          </div>
        </div>

        {/* Materials */}
        <div className="flex items-start gap-2 pt-1">
          <span className="text-xs font-semibold text-text-secondary w-20 shrink-0 pt-0.5">Materials:</span>
          <span className="text-xs sm:text-sm font-semibold text-text-primary">{quote.materials_requested}</span>
        </div>

        {/* Rates & Trucks Required */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary w-20 shrink-0">Asking Rate:</span>
            <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              {quote.asking_rate}
            </span>
          </div>

          {isPendingQuote && quote.trucks_required && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              <TruckIcon className="w-3.5 h-3.5" />
              <span>{quote.trucks_required} Trucks Required</span>
            </div>
          )}

          {/* Proposed Rate (Quoted Section) */}
          {!isPendingQuote && quote.proposed_rate && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Proposed Rate:</span>
              <span className="text-xs sm:text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                {quote.proposed_rate}
              </span>
            </div>
          )}
        </div>

        {/* Trucks Sent (Quoted Section) */}
        {!isPendingQuote && quote.trucks_sent && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-text-secondary w-20 shrink-0 flex items-center gap-1">
              <TruckIcon className="w-3.5 h-3.5 text-text-secondary" />
              <span>Trucks:</span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-text-primary">{quote.trucks_sent}</span>
          </div>
        )}

        {/* Rejected Reason */}
        {isRejected && quote.rejected_reason && (
          <div className="flex flex-col gap-0.5 mt-1 p-2.5 bg-red-50 rounded-[12px] border border-red-100">
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide">Rejection Reason</span>
            <span className="text-xs font-medium text-red-800">{quote.rejected_reason}</span>
          </div>
        )}
      </div>

      {/* Action Row for Pending Quotes */}
      {isPendingQuote && onSubmitQuote && (
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => onSubmitQuote(quote)}
            className="px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            Submit Quote
          </button>
        </div>
      )}
    </div>
  );
}
