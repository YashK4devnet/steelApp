import { 
  type Booking, 
  type PickupCompany, 
  type Warehouse, 
  type Address, 
  type Customer, 
  type DIAProduct,
  type SaveBookingPayload 
} from '../types';
import { BOOKING_STATUS } from '../constants';
import { apiRequest } from '../../../lib/api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface StoredBooking extends SaveBookingPayload {
  id: number;
  reference: string;
  created_date: string;
  customer_name: string;
  pickup_company_name: string;
  is_truck_loaded: boolean;
  status: typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
}

const mockBookings: StoredBooking[] = [
  {
    id: 1,
    reference: 'BKG-2026-0001',
    created_date: '2026-08-20',
    customer_name: 'Acme Corp',
    pickup_company_name: 'Logistics Hub A',
    is_truck_loaded: true,
    status: BOOKING_STATUS.LOADED,
    pickup_warehouse_id: 201,
    warehouse_address_name: '123 Alpha St, Cityville',
    customer_id: 901,
    ship_to_address_id: 401,
    bill_to_same_as_ship_to: true,
    bill_to_address_id: 401,
    use_sellers_truck: true,
    truck_type: '',
    truck_number_plate: '',
    truck_capacity: null,
    transporter_name: '',
    transporter_contact: '',
    driver_name: '',
    driver_contact: '',
    driver_license_number: '',
    products: [
      {
        local_id: 'prod-1',
        product: {
          id: 1,
          name: 'TMT Bar',
          dia_shape: 'Round',
          dia_weight_type: 'Actual',
          has_bundles: true,
          bundles: [
            { id: 101, name: 'Standard Bundle (1T)', items: ['Standard bundle x1'], preset_weight_kg: 1000 },
            { id: 102, name: 'Heavy Bundle (2T)', items: ['Heavy bundle x1'], preset_weight_kg: 2000 },
          ],
        },
        dia: '12',
        shape: 'U',
        weight_option: 'BIS',
        order_type: 'weight',
        weight: 15,
        uom: 'TON'
      },
      {
        local_id: 'prod-2',
        product: {
          id: 2,
          name: 'Construction Steel',
          dia_shape: 'Section',
          dia_weight_type: 'Theoretical',
          has_bundles: true,
          bundles: [
            { id: 201, name: 'Standard Bundle (1T)', items: ['Standard bundle x1'], preset_weight_kg: 1000 },
            { id: 202, name: 'Heavy Bundle (2T)', items: ['Heavy bundle x1'], preset_weight_kg: 2000 },
          ],
        },
        dia: '16',
        shape: 'STRAIGHT',
        weight_option: 'LIGHT',
        order_type: 'bundle',
        selected_bundle_id: 201,
        bundle_quantity: 3,
        calculated_weight: 3000
      }
    ]
  },
  {
    id: 2,
    reference: 'BKG-2026-0002',
    created_date: '2026-08-21',
    customer_name: 'Acme Corp',
    pickup_company_name: 'FastFreight LLC',
    is_truck_loaded: false,
    status: BOOKING_STATUS.PENDING,
    pickup_warehouse_id: 203,
    warehouse_address_name: '789 North Ave, Metropolis',
    customer_id: 901,
    ship_to_address_id: 402,
    bill_to_same_as_ship_to: false,
    bill_to_address_id: 403,
    use_sellers_truck: false,
    truck_type: '10-Wheeler',
    truck_number_plate: 'MH-12-PQ-9999',
    truck_capacity: 25,
    transporter_name: 'Gati Logistics',
    transporter_contact: '9876543210',
    driver_name: 'Ramesh Singh',
    driver_contact: '9123456780',
    driver_license_number: 'DL-2024-0099887',
    products: [
      {
        local_id: 'prod-3',
        product: {
          id: 1,
          name: 'TMT Bar',
          dia_shape: 'Round',
          dia_weight_type: 'Actual',
          has_bundles: true,
          bundles: [
            { id: 101, name: 'Standard Bundle (1T)', items: ['Standard bundle x1'], preset_weight_kg: 1000 },
            { id: 102, name: 'Heavy Bundle (2T)', items: ['Heavy bundle x1'], preset_weight_kg: 2000 },
          ],
        },
        dia: '10',
        shape: 'U',
        weight_option: 'SUPER LIGHT',
        order_type: 'weight',
        weight: 500,
        uom: 'KG'
      },
      {
        local_id: 'prod-4',
        product: {
          id: 2,
          name: 'Construction Steel',
          dia_shape: 'Section',
          dia_weight_type: 'Theoretical',
          has_bundles: true,
          bundles: [
            { id: 201, name: 'Standard Bundle (1T)', items: ['Standard bundle x1'], preset_weight_kg: 1000 },
            { id: 202, name: 'Heavy Bundle (2T)', items: ['Heavy bundle x1'], preset_weight_kg: 2000 },
          ],
        },
        dia: '20',
        shape: 'STRAIGHT',
        weight_option: 'BIS',
        order_type: 'bundle',
        selected_bundle_id: 202,
        bundle_quantity: 5,
        calculated_weight: 10000
      }
    ]
  }
];

export async function getBookings(): Promise<Booking[]> {
  await delay(600);
  return mockBookings.map(b => ({
    id: b.id,
    reference: b.reference,
    created_date: b.created_date,
    customer_name: b.customer_name,
    pickup_warehouse_name: b.pickup_company_name,
    is_truck_loaded: b.is_truck_loaded,
    status: b.status,
    products: b.products,
  }));
}

export async function getPickupCompanies(): Promise<PickupCompany[]> {
  await delay(400);
  return [
    { id: 101, name: 'Logistics Hub A' },
    { id: 102, name: 'FastFreight LLC' },
    { id: 103, name: 'Global Movers Inc.' },
  ];
}

export async function getWarehouses(): Promise<Warehouse[]> {
  await delay(200);
  const data = localStorage.getItem('masterData');
  if (data) {
    const parsed = JSON.parse(data);
    return parsed.warehouses || [];
  }
  return [];
}

export async function getCustomerDetails(): Promise<Customer> {
  await delay(200);
  const data = localStorage.getItem('masterData');
  if (data) {
    const parsed = JSON.parse(data);
    return { id: parsed.customer_id, name: parsed.customer_name };
  }
  return {
    id: 901,
    name: 'Current Authenticated User (Customer)',
  };
}

export async function getCustomerAddresses(type: 'ship' | 'bill'): Promise<Address[]> {
  await delay(200);
  const data = localStorage.getItem('masterData');
  if (data) {
    const parsed = JSON.parse(data);
    const addresses = type === 'ship' ? parsed.ship_to_addresses : parsed.bill_to_addresses;
    return (addresses || []).map((a: { id: number; contact_address: string }) => ({ id: a.id, name: a.contact_address }));
  }
  return [];
}

const mockProducts: DIAProduct[] = [
  {
    id: 1,
    name: 'TMT Bar',
    dia_shape: 'Round',
    dia_weight_type: 'Actual',
    has_bundles: true,
    bundles: [
      { id: 101, name: 'Standard Bundle (1T)', items: ['Standard bundle x1'], preset_weight_kg: 1000 },
      { id: 102, name: 'Heavy Bundle (2T)', items: ['Heavy bundle x1'], preset_weight_kg: 2000 },
    ],
    uom_options: ['TON', 'KG'],
  },
  {
    id: 2,
    name: 'Construction Steel',
    dia_shape: 'Section',
    dia_weight_type: 'Theoretical',
    has_bundles: true,
    bundles: [
      { id: 201, name: 'Standard Bundle (1T)', items: ['Standard bundle x1'], preset_weight_kg: 1000 },
      { id: 202, name: 'Heavy Bundle (2T)', items: ['Heavy bundle x1'], preset_weight_kg: 2000 },
    ],
    uom_options: ['TON', 'KG'],
  }
];

export async function searchDIAProducts(query: string): Promise<DIAProduct[]> {
  await delay(500);
  if (!query.trim()) return mockProducts;
  
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) || 
    p.dia_shape.toLowerCase().includes(lowerQuery)
  );
}

export async function getBookingById(id: number): Promise<StoredBooking | null> {
  await delay(400);
  const booking = mockBookings.find(b => b.id === id);
  return booking ? JSON.parse(JSON.stringify(booking)) : null;
}

export async function saveBooking(payload: SaveBookingPayload): Promise<{ success: boolean; reference: string }> {
  await delay(1200);
  
  const { id: _ignoredId, ...restPayload } = payload;
  const id = mockBookings.length + 1;
  const reference = `BKG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  
  const newBooking: StoredBooking = {
    ...restPayload,
    id,
    reference,
    created_date: new Date().toISOString().split('T')[0],
    customer_name: payload.customer_name || 'Acme Corp',
    pickup_company_name: 'Main Warehouse',
    is_truck_loaded: false,
    status: BOOKING_STATUS.PENDING
  };

  mockBookings.push(newBooking);
  
  return {
    success: true,
    reference
  };
}

export async function updateBooking(id: number, payload: SaveBookingPayload): Promise<{ success: boolean }> {
  await delay(1000);
  
  const idx = mockBookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    const { id: _ignoredId, ...restPayload } = payload;
    mockBookings[idx] = {
      ...mockBookings[idx],
      ...restPayload
    };
    return { success: true };
  }
  throw new Error('Booking not found');
}

export async function cancelBooking(id: number): Promise<{ success: boolean }> {
  await delay(800);
  const idx = mockBookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    mockBookings[idx].status = BOOKING_STATUS.CANCELLED;
    mockBookings[idx].is_truck_loaded = true;
    return { success: true };
  }
  throw new Error('Booking not found');
}

export async function syncMasterData(): Promise<void> {
  try {
    const response = await apiRequest<{ status: string }>('GET', '/booking/customer/master-data');
    if (response && response.status === 'success') {
      const currentCache = localStorage.getItem('masterData');
      const newDataStr = JSON.stringify(response);
      
      if (currentCache !== newDataStr) {
        localStorage.setItem('masterData', newDataStr);
      }
    }
  } catch (error) {
    console.error('[Master Data] Sync failed:', error);
  }
}
