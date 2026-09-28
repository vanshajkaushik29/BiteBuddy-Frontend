import { request, setAccessToken } from './client';

// ─── Types matching actual backend User model ─────────────────────────────────
export interface PGRef {
  _id: string;
  name: string;
  area: string;
  city: string;
  state: string;
  landmark?: string;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  pg: PGRef | string; // ObjectId or populated PG object
  profilePic?: string;
  rewardPoints: number;
  walletBalance?: number;
  role?: 'user' | 'admin';
  averageRating: number;
  ratingCount: number;
  createdAt?: string;
}

// ─── Auth API matching actual backend routes ──────────────────────────────────
export const authApi = {
  /**
   * POST /api/auth/register
   * Body: { name, email, phone, password, pg: { name, area, city, state, landmark? } }
   * Response: { success, user: User, accessToken: string }
   */
  register: async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pg: { name: string; area: string; city: string; state: string; landmark?: string };
  }) => {
    const res = await request<{
      success: boolean;
      user: User;
      accessToken: string;
      message?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  /**
   * POST /api/auth/login
   * Body: { email, password }
   * Response: { success, message, accessToken: string, user: User }
   */
  login: async (credentials: { email: string; password: string }) => {
    const res = await request<{
      success: boolean;
      message: string;
      accessToken: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  /**
   * POST /api/auth/refresh
   * Exchanges HttpOnly refreshToken cookie for new accessToken
   * Response: { success, accessToken: string }
   */
  refresh: async () => {
    const res = await request<{ success: boolean; accessToken: string }>('/auth/refresh', {
      method: 'POST',
    });
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  /**
   * GET /api/auth/me (protected)
   * Response: { success, data: User }
   */
  me: () =>
    request<{ success: boolean; data: User }>('/auth/me', { method: 'GET' }),

  /**
   * POST /api/auth/logout (protected/public)
   * Response: { success, message }
   */
  logout: async () => {
    try {
      return await request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      setAccessToken(null);
    }
  },

  /**
   * PATCH /api/auth/profile (protected)
   * Body: { name?, email?, phone?, pg? (ObjectId string), profilePic? }
   * Response: { success, message, data: User }
   */
  updateProfile: (payload: {
    name?: string;
    email?: string;
    phone?: string;
    pg?: string; // ObjectId of existing PG
    profilePic?: string;
  }) =>
    request<{ success: boolean; message: string; data: User }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  /**
   * PATCH /api/auth/change-password (protected)
   * Body: { currentPassword, newPassword }
   */
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

