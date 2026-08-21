// Domain types modeling the future Go modular monolith REST/JSON contract.
// These are intentionally shaped so the mock service layer can be swapped for
// real HTTP calls without touching the UI.

// ---------------------------------------------------------------------------
// Enums / unions
// ---------------------------------------------------------------------------

export type UserRole =
  | 'fisher'
  | 'bmu_officer'
  | 'county_officer'
  | 'buyer'
  | 'admin';

export type BatchStatus =
  | 'draft'
  | 'landed'
  | 'verified'
  | 'needs_review'
  | 'expired'
  | 'rejected';

export type FreshnessRating = 'grade_a' | 'grade_b' | 'grade_c' | 'spoiled';

export type HarvestMethod = 'gillnet' | 'longline' | 'seine' | 'traps' | 'angling';

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'unverified'
  | 'disputed';

export type ListingStatus = 'active' | 'low_stock' | 'sold' | 'expired' | 'withdrawn';

export type HandlingEventType =
  | 'harvested'
  | 'landed'
  | 'weighed'
  | 'iced'
  | 'transported'
  | 'inspected'
  | 'listed'
  | 'sold';

// ---------------------------------------------------------------------------
// Core entities
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  bmuId: string | null;
  email: string;
  phone: string | null;
  createdAt: string; // ISO 8601
}

export interface LandingSite {
  id: string;
  name: string;
  county: string;
  coordinates: { lat: number; lng: number };
  bmuId: string;
}

export interface Boat {
  id: string;
  name: string;
  registrationNo: string;
  ownerUserId: string;
  landingSiteId: string;
}

export interface FishSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  localName: string;
  stockStatus: 'healthy' | 'moderate' | 'declining';
}

export interface HandlingEvent {
  id: string;
  batchId: string;
  type: HandlingEventType;
  occurredAt: string; // ISO 8601
  location: string;
  actorRole: UserRole;
  notes: string | null;
  // Coordinates optional — some events are off-site (transport).
  coordinates?: { lat: number; lng: number };
}

export interface FishBatch {
  id: string; // human-readable, e.g. "LV-482917"
  speciesId: string;
  landingSiteId: string;
  boatId: string;
  weightKg: number;
  harvestMethod: HarvestMethod;
  landedAt: string; // ISO 8601
  freshness: FreshnessRating;
  status: BatchStatus;
  verification: VerificationStatus;
  handlingEvents: HandlingEvent[];
  createdAt: string;
  updatedAt: string;
  // Fisher personal info is intentionally excluded from this model —
  // verification surfaces boat/landing site, not individual identities.
}

export interface MarketplaceListing {
  id: string;
  batchId: string;
  priceKesPerKg: number;
  quantityKg: number;
  status: ListingStatus;
  listedAt: string;
  expiresAt: string;
  buyerUserId: string | null;
}

// ---------------------------------------------------------------------------
// API response envelopes & verification result
// ---------------------------------------------------------------------------

export interface VerificationResult {
  batch: FishBatch;
  species: FishSpecies;
  landingSite: LandingSite;
  trustScore: number; // 0–100
  trustSummary: string;
  lastVerifiedAt: string | null;
  flags: VerificationFlag[];
}

export interface VerificationFlag {
  code: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
}

export interface DashboardSummary {
  totalBatches: number;
  verifiedBatches: number;
  needsReviewBatches: number;
  expiredBatches: number;
  activeListings: number;
  totalListedWeightKg: number;
  averageFreshnessGrade: FreshnessRating | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status?: number;
}
