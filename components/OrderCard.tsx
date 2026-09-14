"use client";

import React, { useState } from 'react';
import { Order, api } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { useToast } from '@/context/ToastContext';
import {
  ShoppingBag,
  MapPin,
  IndianRupee,
  CheckCircle2,
  PackageCheck,
  Loader2,
  AlertCircle,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  /**
   * 'requester' — the person who placed the order (can confirm delivery)
   * 'carrier'   — the trip creator (can mark as delivered)
   */
  viewAs: 'requester' | 'carrier';
  onRefresh: () => void;
}

export function OrderCard({ order, viewAs, onRefresh }: OrderCardProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  // Extract trip info & carrier info
  const trip = typeof order.trip === 'object' ? order.trip : null;
  const destination = trip?.destination ?? 'Unknown destination';
  const carrier = typeof trip?.createdBy === 'object' ? trip.createdBy : null;
  const carrierName = carrier?.name ?? 'Deliverer';
  const carrierPhone = carrier?.phone;

  // Extract requester info
  const requester = typeof order.orderedBy === 'object' ? order.orderedBy : null;
  const requesterName = requester?.name ?? 'A student';
  const requesterPhone = requester?.phone;

  const handleMarkDelivered = async () => {
    setLoading(true);
    try {
      await api.orders.deliver(order._id);
      success('Order marked as delivered', 'Waiting for the requester to confirm receipt.');
      onRefresh();
    } catch (err: any) {
      error('Could not mark delivered', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceived = async () => {
    setLoading(true);
    try {
      await api.orders.confirm(order._id);
      success('Order confirmed! 🎉', 'Your buddy earned +10 reward points.');
      onRefresh();
    } catch (err: any) {
      error('Could not confirm', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bb-card p-5 space-y-4 ${order.status === 'DELIVERED' && viewAs === 'requester' ? 'border-warning-400 border-2' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-light flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-ink">
              {order.food} × {order.quantity}
            </div>
            {viewAs === 'carrier' && (
              <div className="text-xs text-ink-muted">Ordered by <span className="font-semibold text-ink">{requesterName}</span></div>
            )}
            {viewAs === 'requester' && (
              <div className="flex items-center gap-1 text-xs text-ink-muted">
                <MapPin className="w-3 h-3 text-primary-500" /> {destination} • <span className="text-ink font-medium">Deliverer: {carrierName}</span>
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Mutual Phone & Contact Box */}
      {viewAs === 'carrier' && requesterPhone && (
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-border rounded-xl text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
              {requesterName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="font-semibold text-ink truncate">{requesterName}</div>
              <div className="text-ink-muted text-[11px] font-mono">{requesterPhone}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a
              href={`tel:${requesterPhone}`}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-xs font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
            <a
              href={`https://wa.me/${requesterPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      )}

      {viewAs === 'requester' && carrierPhone && (
        <div className="flex items-center justify-between p-2.5 bg-indigo-50/50 border border-primary-100 rounded-xl text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-bold text-xs flex-shrink-0">
              {carrierName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="font-semibold text-ink truncate">{carrierName} (Deliverer)</div>
              <div className="text-ink-muted text-[11px] font-mono">{carrierPhone}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a
              href={`tel:${carrierPhone}`}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
            <a
              href={`https://wa.me/${carrierPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Pickup location */}
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
        <span>Pickup: <span className="text-ink font-medium">{order.pickupLocation}</span></span>
      </div>

      {/* Price breakdown */}
      <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-ink-muted">
          <span>Food ({order.quantity}×)</span>
          <span className="font-medium text-ink">₹{order.price * order.quantity}</span>
        </div>
        <div className="flex justify-between text-ink-muted">
          <span>Carrying fee</span>
          <span className="font-medium text-ink">₹{order.carryingFee}</span>
        </div>
        <div className="flex justify-between text-ink-muted">
          <span>Platform fee</span>
          <span className="font-medium text-ink">₹{order.platformFee ?? 4}</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-ink pt-1.5 border-t border-border">
          <span>Total</span>
          <span className="text-primary-600">₹{order.totalPrice}</span>
        </div>
      </div>

      {/* ── Carrier Action: Mark Delivered ── */}
      {viewAs === 'carrier' && order.status === 'ACCEPTED' && (
        <button
          onClick={handleMarkDelivered}
          disabled={loading}
          className="w-full btn-primary text-sm gap-2"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
            : <><PackageCheck className="w-4 h-4" /> Mark as Delivered</>
          }
        </button>
      )}

      {/* ── Requester Action: Confirm Received ── */}
      {viewAs === 'requester' && order.status === 'DELIVERED' && (
        <div className="rounded-xl border-2 border-warning-400 bg-warning-50 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-ink">Your food has arrived! 🎉</div>
              <div className="text-xs text-ink-muted mt-0.5">
                Did you receive your order? Confirm to award your buddy <span className="font-semibold text-primary-600">+10 reward points</span>.
              </div>
            </div>
          </div>
          <button
            onClick={handleConfirmReceived}
            disabled={loading}
            className="w-full btn-teal text-sm gap-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
              : <><CheckCircle2 className="w-4 h-4" /> Confirm Received</>
            }
          </button>
        </div>
      )}

      {/* Completed state */}
      {order.status === 'COMPLETED' && (
        <div className="flex items-center gap-2 text-sm text-success-700 bg-success-50 rounded-xl px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-semibold">Completed — reward points awarded</span>
        </div>
      )}

      {/* Cancelled state */}
      {order.status === 'CANCELLED' && (
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">Order cancelled</span>
        </div>
      )}
    </div>
  );
}
