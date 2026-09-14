/**
 * Core Fetch API Client for BiteBuddy Frontend.
 * Reads base URL from NEXT_PUBLIC_API_URL or defaults to Render backend deployment.
 * Supports cross-origin HTTP-Only JWT authentication cookies via `credentials: 'include'`.
 */

const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'https://bitebuddybackend-uhno.onrender.com')
  .trim()
  .replace(/\/+$/, '');

// Ensure base URL always points to /api without duplicating if the env var already includes /api
export const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Resolves an endpoint to a full URL, safely handling leading slashes and preventing duplicate /api
 */
export function buildApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/')) {
    // If endpoint already starts with /api/, attach to raw root base domain
    const rootDomain = rawBase.endsWith('/api') ? rawBase.slice(0, -4) : rawBase;
    return `${rootDomain}${cleanEndpoint}`;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = buildApiUrl(endpoint);

  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Cross-origin HTTP-Only cookie support
  };

  try {
    const response = await fetch(url, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === 'object' && data?.message
          ? data.message
          : `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      (error as Error).message || `Unable to connect to BiteBuddy backend at ${API_BASE_URL}`,
      0
    );
  }
}
