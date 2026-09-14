import { request } from './client';

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
   * Response: { success, user: User }
   */
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pg: { name: string; area: string; city: string; state: string; landmark?: string };
  }) =>
    request<{ success: boolean; user: User; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /**
   * POST /api/auth/login
   * Body: { email, password }
   * Response: { success, message, user: User }
   */
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; message: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  /**
   * GET /api/auth/me (protected)
   * Response: { success, data: User }  ← NOTE: "data" not "user"
   */
  me: () =>
    request<{ success: boolean; data: User }>('/auth/me', { method: 'GET' }),

  /**
   * POST /api/auth/logout (protected)
   * Response: { success, message }
   */
  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', { method: 'POST' }),

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
