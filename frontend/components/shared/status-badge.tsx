import { cn } from '@/lib/utils';
import { batchStatusLabel } from '@/lib/format';
import type { BatchStatus } from '@/types';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'lake';

const TONE_STYLES: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  success: 'bg-success/12 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/35',
  danger: 'bg-destructive/12 text-destructive border-destructive/30',
  info: 'bg-info/12 text-info border-info/30',
  lake: 'bg-primary/10 text-primary border-primary/30',
};

const STATUS_TONE: Record<BatchStatus, Tone> = {
  draft: 'neutral',
  landed: 'lake',
  verified: 'success',
  needs_review: 'warning',
  expired: 'danger',
  rejected: 'danger',
};

export interface StatusBadgeProps {
  status: BatchStatus;
  className?: string;
  /** Optional override label */
  label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        TONE_STYLES[tone],
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'success' && 'bg-success',
          tone === 'warning' && 'bg-warning',
          tone === 'danger' && 'bg-destructive',
          tone === 'info' && 'bg-info',
          tone === 'lake' && 'bg-primary',
          tone === 'neutral' && 'bg-muted-foreground'
        )}
      />
      {label ?? batchStatusLabel(status)}
      <span className="sr-only">{label ?? batchStatusLabel(status)}</span>
    </span>
  );
}
