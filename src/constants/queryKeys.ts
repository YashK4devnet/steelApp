export const QUERY_KEYS = {
  masterData: ['masterData'] as const,
  bookings: ['bookings'] as const,
  bookingDetail: (id: number) => ['bookings', id] as const,
  loadedTrucks: ['trucks', 'loaded'] as const,
  loadingTrucks: ['trucks', 'loading'] as const,
  outgoingTrucks: ['trucks', 'outgoing'] as const,
  transporterLoadingTrucks: ['transporter', 'loadingTrucks'] as const,
} as const;
