export type BookingStatus = 'Pending' | 'Loaded' | 'Cancelled';

export interface Address {
  id: number;
  name: string;
}

export interface PickupCompany {
  id: number;
  name: string;
}

export interface Warehouse {
  id: number;
  name: string;
  contact_address?: string;
}

export interface Customer {
  id: number;
  name: string;
}

export interface UOM {
  id: number;
  name: string;
}

export interface TruckType {
  id: number;
  name: string;
}

export interface DIABundle {
  id: number;
  name: string;
  items: string[];
  preset_weight_kg: number;
}

export interface DIAProduct {
  id: number;
  name: string;
  image?: string;
  dia_shape: string;
  dia_weight_type: string;
  has_bundles: boolean;
  bundles?: DIABundle[];
  uom_options?: string[];
}

export interface SelectedProduct {
  local_id: string;
  product: DIAProduct;
  
  // Configurations
  dia?: string;
  shape?: string;
  weight_option?: string;
  
  // Order Type Choice
  order_type?: 'weight' | 'bundle';
  
  // Normal Product Fields
  weight?: number;
  uom?: string;
  uom_id?: number;
  quantity?: number;
  
  // Bundle Fields
  selected_bundle_id?: number;
  bundle_quantity?: number;
  
  // Derived Fields
  calculated_weight?: number;
}

export interface Booking {
  id: number;
  reference: string;
  created_date: string;
  customer_name: string;
  pickup_warehouse_name: string;
  is_truck_loaded: boolean;
  status?: BookingStatus;
  products?: SelectedProduct[];
}

export interface CreateBookingFormState {
  // Pickup Section
  pickup_warehouse_id: number | null;
  warehouse_address_name: string;

  // Delivery Section
  customer_id: number | null;
  customer_name: string;
  ship_to_address_id: number | null;
  bill_to_same_as_ship_to: boolean;
  bill_to_address_id: number | null;

  // Truck / Driver Toggle
  use_sellers_truck: boolean;

  // Truck Details
  is_new_truck_type?: boolean;
  truck_type: string;
  truck_type_id?: number | null;
  truck_number_plate: string;
  truck_capacity: number | null;
  transporter_name: string;
  transporter_contact: string;

  // Driver Details
  driver_name: string;
  driver_contact: string;
  driver_license_number: string;
}

export interface SaveBookingPayload extends CreateBookingFormState {
  id?: number | null;
  products: SelectedProduct[];
}

export interface Step1LocationState {
  step1Data?: CreateBookingFormState & { id?: number | null };
  selectedProducts?: SelectedProduct[];
}
