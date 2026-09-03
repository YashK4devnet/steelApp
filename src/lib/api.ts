import { CapacitorHttp } from '@capacitor/core';
import type { HttpOptions, HttpResponse } from '@capacitor/core';
import { dispatchGlobalToast } from '../app/providers/ToastProvider';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rathisteel.4devnet.in';

export interface ApiRequestOptions {
  silentError?: boolean;
  successMessage?: string;
}

export class ApiError extends Error {
  status: number;
  data?: any;
  isNetworkError?: boolean;

  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = status === 0;
  }
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
  const isMutation = method !== 'GET';
  
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
      
      // Only dispatch network error toast immediately for user-initiated mutations
      if (!options?.silentError && isMutation) {
        dispatchGlobalToast({
          type: 'error',
          title: 'Network Connection Failed',
          message: 'Unable to reach the server. Please check your internet connection.',
        });
      }
      
      throw new ApiError('Network error: Unable to reach the server. Please check your connection.', 0);
    }

    // Since the request reached the server, clear any offline banners
    window.dispatchEvent(new CustomEvent('network-error', { detail: { isOffline: false } }));
    
    if (response.status === 401) {
      const isLoginEndpoint = endpoint.includes('/auth/login');
      const serverMessage = response.data?.message;

      // 1. If 401 occurs during Login attempt -> Invalid credentials (not an expired session)
      if (isLoginEndpoint) {
        const errorMsg = serverMessage || 'Invalid username or password.';
        throw new ApiError(errorMsg, 401, response.data);
      }

      // 2. If 401 occurs during an authenticated session -> Token/Session has expired
      window.dispatchEvent(new CustomEvent('auth-expired'));
      
      const sessionMsg = serverMessage || 'Your session has expired. Please log in again.';
      if (!options?.silentError) {
        dispatchGlobalToast({
          type: 'error',
          title: 'Session Expired',
          message: sessionMsg,
        });
      }

      throw new ApiError(sessionMsg, 401, response.data);
    }

    // Odoo API returns 200 OK but sometimes indicates error in body
    if (response.status >= 400 || response.data?.status === 'error') {
      const errorMsg = response.data?.message || `Server request failed with status ${response.status}`;
      
      // For mutations, show toast notification; for queries, let TanStack Query handle retries silently
      if (!options?.silentError && isMutation) {
        dispatchGlobalToast({
          type: 'error',
          title: 'Request Failed',
          message: errorMsg,
        });
      }

      throw new ApiError(errorMsg, response.status, response.data);
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
