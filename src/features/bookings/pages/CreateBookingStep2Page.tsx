import React from 'react';
import { ProductConfigSheet } from '../components/ProductConfigSheet';
import { SelectedProductCard } from '../components/SelectedProductCard';
import { useCreateBookingStep2 } from '../hooks/useCreateBookingStep2';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export function CreateBookingStep2Page() {
  const {
    bookingId,
    isViewMode,
    selectedProducts,
    isSaving,
    productToEdit,
    setProductToEdit,
    isAddingProduct,
    setIsAddingProduct,
    customDIAProduct,
    handleAddNewProduct,
    handleSaveProductEdit,
    handleDeleteProduct,
    handleSaveOrder,
    navigateBack,
    navigateToBookings,
  } = useCreateBookingStep2();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-36">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={navigateBack}
              aria-label="Go back"
              className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[22px] font-bold text-text-primary tracking-tight leading-tight">
                {isViewMode ? 'View Booking' : bookingId ? 'Edit Booking' : 'Create Booking'}
              </h1>
              <p className="text-[13px] font-semibold text-text-secondary mt-0.5">
                Step 2: DIA Details
              </p>
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
        </div>

        {selectedProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[24px] p-6 shadow-[0_4px_16px_rgba(15,23,42,0.03)] border border-slate-900/5 flex flex-col items-center">
            <p className="text-text-secondary font-medium mb-4">No DIA parameters added yet.</p>
            {!isViewMode && (
              <button
                type="button"
                onClick={() => setIsAddingProduct(true)}
                className="px-6 py-3 rounded-full bg-primary text-white font-bold text-[14px] shadow-[0_4px_14px_rgba(10,46,99,0.2)] hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2"
              >
                <PlusIcon /> Add DIA Details
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedProducts.map((sp, index) => (
              <SelectedProductCard
                key={sp.local_id}
                item={sp}
                index={index}
                isViewMode={isViewMode}
                onEdit={setProductToEdit}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Big Add Button */}
      {!isViewMode && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40">
          <button
            type="button"
            onClick={() => setIsAddingProduct(true)}
            aria-label="Add DIA Details"
            className="w-14 h-14 rounded-full bg-primary text-white shadow-[0_8px_25px_rgba(10,46,99,0.35)] hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center border border-white/20 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Fixed Bottom Submit Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-900/5 p-4 z-50">
        <div className="max-w-[800px] mx-auto">
          <button
            type="button"
            onClick={isViewMode ? navigateToBookings : handleSaveOrder}
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
        onClose={() => {
          setProductToEdit(null);
          setIsAddingProduct(false);
        }}
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
