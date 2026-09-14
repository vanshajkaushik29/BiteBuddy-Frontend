// Re-export all types and API modules
export * from './auth';
export * from './trips';
export * from './orders';
export * from './rewards';
export * from './campaigns';
export * from './admin';
export * from './pg';
export * from './client';

// Import individual API objects
import { authApi } from './auth';
import { tripsApi } from './trips';
import { ordersApi } from './orders';
import { rewardsApi } from './rewards';
import { campaignsApi } from './campaigns';
import { adminApi } from './admin';
import { pgApi } from './pg';

// Unified API object — single import point for all pages
export const api = {
  auth: authApi,
  trips: tripsApi,
  orders: ordersApi,
  rewards: rewardsApi,
  campaigns: campaignsApi,
  admin: adminApi,
  pgs: pgApi,
};
