import { request } from './client';

// ─── Types matching actual backend Trip model ─────────────────────────────────
// Backend enum: ACTIVE | STARTED | COMPLETED | CANCELLED  (NOT "PLANNED"!)
export type TripStatus = 'ACTIVE' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  _id: string;
  createdBy: string | { _id: string; name: string; phone?: string; profilePic?: string; averageRating: number };
  pg: string | { _id: string; name: string; area: string; city: string };
  destination: string;
  departureTime: string;
  acceptOrdersUntil: string;
  expectedReturnTime: string;
  maxOrders: number;
  currentOrders: number;
  carryingFee: number;
  notes?: string;
  status: TripStatus;
  createdAt?: string;
}

// ─── Trips API matching actual backend routes ─────────────────────────────────
export const tripsApi = {
  /**
   * POST /api/trips (protected)
   * Body: { destination, departureTime, acceptOrdersUntil, expectedReturnTime, maxOrders, carryingFee, notes? }
   * Response: { success, message, data: Trip }
   * Backend sets: createdBy = req.user.id, pg = user.pg, status = ACTIVE, currentOrders = 0
   */
  create: async (payload: {
    destination: string;
    departureTime: string;
    acceptOrdersUntil: string;
    expectedReturnTime: string;
    maxOrders: number;
    carryingFee: number;
    notes?: string;
  }): Promise<Trip> => {
    const res = await request<{ success: boolean; message: string; data: Trip }>('/trips', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * GET /api/trips (protected)
   * Returns ACTIVE trips only, filtered to user's same PG
   * Response: { success, message, data: Trip[] }
   */
  getAll: async (all = false): Promise<Trip[]> => {
    const url = all ? '/trips?all=true' : '/trips';
    const res = await request<{ success: boolean; data: Trip[] }>(url, { method: 'GET' });
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * GET /api/trips/mine (protected)
   * Returns every trip created by the logged-in user.
   */
  getMine: async (): Promise<Trip[]> => {
    const res = await request<{ success: boolean; data: Trip[] }>('/trips/mine', { method: 'GET' });
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * GET /api/trips/:id (protected, same PG only)
   * Response: { success, message, data: Trip }
   */
  getById: async (id: string): Promise<Trip> => {
    const res = await request<{ success: boolean; data: Trip }>(`/trips/${id}`, { method: 'GET' });
    return res.data;
  },

  /**
   * Get trips created by the logged-in user.
   * No dedicated endpoint exists — fetch all trips and filter by createdBy.
   * NOTE: GET /api/trips only returns ACTIVE trips, so completed/cancelled trips
   * created by this user won't appear. This is a backend limitation.
   */
  getMyTrips: async (): Promise<Trip[]> => tripsApi.getMine(),

  /**
   * PATCH /api/trips/:id (protected, creator only, trip must be ACTIVE and not departed)
   * Body: { destination?, departureTime?, acceptOrdersUntil?, expectedReturnTime?, maxOrders?, carryingFee?, notes? }
   * Response: { success, message, data: Trip }
   */
  update: async (id: string, payload: Partial<Pick<Trip, 'destination' | 'departureTime' | 'acceptOrdersUntil' | 'expectedReturnTime' | 'maxOrders' | 'carryingFee' | 'notes'>>): Promise<Trip> => {
    const res = await request<{ success: boolean; data: Trip }>(`/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * PATCH /api/trips/:id/complete (protected, creator only, trip must be STARTED)
   * Response: { success, message, data: Trip }
   */
  complete: async (id: string): Promise<Trip> => {
    const res = await request<{ success: boolean; data: Trip }>(`/trips/${id}/complete`, {
      method: 'PATCH',
    });
    return res.data;
  },

  /**
   * DELETE /api/trips/:id (protected, creator only)
   * Conditions: trip must NOT be STARTED or COMPLETED, and currentOrders must be 0
   * Response: { success, message }
   */
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/trips/${id}`, { method: 'DELETE' }),
};
