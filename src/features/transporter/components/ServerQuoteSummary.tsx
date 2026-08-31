import React from 'react';
import type { QuoteItem } from '../types';

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

interface ServerQuoteSummaryProps {
  quote: QuoteItem;
}

export function ServerQuoteSummary({ quote }: ServerQuoteSummaryProps) {
  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-4">
      {/* 1. Top Bar: Quote Number & Date */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Quote Number</span>
          <span className="text-[15px] font-extrabold text-text-primary tracking-tight">{quote.quote_no}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Request Date</span>
          <span className="text-[13px] font-bold text-text-primary">{quote.created_date}</span>
        </div>
      </div>

      {/* 2. Route Heading (From -> To with Arrow, prominent & large) */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/70 p-4 rounded-[18px] border border-slate-200/60 flex flex-col gap-2">
        <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider">Route Destination</span>
        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2.5 sm:gap-3">
          <div className="flex-1">
            <span className="text-[11px] font-semibold text-text-secondary block mb-0.5">Origin (From)</span>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-primary leading-snug">
              {quote.from_location}
            </h2>
          </div>
          <div className="hidden sm:flex items-center justify-center p-2 rounded-full bg-white shadow-sm border border-slate-200">
            <ArrowRightIcon />
          </div>
          <div className="flex sm:hidden items-center gap-1.5 text-primary font-bold text-xs my-0.5">
            <ArrowRightIcon />
            <span>Going to</span>
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-semibold text-text-secondary block mb-0.5">Destination (Where To)</span>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-primary leading-snug">
              {quote.to_location}
            </h2>
          </div>
        </div>
      </div>

      {/* 3. Materials Requested */}
      <div className="flex flex-col gap-1 bg-slate-50/70 p-3.5 rounded-[16px] border border-slate-100">
        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Materials Requested</span>
        <p className="text-[14px] font-bold text-text-primary">{quote.materials_requested}</p>
      </div>

      {/* 4. Asking Rate & 5. Trucks Required Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50/70 p-3.5 rounded-[16px] border border-slate-100 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Asking Rate</span>
          <span className="text-[16px] font-extrabold text-primary">{quote.asking_rate}</span>
        </div>

        <div className="bg-slate-50/70 p-3.5 rounded-[16px] border border-slate-100 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
            <TruckIcon />
            <span>Trucks Required</span>
          </span>
          <span className="text-[16px] font-extrabold text-text-primary">{quote.trucks_required} Trucks</span>
        </div>
      </div>
    </div>
  );
}
