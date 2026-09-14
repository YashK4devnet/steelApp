import { apiRequest } from '../../../lib/api';
import type {
  TBApproverQuotationsResponse,
  TBApproverQuotation,
  TBApproverQuotationDetailResponse,
  TBApproverQuotationDetail,
} from '../types';

/**
 * Fetch Transport Booking quotations currently having truck lines waiting for Team Approval.
 * Requires Bearer token from user with "TB Approver" role.
 */
export async function getTBApproverQuotations(): Promise<TBApproverQuotation[]> {
  const response = await apiRequest<TBApproverQuotationsResponse>(
    'GET',
    '/booking/tb-approver/quotations'
  );
  return response.quotations || [];
}

/**
 * Fetch details for a single quotation including all truck lines waiting for Team Approval.
 */
export async function getTBApproverQuotationDetail(
  quotationId: number | string
): Promise<TBApproverQuotationDetail> {
  const response = await apiRequest<TBApproverQuotationDetailResponse>(
    'GET',
    `/booking/tb-approver/quotations/${quotationId}`
  );
  return response.quotation;
}

/**
 * Team Approve one individual truck quotation.
 */
export async function approveTBApproverTruck(truckLineId: number | string) {
  return await apiRequest(
    'POST',
    `/booking/tb-approver/trucks/${truckLineId}/approve`,
    {},
    {},
    {
      successMessage: 'Truck quotation approved successfully.',
    }
  );
}

/**
 * Team Reject one individual truck quotation.
 */
export async function rejectTBApproverTruck(
  truckLineId: number | string,
  rejectionReason: string
) {
  return await apiRequest(
    'POST',
    `/booking/tb-approver/trucks/${truckLineId}/reject`,
    { rejection_reason: rejectionReason },
    {},
    {
      successMessage: 'Truck quotation rejected.',
    }
  );
}
