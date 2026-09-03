export type QuotationLineState = 'draft' | 'waiting_team_approval' | 'done' | 'partially_cancelled';

export interface TransporterQuotation {
  id: number;
  booking_number: string;
  pickup_location_id: number;
  pickup_location_name: string;
  delivery_address_id: number;
  delivery_address_name: string;
  by_truck: boolean;
  asking_rate: number;
  requested_truck_count: number;
  proposed_truck_count: number;
  approved_truck_count: number;
  state: QuotationLineState | string;
  truck_lines?: TransporterTruckLine[];
}

export interface TransporterTruckLine {
  id: number;
  proposal_rate: number;
  proposed_truck_type_id: number | false;
  proposed_truck_type: string;
  truck_number: string;
  truck_capacity: number;
  driver_name: string;
  driver_contact: string;
  driver_license: string;
  state: string;
  requested_truck_type_name: string;
}

export interface TransporterQuotationDetail extends TransporterQuotation {
  truck_lines: TransporterTruckLine[];
}

export interface ActiveTruckType {
  id: number;
  name: string;
}

export interface TruckQuoteItemPayload {
  truck_line_id: number;
  new_truck_type?: boolean;
  proposed_truck_type_id?: number;
  truck_type_name?: string;
  truck_capacity: number;
  proposal_rate: number;
}

export type SubmitTruckQuotePayload = TruckQuoteItemPayload;

export interface SubmitTruckQuoteBatchPayload {
  quotation_line_id: number;
  available_truck_count: number;
  truck_quotes: TruckQuoteItemPayload[];
}

export interface SubmitTruckQuoteBatchResponse {
  status: string;
  message?: string;
  quotation_line_id: number;
  available_truck_count: number;
  cancelled_truck_line_ids?: number[];
  submitted_trucks?: Array<{
    id: number;
    truck_type_name: string;
    state: string;
  }>;
}

export interface SubmitTruckDriverDetailsPayload {
  truck_line_id: number;
  truck_number: string;
  driver_name: string;
  driver_contact: string;
  driver_license_number: string;
}

export type QuoteStatus = 'pending_quote' | 'pending' | 'accepted' | 'rejected';

export type PricingBase = 'per_ton' | 'per_truck';

export interface ProposedTruckDetail {
  id: string;
  truck_line_id?: number;
  vehicle_type: string;
  proposed_truck_type_id?: number | null;
  is_new_truck_type?: boolean;
  truck_type_name?: string;
  capacity_tons: number | string;
  pricing_base?: PricingBase;
  proposed_rate?: number | string;
  truck_number_plate?: string;
  driver_name?: string;
  driver_contact?: string;
  driver_license_number?: string;
  state?: string;
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
