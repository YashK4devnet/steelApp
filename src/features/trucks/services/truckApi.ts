import { apiRequest } from '../../../lib/api';
import type { LoadedTruck, LoadingTruck, SubmitVendorBillPayload, OutgoingTruck } from '../types';

let outgoingTrucksCache: { data: OutgoingTruck[]; timestamp: number } | null = null;

let loadingTrucksCache: { data: LoadingTruck[]; timestamp: number } | null = null;
let loadedTrucksCache: { data: LoadedTruck[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 30000; // 30 seconds cache TTL

/**
 * Fetches company delivery trucks currently loaded and waiting for reporting (Security Guard flow).
 */
export async function getLoadedTrucks(forceRefresh = false): Promise<LoadedTruck[]> {
  const now = Date.now();
  if (!forceRefresh && loadedTrucksCache && (now - loadedTrucksCache.timestamp < CACHE_TTL_MS)) {
    return loadedTrucksCache.data;
  }

  const res = await apiRequest<{ status: string; trucks: LoadedTruck[] }>(
    'GET',
    '/booking/trucks/loaded'
  );
  const trucks = res.trucks || [];
  loadedTrucksCache = { data: trucks, timestamp: now };
  return trucks;
}

/**
 * Fetches truck lines currently in loading state assigned to vendor/seller pickup location.
 * Implements 30-second memory cache to eliminate redundant duplicate API calls.
 */
export async function getLoadingTrucks(forceRefresh = false): Promise<LoadingTruck[]> {
  const now = Date.now();
  if (!forceRefresh && loadingTrucksCache && (now - loadingTrucksCache.timestamp < CACHE_TTL_MS)) {
    return loadingTrucksCache.data;
  }

  const res = await apiRequest<{ status: string; count?: number; trucks: LoadingTruck[] }>(
    'GET',
    '/booking/trucks/loading'
  );
  const trucks = res.trucks || [];
  loadingTrucksCache = { data: trucks, timestamp: now };
  return trucks;
}

export function invalidateLoadingTrucksCache() {
  loadingTrucksCache = null;
}

export function invalidateLoadedTrucksCache() {
  loadedTrucksCache = null;
}

export function invalidateOutgoingTrucksCache() {
  outgoingTrucksCache = null;
}

/**
 * Fetches outgoing trucks currently in draft state waiting to be reported at the warehouse.
 */
export async function getOutgoingTrucks(forceRefresh = false): Promise<OutgoingTruck[]> {
  const now = Date.now();
  if (!forceRefresh && outgoingTrucksCache && (now - outgoingTrucksCache.timestamp < CACHE_TTL_MS)) {
    return outgoingTrucksCache.data;
  }

  const res = await apiRequest<{ status: string; trucks: OutgoingTruck[] }>(
    'GET',
    '/booking/trucks/outgoing'
  );
  const trucks = res.trucks || [];
  outgoingTrucksCache = { data: trucks, timestamp: now };
  return trucks;
}

/**
 * Submits vendor bill details and optional E-Way bill documents for a loading truck line.
 */
export async function submitVendorBill(payload: SubmitVendorBillPayload): Promise<{ status: string; loading_id?: number; truck_line_id?: number }> {
  const res = await apiRequest<{ status: string; loading_id?: number; truck_line_id?: number }>('POST', '/booking/trucks/submit_vendor_bill', payload);
  invalidateLoadingTrucksCache();
  return res;
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
  const res = await apiRequest<{ status: string; truck_line_id: number }>('POST', '/booking/trucks/report', payload);
  invalidateLoadedTrucksCache();
  return res;
}

/**
 * Reports an outgoing truck's arrival at the gate with timestamp, notes, and images.
 */
export async function reportOutgoingTruckArrival(payload: {
  truck_id: number;
  reporting_datetime: string;
  note?: string;
  image_1: string;
  image_2?: string;
  image_3?: string;
}): Promise<{ status: string; truck_id: number }> {
  const res = await apiRequest<{ status: string; truck_id: number }>('POST', '/booking/trucks/outgoing/report', payload);
  invalidateOutgoingTrucksCache();
  return res;
}
