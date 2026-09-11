export const QUERY_KEYS = {
  masterData: ['masterData'] as const,
  bookings: ['bookings'] as const,
  bookingDetail: (id: number) => ['bookings', id] as const,
  loadedTrucks: ['trucks', 'loaded'] as const,
  loadingTrucks: ['trucks', 'loading'] as const,
  outgoingTrucks: ['trucks', 'outgoing'] as const,
  transporterLoadingTrucks: ['transporter', 'loadingTrucks'] as const,
  transporterQuotations: ['transporter', 'quotations'] as const,
  transporterQuotationDetail: (id: number | string) => ['transporter', 'quotation', String(id)] as const,
  transporterTruckTypes: ['transporter', 'truckTypes'] as const,
  poApprovals: ['poApprovals'] as const,
  poApprovalDetail: (id: number | string) => ['poApprovals', String(id)] as const,
  gateAnalytics: (period: string) => ['gateAnalytics', period] as const,
} as const;

