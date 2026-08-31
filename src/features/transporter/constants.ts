export const VEHICLE_TYPE_OPTIONS = [
  '10 Wheeler (16-20 MT)',
  '12 Wheeler (21-25 MT)',
  '14 Wheeler (26-30 MT)',
  '32ft Multi-Axle Trailer (25 MT)',
  '40ft High Bed Trailer (35 MT)',
  '20ft Open Body Truck (10-15 MT)',
] as const;

export const PRICING_BASE_OPTIONS = [
  { value: 'per_ton', label: 'Per TON' },
  { value: 'per_truck', label: 'Per Truck' },
] as const;
