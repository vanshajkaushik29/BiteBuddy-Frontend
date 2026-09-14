"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { api, Trip } from '@/lib/api';
import { TripCard } from '@/components/TripCard';
import { TripCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { Search, SlidersHorizontal, X, Zap, LayoutList } from 'lucide-react';

export default function FindFoodPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filtered, setFiltered] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch active trips for user's PG
      const data = await api.trips.getAll();
      setTrips(data);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Apply filters client-side
  useEffect(() => {
    let result = [...trips];

    // Exclude user's own trips from the active view
    if (user) {
      result = result.filter(t => {
        const creator = t.createdBy;
        if (typeof creator === 'string') return creator !== user._id;
        return creator._id !== user._id;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => t.destination.toLowerCase().includes(q));
    }

    if (maxFee) {
      result = result.filter(t => t.carryingFee <= Number(maxFee));
    }

    if (onlyAvailable) {
      const now = new Date();
      result = result.filter(t =>
        t.status === 'ACTIVE' &&
        (t.currentOrders ?? 0) < t.maxOrders &&
        new Date(t.acceptOrdersUntil) > now
      );
    }

    setFiltered(result);
  }, [trips, search, maxFee, onlyAvailable, user]);

  const clearFilters = () => {
    setSearch('');
    setMaxFee('');
    setOnlyAvailable(false);
  };

  const hasFilters = search || maxFee || onlyAvailable;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Find Food</h1>
        <p className="page-subtitle">Browse trips from your PG and place your order.</p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search destination..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bb-input pl-10"
              id="search-destination"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost border border-border px-3.5 flex-shrink-0 ${showFilters ? 'bg-indigo-light text-primary-600 border-primary-200' : ''}`}
            id="toggle-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Filters</span>
            {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-600 ml-1" />}
          </button>
        </div>

        {showFilters && (
          <div className="bb-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
            <div>
              <label className="bb-label">Max carrying fee (₹)</label>
              <input
                type="number"
                placeholder="e.g. 30"
                value={maxFee}
                onChange={e => setMaxFee(e.target.value)}
                min="0"
                className="bb-input"
                id="max-fee-filter"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                  className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${
                    onlyAvailable ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${
                    onlyAvailable ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </div>
                <span className="text-sm text-ink font-medium">Available slots only</span>
              </label>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-ghost text-xs col-span-full flex items-center gap-1.5 justify-start">
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <TripCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={
            hasFilters
              ? 'No trips match your filters'
              : 'No active trips from your PG'
          }
          description={
            hasFilters
              ? 'Try adjusting your filters or search.'
              : 'Be the first! Create a trip and let your PG mates order from you.'
          }
          actionText={hasFilters ? 'Clear filters' : 'Going Out?'}
          actionHref={hasFilters ? '#' : '/trips/create'}
        />
      ) : (
        <>
          <p className="text-xs text-ink-muted font-medium">
            {filtered.length} active trip{filtered.length !== 1 ? 's' : ''} • accepting orders
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(trip => (
              <TripCard
                key={trip._id}
                trip={trip}
                currentUserId={user?._id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
