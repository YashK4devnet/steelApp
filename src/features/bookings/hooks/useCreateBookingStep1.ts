import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { 
  Warehouse, 
  Address, 
  Customer, 
  TruckType,
  CreateBookingFormState, 
  SelectedProduct, 
  Step1LocationState 
} from '../types';
import { 
  getWarehouses, 
  getCustomerDetails, 
  getCustomerAddresses, 
  getTruckTypes,
  getBookingById 
} from '../services/bookingApi';
import { INITIAL_BOOKING_FORM_STATE } from '../constants';

export function useCreateBookingStep1() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const bookingId = id ? Number(id) : null;
  const isViewMode = location.pathname.startsWith('/bookings/view');

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [truckTypes, setTruckTypes] = useState<TruckType[]>([]);
  const [form, setForm] = useState<CreateBookingFormState>(INITIAL_BOOKING_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const init = async () => {
      try {
        const [whs, cust, addrs, tTypes] = await Promise.all([
          getWarehouses(),
          getCustomerDetails(),
          getCustomerAddresses('ship'),
          getTruckTypes(),
        ]);
        setWarehouses(whs);
        setCustomer(cust);
        setAddresses(addrs);
        setTruckTypes(tTypes);

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
              is_new_truck_type: booking.is_new_truck_type || false,
              truck_type: booking.truck_type || '',
              truck_type_id: booking.truck_type_id || null,
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
          setForm((prev) => ({ ...prev, customer_id: cust.id, customer_name: cust.name }));
        }
      } catch (err) {
        console.error('Failed to initialize Step 1 form', err);
      }
    };

    init();
  }, [bookingId]);

  const handleFormChange = (field: keyof CreateBookingFormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleWarehouseChange = (warehouseId: number) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    setForm((prev) => ({
      ...prev,
      pickup_warehouse_id: warehouseId,
      warehouse_address_name: warehouse ? warehouse.contact_address || '' : '',
    }));
    if (errors.pickup_warehouse_id) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.pickup_warehouse_id;
        return next;
      });
    }
  };

  const handleTruckTypeChange = (truckTypeId: number) => {
    const selected = truckTypes.find((t) => t.id === truckTypeId);
    setForm((prev) => ({
      ...prev,
      is_new_truck_type: false,
      truck_type_id: truckTypeId,
      truck_type: selected ? selected.name : prev.truck_type,
    }));
    if (errors.truck_type) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.truck_type;
        return next;
      });
    }
  };

  const handleToggleNewTruckType = (isNew: boolean) => {
    setForm((prev) => ({
      ...prev,
      is_new_truck_type: isNew,
      truck_type: isNew ? '' : prev.truck_type,
      truck_type_id: isNew ? null : prev.truck_type_id,
    }));
    if (errors.truck_type) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.truck_type;
        return next;
      });
    }
  };

  const scrollToField = (fieldName: string) => {
    setTimeout(() => {
      const el =
        document.getElementById(fieldName) ||
        document.querySelector(`[name="${fieldName}"]`) ||
        document.querySelector(`[data-field="${fieldName}"]`);

      if (el) {
        // Offset for safe area + sticky header breathing room
        const headerOffset = 130;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });

        // Focus the input/select element if supported
        if ('focus' in el && typeof (el as HTMLElement).focus === 'function') {
          (el as HTMLElement).focus({ preventScroll: true });
        }
      }
    }, 60);
  };

  const validate = (): { isValid: boolean; firstErrorField: string | null } => {
    const newErrors: Record<string, string> = {};

    if (!form.pickup_warehouse_id) newErrors.pickup_warehouse_id = 'Pickup warehouse is required';
    if (!form.ship_to_address_id) newErrors.ship_to_address_id = 'Ship To address is required';
    if (!form.bill_to_same_as_ship_to && !form.bill_to_address_id) {
      newErrors.bill_to_address_id = 'Bill To address is required';
    }

    if (!form.use_sellers_truck) {
      if (form.is_new_truck_type) {
        if (!form.truck_type || !form.truck_type.trim()) {
          newErrors.truck_type = 'Please enter a custom truck type name';
        }
      } else {
        if (!form.truck_type_id) {
          newErrors.truck_type = 'Please select a truck type';
        }
      }
      if (!form.truck_number_plate) newErrors.truck_number_plate = 'Number plate is required';
      if (!form.transporter_name) newErrors.transporter_name = 'Transporter name is required';
      if (!form.driver_name) newErrors.driver_name = 'Driver name is required';
      if (!form.driver_contact) newErrors.driver_contact = 'Driver contact is required';
    }

    setErrors(newErrors);

    const FIELD_ORDER = [
      'pickup_warehouse_id',
      'ship_to_address_id',
      'bill_to_address_id',
      'truck_type',
      'truck_number_plate',
      'transporter_name',
      'driver_name',
      'driver_contact',
    ];

    const firstError = FIELD_ORDER.find((f) => newErrors[f]) || Object.keys(newErrors)[0] || null;

    return {
      isValid: Object.keys(newErrors).length === 0,
      firstErrorField: firstError,
    };
  };

  const handleProceed = () => {
    if (isViewMode) {
      const target = `/bookings/view/${bookingId}/step2`;
      const navState: Step1LocationState = {
        step1Data: { ...form, id: bookingId },
        selectedProducts,
      };
      navigate(target, { state: navState });
      return;
    }

    const { isValid, firstErrorField } = validate();

    if (isValid) {
      const target = bookingId ? `/bookings/edit/${bookingId}/step2` : '/bookings/new/step2';
      const navState: Step1LocationState = {
        step1Data: { ...form, id: bookingId },
        selectedProducts,
      };
      navigate(target, { state: navState });
    } else if (firstErrorField) {
      scrollToField(firstErrorField);
    }
  };

  return {
    bookingId,
    isViewMode,
    warehouses,
    customer,
    addresses,
    truckTypes,
    form,
    errors,
    handleFormChange,
    handleWarehouseChange,
    handleTruckTypeChange,
    handleToggleNewTruckType,
    handleProceed,
    navigateBack: () => navigate(-1),
  };
}
