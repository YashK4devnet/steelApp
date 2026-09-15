import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { TBApproverQuotation } from '../types';
import { getTBApproverQuotations } from '../services/tbApproverApi';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export type TBApproverTab = 'approval' | 'pending';

export function useTBApproverQuotes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TBApproverTab = tabParam === 'pending' ? 'pending' : 'approval';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const queryClient = useQueryClient();

  const setActiveTab = (newTab: TBApproverTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newTab === 'pending') {
          next.set('tab', 'pending');
        } else {
          next.delete('tab');
        }
        return next;
      },
      { replace: true }
    );
  };

  const {
    data: quotations = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<TBApproverQuotation[]>({
    queryKey: QUERY_KEYS.tbApproverQuotations,
    queryFn: getTBApproverQuotations,
  });

  // Quotations with proposed trucks waiting for Team Approval (proposed_truck_count > 0)
  const waitingForApprovalQuotes = useMemo(() => {
    return quotations.filter((q) => (q.proposed_truck_count || 0) > 0);
  }, [quotations]);

  // Quotations where transporter has not proposed trucks yet (proposed_truck_count === 0)
  const waitingToBeSubmittedQuotes = useMemo(() => {
    return quotations.filter((q) => (q.proposed_truck_count || 0) === 0);
  }, [quotations]);

  const displayedList = useMemo(() => {
    const list = activeTab === 'approval' ? waitingForApprovalQuotes : waitingToBeSubmittedQuotes;
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter((item) => {
      const bookingNumber = (item.booking_number || '').toLowerCase();
      const transporterName = (item.transporter_name || '').toLowerCase();
      const transporterPhone = (item.transporter_phone || '').toLowerCase();
      const pickupName = (item.pickup_location_name || '').toLowerCase();
      const pickupCode = (item.pickup_location_code || '').toLowerCase();
      const deliveryName = (item.delivery_address_name || '').toLowerCase();
      const deliveryCode = (item.delivery_address_code || '').toLowerCase();
      const truckType = (item.requested_truck_type || '').toLowerCase();

      return (
        bookingNumber.includes(query) ||
        transporterName.includes(query) ||
        transporterPhone.includes(query) ||
        pickupName.includes(query) ||
        pickupCode.includes(query) ||
        deliveryName.includes(query) ||
        deliveryCode.includes(query) ||
        truckType.includes(query)
      );
    });
  }, [activeTab, waitingForApprovalQuotes, waitingToBeSubmittedQuotes, searchQuery]);

  const refreshQuotations = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tbApproverQuotations });
  };

  return {
    activeTab,
    setActiveTab,
    loading,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    waitingForApprovalQuotes,
    waitingToBeSubmittedQuotes,
    displayedList,
    refreshQuotations,
    refetch,
  };
}
