import type { SelectedProduct, CreateBookingFormState } from './types';

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  LOADED: 'Loaded',
  CANCELLED: 'Cancelled',
} as const;

export type BookingStatusType = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const DIA_OPTIONS = ['8', '10', '12', '16', '20', '25', 'CUTTING'] as const;
export const SHAPE_OPTIONS = ['U', 'STRAIGHT'] as const;
export const WEIGHT_TYPE_OPTIONS = ['SUPER LIGHT', 'LIGHT', 'BIS'] as const;

export const INITIAL_BOOKING_FORM_STATE: CreateBookingFormState = {
  pickup_warehouse_id: null,
  warehouse_address_name: '',
  customer_id: null,
  customer_name: '',
  ship_to_address_id: null,
  bill_to_same_as_ship_to: true,
  bill_to_address_id: null,
  use_sellers_truck: false,
  is_new_truck_type: false,
  truck_type: '',
  truck_type_id: null,
  truck_number_plate: '',
  truck_capacity: null,
  transporter_name: '',
  transporter_contact: '',
  driver_name: '',
  driver_contact: '',
  driver_license_number: '',
};

export const DEFAULT_MOCK_PRODUCTS: SelectedProduct[] = [
  {
    local_id: 'tmt-bar-default',
    product: {
      id: 1,
      name: 'TMT Bar',
      dia_shape: 'Round',
      dia_weight_type: 'Actual',
      has_bundles: true,
      bundles: [
        { id: 101, name: 'Standard Bundle', items: ['Standard bundle'], preset_weight_kg: 0 },
      ],
      uom_options: ['TON', 'KG'],
    },
    dia: '12',
    shape: 'U',
    weight_option: 'BIS',
    order_type: 'weight',
    uom: 'TON',
  },
  {
    local_id: 'construction-steel-default',
    product: {
      id: 2,
      name: 'Construction Steel',
      dia_shape: 'Section',
      dia_weight_type: 'Theoretical',
      has_bundles: true,
      bundles: [
        { id: 201, name: 'Standard Bundle', items: ['Standard bundle'], preset_weight_kg: 0 },
      ],
      uom_options: ['TON', 'KG'],
    },
    dia: '12',
    shape: 'U',
    weight_option: 'BIS',
    order_type: 'weight',
    uom: 'TON',
  },
];
