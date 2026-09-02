import React from 'react';
import { useSubmitQuote } from '../hooks/useSubmitQuote';
import { ServerQuoteSummary } from '../components/ServerQuoteSummary';
import { TruckDetailFormCard } from '../components/TruckDetailFormCard';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export function SubmitQuotePage() {
  const {
    quote,
    truckTypes,
    loading,
    error,
    availableTrucks,
    handleAvailableTrucksChange,
    availableTrucksWarning,
    truckDetails,
    handleUpdateTruck,
    isValid,
    submitting,
    submitError,
    handleSubmit,
    navigateBack,
  } = useSubmitQuote();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] flex items-center justify-center p-4">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] p-6 flex flex-col items-center justify-center gap-4 text-center">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-red-100 max-w-sm w-full">
          <p className="text-sm font-bold text-red-600 mb-4">{error || 'Quote not found'}</p>
          <button
            type="button"
            onClick={navigateBack}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all"
          >
            Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-40">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={navigateBack}
              aria-label="Back to quotes"
              className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[22px] sm:text-[24px] font-bold text-text-primary tracking-tight leading-none h-10 flex items-center">
                Submit Quote
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Form */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 flex flex-col gap-5">
        {/* 1. Server-Sent Read-Only Summary */}
        <ServerQuoteSummary quote={quote} />

        {/* 2. Transporter Proposal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Section: Available Trucks Input */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-text-primary text-[16px] leading-tight">
                  Available Trucks
                </h3>
                <p className="text-xs font-medium text-text-secondary mt-0.5">
                  How many trucks can you allocate for this shipment?
                </p>
              </div>
              <span className="text-[11px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shrink-0 whitespace-nowrap">
                Max: {quote.trucks_required}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <input
                type="number"
                value={availableTrucks}
                onChange={(e) => handleAvailableTrucksChange(e.target.value)}
                placeholder={`Enter available trucks (Max: ${quote.trucks_required})`}
                className={`w-full h-12 px-4 bg-slate-50 border rounded-[14px] outline-none text-base font-bold text-text-primary transition-all ${
                  availableTrucksWarning
                    ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:border-primary focus:bg-white'
                }`}
              />
            </div>

            {/* Validation Warning Message */}
            {availableTrucksWarning && (
              <div className="p-3 bg-red-50 rounded-[12px] border border-red-100 flex items-start gap-2 animate-fade-in">
                <span className="text-red-500 font-bold text-sm leading-none">⚠️</span>
                <span className="text-xs font-semibold text-red-700 leading-tight">
                  {availableTrucksWarning}
                </span>
              </div>
            )}
          </div>

          {/* Section: Individual Truck Specification & Rate Cards */}
          {truckDetails.length > 0 && (
            <div className="flex flex-col gap-3.5 animate-fade-in">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-text-primary text-[15px] tracking-tight">
                  Truck Details & Proposed Rates ({truckDetails.length})
                </h3>
                <span className="text-[11px] font-semibold text-text-secondary">
                  Specify vehicle type, capacity, pricing base & rate
                </span>
              </div>

              {truckDetails.map((truck, idx) => (
                <TruckDetailFormCard
                  key={truck.id || idx}
                  index={idx}
                  truck={truck}
                  truckTypes={truckTypes}
                  onUpdate={handleUpdateTruck}
                />
              ))}
            </div>
          )}

          {submitError && (
            <div className="p-3 bg-red-50 rounded-[14px] border border-red-200 text-xs font-bold text-red-600 text-center">
              {submitError}
            </div>
          )}
        </form>
      </main>

      {/* Sticky Bottom Full-Width Submit Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-900/10 px-4 sm:px-6 lg:px-8 py-3.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`w-full h-12 rounded-[16px] text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${
              isValid && !submitting
                ? 'bg-primary hover:bg-primary/90 shadow-primary/20 cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
            }`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting Quote Proposal...</span>
              </>
            ) : (
              <span>Submit Quote Proposal</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
