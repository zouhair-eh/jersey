/**
 * @file StarRating.tsx
 * @description Accessible star rating display component.
 *              Supports half-star precision via SVG clip-path.
 */

import { Star } from 'lucide-react';
import clsx from 'clsx';

interface StarRatingProps {
  /** Value between 0 and 5 (supports decimals, e.g. 4.3) */
  rating: number;
  /** Total number of reviews */
  reviewCount?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show numeric value next to stars */
  showValue?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const TEXT_MAP = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export default function StarRating({
  rating,
  reviewCount,
  size = 'md',
  showValue = true,
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled    = rating >= i + 1;
    const halfFill  = !filled && rating > i && rating < i + 1;
    const fillPct   = halfFill ? (rating - i) * 100 : filled ? 100 : 0;
    return { filled, halfFill, fillPct };
  });

  return (
    <div
      className={clsx('flex items-center gap-1.5', className)}
      aria-label={`Rating: ${rating.toFixed(1)} out of 5`}
    >
      <div className="flex items-center gap-0.5">
        {stars.map((star, i) => (
          <span key={i} className="relative inline-block" aria-hidden="true">
            {/* Grey base star */}
            <Star className={clsx(SIZE_MAP[size], 'text-white/10 fill-white/10')} />
            {/* Coloured overlay, clipped to the fill percentage */}
            {star.fillPct > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${star.fillPct}%` }}
              >
                <Star className={clsx(SIZE_MAP[size], 'text-amber-400 fill-amber-400')} />
              </span>
            )}
          </span>
        ))}
      </div>

      {showValue && (
        <span className={clsx('font-semibold text-white', TEXT_MAP[size])}>
          {rating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={clsx('text-white/40', TEXT_MAP[size])}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
