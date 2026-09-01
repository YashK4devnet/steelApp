import type { QuoteItem, SubmitQuotePayload, SubmitDriverDetailsPayload, TransporterLoadingTruck } from '../types';
import { apiRequest } from '../../../lib/api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let memoryQuotes: QuoteItem[] = [
  // 1. Pending to be Quoted Requests
  {
    id: 1,
    quote_no: 'QT-REQ-2026-0101',
    created_date: '2026-08-31',
    from_location: 'Guwahati Main Plant (Warehouse A)',
    to_location: 'Shillong Bypass Construction Site',
    materials_requested: 'TMT Bars 12mm & 16mm (28 Tons)',
    asking_rate: '₹2,400 / Ton',
    trucks_required: 3,
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
    trucks_required: 2,
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
    trucks_required: 4,
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
    trucks_required: 2,
    available_trucks: 2,
    proposed_rate: '₹2,450 / Ton',
    trucks_sent: '2 Trucks (12 Wheeler, 14 Wheeler)',
    truck_details: [
      { id: 'truck-1', vehicle_type: '12 Wheeler (21-25 MT)', capacity_tons: 25, pricing_base: 'per_ton', proposed_rate: '2450', truck_number_plate: '', driver_name: '', driver_contact: '', driver_license_number: '' },
      { id: 'truck-2', vehicle_type: '14 Wheeler (26-30 MT)', capacity_tons: 30, pricing_base: 'per_ton', proposed_rate: '2450', truck_number_plate: '', driver_name: '', driver_contact: '', driver_license_number: '' },
    ],
    drivers_assigned: false,
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
    trucks_required: 2,
    available_trucks: 1,
    proposed_rate: '₹2,200 / Ton',
    trucks_sent: '1 Truck (10 Wheeler)',
    truck_details: [
      { id: 'truck-1', vehicle_type: '10 Wheeler (16-20 MT)', capacity_tons: 20, pricing_base: 'per_ton', proposed_rate: '2200' },
    ],
    drivers_assigned: false,
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
    trucks_required: 4,
    available_trucks: 0,
    proposed_rate: '₹3,800 / Ton',
    trucks_sent: '0 Trucks (Not Assigned)',
    status: 'rejected',
    state_label: 'Rejected',
    rejected_reason: 'Proposed rate exceeded client maximum budget ceiling.',
  },
];

export async function getQuotes(): Promise<QuoteItem[]> {
  await delay(150);
  return [...memoryQuotes];
}

export async function getQuoteById(id: number | string): Promise<QuoteItem | null> {
  await delay(150);
  const found = memoryQuotes.find((q) => q.id.toString() === id.toString());
  return found ? { ...found } : null;
}

export async function submitQuoteProposal(payload: SubmitQuotePayload): Promise<{ success: boolean; message?: string }> {
  await delay(250);
  let formattedRate = '₹2,450 / Ton';
  if (payload.truck_details && payload.truck_details.length > 0) {
    const rates = payload.truck_details.map((t) => {
      const baseLabel = t.pricing_base === 'per_truck' ? 'Truck' : 'Ton';
      const rateVal = String(t.proposed_rate).startsWith('₹') ? t.proposed_rate : `₹${t.proposed_rate}`;
      return `${rateVal} / ${baseLabel}`;
    });
    // If all trucks have the same rate & base, display one concise rate
    const uniqueRates = Array.from(new Set(rates));
    formattedRate = uniqueRates.join(', ');
  } else if (payload.proposed_rate) {
    formattedRate = payload.proposed_rate.startsWith('₹') ? payload.proposed_rate : `₹${payload.proposed_rate} / Ton`;
  }

  const truckSummary = payload.truck_details.length > 0 
    ? `${payload.truck_details.length} Truck${payload.truck_details.length > 1 ? 's' : ''} (${payload.truck_details.map(t => t.vehicle_type.split(' ')[0] || t.vehicle_type).join(', ')})`
    : `${payload.available_trucks} Trucks`;

  memoryQuotes = memoryQuotes.map((q) => {
    if (q.id.toString() === payload.quote_id.toString()) {
      return {
        ...q,
        status: 'pending',
        state_label: 'Pending Approval',
        available_trucks: payload.available_trucks,
        proposed_rate: formattedRate,
        trucks_sent: truckSummary,
        truck_details: payload.truck_details,
        drivers_assigned: false,
      };
    }
    return q;
  });

  return { success: true };
}

export async function saveQuoteDriverDetails(payload: SubmitDriverDetailsPayload): Promise<{ success: boolean; message?: string }> {
  await delay(250);
  memoryQuotes = memoryQuotes.map((q) => {
    if (q.id.toString() === payload.quote_id.toString()) {
      return {
        ...q,
        truck_details: payload.truck_details,
        drivers_assigned: true,
      };
    }
    return q;
  });

  return { success: true };
}

/**
 * Fetches the logged-in transporter's trucks currently in Loading state.
 * Endpoint: GET /booking/trucks/transporter/loading
 */
export async function getTransporterLoadingTrucks(): Promise<TransporterLoadingTruck[]> {
  const res = await apiRequest<{ status: string; count?: number; trucks: TransporterLoadingTruck[] }>(
    'GET',
    '/booking/trucks/transporter/loading'
  );
  return res.trucks || [];
}

