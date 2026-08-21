'use client';

import { useEffect, useRef, useState } from 'react';
import { ScanLine, X, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface QrScannerMockProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (batchId: string) => void;
}

// Convincing mock scanner panel. No real camera — a simulated viewfinder with
// a scan line. Structured so a real scanning library (e.g. @zxing/browser)
// can slot in by replacing the "simulate" logic with a decode callback.
const SIMULATED_BATCH_IDS = ['LV-482917', 'LV-482920', 'LV-482101', 'LV-482310'];

export function QrScannerMock({ open, onOpenChange, onScan }: QrScannerMockProps) {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'decoding'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('scanning');
    } else {
      setPhase('idle');
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [open]);

  function simulateScan() {
    if (phase === 'decoding') return;
    setPhase('decoding');
    const id = SIMULATED_BATCH_IDS[
      Math.floor(Math.random() * SIMULATED_BATCH_IDS.length)
    ];
    timer.current = setTimeout(() => {
      onScan(id);
      onOpenChange(false);
    }, 1100);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0 sm:rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Scan QR code</DialogTitle>
          <DialogDescription>
            Point the camera at a batch QR code to verify it.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-lake-deep">
          {/* Viewfinder frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-56 w-56">
              {/* Corner brackets */}
              {[
                'left-0 top-0 border-l-4 border-t-4 rounded-tl-xl',
                'right-0 top-0 border-r-4 border-t-4 rounded-tr-xl',
                'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-xl',
                'right-0 bottom-0 border-r-4 border-b-4 rounded-br-xl',
              ].map((pos) => (
                <span
                  key={pos}
                  aria-hidden="true"
                  className={cn('absolute h-8 w-8 border-white/90', pos)}
                />
              ))}
              {/* Scan line */}
              {phase === 'scanning' && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 top-1/2 h-0.5 bg-success shadow-[0_0_12px_2px] shadow-success/60 animate-scan-line"
                />
              )}
              {phase === 'decoding' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="h-16 w-16 rounded-full border-2 border-white/30" />
                  <span className="absolute h-16 w-16 animate-pulse-ring rounded-full border-2 border-success" />
                </div>
              )}
            </div>
          </div>

          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-xs font-medium text-white">
              <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
              QR scanner
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/40 text-white hover:bg-black/60 hover:text-white"
              onClick={() => onOpenChange(false)}
              aria-label="Close scanner"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Status caption */}
          <div className="absolute inset-x-0 bottom-0 p-4 text-center">
            <p className="text-sm font-medium text-white/90">
              {phase === 'decoding'
                ? 'Decoding code…'
                : 'Position the QR code within the frame'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 p-4">
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <CameraOff className="h-3.5 w-3.5" aria-hidden="true" />
            Camera access is simulated in this prototype.
          </p>
          <Button
            className="w-full"
            onClick={simulateScan}
            disabled={phase === 'decoding'}
          >
            <ScanLine className="mr-2 h-4 w-4" aria-hidden="true" />
            {phase === 'decoding' ? 'Decoding…' : 'Simulate scan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
