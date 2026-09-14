"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { api, Trip } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TripCard } from '@/components/TripCard';
import { OrderCard } from '@/components/OrderCard';
import { TripCardSkeleton, OrderCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/context/ToastContext';
import {
  Navigation,
  Package,
  Clock,
  Users,
  IndianRupee,
  Loader2,
  CheckCircle2,
  Trash2,
  PackageCheck,
  Zap,
  LayoutList,
} from 'lucide-react';
import { Order } from '@/lib/api';

type TabType = 'active' | 'all';

export default function MyTripsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripOrders, setTripOrders] = useState<Record<string, Order[]>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const fetchMyTrips = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const myTrips = await api.trips.getMyTrips();
      setTrips(myTrips);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMyTrips();
    }
  }, [user, authLoading, fetchMyTrips, router]);

  const fetchOrdersForTrip = async (tripId: string) => {
    try {
      const orders = await api.orders.getTripOrders(tripId);
      setTripOrders(prev => ({ ...prev, [tripId]: orders }));
    } catch {}
  };

  const toggleExpand = (tripId: string) => {
    if (expandedTrip === tripId) {
      setExpandedTrip(null);
    } else {
      setExpandedTrip(tripId);
      if (!tripOrders[tripId]) {
        fetchOrdersForTrip(tripId);
      }
    }
  };

  const handleComplete = async (tripId: string) => {
    if (!confirm('Mark this trip as completed?')) return;
    setActionLoading(prev => ({ ...prev, [tripId]: true }));
    try {
      await api.trips.complete(tripId);
      success('Trip completed!');
      await fetchMyTrips();
    } catch (err: any) {
      error('Failed', err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [tripId]: false }));
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('Delete this trip permanently?')) return;
    setActionLoading(prev => ({ ...prev, [tripId]: true }));
    try {
      await api.trips.delete(tripId);
      success('Trip deleted');
      setTrips(prev => prev.filter(t => t._id !== tripId));
    } catch (err: any) {
      error('Cannot delete', err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [tripId]: false }));
    }
  };

  const activeTrips = trips.filter(t => t.status === 'ACTIVE' || t.status === 'STARTED');
  const filteredTrips = activeTab === 'active' ? activeTrips : trips;

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div className="h-7 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => <TripCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Trips</h1>
          <p className="page-subtitle">Trips you&apos;ve created for your PG.</p>
        </div>
        <button
          onClick={() => router.push('/trips/create')}
          className="btn-primary text-sm"
          id="create-new-trip"
        >
          + New Trip
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('active')}
          id="tab-active-trips"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'active'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${activeTab === 'active' ? 'text-primary-600' : 'text-ink-muted'}`} />
          Active Trips
          {activeTrips.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
              activeTab === 'active' ? 'bg-primary-600 text-white' : 'bg-slate-300 text-ink-muted'
            }`}>
              {activeTrips.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          id="tab-all-trips"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'all'
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <LayoutList className="w-3.5 h-3.5" />
          All Trips
          {trips.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
              activeTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-300 text-ink-muted'
            }`}>
              {trips.length}
            </span>
          )}
        </button>
      </div>

      {filteredTrips.length === 0 ? (
        <EmptyState
          icon={Navigation}
          title={activeTab === 'active' ? 'No active trips' : 'No trips yet'}
          description={
            activeTab === 'active'
              ? trips.length > 0
                ? "You don't have any active or started trips right now. Switch to 'All Trips' to view history or create a new trip."
                : "Create your first trip and start earning rewards by carrying food for your hostel mates."
              : "Create your first trip and start earning rewards by carrying food for your hostel mates."
          }
          actionText={activeTab === 'active' && trips.length > 0 ? '+ New Trip' : 'Create a Trip'}
          actionHref="/trips/create"
        />
      ) : (
        <div className="space-y-4">
          {filteredTrips.map(trip => {
            const isLoading = actionLoading[trip._id];
            const expanded = expandedTrip === trip._id;
            const orders = tripOrders[trip._id];
            const pg = typeof trip.pg === 'object' ? trip.pg : null;
            const pgName = pg?.name;
            const pgLocation = pg ? [pg.area, pg.city].filter(Boolean).join(', ') : null;

            return (
              <div key={trip._id} className="bb-card overflow-hidden">
                <div className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-0.5">
                        <span className="font-semibold text-ink">{pgName || 'Your PG'}</span>
                        {pgLocation && <span className="text-ink-muted">({pgLocation})</span>}
                        <span>→</span>
                      </div>
                      <div className="text-base font-bold text-ink">{trip.destination}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(trip.departureTime).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {trip.currentOrders ?? 0}/{trip.maxOrders}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {trip.carryingFee} fee
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
                    <button
                      onClick={() => toggleExpand(trip._id)}
                      className="btn-ghost text-xs"
                      id={`view-orders-${trip._id}`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      {expanded ? 'Hide' : 'View'} Orders ({trip.currentOrders ?? 0})
                    </button>

                    {trip.status === 'STARTED' && (
                      <button
                        onClick={() => handleComplete(trip._id)}
                        disabled={isLoading}
                        className="btn-teal text-xs"
                        id={`complete-trip-${trip._id}`}
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Complete Trip
                      </button>
                    )}

                    {trip.status === 'ACTIVE' && (trip.currentOrders ?? 0) === 0 && (
                      <button
                        onClick={() => handleDelete(trip._id)}
                        disabled={isLoading}
                        className="btn-ghost text-xs text-danger-500 hover:bg-danger-50"
                        id={`delete-trip-${trip._id}`}
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Orders */}
                {expanded && (
                  <div className="border-t border-border bg-slate-50 p-4 space-y-3 animate-slide-up">
                    {!orders ? (
                      <OrderCardSkeleton />
                    ) : orders.filter(o => o.status !== 'CANCELLED').length === 0 ? (
                      <p className="text-sm text-ink-muted text-center py-4">No orders on this trip yet.</p>
                    ) : (
                      orders
                        .filter(o => o.status !== 'CANCELLED')
                        .map(order => (
                          <OrderCard
                            key={order._id}
                            order={order}
                            viewAs="carrier"
                            onRefresh={() => fetchOrdersForTrip(trip._id)}
                          />
                        ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
