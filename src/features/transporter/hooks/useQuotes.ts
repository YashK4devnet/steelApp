import { useState, useEffect, useMemo, useCallback } from 'react';
import type { QuoteItem } from '../types';
import { getQuotes } from '../services/transporterApi';

export function useQuotes() {
  const [activeTab, setActiveTab] = useState<'pending' | 'quoted'>('pending');
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Submit Quote Modal State
  const [selectedQuoteToSubmit, setSelectedQuoteToSubmit] = useState<QuoteItem | null>(null);
  const [proposedRateInput, setProposedRateInput] = useState<string>('');
  const [trucksInput, setTrucksInput] = useState<string>('1 Truck');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState<boolean>(false);

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

  const pendingQuotes = useMemo(() => {
    return quotes.filter((q) => q.status === 'pending_quote');
  }, [quotes]);

  const alreadyQuotedQuotes = useMemo(() => {
    return quotes.filter((q) => q.status !== 'pending_quote');
  }, [quotes]);

  const displayedList = useMemo(() => {
    const list = activeTab === 'pending' ? pendingQuotes : alreadyQuotedQuotes;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((item) => 
      item.quote_no.toLowerCase().includes(q) ||
      item.from_location.toLowerCase().includes(q) ||
      item.to_location.toLowerCase().includes(q) ||
      item.materials_requested.toLowerCase().includes(q) ||
      item.asking_rate.toLowerCase().includes(q) ||
      (item.proposed_rate && item.proposed_rate.toLowerCase().includes(q)) ||
      (item.state_label && item.state_label.toLowerCase().includes(q))
    );
  }, [activeTab, pendingQuotes, alreadyQuotedQuotes, searchQuery]);

  const handleOpenQuoteModal = (quote: QuoteItem) => {
    setSelectedQuoteToSubmit(quote);
    setProposedRateInput(quote.asking_rate ? quote.asking_rate.replace(/[^\d]/g, '') : '');
    setTrucksInput('1 Truck');
  };

  const handleCloseQuoteModal = () => {
    setSelectedQuoteToSubmit(null);
    setProposedRateInput('');
    setTrucksInput('1 Truck');
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuoteToSubmit) return;
    setIsSubmittingQuote(true);

    setTimeout(() => {
      const formattedRate = proposedRateInput.startsWith('₹') ? proposedRateInput : `₹${proposedRateInput} / Ton`;
      setQuotes((prev) => 
        prev.map((item) => {
          if (item.id === selectedQuoteToSubmit.id) {
            return {
              ...item,
              status: 'pending',
              state_label: 'Pending Approval',
              proposed_rate: formattedRate,
              trucks_sent: trucksInput || '1 Truck',
            };
          }
          return item;
        })
      );
      setIsSubmittingQuote(false);
      setSelectedQuoteToSubmit(null);
      setActiveTab('quoted');
    }, 400);
  };

  return {
    activeTab,
    setActiveTab,
    quotes,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    pendingQuotes,
    alreadyQuotedQuotes,
    displayedList,
    selectedQuoteToSubmit,
    proposedRateInput,
    setProposedRateInput,
    trucksInput,
    setTrucksInput,
    isSubmittingQuote,
    handleOpenQuoteModal,
    handleCloseQuoteModal,
    handleSubmitQuote,
    refreshQuotes: fetchQuotes,
  };
}
