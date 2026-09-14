"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Order } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderCard } from '@/components/OrderCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { OrderCardSkeleton } from '@/components/Skeleton';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { error } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const data = await api.orders.getById(id);
      setOrder(data);
    } catch (err: any) {
      error('Order not found', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const isRequester = user && order && (
    typeof order.orderedBy === 'string'
      ? order.orderedBy === user._id
      : order.orderedBy._id === user._id
  );

  if (loading) {
    return <div className="max-w-xl mx-auto"><OrderCardSkeleton /></div>;
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <AlertCircle className="w-10 h-10 text-danger-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-ink">Order not found</h2>
        <Link href="/my-orders" className="btn-primary mt-4 inline-flex text-sm">Back to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
      <Link href="/my-orders" className="btn-ghost text-xs -ml-2 inline-flex">
        <ArrowLeft className="w-4 h-4" /> My Orders
      </Link>

      <div className="page-header">
        <h1 className="page-title">Order Details</h1>
      </div>

      <OrderCard
        order={order}
        viewAs={isRequester ? 'requester' : 'carrier'}
        onRefresh={fetchOrder}
      />
    </div>
  );
}
