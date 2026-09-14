"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Trip, Order } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderCard } from '@/components/OrderCard';
import { TripCardSkeleton } from '@/components/Skeleton';
import {
  MapPin,
  Clock,
  Users,
  IndianRupee,
  ArrowLeft,
  Loader2,
  UtensilsCrossed,
  PackageCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FileText,
  Building2,
  Phone,
  MessageSquare,
} from 'lucide-react';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrder, setMyOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Order form state
  const [orderForm, setOrderForm] = useState({
    food: '',
    price: '',
    quantity: '1',
    pickupLocation: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showOrderForm, setShowOrderForm] = useState(false);

  const fetchData = useCallback(async () => {
    // Fetch trip and orders INDEPENDENTLY so empty orders list never breaks the trip view
    try {
      const tripData = await api.trips.getById(id);
      setTrip(tripData);
    } catch (err: any) {
      error('Failed to load trip', err.message);
      setLoading(false);
      return;
    }

    // Orders are optional — a new trip has 0 orders, which is fine
    let ordersData: Order[] = [];
    try {
      ordersData = await api.orders.getTripOrders(id);
    } catch {
      // No orders yet — this is normal, don't show an error
      ordersData = [];
    }
    setOrders(ordersData);

    // Find my order
    if (user) {
      const mine = ordersData.find(o => {
        const ob = o.orderedBy;
        if (typeof ob === 'string') return ob === user._id;
        return ob._id === user._id;
      });
      setMyOrder(mine ?? null);
    }

    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user) {
    router.push('/login');
    return null;
  }

  const isCreator = trip && (
    typeof trip.createdBy === 'string'
      ? trip.createdBy === user._id
      : trip.createdBy._id === user._id
  );

  const carrier = typeof trip?.createdBy === 'object' ? trip.createdBy : null;
  const carrierName = carrier?.name ?? 'Deliverer';
  const carrierPhone = carrier?.phone;

  const now = new Date();
  const isPastCutoff = trip ? new Date(trip.acceptOrdersUntil) < now : false;
  const isFull = trip ? (trip.currentOrders ?? 0) >= trip.maxOrders : false;
  const canPlaceOrder = trip?.status === 'ACTIVE' && !isPastCutoff && !isFull && !isCreator && !myOrder;

  // Extract PG info
  const pg = typeof trip?.pg === 'object' ? trip.pg : null;
  const pgName = pg?.name;
  const pgLocation = pg ? [pg.area, pg.city].filter(Boolean).join(', ') : null;

  // ── Formatted dates ──────────────────────────────────────────────────────────
  const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
  });

  // ── Order form validation ────────────────────────────────────────────────────
  const validateOrder = () => {
    const e: Record<string, string> = {};
    if (!orderForm.food.trim()) e.food = 'Food item name is required';
    if (!orderForm.price || Number(orderForm.price) < 0) e.price = 'Price must be 0 or more';
    if (!orderForm.quantity || Number(orderForm.quantity) < 1) e.quantity = 'Quantity must be at least 1';
    if (!orderForm.pickupLocation.trim()) e.pickupLocation = 'Pickup location is required';
    return e;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateOrder();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setActionLoading(true);
    try {
      // Backend: { tripId, food, price, quantity, pickupLocation }
      await api.orders.create({
        tripId: id,
        food: orderForm.food.trim(),
        price: Number(orderForm.price),
        quantity: Number(orderForm.quantity),
        pickupLocation: orderForm.pickupLocation.trim(),
      });
      success('Order placed! 🎉', 'The carrier will bring your food back.');
      setShowOrderForm(false);
      await fetchData();
    } catch (err: any) {
      error('Order failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await api.trips.delete(id);
      success('Trip deleted');
      router.push('/my-trips');
    } catch (err: any) {
      error('Cannot delete trip', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!confirm('Mark this trip as completed?')) return;
    setActionLoading(true);
    try {
      await api.trips.complete(id);
      success('Trip completed!', 'Rewards have been tallied.');
      await fetchData();
    } catch (err: any) {
      error('Could not complete trip', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelMyOrder = async () => {
    if (!myOrder) return;
    if (!confirm('Cancel your order?')) return;
    setActionLoading(true);
    try {
      await api.orders.cancel(myOrder._id);
      success('Order cancelled');
      await fetchData();
    } catch (err: any) {
      error('Cannot cancel order', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Estimated total for order form (Food + Carrying Fee + ₹4 Platform Fee) ───
  const estimatedTotal = trip
    ? (Number(orderForm.price) || 0) * (Number(orderForm.quantity) || 1) + trip.carryingFee + 4
    : 0;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <TripCardSkeleton />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertCircle className="w-10 h-10 text-danger-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-ink">Trip not found</h2>
        <button onClick={() => router.back()} className="btn-primary mt-4 text-sm">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Back */}
      <button onClick={() => router.back()} className="btn-ghost text-xs -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Trip Card */}
      <div className="bb-card p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Origin & Destination route header */}
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="font-semibold text-ink truncate">From: {pgName || 'Current PG'} {pgLocation && `(${pgLocation})`}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-light flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <div className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">Going to</div>
                <h1 className="text-xl font-bold text-ink leading-tight">{trip.destination}</h1>
              </div>
            </div>
          </div>
          <StatusBadge status={trip.status} />
        </div>

        {/* Deliverer Contact Card (shown to requesters) */}
        {!isCreator && carrier && (
          <div className="flex items-center justify-between p-3 bg-indigo-50/60 border border-primary-100 rounded-2xl text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-bold text-sm flex-shrink-0">
                {carrierName.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="font-semibold text-ink truncate">{carrierName} <span className="text-[10px] text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded font-medium">Deliverer</span></div>
                <div className="text-ink-muted text-xs font-mono">{carrierPhone || 'PG Friend'}</div>
              </div>
            </div>
            {carrierPhone && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={`tel:${carrierPhone}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/${carrierPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1 text-ink-muted mb-1">
              <Clock className="w-3.5 h-3.5" /> Departure
            </div>
            <div className="font-bold text-ink">{fmt(trip.departureTime)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1 text-ink-muted mb-1">
              <Clock className="w-3.5 h-3.5" /> Orders close
            </div>
            <div className={`font-bold ${isPastCutoff ? 'text-danger-500' : 'text-ink'}`}>
              {isPastCutoff ? 'Closed' : fmt(trip.acceptOrdersUntil)}
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1 text-ink-muted mb-1">
              <Clock className="w-3.5 h-3.5" /> Returns by
            </div>
            <div className="font-bold text-ink">{fmt(trip.expectedReturnTime)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1 text-ink-muted mb-1">
              <Users className="w-3.5 h-3.5" /> Orders
            </div>
            <div className="font-bold text-ink">
              {trip.currentOrders ?? 0} / {trip.maxOrders} spots used
            </div>
          </div>
        </div>

        {/* Carrying Fee & Platform Fee Notice */}
        <div className="flex flex-col p-4 bg-indigo-light rounded-2xl border border-primary-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-800">
              <IndianRupee className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold">Carrying fee per order</span>
            </div>
            <span className="text-xl font-extrabold text-primary-700">₹{trip.carryingFee}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-primary-700/80 pt-1.5 border-t border-primary-200/50">
            <span>BiteBuddy Platform Fee</span>
            <span className="font-bold text-primary-800">+ ₹4 min platform fee</span>
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <div className="flex items-start gap-2.5 text-sm text-ink-muted bg-slate-50 rounded-xl px-4 py-3">
            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-ink-faint" />
            <span>{trip.notes}</span>
          </div>
        )}

        {/* Creator Actions */}
        {isCreator && (
          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Your trip</p>
            <div className="flex flex-wrap gap-2">
              {trip.status === 'STARTED' && (
                <button
                  onClick={handleCompleteTrip}
                  disabled={actionLoading}
                  className="btn-teal text-sm"
                  id="complete-trip"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Complete Trip
                </button>
              )}
              {(trip.status === 'ACTIVE' || trip.status === 'CANCELLED') && trip.currentOrders === 0 && (
                <button
                  onClick={handleDeleteTrip}
                  disabled={actionLoading}
                  className="btn-danger text-sm"
                  id="delete-trip"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Trip
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── My Existing Order ── */}
      {myOrder && !isCreator && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-ink">Your Order</h2>
          <OrderCard order={myOrder} viewAs="requester" onRefresh={fetchData} />
          {(myOrder.status === 'ACCEPTED') && (
            <button
              onClick={handleCancelMyOrder}
              disabled={actionLoading}
              className="btn-ghost text-xs text-danger-500 hover:bg-danger-50 w-full"
              id="cancel-order"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Cancel order
              {trip.status === 'STARTED' ? ' (−10 points penalty)' : ''}
            </button>
          )}
        </div>
      )}

      {/* ── Place Order Form ── */}
      {canPlaceOrder && !showOrderForm && (
        <button
          onClick={() => setShowOrderForm(true)}
          className="w-full btn-primary py-3.5 text-sm"
          id="open-order-form"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Order Food from this Trip
        </button>
      )}

      {canPlaceOrder && showOrderForm && (
        <div className="bb-card p-6 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Place your order</h2>
            <button onClick={() => setShowOrderForm(false)} className="btn-ghost text-xs">Cancel</button>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="bb-label">What do you want?</label>
              <input
                id="order-food"
                type="text"
                placeholder="e.g. Burger, Biryani, Cold coffee"
                value={orderForm.food}
                onChange={e => {
                  setOrderForm(p => ({ ...p, food: e.target.value }));
                  setFormErrors(p => ({ ...p, food: '' }));
                }}
                className={`bb-input ${formErrors.food ? 'border-danger-500' : ''}`}
              />
              {formErrors.food && <p className="text-xs text-danger-500 mt-1">{formErrors.food}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="bb-label">Price per item (₹)</label>
                <input
                  id="order-price"
                  type="number"
                  min="0"
                  placeholder="e.g. 120"
                  value={orderForm.price}
                  onChange={e => {
                    setOrderForm(p => ({ ...p, price: e.target.value }));
                    setFormErrors(p => ({ ...p, price: '' }));
                  }}
                  className={`bb-input ${formErrors.price ? 'border-danger-500' : ''}`}
                />
                {formErrors.price && <p className="text-xs text-danger-500 mt-1">{formErrors.price}</p>}
              </div>
              <div>
                <label className="bb-label">Quantity</label>
                <input
                  id="order-quantity"
                  type="number"
                  min="1"
                  value={orderForm.quantity}
                  onChange={e => {
                    setOrderForm(p => ({ ...p, quantity: e.target.value }));
                    setFormErrors(p => ({ ...p, quantity: '' }));
                  }}
                  className={`bb-input ${formErrors.quantity ? 'border-danger-500' : ''}`}
                />
                {formErrors.quantity && <p className="text-xs text-danger-500 mt-1">{formErrors.quantity}</p>}
              </div>
            </div>

            <div>
              <label className="bb-label">Where to hand it over?</label>
              <input
                id="order-pickup"
                type="text"
                placeholder="e.g. Room 203, Ground floor lobby"
                value={orderForm.pickupLocation}
                onChange={e => {
                  setOrderForm(p => ({ ...p, pickupLocation: e.target.value }));
                  setFormErrors(p => ({ ...p, pickupLocation: '' }));
                }}
                className={`bb-input ${formErrors.pickupLocation ? 'border-danger-500' : ''}`}
              />
              {formErrors.pickupLocation && <p className="text-xs text-danger-500 mt-1">{formErrors.pickupLocation}</p>}
            </div>

            {/* Price Preview */}
            {orderForm.price && (
              <div className="bg-teal-light border border-teal-200 rounded-xl px-4 py-3 text-sm space-y-1.5">
                <div className="flex justify-between text-ink-muted text-xs">
                  <span>Food ({orderForm.quantity || 1}×)</span>
                  <span>₹{(Number(orderForm.price) || 0) * (Number(orderForm.quantity) || 1)}</span>
                </div>
                <div className="flex justify-between text-ink-muted text-xs">
                  <span>Buddy Carrying fee</span>
                  <span>₹{trip.carryingFee}</span>
                </div>
                <div className="flex justify-between text-ink-muted text-xs">
                  <span>Platform fee</span>
                  <span>₹4</span>
                </div>
                <div className="flex justify-between font-bold text-ink border-t border-teal-200 pt-1.5">
                  <span>You pay</span>
                  <span className="text-teal-600">₹{estimatedTotal}</span>
                </div>
                <div className="text-[11px] text-teal-800 font-medium pt-1 text-center">
                  🎉 You saved ~₹50+ compared to commercial delivery apps!
                </div>
              </div>
            )}

            <button
              type="submit"
              id="submit-order"
              disabled={actionLoading}
              className="w-full btn-primary py-3 text-sm"
            >
              {actionLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing order...</>
                : 'Confirm Order'}
            </button>
          </form>
        </div>
      )}

      {/* ── Why can't order ── */}
      {!isCreator && !myOrder && !canPlaceOrder && trip.status === 'ACTIVE' && (
        <div className="bb-card px-5 py-4 flex items-center gap-3 text-sm text-ink-muted">
          <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0" />
          {isFull ? 'This trip is fully booked.'
           : isPastCutoff ? 'Order deadline has passed.'
           : 'Orders are not being accepted.'}
        </div>
      )}

      {/* ── All Orders (carrier view) ── */}
      {isCreator && orders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-ink">
            Orders on your trip ({orders.length})
          </h2>
          {orders
            .filter(o => o.status !== 'CANCELLED')
            .map(order => (
              <OrderCard
                key={order._id}
                order={order}
                viewAs="carrier"
                onRefresh={fetchData}
              />
            ))}
        </div>
      )}
    </div>
  );
}
