export interface POProductLine {
  id: string;
  material_type: string;
  description: string;
  booked_qty: number;
  uom: string;
  unit_price: number;
  taxes: string;
  amount: number;
}

export interface POApprovalItem {
  id: string;
  po_number: string;
  created_date: string;
  vendor_name: string;
  created_by: string;
  total_amount?: string;
  department?: string;
}

export interface POApprovalDetail extends POApprovalItem {
  products: POProductLine[];
  subtotal: number;
  total_tax: number;
  grand_total: number;
  payment_terms?: string;
  delivery_warehouse?: string;
}
