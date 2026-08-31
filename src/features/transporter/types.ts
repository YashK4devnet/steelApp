export type QuoteStatus = 'pending_quote' | 'pending' | 'accepted' | 'rejected';

export type PricingBase = 'per_ton' | 'per_truck';

export interface ProposedTruckDetail {
  id: string;
  vehicle_type: string;
  capacity_tons: number | string;
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
  rejected_reason?: string;
}

export interface SubmitQuotePayload {
  quote_id: number | string;
  available_trucks: number;
  truck_details: ProposedTruckDetail[];
  pricing_base?: PricingBase;
  proposed_rate: string;
}
