import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPendingPOApprovals } from '../services/poApi';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { PullToRefresh } from '../../../components/ui/PullToRefresh';
import type { VendorBookingItem } from '../types';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CalendarSmallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const DocumentEmptyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-600">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

function formatApprovalDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) {
      return dateStr.split(' ')[0];
    }
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr.split(' ')[0] || dateStr;
  }
}

function formatCreatedBy(createdBy?: unknown): string {
  if (!createdBy) return 'Purchase Dept';
  if (Array.isArray(createdBy) && createdBy.length > 1) {
    return String(createdBy[1]);
  }
  if (typeof createdBy === 'string') {
    return createdBy.trim() || 'Purchase Dept';
  }
  return String(createdBy);
}

export function POApprovalListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: pos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<VendorBookingItem[]>({
    queryKey: QUERY_KEYS.poApprovals,
    queryFn: getPendingPOApprovals,
  });

  const filteredPOs = pos.filter((po) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const createdBy = formatCreatedBy(po.created_by).toLowerCase();
    return (
      po.name.toLowerCase().includes(q) ||
      po.vendor_name.toLowerCase().includes(q) ||
      (po.vendor_address && po.vendor_address.toLowerCase().includes(q)) ||
      createdBy.includes(q)
    );
  });

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] dark:from-[#0B1120] dark:via-[#0E172A] dark:to-[#070B14] relative z-0 pb-32 transition-colors duration-200">
      {/* Sticky Header with Back Button & Page Title */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent dark:from-[#0B1120] dark:via-[#0B1120]/95 dark:to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              aria-label="Back to dashboard"
              className="w-10 h-10 bg-white dark:bg-surface rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-slate-900/5 dark:border-white/10 text-text-primary hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[22px] sm:text-[24px] font-bold text-text-primary tracking-tight">
                PO Approval
              </h1>
              {!isLoading && (
                <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 px-2.5 py-0.5 rounded-full">
                  {filteredPOs.length} Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar matching other list pages */}
        <div className="max-w-[1200px] mx-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-60 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search by PO number, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-10 bg-white dark:bg-surface text-text-primary rounded-[16px] border border-slate-900/5 dark:border-white/10 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] outline-none focus:border-primary transition-colors text-[15px] font-medium placeholder:text-text-secondary placeholder:font-normal"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1 text-xs font-bold cursor-pointer"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* List Content with PullToRefresh Gesture */}
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 flex flex-col gap-3.5">
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex flex-col gap-3.5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-3.5 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700/60 rounded-md" />
                    <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-white/5 -mx-1" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700/60 rounded-md" />
                  </div>
                  <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800 rounded-md" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <div className="bg-white dark:bg-surface rounded-[24px] p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-red-200 dark:border-red-900/40 text-center flex flex-col items-center justify-center gap-3 my-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                ✕
              </div>
              <h3 className="text-[17px] font-bold text-text-primary">Failed to load PO Approvals</h3>
              <p className="text-[13px] text-text-secondary max-w-xs">
                {(error as any)?.message || 'An error occurred while fetching pending approvals.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-full active:scale-95 transition-transform cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredPOs.length === 0 && (
            <div className="bg-white dark:bg-surface rounded-[24px] p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-slate-900/5 dark:border-white/10 text-center flex flex-col items-center justify-center gap-3 my-6">
              <DocumentEmptyIcon />
              <h3 className="text-[17px] font-bold text-text-primary">
                {searchQuery ? 'No matching POs found' : 'No pending approvals'}
              </h3>
              <p className="text-[13px] text-text-secondary max-w-xs">
                {searchQuery
                  ? `No purchase orders match "${searchQuery}". Try searching with another term.`
                  : 'All purchase orders have been processed and approved.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-1 text-xs font-semibold text-primary dark:text-blue-400 underline cursor-pointer"
                >
                  Clear search query
                </button>
              )}
            </div>
          )}

          {/* PO Cards List */}
          {!isLoading &&
            !isError &&
            filteredPOs.map((po) => {
              const displayDate = formatApprovalDate(po.requested_date || po.booking_date);
              const createdBy = formatCreatedBy(po.created_by);

              return (
                <div
                  key={po.id}
                  onClick={() => navigate(`/po/approval/${po.id}`)}
                  className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-3 transition-all hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.99] cursor-pointer group"
                >
                  {/* Top Row: PO number on top-left, approval created date on top-right */}
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <span className="text-[16px] font-bold text-text-primary tracking-tight truncate group-hover:text-primary transition-colors">
                      {po.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-text-secondary dark:text-slate-400 flex-shrink-0">
                      <CalendarSmallIcon />
                      <span>{displayDate}</span>
                    </div>
                  </div>

                  {/* Subtle Divider */}
                  <div className="h-px bg-slate-100 dark:bg-white/5 -mx-1" />

                  {/* Vendor Name & Amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/75 dark:text-slate-400/80">
                        Vendor
                      </span>
                      <span className="text-[15px] font-semibold text-text-primary leading-snug">
                        {po.vendor_name}
                      </span>
                    </div>
                    {typeof po.amount_total === 'number' && (
                      <div className="text-right flex-shrink-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/75 dark:text-slate-400/80 block">
                          Total
                        </span>
                        <span className="text-[14px] font-bold text-primary dark:text-blue-400">
                          ₹ {po.amount_total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vendor Full Address */}
                  {po.vendor_address && (
                    <p className="text-[12px] sm:text-[13px] text-text-secondary dark:text-slate-400 leading-relaxed -mt-1 break-words">
                      {po.vendor_address}
                    </p>
                  )}

                  {/* Created By */}
                  <div className="flex items-center gap-1.5 text-[13px] text-text-secondary dark:text-slate-400 pt-0.5">
                    <span className="font-normal">Created by -</span>
                    <span className="font-semibold text-text-primary">{createdBy}</span>
                  </div>
                </div>
              );
            })}
        </main>
      </PullToRefresh>
    </div>
  );
}
