import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuoteItem, ProposedTruckDetail } from '../types';
import { getQuoteById, saveQuoteDriverDetails } from '../services/transporterApi';
import { dispatchGlobalToast } from '../../../app/providers/ToastProvider';

export function useAssignDrivers() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quote, setQuote] = useState<QuoteItem | null>(null);
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
        const data = await getQuoteById(id);
        if (data) {
          setQuote(data);
          
          // Initialize truck driver details
          if (data.truck_details && data.truck_details.length > 0) {
            setTrucks(data.truck_details.map((t, idx) => ({
              ...t,
              id: t.id || `truck-${idx + 1}`,
              vehicle_type: t.vehicle_type || '12 Wheeler (21-25 MT)',
              capacity_tons: t.capacity_tons || 20,
              truck_number_plate: t.truck_number_plate || '',
              driver_name: t.driver_name || '',
              driver_contact: t.driver_contact || '',
              driver_license_number: t.driver_license_number || '',
            })));
          } else {
            const count = data.available_trucks || data.trucks_required || 1;
            const generated: ProposedTruckDetail[] = Array.from({ length: count }, (_, idx) => ({
              id: `truck-${idx + 1}`,
              vehicle_type: '12 Wheeler (21-25 MT)',
              capacity_tons: 20,
              pricing_base: 'per_ton',
              proposed_rate: '',
              truck_number_plate: '',
              driver_name: '',
              driver_contact: '',
              driver_license_number: '',
            }));
            setTrucks(generated);
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

  const isValid = useMemo(() => {
    if (!quote || trucks.length === 0) return false;

    return trucks.every((t) => {
      const hasPlate = Boolean(t.truck_number_plate?.trim());
      const hasName = Boolean(t.driver_name?.trim());
      const hasContact = Boolean(t.driver_contact?.trim());
      return hasPlate && hasName && hasContact;
    });
  }, [quote, trucks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !quote || saving) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await saveQuoteDriverDetails({
        quote_id: quote.id,
        truck_details: trucks,
      });

      if (res.success) {
        dispatchGlobalToast({
          type: 'success',
          title: 'Driver Details Saved',
          message: 'Driver and truck plate information has been saved successfully.',
        });
        navigate('/transporter/quotes?tab=quoted', { replace: true });
      } else {
        setSaveError(res.message || 'Failed to save driver details');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving driver details';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  return {
    quote,
    loading,
    error,
    trucks,
    handleUpdateDriver,
    isValid,
    saving,
    saveError,
    handleSubmit,
    navigateBack: () => navigate('/transporter/quotes?tab=quoted', { replace: true }),
  };
}
