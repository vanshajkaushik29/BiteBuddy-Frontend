import { request } from './client';

// ─── Types matching actual backend Order model ────────────────────────────────
// Backend enum: ACCEPTED | DELIVERED | COMPLETED | CANCELLED
export type OrderStatus = 'ACCEPTED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  _id: string;
  orderedBy: string | { _id: string; name: string; phone?: string; profilePic?: string };
  trip: string | {
    _id: string;
    destination: string;
    departureTime: string;
    expectedReturnTime: string;
    status: string;
    createdBy?: string | { _id: string; name: string; phone?: string; profilePic?: string; averageRating?: number };
  };
  food: string;          // single food item name (NOT an array)
  price: number;         // food price (per item)
  quantity: number;      // number of items
  carryingFee: number;   // copied from trip at order time
  platformFee?: number;  // platform fee (e.g. ₹4)
  totalPrice: number;    // computed: price * quantity + carryingFee + platformFee
  pickupLocation: string;
  pg: string;
  status: OrderStatus;
  isRewardAwarded: boolean;
  orderTime: string;
  createdAt?: string;
}

// ─── Orders API matching actual backend routes ────────────────────────────────
export const ordersApi = {
  /**
   * POST /api/orders (protected)
   * Body: { tripId, food, price, quantity, pickupLocation }
   * Backend computes: carryingFee (from trip), totalPrice = price*quantity + carryingFee
   * Response: { success, message, data: Order }
   */
  create: async (payload: {
    tripId: string;
    food: string;
    price: number;
    quantity: number;
    pickupLocation: string;
  }): Promise<Order> => {
    const res = await request<{ success: boolean; data: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * GET /api/orders (protected)
   * Returns orders placed by the current user
   * Response: { success, message, data: Order[] }
   */
  getMyOrders: async (): Promise<Order[]> => {
    const res = await request<{ success: boolean; data: Order[] }>('/orders', { method: 'GET' });
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * GET /api/orders/trip/:tripId (protected)
   * Returns all orders on a specific trip (trip creator sees this)
   * Response: { success, message, data: Order[] }
   */
  getTripOrders: async (tripId: string): Promise<Order[]> => {
    const res = await request<{ success: boolean; data: Order[] }>(`/orders/trip/${tripId}`, {
      method: 'GET',
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * GET /api/orders/:id (protected)
   * Response: { success, message, data: Order }
   */
  getById: async (id: string): Promise<Order> => {
    const res = await request<{ success: boolean; data: Order }>(`/orders/${id}`, { method: 'GET' });
    return res.data;
  },

  /**
   * PATCH /api/orders/:id (protected, update order fields)
   * Response: { success, message, data: Order }
   */
  update: async (id: string, payload: Partial<Pick<Order, 'food' | 'price' | 'quantity' | 'pickupLocation'>>): Promise<Order> => {
    const res = await request<{ success: boolean; data: Order }>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * PATCH /api/orders/:id/cancel (protected, requester only)
   * NOTE: This is PATCH /cancel — NOT DELETE!
   * Penalty: -10 points if trip is STARTED
   * Response: { success, message, data: Order }
   */
  cancel: async (id: string): Promise<Order> => {
    const res = await request<{ success: boolean; message: string; data: Order }>(`/orders/${id}/cancel`, {
      method: 'PATCH',
    });
    return res.data;
  },

  /**
   * PATCH /api/orders/:id/deliver (protected, trip CREATOR only)
   * Trip must be STARTED, order must be ACCEPTED
   * Response: { success, message, data: Order (populated) }
   */
  deliver: async (id: string): Promise<Order> => {
    const res = await request<{ success: boolean; message: string; data: Order }>(`/orders/${id}/deliver`, {
      method: 'PATCH',
    });
    return res.data;
  },

  /**
   * PATCH /api/orders/:id/confirm (protected, REQUESTER only)
   * Order must be DELIVERED. Awards +10 points to trip creator.
   * Response: { success, message, data: Order (populated) }
   */
  confirm: async (id: string): Promise<Order> => {
    const res = await request<{ success: boolean; message: string; data: Order }>(`/orders/${id}/confirm`, {
      method: 'PATCH',
    });
    return res.data;
  },
};
