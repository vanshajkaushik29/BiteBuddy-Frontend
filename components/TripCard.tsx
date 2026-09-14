"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Trip } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { MapPin, Clock, Users, IndianRupee, Star, Building2 } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  showOrderButton?: boolean;
  currentUserId?: string;
}

export function TripCard({ trip, showOrderButton = true, currentUserId }: TripCardProps) {
  const tripId = trip._id;

  // Extract creator info
  const creator = typeof trip.createdBy === 'object' ? trip.createdBy : null;
  const creatorName = creator?.name ?? 'BiteBuddy User';
  const creatorInitial = creatorName.charAt(0).toUpperCase();
  const creatorRating = creator?.averageRating ?? 0;

  // Extract PG info
  const pg = typeof trip.pg === 'object' ? trip.pg : null;
  const pgName = pg?.name;
  const pgLocation = pg ? [pg.area, pg.city].filter(Boolean).join(', ') : null;

  // Slots
  const slotsLeft = trip.maxOrders - (trip.currentOrders ?? 0);
  const isFull = slotsLeft <= 0;
  const isCreator = currentUserId && (
    typeof trip.createdBy === 'string'
      ? trip.createdBy === currentUserId
      : trip.createdBy._id === currentUserId
  );

  // Times
  const departureDate = new Date(trip.departureTime);
  const cutoffDate = new Date(trip.acceptOrdersUntil);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatDate = (d: Date) => {
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const isPastCutoff = new Date() > cutoffDate;
  const canOrder = trip.status === 'ACTIVE' && !isFull && !isPastCutoff && !isCreator;

  return (
    <div className="bb-card bb-card-hover p-5 flex flex-col gap-4">
      {/* Header: Creator + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {creatorInitial}
          </div>
          <div>
            <div className="text-sm font-semibold text-ink leading-tight">{creatorName}</div>
            {creatorRating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-warning-500 text-warning-500" />
                <span className="text-xs text-ink-muted font-medium">{creatorRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      {/* Route Journey (From PG -> Going to Destination) */}
      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2">
        {/* From PG */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center flex-shrink-0 mt-0.5 text-ink-muted shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">From</div>
            <div className="text-xs font-bold text-ink truncate">
              {pgName || 'Current PG'}
              {pgLocation && <span className="text-ink-muted font-normal ml-1">({pgLocation})</span>}
            </div>
          </div>
        </div>

        {/* Connector Line */}
        <div className="pl-3 py-0">
          <div className="w-px h-2 bg-slate-300 ml-0.5" />
        </div>

        {/* Going To Destination */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-primary-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">Going to</div>
            <div className="text-sm font-bold text-ink truncate">{trip.destination}</div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="bg-slate-50 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1 text-ink-muted mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wide font-semibold">Departure</span>
          </div>
          <div className="font-bold text-ink">{formatDate(departureDate)}, {formatTime(departureDate)}</div>
        </div>
        <div className="bg-slate-50 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1 text-ink-muted mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wide font-semibold">Orders close</span>
          </div>
          <div className={`font-bold ${isPastCutoff ? 'text-danger-500' : 'text-ink'}`}>
            {isPastCutoff ? 'Closed' : formatTime(cutoffDate)}
          </div>
        </div>
      </div>

      {/* Footer: Fee + Slots + CTA */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-0.5 text-sm font-bold text-ink">
              <IndianRupee className="w-3.5 h-3.5 text-primary-600" />
              {trip.carryingFee} fee
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${
              isFull ? 'text-danger-500' : 'text-ink-muted'
            }`}>
              <Users className="w-3.5 h-3.5" />
              {trip.currentOrders ?? 0}/{trip.maxOrders} spots
            </div>
          </div>
          <div className="text-[10px] text-primary-600 font-medium">
            + ₹4 min platform fee
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/trips/${tripId}`}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            Details
          </Link>
          {showOrderButton && trip.status === 'ACTIVE' && !isCreator && (
            <Link
              href={`/trips/${tripId}`}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                canOrder
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-indigo'
                  : 'bg-slate-100 text-ink-muted cursor-not-allowed'
              }`}
              aria-disabled={!canOrder}
            >
              {isFull ? 'Full' : isPastCutoff ? 'Closed' : 'Order Food'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
