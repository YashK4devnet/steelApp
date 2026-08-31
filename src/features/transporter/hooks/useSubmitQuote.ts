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
  const [proposedRate, setProposedRate] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Derive rate unit from server asking rate (e.g. Ton or Truck)
  const rateUnit = useMemo(() => {
    if (!quote?.asking_rate) return 'Ton';
    const lower = quote.asking_rate.toLowerCase();
    if (lower.includes('truck')) return 'Truck';
    return 'Ton';
  }, [quote?.asking_rate]);

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
          setProposedRate('');
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

    // Every truck must have vehicle_type selected and positive capacity
    const allTrucksValid = truckDetails.every((t) => {
      const cap = typeof t.capacity_tons === 'number' ? t.capacity_tons : parseFloat(t.capacity_tons);
      return Boolean(t.vehicle_type) && !isNaN(cap) && cap > 0;
    });

    if (!allTrucksValid) return false;

    // Proposed rate must be a valid positive number
    const rate = parseFloat(proposedRate);
    if (isNaN(rate) || rate <= 0) return false;

    return true;
  }, [quote, availableTrucks, truckDetails, proposedRate]);

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
        proposed_rate: proposedRate,
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
    rateUnit,
    availableTrucks,
    handleAvailableTrucksChange,
    availableTrucksWarning,
    truckDetails,
    handleUpdateTruck,
    proposedRate,
    setProposedRate,
    isValid,
    submitting,
    submitError,
    handleSubmit,
    navigateBack: () => navigate('/transporter/quotes', { replace: true }),
  };
}
