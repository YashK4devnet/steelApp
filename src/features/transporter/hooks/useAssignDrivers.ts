import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { QuoteItem, ProposedTruckDetail, TransporterQuotationDetail } from '../types';
import { getQuoteById, getQuotationDetail, submitTruckDriverDetails } from '../services/transporterApi';
import { dispatchGlobalToast } from '../../../app/providers/ToastProvider';
import { QUERY_KEYS } from '../../../constants/queryKeys';

export function useAssignDrivers() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [quote, setQuote] = useState<QuoteItem | null>(null);
  const [quotationDetail, setQuotationDetail] = useState<TransporterQuotationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trucks, setTrucks] = useState<ProposedTruckDetail[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadQuote = async () => {
      if (!id) {
        setError('No quote identifier provided');
        setLoading(false);
        return;
      }
      try {
        const [quoteData, detailData] = await Promise.all([
          getQuoteById(id),
          getQuotationDetail(id).catch(() => null),
        ]);

        if (quoteData) {
          setQuote(quoteData);
          if (detailData) setQuotationDetail(detailData);

          const serverLines = detailData?.truck_lines || [];

          if (serverLines.length > 0) {
            setTrucks(
              serverLines.map((tl, idx) => ({
                id: String(tl.id || `truck-${idx + 1}`),
                truck_line_id: tl.id,
                vehicle_type: tl.proposed_truck_type || tl.requested_truck_type_name || '12 Wheeler (21-25 MT)',
                capacity_tons: tl.truck_capacity || 20,
                pricing_base: detailData?.by_truck ? 'per_truck' : 'per_ton',
                proposed_rate: tl.proposal_rate ? String(tl.proposal_rate) : '',
                truck_number_plate: tl.truck_number || '',
                driver_name: tl.driver_name || '',
                driver_contact: tl.driver_contact || '',
                driver_license_number: tl.driver_license || '',
                state: tl.state,
              }))
            );
          } else if (quoteData.truck_details && quoteData.truck_details.length > 0) {
            setTrucks(
              quoteData.truck_details.map((t, idx) => ({
                ...t,
                id: t.id || `truck-${idx + 1}`,
                truck_number_plate: t.truck_number_plate || '',
                driver_name: t.driver_name || '',
                driver_contact: t.driver_contact || '',
                driver_license_number: t.driver_license_number || '',
                state: t.state || 'management_approved',
              }))
            );
          }
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

  const handleUpdateDriver = useCallback((index: number, field: keyof ProposedTruckDetail, value: string | number) => {
    setTrucks((prev) => {
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

  // Trucks with state 'management_approved' or 'waiting_management_approval' are editable and require input
  const editableTrucks = useMemo(() => {
    return trucks.filter(
      (t) => t.state === 'management_approved' || t.state === 'waiting_management_approval'
    );
  }, [trucks]);

  const isValid = useMemo(() => {
    if (!quote || editableTrucks.length === 0) return false;

    return editableTrucks.every((t) => {
      const lineId = t.truck_line_id || Number(t.id);
      const hasValidId = typeof lineId === 'number' && !isNaN(lineId) && lineId > 0;
      const hasPlate = Boolean(t.truck_number_plate?.trim());
      const hasName = Boolean(t.driver_name?.trim());
      const hasContact = Boolean(t.driver_contact?.trim());
      return hasValidId && hasPlate && hasName && hasContact;
    });
  }, [quote, editableTrucks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !quote || saving) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Only submit API request for trucks in approved or waiting management approval states
      await Promise.all(
        editableTrucks.map((t, idx) => {
          const rawId = t.truck_line_id || Number(t.id);
          const lineId = typeof rawId === 'number' && !isNaN(rawId) && rawId > 0 ? rawId : null;

          if (!lineId) {
            throw new Error(`Truck Line ID is missing for Truck #${idx + 1}.`);
          }

          return submitTruckDriverDetails({
            truck_line_id: lineId,
            truck_number: t.truck_number_plate?.trim() || '',
            driver_name: t.driver_name?.trim() || '',
            driver_contact: t.driver_contact?.trim() || '',
            driver_license_number: t.driver_license_number?.trim() || '',
          });
        })
      );

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transporterQuotations });
      if (id) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transporterQuotationDetail(id) });
      }

      dispatchGlobalToast({
        type: 'success',
        title: 'Driver Details Submitted',
        message: `Driver details submitted for ${editableTrucks.length} approved truck${editableTrucks.length > 1 ? 's' : ''}.`,
      });

      navigate('/transporter/quotes?tab=quoted', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting driver details';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  return {
    quote,
    quotationDetail,
    loading,
    error,
    trucks,
    editableTrucks,
    handleUpdateDriver,
    isValid,
    saving,
    saveError,
    handleSubmit,
    navigateBack: () => navigate('/transporter/quotes?tab=quoted', { replace: true }),
  };
}
