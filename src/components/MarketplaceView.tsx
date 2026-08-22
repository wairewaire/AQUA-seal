import React, { useState } from 'react';
import {
  ShoppingBag,
  Filter,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Send,
  Sparkles,
  Info,
  DollarSign,
  Eye,
  ShoppingCart,
  History,
  Star,
} from 'lucide-react';
import { FishBatch, SPECIES_CATALOG, SpeciesType } from '../types/aqua-seal';
import { calculateMarketplaceFees } from '../lib/ledger-engine';
import type { AppRole } from '../App';

interface BatchReview {
  rating: number;
  comment: string;
  reviewedAt: string;
}

interface Props {
  batches: FishBatch[];
  onRefreshData: () => void;
  appRole: AppRole;
  currentUser: { name: string; phone: string };
  onOpenVerification: (batchId: string) => void;
}

export const MarketplaceView: React.FC<Props> = ({ batches, onRefreshData, appRole, currentUser, onOpenVerification }) => {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('ALL');
  const [selectedBatchForInquiry, setSelectedBatchForInquiry] = useState<FishBatch | null>(null);
  const [selectedBatchForPurchase, setSelectedBatchForPurchase] = useState<FishBatch | null>(null);
  const [selectedBatchForReview, setSelectedBatchForReview] = useState<FishBatch | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [batchReviews, setBatchReviews] = useState<Record<string, BatchReview>>(() => {
    try {
      return JSON.parse(localStorage.getItem('aqua-seal-batch-reviews') || '{}');
    } catch {
      return {};
    }
  });
  const [sellerPrices, setSellerPrices] = useState<Record<string, string>>({});
  const [purchaseHistory, setPurchaseHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('aqua-seal-purchases') || '[]');
    } catch {
      return [];
    }
  });
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('+254 7');
  const [inquirySent, setInquirySent] = useState(false);

  const activeListings = batches.filter((b) => b.listing?.isListed && b.status === 'ACTIVE_LISTED');
  const sellerBatches = batches.filter(
    (b) => b.fisherName === currentUser.name && b.status !== 'SOLD' && b.events.some((event) => event.eventType === 'LANDED' && event.actor.role === 'BMU_CLERK')
  );

  const filteredListings = activeListings.filter((b) => {
    if (selectedSpecies !== 'ALL' && b.species !== selectedSpecies) return false;
    return true;
  });

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setSelectedBatchForInquiry(null);
      setBuyerName('');
    }, 3000);
  };

  const handleSetPrice = async (batch: FishBatch) => {
    const price = Number(sellerPrices[batch.id]);
    if (!Number.isFinite(price) || price < 1) return;
    await fetch(`/api/batches/${encodeURIComponent(batch.batchId)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'LISTED', actorName: currentUser.name, actorRole: 'FISHER', actorPhone: currentUser.phone, siteName: `${batch.landingSiteName} Market Desk`, listingPricePerKgKes: price, channel: 'WEB_DESK' }),
    });
    onRefreshData();
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForPurchase?.listing) return;
    const batch = selectedBatchForPurchase;
    await fetch(`/api/batches/${encodeURIComponent(batch.batchId)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'SOLD', actorName: buyerName, actorRole: 'BUYER', actorPhone: buyerPhone, siteName: batch.landingSiteName, salePriceKes: batch.listing.estimatedTotalKes, buyerName, buyerType: 'DIRECT_BUYER', channel: 'WEB_DESK' }),
    });
    const updatedHistory = [batch.batchId, ...purchaseHistory.filter((id) => id !== batch.batchId)];
    setPurchaseHistory(updatedHistory);
    localStorage.setItem('aqua-seal-purchases', JSON.stringify(updatedHistory));
    setSelectedBatchForPurchase(null);
    setBuyerName('');
    onRefreshData();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForReview || !reviewComment.trim()) return;
    const review: BatchReview = {
      rating: reviewRating,
      comment: reviewComment.trim(),
      reviewedAt: new Date().toISOString(),
    };
    const updatedReviews = { ...batchReviews, [selectedBatchForReview.batchId]: review };
    setBatchReviews(updatedReviews);
    localStorage.setItem('aqua-seal-batch-reviews', JSON.stringify(updatedReviews));
    setSelectedBatchForReview(null);
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#004D40] rounded-xl p-6 sm:p-8 border border-teal-900/60 shadow-xs text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-teal-200 uppercase tracking-widest">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Direct Lake Victoria Fish Market</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
              {appRole === 'SELLER' ? 'Your direct fish sales desk' : 'Fair-Trade Verified Micro-Marketplace'}
            </h1>
            <p className="text-xs text-teal-100/90 mt-1 max-w-xl leading-relaxed">
              {appRole === 'SELLER'
                ? 'Price BMU-processed catches for direct buyers. Your listing keeps the verified origin and handling history attached.'
                : 'Buy directly from artisanal fishers with certified BMU landing provenance and cold-chain evidence.'}
              <strong className="text-teal-200"> 1.5% transparent direct-sale buyer fee.</strong>
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-xs p-4 rounded-lg border border-white/15 text-xs space-y-1">
            <div className="font-bold text-teal-200">Lake Victoria Pricing Transparency</div>
            <div className="text-teal-100/80 text-[11px]">
              • Nile Perch: ~480-520 KES/kg • Tilapia: ~420-450 KES/kg
            </div>
          </div>
        </div>
      </div>

      {appRole === 'SELLER' && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">BMU-processed catches</h2>
              <p className="text-xs text-slate-500">Only catches with a recorded BMU landing event can be priced here.</p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Seller: {currentUser.name}
            </span>
          </div>
          {sellerBatches.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-4">No active BMU-processed catches are attached to this seller.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {sellerBatches.map((batch) => {
                const currentPrice = batch.listing?.pricePerKgKes || SPECIES_CATALOG[batch.species].indicativePricePerKgKes;
                return (
                  <div key={batch.id} className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-800">{batch.batchId}</div>
                      <div className="text-xs text-slate-500 mt-1">{SPECIES_CATALOG[batch.species].commonName} • {batch.currentWeightKg}kg • {batch.landingSiteName}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">Market guide: KES {SPECIES_CATALOG[batch.species].indicativePricePerKgKes}/kg</div>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSetPrice(batch); }} className="flex items-center gap-2">
                      <label htmlFor={`price-${batch.id}`} className="sr-only">Price per kilogram</label>
                      <input
                        id={`price-${batch.id}`}
                        type="number"
                        min="1"
                        required
                        value={sellerPrices[batch.id] ?? currentPrice}
                        onChange={(e) => setSellerPrices((prev) => ({ ...prev, [batch.id]: e.target.value }))}
                        className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-900"
                      />
                      <span className="text-[11px] text-slate-500">KES/kg</span>
                      <button type="submit" className="px-3 py-2 bg-[#006064] hover:bg-[#004D40] text-white rounded-lg text-[11px] font-bold">Publish price</button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {appRole === 'BUYER' && purchaseHistory.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><History className="w-4 h-4 text-[#006064]" /> Your purchase history</div>
          <div className="flex flex-wrap gap-2 mt-3">
            {purchaseHistory.map((batchId) => <button key={batchId} onClick={() => onOpenVerification(batchId)} className="font-mono text-[11px] px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700">{batchId}</button>)}
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Species:</span>
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'NILE_PERCH', 'TILAPIA', 'OMENA', 'CATFISH'].map((sp) => (
              <button
                key={sp}
                onClick={() => setSelectedSpecies(sp)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors uppercase tracking-wider ${
                  selectedSpecies === sp
                    ? 'bg-[#004D40] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sp === 'ALL' ? 'All Catches' : SPECIES_CATALOG[sp as SpeciesType]?.commonName || sp}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{filteredListings.length}</strong> active batch listings
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((batch) => {
          const fees = calculateMarketplaceFees(batch.listing?.pricePerKgKes || 480, batch.currentWeightKg);
          const speciesMeta = SPECIES_CATALOG[batch.species] || SPECIES_CATALOG.NILE_PERCH;

          return (
            <div
              key={batch.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                    {batch.batchId}
                  </span>
                  {batch.qualifiesLakeFreshSeal && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F2F1] text-[#004D40] border border-teal-200">
                      ★ Lake Fresh
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {speciesMeta.commonName}
                  </h3>
                  <div className="text-xs text-slate-500">{speciesMeta.localName}</div>
                </div>

                {/* Vessel & BMU */}
                <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs text-slate-600 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">BMU Landing Beach:</span>
                    <strong className="text-slate-800">{batch.landingSiteName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fishing Vessel:</span>
                    <span className="text-slate-800 font-semibold">{batch.boatName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Weight:</span>
                    <strong className="text-slate-900 font-mono text-sm">{batch.currentWeightKg} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Core Temp &amp; Ice:</span>
                    <span className="text-[#004D40] font-semibold font-mono">
                      {batch.currentTemperatureCelsius}°C • {batch.freshnessGrade.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Pricing & 1.5% Fee Breakdown */}
                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">Unit Price:</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      KES {fees.pricePerKgKes} <span className="text-xs font-normal text-slate-500">/ kg</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Est. Batch Total:</span>
                    <span className="font-bold text-slate-800 font-mono">KES {fees.grossTotalKes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#004D40] bg-[#E0F2F1] px-2 py-1 rounded-md">
                    <span>Direct Platform Fee (1.5%):</span>
                    <span className="font-bold font-mono">KES {fees.directSaleFeeKes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                    <span>Fisher Net Payout:</span>
                    <span className="font-mono text-emerald-700">KES {fees.fisherNetEarningsKes.toLocaleString()}</span>
                  </div>
                </div>
                {appRole === 'BUYER' && batchReviews[batch.batchId] && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{batchReviews[batch.batchId].rating}/5</span>
                    <span className="truncate text-amber-800">{batchReviews[batch.batchId].comment}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <div className={`grid gap-2 ${appRole === 'BUYER' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <button onClick={() => onOpenVerification(batch.batchId)} className="py-2.5 px-2 bg-white hover:bg-slate-100 text-[#004D40] border border-teal-200 font-bold text-[11px] uppercase tracking-wide rounded-lg flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /><span>Trace fish</span>
                  </button>
                  {appRole === 'BUYER' && (
                    <button onClick={() => { setSelectedBatchForReview(batch); setReviewRating(batchReviews[batch.batchId]?.rating || 5); setReviewComment(batchReviews[batch.batchId]?.comment || ''); }} className="py-2.5 px-2 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px] uppercase tracking-wide rounded-lg flex items-center justify-center gap-1.5">
                      <Star className="w-3.5 h-3.5" /><span>Review</span>
                    </button>
                  )}
                  {appRole === 'BUYER' ? (
                    <button onClick={() => { setSelectedBatchForPurchase(batch); setBuyerName(currentUser.name); }} className="py-2.5 px-2 bg-[#006064] hover:bg-[#004D40] text-white font-bold text-[11px] uppercase tracking-wide rounded-lg flex items-center justify-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /><span>Buy direct</span>
                    </button>
                  ) : (
                    <button onClick={() => setSelectedBatchForInquiry(batch)} className="py-2.5 px-2 bg-[#006064] hover:bg-[#004D40] text-white font-bold text-[11px] uppercase tracking-wide rounded-lg flex items-center justify-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /><span>Contact seller</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inquiry Modal */}
      {selectedBatchForInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Inquire About Batch {selectedBatchForInquiry.batchId}
            </h3>
            <p className="text-xs text-slate-500">
              Your inquiry will be relayed to boat captain <strong className="text-slate-800">{selectedBatchForInquiry.fisherName}</strong> via SMS relay without exposing private personal phone numbers.
            </p>

            {inquirySent ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-semibold space-y-1">
                <div className="font-bold">SMS Relay Dispatched!</div>
                <div>The seller and BMU desk have been notified of your offer.</div>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Your Name or Organization
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sovereign Hotel Kisumu / Mama Pendo"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Your Contact Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+254 712 345 678"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div className="p-3 bg-[#E0F2F1] rounded-lg border border-teal-200 text-[11px] text-[#004D40]">
                  Total Payable at Landing: <strong className="font-mono">KES {selectedBatchForInquiry.listing?.estimatedTotalKes.toLocaleString()}</strong> (Includes 1.5% verified assurance fee).
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedBatchForInquiry(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wide text-white bg-[#006064] hover:bg-[#004D40] rounded-lg shadow-xs"
                  >
                    Send Direct Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {selectedBatchForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Buy {selectedBatchForPurchase.batchId}</h3>
              <p className="text-xs text-slate-500 mt-1">Direct purchase from {selectedBatchForPurchase.fisherName}. The BMU provenance record stays attached to this batch.</p>
            </div>
            <div className="p-3 bg-[#E0F2F1] rounded-lg text-xs text-[#004D40] space-y-1">
              <div className="flex justify-between"><span>Fish and weight</span><strong>{selectedBatchForPurchase.currentWeightKg}kg</strong></div>
              <div className="flex justify-between"><span>Total payable</span><strong>KES {selectedBatchForPurchase.listing?.estimatedTotalKes.toLocaleString()}</strong></div>
            </div>
            <form onSubmit={handlePurchase} className="space-y-3">
              <input required value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Buyer name or business" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900" />
              <input required value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="Buyer phone number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900" />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setSelectedBatchForPurchase(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold uppercase tracking-wide text-white bg-[#006064] hover:bg-[#004D40] rounded-lg">Confirm purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBatchForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Review batch {selectedBatchForReview.batchId}</h3>
              <p className="text-xs text-slate-500 mt-1">Share what you observed from the seller and the BMU handling record. Your review is attached to this batch on this demo device.</p>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Overall batch experience</label>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Batch rating">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button key={rating} type="button" onClick={() => setReviewRating(rating)} aria-label={`${rating} out of 5 stars`} className="p-1">
                      <Star className={`w-6 h-6 ${rating <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-semibold text-slate-600">{reviewRating}/5</span>
                </div>
              </div>
              <div>
                <label htmlFor="batch-review" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your review</label>
                <textarea id="batch-review" required rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Was the fish fresh? Was the origin and handling information clear?" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 resize-none focus:outline-hidden focus:ring-1 focus:ring-teal-700" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setSelectedBatchForReview(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold uppercase tracking-wide text-white bg-[#006064] hover:bg-[#004D40] rounded-lg">Save review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};