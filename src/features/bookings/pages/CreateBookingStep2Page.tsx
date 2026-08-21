import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { SelectedProduct, DIAProduct } from '../types';
import { saveBooking, updateBooking } from '../services/bookingApi';
import { ProductConfigSheet } from '../components/ProductConfigSheet';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const customDIAProduct: DIAProduct = {
  id: 999,
  name: 'Custom DIA Request',
  dia_shape: 'Custom',
  dia_weight_type: 'Custom',
  has_bundles: true,
  bundles: [
    { id: 101, name: 'Standard Bundle (1T)', items: ['Standard bundle x1'], preset_weight_kg: 1000 },
    { id: 102, name: 'Heavy Bundle (2T)', items: ['Heavy bundle x1'], preset_weight_kg: 2000 },
  ],
  uom_options: ['TON', 'KG'],
};

export function CreateBookingStep2Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any || {};
  
  const step1Data = state.step1Data;
  const isViewMode = location.pathname.startsWith('/bookings/view');
  const bookingId = step1Data?.id;

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(() => {
    if (state.selectedProducts && state.selectedProducts.length > 0) {
      return state.selectedProducts;
    }
    return [];
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [productToEdit, setProductToEdit] = useState<SelectedProduct | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const handleAddNewProduct = (newProduct: SelectedProduct) => {
    setSelectedProducts([...selectedProducts, newProduct]);
    setIsAddingProduct(false);
  };

  const handleSaveProductEdit = (updatedProduct: SelectedProduct) => {
    const updatedList = selectedProducts.map(p => 
      p.local_id === updatedProduct.local_id ? updatedProduct : p
    );
    setProductToEdit(null);
    setSelectedProducts(updatedList);
  };

  const handleDeleteProduct = (localId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.local_id !== localId));
  };

  const handleSaveOrder = async () => {
    if (selectedProducts.length === 0) {
      alert('Please add at least one DIA request.');
      return;
    }

    // Validate that all products have configured weight or bundle quantities
    const invalidProduct = selectedProducts.find(sp => {
      if (sp.order_type === 'weight') {
        return !sp.weight || sp.weight <= 0;
      } else {
        return !sp.selected_bundle_id || !sp.bundle_quantity || sp.bundle_quantity <= 0;
      }
    });

    if (invalidProduct) {
      alert(`Please configure the weight or bundle details for all entries.`);
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        ...step1Data,
        products: selectedProducts
      };
      
      if (bookingId) {
        const response = await updateBooking(bookingId, payload);
        if (response.success) {
          alert('Booking updated successfully!');
          navigate('/bookings', { replace: true });
        }
      } else {
        const response = await saveBooking(payload);
        if (response.success) {
          alert(`Booking created successfully! Reference: ${response.reference}`);
          navigate('/bookings', { replace: true });
        }
      }
    } catch (error) {
      alert('Failed to save booking. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-36">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[22px] font-bold text-text-primary tracking-tight leading-tight">
                {isViewMode ? 'View Booking' : bookingId ? 'Edit Booking' : 'Create Booking'}
              </h1>
              <p className="text-[13px] font-semibold text-text-secondary mt-0.5">Step 2: DIA Details</p>
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-emerald-500" />
            <div className="flex-1 h-1.5 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10 flex flex-col gap-4">
        
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-[16px] font-bold text-text-primary">DIA Parameters Selection</h2>
          {!isViewMode && selectedProducts.length > 0 && (
            <button
              onClick={() => setIsAddingProduct(true)}
              className="text-[13px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <PlusIcon /> Add Details
            </button>
          )}
        </div>
        
        {selectedProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[24px] p-6 shadow-[0_4px_16px_rgba(15,23,42,0.03)] border border-slate-900/5">
            <p className="text-text-secondary font-medium mb-4">No DIA parameters added yet.</p>
            {!isViewMode && (
              <button
                onClick={() => setIsAddingProduct(true)}
                className="px-6 py-2.5 rounded-full bg-primary/10 text-primary font-bold text-[14px] hover:bg-primary/20 transition-colors inline-flex items-center gap-2"
              >
                <PlusIcon /> Add DIA Details
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedProducts.map((sp, index) => {
              const bundle = sp.product.bundles?.find(b => b.id === sp.selected_bundle_id);
              const isConfigured = sp.order_type === 'weight' ? (sp.weight && sp.weight > 0) : (sp.selected_bundle_id && sp.bundle_quantity && sp.bundle_quantity > 0);

              return (
                <div key={sp.local_id} className="bg-white rounded-[20px] p-4 shadow-[0_4px_16px_rgba(15,23,42,0.03)] border border-slate-900/5 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-text-primary text-[15px] leading-tight">
                          {sp.product.name}
                        </h3>
                        {!isConfigured && !isViewMode && (
                          <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100 animate-pulse">
                            Requires Config
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] font-medium text-text-secondary ml-7">
                        DIA: <span className="font-semibold text-text-primary">{sp.dia}</span> • Shape: <span className="font-semibold text-text-primary">{sp.shape}</span> • Weight: <span className="font-semibold text-text-primary">{sp.weight_option}</span>
                      </p>
                    </div>
                    
                    {!isViewMode && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setProductToEdit(sp)}
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(sp.local_id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isConfigured && (
                    <div className="ml-7 bg-slate-50 rounded-[12px] p-3 border border-slate-900/5">
                      {sp.order_type === 'bundle' ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-text-secondary font-medium">Ordering Mode:</span>
                            <span className="font-bold text-text-primary">Predefined Bundle</span>
                          </div>
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-text-secondary font-medium">Bundle Type:</span>
                            <span className="font-bold text-text-primary">{bundle?.name}</span>
                          </div>
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-text-secondary font-medium">Quantity:</span>
                            <span className="font-bold text-text-primary">{sp.bundle_quantity}</span>
                          </div>
                          <div className="w-full h-[1px] bg-slate-200 my-0.5" />
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-primary font-bold">Calculated Weight:</span>
                            <span className="font-bold text-primary">{sp.calculated_weight?.toLocaleString()} KG</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-text-secondary font-medium">Ordering Mode:</span>
                            <span className="font-bold text-text-primary">Custom Weight</span>
                          </div>
                          <div className="flex justify-between items-center text-[13px] mt-1.5">
                            <span className="text-text-secondary font-medium">Weight:</span>
                            <span className="font-bold text-text-primary">{sp.weight?.toLocaleString()} {sp.uom}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Fixed Bottom Submit Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-900/5 p-4 z-50">
        <div className="max-w-[800px] mx-auto">
          <button 
            type="button"
            onClick={isViewMode ? () => navigate('/bookings', { replace: true }) : handleSaveOrder}
            disabled={isSaving}
            className={`w-full py-3.5 px-4 rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${
              isSaving 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : isViewMode
                  ? 'bg-slate-800 text-white shadow-[0_4px_16px_rgba(15,23,42,0.15)] hover:bg-slate-700 active:scale-[0.98]'
                  : 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-[0.98]'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Order...
              </>
            ) : isViewMode ? (
              'Back to Bookings'
            ) : (
              'Save Order'
            )}
          </button>
        </div>
      </div>

      <ProductConfigSheet 
        isOpen={!!productToEdit || isAddingProduct} 
        onClose={() => { setProductToEdit(null); setIsAddingProduct(false); }} 
        product={isAddingProduct ? customDIAProduct : productToEdit?.product || null}
        initialData={productToEdit}
        onSave={(data) => {
          if (isAddingProduct) {
            handleAddNewProduct(data);
          } else {
            handleSaveProductEdit(data);
          }
        }}
      />
    </div>
  );
}
