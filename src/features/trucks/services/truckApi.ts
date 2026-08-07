import { apiRequest } from '../../../lib/api';
import type { LoadedTruck, LoadingTruck, SubmitVendorBillPayload } from '../types';

/**
 * Fetches company delivery trucks currently loaded and waiting for reporting (Security Guard flow).
 */
export async function getLoadedTrucks(): Promise<LoadedTruck[]> {
  const res = await apiRequest<{ status: string; trucks: LoadedTruck[] }>(
    'GET',
    '/booking/trucks/loaded'
  );
  return res.trucks || [];
}

/**
 * Fetches truck lines currently in loading state assigned to vendor/seller pickup location.
 */
export async function getLoadingTrucks(): Promise<LoadingTruck[]> {
  const res = await apiRequest<{ status: string; count?: number; trucks: LoadingTruck[] }>(
    'GET',
    '/booking/trucks/loading'
  );
  return res.trucks || [];
}

/**
 * Submits vendor bill details and optional E-Way bill documents for a loading truck line.
 */
export async function submitVendorBill(payload: SubmitVendorBillPayload): Promise<{ status: string; loading_id?: number; truck_line_id?: number }> {
  return await apiRequest('POST', '/booking/trucks/submit_vendor_bill', payload);
}

/**
 * Reports a loaded truck's arrival at the gate with timestamp, notes, and images.
 */
export async function reportTruckArrival(payload: {
  truck_line_id: number;
  reporting_datetime: string;
  note?: string;
  image_1: string;
  image_2?: string;
  image_3?: string;
}): Promise<{ status: string; truck_line_id: number }> {
  return await apiRequest('POST', '/booking/trucks/report', payload);
}
