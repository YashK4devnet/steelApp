import type { QuoteItem } from '../types';
import { apiRequest } from '../../../lib/api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_QUOTES: QuoteItem[] = [
  // 1. Pending to be Quoted Requests
  {
    id: 1,
    quote_no: 'QT-REQ-2026-0101',
    created_date: '2026-08-31',
    from_location: 'Guwahati Main Plant (Warehouse A)',
    to_location: 'Shillong Bypass Construction Site',
    materials_requested: 'TMT Bars 12mm & 16mm (28 Tons)',
    asking_rate: '₹2,400 / Ton',
    status: 'pending_quote',
    state_label: 'Pending Quote',
  },
  {
    id: 2,
    quote_no: 'QT-REQ-2026-0102',
    created_date: '2026-08-30',
    from_location: 'Bongaigaon Logistics Depot',
    to_location: 'Tezpur Central Warehouse',
    materials_requested: 'Construction Steel Sections (18 Tons)',
    asking_rate: '₹2,850 / Ton',
    status: 'pending_quote',
    state_label: 'Pending Quote',
  },
  {
    id: 3,
    quote_no: 'QT-REQ-2026-0103',
    created_date: '2026-08-29',
    from_location: 'Silchar Storage Yard',
    to_location: 'Agartala Infrastructure Project',
    materials_requested: 'TMT 20mm & 25mm (32 Tons)',
    asking_rate: '₹3,100 / Ton',
    status: 'pending_quote',
    state_label: 'Pending Quote',
  },

  // 2. Already Quoted Requests
  {
    id: 4,
    quote_no: 'QT-2026-0089',
    created_date: '2026-08-28',
    from_location: 'Guwahati Warehouse B',
    to_location: 'Jorhat Flyover Site Delivery',
    materials_requested: 'TMT 16mm (25 Tons)',
    asking_rate: '₹2,500 / Ton',
    proposed_rate: '₹2,450 / Ton',
    trucks_sent: '2 Trucks (AS-01-EA-2345, AS-01-EA-6789)',
    status: 'accepted',
    state_label: 'Accepted',
  },
  {
    id: 5,
    quote_no: 'QT-2026-0082',
    created_date: '2026-08-27',
    from_location: 'Dibrugarh Hub',
    to_location: 'Tinsukia Industrial Yard',
    materials_requested: 'TMT 10mm (15 Tons)',
    asking_rate: '₹2,100 / Ton',
    proposed_rate: '₹2,200 / Ton',
    trucks_sent: '1 Truck (NL-02-X-9012)',
    status: 'pending',
    state_label: 'Pending Approval',
  },
  {
    id: 6,
    quote_no: 'QT-2026-0074',
    created_date: '2026-08-25',
    from_location: 'Guwahati Main Plant',
    to_location: 'Dimapur Steel Depot',
    materials_requested: 'Heavy Structurals (40 Tons)',
    asking_rate: '₹3,500 / Ton',
    proposed_rate: '₹3,800 / Ton',
    trucks_sent: '0 Trucks (Not Assigned)',
    status: 'rejected',
    state_label: 'Rejected',
    rejected_reason: 'Proposed rate exceeded client maximum budget ceiling.',
  },
];

export async function getQuotes(): Promise<QuoteItem[]> {
  try {
    const res = await apiRequest<{ status: string; quotes?: QuoteItem[] }>('GET', '/booking/transporter/quotes');
    if (res && res.status === 'success' && Array.isArray(res.quotes)) {
      return res.quotes;
    }
  } catch {
    // Fallback to mock data for development
  }
  await delay(250);
  return MOCK_QUOTES;
}
