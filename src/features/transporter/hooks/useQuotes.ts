import { useState, useEffect, useMemo, useCallback } from 'react';
import type { QuoteItem } from '../types';
import { getQuotes } from '../services/transporterApi';

export function useQuotes() {
  const [activeTab, setActiveTab] = useState<'pending' | 'quoted'>('pending');
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Date filter state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuotes();
      setQuotes(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load quotes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchQuotes();
  }, [fetchQuotes]);

  const availableDates = useMemo(() => {
    return Array.from(new Set(quotes.map((q) => q.created_date).filter(Boolean)));
  }, [quotes]);

  const pendingQuotes = useMemo(() => {
    return quotes.filter((q) => q.status === 'pending_quote');
  }, [quotes]);

  const alreadyQuotedQuotes = useMemo(() => {
    return quotes.filter((q) => q.status !== 'pending_quote');
  }, [quotes]);

  const displayedList = useMemo(() => {
    const list = activeTab === 'pending' ? pendingQuotes : alreadyQuotedQuotes;
    return list.filter((item) => {
      // Date filter
      if (selectedDate && item.created_date !== selectedDate) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchQuoteNo = item.quote_no.toLowerCase().includes(q);
        const matchFrom = item.from_location.toLowerCase().includes(q);
        const matchTo = item.to_location.toLowerCase().includes(q);
        const matchMaterials = item.materials_requested.toLowerCase().includes(q);
        const matchAsking = item.asking_rate.toLowerCase().includes(q);
        const matchProposed = item.proposed_rate ? item.proposed_rate.toLowerCase().includes(q) : false;
        const matchState = item.state_label ? item.state_label.toLowerCase().includes(q) : false;
        return matchQuoteNo || matchFrom || matchTo || matchMaterials || matchAsking || matchProposed || matchState;
      }

      return true;
    });
  }, [activeTab, pendingQuotes, alreadyQuotedQuotes, selectedDate, searchQuery]);

  return {
    activeTab,
    setActiveTab,
    quotes,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    isCalendarOpen,
    setIsCalendarOpen,
    availableDates,
    pendingQuotes,
    alreadyQuotedQuotes,
    displayedList,
    refreshQuotes: fetchQuotes,
  };
}
