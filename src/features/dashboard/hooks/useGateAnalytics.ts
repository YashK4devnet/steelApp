import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { indexedDbService } from '../../../services/indexedDbService';
import type { GateActivityLog, GatePeriodStats } from '../../../services/indexedDbService';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export function useGateAnalytics(period: 'today' | 'week' = 'today') {
  return useQuery<GatePeriodStats>({
    queryKey: QUERY_KEYS.gateAnalytics(period),
    queryFn: () => {
      if (period === 'today') {
        return indexedDbService.getTodayStats();
      }
      return indexedDbService.getSevenDayStats();
    },
    staleTime: 60 * 1000,
    refetchOnMount: false,
  });
}


export function useRecordGateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: Omit<GateActivityLog, 'id' | 'timestamp' | 'dateString'>) => {
      return indexedDbService.recordGateLog(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateAnalytics'] });
    },
  });
}
