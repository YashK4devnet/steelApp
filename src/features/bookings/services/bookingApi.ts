import { 
  type Booking, 
  type PickupCompany, 
  type Warehouse, 
  type Address, 
  type Customer, 
  type DIAProduct,
  type SaveBookingPayload,
  type UOM,
  type TruckType,
  type ShapeOption,
  type WeightTypeOption
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
  status?: typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
}

export async function syncMasterData(): Promise<void> {
  try {
    const res = await apiRequest<Record<string, unknown>>('GET', '/booking/customer/master-data');
    if (res && res.status === 'success') {
      localStorage.setItem('masterData', JSON.stringify(res));
    }
  } catch (error) {
    console.error('Failed to sync customer master data:', error);
  }
}

let mockBookings: StoredBooking[] = [
  {
    id: 1,
    reference: 'BKG-2026-0001',
    created_date: '2026-08-20',
    customer_name: 'Acme Corp',
    pickup_company_name: 'Main Warehouse',
    is_truck_loaded: true,
    status: BOOKING_STATUS.LOADED,
    pickup_warehouse_id: 1,
    warehouse_address_name: 'Main Warehouse, 123 Industrial Area, Bangalore 560001',
    customer_id: 40,
    ship_to_address_id: 40,
    bill_to_same_as_ship_to: true,
    bill_to_address_id: 40,
    use_sellers_truck: false,
    truck_type: '20 Ft Container',
    truck_type_id: 7,
    truck_number_plate: 'KA-01-AB-1234',
    truck_capacity: 16.5,
    transporter_name: 'ABC Transport',
    transporter_contact: '+91 98765 43210',
    driver_name: 'Rajesh Kumar',
    driver_contact: '+91 91234 56789',
    driver_license_number: 'DL-1234567890',
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
        weight: 1500,
        uom: 'KG'
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

export async function getUOMs(): Promise<UOM[]> {
  await delay(200);
  const data = localStorage.getItem('masterData');
  if (data) {
    const parsed = JSON.parse(data);
    if (parsed.uoms && parsed.uoms.length > 0) {
      return parsed.uoms;
    }
  }
  return [
    { id: 1, name: 'kg' },
    { id: 3, name: 't' },
  ];
}

export async function getTruckTypes(): Promise<TruckType[]> {
  await delay(200);
  const data = localStorage.getItem('masterData');
  if (data) {
    const parsed = JSON.parse(data);
    if (parsed.truck_types && parsed.truck_types.length > 0) {
      return parsed.truck_types;
    }
  }
  return [
    { id: 1, name: '10-Wheeler' },
    { id: 2, name: 'Trailer' },
    { id: 3, name: '20 Ft Container' },
    { id: 4, name: '40 Ft Container' },
  ];
}

export async function getShapesAndWeightTypes(): Promise<{ shapes: ShapeOption[]; weight_types: WeightTypeOption[] }> {
  try {
    const res = await apiRequest<{ status: string; shapes: ShapeOption[]; weight_types: WeightTypeOption[] }>(
      'GET',
      '/booking/customer/shapes-weight-types'
    );
    if (res && res.status === 'success') {
      return {
        shapes: res.shapes || [],
        weight_types: res.weight_types || [],
      };
    }
  } catch (err) {
    console.error('Failed to fetch shapes and weight types:', err);
  }

  return {
    shapes: [
      { id: 1, name: 'Round' },
      { id: 2, name: 'Straight' },
      { id: 3, name: 'U' },
    ],
    weight_types: [
      { id: 1, name: 'Super Light', code: 'SL' },
      { id: 2, name: 'Light', code: 'L' },
      { id: 3, name: 'Standard', code: 'S' },
      { id: 4, name: 'BIS', code: 'BIS' },
    ],
  };
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

export async function saveBooking(payload: SaveBookingPayload): Promise<{ success: boolean; reference: string; truck_id?: number }> {
  const isNewTruckType = !!payload.is_new_truck_type;

  const dia_details = (payload.products || []).map((p) => {
    const isBundle = p.order_type === 'bundle';
    const rawDia = p.dia || '12';
    const diaText = rawDia.toLowerCase().endsWith('mm') ? rawDia : `${rawDia}mm`;

    return {
      dia: diaText,
      shape_id: p.shape_id || 1,
      weight_type_id: p.weight_type_id || 3,
      uom_id: p.uom_id || 1,
      qty_selection: isBundle ? ('by_bundle' as const) : ('by_weight' as const),
      ...(isBundle ? { bundle_qty: p.bundle_quantity || 1 } : { weight: p.weight || 0 }),
    };
  });

  const apiPayload = {
    warehouse_id: payload.pickup_warehouse_id,
    ship_to_address_id: payload.ship_to_address_id,
    is_same_as_ship_to: payload.bill_to_same_as_ship_to,
    bill_to_address_id: payload.bill_to_same_as_ship_to ? undefined : payload.bill_to_address_id,
    truck_number_plate: payload.truck_number_plate,
    truck_capacity_ton: payload.truck_capacity || 0,
    transporter_name: payload.transporter_name || undefined,
    transporter_contact: payload.transporter_contact || undefined,
    is_new_truck_type: isNewTruckType,
    truck_type_id: isNewTruckType ? undefined : payload.truck_type_id,
    truck_type: isNewTruckType ? payload.truck_type : undefined,
    driver_name: payload.driver_name,
    driver_contact: payload.driver_contact,
    driver_licence_number: payload.driver_license_number || undefined,
    dia_details,
  };

  try {
    const res = await apiRequest<{ status: string; message?: string; truck_id?: number; state?: string }>(
      'POST',
      '/booking/customer/truck-request',
      apiPayload
    );

    const { id: _ignoredId, ...restPayload } = payload;
    const id = res.truck_id || (mockBookings.length + 1);
    const reference = `TRK-${new Date().getFullYear()}-${id.toString().padStart(4, '0')}`;

    const newBooking: StoredBooking = {
      ...restPayload,
      id,
      reference,
      created_date: new Date().toISOString().split('T')[0],
      customer_name: payload.customer_name || 'Customer',
      pickup_company_name: 'Warehouse',
      is_truck_loaded: false,
      status: BOOKING_STATUS.PENDING
    };

    mockBookings.unshift(newBooking);

    return {
      success: true,
      reference,
      truck_id: res.truck_id
    };
  } catch (error) {
    console.error('Failed to submit truck request to server:', error);
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

    mockBookings.unshift(newBooking);

    return {
      success: true,
      reference
    };
  }
}

export async function updateBooking(id: number, payload: SaveBookingPayload): Promise<{ success: boolean }> {
  await delay(1000);
  const index = mockBookings.findIndex(b => b.id === id);
  if (index !== -1) {
    const { id: _payloadId, ...restPayload } = payload;
    mockBookings[index] = {
      ...mockBookings[index],
      ...restPayload,
      id
    };
    return { success: true };
  }
  return { success: false };
}

export async function cancelBooking(id: number): Promise<{ success: boolean }> {
  await delay(600);
  const index = mockBookings.findIndex(b => b.id === id);
  if (index !== -1) {
    mockBookings[index].status = BOOKING_STATUS.CANCELLED;
    return { success: true };
  }
  return { success: false };
}
