import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvePO, rejectPO } from '../services/poApi';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export function useApprovePO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: number | string) => approvePO(bookingId),
    onSuccess: (_data, bookingId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.poApprovalDetail(bookingId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.poApprovals });
    },
  });
}

export function useRejectPO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      rejectionReason,
    }: {
      bookingId: number | string;
      rejectionReason: string;
    }) => rejectPO(bookingId, rejectionReason),
    onSuccess: (_data, variables) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.poApprovalDetail(variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.poApprovals });
    },
  });
}
