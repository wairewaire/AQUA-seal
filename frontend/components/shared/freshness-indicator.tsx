import { cn } from '@/lib/utils';
import { freshnessLabel, freshnessShort } from '@/lib/format';
import type { FreshnessRating } from '@/types';

const CONFIG: Record<
  FreshnessRating,
  { bar: string; label: string; text: string }
> = {
  grade_a: { bar: 'bg-success', label: 'A', text: 'text-success' },
  grade_b: { bar: 'bg-info', label: 'B', text: 'text-info' },
  grade_c: { bar: 'bg-warning', label: 'C', text: 'text-warning' },
  spoiled: { bar: 'bg-destructive', label: 'X', text: 'text-destructive' },
};

export interface FreshnessIndicatorProps {
  rating: FreshnessRating;
  showLabel?: boolean;
  className?: string;
}

export function FreshnessIndicator({
  rating,
  showLabel = true,
  className,
}: FreshnessIndicatorProps) {
  const cfg = CONFIG[rating];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold',
          cfg.bar,
          'text-white'
        )}
        aria-hidden="true"
      >
        {cfg.label}
      </span>
      <div className="flex flex-col">
        {showLabel && (
          <span className={cn('text-sm font-semibold leading-tight', cfg.text)}>
            {freshnessShort(rating)}
          </span>
        )}
        <span className="sr-only">{freshnessLabel(rating)}</span>
      </div>
    </div>
  );
}
