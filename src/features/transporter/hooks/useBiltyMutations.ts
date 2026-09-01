import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitBilty } from '../services/transporterApi';
import type { SubmitBiltyPayload } from '../types';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export function useSubmitBilty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitBiltyPayload) => submitBilty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transporterLoadingTrucks });
    },
  });
}
