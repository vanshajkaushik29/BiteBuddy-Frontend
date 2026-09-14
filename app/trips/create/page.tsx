"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  Clock,
  Users,
  IndianRupee,
  FileText,
  Loader2,
  ArrowLeft,
  Info,
} from 'lucide-react';

export default function CreateTripPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState({
    destination: '',
    departureTime: '',
    acceptOrdersUntil: '',
    expectedReturnTime: '',
    maxOrders: '3',
    carryingFee: '20',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const now = new Date();

    if (!form.destination.trim()) e.destination = 'Destination is required';
    if (!form.departureTime) e.departureTime = 'Departure time is required';
    if (!form.acceptOrdersUntil) e.acceptOrdersUntil = 'Order cutoff time is required';
    if (!form.expectedReturnTime) e.expectedReturnTime = 'Expected return time is required';
    if (!form.maxOrders || Number(form.maxOrders) < 1) e.maxOrders = 'At least 1 order';
    if (form.carryingFee === '' || Number(form.carryingFee) < 0) e.carryingFee = 'Carrying fee must be 0 or more';

    if (form.departureTime && new Date(form.departureTime) <= now) {
      e.departureTime = 'Departure must be in the future';
    }
    if (form.departureTime && form.acceptOrdersUntil) {
      if (new Date(form.acceptOrdersUntil) >= new Date(form.departureTime)) {
        e.acceptOrdersUntil = 'Must be before departure time';
      }
    }
    if (form.departureTime && form.expectedReturnTime) {
      if (new Date(form.expectedReturnTime) <= new Date(form.departureTime)) {
        e.expectedReturnTime = 'Must be after departure time';
      }
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      // Backend expects: { destination, departureTime, acceptOrdersUntil, expectedReturnTime, maxOrders, carryingFee, notes? }
      const trip = await api.trips.create({
        destination: form.destination.trim(),
        departureTime: new Date(form.departureTime).toISOString(),
        acceptOrdersUntil: new Date(form.acceptOrdersUntil).toISOString(),
        expectedReturnTime: new Date(form.expectedReturnTime).toISOString(),
        maxOrders: Number(form.maxOrders),
        carryingFee: Number(form.carryingFee),
        notes: form.notes.trim() || undefined,
      });
      success('Trip created! 🎉', 'Your mates can now order food for your trip.');
      router.push(`/trips/${trip._id}`);
    } catch (err: any) {
      error('Could not create trip', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: minimum datetime for inputs
  const nowISO = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="btn-ghost mb-4 text-xs -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="page-title">Going somewhere?</h1>
        <p className="page-subtitle">Take someone&apos;s food with you and earn rewards.</p>
      </div>

      <form onSubmit={handleSubmit} className="bb-card p-6 space-y-5">

        {/* Destination */}
        <div>
          <label className="bb-label flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-500" />
            Destination
          </label>
          <input
            id="destination"
            type="text"
            placeholder="e.g. Sector 18 Market, Connaught Place"
            value={form.destination}
            onChange={set('destination')}
            className={`bb-input ${errors.destination ? 'border-danger-500' : ''}`}
          />
          {errors.destination && <p className="text-xs text-danger-500 mt-1">{errors.destination}</p>}
        </div>

        {/* Departure Time */}
        <div>
          <label className="bb-label flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary-400" />
            Departure time
          </label>
          <input
            id="departureTime"
            type="datetime-local"
            min={nowISO}
            value={form.departureTime}
            onChange={set('departureTime')}
            className={`bb-input ${errors.departureTime ? 'border-danger-500' : ''}`}
          />
          {errors.departureTime && <p className="text-xs text-danger-500 mt-1">{errors.departureTime}</p>}
        </div>

        {/* Accept Orders Until */}
        <div>
          <label className="bb-label flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-warning-500" />
            Accept orders until
            <span className="text-ink-faint font-normal normal-case text-xs">(before departure)</span>
          </label>
          <input
            id="acceptOrdersUntil"
            type="datetime-local"
            min={nowISO}
            max={form.departureTime || undefined}
            value={form.acceptOrdersUntil}
            onChange={set('acceptOrdersUntil')}
            className={`bb-input ${errors.acceptOrdersUntil ? 'border-danger-500' : ''}`}
          />
          {errors.acceptOrdersUntil && <p className="text-xs text-danger-500 mt-1">{errors.acceptOrdersUntil}</p>}
        </div>

        {/* Expected Return */}
        <div>
          <label className="bb-label flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            Expected return time
          </label>
          <input
            id="expectedReturnTime"
            type="datetime-local"
            min={form.departureTime || nowISO}
            value={form.expectedReturnTime}
            onChange={set('expectedReturnTime')}
            className={`bb-input ${errors.expectedReturnTime ? 'border-danger-500' : ''}`}
          />
          {errors.expectedReturnTime && <p className="text-xs text-danger-500 mt-1">{errors.expectedReturnTime}</p>}
        </div>

        {/* Max Orders + Carrying Fee */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="bb-label flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary-400" />
              Max orders
            </label>
            <input
              id="maxOrders"
              type="number"
              min="1"
              max="20"
              value={form.maxOrders}
              onChange={set('maxOrders')}
              className={`bb-input ${errors.maxOrders ? 'border-danger-500' : ''}`}
            />
            {errors.maxOrders && <p className="text-xs text-danger-500 mt-1">{errors.maxOrders}</p>}
          </div>
          <div>
            <label className="bb-label flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-teal-500" />
              Carrying fee (₹)
            </label>
            <input
              id="carryingFee"
              type="number"
              min="0"
              placeholder="0"
              value={form.carryingFee}
              onChange={set('carryingFee')}
              className={`bb-input ${errors.carryingFee ? 'border-danger-500' : ''}`}
            />
            {errors.carryingFee && <p className="text-xs text-danger-500 mt-1">{errors.carryingFee}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="bb-label flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-ink-muted" />
            Notes <span className="text-ink-faint font-normal normal-case text-xs">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Any specific instructions — e.g. only restaurants, not street food"
            value={form.notes}
            onChange={set('notes')}
            className="bb-input resize-none"
          />
        </div>

        {/* Tip */}
        <div className="bg-indigo-light rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs text-primary-700">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Once your trip starts (after departure time), you can mark orders as delivered.
            Earn <strong>+10 reward points</strong> for each confirmed delivery.
          </span>
        </div>

        <button
          type="submit"
          id="create-trip-submit"
          disabled={loading}
          className="w-full btn-primary py-3 text-sm"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating trip...</>
            : 'Create Trip'}
        </button>
      </form>
    </div>
  );
}
