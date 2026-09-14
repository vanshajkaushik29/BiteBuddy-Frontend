import React from 'react';
import { Clock, Play, CheckCircle2, XCircle } from 'lucide-react';

interface TripTimelineProps {
  status: 'PLANNED' | 'STARTED' | 'COMPLETED' | 'CANCELLED' | string;
}

export function TripTimeline({ status }: TripTimelineProps) {
  const steps = ['ACTIVE', 'STARTED', 'COMPLETED'];
  
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>This trip was cancelled by the carrier.</span>
      </div>
    );
  }

  const currentIdx = status === 'COMPLETED' ? 2 : status === 'STARTED' ? 1 : 0;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        <span className={currentIdx >= 0 ? 'text-primary-600' : ''}>1. Active</span>
        <span className={currentIdx >= 1 ? 'text-indigo-600' : ''}>2. On the Way</span>
        <span className={currentIdx >= 2 ? 'text-success-600' : ''}>3. Completed</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <div className={`h-2 rounded-l-full ${currentIdx >= 0 ? 'bg-primary-500' : 'bg-gray-200'}`} />
        <div className={`h-2 ${currentIdx >= 1 ? 'bg-indigo-500' : 'bg-gray-200'}`} />
        <div className={`h-2 rounded-r-full ${currentIdx >= 2 ? 'bg-success-500' : 'bg-gray-200'}`} />
      </div>
    </div>
  );
}
