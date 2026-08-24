import React from 'react';
import { Toggle } from '../../../components/ui/Toggle';
import { Button } from '../../../components/ui/Button';
import { useCreateBookingStep1 } from '../hooks/useCreateBookingStep1';
import { PickupSection } from '../components/PickupSection';
import { DeliverySection } from '../components/DeliverySection';
import { TruckDetailsSection } from '../components/TruckDetailsSection';
import { DriverDetailsSection } from '../components/DriverDetailsSection';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export function CreateBookingStep1Page() {
  const {
    bookingId,
    isViewMode,
    warehouses,
    addresses,
    form,
    errors,
    handleFormChange,
    handleWarehouseChange,
    handleProceed,
    navigateBack,
  } = useCreateBookingStep1();

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
                Step 1: Order & Transport Details
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-primary" />
            <div className="flex-1 h-1.5 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10 flex flex-col gap-6">
        {/* Section 1: Pickup Details */}
        <PickupSection
          form={form}
          warehouses={warehouses}
          errors={errors}
          isViewMode={isViewMode}
          onWarehouseChange={handleWarehouseChange}
        />

        {/* Section 2: Delivery Details */}
        <DeliverySection
          form={form}
          addresses={addresses}
          errors={errors}
          isViewMode={isViewMode}
          onFormChange={handleFormChange}
        />

        {/* Section 3: Transport Switch & Details */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-6">
          <Toggle
            label="Use Seller's Transport"
            description="Toggle on if seller arranges truck & driver"
            checked={form.use_sellers_truck}
            disabled={isViewMode}
            onChange={(checked) => handleFormChange('use_sellers_truck', checked)}
          />

          {!form.use_sellers_truck && (
            <div className="flex flex-col gap-6 pt-2 border-t border-slate-900/5 animate-fade-in">
              <TruckDetailsSection
                form={form}
                errors={errors}
                isViewMode={isViewMode}
                onFormChange={handleFormChange}
              />
              <DriverDetailsSection
                form={form}
                errors={errors}
                isViewMode={isViewMode}
                onFormChange={handleFormChange}
              />
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-900/5 p-4 z-50">
        <div className="max-w-[800px] mx-auto">
          <Button
            type="button"
            variant="primary"
            onClick={handleProceed}
            className="w-full py-3.5 rounded-[16px] text-[15px] font-bold shadow-[0_4px_16px_rgba(10,46,99,0.25)]"
          >
            {isViewMode ? 'Proceed to Product Details' : 'Proceed to Product Details'}
          </Button>
        </div>
      </div>
    </div>
  );
}
