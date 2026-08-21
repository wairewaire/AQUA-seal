import { CheckCircle2, AlertTriangle, ShieldQuestion, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { verificationLabel } from '@/lib/format';
import type { VerificationStatus } from '@/types';

const CONFIG: Record<
  VerificationStatus,
  { icon: typeof CheckCircle2; tone: string }
> = {
  verified: {
    icon: CheckCircle2,
    tone: 'text-success bg-success/10 border-success/30',
  },
  partially_verified: {
    icon: AlertTriangle,
    tone: 'text-warning bg-warning/10 border-warning/30',
  },
  unverified: {
    icon: ShieldQuestion,
    tone: 'text-muted-foreground bg-muted border-border',
  },
  disputed: {
    icon: ShieldAlert,
    tone: 'text-destructive bg-destructive/10 border-destructive/30',
  },
};

export interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
  compact?: boolean;
}

export function VerificationBadge({
  status,
  className,
  compact,
}: VerificationBadgeProps) {
  const { icon: Icon, tone } = CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold',
        tone,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {compact ? verificationLabel(status) : `Verification: ${verificationLabel(status)}`}
      <span className="sr-only">Verification status: {verificationLabel(status)}</span>
    </span>
  );
}
