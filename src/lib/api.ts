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
 * Safely parses response body and extracts a clean, human-readable error message.
 * Handles Odoo standard JSON errors, nested RPC data, raw text, and proxy/gateway HTML pages.
 */
export function extractErrorMessage(data: any, status: number): string {
  if (!data) {
    if (status === 404) return 'The requested resource was not found.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 502 || status === 503 || status === 504) {
      return 'The server is temporarily unavailable. Please try again shortly.';
    }
    return `Server request failed with status ${status}.`;
  }

  // If CapacitorHttp returned a JSON string instead of an object, parse it
  let parsed = data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        // Keep string
      }
    } else if (trimmed.includes('<html') || trimmed.includes('<!DOCTYPE') || trimmed.includes('<title>')) {
      if (status === 502 || status === 503 || status === 504) {
        return 'The server is temporarily unavailable. Please try again shortly.';
      }
      return `Server error (${status}). Please try again.`;
    } else if (trimmed.length > 0 && trimmed.length < 200) {
      return trimmed;
    }
  }

  if (typeof parsed === 'object' && parsed !== null) {
    // 1. Direct message field
    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      return parsed.message.trim();
    }
    // 2. Direct error string
    if (typeof parsed.error === 'string' && parsed.error.trim()) {
      return parsed.error.trim();
    }
    // 3. Odoo nested error: { error: { data: { message: "..." } } }
    if (typeof parsed.error?.data?.message === 'string' && parsed.error.data.message.trim()) {
      return parsed.error.data.message.trim();
    }
    // 4. Odoo nested error: { error: { message: "..." } }
    if (typeof parsed.error?.message === 'string' && parsed.error.message.trim()) {
      return parsed.error.message.trim();
    }
    // 5. XML-RPC or custom fault
    if (typeof parsed.faultString === 'string' && parsed.faultString.trim()) {
      return parsed.faultString.trim();
    }
  }

  if (status === 404) return 'The requested resource was not found.';
  if (status === 403) return 'Access denied. You do not have permission.';
  if (status >= 500) return 'Server error occurred. Please try again.';

  return `Server request failed with status ${status}.`;
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
      'Accept-Language': 'en_US',
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

    // Normalize response data if it arrived as a serialized JSON string
    let parsedData = response.data;
    if (typeof parsedData === 'string') {
      const trimmed = parsedData.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          parsedData = JSON.parse(trimmed);
        } catch {
          // Keep original
        }
      }
    }
    
    if (response.status === 401) {
      const isLoginEndpoint = endpoint.includes('/auth/login');
      const serverMessage = extractErrorMessage(parsedData, response.status);

      // 1. If 401 occurs during Login attempt -> Invalid credentials (not an expired session)
      if (isLoginEndpoint) {
        const errorMsg = serverMessage || 'Invalid username or password.';
        throw new ApiError(errorMsg, 401, parsedData);
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

      throw new ApiError(sessionMsg, 401, parsedData);
    }

    // Odoo API returns 200 OK but sometimes indicates error in body
    if (response.status >= 400 || parsedData?.status === 'error' || parsedData?.error) {
      const errorMsg = extractErrorMessage(parsedData, response.status);
      
      // For mutations, show toast notification; for queries, let TanStack Query handle retries silently
      if (!options?.silentError && isMutation) {
        dispatchGlobalToast({
          type: 'error',
          title: 'Request Failed',
          message: errorMsg,
        });
      }

      throw new ApiError(errorMsg, response.status, parsedData);
    }
    
    // Optional success toast notification for mutations
    if (options?.successMessage) {
      dispatchGlobalToast({
        type: 'success',
        message: options.successMessage,
      });
    }

    return parsedData;
  } catch (error: any) {
    console.error(`[API Error] ${method} ${endpoint}:`, error);
    throw error;
  }
}
