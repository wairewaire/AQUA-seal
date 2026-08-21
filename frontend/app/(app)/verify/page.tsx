'use client';

import { useState, useTransition } from 'react';
import {
  ShieldCheck,
  QrCode,
  Search,
  Sparkles,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { QrScannerMock } from '@/components/verify/qr-scanner-mock';
import { VerificationResultCard } from '@/components/verify/verification-result-card';
import { verifyBatch, ApiRequestError } from '@/lib/api/batches';
import type { VerificationResult } from '@/types';

type ViewState =
  | { kind: 'initial' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'not_found'; id: string }
  | { kind: 'result'; result: VerificationResult };

const DEMO_BATCH_ID = 'LV-482917';

export default function VerifyPage() {
  const [batchId, setBatchId] = useState('');
  const [view, setView] = useState<ViewState>({ kind: 'initial' });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleVerify(id: string) {
    setView({ kind: 'loading' });
    try {
      const result = await verifyBatch(id);
      setView({ kind: 'result', result });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === 'not_found') {
          setView({ kind: 'not_found', id: id.toUpperCase() });
        } else {
          setView({ kind: 'error', message: err.message });
        }
      } else {
        setView({
          kind: 'error',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = batchId.trim();
    if (!id || isPending) return;
    startTransition(() => {
      handleVerify(id);
    });
  }

  function handleQrScan(id: string) {
    setBatchId(id);
    startTransition(() => {
      handleVerify(id);
    });
  }

  function reset() {
    setView({ kind: 'initial' });
    setBatchId('');
  }

  return (
    <div className="space-y-5">
      {/* Initial / input view */}
      {(view.kind === 'initial' || view.kind === 'loading') && (
        <div className="mx-auto max-w-md space-y-5">
          {/* Branding + explanation */}
          <div className="space-y-3 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lake-gradient shadow-sm">
              <ShieldCheck className="h-7 w-7 text-white" aria-hidden="true" />
            </span>
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground text-balance">
                Verify a fish batch
              </h1>
              <p className="text-sm text-muted-foreground text-balance">
                Enter a batch ID or scan its QR code to confirm where and how the
                fish was landed, its freshness grade, and full handling history.
              </p>
            </div>
          </div>

          {/* Input card */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <form onSubmit={onSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="batch-id" className="text-sm font-medium">
                    Batch ID
                  </Label>
                  <Input
                    id="batch-id"
                    name="batch-id"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="e.g. LV-482917"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    disabled={view.kind === 'loading'}
                    aria-describedby="batch-id-help"
                    className="font-mono text-base tracking-wide"
                  />
                  <p id="batch-id-help" className="text-xs text-muted-foreground">
                    Six-digit code printed on the batch tag or QR label.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={view.kind === 'loading' || !batchId.trim()}
                >
                  {view.kind === 'loading' ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                      Verify batch
                    </>
                  )}
                </Button>
              </form>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScannerOpen(true)}
                  disabled={view.kind === 'loading'}
                >
                  <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
                  Scan QR
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setBatchId(DEMO_BATCH_ID);
                    startTransition(() => handleVerify(DEMO_BATCH_ID));
                  }}
                  disabled={view.kind === 'loading'}
                >
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                  Demo batch
                </Button>
              </div>
            </CardContent>
          </Card>

          {view.kind === 'loading' && (
            <div className="space-y-3" aria-live="polite">
              <LoadingSkeleton variant="block" className="h-20 w-full" />
              <LoadingSkeleton variant="block" className="h-64 w-full" />
              <LoadingSkeleton variant="block" className="h-40 w-full" />
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {view.kind === 'error' && (
        <div className="mx-auto max-w-md">
          <ErrorState
            title="Couldn't verify this batch"
            message={view.message}
            onRetry={reset}
          />
        </div>
      )}

      {/* Not found state */}
      {view.kind === 'not_found' && (
        <div className="mx-auto max-w-md">
          <NotFoundState id={view.id} onReset={reset} />
        </div>
      )}

      {/* Result state */}
      {view.kind === 'result' && (
        <div className="mx-auto max-w-2xl space-y-4">
          <Button variant="ghost" size="sm" onClick={reset} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Verify another batch
          </Button>
          <VerificationResultCard result={view.result} />
        </div>
      )}

      <QrScannerMock
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleQrScan}
      />
    </div>
  );
}

function NotFoundState({ id, onReset }: { id: string; onReset: () => void }) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Info className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Batch not found
          </h2>
          <p className="text-sm text-muted-foreground">
            No batch matches ID{' '}
            <span className="font-mono font-semibold text-foreground">{id}</span>.
            Check the code and try again, or scan the QR label on the batch tag.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="mt-1">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to verify
        </Button>
      </CardContent>
    </Card>
  );
}
