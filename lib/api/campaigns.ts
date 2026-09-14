import { request } from './client';

export type CampaignRewardType = 'CASH' | 'VOUCHER' | 'DISCOUNT' | 'PARTNER_DEAL';

export interface Campaign {
  _id: string;
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
  startDate: string;
  endDate: string;
  isActive: boolean;
  minOrderValue: number;
}

export interface UserCampaignProgress {
  completedDeliveries: number;
  targetDeliveries: number;
  percentage: number;
  isClaimed: boolean;
  claimedAt?: string;
  rewardCode?: string;
  isEligibleToClaim: boolean;
}

export interface ActiveCampaignItem {
  campaign: Campaign;
  progress: UserCampaignProgress;
}

export interface ClaimRewardResponse {
  rewardType: CampaignRewardType;
  rewardAmount?: number;
  rewardCode?: string;
  voucherDetails?: string;
  partnerName?: string;
  walletBalance?: number;
}

export const campaignsApi = {
  /**
   * GET /api/campaigns/active (protected)
   * Fetches all currently active monthly campaigns + logged in user's progress
   */
  getActive: async (): Promise<ActiveCampaignItem[]> => {
    const res = await request<{ success: boolean; data: ActiveCampaignItem[] }>('/campaigns/active', {
      method: 'GET',
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * POST /api/campaigns/:campaignId/claim (protected)
   * Claims the reward when milestone is reached
   */
  claim: async (campaignId: string): Promise<ClaimRewardResponse> => {
    const res = await request<{ success: boolean; message: string; data: ClaimRewardResponse }>(
      `/campaigns/${campaignId}/claim`,
      { method: 'POST' }
    );
    return res.data;
  },
};
