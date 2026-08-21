import type {
  Boat,
  FishBatch,
  FishSpecies,
  HandlingEvent,
  LandingSite,
  MarketplaceListing,
  User,
} from '@/types';

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const mockUsers: User[] = [
  {
    id: 'usr_001',
    fullName: 'John Otieno',
    role: 'fisher',
    bmuId: 'bmu_dombo',
    email: 'j.otieno@fisher.aquaseal',
    phone: '+254712330098',
    createdAt: '2025-11-02T08:15:00+03:00',
  },
  {
    id: 'usr_002',
    fullName: 'Mary Atieno',
    role: 'fisher',
    bmuId: 'bmu_dombo',
    email: 'm.atieno@fisher.aquaseal',
    phone: '+254712330102',
    createdAt: '2025-11-04T09:40:00+03:00',
  },
  {
    id: 'usr_010',
    fullName: 'Samuel Were',
    role: 'bmu_officer',
    bmuId: 'bmu_dombo',
    email: 's.were@bmu.aquaseal',
    phone: '+254723400211',
    createdAt: '2025-10-20T07:00:00+03:00',
  },
  {
    id: 'usr_020',
    fullName: 'Grace Achieng',
    role: 'county_officer',
    bmuId: null,
    email: 'g.achieng@county.aquaseal',
    phone: '+254733500310',
    createdAt: '2025-09-15T08:00:00+03:00',
  },
  {
    id: 'usr_030',
    fullName: 'Daniel Kiprop',
    role: 'buyer',
    bmuId: null,
    email: 'd.kiprop@buyers.aquaseal',
    phone: '+254740600410',
    createdAt: '2025-12-01T10:00:00+03:00',
  },
];

// ---------------------------------------------------------------------------
// Landing sites (real Lake Victoria, Kenya locations)
// ---------------------------------------------------------------------------

export const mockLandingSites: LandingSite[] = [
  {
    id: 'site_dombo',
    name: 'Dunga Beach',
    county: 'Kisumu',
    coordinates: { lat: -0.1442, lng: 34.7497 },
    bmuId: 'bmu_dombo',
  },
  {
    id: 'site_ochollo',
    name: 'Ochollo Beach',
    county: 'Homa Bay',
    coordinates: { lat: -0.5745, lng: 34.4813 },
    bmuId: 'bmu_ochollo',
  },
  {
    id: 'site_asiwiro',
    name: 'Asiwiro Beach',
    county: 'Siaya',
    coordinates: { lat: -0.0634, lng: 34.2691 },
    bmuId: 'bmu_asiwiro',
  },
  {
    id: 'site_mulundu',
    name: 'Mulundu Beach',
    county: 'Siaya',
    coordinates: { lat: 0.0248, lng: 33.9274 },
    bmuId: 'bmu_mulundu',
  },
  {
    id: 'site_lwanga',
    name: "Lwanga K'otieno",
    county: 'Homa Bay',
    coordinates: { lat: -0.4412, lng: 34.2218 },
    bmuId: 'bmu_lwanga',
  },
];

// ---------------------------------------------------------------------------
// Boats
// ---------------------------------------------------------------------------

export const mockBoats: Boat[] = [
  {
    id: 'boat_01',
    name: 'Nyathi',
    registrationNo: 'LV-KSM-2143',
    ownerUserId: 'usr_001',
    landingSiteId: 'site_dombo',
  },
  {
    id: 'boat_02',
    name: 'Oluoch',
    registrationNo: 'LV-HBY-0871',
    ownerUserId: 'usr_002',
    landingSiteId: 'site_dombo',
  },
  {
    id: 'boat_03',
    name: 'Ramogi',
    registrationNo: 'LV-SYA-1597',
    ownerUserId: 'usr_001',
    landingSiteId: 'site_asiwiro',
  },
];

// ---------------------------------------------------------------------------
// Fish species (Lake Victoria)
// ---------------------------------------------------------------------------

export const mockSpecies: FishSpecies[] = [
  {
    id: 'sp_nile_perch',
    commonName: 'Nile Perch',
    scientificName: 'Lates niloticus',
    localName: 'Mbuta',
    stockStatus: 'moderate',
  },
  {
    id: 'sp_tilapia',
    commonName: 'Nile Tilapia',
    scientificName: 'Oreochromis niloticus',
    localName: 'Ngege',
    stockStatus: 'healthy',
  },
  {
    id: 'sp_dagaa',
    commonName: 'Silver Cyprinid',
    scientificName: 'Rastrineobola argentea',
    localName: 'Omena / Dagaa',
    stockStatus: 'healthy',
  },
  {
    id: 'sp_lungfish',
    commonName: 'Marbled Lungfish',
    scientificName: 'Protopterus aethiopicus',
    localName: 'Kamongo',
    stockStatus: 'declining',
  },
  {
    id: 'sp_catfish',
    commonName: 'African Catfish',
    scientificName: 'Clarias gariepinus',
    localName: 'Mumi',
    stockStatus: 'moderate',
  },
];

// ---------------------------------------------------------------------------
// Handling events helper
// ---------------------------------------------------------------------------

function ev(
  batchId: string,
  type: HandlingEvent['type'],
  occurredAt: string,
  location: string,
  actorRole: HandlingEvent['actorRole'],
  notes: string | null = null,
  coordinates?: { lat: number; lng: number }
): HandlingEvent {
  return {
    id: `evt_${batchId}_${type}_${occurredAt}`,
    batchId,
    type,
    occurredAt,
    location,
    actorRole,
    notes,
    coordinates,
  };
}

// ---------------------------------------------------------------------------
// Fish batches — covering every status & freshness state
// ---------------------------------------------------------------------------

export const mockBatches: FishBatch[] = [
  // 1. Verified, grade A — the "demo" batch
  {
    id: 'LV-482917',
    speciesId: 'sp_nile_perch',
    landingSiteId: 'site_dombo',
    boatId: 'boat_01',
    weightKg: 64.5,
    harvestMethod: 'gillnet',
    landedAt: '2026-08-19T06:12:00+03:00',
    freshness: 'grade_a',
    status: 'verified',
    verification: 'verified',
    createdAt: '2026-08-19T06:14:00+03:00',
    updatedAt: '2026-08-19T08:30:00+03:00',
    handlingEvents: [
      ev('LV-482917', 'harvested', '2026-08-19T04:30:00+03:00', 'Lake Victoria — Dunga fishing grounds', 'fisher', 'Gillnet set at 02:00, hauled at dawn.', { lat: -0.158, lng: 34.731 }),
      ev('LV-482917', 'landed', '2026-08-19T06:12:00+03:00', 'Dunga Beach', 'fisher', 'Offloaded to weighing station 2.', { lat: -0.1442, lng: 34.7497 }),
      ev('LV-482917', 'weighed', '2026-08-19T06:25:00+03:00', 'Dunga Beach — weighing station 2', 'fisher', 'Total weight 64.5 kg across 11 fish.'),
      ev('LV-482917', 'iced', '2026-08-19T06:40:00+03:00', 'Dunga Beach — cold store', 'fisher', 'Packed in crushed ice, ratio 1:1.'),
      ev('LV-482917', 'inspected', '2026-08-19T08:30:00+03:00', 'Dunga Beach — BMU office', 'bmu_officer', 'Freshness grade A confirmed. Scales bright, eyes clear, firm flesh.', { lat: -0.1442, lng: 34.7497 }),
    ],
  },

  // 2. Needs review — grade B, missing inspection event
  {
    id: 'LV-482920',
    speciesId: 'sp_tilapia',
    landingSiteId: 'site_asiwiro',
    boatId: 'boat_03',
    weightKg: 22.0,
    harvestMethod: 'seine',
    landedAt: '2026-08-19T07:50:00+03:00',
    freshness: 'grade_b',
    status: 'needs_review',
    verification: 'partially_verified',
    createdAt: '2026-08-19T07:55:00+03:00',
    updatedAt: '2026-08-19T09:10:00+03:00',
    handlingEvents: [
      ev('LV-482920', 'harvested', '2026-08-19T05:45:00+03:00', 'Lake Victoria — Asiwiro shallows', 'fisher', 'Beach seine, two pulls.', { lat: -0.058, lng: 34.262 }),
      ev('LV-482920', 'landed', '2026-08-19T07:50:00+03:00', 'Asiwiro Beach', 'fisher', null, { lat: -0.0634, lng: 34.2691 }),
      ev('LV-482920', 'weighed', '2026-08-19T08:05:00+03:00', 'Asiwiro Beach', 'fisher', '22.0 kg, mixed sizes.'),
    ],
  },

  // 3. Expired — grade C / spoiled, old landing date
  {
    id: 'LV-481603',
    speciesId: 'sp_dagaa',
    landingSiteId: 'site_ochollo',
    boatId: 'boat_02',
    weightKg: 118.0,
    harvestMethod: 'seine',
    landedAt: '2026-08-16T05:30:00+03:00',
    freshness: 'spoiled',
    status: 'expired',
    verification: 'verified',
    createdAt: '2026-08-16T05:35:00+03:00',
    updatedAt: '2026-08-18T07:00:00+03:00',
    handlingEvents: [
      ev('LV-481603', 'harvested', '2026-08-16T04:10:00+03:00', 'Lake Victoria — Ochollo grounds', 'fisher', 'Lamp seine, night haul.', { lat: -0.581, lng: 34.474 }),
      ev('LV-481603', 'landed', '2026-08-16T05:30:00+03:00', 'Ochollo Beach', 'fisher', null, { lat: -0.5745, lng: 34.4813 }),
      ev('LV-481603', 'weighed', '2026-08-16T05:45:00+03:00', 'Ochollo Beach', 'fisher', '118 kg, dried on racks same morning.'),
      ev('LV-481603', 'inspected', '2026-08-16T09:00:00+03:00', 'Ochollo Beach — BMU office', 'bmu_officer', 'Sun-drying confirmed.'),
      ev('LV-481603', 'transported', '2026-08-17T06:00:00+03:00', 'Ochollo → Homa Bay market', 'bmu_officer', 'Insulated van, no ice top-up recorded at transit.'),
    ],
  },

  // 4. Missing batch (not in this list — the API returns not-found)

  // 5. Verified grade B — catfish, longline
  {
    id: 'LV-482101',
    speciesId: 'sp_catfish',
    landingSiteId: 'site_mulundu',
    boatId: 'boat_03',
    weightKg: 31.8,
    harvestMethod: 'longline',
    landedAt: '2026-08-18T17:20:00+03:00',
    freshness: 'grade_b',
    status: 'verified',
    verification: 'verified',
    createdAt: '2026-08-18T17:25:00+03:00',
    updatedAt: '2026-08-18T19:00:00+03:00',
    handlingEvents: [
      ev('LV-482101', 'harvested', '2026-08-18T14:00:00+03:00', 'Lake Victoria — Mulundu inlet', 'fisher', 'Longline, 40 hooks, overnight set.', { lat: 0.031, lng: 33.921 }),
      ev('LV-482101', 'landed', '2026-08-18T17:20:00+03:00', 'Mulundu Beach', 'fisher', null, { lat: 0.0248, lng: 33.9274 }),
      ev('LV-482101', 'weighed', '2026-08-18T17:35:00+03:00', 'Mulundu Beach', 'fisher', '31.8 kg, 7 fish.'),
      ev('LV-482101', 'iced', '2026-08-18T17:50:00+03:00', 'Mulundu Beach — cold store', 'fisher', 'Crushed ice applied.'),
      ev('LV-482101', 'inspected', '2026-08-18T19:00:00+03:00', 'Mulundu Beach — BMU office', 'bmu_officer', 'Grade B — slight softening at belly, otherwise sound.'),
    ],
  },

  // 6. Needs review — disputed verification, lungfish declining stock
  {
    id: 'LV-482310',
    speciesId: 'sp_lungfish',
    landingSiteId: 'site_lwanga',
    boatId: 'boat_02',
    weightKg: 9.6,
    harvestMethod: 'traps',
    landedAt: '2026-08-19T11:00:00+03:00',
    freshness: 'grade_c',
    status: 'needs_review',
    verification: 'disputed',
    createdAt: '2026-08-19T11:05:00+03:00',
    updatedAt: '2026-08-19T13:20:00+03:00',
    handlingEvents: [
      ev('LV-482310', 'harvested', '2026-08-19T09:30:00+03:00', 'Lwanga swamp margin', 'fisher', 'Traps set overnight, 3 fish.', { lat: -0.446, lng: 34.218 }),
      ev('LV-482310', 'landed', '2026-08-19T11:00:00+03:00', "Lwanga K'otieno", 'fisher', null, { lat: -0.4412, lng: 34.2218 }),
      ev('LV-482310', 'weighed', '2026-08-19T11:15:00+03:00', "Lwanga K'otieno", 'fisher', '9.6 kg total.'),
      ev('LV-482310', 'inspected', '2026-08-19T13:20:00+03:00', "Lwanga K'otieno — BMU office", 'bmu_officer', 'Grade C. Stock status for lungfish is declining — quota flag raised by county officer.'),
    ],
  },
];

// ---------------------------------------------------------------------------
// Marketplace listings
// ---------------------------------------------------------------------------

export const mockListings: MarketplaceListing[] = [
  {
    id: 'lst_001',
    batchId: 'LV-482917',
    priceKesPerKg: 480,
    quantityKg: 64.5,
    status: 'active',
    listedAt: '2026-08-19T09:00:00+03:00',
    expiresAt: '2026-08-20T18:00:00+03:00',
    buyerUserId: null,
  },
  {
    id: 'lst_002',
    batchId: 'LV-482101',
    priceKesPerKg: 360,
    quantityKg: 6.0,
    status: 'low_stock',
    listedAt: '2026-08-18T19:30:00+03:00',
    expiresAt: '2026-08-20T12:00:00+03:00',
    buyerUserId: null,
  },
  {
    id: 'lst_003',
    batchId: 'LV-481603',
    priceKesPerKg: 120,
    quantityKg: 118.0,
    status: 'expired',
    listedAt: '2026-08-16T10:00:00+03:00',
    expiresAt: '2026-08-18T18:00:00+03:00',
    buyerUserId: null,
  },
];
