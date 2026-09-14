"use client";

import React from 'react';
import { MessageSquare } from 'lucide-react';

// The backend has no messaging API. This page is a placeholder.
export default function MessagesPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Chat coming soon.</p>
      </div>
      <div className="bb-card py-16 text-center">
        <MessageSquare className="w-10 h-10 text-ink-faint mx-auto mb-3" />
        <p className="text-sm font-medium text-ink">Messages are not available yet.</p>
        <p className="text-xs text-ink-muted mt-1">
          Real-time chat between orderers and carriers will be added in a future update.
        </p>
      </div>
    </div>
  );
}
