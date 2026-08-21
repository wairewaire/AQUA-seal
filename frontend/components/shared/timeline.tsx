import {
  Fish,
  Anchor,
  Scale,
  Snowflake,
  Truck,
  ClipboardCheck,
  Tag,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime, handlingEventLabel, roleLabel } from '@/lib/format';
import type { HandlingEvent, HandlingEventType } from '@/types';

const EVENT_ICON: Record<HandlingEventType, LucideIcon> = {
  harvested: Fish,
  landed: Anchor,
  weighed: Scale,
  iced: Snowflake,
  transported: Truck,
  inspected: ClipboardCheck,
  listed: Tag,
  sold: ShoppingCart,
};

export interface TimelineProps {
  events: HandlingEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  return (
    <ol className={cn('relative space-y-5', className)}>
      {sorted.map((event, i) => {
        const Icon = EVENT_ICON[event.type] ?? Anchor;
        const isLast = i === sorted.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3">
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-border"
              />
            )}
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card text-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="flex flex-1 flex-col pb-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <p className="text-sm font-semibold text-foreground">
                  {handlingEventLabel(event.type)}
                </p>
                <time
                  dateTime={event.occurredAt}
                  className="text-xs text-muted-foreground"
                >
                  {formatDateTime(event.occurredAt)}
                </time>
              </div>
              <p className="text-sm text-muted-foreground">{event.location}</p>
              {event.notes && (
                <p className="mt-1 text-sm text-foreground/80">{event.notes}</p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground/80">
                Recorded by {roleLabel(event.actorRole)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
