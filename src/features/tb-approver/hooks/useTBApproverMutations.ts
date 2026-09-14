import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveTBApproverTruck, rejectTBApproverTruck } from '../services/tbApproverApi';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { useToast } from '../../../app/providers/ToastProvider';
import { hapticFeedback } from '../../../utils/haptics';

export function useApproveTBApproverTruck(quotationId: number | string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (truckLineId: number | string) => approveTBApproverTruck(truckLineId),
    onSuccess: () => {
      hapticFeedback.success();
      success('Truck quotation approved for Team Approval.', 'Truck Approved');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tbApproverQuotationDetail(quotationId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tbApproverQuotations });
    },
    onError: (err: unknown) => {
      hapticFeedback.error();
      const message = err instanceof Error ? err.message : 'Failed to approve truck quotation.';
      error(message, 'Approval Failed');
    },
  });
}

export function useRejectTBApproverTruck(quotationId: number | string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      truckLineId,
      rejectionReason,
    }: {
      truckLineId: number | string;
      rejectionReason: string;
    }) => rejectTBApproverTruck(truckLineId, rejectionReason),
    onSuccess: () => {
      hapticFeedback.medium();
      success('Truck quotation rejected successfully.', 'Truck Rejected');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tbApproverQuotationDetail(quotationId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tbApproverQuotations });
    },
    onError: (err: unknown) => {
      hapticFeedback.error();
      const message = err instanceof Error ? err.message : 'Failed to reject truck quotation.';
      error(message, 'Rejection Failed');
    },
  });
}
