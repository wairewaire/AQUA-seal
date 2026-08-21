'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  AlertTriangle,
  Store,
  ClipboardList,
  ArrowRight,
  Activity,
  CalendarClock,
  Scale,
  TrendingUp,
} from 'lucide-react';
import type {
  DashboardSummary,
  FishBatch,
  FishSpecies,
  HandlingEvent,
  LandingSite,
  MarketplaceListing,
} from '@/types';
import { getBatches, getDashboardSummary } from '@/lib/api/batches';
import { getListings } from '@/lib/api/marketplace';
import { mockSpecies, mockLandingSites } from '@/lib/mock/data';
import { ApiRequestError } from '@/lib/api/auth';
import {
  formatRelative,
  formatWeight,
  formatKes,
  freshnessShort,
  batchStatusLabel,
  handlingEventLabel,
  roleLabel,
} from '@/lib/format';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { VerificationBadge } from '@/components/shared/verification-badge';
import { FreshnessIndicator } from '@/components/shared/freshness-indicator';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { cn } from '@/lib/utils';

interface DashboardData {
  summary: DashboardSummary;
  batches: FishBatch[];
  listings: MarketplaceListing[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [summary, batches, listings] = await Promise.all([
        getDashboardSummary(),
        getBatches(),
        getListings(),
      ]);
      setData({ summary, batches, listings });
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const speciesMap = useMemo(
    () => new Map(mockSpecies.map((s) => [s.id, s])),
    []
  );
  const siteMap = useMemo(
    () => new Map(mockLandingSites.map((s) => [s.id, s])),
    []
  );
  const allEvents: HandlingEvent[] = useMemo(
    () =>
      (data?.batches ?? [])
        .flatMap((b) => b.handlingEvents)
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
        .slice(0, 6),
    [data]
  );

  if (loading) return <DashboardSkeleton />;
  if (error || !data) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        message={error ?? 'Could not load dashboard data.'}
        onRetry={load}
      />
    );
  }

  const recentBatches = [...data.batches]
    .sort((a, b) => b.landedAt.localeCompare(a.landedAt))
    .slice(0, 5);

  const needsAttention = data.batches.filter(
    (b) => b.status === 'needs_review' || b.verification === 'disputed'
  );

  const activeListings = data.listings.filter(
    (l) => l.status === 'active' || l.status === 'low_stock'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of batches, verification status, and marketplace activity.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={PackageCheck}
          label="Active batches"
          value={data.summary.totalBatches - data.summary.expiredBatches}
          tone="lake"
          sub={`${data.summary.verifiedBatches} verified`}
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Pending review"
          value={data.summary.needsReviewBatches}
          tone="warning"
          sub={data.summary.needsReviewBatches > 0 ? 'Needs action' : 'All clear'}
        />
        <SummaryCard
          icon={Store}
          label="Marketplace stock"
          value={data.summary.activeListings}
          tone="success"
          sub={formatWeight(data.summary.totalListedWeightKg)}
        />
        <SummaryCard
          icon={ClipboardList}
          label="Needs attention"
          value={needsAttention.length}
          tone={needsAttention.length > 0 ? 'danger' : 'neutral'}
          sub={
            needsAttention.length > 0
              ? 'Batches flagged'
              : 'Nothing flagged'
          }
        />
      </div>

      {/* Recent batches + attention section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent batches — spans 2 cols on desktop */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Recent batches
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/verify">
                Verify a batch
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <RecentBatchesList
            batches={recentBatches}
            speciesMap={speciesMap}
            siteMap={siteMap}
          />
        </div>

        {/* Attention / review section */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Needs review
          </h2>
          <AttentionSection batches={needsAttention} speciesMap={speciesMap} />
        </div>
      </div>

      {/* Activity timeline + marketplace summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Compact activity timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
              Recent activity
            </CardTitle>
            <CardDescription>Latest handling events across all batches</CardDescription>
          </CardHeader>
          <CardContent>
            <CompactActivityTimeline events={allEvents} />
          </CardContent>
        </Card>

        {/* Marketplace summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <Store className="h-4 w-4 text-primary" aria-hidden="true" />
                  Marketplace summary
                </CardTitle>
                <CardDescription className="mt-1">
                  Live listings and stock levels
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/marketplace">
                  View all
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <MarketplaceStat
                label="Active"
                value={activeListings.filter((l) => l.status === 'active').length}
              />
              <MarketplaceStat
                label="Low stock"
                value={activeListings.filter((l) => l.status === 'low_stock').length}
                warning
              />
              <MarketplaceStat
                label="Expired"
                value={data.listings.filter((l) => l.status === 'expired').length}
                danger
              />
            </div>
            <div className="space-y-2">
              {activeListings.length > 0 ? (
                activeListings.map((listing) => {
                  const batch = data.batches.find((b) => b.id === listing.batchId);
                  const species = batch ? speciesMap.get(batch.speciesId) : undefined;
                  return (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {species?.commonName ?? 'Unknown species'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {listing.batchId} · {formatWeight(listing.quantityKg)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="text-sm font-semibold text-foreground">
                          {formatKes(listing.priceKesPerKg)}
                        </span>
                        <span className="text-xs text-muted-foreground">per kg</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  title="No active listings"
                  description="Listings will appear here when fish is put up for sale."
                  className="py-6"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary card
// ---------------------------------------------------------------------------

type CardTone = 'lake' | 'warning' | 'success' | 'danger' | 'neutral';

const TONE_STYLES: Record<
  CardTone,
  { iconBg: string; iconText: string; value: string }
> = {
  lake: { iconBg: 'bg-primary/10', iconText: 'text-primary', value: 'text-foreground' },
  warning: { iconBg: 'bg-warning/15', iconText: 'text-warning', value: 'text-foreground' },
  success: { iconBg: 'bg-success/12', iconText: 'text-success', value: 'text-foreground' },
  danger: { iconBg: 'bg-destructive/12', iconText: 'text-destructive', value: 'text-foreground' },
  neutral: { iconBg: 'bg-muted', iconText: 'text-muted-foreground', value: 'text-foreground' },
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof PackageCheck;
  label: string;
  value: number;
  sub: string;
  tone: CardTone;
}) {
  const t = TONE_STYLES[tone];
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span
            className={cn('flex h-8 w-8 items-center justify-center rounded-lg', t.iconBg)}
          >
            <Icon className={cn('h-4 w-4', t.iconText)} aria-hidden="true" />
          </span>
        </div>
        <div className="flex flex-col">
          <span className={cn('font-display text-2xl font-bold tabular-nums', t.value)}>
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Recent batches list (card-based for mobile, compact rows for desktop)
// ---------------------------------------------------------------------------

function RecentBatchesList({
  batches,
  speciesMap,
  siteMap,
}: {
  batches: FishBatch[];
  speciesMap: Map<string, FishSpecies>;
  siteMap: Map<string, LandingSite>;
}) {
  if (batches.length === 0) {
    return (
      <EmptyState
        title="No batches yet"
        description="Batches will appear here once fish is landed and recorded."
      />
    );
  }
  return (
    <div className="space-y-2">
      {batches.map((batch) => {
        const species = speciesMap.get(batch.speciesId);
        const site = siteMap.get(batch.landingSiteId);
        return (
          <Link
            key={batch.id}
            href="/verify"
            className="block rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {batch.id}
                </span>
                <StatusBadge status={batch.status} />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRelative(batch.landedAt)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {species?.commonName ?? 'Unknown'}
                </span>
                <span>{site?.name ?? '—'}</span>
                <span className="inline-flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatWeight(batch.weightKg)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FreshnessIndicator rating={batch.freshness} showLabel={false} />
                <VerificationBadge status={batch.verification} compact />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attention / review section
// ---------------------------------------------------------------------------

function AttentionSection({
  batches,
  speciesMap,
}: {
  batches: FishBatch[];
  speciesMap: Map<string, FishSpecies>;
}) {
  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={PackageCheck}
            title="Nothing to review"
            description="All batches are verified and in good standing."
          />
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {batches.map((batch) => {
        const species = speciesMap.get(batch.speciesId);
        const reasons: string[] = [];
        if (batch.verification === 'disputed') reasons.push('Disputed verification');
        if (batch.status === 'needs_review') reasons.push('Missing inspection');
        return (
          <Link
            key={batch.id}
            href="/verify"
            className="block rounded-lg border border-warning/30 bg-warning/5 p-3 transition-colors hover:border-warning/50 hover:bg-warning/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-foreground">
                {batch.id}
              </span>
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {species?.commonName ?? 'Unknown'} · {freshnessShort(batch.freshness)}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {reasons.map((r) => (
                <span
                  key={r}
                  className="rounded-md bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning"
                >
                  {r}
                </span>
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact activity timeline
// ---------------------------------------------------------------------------

function CompactActivityTimeline({ events }: { events: HandlingEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No recent activity"
        description="Handling events will appear here as batches are processed."
      />
    );
  }
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/50" aria-hidden="true" />
          <div className="flex flex-1 flex-col">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <p className="text-sm font-medium text-foreground">
                {handlingEventLabel(event.type)} ·{' '}
                <span className="font-mono text-foreground/80">{event.batchId}</span>
              </p>
              <time
                dateTime={event.occurredAt}
                className="text-xs text-muted-foreground"
              >
                {formatRelative(event.occurredAt)}
              </time>
            </div>
            <p className="text-xs text-muted-foreground">
              {event.location} · {roleLabel(event.actorRole)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Marketplace stat
// ---------------------------------------------------------------------------

function MarketplaceStat({
  label,
  value,
  warning,
  danger,
}: {
  label: string;
  value: number;
  warning?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2.5 text-center">
      <span
        className={cn(
          'block font-display text-xl font-bold tabular-nums',
          warning ? 'text-warning' : danger ? 'text-destructive' : 'text-foreground'
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <LoadingSkeleton className="h-7 w-40" />
        <LoadingSkeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <LoadingSkeleton className="h-6 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="space-y-2">
          <LoadingSkeleton className="h-6 w-28" />
          {Array.from({ length: 2 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LoadingSkeleton className="h-64 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
