'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ClipboardPlus,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Anchor,
  MapPin,
  Calendar,
  Copy,
  Check,
  ArrowRight,
  Plus,
  Fish,
  Weight,
  Clock,
  History,
  Snowflake,
  ClipboardCheck,
  Truck,
} from 'lucide-react';
import type {
  FishBatch,
  FishSpecies,
  HarvestMethod,
  LandingSite,
  Boat,
  HandlingEventType,
} from '@/types';
import {
  getBatches,
  createBatch,
  updateBatchHandling,
  ApiRequestError,
} from '@/lib/api/batches';
import { mockBoats, mockLandingSites, mockSpecies } from '@/lib/mock/data';
import {
  formatDateTime,
  formatRelative,
  formatWeight,
  harvestMethodLabel,
  freshnessShort,
} from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/status-badge';
import { FreshnessIndicator } from '@/components/shared/freshness-indicator';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { cn } from '@/lib/utils';

const HARVEST_METHODS: HarvestMethod[] = ['gillnet', 'longline', 'seine', 'traps', 'angling'];

const HANDLING_ACTIONS: { type: HandlingEventType; label: string; icon: typeof Snowflake }[] = [
  { type: 'iced', label: 'Mark as iced', icon: Snowflake },
  { type: 'inspected', label: 'Record inspection', icon: ClipboardCheck },
  { type: 'transported', label: 'Record transport', icon: Truck },
];

export default function BmuPage() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<FishBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdBatch, setCreatedBatch] = useState<FishBatch | null>(null);
  const [isPending, startTransition] = useTransition();

  const speciesMap = useMemo(() => new Map(mockSpecies.map((s) => [s.id, s])), []);
  const siteMap = useMemo(() => new Map(mockLandingSites.map((s) => [s.id, s])), []);
  const boatMap = useMemo(() => new Map(mockBoats.map((b) => [b.id, b])), []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getBatches();
      setBatches(data);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : 'Could not load recent catches.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleCreated(batch: FishBatch) {
    setCreatedBatch(batch);
    setBatches((prev) => [batch, ...prev]);
    toast({
      title: 'Batch registered',
      description: `Batch ${batch.id} has been recorded at landing.`,
    });
  }

  function handleHandlingUpdate(batchId: string, updated: FishBatch) {
    setBatches((prev) => prev.map((b) => (b.id === batchId ? updated : b)));
  }

  function resetForm() {
    setCreatedBatch(null);
  }

  const recentCatches = [...batches]
    .sort((a, b) => b.landedAt.localeCompare(a.landedAt))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          BMU workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Register catches at landing sites and record handling events.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Registration form / success — spans 3 cols on desktop */}
        <div className="lg:col-span-3">
          {createdBatch ? (
            <BatchCreatedSuccess batch={createdBatch} onReset={resetForm} />
          ) : (
            <CatchRegistrationForm
              onCreated={handleCreated}
              isPending={isPending}
              startTransition={startTransition}
            />
          )}
        </div>

        {/* Recent catches — spans 2 cols on desktop */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Recent catches
            </h2>
          </div>
          {loading ? (
            <LoadingSkeleton variant="rows" count={4} />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : recentCatches.length === 0 ? (
            <EmptyState
              icon={Fish}
              title="No catches recorded"
              description="Registered batches will appear here."
            />
          ) : (
            <RecentCatchesList
              batches={recentCatches}
              speciesMap={speciesMap}
              siteMap={siteMap}
              boatMap={boatMap}
              onHandlingUpdate={handleHandlingUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Catch registration form
// ---------------------------------------------------------------------------

interface FormState {
  boatId: string;
  speciesId: string;
  weightKg: string;
  harvestMethod: HarvestMethod | '';
  landingSiteId: string;
  landedDate: string;
  landedTime: string;
}

const EMPTY_FORM: FormState = {
  boatId: '',
  speciesId: '',
  weightKg: '',
  harvestMethod: '',
  landingSiteId: '',
  landedDate: new Date().toISOString().slice(0, 10),
  landedTime: new Date().toTimeString().slice(0, 5),
};

function CatchRegistrationForm({
  onCreated,
  isPending,
  startTransition,
}: {
  onCreated: (batch: FishBatch) => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.boatId) next.boatId = 'Select a boat.';
    if (!form.speciesId) next.speciesId = 'Select a species.';
    if (!form.weightKg || parseFloat(form.weightKg) <= 0)
      next.weightKg = 'Enter a weight greater than zero.';
    if (!form.harvestMethod) next.harvestMethod = 'Select a harvest method.';
    if (!form.landingSiteId) next.landingSiteId = 'Select a landing site.';
    if (!form.landedDate) next.landedDate = 'Select a date.';
    if (!form.landedTime) next.landedTime = 'Enter a time.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const landedAt = new Date(`${form.landedDate}T${form.landedTime}:00+03:00`).toISOString();

    startTransition(async () => {
      try {
        const batch = await createBatch({
          boatId: form.boatId,
          speciesId: form.speciesId,
          weightKg: parseFloat(form.weightKg),
          harvestMethod: form.harvestMethod as HarvestMethod,
          landingSiteId: form.landingSiteId,
          landedAt,
        });
        setForm(EMPTY_FORM);
        onCreated(batch);
      } catch (err) {
        setSubmitError(
          err instanceof ApiRequestError
            ? err.message
            : 'Could not register the batch. Please try again.'
        );
      }
    });
  }

  const isLoading = isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ClipboardPlus className="h-5 w-5 text-primary" aria-hidden="true" />
          Register a catch
        </CardTitle>
        <CardDescription>
          Record a new batch at the point of landing. Freshness and traceability
          status are assigned by the system after registration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Boat + landing site */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Boat" error={errors.boatId} required>
              <Select value={form.boatId} onValueChange={(v) => update('boatId', v)}>
                <SelectTrigger aria-label="Boat" disabled={isLoading}>
                  <SelectValue placeholder="Select boat" />
                </SelectTrigger>
                <SelectContent>
                  {mockBoats.map((boat) => (
                    <SelectItem key={boat.id} value={boat.id}>
                      {boat.name} · {boat.registrationNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Landing site" error={errors.landingSiteId} required>
              <Select value={form.landingSiteId} onValueChange={(v) => update('landingSiteId', v)}>
                <SelectTrigger aria-label="Landing site" disabled={isLoading}>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {mockLandingSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name} · {site.county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Species + harvest method */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Species" error={errors.speciesId} required>
              <Select value={form.speciesId} onValueChange={(v) => update('speciesId', v)}>
                <SelectTrigger aria-label="Species" disabled={isLoading}>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  {mockSpecies.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.commonName} ({sp.localName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Harvest method" error={errors.harvestMethod} required>
              <Select
                value={form.harvestMethod}
                onValueChange={(v) => update('harvestMethod', v as HarvestMethod)}
              >
                <SelectTrigger aria-label="Harvest method" disabled={isLoading}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {HARVEST_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {harvestMethodLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Weight */}
          <FormField label="Weight (kg)" error={errors.weightKg} required>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              inputMode="decimal"
              placeholder="e.g. 45.5"
              value={form.weightKg}
              onChange={(e) => update('weightKg', e.target.value)}
              disabled={isLoading}
              aria-describedby={errors.weightKg ? 'weight-error' : undefined}
            />
          </FormField>

          {/* Date + time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Landing date" error={errors.landedDate} required>
              <Input
                type="date"
                value={form.landedDate}
                onChange={(e) => update('landedDate', e.target.value)}
                disabled={isLoading}
              />
            </FormField>
            <FormField label="Landing time" error={errors.landedTime} required>
              <Input
                type="time"
                value={form.landedTime}
                onChange={(e) => update('landedTime', e.target.value)}
                disabled={isLoading}
              />
            </FormField>
          </div>

          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Registering…
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Register batch
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Batch created success — shows generated batch ID + QR label placeholder
// ---------------------------------------------------------------------------

function BatchCreatedSuccess({
  batch,
  onReset,
}: {
  batch: FishBatch;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyId() {
    navigator.clipboard?.writeText(batch.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/12 text-success">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="font-display text-lg">Batch registered</CardTitle>
            <CardDescription>
              The batch has been recorded and assigned a traceability ID.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch ID + QR label */}
        <div className="flex items-stretch gap-4 rounded-lg border border-border bg-muted/30 p-4">
          {/* QR placeholder */}
          <div
            aria-hidden="true"
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-primary/30 bg-card"
          >
            <QrCode className="h-10 w-10 text-primary/40" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Batch ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold tracking-wide text-foreground">
                {batch.id}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyId}
                aria-label="Copy batch ID"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Print this ID and QR code on the batch tag for verification at market.
            </p>
          </div>
        </div>

        {/* Batch summary */}
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <SummaryItem icon={Fish} label="Species" value={batch.speciesId.replace('sp_', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} />
          <SummaryItem icon={Weight} label="Weight" value={formatWeight(batch.weightKg)} />
          <SummaryItem icon={Anchor} label="Harvest" value={harvestMethodLabel(batch.harvestMethod)} />
          <SummaryItem icon={Clock} label="Landed" value={formatDateTime(batch.landedAt)} />
        </dl>

        {/* Status from backend */}
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-info/5 p-3">
          <span className="text-xs font-medium text-info">
            System-assigned status:
          </span>
          <StatusBadge status={batch.status} />
          <FreshnessIndicator rating={batch.freshness} showLabel />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/verify">
              Verify this batch
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" onClick={onReset} className="flex-1">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Register another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Fish;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recent catches list with handling update actions
// ---------------------------------------------------------------------------

function RecentCatchesList({
  batches,
  speciesMap,
  siteMap,
  boatMap,
  onHandlingUpdate,
}: {
  batches: FishBatch[];
  speciesMap: Map<string, FishSpecies>;
  siteMap: Map<string, LandingSite>;
  boatMap: Map<string, Boat>;
  onHandlingUpdate: (batchId: string, updated: FishBatch) => void;
}) {
  return (
    <div className="space-y-2">
      {batches.map((batch) => (
        <RecentCatchCard
          key={batch.id}
          batch={batch}
          species={speciesMap.get(batch.speciesId)}
          site={siteMap.get(batch.landingSiteId)}
          boat={boatMap.get(batch.boatId)}
          onHandlingUpdate={onHandlingUpdate}
        />
      ))}
    </div>
  );
}

function RecentCatchCard({
  batch,
  species,
  site,
  boat,
  onHandlingUpdate,
}: {
  batch: FishBatch;
  species?: FishSpecies;
  site?: LandingSite;
  boat?: Boat;
  onHandlingUpdate: (batchId: string, updated: FishBatch) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const hasIced = batch.handlingEvents.some((e) => e.type === 'iced');
  const hasInspected = batch.handlingEvents.some((e) => e.type === 'inspected');
  const hasTransported = batch.handlingEvents.some((e) => e.type === 'transported');

  async function recordHandling(type: HandlingEventType) {
    setIsUpdating(true);
    try {
      const updated = await updateBatchHandling(batch.id, {
        type,
        location: site?.name ?? 'Unknown',
      });
      onHandlingUpdate(batch.id, updated);
      toast({
        title: 'Handling event recorded',
        description: `${batch.id}: ${type} event added.`,
      });
    } catch (err) {
      toast({
        title: 'Could not update batch',
        description: err instanceof ApiRequestError ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        {/* Header row */}
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

        {/* Detail row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {species?.commonName ?? 'Unknown'}
          </span>
          {site && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {site.name}
            </span>
          )}
          {boat && <span className="text-muted-foreground/80">{boat.name}</span>}
          <span className="inline-flex items-center gap-1">
            <Weight className="h-3.5 w-3.5" aria-hidden="true" />
            {formatWeight(batch.weightKg)}
          </span>
        </div>

        {/* Freshness + verification */}
        <div className="flex items-center justify-between gap-2">
          <FreshnessIndicator rating={batch.freshness} showLabel={false} />
          <Link
            href="/verify"
            className="text-xs font-medium text-primary hover:underline"
          >
            View details
          </Link>
        </div>

        {/* Handling update actions */}
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-2.5">
          {HANDLING_ACTIONS.map((action) => {
            const done =
              action.type === 'iced'
                ? hasIced
                : action.type === 'inspected'
                ? hasInspected
                : hasTransported;
            const Icon = action.icon;
            return (
              <Button
                key={action.type}
                variant={done ? 'secondary' : 'outline'}
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                disabled={isUpdating || done}
                onClick={() => recordHandling(action.type)}
              >
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                ) : done ? (
                  <Check className="h-3 w-3 text-success" aria-hidden="true" />
                ) : (
                  <Icon className="h-3 w-3" aria-hidden="true" />
                )}
                {done ? action.label.replace('Mark as ', '').replace('Record ', '') : action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
