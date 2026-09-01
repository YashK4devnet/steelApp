import { CapacitorHttp } from '@capacitor/core';
import type { HttpOptions, HttpResponse } from '@capacitor/core';
import { dispatchGlobalToast } from '../app/providers/ToastProvider';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rathisteel.4devnet.in';

export interface ApiRequestOptions {
  silentError?: boolean;
  successMessage?: string;
}

/**
 * A wrapper around CapacitorHttp to standardize requests, base URLs, error handling, and toast notifications.
 * CapacitorHttp runs requests through the native mobile layer, inherently bypassing CORS restrictions.
 * It also automatically uses the native cookie jar, maintaining the Odoo session_id.
 */
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  headers: Record<string, string> = {},
  options?: ApiRequestOptions
): Promise<T> {
  
  const httpOptions: HttpOptions = {
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  const token = localStorage.getItem('authToken');
  if (token) {
    httpOptions.headers!['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    httpOptions.data = data;
  }

  try {
    let response: HttpResponse;
    try {
      response = await CapacitorHttp.request({ ...httpOptions, method });
    } catch (networkError: any) {
      window.dispatchEvent(new CustomEvent('network-error', { detail: { isOffline: true } }));
      
      if (!options?.silentError) {
        dispatchGlobalToast({
          type: 'error',
          title: 'Network Connection Failed',
          message: 'Unable to reach the server. Please check your internet connection and try again.',
        });
      }
      
      throw new Error('Network error: Unable to reach the server. Please check your connection.');
    }

    // Since the request reached the server, clear any offline banners
    window.dispatchEvent(new CustomEvent('network-error', { detail: { isOffline: false } }));
    
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth-expired'));
      
      if (!options?.silentError) {
        dispatchGlobalToast({
          type: 'error',
          title: 'Session Expired',
          message: 'Your session has expired. Please log in again.',
        });
      }

      throw new Error('Session expired. Please log in again.');
    }

    // Odoo API returns 200 OK but sometimes indicates error in body
    if (response.status >= 400 || response.data?.status === 'error') {
      const errorMsg = response.data?.message || `Server request failed with status ${response.status}`;
      
      if (!options?.silentError) {
        dispatchGlobalToast({
          type: 'error',
          title: 'Request Failed',
          message: errorMsg,
        });
      }

      throw new Error(errorMsg);
    }
    
    // Optional success toast notification for mutations
    if (options?.successMessage) {
      dispatchGlobalToast({
        type: 'success',
        message: options.successMessage,
      });
    }

    return response.data;
  } catch (error: any) {
    console.error(`[API Error] ${method} ${endpoint}:`, error);
    throw error;
  }
}
