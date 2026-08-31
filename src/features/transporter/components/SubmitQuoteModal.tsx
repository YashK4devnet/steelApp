import React from 'react';
import type { QuoteItem } from '../types';

interface SubmitQuoteModalProps {
  quote: QuoteItem | null;
  proposedRateInput: string;
  setProposedRateInput: (val: string) => void;
  trucksInput: string;
  setTrucksInput: (val: string) => void;
  isSubmittingQuote: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SubmitQuoteModal({
  quote,
  proposedRateInput,
  setProposedRateInput,
  trucksInput,
  setTrucksInput,
  isSubmittingQuote,
  onClose,
  onSubmit,
}: SubmitQuoteModalProps) {
  if (!quote) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-slate-900/5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Submit Rate Quote</h3>
            <p className="text-xs font-semibold text-text-secondary mt-0.5">{quote.quote_no}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-1">
          <div className="bg-slate-50 p-3 rounded-[14px] border border-slate-100 flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary font-medium">Route:</span>
              <span className="font-semibold text-text-primary truncate max-w-[180px]">{quote.from_location} → {quote.to_location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary font-medium">Materials:</span>
              <span className="font-semibold text-text-primary truncate max-w-[180px]">{quote.materials_requested}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary font-medium">Asking Rate:</span>
              <span className="font-bold text-primary">{quote.asking_rate}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-text-primary">
              Proposed Rate (₹ / Ton) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2400"
              value={proposedRateInput}
              onChange={(e) => setProposedRateInput(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-[12px] outline-none focus:border-primary focus:bg-white text-sm font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-text-primary">
              Trucks Allocated / Vehicle Info
            </label>
            <input
              type="text"
              placeholder="e.g. 1 Truck (AS-01-EA-1234)"
              value={trucksInput}
              onChange={(e) => setTrucksInput(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-[12px] outline-none focus:border-primary focus:bg-white text-sm font-semibold"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuote || !proposedRateInput.trim()}
              className="px-5 py-2.5 rounded-full bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmittingQuote ? 'Submitting...' : 'Confirm Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
