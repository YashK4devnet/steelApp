import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveBooking, updateBooking, cancelBooking } from '../services/bookingApi';
import type { SaveBookingPayload } from '../types';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export function useSaveBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id?: number | null; payload: SaveBookingPayload }) => {
      if (id) {
        return updateBooking(id, payload);
      }
      return saveBooking(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: number) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings });
    },
  });
}
