import React, { useState, useEffect } from 'react';
import type { TBApproverTruckLine } from '../types';

const CheckCircleIcon = ({ className = 'w-7 h-7' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const XCircleIcon = ({ className = 'w-7 h-7' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

interface ApproveTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  truckLine: TBApproverTruckLine | null;
  rateBaseLabel?: string;
  defaultRequestedTruckType?: string;
}

export function ApproveTruckModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  truckLine,
  rateBaseLabel = 'Truck',
  defaultRequestedTruckType,
}: ApproveTruckModalProps) {
  if (!isOpen || !truckLine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-surface rounded-[24px] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircleIcon />
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-text-primary">
            Approve Truck Proposal?
          </h3>
          <p className="text-[13px] text-text-secondary mt-1.5 leading-relaxed">
            Approve proposed rate of{' '}
            <span className="font-extrabold text-primary dark:text-blue-400">
              ₹{truckLine.proposal_rate.toLocaleString('en-IN')} / {rateBaseLabel}
            </span>{' '}
            for <span className="font-bold text-text-primary">{truckLine.proposed_truck_type || 'Truck'}</span>?
          </p>
          <div className="mt-3 p-2.5 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 text-[11px] text-text-secondary text-left flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Truck Line ID:</span>
              <span className="font-bold text-text-primary">#{truckLine.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Requested Type:</span>
              <span className="font-bold text-text-primary">
                {truckLine.requested_truck_type_name || defaultRequestedTruckType || 'Standard'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Proposed Type:</span>
              <span className="font-bold text-text-primary">{truckLine.proposed_truck_type || 'Standard'}</span>
            </div>
            <div className="flex justify-between">
              <span>Capacity:</span>
              <span className="font-bold text-text-primary">{truckLine.truck_capacity} Tons</span>
            </div>
            {truckLine.truck_number && (
              <div className="flex justify-between">
                <span>Vehicle Plate:</span>
                <span className="font-bold text-text-primary">{truckLine.truck_number}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11 rounded-[14px] border border-slate-200 dark:border-white/10 text-text-secondary font-semibold text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-11 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Confirm Approval'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface RejectTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
  truckLine: TBApproverTruckLine | null;
  rateBaseLabel?: string;
  defaultRequestedTruckType?: string;
}

export function RejectTruckModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  truckLine,
  defaultRequestedTruckType,
}: RejectTruckModalProps) {
  const [reason, setReason] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setHasAttemptedSubmit(false);
    }
  }, [isOpen]);

  if (!isOpen || !truckLine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  const isInvalid = hasAttemptedSubmit && !reason.trim();
  const requestedTypeName = truckLine.requested_truck_type_name || defaultRequestedTruckType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-surface rounded-[24px] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-900/5 dark:border-white/10 flex flex-col gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-sm">
          <XCircleIcon />
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-text-primary">
            Reject Truck Quotation?
          </h3>
          <p className="text-[13px] text-text-secondary mt-1.5 leading-relaxed">
            Please provide a rejection reason for{' '}
            <span className="font-bold text-text-primary">Truck #{truckLine.id}</span> ({truckLine.proposed_truck_type || 'Truck'})
            {requestedTypeName ? ` [Requested: ${requestedTypeName}]` : ''}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
          <div>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Rate is higher than budget, truck type mismatch..."
              className={`w-full p-3.5 text-[13px] bg-slate-50 dark:bg-slate-800/80 rounded-[16px] border text-text-primary outline-none transition-colors placeholder:text-slate-400 ${
                isInvalid
                  ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                  : 'border-slate-200 dark:border-white/10 focus:border-primary dark:focus:border-blue-400'
              }`}
              autoFocus
            />
            {isInvalid && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 pl-1">
                Rejection reason is required by the backend API.
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-[14px] border border-slate-200 dark:border-white/10 text-text-secondary font-semibold text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex-1 h-11 rounded-[14px] bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Reject Truck'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
