import type { MarketplaceListing } from '@/types';
import { mockListings } from '@/lib/mock/data';
import { delay, delayError, notFoundError } from './client';

export async function getListings(): Promise<MarketplaceListing[]> {
  return delay([...mockListings]);
}

export async function getListingById(id: string): Promise<MarketplaceListing> {
  const listing = mockListings.find((l) => l.id === id);
  if (!listing) return delayError(notFoundError('Listing', id));
  return delay({ ...listing });
}

export interface CreateListingInput {
  batchId: string;
  priceKesPerKg: number;
  quantityKg: number;
}

export async function createMarketplaceListing(
  input: CreateListingInput
): Promise<MarketplaceListing> {
  const now = new Date();
  const expires = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  const seq = mockListings.length + 1;
  const listing: MarketplaceListing = {
    id: `lst_${String(seq).padStart(3, '0')}`,
    batchId: input.batchId,
    priceKesPerKg: input.priceKesPerKg,
    quantityKg: input.quantityKg,
    status: 'active',
    listedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    buyerUserId: null,
  };
  return delay(listing);
}

export async function requestBatchPurchase(
  listingId: string,
  buyerUserId: string
): Promise<MarketplaceListing> {
  const listing = mockListings.find((l) => l.id === listingId);
  if (!listing) return delayError(notFoundError('Listing', listingId));
  return delay({
    ...listing,
    buyerUserId,
    status: 'sold',
  });
}
