import type {
  ApiError,
  BlockchainBlock,
  DashboardSummary,
  FishBatch,
  FreshnessRating,
  HandlingEvent,
  VerificationFlag,
  VerificationResult,
} from '@/types';
import {
  mockBatches,
  mockLandingSites,
  mockSpecies,
} from '@/lib/mock/data';
import {
  getBlockForBatch,
  sealBatchOnBlockchain,
} from '@/lib/blockchain/ledger';
import {
  ApiRequestError,
  delay,
  delayError,
  networkError,
  notFoundError,
  normalizeBatchId,
  validationError,
} from './client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SPECIES_BY_ID = new Map(mockSpecies.map((s) => [s.id, s]));
const SITES_BY_ID = new Map(mockLandingSites.map((s) => [s.id, s]));

function lookupBatch(rawId: string): FishBatch | undefined {
  const id = normalizeBatchId(rawId);
  return mockBatches.find((b) => b.id === id);
}

function freshnessScore(f: FreshnessRating): number {
  switch (f) {
    case 'grade_a': return 100;
    case 'grade_b': return 78;
    case 'grade_c': return 52;
    case 'spoiled': return 14;
  }
}

function eventCoverageScore(events: HandlingEvent[]): number {
  const expected: HandlingEvent['type'][] = ['harvested', 'landed', 'weighed', 'iced', 'inspected'];
  const present = new Set(events.map((e) => e.type));
  const covered = expected.filter((t) => present.has(t)).length;
  return Math.round((covered / expected.length) * 100);
}

function buildFlags(batch: FishBatch): VerificationFlag[] {
  const flags: VerificationFlag[] = [];
  const hasInspection = batch.handlingEvents.some((e) => e.type === 'inspected');
  const hasIcing = batch.handlingEvents.some((e) => e.type === 'iced');

  if (!hasInspection) {
    flags.push({
      code: 'missing_inspection',
      severity: 'warning',
      message: 'No BMU inspection event has been recorded for this batch.',
    });
  }
  if (!hasIcing && batch.freshness !== 'spoiled') {
    flags.push({
      code: 'no_cold_chain',
      severity: 'warning',
      message: 'No cold-chain (icing) event recorded — freshness may degrade faster.',
    });
  }
  if (batch.freshness === 'spoiled') {
    flags.push({
      code: 'spoiled',
      severity: 'danger',
      message: 'Batch freshness is rated spoiled. Not fit for sale.',
    });
  }
  if (batch.verification === 'disputed') {
    flags.push({
      code: 'disputed',
      severity: 'danger',
      message: 'Verification is disputed. County officer review pending.',
    });
  }
  const sp = SPECIES_BY_ID.get(batch.speciesId);
  if (sp?.stockStatus === 'declining') {
    flags.push({
      code: 'declining_stock',
      severity: 'info',
      message: `${sp.commonName} stock is declining in this region. Quota review recommended.`,
    });
  }
  return flags;
}

function trustSummary(batch: FishBatch, score: number): string {
  if (score >= 85) {
    return `Batch ${batch.id} is fully traceable from harvest to landing, with a confirmed BMU inspection and an intact cold chain.`;
  }
  if (score >= 60) {
    return `Batch ${batch.id} is partially traceable. Most handling steps are recorded, but some verification steps are outstanding.`;
  }
  if (batch.verification === 'disputed') {
    return `Batch ${batch.id} verification is disputed. Trust is low until the county officer review is completed.`;
  }
  return `Batch ${batch.id} has significant gaps in its handling record. Trust is low — request a fresh inspection before purchase.`;
}

function buildVerificationResult(batch: FishBatch): VerificationResult {
  const species = SPECIES_BY_ID.get(batch.speciesId)!;
  const landingSite = SITES_BY_ID.get(batch.landingSiteId)!;
  const fresh = freshnessScore(batch.freshness);
  const coverage = eventCoverageScore(batch.handlingEvents);
  const penalty = batch.verification === 'disputed' ? 25 : 0;
  const trustScore = Math.max(0, Math.round(fresh * 0.45 + coverage * 0.45 + 10 - penalty));
  const flags = buildFlags(batch);
  const lastInspection = batch.handlingEvents
    .filter((e) => e.type === 'inspected')
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];

  const blockchainProof = getBlockForBatch(batch.id) || batch.blockchain;

  return {
    batch: {
      ...batch,
      blockchain: blockchainProof,
    },
    species,
    landingSite,
    trustScore,
    trustSummary: trustSummary(batch, trustScore),
    lastVerifiedAt: lastInspection?.occurredAt ?? null,
    flags,
    blockchainProof,
    isChainVerified: Boolean(blockchainProof?.isImmutable),
  };
}

// ---------------------------------------------------------------------------
// Public API (mocked)
// ---------------------------------------------------------------------------

export async function getBatches(): Promise<FishBatch[]> {
  const enriched = mockBatches.map((b) => ({
    ...b,
    blockchain: getBlockForBatch(b.id) || b.blockchain,
  }));
  return delay([...enriched]);
}

export async function getBatchById(id: string): Promise<FishBatch> {
  const batch = lookupBatch(id);
  if (!batch) return delayError(notFoundError('Batch', id));
  const blockchain = getBlockForBatch(batch.id) || batch.blockchain;
  return delay({ ...batch, blockchain });
}

export interface CreateBatchInput {
  speciesId: string;
  landingSiteId: string;
  boatId: string;
  weightKg: number;
  harvestMethod: FishBatch['harvestMethod'];
}

export async function createBatch(input: CreateBatchInput): Promise<FishBatch> {
  if (input.weightKg <= 0) {
    return delayError(validationError('Weight must be greater than zero.'));
  }
  if (!SPECIES_BY_ID.has(input.speciesId)) {
    return delayError(validationError('Unknown species.'));
  }
  const seq = 482917 + mockBatches.length + 1;
  const now = new Date().toISOString();
  const batchId = `LV-${seq}`;

  const landingSiteName = SITES_BY_ID.get(input.landingSiteId)?.name ?? 'Dunga BMU';

  const batch: FishBatch = {
    id: batchId,
    speciesId: input.speciesId,
    landingSiteId: input.landingSiteId,
    boatId: input.boatId,
    weightKg: input.weightKg,
    harvestMethod: input.harvestMethod,
    landedAt: now,
    freshness: 'grade_a',
    status: 'landed',
    verification: 'verified',
    handlingEvents: [
      {
        id: `evt_${batchId}_landed_${now}`,
        batchId,
        type: 'landed',
        occurredAt: now,
        location: landingSiteName,
        actorRole: 'bmu_officer',
        notes: 'BMU Catch Data Entry recorded & sealed on Blockchain.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // Seal BMU data entry onto the immutable blockchain ledger
  const block = await sealBatchOnBlockchain(
    batch,
    `bmu_${input.landingSiteId}`,
    `${landingSiteName} BMU Station`,
    'bmu_officer'
  );

  batch.blockchain = block;
  mockBatches.unshift(batch);

  return delay(batch);
}

export interface UpdateHandlingInput {
  type: HandlingEvent['type'];
  location: string;
  notes?: string;
}

export async function updateBatchHandling(
  batchId: string,
  input: UpdateHandlingInput
): Promise<FishBatch> {
  const batch = lookupBatch(batchId);
  if (!batch) return delayError(notFoundError('Batch', batchId));
  const now = new Date().toISOString();
  const event: HandlingEvent = {
    id: `evt_${batchId}_${input.type}_${now}`,
    batchId,
    type: input.type,
    occurredAt: now,
    location: input.location,
    actorRole: 'bmu_officer',
    notes: input.notes ?? null,
  };
  const updated: FishBatch = {
    ...batch,
    handlingEvents: [...batch.handlingEvents, event],
    updatedAt: now,
  };
  const idx = mockBatches.findIndex((b) => b.id === batchId);
  if (idx !== -1) mockBatches[idx] = updated;
  return delay(updated);
}

export async function verifyBatch(rawId: string): Promise<VerificationResult> {
  const id = normalizeBatchId(rawId);
  if (!id) {
    return delayError(validationError('Please enter a batch ID.'));
  }
  const batch = lookupBatch(id);
  if (!batch) return delayError(notFoundError('Batch', id));
  return delay(buildVerificationResult(batch));
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const total = mockBatches.length;
  const verified = mockBatches.filter((b) => b.status === 'verified').length;
  const needsReview = mockBatches.filter((b) => b.status === 'needs_review').length;
  const expired = mockBatches.filter((b) => b.status === 'expired').length;
  const grades = mockBatches
    .filter((b) => b.status !== 'expired')
    .map((b) => b.freshness);
  const averageFreshnessGrade: FreshnessRating | null = grades.length
    ? (grades.sort((a, b) => freshnessScore(b) - freshnessScore(a))[0] as FreshnessRating)
    : null;
  return delay({
    totalBatches: total,
    verifiedBatches: verified,
    needsReviewBatches: needsReview,
    expiredBatches: expired,
    activeListings: 0,
    totalListedWeightKg: 0,
    averageFreshnessGrade,
  });
}

export { ApiRequestError };
export type { ApiError };
