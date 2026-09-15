export interface TBApproverQuotation {
  id: number;
  booking_number: string;
  transporter_id: number;
  transporter_name: string;
  transporter_address?: string;
  transporter_phone?: string;
  pickup_location_id: number;
  pickup_location_name: string;
  pickup_location_code: string;
  delivery_address_id: number;
  delivery_address_name: string;
  delivery_address_code: string;
  requested_truck_type_id: number | false;
  requested_truck_type: string;
  by_truck: boolean;
  asking_rate: number;
  requested_truck_count: number;
  proposed_truck_count: number;
  approved_truck_count: number;
  state: string;
}

export interface TBApproverQuotationsResponse {
  status: string;
  count: number;
  quotations: TBApproverQuotation[];
}

export interface TBApproverTruckLine {
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

export interface TBApproverQuotationDetail extends TBApproverQuotation {
  truck_lines: TBApproverTruckLine[];
}

export interface TBApproverQuotationDetailResponse {
  status: string;
  quotation: TBApproverQuotationDetail;
}
