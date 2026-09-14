"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Loader2,
  Award,
  Star,
  CheckCircle2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser, logout } = useAuth();
  const router = useRouter();
  const { success, error } = useToast();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  // Use effect for redirect to avoid SSR 'location is not defined' error
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <div className="max-w-xl mx-auto py-20 text-center text-ink-muted text-sm">Loading...</div>;
  }

  if (!user) return null;

  const pg = typeof user.pg === 'object' ? user.pg : null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // PATCH /api/auth/profile — only send changed fields
      await api.auth.updateProfile({
        name: form.name.trim() !== user.name ? form.name.trim() : undefined,
        email: form.email.trim().toLowerCase() !== user.email ? form.email.trim().toLowerCase() : undefined,
        phone: form.phone.trim() !== user.phone ? form.phone.trim() : undefined,
      });
      await refreshUser();
      success('Profile updated!');
      setEditMode(false);
    } catch (err: any) {
      error('Update failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Required';
    if (!pwForm.newPassword) errs.newPassword = 'Required';
    if (pwForm.newPassword.length < 6) errs.newPassword = 'At least 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }

    setPwSaving(true);
    try {
      await api.auth.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      success('Password changed!');
      setPwMode(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err: any) {
      error('Failed', err.message);
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      {/* User Card */}
      <div className="bb-card p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-indigo">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold text-ink">{user.name}</div>
            <div className="text-sm text-ink-muted">{user.email}</div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs font-semibold text-primary-600">
                <Award className="w-3.5 h-3.5" />
                {user.rewardPoints} pts
              </div>
              {user.averageRating > 0 && (
                <div className="flex items-center gap-1 text-xs font-semibold text-warning-500">
                  <Star className="w-3.5 h-3.5 fill-warning-500" />
                  {user.averageRating.toFixed(1)} ({user.ratingCount})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PG Info */}
        {pg && (
          <div className="flex items-center gap-2.5 p-3 bg-teal-light rounded-xl text-sm mb-5">
            <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
            <div>
              <span className="font-semibold text-ink">{pg.name}</span>
              <span className="text-ink-muted"> · {pg.area}, {pg.city}</span>
            </div>
          </div>
        )}

        {/* Edit Toggle */}
        {!editMode ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-ink-muted mb-0.5 uppercase tracking-wide font-semibold">Phone</div>
                <div className="font-medium text-ink">{user.phone || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted mb-0.5 uppercase tracking-wide font-semibold">Email</div>
                <div className="font-medium text-ink truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setForm({ name: user.name, email: user.email, phone: user.phone });
                setEditMode(true);
              }}
              className="btn-secondary text-sm w-full mt-2"
              id="edit-profile"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="bb-label">Full name</label>
              <input
                id="profile-name"
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="bb-input"
              />
            </div>
            <div>
              <label className="bb-label">Email</label>
              <input
                id="profile-email"
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="bb-input"
              />
            </div>
            <div>
              <label className="bb-label">Phone</label>
              <input
                id="profile-phone"
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="bb-input"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary text-sm flex-1" id="save-profile">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditMode(false)} className="btn-secondary text-sm flex-1">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="bb-card p-5">
        <button
          onClick={() => setPwMode(!pwMode)}
          className="flex items-center gap-2.5 w-full text-sm font-semibold text-ink"
          id="toggle-change-password"
        >
          <Lock className="w-4 h-4 text-ink-muted" />
          Change Password
        </button>

        {pwMode && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3 animate-slide-up">
            <div>
              <label className="bb-label">Current password</label>
              <input
                id="current-password"
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                className={`bb-input ${pwErrors.currentPassword ? 'border-danger-500' : ''}`}
              />
              {pwErrors.currentPassword && <p className="text-xs text-danger-500 mt-1">{pwErrors.currentPassword}</p>}
            </div>
            <div>
              <label className="bb-label">New password</label>
              <input
                id="new-password"
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                className={`bb-input ${pwErrors.newPassword ? 'border-danger-500' : ''}`}
              />
              {pwErrors.newPassword && <p className="text-xs text-danger-500 mt-1">{pwErrors.newPassword}</p>}
            </div>
            <div>
              <label className="bb-label">Confirm new password</label>
              <input
                id="confirm-new-password"
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className={`bb-input ${pwErrors.confirmPassword ? 'border-danger-500' : ''}`}
              />
              {pwErrors.confirmPassword && <p className="text-xs text-danger-500 mt-1">{pwErrors.confirmPassword}</p>}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={pwSaving} className="btn-primary text-sm flex-1" id="save-password">
                {pwSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
              </button>
              <button type="button" onClick={() => setPwMode(false)} className="btn-secondary text-sm flex-1">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bb-card p-5 border-danger-200">
        <h3 className="text-sm font-bold text-ink mb-3">Account</h3>
        <button
          onClick={handleLogout}
          className="btn-danger text-sm w-full"
          id="logout-btn"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
