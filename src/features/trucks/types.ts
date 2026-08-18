export interface LoadedTruck {
  id: number;
  truck_type_id: number;
  truck_type: string;
  truck_number_plate: string;
  driver_name: string;
  is_reported: boolean;
  state: string;
  delivery_address_id: number;
  delivery_address_name: string;
}

export interface OutgoingTruck {
  id: number;
  truck_type_id: number;
  truck_type: string;
  truck_number_plate: string;
  driver_name: string;
  is_reported: boolean;
  state: string;
  delivery_address_id: number;
  delivery_address_name: string;
}

export interface LoadingTruck {
  id: number;
  truck_type_id: number;
  truck_type: string;
  truck_number_plate: string;
  driver_name: string;
  state: string;
  is_submitted?: boolean;
  pickup_location_id: number;
  pickup_location_name: string;
  delivery_address_id: number;
  delivery_address_name: string;
}

export interface VendorBillFormState {
  truck_line_id: number;
  bill_number: string;
  bill_date: string;
  bill_document: File | null;
  bill_document_name: string;
  eway_bill_attached_with_bill: boolean;
  eway_bill_number: string;
  eway_bill_document: File | null;
  eway_bill_document_name: string;
}

export interface SubmitVendorBillPayload {
  truck_line_id: number;
  bill_number: string;
  bill_date: string;
  bill_document: string;
  bill_document_name: string;
  eway_bill_attached_with_bill: boolean;
  eway_bill_number?: string;
  eway_bill_document?: string;
  eway_bill_document_name?: string;
}
