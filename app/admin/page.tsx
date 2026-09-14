"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  api,
  AdminAnalytics,
  Campaign,
  AdminUser,
  CampaignRewardType,
} from '@/lib/api';
import {
  ShieldAlert,
  BarChart3,
  Settings,
  Gift,
  Users,
  TrendingUp,
  IndianRupee,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Loader2,
  Save,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'analytics' | 'campaigns' | 'settings' | 'users'>('analytics');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Admin Data states
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [platformFee, setPlatformFee] = useState<number>(4);

  // New/Edit Campaign modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    badgeText: 'Monthly Quest',
    rewardType: 'CASH' as CampaignRewardType,
    targetDeliveries: 20,
    rewardAmount: 75,
    voucherCode: '',
    voucherDetails: '',
    partnerName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minOrderValue: 0,
    isActive: true,
  });

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsData, settingsData, campaignsData, usersData] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getSettings(),
        api.admin.getCampaigns(),
        api.admin.getUsers(),
      ]);

      setAnalytics(analyticsData);
      setPlatformFee(settingsData.platformFee);
      setCampaigns(campaignsData);
      setUsersList(usersData);
    } catch (err: any) {
      error('Access Error', err.message || 'Could not load admin dashboard');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        error('Access Denied', 'You need administrator privileges to view this panel.');
        router.push('/');
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, router, fetchAdminData, error]);

  // Update System Settings
  const handleSavePlatformFee = async () => {
    setActionLoading(true);
    try {
      await api.admin.updateSettings(Number(platformFee));
      success('Settings Updated', `Platform fee is now ₹${platformFee} per order.`);
      fetchAdminData();
    } catch (err: any) {
      error('Update Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Campaign creation / edit
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingCampaignId) {
        await api.admin.updateCampaign(editingCampaignId, campaignForm);
        success('Campaign Updated', 'The challenge campaign was updated.');
      } else {
        await api.admin.createCampaign(campaignForm);
        success('Campaign Created 🎉', 'New monthly reward quest is now live.');
      }
      setShowCampaignModal(false);
      setEditingCampaignId(null);
      fetchAdminData();
    } catch (err: any) {
      error('Failed to save campaign', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCampaign = async (id: string) => {
    try {
      await api.admin.toggleCampaignStatus(id);
      success('Status Updated');
      fetchAdminData();
    } catch (err: any) {
      error('Toggle Failed', err.message);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await api.admin.deleteCampaign(id);
      success('Campaign Deleted');
      fetchAdminData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change user role to ${newRole}?`)) return;
    try {
      await api.admin.setUserRole(userId, newRole);
      success('Role Updated', `User is now a ${newRole}.`);
      fetchAdminData();
    } catch (err: any) {
      error('Failed to update role', err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-6">
        <div className="bb-card p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-ink">Loading Admin Control Panel...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary-100 text-primary-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Admin Portal
            </span>
          </div>
          <h1 className="page-title text-2xl font-black mt-1">BiteBuddy Command Center</h1>
          <p className="page-subtitle text-xs">Manage platform economics, monthly reward campaigns & user permissions.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'analytics' ? 'bg-white text-primary-700 shadow-xs font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Economics
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'campaigns' ? 'bg-white text-primary-700 shadow-xs font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Gift className="w-4 h-4" /> Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'settings' ? 'bg-white text-primary-700 shadow-xs font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Settings className="w-4 h-4" /> Fee Config
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'users' ? 'bg-white text-primary-700 shadow-xs font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Users className="w-4 h-4" /> Users ({usersList.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: Analytics & Profitability ── */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Main Profit Breakdown KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bb-card p-5 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl shadow-emerald-500/10">
              <div className="text-xs text-white/80 font-semibold uppercase">Net Platform Profit</div>
              <div className="text-3xl font-black mt-1">₹{analytics.netPlatformProfit}</div>
              <div className="text-[11px] text-white/90 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Platform Fee Revenue − Cash Rewards Paid
              </div>
            </div>

            <div className="bb-card p-5 bg-gradient-to-br from-indigo-600 to-primary-700 text-white rounded-3xl shadow-indigo">
              <div className="text-xs text-white/80 font-semibold uppercase">Platform Fees Collected</div>
              <div className="text-3xl font-black mt-1">₹{analytics.totalPlatformFeesCollected}</div>
              <div className="text-[11px] text-white/90 mt-2">
                From {analytics.completedOrders} completed deliveries
              </div>
            </div>

            <div className="bb-card p-5 bg-white border border-slate-200 rounded-3xl">
              <div className="text-xs text-ink-muted font-semibold uppercase">Student Carrier Earnings</div>
              <div className="text-3xl font-black text-ink mt-1">₹{analytics.totalCarryingFeesEarnedByStudents}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-2">
                100% kept by delivering students
              </div>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bb-card p-4">
              <div className="text-xs text-ink-muted">Total Food Sales</div>
              <div className="text-xl font-bold text-ink mt-0.5">₹{analytics.totalFoodSales}</div>
            </div>
            <div className="bb-card p-4">
              <div className="text-xs text-ink-muted">Gross Order Volume</div>
              <div className="text-xl font-bold text-ink mt-0.5">₹{analytics.totalGrossVolume}</div>
            </div>
            <div className="bb-card p-4">
              <div className="text-xs text-ink-muted">Cash Rewards Paid</div>
              <div className="text-xl font-bold text-danger-500 mt-0.5">₹{analytics.totalCashRewardsPaid}</div>
            </div>
            <div className="bb-card p-4">
              <div className="text-xs text-ink-muted">Active Trips / Orders</div>
              <div className="text-xl font-bold text-ink mt-0.5">{analytics.activeTrips} trips / {analytics.totalOrders} orders</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Campaign Management ── */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Monthly Dynamic Reward Quests</h2>
            <button
              onClick={() => {
                setEditingCampaignId(null);
                setCampaignForm({
                  title: '',
                  description: '',
                  badgeText: 'Monthly Quest',
                  rewardType: 'CASH',
                  targetDeliveries: 20,
                  rewardAmount: 75,
                  voucherCode: '',
                  voucherDetails: '',
                  partnerName: '',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  minOrderValue: 0,
                  isActive: true,
                });
                setShowCampaignModal(true);
              }}
              className="btn-primary text-xs py-2 px-3 gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create New Campaign
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="bb-card p-12 text-center text-ink-muted space-y-3">
              <Gift className="w-10 h-10 text-ink-faint mx-auto" />
              <div className="text-sm font-semibold">No active campaigns yet</div>
              <p className="text-xs">Create a 20-order challenge with cash or cafe vouchers to incentivize students.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {campaigns.map((camp) => (
                <div key={camp._id} className="bb-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        camp.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {camp.isActive ? 'Live' : 'Paused'}
                      </span>
                      <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                        Target: {camp.targetDeliveries} Deliveries
                      </span>
                      <span className="text-xs text-ink-muted">
                        Ends {new Date(camp.endDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-ink">{camp.title}</h3>
                    <p className="text-xs text-ink-muted">{camp.description}</p>
                    <div className="text-xs font-semibold text-emerald-700 mt-1">
                      Reward: {camp.rewardType === 'CASH' ? `₹${camp.rewardAmount} Cash Wallet Credit` : `${camp.partnerName || 'Voucher'}: ${camp.voucherDetails}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleCampaign(camp._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        camp.isActive ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {camp.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(camp._id)}
                      className="p-2 text-danger-500 hover:bg-danger-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: System Settings & Platform Fee ── */}
      {activeTab === 'settings' && (
        <div className="bb-card p-6 space-y-6 max-w-xl">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-ink">Platform Convenience Fee Configuration</h2>
            <p className="text-xs text-ink-muted">Adjust the platform fee charged per order. This changes the price dynamically across all PG trips with zero redeployment.</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="bb-label">Platform Fee Amount (₹)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(Number(e.target.value))}
                  className="bb-input max-w-[120px] text-lg font-bold"
                />
                <span className="text-sm text-ink-muted font-medium">per food order</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs text-ink-muted">
              <div className="font-semibold text-ink">Current Requester Pricing Preview:</div>
              <div>• Food Price: ₹100</div>
              <div>• Buddy Carrying Fee: ₹10 (to deliverer)</div>
              <div>• Platform Fee: <span className="font-bold text-primary-700">₹{platformFee}</span> (to BiteBuddy)</div>
              <div className="font-bold text-ink border-t border-slate-200 pt-1">
                • Total Paid by Student: ₹{110 + Number(platformFee)}
              </div>
            </div>

            <button
              onClick={handleSavePlatformFee}
              disabled={actionLoading}
              className="btn-primary py-2.5 px-5 text-sm gap-2"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 4: User Role Management ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-ink">Registered Campus Users & Admins</h2>
          <div className="bb-card overflow-hidden">
            <div className="divide-y divide-border">
              {usersList.map((u) => (
                <div key={u._id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink truncate">{u.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-ink-muted truncate font-mono text-[11px]">{u.email} • {u.phone}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      Points: {u.rewardPoints} pts | Wallet: ₹{u.walletBalance || 0}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleUserRole(u._id, u.role)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex-shrink-0 ${
                      u.role === 'admin'
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    {u.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Campaign Create / Edit Modal ── */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-ink">
                {editingCampaignId ? 'Edit Campaign' : 'Create Monthly Challenge Quest'}
              </h3>
              <button onClick={() => setShowCampaignModal(false)} className="btn-ghost text-xs">Close</button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div>
                <label className="bb-label">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October Rush: 20 Deliveries"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  className="bb-input"
                />
              </div>

              <div>
                <label className="bb-label">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Deliver 20 orders this month to unlock a ₹75 cash bonus!"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="bb-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="bb-label">Reward Type</label>
                  <select
                    value={campaignForm.rewardType}
                    onChange={(e) => setCampaignForm({ ...campaignForm, rewardType: e.target.value as any })}
                    className="bb-input font-medium"
                  >
                    <option value="CASH">Cash Milestone Bonus</option>
                    <option value="VOUCHER">Vendor Voucher / Coupon</option>
                    <option value="PARTNER_DEAL">Cafe Partner Deal</option>
                  </select>
                </div>
                <div>
                  <label className="bb-label">Target Deliveries</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={campaignForm.targetDeliveries}
                    onChange={(e) => setCampaignForm({ ...campaignForm, targetDeliveries: Number(e.target.value) })}
                    className="bb-input"
                  />
                </div>
              </div>

              {campaignForm.rewardType === 'CASH' ? (
                <div>
                  <label className="bb-label">Cash Reward Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 75"
                    value={campaignForm.rewardAmount}
                    onChange={(e) => setCampaignForm({ ...campaignForm, rewardAmount: Number(e.target.value) })}
                    className="bb-input"
                  />
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="bb-label">Partner / Eatery Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Roll Bistro"
                        value={campaignForm.partnerName}
                        onChange={(e) => setCampaignForm({ ...campaignForm, partnerName: e.target.value })}
                        className="bb-input"
                      />
                    </div>
                    <div>
                      <label className="bb-label">Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. FREEBURGER20"
                        value={campaignForm.voucherCode}
                        onChange={(e) => setCampaignForm({ ...campaignForm, voucherCode: e.target.value })}
                        className="bb-input font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="bb-label">Voucher Perk Details</label>
                    <input
                      type="text"
                      placeholder="e.g. 1x Free Paneer Roll at Roll Bistro"
                      value={campaignForm.voucherDetails}
                      onChange={(e) => setCampaignForm({ ...campaignForm, voucherDetails: e.target.value })}
                      className="bb-input"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="bb-label">Start Date</label>
                  <input
                    type="date"
                    required
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className="bb-input"
                  />
                </div>
                <div>
                  <label className="bb-label">End Date</label>
                  <input
                    type="date"
                    required
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className="bb-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="camp-active"
                  checked={campaignForm.isActive}
                  onChange={(e) => setCampaignForm({ ...campaignForm, isActive: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="camp-active" className="text-xs font-semibold text-ink">Set as Live Campaign</label>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="btn-ghost text-xs px-4 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs py-2.5 px-5 font-bold"
                >
                  {actionLoading ? 'Saving...' : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
