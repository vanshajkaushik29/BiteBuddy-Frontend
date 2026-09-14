import { request } from './client';
import { Campaign, CampaignRewardType } from './campaigns';

export interface AdminAnalytics {
  totalUsers: number;
  totalTrips: number;
  activeTrips: number;
  totalOrders: number;
  completedOrders: number;
  totalFoodSales: number;
  totalCarryingFeesEarnedByStudents: number;
  totalPlatformFeesCollected: number;
  totalGrossVolume: number;
  totalCashRewardsPaid: number;
  netPlatformProfit: number;
  activeCampaignsCount: number;
  currentPlatformFee: number;
}

export interface SystemSettings {
  platformFee: number;
  description?: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  rewardPoints: number;
  walletBalance: number;
  pg?: { _id: string; name: string; area: string; city: string };
  createdAt: string;
}

export const adminApi = {
  /**
   * GET /api/admin/analytics (admin only)
   */
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const res = await request<{ success: boolean; data: AdminAnalytics }>('/admin/analytics', {
      method: 'GET',
    });
    return res.data;
  },

  /**
   * GET /api/admin/settings (admin only)
   */
  getSettings: async (): Promise<SystemSettings> => {
    const res = await request<{ success: boolean; data: SystemSettings }>('/admin/settings', {
      method: 'GET',
    });
    return res.data;
  },

  /**
   * PATCH /api/admin/settings (admin only)
   */
  updateSettings: async (platformFee: number): Promise<{ platformFee: number }> => {
    const res = await request<{ success: boolean; message: string; data: { platformFee: number } }>(
      '/admin/settings',
      {
        method: 'PATCH',
        body: JSON.stringify({ platformFee }),
      }
    );
    return res.data;
  },

  /**
   * GET /api/admin/campaigns (admin only)
   */
  getCampaigns: async (): Promise<Campaign[]> => {
    const res = await request<{ success: boolean; data: Campaign[] }>('/admin/campaigns', {
      method: 'GET',
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * POST /api/admin/campaigns (admin only)
   */
  createCampaign: async (payload: {
    title: string;
    description: string;
    badgeText?: string;
    rewardType: CampaignRewardType;
    targetDeliveries: number;
    rewardAmount?: number;
    voucherCode?: string;
    voucherDetails?: string;
    partnerName?: string;
    partnerLogo?: string;
    startDate?: string;
    endDate: string;
    isActive?: boolean;
    minOrderValue?: number;
  }): Promise<Campaign> => {
    const res = await request<{ success: boolean; message: string; data: Campaign }>(
      '/admin/campaigns',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  /**
   * PATCH /api/admin/campaigns/:id (admin only)
   */
  updateCampaign: async (id: string, payload: Partial<Campaign>): Promise<Campaign> => {
    const res = await request<{ success: boolean; message: string; data: Campaign }>(
      `/admin/campaigns/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  /**
   * DELETE /api/admin/campaigns/:id (admin only)
   */
  deleteCampaign: async (id: string): Promise<void> => {
    await request<{ success: boolean; message: string }>(`/admin/campaigns/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * PATCH /api/admin/campaigns/:id/toggle (admin only)
   */
  toggleCampaignStatus: async (id: string): Promise<Campaign> => {
    const res = await request<{ success: boolean; message: string; data: Campaign }>(
      `/admin/campaigns/${id}/toggle`,
      {
        method: 'PATCH',
      }
    );
    return res.data;
  },

  /**
   * GET /api/admin/users (admin only)
   */
  getUsers: async (): Promise<AdminUser[]> => {
    const res = await request<{ success: boolean; data: AdminUser[] }>('/admin/users', {
      method: 'GET',
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * PATCH /api/admin/users/:id/role (admin only)
   */
  setUserRole: async (id: string, role: 'user' | 'admin'): Promise<AdminUser> => {
    const res = await request<{ success: boolean; message: string; data: AdminUser }>(
      `/admin/users/${id}/role`,
      {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }
    );
    return res.data;
  },
};
