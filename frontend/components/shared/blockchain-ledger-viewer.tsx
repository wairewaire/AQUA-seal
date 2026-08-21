'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Eye,
  FileKey,
} from 'lucide-react';
import type { BlockchainBlock } from '@/types';
import { getBlockchainLedger, verifyBatchIntegrity, GENESIS_HASH } from '@/lib/blockchain/ledger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';

interface Props {
  highlightBatchId?: string;
  className?: string;
}

export function BlockchainLedgerViewer({ highlightBatchId, className }: Props) {
  const [ledger, setLedger] = useState<BlockchainBlock[]>(() => getBlockchainLedger());
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<
    Record<string, { isVerified: boolean; message: string }>
  >({});

  function refresh() {
    setLedger(getBlockchainLedger());
  }

  async function handleVerify(batchId: string) {
    setVerifying(batchId);
    try {
      const res = await verifyBatchIntegrity(batchId);
      setVerificationResults((prev) => ({
        ...prev,
        [batchId]: { isVerified: res.isVerified, message: res.message },
      }));
    } finally {
      setVerifying(null);
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Layers className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            Public Blockchain Ledger
          </CardTitle>
          <CardDescription className="text-xs">
            Immutable SHA-256 ledger of BMU catch data entries. Records cannot be edited or deleted by anyone.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-1 text-xs">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ledger Summary Stats */}
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-900">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Total Blocks</p>
            <p className="text-lg font-bold font-mono text-emerald-600">{ledger.length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Ledger Status</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Lock className="h-3 w-3" /> Sealed
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Access</p>
            <p className="text-xs font-semibold text-sky-600">Public & Read-Only</p>
          </div>
        </div>

        {/* Blocks Feed */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {ledger.map((block) => {
            const isHighlighted =
              highlightBatchId &&
              block.batchId.toUpperCase() === highlightBatchId.toUpperCase();
            const verification = verificationResults[block.batchId];

            return (
              <div
                key={block.blockIndex}
                className={`rounded-xl border p-3.5 transition-all text-xs space-y-2.5 ${
                  isHighlighted
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 dark:bg-emerald-950/20'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800">
                      Block #{block.blockIndex}
                    </Badge>
                    <span className="font-mono font-bold text-foreground">{block.batchId}</span>
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] gap-1">
                      <Lock className="h-2.5 w-2.5" /> Immutable
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span>{formatDateTime(block.timestamp)}</span>
                  </div>
                </div>

                {/* BMU & Station Info */}
                <div className="flex items-center justify-between text-muted-foreground text-[11px] pt-0.5 border-t border-dashed">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Sealed by: {block.bmuName || block.bmuId} ({block.sealedByRole})
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Sig: {block.signature.slice(0, 16)}...
                  </span>
                </div>

                {/* Hashes */}
                <div className="space-y-1 bg-slate-900 text-slate-200 p-2.5 rounded-md font-mono text-[10px] overflow-x-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">DATA HASH (SHA-256):</span>
                    <button
                      type="button"
                      onClick={() => copyText(block.dataHash, `hash_${block.blockIndex}`)}
                      className="text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedHash === `hash_${block.blockIndex}` ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Copy
                    </button>
                  </div>
                  <p className="text-emerald-400 break-all">{block.dataHash}</p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">PREVIOUS BLOCK HASH:</span>
                  </div>
                  <p className="text-slate-400 break-all">
                    {block.previousHash === GENESIS_HASH ? 'GENESIS BLOCK (0000...000)' : block.previousHash}
                  </p>
                </div>

                {/* Verification Action */}
                <div className="flex items-center justify-between pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400"
                    onClick={() => handleVerify(block.batchId)}
                    disabled={verifying === block.batchId}
                  >
                    {verifying === block.batchId ? (
                      'Verifying Hash Chain...'
                    ) : (
                      <>
                        <FileKey className="mr-1 h-3.5 w-3.5" />
                        Verify Hash Integrity
                      </>
                    )}
                  </Button>

                  {verification && (
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        verification.isVerified ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Hash Chain Verified
                    </span>
                  )}
                </div>

                {verification && (
                  <p className="text-[11px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 p-2 rounded border border-emerald-200">
                    {verification.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
