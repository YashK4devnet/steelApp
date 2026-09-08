export interface VendorBookingProductLine {
  id: number;
  display_type: false;
  material_type_id: number | false;
  material_type: string;
  description: string;
  booked_quantity: number;
  uom_id: number | false;
  uom: string;
  unit_price: number;
  tax: string;
  amount: number;
}

export interface VendorBookingNoteLine {
  id: number;
  display_type: 'line_note';
  name: string;
}

export type VendorBookingLine = VendorBookingProductLine | VendorBookingNoteLine;

export interface VendorBookingItem {
  id: number;
  name: string; // e.g. "VB/2026/00012"
  booking_date: string; // "YYYY-MM-DD"
  requested_date: string; // "YYYY-MM-DD HH:MM:SS"
  vendor_id: number;
  vendor_name: string;
  vendor_address: string;
  amount_total: number;
  state: string; // "waiting_for_approval"
}

export interface VendorBookingDetail extends VendorBookingItem {
  amount_untaxed: number;
  amount_tax: number;
  total_qty: number;
  remark: string;
  lines: VendorBookingLine[];
}

export interface POApprovalListResponse {
  status: string;
  count: number;
  bookings: VendorBookingItem[];
}

export interface POApprovalDetailResponse {
  status: string;
  booking: VendorBookingDetail;
}

export interface POApprovalPDFResponse {
  status: string;
  booking_id: number;
  filename: string;
  mimetype: string;
  pdf: string;
}

export interface POActionResponse {
  status: string;
  message: string;
  booking_id: number;
  state: string;
  approved_by?: string;
  approved_date?: string;
  rejected_by?: string;
  rejected_date?: string;
  rejection_reason?: string;
}

// Backwards compatibility helper types for UI transitions if needed
export type POApprovalItem = VendorBookingItem;
