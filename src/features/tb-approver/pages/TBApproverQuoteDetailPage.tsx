import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTBApproverQuotationDetail } from '../services/tbApproverApi';
import { useApproveTBApproverTruck, useRejectTBApproverTruck } from '../hooks/useTBApproverMutations';
import { TBApproverTruckCard } from '../components/TBApproverTruckCard';
import { ApproveTruckModal, RejectTruckModal } from '../components/TBApproverActionModals';
import { PullToRefresh } from '../../../components/ui/PullToRefresh';
import { QueryErrorState } from '../../../components/ui/QueryErrorState';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { hapticFeedback } from '../../../utils/haptics';
import type { TBApproverTruckLine } from '../types';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
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

const CheckCircleIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

function DetailSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col gap-4 animate-pulse">
      <div className="bg-white dark:bg-surface rounded-[24px] p-5 border border-slate-900/5 dark:border-white/10 space-y-3">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-44" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-3/4" />
        <div className="h-16 bg-slate-100 dark:bg-slate-800/40 rounded-[16px]" />
      </div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36" />
      {[1, 2].map((n) => (
        <div key={n} className="bg-white dark:bg-surface rounded-[24px] p-5 border border-slate-900/5 dark:border-white/10 space-y-3">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-32" />
          <div className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-[16px]" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded-[14px]" />
        </div>
      ))}
    </div>
  );
}

export function TBApproverQuoteDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [selectedApproveTruck, setSelectedApproveTruck] = useState<TBApproverTruckLine | null>(null);
  const [selectedRejectTruck, setSelectedRejectTruck] = useState<TBApproverTruckLine | null>(null);

  const quotationId = id ? parseInt(id, 10) : 0;

  const {
    data: quotation,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.tbApproverQuotationDetail(quotationId),
    queryFn: () => getTBApproverQuotationDetail(quotationId),
    enabled: Boolean(quotationId),
  });

  const approveMutation = useApproveTBApproverTruck(quotationId);
  const rejectMutation = useRejectTBApproverTruck(quotationId);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tbApproverQuotationDetail(quotationId) });
  };

  const handleConfirmApprove = async () => {
    if (!selectedApproveTruck) return;
    try {
      await approveMutation.mutateAsync(selectedApproveTruck.id);
      setSelectedApproveTruck(null);
    } catch {
      // Handled by mutation hook error handler
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!selectedRejectTruck) return;
    try {
      await rejectMutation.mutateAsync({
        truckLineId: selectedRejectTruck.id,
        rejectionReason: reason,
      });
      setSelectedRejectTruck(null);
    } catch {
      // Handled by mutation hook error handler
    }
  };

  const truckLines = quotation?.truck_lines || [];
  const rateBaseLabel = quotation?.by_truck ? 'Truck' : 'Ton';
  const askingRate = quotation?.asking_rate || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] dark:from-[#0B1120] dark:via-[#0E172A] dark:to-[#070B14] relative z-0 pb-12 pb-[calc(env(safe-area-inset-bottom,1rem)+2rem)]">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent dark:from-[#0B1120] dark:via-[#0B1120]/95 dark:to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/tb-approver/quotes')}
              aria-label="Back to quote list"
              className="w-10 h-10 shrink-0 bg-white dark:bg-surface rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 dark:border-white/10 text-text-primary hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                Quotation Review
              </span>
              <h1 className="text-[20px] sm:text-[22px] font-bold text-text-primary tracking-tight leading-tight">
                {quotation?.booking_number || 'Loading...'}
              </h1>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Team Approval
          </span>
        </div>
      </div>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !quotation ? (
        <div className="max-w-[1200px] mx-auto px-4 pt-6">
          <QueryErrorState
            title="Failed to Load Quotation"
            message={error instanceof Error ? error.message : 'Unable to retrieve quotation details.'}
            onRetry={handleRefresh}
          />
        </div>
      ) : (
        <PullToRefresh onRefresh={handleRefresh}>
          <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 flex flex-col gap-5">
            {/* Booking & Transporter Overview Card */}
            <div className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-4">
              {/* Transporter */}
              <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-[18px] bg-slate-50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <BuildingIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">
                      Quoting Transporter
                    </span>
                    <p className="text-sm font-bold text-text-primary">
                      {quotation.transporter_name || 'Assigned Transporter'}
                    </p>
                    {quotation.transporter_phone && (
                      <p className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 mt-0.5">
                        <PhoneIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{quotation.transporter_phone}</span>
                      </p>
                    )}
                    {quotation.transporter_address && (
                      <p className="text-[11px] text-text-secondary break-words leading-relaxed mt-0.5">
                        {quotation.transporter_address}
                      </p>
                    )}
                  </div>
                </div>

                {quotation.transporter_phone && (
                  <a
                    href={`tel:${quotation.transporter_phone}`}
                    onClick={() => hapticFeedback.light()}
                    aria-label={`Call transporter at ${quotation.transporter_phone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 transition-all shrink-0 cursor-pointer shadow-sm"
                    title={`Call ${quotation.transporter_phone}`}
                  >
                    <PhoneIcon className="w-3.5 h-3.5" />
                    <span>Call<span className="hidden sm:inline"> Transporter</span></span>
                  </a>
                )}
              </div>

              {/* Route */}
              <div className="flex flex-col gap-2 p-3.5 rounded-[18px] bg-gradient-to-br from-slate-50/80 to-slate-100/40 dark:from-slate-800/40 dark:to-slate-800/20 border border-slate-900/5 dark:border-white/5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 text-primary dark:text-blue-400 shrink-0">
                    <LocationPinIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">Pickup:</span>
                      <span className="text-xs font-bold text-text-primary">{quotation.pickup_location_code}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary break-words leading-relaxed mt-0.5">{quotation.pickup_location_name}</p>
                  </div>
                </div>

                <div className="ml-1.5 pl-2.5 border-l-2 border-dashed border-slate-200 dark:border-slate-700 h-2" />

                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 text-accent shrink-0">
                    <LocationPinIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">Delivery:</span>
                      <span className="text-xs font-bold text-text-primary">{quotation.delivery_address_code}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary break-words leading-relaxed mt-0.5">{quotation.delivery_address_name}</p>
                  </div>
                </div>
              </div>

              {/* Terms & Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Asking Rate
                  </span>
                  <p className="text-[16px] font-extrabold text-primary dark:text-blue-400 mt-0.5">
                    ₹{askingRate.toLocaleString('en-IN')}{' '}
                    <span className="text-[11px] font-semibold text-text-secondary">/{rateBaseLabel}</span>
                  </p>
                </div>

                <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Truck Progress
                  </span>
                  <p className="text-[16px] font-extrabold text-text-primary mt-0.5">
                    {quotation.proposed_truck_count || 0} / {quotation.requested_truck_count || 0}{' '}
                    <span className="text-[11px] font-semibold text-text-secondary">Proposed</span>
                  </p>
                </div>

                <div className="p-3 rounded-[16px] bg-slate-50 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Requested Truck Type
                  </span>
                  <p className="text-[14px] font-bold text-text-primary mt-0.5 break-words">
                    {quotation.requested_truck_type || 'Standard'}
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Truck Proposals Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between px-1">
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    Truck Quotations ({truckLines.length})
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Review and approve or reject each truck individually
                  </p>
                </div>
              </div>

              {truckLines.length === 0 ? (
                <div className="text-center py-12 px-6 bg-white dark:bg-surface rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">
                      All Trucks Processed
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 max-w-xs">
                      No truck proposals are currently waiting for Team Approval for this quotation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/tb-approver/quotes')}
                    className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-full hover:bg-primary-hover shadow-sm transition-all mt-2 cursor-pointer"
                  >
                    Back to Quotations List
                  </button>
                </div>
              ) : (
                truckLines.map((truckLine, idx) => (
                  <TBApproverTruckCard
                    key={truckLine.id}
                    truckLine={truckLine}
                    index={idx}
                    askingRate={askingRate}
                    rateBaseLabel={rateBaseLabel}
                    defaultRequestedTruckType={quotation.requested_truck_type}
                    onApprove={(tl) => setSelectedApproveTruck(tl)}
                    onReject={(tl) => setSelectedRejectTruck(tl)}
                    isActionLoading={approveMutation.isPending || rejectMutation.isPending}
                  />
                ))
              )}
            </div>
          </main>
        </PullToRefresh>
      )}

      {/* Approve Confirmation Modal */}
      <ApproveTruckModal
        isOpen={Boolean(selectedApproveTruck)}
        onClose={() => setSelectedApproveTruck(null)}
        onConfirm={handleConfirmApprove}
        isLoading={approveMutation.isPending}
        truckLine={selectedApproveTruck}
        rateBaseLabel={rateBaseLabel}
        defaultRequestedTruckType={quotation?.requested_truck_type}
        askingRate={askingRate}
      />

      {/* Reject Confirmation Modal with Reason Input */}
      <RejectTruckModal
        isOpen={Boolean(selectedRejectTruck)}
        onClose={() => setSelectedRejectTruck(null)}
        onConfirm={handleConfirmReject}
        isLoading={rejectMutation.isPending}
        truckLine={selectedRejectTruck}
        rateBaseLabel={rateBaseLabel}
        defaultRequestedTruckType={quotation?.requested_truck_type}
      />
    </div>
  );
}
