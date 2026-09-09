import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPOApprovalDetail, getPOApprovalPDF } from '../services/poApi';
import { useApprovePO, useRejectPO } from '../hooks/usePOMutations';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { downloadPdfFile } from '../../../utils/fileDownloader';
import { useToast } from '../../../app/providers/ToastProvider';
import { PullToRefresh } from '../../../components/ui/PullToRefresh';
import type { VendorBookingDetail, VendorBookingProductLine } from '../types';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckCircleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const XCircleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const PackageIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const DownloadIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const NoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

function formatDetailDate(dateStr?: string): string {
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

export function POApprovalDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: po,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<VendorBookingDetail>({
    queryKey: QUERY_KEYS.poApprovalDetail(id || ''),
    queryFn: () => getPOApprovalDetail(id!),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const approveMutation = useApprovePO();
  const rejectMutation = useRejectPO();

  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync(id);
      setShowApproveModal(false);
      toast.success(`Purchase Order ${po?.name || id} approved successfully.`);
      navigate('/po/approval', { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve purchase order.');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectReason.trim()) {
      toast.warning('Please provide a reason for rejection.', 'Rejection Reason Required');
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        bookingId: id,
        rejectionReason: rejectReason.trim(),
      });
      setShowRejectModal(false);
      toast.success(`Purchase Order ${po?.name || id} rejected.`);
      navigate('/po/approval', { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject purchase order.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!id || !po) return;
    setIsDownloading(true);
    toast.info(`Downloading PDF for ${po.name}...`, 'Preparing PDF');
    try {
      const pdfRes = await getPOApprovalPDF(id);

      if (!pdfRes || !pdfRes.pdf || !pdfRes.pdf.trim()) {
        toast.warning(
          'The PDF document is currently unavailable for this booking on the server.',
          'PDF Unavailable'
        );
        return;
      }

      const filename = pdfRes.filename || `PO-${po.name.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;
      const result = await downloadPdfFile({
        base64Data: pdfRes.pdf,
        filename,
        mimeType: pdfRes.mimetype || 'application/pdf',
      });

      const folderName = result.location === 'downloads' ? 'Downloads' : 'Documents';
      if (result.opened) {
        toast.success(
          `PDF saved to ${folderName} and opened: ${result.filename}`,
          'PDF Downloaded'
        );
      } else {
        toast.success(
          `PDF saved to ${folderName}: ${result.filename}`,
          'Download Complete'
        );
      }
    } catch (err: any) {
      toast.warning(
        err?.message || 'The PDF document is currently unavailable for this booking on the server.',
        'PDF Unavailable'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] dark:from-[#0B1120] dark:via-[#0E172A] dark:to-[#070B14] p-6 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-[14px] font-semibold text-text-secondary animate-pulse">
          Loading purchase order details...
        </p>
      </div>
    );
  }

  // Error State
  if (isError || !po) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] dark:from-[#0B1120] dark:via-[#0E172A] dark:to-[#070B14] p-6 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-lg font-bold">
          ✕
        </div>
        <h2 className="text-[20px] font-bold text-text-primary">Purchase Order Not Found</h2>
        <p className="text-[14px] text-text-secondary max-w-sm">
          {(error as any)?.message || 'The requested purchase order does not exist or has already been reviewed.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-text-primary font-semibold rounded-full active:scale-95 transition-transform cursor-pointer"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/po/approval', { replace: true })}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-full active:scale-95 transition-transform cursor-pointer"
          >
            Return to List
          </button>
        </div>
      </div>
    );
  }

  const lines = po.lines || [];
  const productCount = lines.filter((l) => l.display_type === false).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] dark:from-[#0B1120] dark:via-[#0E172A] dark:to-[#070B14] relative z-0 pb-36 transition-colors duration-200">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent dark:from-[#0B1120] dark:via-[#0B1120]/95 dark:to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/po/approval', { replace: true })}
              aria-label="Back to PO List"
              className="w-10 h-10 bg-white dark:bg-surface rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-slate-900/5 dark:border-white/10 text-text-primary hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer flex-shrink-0"
            >
              <ArrowLeftIcon />
            </button>
            <div className="min-w-0">
              <h1 className="text-[20px] sm:text-[22px] font-bold text-text-primary tracking-tight truncate">
                PO Details
              </h1>
              <p className="text-[12px] font-semibold text-text-secondary dark:text-slate-400 truncate">
                {po.name}
              </p>
            </div>
          </div>

          {/* Right Action: Download PDF button & Status Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="h-10 px-3.5 rounded-full bg-white dark:bg-surface text-primary dark:text-blue-400 border border-slate-900/10 dark:border-white/10 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center gap-1.5 font-bold text-[13px] hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              title="Download PO PDF"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <DownloadIcon className="w-4 h-4" />
              )}
              <span className="inline">PDF</span>
            </button>

            <span className="text-[12px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 px-3 py-2 rounded-full hidden sm:inline-flex items-center">
              Pending Approval
            </span>
          </div>
        </div>
      </div>

      {/* Main Detail Content Container with PullToRefresh Gesture */}
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 flex flex-col gap-4">
        {/* Section 1: Top PO Header Card */}
        <div className="bg-white dark:bg-surface rounded-[24px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-4 transition-colors">
          {/* Top Row: PO Number & Approval Requested Date */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/75 dark:text-slate-400/80">
                Purchase Order
              </span>
              <h2 className="text-[18px] sm:text-[20px] font-extrabold text-text-primary tracking-tight">
                {po.name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-100 dark:border-white/5">
              <CalendarIcon />
              <span>{formatDetailDate(po.requested_date || po.booking_date)}</span>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 -mx-1" />

          {/* Vendor Details */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/75 dark:text-slate-400/80">
              Vendor
            </span>
            <span className="text-[16px] font-bold text-text-primary">
              {po.vendor_name}
            </span>
            {po.vendor_address && (
              <p className="text-[13px] text-text-secondary dark:text-slate-400 leading-relaxed">
                {po.vendor_address}
              </p>
            )}
          </div>

          {/* Created By & Remark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/75 dark:text-slate-400/80">
                Created by
              </span>
              <span className="text-[14px] font-semibold text-text-primary">
                {formatCreatedBy(po.created_by)}
              </span>
            </div>

            {po.remark && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/75 dark:text-slate-400/80">
                  Remark
                </span>
                <span className="text-[14px] font-semibold text-text-primary">
                  {po.remark}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Products Header */}
        <div className="flex items-center justify-between px-1 pt-2">
          <div className="flex items-center gap-2">
            <PackageIcon className="w-5 h-5 text-primary dark:text-blue-400" />
            <h3 className="text-[16px] font-bold text-text-primary tracking-tight">
              Product Details ({productCount})
            </h3>
          </div>
          {typeof po.total_qty === 'number' && (
            <span className="text-[12px] font-semibold text-text-secondary dark:text-slate-400">
              Total Qty: {po.total_qty}
            </span>
          )}
        </div>

        {/* Product Lines & Note Lines */}
        <div className="flex flex-col gap-3.5">
          {lines.length === 0 ? (
            <div className="bg-white dark:bg-surface rounded-[24px] p-6 text-center text-text-secondary text-sm border border-slate-900/5 dark:border-white/10">
              No line items recorded for this purchase order.
            </div>
          ) : (() => {
            let productCounter = 0;
            return lines.map((line, idx) => {
              // Render Note Line (shown in the exact sequence received from server)
              const isNote = line.display_type === 'line_note' || Boolean((line as any).display_type);

              if (isNote) {
                const noteText = (line as any).name || (line as any).description || (line as any).note || '';
                return (
                  <div
                    key={line.id || `note-${idx}`}
                    className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 rounded-[20px] p-4 flex items-start gap-3 shadow-sm"
                  >
                    <div className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
                      <NoteIcon />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700/80 dark:text-amber-400/80">
                        Notes
                      </span>
                      <p className="text-[13px] font-medium text-text-primary leading-relaxed whitespace-pre-wrap break-words">
                        {noteText}
                      </p>
                    </div>
                  </div>
                );
              }

              // Render Product Line
              productCounter += 1;
              const productNumber = productCounter;
              const product = line as VendorBookingProductLine;

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-3.5 transition-colors"
                >
                  {/* Product Header: Counter, Material Type & Line Amount Without Tax */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-blue-400 text-[11px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {productNumber}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/75 dark:text-slate-400/80">
                          Material Type
                        </span>
                        <h4 className="text-[15px] sm:text-[16px] font-bold text-text-primary tracking-tight leading-snug">
                          {product.material_type || 'General Material'}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/75 dark:text-slate-400/80 block">
                        Amount Without Tax
                      </span>
                      <span className="text-[16px] font-extrabold text-primary dark:text-blue-400 tracking-tight">
                        ₹ {product.amount?.toLocaleString('en-IN') ?? '0'}
                      </span>
                    </div>
                  </div>

                  {/* Product Description */}
                  {product.description && (
                    <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-[14px] p-3 border border-slate-100 dark:border-white/5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/75 dark:text-slate-400/80 block mb-0.5">
                        Description
                      </span>
                      <p className="text-[13px] text-text-primary leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Spec Details Grid: Booked Qty, UoM, Unit Price, Taxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {/* Booked Qty */}
                    <div className="p-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 flex flex-col">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">
                        Booked Qty
                      </span>
                      <span className="text-[14px] font-bold text-text-primary mt-0.5">
                        {product.booked_quantity} {product.uom}
                      </span>
                    </div>

                    {/* UoM */}
                    <div className="p-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 flex flex-col">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">
                        UoM
                      </span>
                      <span className="text-[14px] font-bold text-text-primary mt-0.5">
                        {product.uom || 'N/A'}
                      </span>
                    </div>

                    {/* Unit Price */}
                    <div className="p-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 flex flex-col">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">
                        Unit Price
                      </span>
                      <span className="text-[14px] font-bold text-text-primary mt-0.5">
                        ₹ {product.unit_price?.toLocaleString('en-IN') ?? '0'}
                      </span>
                    </div>

                    {/* Taxes */}
                    <div className="p-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 flex flex-col">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">
                        Taxes
                      </span>
                      <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                        {product.tax || 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Section 3: Order Financial Summary Card */}
        <div className="bg-white dark:bg-surface rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-3 transition-colors mt-1">
          <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">
            Total Valuation
          </span>

          <div className="flex items-center justify-between text-[14px]">
            <span className="text-text-secondary dark:text-slate-400">Amount Without Tax</span>
            <span className="font-semibold text-text-primary">
              ₹ {po.amount_untaxed?.toLocaleString('en-IN') ?? '0'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[14px]">
            <span className="text-text-secondary dark:text-slate-400">Applicable Taxes</span>
            <span className="font-semibold text-text-primary">
              ₹ {po.amount_tax?.toLocaleString('en-IN') ?? '0'}
            </span>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 -mx-1" />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[16px] font-bold text-text-primary">Grand Total</span>
            <span className="text-[20px] font-extrabold text-primary dark:text-blue-400">
              ₹ {po.amount_total?.toLocaleString('en-IN') ?? '0'}
            </span>
          </div>
        </div>
      </main>
      </PullToRefresh>

      {/* Sticky Bottom Action Bar (Fixed to Viewport, Never Scrolls) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-surface/95 backdrop-blur-md border-t border-slate-900/10 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 pb-[calc(env(safe-area-inset-bottom,0.75rem)+0.75rem)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3">
          {/* Reject Button */}
          <button
            type="button"
            onClick={() => setShowRejectModal(true)}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-[16px] border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-[15px] hover:bg-red-100 dark:hover:bg-red-900/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircleIcon className="w-5 h-5" />
            <span>Reject</span>
          </button>

          {/* Approve Button */}
          <button
            type="button"
            onClick={() => setShowApproveModal(true)}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-[16px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>Approve</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Approve */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-surface rounded-[24px] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-text-primary">
                Approve Purchase Order?
              </h3>
              <p className="text-[13px] text-text-secondary dark:text-slate-400 mt-1">
                Are you sure you want to approve <span className="font-bold text-text-primary">{po.name}</span> for {po.vendor_name}?
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="flex-1 h-11 rounded-[14px] border border-slate-200 dark:border-white/10 text-text-secondary font-semibold text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Approving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reject */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-surface rounded-[24px] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <XCircleIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-text-primary">
                Reject Purchase Order?
              </h3>
              <p className="text-[13px] text-text-secondary dark:text-slate-400 mt-1">
                Please provide a rejection reason for <span className="font-bold text-text-primary">{po.name}</span>.
              </p>
            </div>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full p-3 text-[13px] bg-slate-50 dark:bg-slate-800/80 rounded-[14px] border border-slate-200 dark:border-white/10 text-text-primary outline-none focus:border-red-500 placeholder:text-text-secondary"
            />
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="flex-1 h-11 rounded-[14px] border border-slate-200 dark:border-white/10 text-text-secondary font-semibold text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-[14px] bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Reject PO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
