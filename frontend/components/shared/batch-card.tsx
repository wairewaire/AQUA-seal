import Link from 'next/link';
import { MapPin, Weight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime, formatWeight, harvestMethodLabel } from '@/lib/format';
import type { FishBatch, FishSpecies, LandingSite } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { VerificationBadge } from './verification-badge';
import { FreshnessIndicator } from './freshness-indicator';

export interface BatchCardProps {
  batch: FishBatch;
  species?: FishSpecies;
  landingSite?: LandingSite;
  href?: string;
  className?: string;
}

export function BatchCard({
  batch,
  species,
  landingSite,
  href,
  className,
}: BatchCardProps) {
  const inner = (
    <Card
      className={cn(
        'h-full transition-shadow hover:shadow-md',
        href && 'transition-colors hover:border-primary/40'
      )}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="font-display text-base font-semibold tracking-tight text-foreground">
              {batch.id}
            </span>
            <span className="text-sm text-muted-foreground">
              {species?.commonName ?? 'Unknown species'}
            </span>
          </div>
          <StatusBadge status={batch.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {landingSite && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {landingSite.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Weight className="h-3.5 w-3.5" aria-hidden="true" />
            {formatWeight(batch.weightKg)}
          </span>
          <span className="text-muted-foreground/80">
            {harvestMethodLabel(batch.harvestMethod)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <FreshnessIndicator rating={batch.freshness} />
          <VerificationBadge status={batch.verification} compact />
        </div>

        <p className="text-xs text-muted-foreground">
          Landed {formatDateTime(batch.landedAt)}
        </p>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className={cn('block focus-visible:outline-none', className)}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}
