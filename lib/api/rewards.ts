import { request } from './client';

// ─── Types matching actual backend Reward model ───────────────────────────────
export type RewardType = 'EARNED_TRIP_COMPLETED' | 'CANCELLATION_PENALTY';

export interface RewardTransaction {
  _id: string;
  user: string;
  order?: {
    _id: string;
    food: string;
    price: number;
    totalPrice: number;
    status: string;
  } | string;
  points: number;              // positive = earned, negative = penalty
  type: RewardType;
  description: string;
  createdAt: string;
}

export interface RewardSummary {
  rewardPoints: number;        // current total from User model
  history: RewardTransaction[];
}

// ─── Rewards API matching actual backend routes ───────────────────────────────
export const rewardsApi = {
  /**
   * GET /api/rewards (protected)
   * Response: { success, message, data: { rewardPoints: number, history: RewardTransaction[] } }
   */
  getMyRewards: async (): Promise<RewardSummary> => {
    const res = await request<{ success: boolean; data: RewardSummary }>('/rewards', { method: 'GET' });
    return {
      rewardPoints: res.data?.rewardPoints ?? 0,
      history: Array.isArray(res.data?.history) ? res.data.history : [],
    };
  },
};
