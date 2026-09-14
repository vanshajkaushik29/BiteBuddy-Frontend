"use client";

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  secondaryText,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-light flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted max-w-xs leading-relaxed">{description}</p>
      {(actionText && actionHref) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <Link href={actionHref} className="btn-primary text-sm">
            {actionText}
          </Link>
          {secondaryText && secondaryHref && (
            <Link href={secondaryHref} className="btn-secondary text-sm">
              {secondaryText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
