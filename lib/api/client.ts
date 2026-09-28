/**
 * Core Fetch API Client for BiteBuddy Frontend.
 * Supports Dual-Token Architecture:
 * - Short-lived Access Token kept strictly in-memory (XSS protection).
 * - Long-lived Refresh Token managed via hardened HttpOnly cookie (RTR rotation).
 * - Automatic Authorization header injection.
 * - Concurrency-safe automatic token refresh & retry on 401 Unauthorized.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// In-memory access token storage (Immune to XSS cookie theft)
let currentAccessToken: string | null = null;

export const getAccessToken = (): string | null => currentAccessToken;

export const setAccessToken = (token: string | null): void => {
  currentAccessToken = token;
};

// Auth failure callback for auto-logout / session expiration broadcast
type AuthFailureCallback = () => void;
const authFailureListeners = new Set<AuthFailureCallback>();

export const onAuthFailure = (callback: AuthFailureCallback): (() => void) => {
  authFailureListeners.add(callback);
  return () => {
    authFailureListeners.delete(callback);
  };
};

export const notifyAuthFailure = (): void => {
  setAccessToken(null);
  authFailureListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in auth failure listener:', e);
    }
  });
};

// Mutex / promise queue to prevent concurrent RTR refresh calls
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Sends HttpOnly refreshToken cookie
      });

      if (!response.ok) {
        throw new Error('Refresh token expired or invalid');
      }

      const data = await response.json();
      if (data && data.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken as string;
      }
      throw new Error('No access token in refresh response');
    } catch (err) {
      notifyAuthFailure();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach in-memory access token if available
  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Always send cookies (for refresh token and sessions)
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

    // Determine if request is an auth handshake route that shouldn't trigger automatic refresh
    const isAuthEndpoint =
      endpoint.startsWith('/auth/login') ||
      endpoint.startsWith('/auth/register') ||
      endpoint.startsWith('/auth/refresh') ||
      endpoint.startsWith('/auth/logout');

    // If access token expired (401), attempt silent refresh & retry once
    if (response.status === 401 && !isRetry && !isAuthEndpoint) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retryHeaders = new Headers(options.headers);
        if (options.body && !(options.body instanceof FormData) && !retryHeaders.has('Content-Type')) {
          retryHeaders.set('Content-Type', 'application/json');
        }
        retryHeaders.set('Authorization', `Bearer ${newToken}`);

        return request<T>(endpoint, { ...options, headers: retryHeaders }, true);
      }
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
      (error as Error).message ||
        'Unable to connect to BiteBuddy server. Please verify backend is running on http://localhost:5000.',
      0
    );
  }
}

