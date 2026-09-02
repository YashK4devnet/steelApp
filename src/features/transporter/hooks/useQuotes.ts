import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { TransporterQuotation } from '../types';
import { getTransporterQuotations } from '../services/transporterApi';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export function useQuotes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: 'pending' | 'quoted' = tabParam === 'quoted' ? 'quoted' : 'pending';
  const [searchQuery, setSearchQuery] = useState<string>('');

  const setActiveTab = (newTab: 'pending' | 'quoted') => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newTab === 'quoted') {
          next.set('tab', 'quoted');
        } else {
          next.delete('tab');
        }
        return next;
      },
      { replace: true }
    );
  };

  const {
    data: quotes = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<TransporterQuotation[]>({
    queryKey: QUERY_KEYS.transporterQuotations,
    queryFn: getTransporterQuotations,
  });

  // Filter out draft quotes as they do not have truck lines assigned yet
  const pendingQuotes = useMemo(() => {
    return quotes.filter(
      (q) => q.state === 'waiting_team_approval' && (q.proposed_truck_count || 0) === 0
    );
  }, [quotes]);

  const alreadyQuotedQuotes = useMemo(() => {
    return quotes.filter(
      (q) =>
        q.state !== 'draft' &&
        ((q.proposed_truck_count || 0) > 0 || q.state === 'done' || q.state === 'partially_cancelled')
    );
  }, [quotes]);

  const displayedList = useMemo(() => {
    const list = activeTab === 'pending' ? pendingQuotes : alreadyQuotedQuotes;
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((item) => {
      const matchBooking = (item.booking_number || '').toLowerCase().includes(q);
      const matchFrom = (item.pickup_location_name || '').toLowerCase().includes(q);
      const matchTo = (item.delivery_address_name || '').toLowerCase().includes(q);
      const matchState = (item.state || '').toLowerCase().includes(q);
      const matchRate = String(item.asking_rate || '').includes(q);

      return matchBooking || matchFrom || matchTo || matchState || matchRate;
    });
  }, [activeTab, pendingQuotes, alreadyQuotedQuotes, searchQuery]);

  return {
    activeTab,
    setActiveTab,
    quotes,
    loading,
    isError,
    error: error instanceof Error ? error.message : isError ? 'Failed to load quotes' : null,
    searchQuery,
    setSearchQuery,
    pendingQuotes,
    alreadyQuotedQuotes,
    displayedList,
    refreshQuotes: refetch,
  };
}
