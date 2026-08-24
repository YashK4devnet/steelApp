import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Booking } from '../types';
import { getBookings } from '../services/bookingApi';
import { useCancelBooking } from './useBookingMutations';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export function useBookings() {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Loaded' | 'Cancelled'>('All');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  const { data: bookings = [], isLoading: loading, refetch: refreshBookings } = useQuery({
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
      setCancelModalBooking(null);
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
    }
  };

  return {
    bookings: filteredBookings,
    totalCount: bookings.length,
    loading,
    activeTab,
    setActiveTab,
    cancelModalBooking,
    setCancelModalBooking,
    isCancelling: cancelMutation.isPending,
    handleCancel,
    refreshBookings,
  };
}
