import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuoteItem, ProposedTruckDetail } from '../types';
import { getQuoteById, submitQuoteProposal } from '../services/transporterApi';

export function useSubmitQuote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quote, setQuote] = useState<QuoteItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State - Starts empty as requested
  const [availableTrucks, setAvailableTrucks] = useState<string>('');
  const [truckDetails, setTruckDetails] = useState<ProposedTruckDetail[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load quote details
  useEffect(() => {
    window.scrollTo(0, 0);
    const loadQuote = async () => {
      if (!id) {
        setError('No quote identifier provided');
        setLoading(false);
        return;
      }
      try {
        const data = await getQuoteById(id);
        if (data) {
          setQuote(data);
          // Initial form state is empty
          setAvailableTrucks('');
          setTruckDetails([]);
        } else {
          setError('Quote not found');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch quote details';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [id]);

  // Handle available trucks count change without restricting input
  const handleAvailableTrucksChange = useCallback((valueStr: string) => {
    // Keep user's direct raw input so they can type freely
    setAvailableTrucks(valueStr);

    if (valueStr === '') {
      setTruckDetails([]);
      return;
    }

    const val = parseInt(valueStr, 10);
    const maxTrucks = quote?.trucks_required || 0;

    // If valid number within 1..maxTrucks, dynamically synchronize truck details cards
    if (!isNaN(val) && val > 0 && val <= maxTrucks) {
      setTruckDetails((prev) => {
        if (prev.length === val) return prev;
        if (prev.length < val) {
          const added: ProposedTruckDetail[] = Array.from(
            { length: val - prev.length },
            (_, idx) => ({
              id: `truck-${prev.length + idx + 1}`,
              vehicle_type: '',
              capacity_tons: '',
              pricing_base: 'per_ton',
              proposed_rate: '',
            })
          );
          return [...prev, ...added];
        }
        return prev.slice(0, val);
      });
    } else {
      // Invalid input (e.g. higher than max or <= 0): clear truck cards
      setTruckDetails([]);
    }
  }, [quote?.trucks_required]);

  // Update specific truck detail
  const handleUpdateTruck = useCallback((index: number, field: keyof ProposedTruckDetail, value: string | number) => {
    setTruckDetails((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return updated;
    });
  }, []);

  // Compute validation warning for available trucks field
  const availableTrucksWarning = useMemo(() => {
    if (availableTrucks === '') return null;
    const val = parseInt(availableTrucks, 10);
    const max = quote?.trucks_required || 0;

    if (isNaN(val) || val <= 0) {
      return 'Please enter a valid number of trucks (at least 1).';
    }
    if (val > max) {
      return `Available trucks cannot exceed the ${max} trucks required by the customer.`;
    }
    return null;
  }, [availableTrucks, quote?.trucks_required]);

  // Overall form validity
  const isValid = useMemo(() => {
    if (!quote) return false;
    const numTrucks = parseInt(availableTrucks, 10);
    const maxTrucks = quote.trucks_required || 1;

    // Check available trucks bounds
    if (isNaN(numTrucks) || numTrucks <= 0 || numTrucks > maxTrucks) {
      return false;
    }

    if (truckDetails.length !== numTrucks) {
      return false;
    }

    // Every truck must have vehicle_type selected, positive capacity, pricing_base, and positive proposed_rate
    const allTrucksValid = truckDetails.every((t) => {
      const cap = typeof t.capacity_tons === 'number' ? t.capacity_tons : parseFloat(String(t.capacity_tons || ''));
      const rate = typeof t.proposed_rate === 'number' ? t.proposed_rate : parseFloat(String(t.proposed_rate || ''));
      return Boolean(t.vehicle_type) && !isNaN(cap) && cap > 0 && Boolean(t.pricing_base) && !isNaN(rate) && rate > 0;
    });

    return allTrucksValid;
  }, [quote, availableTrucks, truckDetails]);

  // Submit quote handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !quote || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        quote_id: quote.id,
        available_trucks: parseInt(availableTrucks, 10),
        truck_details: truckDetails,
      };

      const res = await submitQuoteProposal(payload);
      if (res.success) {
        navigate('/transporter/quotes', { replace: true });
      } else {
        setSubmitError(res.message || 'Failed to submit quote');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting quote';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    quote,
    loading,
    error,
    availableTrucks,
    handleAvailableTrucksChange,
    availableTrucksWarning,
    truckDetails,
    handleUpdateTruck,
    isValid,
    submitting,
    submitError,
    handleSubmit,
    navigateBack: () => navigate('/transporter/quotes', { replace: true }),
  };
}
