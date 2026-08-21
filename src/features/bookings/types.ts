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

export interface Booking {
  id: number;
  reference: string;
  created_date: string;
  customer_name: string;
  pickup_warehouse_name: string;
  is_truck_loaded: boolean; // Flag to determine read-only mode
  status?: 'Pending' | 'Cancelled' | 'Loaded';
}

export interface CreateBookingFormState {
  // Pickup Section
  pickup_warehouse_id: number | null;
  warehouse_address_name: string; // purely for display in read-only field

  // Delivery Section
  customer_id: number | null;
  customer_name: string; // purely for display
  ship_to_address_id: number | null;
  bill_to_same_as_ship_to: boolean;
  bill_to_address_id: number | null;

  // Truck / Driver Toggle
  use_sellers_truck: boolean;

  // Truck Details
  truck_type: string;
  truck_number_plate: string;
  truck_capacity: number | null;
  transporter_name: string;
  transporter_contact: string;

  // Driver Details
  driver_name: string;
  driver_contact: string;
  driver_license_number: string;
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
  dia?: string;           // '8' | '10' | '12' | '16' | '20' | '25' | 'CUTTING'
  shape?: string;         // 'U' | 'STRAIGHT'
  weight_option?: string; // 'SUPER LIGHT' | 'LIGHT' | 'BIS'
  
  // Order Type Choice
  order_type?: 'weight' | 'bundle';
  
  // Normal Product Fields
  weight?: number;
  uom?: string;
  quantity?: number;
  
  // Bundle Fields
  selected_bundle_id?: number;
  bundle_quantity?: number;
  
  // Derived Fields
  calculated_weight?: number;
}
