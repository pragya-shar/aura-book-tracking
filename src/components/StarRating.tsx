
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }: StarRatingProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            'transition-colors cursor-pointer',
            star <= rating 
              ? 'fill-amber-400 text-amber-400' 
              : 'text-stone-500 hover:text-amber-400',
            readonly && 'cursor-default'
          )}
          onClick={() => !readonly && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};
