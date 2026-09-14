"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { api, RewardSummary, ActiveCampaignItem, ClaimRewardResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Zap,
  Star,
  Target,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  Wallet,
  Building2,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function RewardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { success, error, info } = useToast();

  const [data, setData] = useState<RewardSummary | null>(null);
  const [campaigns, setCampaigns] = useState<ActiveCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedRewardModal, setClaimedRewardModal] = useState<ClaimRewardResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rewardRes, campaignRes] = await Promise.all([
        api.rewards.getMyRewards().catch(() => ({ rewardPoints: 0, history: [] })),
        api.campaigns.getActive().catch(() => []),
      ]);
      setData(rewardRes);
      setCampaigns(campaignRes);
    } catch {
      setData({ rewardPoints: 0, history: [] });
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, fetchData, router]);

  const handleClaim = async (campaignId: string) => {
    setClaimingId(campaignId);
    try {
      const res = await api.campaigns.claim(campaignId);
      setClaimedRewardModal(res);
      success('Reward Claimed! 🎉', 'Your milestone reward has been unlocked.');
      fetchData();
    } catch (err: any) {
      error('Claim Failed', err.message);
    } finally {
      setClaimingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied!', 'Code copied to clipboard.');
  };

  // ── Tier system ──────────────────────────────────────────────────────────────
  const getTier = (pts: number) => {
    if (pts >= 500) return { name: 'Legendary Buddy', icon: '🏆', color: 'text-yellow-600', next: null };
    if (pts >= 200) return { name: 'Elite Buddy', icon: '💎', color: 'text-purple-600', next: 500 };
    if (pts >= 100) return { name: 'Gold Buddy', icon: '🥇', color: 'text-yellow-500', next: 200 };
    if (pts >= 50)  return { name: 'Silver Buddy', icon: '🥈', color: 'text-slate-400', next: 100 };
    return { name: 'Bronze Buddy', icon: '🥉', color: 'text-amber-700', next: 50 };
  };

  const points = data?.rewardPoints ?? user?.rewardPoints ?? 0;
  const tier = getTier(points);
  const progressPct = tier.next ? Math.min(100, (points / tier.next) * 100) : 100;

  if (authLoading || loading) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bb-card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-200 animate-pulse mx-auto mb-4" />
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mx-auto mb-2" />
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Rewards & Challenges</h1>
        <p className="page-subtitle">Earn points and unlock dynamic monthly cash bonuses & vendor perks.</p>
      </div>

      {/* ── Active Monthly Challenge Quests ── */}
      {campaigns.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-warning-500" />
              <h2 className="text-base font-extrabold text-ink">Active Monthly Quests</h2>
            </div>
            <span className="text-xs bg-primary-100 text-primary-800 font-bold px-2.5 py-1 rounded-full">
              {campaigns.length} Active
            </span>
          </div>

          {campaigns.map(({ campaign, progress }) => {
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            );

            return (
              <div
                key={campaign._id}
                className="bb-card p-6 bg-gradient-to-br from-white via-indigo-50/20 to-primary-50/40 border-2 border-primary-200 space-y-4 relative overflow-hidden shadow-sm"
              >
                {/* Header with Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-primary-600 text-white shadow-xs">
                        {campaign.badgeText || 'Monthly Quest'}
                      </span>
                      <span className="text-xs text-ink-muted flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" /> {daysLeft} days left
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-ink">{campaign.title}</h3>
                    <p className="text-xs text-ink-muted mt-0.5">{campaign.description}</p>
                  </div>

                  {/* Reward Badge */}
                  <div className="text-right flex-shrink-0 bg-white/90 px-3 py-2 rounded-2xl border border-primary-100 shadow-xs">
                    <div className="text-[10px] uppercase font-bold text-ink-muted">Reward</div>
                    {campaign.rewardType === 'CASH' ? (
                      <div className="text-lg font-extrabold text-emerald-600">₹{campaign.rewardAmount} Cash</div>
                    ) : (
                      <div className="text-sm font-extrabold text-primary-700">{campaign.partnerName || 'Free Meal'}</div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ink">
                      {progress.completedDeliveries} / {progress.targetDeliveries} deliveries completed
                    </span>
                    <span className="text-primary-700 font-bold">{progress.percentage}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 flex items-center justify-between">
                  {progress.isClaimed ? (
                    <div className="w-full flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Reward Claimed!
                      </div>
                      {progress.rewardCode && (
                        <button
                          onClick={() => copyToClipboard(progress.rewardCode!)}
                          className="flex items-center gap-1 font-mono font-bold bg-white px-2.5 py-1 rounded border border-emerald-300 text-emerald-900 hover:bg-emerald-100 transition-colors"
                        >
                          <Copy className="w-3 h-3" /> {progress.rewardCode}
                        </button>
                      )}
                    </div>
                  ) : progress.isEligibleToClaim ? (
                    <button
                      onClick={() => handleClaim(campaign._id)}
                      disabled={claimingId === campaign._id}
                      className="w-full btn-primary py-3 text-sm font-bold animate-pulse shadow-indigo"
                    >
                      {claimingId === campaign._id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Claiming...</>
                      ) : (
                        <><Gift className="w-4 h-4" /> Claim Your Reward Now! 🎉</>
                      )}
                    </button>
                  ) : (
                    <div className="text-xs text-ink-muted flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-primary-500" />
                      Complete {progress.targetDeliveries - progress.completedDeliveries} more deliveries to unlock this reward.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Points & Tier Card ── */}
      <div className="gradient-indigo rounded-3xl p-8 text-center text-white shadow-indigo">
        <div className="text-5xl mb-2">{tier.icon}</div>
        <div className="text-5xl font-extrabold tracking-tight">{points}</div>
        <div className="text-white/80 text-sm mt-1">delivery reward points</div>
        <div className="text-white/90 font-bold text-base mt-3">{tier.name}</div>

        {tier.next && (
          <div className="mt-5">
            <div className="flex justify-between text-white/70 text-xs mb-1.5">
              <span>{points} pts</span>
              <span>{tier.next} pts for next tier</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Wallet Balance (If User Has Earned Cash Rewards) ── */}
      {user && (user.walletBalance ?? 0) > 0 && (
        <div className="bb-card p-5 flex items-center justify-between bg-emerald-50/60 border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-800">Earned Bonus Wallet</div>
              <div className="text-xl font-extrabold text-emerald-950">₹{user.walletBalance}</div>
            </div>
          </div>
          <div className="text-xs text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
            Ready for UPI Payout
          </div>
        </div>
      )}

      {/* How to earn */}
      <div className="bb-card p-5 space-y-3">
        <h2 className="text-sm font-bold text-ink">How to earn rewards</h2>
        <div className="space-y-2.5">
          {[
            { icon: '🛵', title: 'Deliver food for PG mates', pts: '+10 pts + Carrying Fee', desc: 'Keep 100% of carrying fee + earn 10 points on every delivery.' },
            { icon: '🎯', title: 'Monthly Quests', pts: '₹70–₹80 / Vouchers', desc: 'Complete target deliveries in a month to unlock bonuses.' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 text-sm">
              <div className="text-xl w-8 text-center flex-shrink-0">{item.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{item.title}</span>
                  <span className="text-success-600 font-bold text-xs">{item.pts}</span>
                </div>
                <span className="text-xs text-ink-muted">{item.desc}</span>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3 text-sm">
            <div className="text-xl w-8 text-center flex-shrink-0">⚠️</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Late cancellation</span>
                <span className="text-danger-500 font-bold text-xs">−10 pts</span>
              </div>
              <span className="text-xs text-ink-muted">Cancelling after a trip starts costs you 10 points.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Guide */}
      <div className="bb-card p-5 space-y-3">
        <h2 className="text-sm font-bold text-ink">Buddy Tiers</h2>
        <div className="space-y-2">
          {[
            { icon: '🥉', name: 'Bronze Buddy', range: '0–49 pts' },
            { icon: '🥈', name: 'Silver Buddy', range: '50–99 pts' },
            { icon: '🥇', name: 'Gold Buddy', range: '100–199 pts' },
            { icon: '💎', name: 'Elite Buddy', range: '200–499 pts' },
            { icon: '🏆', name: 'Legendary Buddy', range: '500+ pts' },
          ].map(t => (
            <div
              key={t.name}
              className={`flex items-center gap-3 text-sm px-3 py-2 rounded-xl ${
                tier.name === t.name ? 'bg-indigo-light border border-primary-200' : ''
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span className={`font-semibold flex-1 ${tier.name === t.name ? 'text-primary-700' : 'text-ink'}`}>
                {t.name}
              </span>
              <span className="text-xs text-ink-muted">{t.range}</span>
              {tier.name === t.name && <Zap className="w-3.5 h-3.5 text-primary-600" />}
            </div>
          ))}
        </div>
      </div>

      {/* Reward History */}
      <div className="bb-card p-5 space-y-3">
        <h2 className="text-sm font-bold text-ink">Transaction history</h2>
        {(!data?.history || data.history.length === 0) ? (
          <div className="text-center py-6 text-sm text-ink-muted">
            <Award className="w-8 h-8 text-ink-faint mx-auto mb-2" />
            No transactions yet. Start delivering food to earn points!
          </div>
        ) : (
          <div className="space-y-2">
            {data.history.map((item, i) => {
              const isEarned = item.points >= 0;
              const order = typeof item.order === 'object' ? item.order : null;
              return (
                <div key={item._id ?? i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isEarned ? 'bg-success-100' : 'bg-danger-100'
                  }`}>
                    {isEarned
                      ? <TrendingUp className="w-4 h-4 text-success-600" />
                      : <TrendingDown className="w-4 h-4 text-danger-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-ink truncate">{item.description}</div>
                    {order && (
                      <div className="text-xs text-ink-muted truncate">
                        {order.food} — ₹{order.totalPrice}
                      </div>
                    )}
                    <div className="text-xs text-ink-faint">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className={`text-sm font-bold flex-shrink-0 ${
                    isEarned ? 'text-success-600' : 'text-danger-500'
                  }`}>
                    {item.points > 0 ? `+${item.points}` : item.points < 0 ? item.points : '✓'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Claim Success Modal ── */}
      {claimedRewardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center animate-scale-in shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-3xl">
              🎉
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-ink">Congratulations!</h3>
              <p className="text-xs text-ink-muted mt-1">You completed the monthly challenge!</p>
            </div>

            {claimedRewardModal.rewardType === 'CASH' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <div className="text-xs text-emerald-800 font-semibold">Cash Bonus Credited</div>
                <div className="text-3xl font-black text-emerald-600">₹{claimedRewardModal.rewardAmount}</div>
                <div className="text-[11px] text-emerald-700">Updated Wallet: ₹{claimedRewardModal.walletBalance}</div>
              </div>
            ) : (
              <div className="p-4 bg-indigo-50 border border-primary-200 rounded-2xl space-y-2">
                <div className="text-xs text-primary-800 font-semibold">{claimedRewardModal.partnerName || 'Partner Voucher'}</div>
                <div className="text-sm font-bold text-ink">{claimedRewardModal.voucherDetails}</div>
                {claimedRewardModal.rewardCode && (
                  <div className="flex items-center justify-center gap-2 p-2 bg-white rounded-xl border border-primary-200 font-mono font-extrabold text-primary-700 text-sm">
                    {claimedRewardModal.rewardCode}
                    <button
                      onClick={() => copyToClipboard(claimedRewardModal.rewardCode!)}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      <Copy className="w-4 h-4 text-ink-muted" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setClaimedRewardModal(null)}
              className="w-full btn-primary py-3 text-sm font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
