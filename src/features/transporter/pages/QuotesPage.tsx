import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotes } from '../hooks/useQuotes';
import { QuoteCard } from '../components/QuoteCard';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export function QuotesPage() {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    pendingQuotes,
    alreadyQuotedQuotes,
    displayedList,
    refreshQuotes,
  } = useQuotes();

  const handleNavigateToSubmit = (quote: { id: string | number }) => {
    navigate(`/transporter/quotes/submit/${quote.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              aria-label="Back to dashboard"
              className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-none h-10 flex items-center">
                Quotes
              </h1>
            </div>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="max-w-[1200px] mx-auto mb-3">
          <div className="bg-white/80 p-1.5 rounded-[18px] border border-slate-900/5 shadow-[0_4px_16px_rgba(15,23,42,0.03)] grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`py-2.5 px-3 rounded-[14px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
              }`}
            >
              <span>Pending to Quote</span>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {pendingQuotes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quoted')}
              className={`py-2.5 px-3 rounded-[14px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'quoted'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
              }`}
            >
              <span>Already Quoted</span>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                activeTab === 'quoted' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {alreadyQuotedQuotes.length}
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-[1200px] mx-auto">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder={activeTab === 'pending' ? "Search by quote no, location, materials..." : "Search quoted requests, proposed rate, status..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-9 bg-white rounded-[14px] border border-slate-900/5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] outline-none focus:border-primary transition-all text-sm font-medium placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search text"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main List View */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-10 px-4 bg-white rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-red-100 flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button
              type="button"
              onClick={refreshQuotes}
              className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-full hover:bg-primary/90 transition-all"
            >
              Retry
            </button>
          </div>
        ) : displayedList.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <SearchIcon />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {searchQuery ? 'No Matching Quotes Found' : activeTab === 'pending' ? 'No Pending Requests' : 'No Quoted Requests'}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {searchQuery 
                  ? 'Try adjusting your search criteria.' 
                  : activeTab === 'pending'
                    ? 'All incoming quote requests have been processed.'
                    : 'You have not submitted any quotes yet.'}
              </p>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-primary/10 text-primary font-bold text-xs rounded-full hover:bg-primary/20 transition-all mt-1"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          displayedList.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onSubmitQuote={handleNavigateToSubmit}
            />
          ))
        )}
      </main>
    </div>
  );
}
