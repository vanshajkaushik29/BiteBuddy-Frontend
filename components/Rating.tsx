import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating?: number;
  count?: number;
  size?: 'sm' | 'md';
}

export function Rating({ rating = 4.8, count, size = 'sm' }: RatingProps) {
  const isSmall = size === 'sm';

  return (
    <div className="inline-flex items-center gap-1 font-extrabold text-amber-800 bg-amber-100/80 border border-amber-300/80 px-2.5 py-0.5 rounded-full text-xs shadow-sm">
      <Star className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} fill-amber-400 text-amber-500`} />
      <span>{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-[10px] text-amber-700/80 font-semibold">({count})</span>
      )}
    </div>
  );
}
