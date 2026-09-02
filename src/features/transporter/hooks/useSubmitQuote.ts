import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { QuoteItem, ProposedTruckDetail, ActiveTruckType, TransporterQuotationDetail } from '../types';
import { getQuoteById, getQuotationDetail, getTransporterTruckTypes, submitTruckQuote } from '../services/transporterApi';
import { dispatchGlobalToast } from '../../../app/providers/ToastProvider';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export function useSubmitQuote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [quote, setQuote] = useState<QuoteItem | null>(null);
  const [quotationDetail, setQuotationDetail] = useState<TransporterQuotationDetail | null>(null);
  const [truckTypes, setTruckTypes] = useState<ActiveTruckType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State - Starts empty as requested
  const [availableTrucks, setAvailableTrucks] = useState<string>('');
  const [truckDetails, setTruckDetails] = useState<ProposedTruckDetail[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const detailRef = useRef<TransporterQuotationDetail | null>(null);
  const typesRef = useRef<ActiveTruckType[]>([]);

  // Load quote details and active truck types on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      if (!id) {
        setError('No quote identifier provided');
        setLoading(false);
        return;
      }
      try {
        const [quoteData, detailData, typesData] = await Promise.all([
          getQuoteById(id),
          getQuotationDetail(id).catch(() => null),
          getTransporterTruckTypes().catch(() => []),
        ]);

        if (quoteData) {
          setQuote(quoteData);
          if (detailData) {
            setQuotationDetail(detailData);
            detailRef.current = detailData;
          }
          if (typesData && typesData.length > 0) {
            setTruckTypes(typesData);
            typesRef.current = typesData;
          }

          // Keep form inputs empty initially as requested
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

    loadData();
  }, [id]);

  // Handle available trucks count change
  // When user enters fewer trucks than requested, we map the first K server truck lines in sequence
  const handleAvailableTrucksChange = useCallback((valueStr: string) => {
    setAvailableTrucks(valueStr);

    if (valueStr === '') {
      setTruckDetails([]);
      return;
    }

    const val = parseInt(valueStr, 10);
    const detail = detailRef.current;
    const types = typesRef.current;
    const serverLines = detail?.truck_lines || [];
    const maxTrucks = quote?.trucks_required || (serverLines.length > 0 ? serverLines.length : 1);

    if (!isNaN(val) && val > 0 && val <= maxTrucks) {
      setTruckDetails((prev) => {
        if (prev.length === val) return prev;
        if (prev.length < val) {
          const added: ProposedTruckDetail[] = Array.from(
            { length: val - prev.length },
            (_, idx) => {
              const truckIndex = prev.length + idx;
              // Map sequentially to the first K server truck lines
              const linkedLine = serverLines[truckIndex];

              let defaultTypeId: number | null = typeof linkedLine?.proposed_truck_type_id === 'number'
                ? linkedLine.proposed_truck_type_id
                : null;

              if (!defaultTypeId && linkedLine?.requested_truck_type_name) {
                const matched = types.find(
                  (t) => t.name.toLowerCase() === linkedLine.requested_truck_type_name.toLowerCase()
                );
                if (matched) defaultTypeId = matched.id;
              }

              if (!defaultTypeId && types.length > 0) {
                defaultTypeId = types[0].id;
              }

              const defaultTypeName = types.find((t) => t.id === defaultTypeId)?.name || linkedLine?.requested_truck_type_name || '';

              return {
                id: String(linkedLine?.id || `truck-${truckIndex + 1}`),
                truck_line_id: linkedLine?.id,
                vehicle_type: defaultTypeName,
                proposed_truck_type_id: defaultTypeId,
                is_new_truck_type: false,
                truck_type_name: '',
                capacity_tons: linkedLine?.truck_capacity && linkedLine.truck_capacity > 0 ? linkedLine.truck_capacity : '',
                pricing_base: quote?.pricing_base || (detail?.by_truck ? 'per_truck' : 'per_ton'),
                proposed_rate: linkedLine?.proposal_rate && linkedLine.proposal_rate > 0 ? String(linkedLine.proposal_rate) : '',
              };
            }
          );
          return [...prev, ...added];
        }
        return prev.slice(0, val);
      });
    } else {
      setTruckDetails([]);
    }
  }, [quote?.trucks_required, quote?.pricing_base]);

  // Update specific truck detail
  const handleUpdateTruck = useCallback((index: number, field: keyof ProposedTruckDetail, value: unknown) => {
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
    const max = quote?.trucks_required || quotationDetail?.truck_lines?.length || 0;

    if (isNaN(val) || val <= 0) {
      return 'Please enter a valid number of trucks (at least 1).';
    }
    if (val > max) {
      return `Available trucks cannot exceed the ${max} trucks required by the customer.`;
    }
    return null;
  }, [availableTrucks, quote?.trucks_required, quotationDetail?.truck_lines?.length]);

  // Overall form validity
  const isValid = useMemo(() => {
    if (!quote) return false;
    const numTrucks = parseInt(availableTrucks, 10);
    const maxTrucks = quote.trucks_required || quotationDetail?.truck_lines?.length || 1;

    // Check available trucks bounds
    if (isNaN(numTrucks) || numTrucks <= 0 || numTrucks > maxTrucks) {
      return false;
    }

    if (truckDetails.length !== numTrucks) {
      return false;
    }

    // Every truck must have vehicle type, positive capacity, and positive rate
    const allTrucksValid = truckDetails.every((t) => {
      const hasVehicle = t.is_new_truck_type
        ? Boolean(t.truck_type_name && t.truck_type_name.trim().length > 0)
        : Boolean(t.proposed_truck_type_id || (t.vehicle_type && t.vehicle_type.trim().length > 0));

      const cap = typeof t.capacity_tons === 'number' ? t.capacity_tons : parseFloat(String(t.capacity_tons || ''));
      const rate = typeof t.proposed_rate === 'number' ? t.proposed_rate : parseFloat(String(t.proposed_rate || ''));

      return (
        hasVehicle &&
        !isNaN(cap) &&
        cap > 0 &&
        !isNaN(rate) &&
        rate > 0
      );
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
      // Submit each truck line quote sequentially or in parallel for the chosen available trucks
      await Promise.all(
        truckDetails.map((t, idx) => {
          const rawId = t.truck_line_id || quotationDetail?.truck_lines?.[idx]?.id;
          const lineId = typeof rawId === 'number' && !isNaN(rawId) && rawId > 0 ? rawId : null;

          if (!lineId) {
            throw new Error(`Truck Line ID is required for Truck #${idx + 1}. Please refresh the quote and try again.`);
          }

          const cap = typeof t.capacity_tons === 'number' ? t.capacity_tons : parseFloat(String(t.capacity_tons));
          const rate = typeof t.proposed_rate === 'number' ? t.proposed_rate : parseInt(String(t.proposed_rate), 10);

          return submitTruckQuote({
            truck_line_id: lineId,
            new_truck_type: Boolean(t.is_new_truck_type),
            proposed_truck_type_id: t.is_new_truck_type ? undefined : (t.proposed_truck_type_id ?? undefined),
            truck_type_name: t.is_new_truck_type ? t.truck_type_name?.trim() : undefined,
            truck_capacity: cap,
            proposal_rate: Math.round(rate),
          });
        })
      );

      // Invalidate quotations queries
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transporterQuotations });
      if (id) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transporterQuotationDetail(id) });
      }

      dispatchGlobalToast({
        type: 'success',
        title: 'Quote Proposal Submitted',
        message: `Quote proposal submitted for ${truckDetails.length} truck${truckDetails.length > 1 ? 's' : ''}.`,
      });

      navigate('/transporter/quotes?tab=quoted', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting quote proposal';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    quote,
    quotationDetail,
    truckTypes,
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
