import { request } from './client';

// ─── Types matching actual backend PG model ───────────────────────────────────
export interface PG {
  _id: string;
  name: string;
  area: string;
  city: string;
  state: string;
  landmark?: string;
  normalizedName?: string;
  normalizedArea?: string;
  normalizedCity?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  createdAt?: string;
}

// ─── PG API matching actual backend routes ────────────────────────────────────
export const pgApi = {
  /**
   * GET /api/pgs (protected — REQUIRES AUTH)
   * Returns PGs in the SAME area/city/state as the logged-in user's PG.
   * Cannot be used on the register page (user has no auth yet).
   * Response: { success, message, data: PG[] }
   */
  getAll: async (): Promise<PG[]> => {
    const res = await request<{ success: boolean; data: PG[] }>('/pgs', { method: 'GET' });
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * GET /api/pgs/:id (protected)
   * Response: { success, message, data: PG }
   */
  getById: async (id: string): Promise<PG> => {
    const res = await request<{ success: boolean; data: PG }>(`/pgs/${id}`, { method: 'GET' });
    return res.data;
  },
};
