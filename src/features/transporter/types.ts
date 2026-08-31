export type QuoteStatus = 'pending_quote' | 'pending' | 'accepted' | 'rejected';

export interface QuoteItem {
  id: number | string;
  quote_no: string;
  created_date: string;
  from_location: string;
  to_location: string;
  materials_requested: string;
  asking_rate: string;
  
  // Completed/Quoted fields
  status: QuoteStatus;
  state_label?: string;
  proposed_rate?: string;
  trucks_sent?: string;
  rejected_reason?: string;
}
