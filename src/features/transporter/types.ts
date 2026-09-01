export type QuoteStatus = 'pending_quote' | 'pending' | 'accepted' | 'rejected';

export type PricingBase = 'per_ton' | 'per_truck';

export interface ProposedTruckDetail {
  id: string;
  vehicle_type: string;
  capacity_tons: number | string;
  pricing_base?: PricingBase;
  proposed_rate?: number | string;
  truck_number_plate?: string;
  driver_name?: string;
  driver_contact?: string;
  driver_license_number?: string;
}

export interface QuoteItem {
  id: number | string;
  quote_no: string;
  created_date: string;
  from_location: string;
  to_location: string;
  materials_requested: string;
  asking_rate: string;
  trucks_required: number;
  
  // Completed/Quoted fields
  status: QuoteStatus;
  state_label?: string;
  available_trucks?: number;
  pricing_base?: PricingBase;
  proposed_rate?: string;
  trucks_sent?: string;
  truck_details?: ProposedTruckDetail[];
  drivers_assigned?: boolean;
  rejected_reason?: string;
}

export interface SubmitQuotePayload {
  quote_id: number | string;
  available_trucks: number;
  truck_details: ProposedTruckDetail[];
  proposed_rate?: string;
}

export interface SubmitDriverDetailsPayload {
  quote_id: number | string;
  truck_details: ProposedTruckDetail[];
}

export interface TransporterLoadingTruck {
  id: number;
  truck_type_id?: number;
  truck_type: string;
  truck_number_plate: string;
  driver_name: string;
  state: string; // 'loading'
  is_bilty_submitted: boolean;
  pickup_location_id?: number;
  pickup_location_name: string;
  delivery_address_id?: number;
  delivery_address_name: string;
}

export interface SubmitBiltyPayload {
  truck_line_id: number;
  bilty_document: string; // Base64 or File
  bilty_document_name?: string;
}
