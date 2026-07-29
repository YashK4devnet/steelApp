import { CapacitorHttp } from '@capacitor/core';
import type { HttpOptions, HttpResponse } from '@capacitor/core';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rathisteel.4devnet.in';

/**
 * A wrapper around CapacitorHttp to standardize requests, base URLs, and error handling.
 * CapacitorHttp runs requests through the native mobile layer, inherently bypassing CORS restrictions.
 * It also automatically uses the native cookie jar, maintaining the Odoo session_id.
 */
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  headers: Record<string, string> = {}
): Promise<T> {
  
  const options: HttpOptions = {
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  const token = localStorage.getItem('authToken');
  if (token) {
    options.headers!['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.data = data;
  }

  try {
    const response: HttpResponse = await CapacitorHttp.request({ ...options, method });
    
    // Odoo API returns 200 OK but sometimes indicates error in body
    if (response.status >= 400 || response.data?.status === 'error') {
      const errorMsg = response.data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`[API Error] ${method} ${endpoint}:`, error);
    throw error;
  }
}
