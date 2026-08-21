'use client';

import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  MapPin,
  Weight,
  Fish,
  Anchor,
  Info,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatDateTime,
  formatRelative,
  formatWeight,
  harvestMethodLabel,
} from '@/lib/format';
import type { VerificationResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerificationBadge } from '@/components/shared/verification-badge';
import { FreshnessIndicator } from '@/components/shared/freshness-indicator';
import { Timeline } from '@/components/shared/timeline';

type ResultTone = 'verified' | 'needs_review' | 'expired';

const TONE_CONFIG: Record<
  ResultTone,
  {
    bannerBg: string;
    bannerText: string;
    icon: typeof ShieldCheck;
    iconBg: string;
    heading: string;
    subheading: string;
  }
> = {
  verified: {
    bannerBg: 'bg-success/10 border-success/30',
    bannerText: 'text-success',
    icon: ShieldCheck,
    iconBg: 'bg-success text-success-foreground',
    heading: 'This batch is verified',
    subheading: 'Full traceability chain confirmed by the Beach Management Unit.',
  },
  needs_review: {
    bannerBg: 'bg-warning/10 border-warning/30',
    bannerText: 'text-warning',
    icon: AlertTriangle,
    iconBg: 'bg-warning text-warning-foreground',
    heading: 'This batch needs review',
    subheading: 'Some verification steps are outstanding. Review the flags below.',
  },
  expired: {
    bannerBg: 'bg-destructive/10 border-destructive/30',
    bannerText: 'text-destructive',
    icon: ShieldAlert,
    iconBg: 'bg-destructive text-destructive-foreground',
    heading: 'This batch has expired',
    subheading: 'The batch is no longer fit for sale. Traceability record retained.',
  },
};

function toneForResult(result: VerificationResult): ResultTone {
  if (result.batch.status === 'expired' || result.batch.freshness === 'spoiled') {
    return 'expired';
  }
  if (result.batch.status === 'needs_review' || result.batch.verification !== 'verified') {
    return 'needs_review';
  }
  return 'verified';
}

function FlagRow({ flag }: { flag: VerificationResult['flags'][number] }) {
  const tone =
    flag.severity === 'danger'
      ? { icon: XCircle, cls: 'text-destructive' }
      : flag.severity === 'warning'
      ? { icon: AlertTriangle, cls: 'text-warning' }
      : { icon: Info, cls: 'text-info' };
  const Icon = tone.icon;
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', tone.cls)} aria-hidden="true" />
      <span className="text-foreground/85">{flag.message}</span>
    </li>
  );
}

export interface VerificationResultCardProps {
  result: VerificationResult;
}

export function VerificationResultCard({ result }: VerificationResultCardProps) {
  const { batch, species, landingSite, trustScore, trustSummary, flags, lastVerifiedAt } =
    result;
  const tone = toneForResult(result);
  const cfg = TONE_CONFIG[tone];
  const ToneIcon = cfg.icon;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Result banner */}
      <div
        role="status"
        className={cn(
          'flex items-start gap-3 rounded-lg border p-4',
          cfg.bannerBg
        )}
      >
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            cfg.iconBg
          )}
        >
          <ToneIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className={cn('font-display text-base font-semibold', cfg.bannerText)}>
            {cfg.heading}
          </p>
          <p className="text-sm text-foreground/80">{cfg.subheading}</p>
        </div>
      </div>

      {/* Trust score */}
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Trust score
            </span>
            <span className="font-display text-3xl font-bold tabular-nums text-foreground">
              {trustScore}
              <span className="text-lg font-semibold text-muted-foreground">/100</span>
            </span>
          </div>
          <div className="relative flex h-16 w-16 items-center justify-center">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                strokeWidth="6"
                className="stroke-muted"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(trustScore / 100) * 175.9} 175.9`}
                className={
                  trustScore >= 80
                    ? 'stroke-success'
                    : trustScore >= 55
                    ? 'stroke-info'
                    : trustScore >= 35
                    ? 'stroke-warning'
                    : 'stroke-destructive'
                }
              />
            </svg>
            <span className="absolute text-xs font-bold text-foreground">
              {trustScore > 0 ? `${trustScore}%` : '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Batch details */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="font-display text-lg">{batch.id}</CardTitle>
            <VerificationBadge status={batch.verification} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Species + freshness */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-primary" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {species.commonName}
                </span>
                <span className="text-xs italic text-muted-foreground">
                  {species.scientificName}
                </span>
              </div>
            </div>
            <FreshnessIndicator rating={batch.freshness} />
          </div>

          {/* Detail grid */}
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">Landing site</dt>
                <dd className="text-sm font-medium text-foreground">
                  {landingSite.name}
                  <span className="text-muted-foreground"> · {landingSite.county}</span>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">Landed</dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatDateTime(batch.landedAt)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Weight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">Weight</dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatWeight(batch.weightKg)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Anchor className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">Harvest method</dt>
                <dd className="text-sm font-medium text-foreground">
                  {harvestMethodLabel(batch.harvestMethod)}
                </dd>
              </div>
            </div>
          </dl>

          {/* Flags */}
          {flags.length > 0 && (
            <div className="rounded-md border border-border bg-card p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Verification flags
              </p>
              <ul className="space-y-2">
                {flags.map((flag) => (
                  <FlagRow key={flag.code} flag={flag} />
                ))}
              </ul>
            </div>
          )}

          {/* Trust summary */}
          <div className="rounded-md bg-primary/5 p-3">
            <p className="text-sm text-foreground/85">{trustSummary}</p>
          </div>

          {/* Last verified */}
          <p className="text-xs text-muted-foreground">
            {lastVerifiedAt
              ? `Last verified ${formatRelative(lastVerifiedAt)}.`
              : 'No BMU inspection recorded yet.'}
            <span className="block">
              Record updated {formatRelative(batch.updatedAt)}.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Handling timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Handling timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline events={batch.handlingEvents} />
        </CardContent>
      </Card>
    </div>
  );
}
