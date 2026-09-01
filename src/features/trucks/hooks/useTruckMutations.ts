import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitVendorBill, reportTruckArrival, reportOutgoingTruckArrival } from '../services/truckApi';
import type { SubmitVendorBillPayload } from '../types';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export function useSubmitVendorBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitVendorBillPayload) => submitVendorBill(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loadingTrucks });
    },
  });
}

export function useReportTruckArrival() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      truck_line_id: number;
      reporting_datetime: string;
      note?: string;
      image_1: string;
      image_2?: string;
      image_3?: string;
    }) => reportTruckArrival(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loadedTrucks });
    },
  });
}

export function useReportOutgoingTruckArrival() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      truck_id: number;
      reporting_datetime: string;
      note?: string;
      image_1: string;
      image_2?: string;
      image_3?: string;
    }) => reportOutgoingTruckArrival(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.outgoingTrucks });
    },
  });
}
