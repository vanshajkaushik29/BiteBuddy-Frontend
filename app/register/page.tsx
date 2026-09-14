"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UtensilsCrossed, Eye, EyeOff, Loader2, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [pg, setPg] = useState({
    name: '',
    area: '',
    city: '',
    state: '',
    landmark: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPgDetails, setShowPgDetails] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit Indian number';
    if (!form.password) e.password = 'Password is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    // PG validation — all required by backend
    if (!pg.name.trim()) e.pgName = 'PG/Hostel name is required';
    if (!pg.area.trim()) e.pgArea = 'Area/Locality is required';
    if (!pg.city.trim()) e.pgCity = 'City is required';
    if (!pg.state) e.pgState = 'State is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      // Backend expects: { name, email, phone, password, pg: { name, area, city, state, landmark? } }
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        pg: {
          name: pg.name.trim(),
          area: pg.area.trim(),
          city: pg.city.trim(),
          state: pg.state,
          landmark: pg.landmark.trim() || undefined,
        },
      });
      success('Welcome to BiteBuddy! 🎉', 'Your account has been created.');
      router.push('/');
    } catch (err: any) {
      error('Registration failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const setPgField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPg(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [`pg${field.charAt(0).toUpperCase() + field.slice(1)}`]: '' }));
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-6 pb-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-indigo">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Create your account</h1>
          <p className="text-sm text-ink-muted mt-1">Join BiteBuddy and start sharing food with your PG mates</p>
        </div>

        <form onSubmit={handleSubmit} className="bb-card p-6 space-y-5">
          {/* Personal Info */}
          <div className="space-y-4">
            <div>
              <label className="bb-label">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={set('name')}
                className={`bb-input ${errors.name ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : ''}`}
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-danger-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="bb-label">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                className={`bb-input ${errors.email ? 'border-danger-500' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="bb-label">Phone number</label>
              <input
                id="phone"
                type="tel"
                placeholder="10-digit Indian number"
                value={form.phone}
                onChange={set('phone')}
                maxLength={10}
                className={`bb-input ${errors.phone ? 'border-danger-500' : ''}`}
                autoComplete="tel"
              />
              {errors.phone && <p className="text-xs text-danger-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="bb-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  className={`bb-input pr-10 ${errors.password ? 'border-danger-500' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="bb-label">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className={`bb-input ${errors.confirmPassword ? 'border-danger-500' : ''}`}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="text-xs text-danger-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* PG/Hostel Section */}
          <div className="border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setShowPgDetails(!showPgDetails)}
              className="w-full flex items-center justify-between text-sm font-semibold text-ink mb-3"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-500" />
                Your PG / Hostel
                <span className="text-xs font-normal text-ink-muted">(required)</span>
              </div>
              {showPgDetails ? <ChevronUp className="w-4 h-4 text-ink-muted" /> : <ChevronDown className="w-4 h-4 text-ink-muted" />}
            </button>

            {showPgDetails && (
              <div className="space-y-3 animate-slide-up">
                <p className="text-xs text-ink-muted bg-indigo-light rounded-lg px-3 py-2">
                  BiteBuddy connects you with people in your PG. If your PG already exists, you'll be linked automatically.
                </p>

                <div>
                  <label className="bb-label">PG / Hostel name</label>
                  <input
                    id="pg-name"
                    type="text"
                    placeholder="e.g. Boys PG Sector 62"
                    value={pg.name}
                    onChange={setPgField('name')}
                    className={`bb-input ${errors.pgName ? 'border-danger-500' : ''}`}
                  />
                  {errors.pgName && <p className="text-xs text-danger-500 mt-1">{errors.pgName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="bb-label">Area / Locality</label>
                    <input
                      id="pg-area"
                      type="text"
                      placeholder="e.g. Sector 62"
                      value={pg.area}
                      onChange={setPgField('area')}
                      className={`bb-input ${errors.pgArea ? 'border-danger-500' : ''}`}
                    />
                    {errors.pgArea && <p className="text-xs text-danger-500 mt-1">{errors.pgArea}</p>}
                  </div>
                  <div>
                    <label className="bb-label">City</label>
                    <input
                      id="pg-city"
                      type="text"
                      placeholder="e.g. Noida"
                      value={pg.city}
                      onChange={setPgField('city')}
                      className={`bb-input ${errors.pgCity ? 'border-danger-500' : ''}`}
                    />
                    {errors.pgCity && <p className="text-xs text-danger-500 mt-1">{errors.pgCity}</p>}
                  </div>
                </div>

                <div>
                  <label className="bb-label">State</label>
                  <select
                    id="pg-state"
                    value={pg.state}
                    onChange={setPgField('state')}
                    className={`bb-input ${errors.pgState ? 'border-danger-500' : ''}`}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.pgState && <p className="text-xs text-danger-500 mt-1">{errors.pgState}</p>}
                </div>

                <div>
                  <label className="bb-label">Landmark <span className="text-ink-faint font-normal normal-case">(optional)</span></label>
                  <input
                    id="pg-landmark"
                    type="text"
                    placeholder="e.g. Near City Centre Mall"
                    value={pg.landmark}
                    onChange={setPgField('landmark')}
                    className="bb-input"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            id="register-submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              : 'Create account'}
          </button>

          <p className="text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
