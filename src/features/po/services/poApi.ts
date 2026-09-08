import { apiRequest } from '../../../lib/api';
import type {
  POApprovalListResponse,
  POApprovalDetailResponse,
  POApprovalPDFResponse,
  POActionResponse,
  VendorBookingItem,
  VendorBookingDetail,
} from '../types';

/**
 * Fetch all vendor bookings waiting for PO approval.
 * Requires Bearer token from user with "PO Approver" role.
 */
export async function getPendingPOApprovals(): Promise<VendorBookingItem[]> {
  const response = await apiRequest<POApprovalListResponse>(
    'GET',
    '/booking/po-approver/bookings'
  );
  return response.bookings || [];
}

/**
 * Fetch details for a single vendor booking including product lines,
 * note lines, financial totals, and vendor information.
 */
export async function getPOApprovalDetail(bookingId: number | string): Promise<VendorBookingDetail> {
  const response = await apiRequest<POApprovalDetailResponse>(
    'GET',
    `/booking/po-approver/bookings/${bookingId}`
  );
  return response.booking;
}

/**
 * Download the existing Vendor Booking PDF report.
 * Returns Base64-encoded PDF content.
 */
export async function getPOApprovalPDF(bookingId: number | string): Promise<POApprovalPDFResponse> {
  return await apiRequest<POApprovalPDFResponse>(
    'GET',
    `/booking/po-approver/bookings/${bookingId}/pdf`
  );
}

/**
 * Approve a vendor booking waiting for approval.
 */
export async function approvePO(bookingId: number | string): Promise<POActionResponse> {
  return await apiRequest<POActionResponse>(
    'POST',
    `/booking/po-approver/bookings/${bookingId}/approve`,
    {},
    {},
    {
      successMessage: 'Purchase Order approved successfully.',
    }
  );
}

/**
 * Reject a vendor booking waiting for approval with a required reason.
 */
export async function rejectPO(
  bookingId: number | string,
  rejectionReason: string
): Promise<POActionResponse> {
  return await apiRequest<POActionResponse>(
    'POST',
    `/booking/po-approver/bookings/${bookingId}/reject`,
    { rejection_reason: rejectionReason },
    {},
    {
      successMessage: 'Purchase Order rejected.',
    }
  );
}
