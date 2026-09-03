import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { QuoteItem, ProposedTruckDetail, ActiveTruckType, TransporterQuotationDetail, TruckQuoteItemPayload } from '../types';
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
        // Fetch detailed quotation (Section 8) and active truck types (Section 9)
        const [detailData, typesData] = await Promise.all([
          getQuotationDetail(id).catch(async () => {
            // Fallback to getQuoteById if direct detail fails
            const fallbackQuote = await getQuoteById(id);
            return fallbackQuote ? ({
              id: Number(fallbackQuote.id),
              booking_number: fallbackQuote.quote_no,
              pickup_location_id: 0,
              pickup_location_name: fallbackQuote.from_location,
              delivery_address_id: 0,
              delivery_address_name: fallbackQuote.to_location,
              by_truck: fallbackQuote.pricing_base === 'per_truck',
              asking_rate: 0,
              requested_truck_count: fallbackQuote.trucks_required,
              proposed_truck_count: fallbackQuote.available_trucks || 0,
              approved_truck_count: 0,
              state: fallbackQuote.status,
              truck_lines: (fallbackQuote.truck_details || []).map((td) => ({
                id: td.truck_line_id || Number(td.id) || 0,
                proposal_rate: Number(td.proposed_rate) || 0,
                proposed_truck_type_id: td.proposed_truck_type_id || false,
                proposed_truck_type: td.vehicle_type || '',
                truck_number: td.truck_number_plate || '',
                truck_capacity: Number(td.capacity_tons) || 0,
                driver_name: td.driver_name || '',
                driver_contact: td.driver_contact || '',
                driver_license: td.driver_license_number || '',
                state: 'waiting_team_approval',
                requested_truck_type_name: td.vehicle_type || '',
              })),
            } as TransporterQuotationDetail) : null;
          }),
          getTransporterTruckTypes().catch(() => []),
        ]);

        if (detailData) {
          setQuotationDetail(detailData);
          detailRef.current = detailData;

          const rateLabel = typeof detailData.asking_rate === 'number'
            ? `₹${detailData.asking_rate.toLocaleString('en-IN')} / ${detailData.by_truck ? 'Truck' : 'Ton'}`
            : `₹${detailData.asking_rate} / ${detailData.by_truck ? 'Truck' : 'Ton'}`;

          const mappedQuote: QuoteItem = {
            id: detailData.id,
            quote_no: detailData.booking_number,
            created_date: 'Active',
            from_location: detailData.pickup_location_name,
            to_location: detailData.delivery_address_name,
            materials_requested: detailData.by_truck ? 'Full Truck Load' : 'Bulk Steel Consignment',
            asking_rate: rateLabel,
            trucks_required: detailData.requested_truck_count || (detailData.truck_lines?.length || 1),
            status: detailData.state === 'draft' ? 'pending_quote' : detailData.state === 'done' ? 'accepted' : 'pending',
            state_label: detailData.state,
            available_trucks: detailData.proposed_truck_count || 0,
            proposed_rate: rateLabel,
            trucks_sent: `${detailData.proposed_truck_count || 0} Trucks Proposed`,
            truck_details: (detailData.truck_lines || []).map((tl, index) => ({
              id: String(tl.id || `truck-${index + 1}`),
              truck_line_id: tl.id,
              vehicle_type: tl.proposed_truck_type || tl.requested_truck_type_name || 'Vehicle',
              capacity_tons: tl.truck_capacity || 20,
              pricing_base: detailData.by_truck ? 'per_truck' : 'per_ton',
              proposed_rate: tl.proposal_rate ? String(tl.proposal_rate) : '',
            })),
            drivers_assigned: false,
          };

          setQuote(mappedQuote);

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
    const detail = detailRef.current || quotationDetail;
    const types = typesRef.current || truckTypes;
    const serverLines = detail?.truck_lines || quote?.truck_details?.map(t => ({
      id: t.truck_line_id || (t.id && !isNaN(Number(t.id)) ? Number(t.id) : 0),
      proposed_truck_type_id: t.proposed_truck_type_id,
      requested_truck_type_name: t.vehicle_type,
      truck_capacity: Number(t.capacity_tons) || 0,
      proposal_rate: Number(t.proposed_rate) || 0,
    })) || [];
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
              const resolvedLineId = linkedLine?.id && Number(linkedLine.id) > 0 ? Number(linkedLine.id) : undefined;

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
                id: String(resolvedLineId || `truck-${truckIndex + 1}`),
                truck_line_id: resolvedLineId,
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
  }, [quotationDetail, truckTypes, quote]);

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
      const quotationLineId = quotationDetail?.id || (id ? parseInt(id, 10) : null);
      if (!quotationLineId || isNaN(quotationLineId)) {
        throw new Error('Quotation Line ID is missing. Please refresh the quote and try again.');
      }

      const truckQuotesPayload: TruckQuoteItemPayload[] = truckDetails.map((t, idx) => {
        const rawId = 
          t.truck_line_id || 
          (t.id && !isNaN(Number(t.id)) && Number(t.id) > 0 ? Number(t.id) : null) ||
          quotationDetail?.truck_lines?.[idx]?.id ||
          detailRef.current?.truck_lines?.[idx]?.id ||
          quote?.truck_details?.[idx]?.truck_line_id ||
          (quote?.truck_details?.[idx]?.id && !isNaN(Number(quote.truck_details[idx].id)) ? Number(quote.truck_details[idx].id) : null);
        const lineId = typeof rawId === 'number' && !isNaN(rawId) && rawId > 0 ? rawId : null;

        if (!lineId) {
          throw new Error(`Truck Line ID is required for Truck #${idx + 1}. Please refresh the quote and try again.`);
        }

        const cap = typeof t.capacity_tons === 'number' ? t.capacity_tons : parseFloat(String(t.capacity_tons));
        const rate = typeof t.proposed_rate === 'number' ? t.proposed_rate : parseInt(String(t.proposed_rate), 10);

        return {
          truck_line_id: lineId,
          new_truck_type: Boolean(t.is_new_truck_type),
          proposed_truck_type_id: t.is_new_truck_type ? undefined : (t.proposed_truck_type_id ?? undefined),
          truck_type_name: t.is_new_truck_type ? t.truck_type_name?.trim() : undefined,
          truck_capacity: cap,
          proposal_rate: Math.round(rate),
        };
      });

      // Submit all truck quotes atomically in a single batch request
      await submitTruckQuote({
        quotation_line_id: quotationLineId,
        available_truck_count: truckQuotesPayload.length,
        truck_quotes: truckQuotesPayload,
      });

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
