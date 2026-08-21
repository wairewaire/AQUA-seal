import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface LoadingSkeletonProps {
  className?: string;
  /** Rough shape: "card" shows a batch-card-like skeleton; "rows" shows list rows. */
  variant?: 'card' | 'rows' | 'block';
  count?: number;
}

export function LoadingSkeleton({
  className,
  variant = 'block',
  count = 1,
}: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('grid gap-3', className)} aria-busy="true" aria-live="polite">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex justify-between">
                <div className="h-5 w-28 rounded bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
              </div>
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-4 w-52 rounded bg-muted" />
              <div className="flex justify-between">
                <div className="h-7 w-24 rounded bg-muted" />
                <div className="h-6 w-28 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (variant === 'rows') {
    return (
      <div className={cn('space-y-2', className)} aria-busy="true" aria-live="polite">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg border p-3">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
            <div className="h-5 w-20 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-busy="true"
      aria-live="polite"
    />
  );
}
