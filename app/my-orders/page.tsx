"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { api, Order } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { OrderCard } from '@/components/OrderCard';
import { OrderCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ShoppingBag } from 'lucide-react';

type StatusFilter = 'all' | 'ACCEPTED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

const FILTER_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'ACCEPTED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // GET /api/orders — returns orders placed by the current user
      const data = await api.orders.getMyOrders();
      // Sort: newest first
      data.sort((a, b) => new Date(b.createdAt ?? b.orderTime).getTime() - new Date(a.createdAt ?? a.orderTime).getTime());
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchOrders();
    }
  }, [user, authLoading, fetchOrders, router]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  // Count per status for tabs
  const counts: Record<string, number> = { all: orders.length };
  orders.forEach(o => {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  });

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div className="h-7 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <OrderCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">Food you&apos;ve ordered from your PG buddies.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            id={`filter-${tab.value}`}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === tab.value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-border text-ink-muted hover:text-ink hover:border-primary-300'
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-ink-muted'
              }`}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={filter === 'all' ? "You haven't placed any orders yet" : `No ${filter.toLowerCase()} orders`}
          description={
            filter === 'all'
              ? 'Browse active trips from your PG and order food you want!'
              : 'Your orders with this status will appear here.'
          }
          actionText={filter === 'all' ? 'Find Food' : undefined}
          actionHref={filter === 'all' ? '/trips' : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              viewAs="requester"
              onRefresh={fetchOrders}
            />
          ))}
        </div>
      )}
    </div>
  );
}
