import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Booking } from '../types';
import { getBookings } from '../services/bookingApi';
import { useCancelBooking } from './useBookingMutations';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { dispatchGlobalToast } from '../../../app/providers/ToastProvider';

export function useBookings() {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Loaded' | 'Cancelled'>('All');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  const {
    data: bookings = [],
    isLoading: loading,
    isError,
    error,
    isFetching,
    refetch: refreshBookings,
  } = useQuery({
    queryKey: QUERY_KEYS.bookings,
    queryFn: getBookings,
  });

  const cancelMutation = useCancelBooking();

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    return b.status === activeTab;
  });

  const handleCancel = async () => {
    if (!cancelModalBooking) return;
    try {
      await cancelMutation.mutateAsync(cancelModalBooking.id);
      dispatchGlobalToast({
        type: 'success',
        title: 'Booking Cancelled',
        message: `Booking ${cancelModalBooking.reference} has been cancelled successfully.`,
      });
      setCancelModalBooking(null);
    } catch {
      // Handled centrally in apiRequest
    }
  };

  return {
    bookings: filteredBookings,
    totalCount: bookings.length,
    loading,
    isError,
    error: error instanceof Error ? error.message : null,
    isFetching,
    activeTab,
    setActiveTab,
    cancelModalBooking,
    setCancelModalBooking,
    isCancelling: cancelMutation.isPending,
    handleCancel,
    refreshBookings,
  };
}
