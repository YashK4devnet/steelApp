import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Accordion } from '../../../components/ui/Accordion';
import { Select } from '../../../components/ui/Select';
import { Toggle } from '../../../components/ui/Toggle';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { 
  getWarehouses, 
  getCustomerDetails, 
  getCustomerAddresses,
  getBookingById
} from '../services/bookingApi';
import type { 
  Warehouse, 
  Address, 
  Customer, 
  CreateBookingFormState 
} from '../types';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export function CreateBookingStep1Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const bookingId = id ? Number(id) : null;
  const isViewMode = location.pathname.startsWith('/bookings/view');

  // Data states
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Form state
  const [form, setForm] = useState<CreateBookingFormState>({
    pickup_warehouse_id: null,
    warehouse_address_name: '',
    customer_id: null,
    customer_name: '',
    ship_to_address_id: null,
    bill_to_same_as_ship_to: true,
    bill_to_address_id: null,
    use_sellers_truck: false,
    truck_type: '',
    truck_number_plate: '',
    truck_capacity: null,
    transporter_name: '',
    transporter_contact: '',
    driver_name: '',
    driver_contact: '',
    driver_license_number: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const init = async () => {
      try {
        const [whs, cust, addrs] = await Promise.all([
          getWarehouses(),
          getCustomerDetails(),
          getCustomerAddresses('ship')
        ]);
        setWarehouses(whs);
        setCustomer(cust);
        setAddresses(addrs);

        if (bookingId) {
          const booking = await getBookingById(bookingId);
          if (booking) {
            setForm({
              pickup_warehouse_id: booking.pickup_warehouse_id,
              warehouse_address_name: booking.warehouse_address_name,
              customer_id: booking.customer_id,
              customer_name: booking.customer_name,
              ship_to_address_id: booking.ship_to_address_id,
              bill_to_same_as_ship_to: booking.bill_to_same_as_ship_to,
              bill_to_address_id: booking.bill_to_address_id,
              use_sellers_truck: booking.use_sellers_truck,
              truck_type: booking.truck_type || '',
              truck_number_plate: booking.truck_number_plate || '',
              truck_capacity: booking.truck_capacity || null,
              transporter_name: booking.transporter_name || '',
              transporter_contact: booking.transporter_contact || '',
              driver_name: booking.driver_name || '',
              driver_contact: booking.driver_contact || '',
              driver_license_number: booking.driver_license_number || '',
            });
            setSelectedProducts(booking.products || []);
          }
        } else {
          setForm(prev => ({ ...prev, customer_id: cust.id, customer_name: cust.name }));
        }
      } catch (err) {
        console.error('Failed to init edit form', err);
      }
    };

    init();
  }, [bookingId]);

  // When warehouse changes, auto-populate address
  const handleWarehouseChange = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    setForm(prev => ({
      ...prev,
      pickup_warehouse_id: warehouseId,
      warehouse_address_name: warehouse ? warehouse.contact_address || '' : ''
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.pickup_warehouse_id) newErrors.pickup_warehouse_id = 'Pickup warehouse is required';
    if (!form.ship_to_address_id) newErrors.ship_to_address_id = 'Ship To address is required';
    if (!form.bill_to_same_as_ship_to && !form.bill_to_address_id) {
      newErrors.bill_to_address_id = 'Bill To address is required';
    }

    if (!form.use_sellers_truck) {
      if (!form.truck_type) newErrors.truck_type = 'Truck type is required';
      if (!form.truck_number_plate) newErrors.truck_number_plate = 'Number plate is required';
      if (!form.transporter_name) newErrors.transporter_name = 'Transporter name is required';
      if (!form.driver_name) newErrors.driver_name = 'Driver name is required';
      if (!form.driver_contact) newErrors.driver_contact = 'Driver contact is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Find the first section with an error and scroll to it if needed
      return false;
    }
    return true;
  };

  const handleProceed = () => {
    if (isViewMode) {
      const target = `/bookings/view/${bookingId}/step2`;
      navigate(target, { 
        state: { 
          step1Data: { ...form, id: bookingId }, 
          selectedProducts: selectedProducts 
        } 
      });
      return;
    }
    if (validate()) {
      // Proceed to Step 2
      const target = bookingId ? `/bookings/edit/${bookingId}/step2` : '/bookings/new/step2';
      navigate(target, { 
        state: { 
          step1Data: { ...form, id: bookingId }, 
          selectedProducts: selectedProducts 
        } 
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <p className="text-[13px] font-semibold text-text-secondary mt-0.5">Step 1: Logistics & Details</p>
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
        <Accordion title="Pickup Details" defaultExpanded={true}>
          <div className="flex flex-col gap-5 pb-2">
            <Select 
              label="Pickup Warehouse *"
              placeholder="Select Warehouse"
              value={form.pickup_warehouse_id || ''}
              onChange={(e) => handleWarehouseChange(Number(e.target.value))}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              disabled={isViewMode}
              error={errors.pickup_warehouse_id}
            />

            <Input 
              label="Warehouse Address"
              value={form.warehouse_address_name}
              readOnly
              disabled
              placeholder="Auto-populated from warehouse"
              className="bg-slate-100 text-slate-500"
            />
          </div>
        </Accordion>

        {/* Section 2: Delivery Details */}
        <Accordion title="Delivery Details" defaultExpanded={true}>
          <div className="flex flex-col gap-5 pb-2">
            <Input 
              label="Customer"
              value={form.customer_name}
              readOnly
              disabled
              className="bg-slate-100 text-slate-500"
            />

            <Select 
              label="Ship To Address *"
              placeholder="Select Delivery Address"
              value={form.ship_to_address_id || ''}
              onChange={(e) => setForm(prev => ({ ...prev, ship_to_address_id: Number(e.target.value) }))}
              options={addresses.map(a => ({ value: a.id, label: a.name }))}
              error={errors.ship_to_address_id}
              disabled={isViewMode}
            />

            <Toggle 
              label="Bill To Same as Ship To"
              checked={form.bill_to_same_as_ship_to}
              onChange={(checked) => setForm(prev => ({ 
                ...prev, 
                bill_to_same_as_ship_to: checked,
                bill_to_address_id: checked ? null : prev.bill_to_address_id 
              }))}
              disabled={isViewMode}
            />

            {!form.bill_to_same_as_ship_to && (
              <Select 
                label="Bill To Address *"
                placeholder="Select Billing Address"
                value={form.bill_to_address_id || ''}
                onChange={(e) => setForm(prev => ({ ...prev, bill_to_address_id: Number(e.target.value) }))}
                options={addresses.map(a => ({ value: a.id, label: a.name }))}
                error={errors.bill_to_address_id}
                disabled={isViewMode}
              />
            )}
          </div>
        </Accordion>

        {/* Use Seller's Truck Toggle */}
        <Toggle 
          label="Use Seller's Truck"
          description="If enabled, you do not need to provide truck details."
          checked={form.use_sellers_truck}
          onChange={(checked) => setForm(prev => ({ ...prev, use_sellers_truck: checked }))}
          disabled={isViewMode}
        />

        {/* Section 3 & 4 conditionally rendered */}
        <div className={`flex flex-col gap-6 transition-all duration-500 ease-in-out ${form.use_sellers_truck ? 'opacity-50 pointer-events-none hidden' : 'opacity-100'}`}>
          <Accordion title="Truck Details" defaultExpanded={!form.use_sellers_truck}>
            <div className="flex flex-col gap-5 pb-2">
              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Truck Type *"
                  placeholder="Select Type"
                  value={form.truck_type}
                  onChange={(e) => setForm(prev => ({ ...prev, truck_type: e.target.value }))}
                  options={[
                    { value: 'open_body_16t', label: 'Open Body 16T' },
                    { value: '20ft_container', label: '20 Ft Container' },
                    { value: '40ft_container', label: '40 Ft Container' }
                  ]}
                  error={errors.truck_type}
                  disabled={isViewMode}
                />
                
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-semibold text-text-primary">
                    Capacity (Ton)
                  </label>
                  <input
                    type="number"
                    value={form.truck_capacity || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, truck_capacity: Number(e.target.value) }))}
                    className="h-[48px] rounded-[12px] bg-slate-50 px-4 border border-slate-200 focus:border-primary outline-none transition-colors w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="e.g. 16"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <Input 
                label="Number Plate *"
                placeholder="e.g. MH-12-AB-1234"
                value={form.truck_number_plate}
                onChange={(e) => setForm(prev => ({ ...prev, truck_number_plate: e.target.value }))}
                error={errors.truck_number_plate}
                disabled={isViewMode}
              />

              <Input 
                label="Transporter Name *"
                placeholder="Enter transporter name"
                value={form.transporter_name}
                onChange={(e) => setForm(prev => ({ ...prev, transporter_name: e.target.value }))}
                error={errors.transporter_name}
                disabled={isViewMode}
              />

              <Input 
                label="Transporter Contact"
                type="tel"
                placeholder="Enter contact number"
                value={form.transporter_contact}
                onChange={(e) => setForm(prev => ({ ...prev, transporter_contact: e.target.value }))}
                disabled={isViewMode}
              />
            </div>
          </Accordion>

          <Accordion title="Driver Details" defaultExpanded={!form.use_sellers_truck}>
            <div className="flex flex-col gap-5 pb-2">
              <Input 
                label="Driver Name *"
                placeholder="Enter driver name"
                value={form.driver_name}
                onChange={(e) => setForm(prev => ({ ...prev, driver_name: e.target.value }))}
                error={errors.driver_name}
                disabled={isViewMode}
              />

              <Input 
                label="Driver Contact *"
                type="tel"
                placeholder="Enter phone number"
                value={form.driver_contact}
                onChange={(e) => setForm(prev => ({ ...prev, driver_contact: e.target.value }))}
                error={errors.driver_contact}
                disabled={isViewMode}
              />

              <Input 
                label="License Number"
                placeholder="Enter license number"
                value={form.driver_license_number}
                onChange={(e) => setForm(prev => ({ ...prev, driver_license_number: e.target.value }))}
                disabled={isViewMode}
              />
            </div>
          </Accordion>
        </div>

      </main>

      {/* Fixed Bottom Submit Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-900/5 p-4 z-50">
        <div className="max-w-[800px] mx-auto">
          <button 
            type="button"
            onClick={handleProceed}
            className="w-full py-3.5 px-4 rounded-[16px] font-bold text-[15px] bg-primary text-white shadow-[0_4px_16px_rgba(10,46,99,0.2)] hover:shadow-[0_4px_20px_rgba(10,46,99,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isViewMode ? 'View DIA Details' : 'Proceed to DIA Details'}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
