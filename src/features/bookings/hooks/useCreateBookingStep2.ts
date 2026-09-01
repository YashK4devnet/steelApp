import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { SelectedProduct, DIAProduct, Step1LocationState, SaveBookingPayload } from '../types';
import { useSaveBooking } from './useBookingMutations';
import { dispatchGlobalToast } from '../../../app/providers/ToastProvider';

const customDIAProduct: DIAProduct = {
  id: 999,
  name: 'Custom DIA Request',
  dia_shape: 'Custom',
  dia_weight_type: 'Custom',
  has_bundles: true,
  bundles: [
    { id: 101, name: 'Standard Bundle', items: ['Standard bundle'], preset_weight_kg: 0 },
  ],
  uom_options: ['TON', 'KG'],
};

export function useCreateBookingStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as Step1LocationState) || {};

  const step1Data = state.step1Data;
  const isViewMode = location.pathname.startsWith('/bookings/view');
  const bookingId = step1Data?.id;

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(() => {
    if (state.selectedProducts && state.selectedProducts.length > 0) {
      return state.selectedProducts;
    }
    return [];
  });

  const [productToEdit, setProductToEdit] = useState<SelectedProduct | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const saveMutation = useSaveBooking();

  const handleAddNewProduct = (newProduct: SelectedProduct) => {
    setSelectedProducts((prev) => [...prev, newProduct]);
    setIsAddingProduct(false);
  };

  const handleSaveProductEdit = (updatedProduct: SelectedProduct) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.local_id === updatedProduct.local_id ? updatedProduct : p))
    );
    setProductToEdit(null);
  };

  const handleDeleteProduct = (localId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.local_id !== localId));
  };

  const handleSaveOrder = async () => {
    if (selectedProducts.length === 0) {
      dispatchGlobalToast({
        type: 'warning',
        title: 'Missing Materials',
        message: 'Please add at least one DIA request before saving the order.',
      });
      return;
    }

    const invalidProduct = selectedProducts.find((sp) => {
      if (sp.order_type === 'weight') {
        return !sp.weight || sp.weight <= 0;
      }
      return !sp.selected_bundle_id || !sp.bundle_quantity || sp.bundle_quantity <= 0;
    });

    if (invalidProduct) {
      dispatchGlobalToast({
        type: 'warning',
        title: 'Incomplete Details',
        message: 'Please configure the weight or bundle details for all entries.',
      });
      return;
    }

    try {
      if (!step1Data) {
        throw new Error('Step 1 data missing');
      }

      const payload: SaveBookingPayload = {
        ...step1Data,
        products: selectedProducts,
      };

      const response = await saveMutation.mutateAsync({ id: bookingId, payload });
      if (response && (response.success || 'reference' in response)) {
        const ref = 'reference' in response ? response.reference : '';
        dispatchGlobalToast({
          type: 'success',
          title: bookingId ? 'Booking Updated' : 'Booking Created',
          message: bookingId
            ? 'Booking has been updated successfully.'
            : `Booking created successfully! ${ref ? 'Ref: ' + ref : ''}`,
        });
        navigate('/bookings', { replace: true });
      }
    } catch {
      // Error notifications are handled automatically by centralized apiRequest
    }
  };

  return {
    bookingId,
    isViewMode,
    selectedProducts,
    isSaving: saveMutation.isPending,
    productToEdit,
    setProductToEdit,
    isAddingProduct,
    setIsAddingProduct,
    customDIAProduct,
    handleAddNewProduct,
    handleSaveProductEdit,
    handleDeleteProduct,
    handleSaveOrder,
    navigateBack: () => navigate(-1),
    navigateToBookings: () => navigate('/bookings', { replace: true }),
  };
}
