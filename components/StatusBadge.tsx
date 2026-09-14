"use client";

import React from 'react';
import type { TripStatus, OrderStatus } from '@/lib/api';

interface StatusBadgeProps {
  status: TripStatus | OrderStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  // Trip statuses
  ACTIVE:    { label: 'Active',     className: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-500' },
  STARTED:   { label: 'On the way', className: 'bg-warning-100 text-warning-600', dot: 'bg-warning-500' },
  COMPLETED: { label: 'Completed',  className: 'bg-success-100 text-success-700', dot: 'bg-success-500' },
  CANCELLED: { label: 'Cancelled',  className: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400' },
  // Order statuses
  ACCEPTED:  { label: 'Accepted',   className: 'bg-indigo-light text-primary-600', dot: 'bg-primary-600' },
  DELIVERED: { label: 'Delivered',  className: 'bg-warning-100 text-warning-600',  dot: 'bg-warning-500' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-500',
    dot: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}
