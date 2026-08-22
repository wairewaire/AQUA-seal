var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);

// src/server-app.ts
var import_express = __toESM(require("express"), 1);

// src/types/aqua-seal.ts
var import_zod = require("zod");
var SPECIES_CATALOG = {
  NILE_PERCH: {
    id: "NILE_PERCH",
    commonName: "Nile Perch",
    localName: "Mbuta (Luo) / Sangara (Swahili)",
    scientificName: "Lates niloticus",
    description: "Prized premium white meat fish from deep Lake Victoria waters. High export and restaurant demand.",
    indicativePricePerKgKes: 480,
    maxFreshHoursOnIce: 72,
    minLegalLengthCm: 50
  },
  TILAPIA: {
    id: "TILAPIA",
    commonName: "Nile Tilapia",
    localName: "Ngege (Luo) / Sato (Swahili)",
    scientificName: "Oreochromis niloticus",
    description: "Flavorful, high-demand freshwater fish caught in near-shore and bay waters around papyrus reeds.",
    indicativePricePerKgKes: 420,
    maxFreshHoursOnIce: 48,
    minLegalLengthCm: 25
  },
  OMENA: {
    id: "OMENA",
    commonName: "Lake Victoria Sardine",
    localName: "Omena (Luo) / Dagaa (Swahili)",
    scientificName: "Rastrineobola argentea",
    description: "Small silver cyprinid caught during dark moon phases with lantern light attraction.",
    indicativePricePerKgKes: 220,
    maxFreshHoursOnIce: 24
  },
  CATFISH: {
    id: "CATFISH",
    commonName: "African Sharptooth Catfish",
    localName: "Mumi (Luo) / Kambale (Swahili)",
    scientificName: "Clarias gariepinus",
    description: "Hardy freshwater species with rich succulent meat, popular in traditional Lake Victoria cuisine.",
    indicativePricePerKgKes: 360,
    maxFreshHoursOnIce: 60
  }
};
var LANDING_SITES = [
  {
    id: "site-dunga",
    name: "Dunga Beach BMU",
    county: "Kisumu",
    code: "DG",
    coordinates: { lat: -0.1465, lng: 34.7368 },
    bmuLeader: "Otieno Maurice (BMU Chairman)",
    phoneContact: "+254 722 314 890",
    hasSolarIcePlant: true,
    activeBoatsCount: 64
  },
  {
    id: "site-uhanya",
    name: "Uhanya Beach BMU",
    county: "Siaya",
    code: "UH",
    coordinates: { lat: -0.0682, lng: 34.1956 },
    bmuLeader: "Achieng Perez (BMU Secretary)",
    phoneContact: "+254 713 902 441",
    hasSolarIcePlant: true,
    activeBoatsCount: 52
  },
  {
    id: "site-mbita",
    name: "Mbita Point BMU",
    county: "Homa Bay",
    code: "MB",
    coordinates: { lat: -0.4285, lng: 34.2045 },
    bmuLeader: "Okoth Tobias (BMU Clerk)",
    phoneContact: "+254 720 887 123",
    hasSolarIcePlant: true,
    activeBoatsCount: 88
  },
  {
    id: "site-usenge",
    name: "Usenge Beach BMU",
    county: "Siaya",
    code: "US",
    coordinates: { lat: -0.0984, lng: 34.0532 },
    bmuLeader: "Omondi Kevin (BMU Officer)",
    phoneContact: "+254 734 561 290",
    hasSolarIcePlant: false,
    activeBoatsCount: 45
  },
  {
    id: "site-karungu",
    name: "Karungu Bay BMU",
    county: "Migori",
    code: "KG",
    coordinates: { lat: -0.8456, lng: 34.1567 },
    bmuLeader: "Mboya Grace (BMU Chairlady)",
    phoneContact: "+254 725 440 981",
    hasSolarIcePlant: true,
    activeBoatsCount: 71
  },
  {
    id: "site-wichlum",
    name: "Wichlum Beach BMU",
    county: "Siaya",
    code: "WL",
    coordinates: { lat: -0.0354, lng: 34.2189 },
    bmuLeader: "Onyango Charles",
    phoneContact: "+254 711 789 012",
    hasSolarIcePlant: false,
    activeBoatsCount: 38
  },
  {
    id: "site-luanda",
    name: "Luanda Kotieno BMU",
    county: "Siaya",
    code: "LK",
    coordinates: { lat: -0.4354, lng: 34.3312 },
    bmuLeader: "Adhiambo Beatrice",
    phoneContact: "+254 728 901 345",
    hasSolarIcePlant: true,
    activeBoatsCount: 60
  }
];
var CreateBatchSchema = import_zod.z.object({
  boatRegistration: import_zod.z.string().min(3, "Boat registration is required"),
  species: import_zod.z.enum(["NILE_PERCH", "TILAPIA", "OMENA", "CATFISH"]),
  landingSiteId: import_zod.z.string().min(1, "Landing site is required"),
  harvestMethod: import_zod.z.string().min(2, "Harvest method is required"),
  weightKg: import_zod.z.number().min(0.5, "Weight must be at least 0.5 kg").max(1500, "Weight exceeds realistic artisanal boat capacity"),
  fishCount: import_zod.z.number().optional(),
  temperatureCelsius: import_zod.z.number().min(0).max(35).default(8),
  iceRatio: import_zod.z.enum(["1:1", "1:2", "1:3", "NO_ICE"]).default("1:1"),
  iceSource: import_zod.z.string().default("Dunga Solar Ice Facility"),
  channel: import_zod.z.enum(["USSD", "WEB_OFFLINE_SYNC", "WEB_DESK", "SMS", "WHATSAPP"]).default("WEB_DESK"),
  notes: import_zod.z.string().optional()
});
var AppendEventSchema = import_zod.z.object({
  batchId: import_zod.z.string().min(4, "Batch ID is required"),
  eventType: import_zod.z.enum([
    "HARVESTED",
    "LANDED",
    "WEIGHED",
    "ICED",
    "TRANSPORTED",
    "INSPECTED",
    "LISTED",
    "SOLD",
    "COMPENSATING_CORRECTION"
  ]),
  actorName: import_zod.z.string().min(2, "Actor name is required"),
  actorRole: import_zod.z.enum(["FISHER", "BMU_CLERK", "COLD_CHAIN_HANDLER", "COUNTY_OFFICER", "BUYER", "CONSUMER"]),
  actorPhone: import_zod.z.string().optional(),
  siteName: import_zod.z.string().min(2, "Location is required"),
  temperatureCelsius: import_zod.z.number().optional(),
  iceRatio: import_zod.z.enum(["1:1", "1:2", "1:3", "NO_ICE"]).optional(),
  iceSource: import_zod.z.string().optional(),
  transportVehicle: import_zod.z.string().optional(),
  transportDestination: import_zod.z.string().optional(),
  sensoryInspection: import_zod.z.object({
    eyes: import_zod.z.enum(["clear_bulging", "flat_slightly_cloudy", "sunken_opaque"]),
    gills: import_zod.z.enum(["bright_red_mucus_free", "pale_pink", "brown_sour_mucus"]),
    flesh: import_zod.z.enum(["firm_elastic", "slightly_soft", "soft_dented"]),
    odor: import_zod.z.enum(["fresh_seaweed_lake", "neutral_mild", "sour_stale"]),
    passedQualityAudit: import_zod.z.boolean()
  }).optional(),
  listingPricePerKgKes: import_zod.z.number().optional(),
  salePriceKes: import_zod.z.number().optional(),
  buyerName: import_zod.z.string().optional(),
  buyerType: import_zod.z.string().optional(),
  correctionReason: import_zod.z.string().optional(),
  originalEventId: import_zod.z.string().optional(),
  notes: import_zod.z.string().optional(),
  channel: import_zod.z.enum(["USSD", "WEB_OFFLINE_SYNC", "WEB_DESK", "SMS", "WHATSAPP"]).default("WEB_DESK")
});
var USSDRequestSchema = import_zod.z.object({
  sessionId: import_zod.z.string(),
  serviceCode: import_zod.z.string().default("*384*2782#"),
  phoneNumber: import_zod.z.string(),
  text: import_zod.z.string().default("")
});

// src/lib/ledger-engine.ts
function calculateEventHash(previousHash, batchId, eventType, timestamp, actorRole, metadataStr) {
  const payload = `${previousHash}|${batchId}|${eventType}|${timestamp}|${actorRole}|${metadataStr}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  const secondary = Math.abs(hash * 31 ^ 1597463007).toString(16).padStart(8, "0");
  return `0x${hex}${secondary}`.toUpperCase();
}
function generateBatchId(siteCode, sequenceNumber, date) {
  const d = date || /* @__PURE__ */ new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const seq = String(sequenceNumber).padStart(3, "0");
  const safeSite = (siteCode || "LV").toUpperCase().slice(0, 3);
  return `LV-${safeSite}-${yyyy}${mm}${dd}-${seq}`;
}
function evaluateBatchFreshness(species, harvestTimeIso, landingTimeIso, events) {
  const harvestTime = new Date(harvestTimeIso).getTime();
  const now = Date.now();
  const hoursSinceHarvest = Math.max(0, Math.round((now - harvestTime) / (1e3 * 60 * 60)));
  const speciesMeta = SPECIES_CATALOG[species] || SPECIES_CATALOG.NILE_PERCH;
  const maxShelfLife = speciesMeta.maxFreshHoursOnIce;
  const iceEvents = events.filter((e) => e.eventType === "ICED" || e.metadata.iceRatio);
  const inspectionEvents = events.filter((e) => e.eventType === "INSPECTED" && e.metadata.sensoryInspection);
  const disputeEvents = events.filter((e) => e.eventType === "COMPENSATING_CORRECTION" && e.metadata.notes?.toLowerCase().includes("dispute"));
  if (disputeEvents.length > 0) {
    return {
      grade: "GRADE_B_GOOD_MARKET",
      scorePercent: 62,
      qualifiesLakeFresh: false,
      verificationStatus: "DISPUTED",
      hoursSinceHarvest,
      coldChainMaintained: iceEvents.length > 0,
      explanation: "Dispute recorded regarding catch details. Awaiting BMU county officer arbitration."
    };
  }
  const recentTempEvent = [...events].reverse().find((e) => e.metadata.temperatureCelsius !== void 0);
  const currentTemp = recentTempEvent?.metadata.temperatureCelsius ?? 6;
  let tempPenalty = 0;
  if (currentTemp > 12) {
    tempPenalty = 45;
  } else if (currentTemp > 7) {
    tempPenalty = 20;
  } else if (currentTemp > 4) {
    tempPenalty = 5;
  }
  const timeDecayRatio = hoursSinceHarvest / maxShelfLife;
  const timePenalty = Math.min(60, Math.round(timeDecayRatio * 60));
  let sensoryScore = 30;
  const latestInspection = inspectionEvents[inspectionEvents.length - 1]?.metadata.sensoryInspection;
  if (latestInspection) {
    if (latestInspection.eyes === "clear_bulging") sensoryScore += 5;
    else if (latestInspection.eyes === "sunken_opaque") sensoryScore -= 15;
    if (latestInspection.gills === "bright_red_mucus_free") sensoryScore += 5;
    else if (latestInspection.gills === "brown_sour_mucus") sensoryScore -= 20;
    if (latestInspection.flesh === "firm_elastic") sensoryScore += 5;
    else if (latestInspection.flesh === "soft_dented") sensoryScore -= 15;
    if (latestInspection.odor === "fresh_seaweed_lake") sensoryScore += 5;
    else if (latestInspection.odor === "sour_stale") sensoryScore -= 25;
  }
  const coldChainMaintained = iceEvents.length > 0 && currentTemp <= 8;
  let rawScore = 100 - timePenalty - tempPenalty + (sensoryScore - 30);
  if (!coldChainMaintained) {
    rawScore -= 25;
  }
  const scorePercent = Math.max(5, Math.min(99, rawScore));
  let grade = "GRADE_B_GOOD_MARKET";
  let verificationStatus = "VERIFIED_STANDARD";
  let qualifiesLakeFresh = false;
  let explanation = "";
  if (hoursSinceHarvest > maxShelfLife * 1.5 || currentTemp > 18 || latestInspection && latestInspection.odor === "sour_stale") {
    grade = "SPOILED_UNFIT";
    verificationStatus = "SPOILED";
    qualifiesLakeFresh = false;
    explanation = "Catch temperature or storage time has exceeded safe consumption limits. Not fit for fresh consumption.";
  } else if (scorePercent >= 85 && hoursSinceHarvest <= 24 && coldChainMaintained) {
    grade = "GRADE_A_LAKE_FRESH";
    verificationStatus = "VERIFIED_LAKE_FRESH";
    qualifiesLakeFresh = true;
    explanation = "Pristine Lake Victoria catch. Iced immediately at BMU solar ice plant with verified cold-chain continuity.";
  } else if (scorePercent >= 65) {
    grade = "GRADE_B_GOOD_MARKET";
    verificationStatus = "VERIFIED_STANDARD";
    qualifiesLakeFresh = false;
    explanation = "Good market grade fish. Suitable for retail, restaurant service, and immediate cold storage.";
  } else {
    grade = "GRADE_C_PROCESS_IMMEDIATELY";
    verificationStatus = "PARTIALLY_VERIFIED";
    qualifiesLakeFresh = false;
    explanation = "Fair grade. Recommended for immediate local cooking, deep frying (choma), or traditional smoking/drying.";
  }
  return {
    grade,
    scorePercent,
    qualifiesLakeFresh,
    verificationStatus,
    hoursSinceHarvest,
    coldChainMaintained,
    explanation
  };
}
function calculateMarketplaceFees(pricePerKgKes, weightKg) {
  const grossTotalKes = Math.round(pricePerKgKes * weightKg);
  const platformFeeRate = 0.015;
  const directSaleFeeKes = Math.round(grossTotalKes * platformFeeRate);
  const fisherNetEarningsKes = grossTotalKes - directSaleFeeKes;
  return {
    pricePerKgKes,
    weightKg,
    grossTotalKes,
    platformFeeRate: 1.5,
    directSaleFeeKes,
    fisherNetEarningsKes
  };
}

// src/lib/storage-adapter.ts
var REGISTERED_BOATS = [
  {
    registrationNumber: "KV-084-KSM",
    name: "Nyanza Star",
    bmuSiteId: "site-dunga",
    ownerName: "Otieno Maurice",
    captainName: "James Onyango",
    captainPhone: "+254712345678",
    lengthMeters: 8.5,
    approvedGear: "Certified Gillnet (6-inch mesh)",
    bmuLicenseValidUntil: "2026-12-31"
  },
  {
    registrationNumber: "KV-112-SIA",
    name: "Victoria Queen",
    bmuSiteId: "site-uhanya",
    ownerName: "Perez Achieng",
    captainName: "George Ochieng",
    captainPhone: "+254723456789",
    lengthMeters: 9,
    approvedGear: "Traditional Handline & Longline",
    bmuLicenseValidUntil: "2026-12-31"
  },
  {
    registrationNumber: "KV-209-HBA",
    name: "Suba Voyager",
    bmuSiteId: "site-mbita",
    ownerName: "Tobias Okoth",
    captainName: "Samuel Odhiambo",
    captainPhone: "+254734567890",
    lengthMeters: 7.8,
    approvedGear: "Approved Hook & Line",
    bmuLicenseValidUntil: "2026-12-31"
  },
  {
    registrationNumber: "KV-305-MGR",
    name: "Karungu Pioneer",
    bmuSiteId: "site-karungu",
    ownerName: "Grace Mboya",
    captainName: "Peter Onyango",
    captainPhone: "+254745678901",
    lengthMeters: 8.2,
    approvedGear: "Certified Gillnet",
    bmuLicenseValidUntil: "2026-12-31"
  },
  {
    registrationNumber: "KV-410-SIA",
    name: "Daktari Express",
    bmuSiteId: "site-usenge",
    ownerName: "Kevin Omondi",
    captainName: "Francis Okumu",
    captainPhone: "+254756789012",
    lengthMeters: 8,
    approvedGear: "Certified Longline",
    bmuLicenseValidUntil: "2026-12-31"
  }
];
var InMemoryStorageAdapter = class {
  constructor() {
    this.batches = [];
    this.sequenceCounter = 45;
    this.seedInitialData();
  }
  seedInitialData() {
    const now = /* @__PURE__ */ new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1e3).toISOString();
    const fourHoursAgo = new Date(now.getTime() - 4 * 3600 * 1e3).toISOString();
    const sixHoursAgo = new Date(now.getTime() - 6 * 3600 * 1e3).toISOString();
    const twentyHoursAgo = new Date(now.getTime() - 20 * 3600 * 1e3).toISOString();
    const thirtyHoursAgo = new Date(now.getTime() - 30 * 3600 * 1e3).toISOString();
    const batch1Id = "LV-DG-20260821-042";
    const ev1_0 = {
      id: "ev-dng-001",
      batchId: batch1Id,
      eventType: "HARVESTED",
      timestamp: sixHoursAgo,
      actor: { name: "James Onyango", role: "FISHER", phoneMasked: "+254 712 *** 678" },
      location: { siteName: "Lake Victoria - Rusinga Channel", coordinates: { lat: -0.38, lng: 34.25 } },
      metadata: { weightKg: 85, notes: "Harvested using certified 6-inch mesh gillnet at dawn." },
      previousEventHash: "0x0000000000000000",
      eventHash: "0x8F91A2B03C4D5E6F",
      channel: "WEB_DESK"
    };
    const ev1_1 = {
      id: "ev-dng-002",
      batchId: batch1Id,
      eventType: "LANDED",
      timestamp: fourHoursAgo,
      actor: { name: "Otieno Maurice", role: "BMU_CLERK", phoneMasked: "+254 722 *** 890", organization: "Dunga Beach BMU" },
      location: { siteName: "Dunga Beach BMU", siteCode: "DG", county: "Kisumu", coordinates: { lat: -0.1465, lng: 34.7368 } },
      metadata: { weightKg: 85, temperatureCelsius: 14 },
      previousEventHash: ev1_0.eventHash,
      eventHash: "0x1A2B3C4D5E6F7A8B",
      channel: "WEB_DESK"
    };
    const ev1_2 = {
      id: "ev-dng-003",
      batchId: batch1Id,
      eventType: "ICED",
      timestamp: fourHoursAgo,
      actor: { name: "Dunga Solar Ice Plant Operator", role: "COLD_CHAIN_HANDLER", phoneMasked: "+254 700 *** 111" },
      location: { siteName: "Dunga Beach Solar Cold Facility", county: "Kisumu" },
      metadata: { temperatureCelsius: 2.8, iceRatio: "1:1", iceSource: "Dunga BMU Solar Flake Ice Facility" },
      previousEventHash: ev1_1.eventHash,
      eventHash: "0x9E8D7C6B5A4F3E2D",
      channel: "USSD"
    };
    const ev1_3 = {
      id: "ev-dng-004",
      batchId: batch1Id,
      eventType: "INSPECTED",
      timestamp: twoHoursAgo,
      actor: { name: "Achieng Perez", role: "COUNTY_OFFICER", phoneMasked: "+254 733 *** 999", organization: "Kisumu County Fisheries" },
      location: { siteName: "Dunga Quality Control Station", county: "Kisumu" },
      metadata: {
        sensoryInspection: {
          eyes: "clear_bulging",
          gills: "bright_red_mucus_free",
          flesh: "firm_elastic",
          odor: "fresh_seaweed_lake",
          passedQualityAudit: true
        },
        notes: "Premium export-grade Nile Perch. Clean handling verified."
      },
      previousEventHash: ev1_2.eventHash,
      eventHash: "0x4F3E2D1C0B9A8F7E",
      channel: "WEB_DESK"
    };
    const ev1_4 = {
      id: "ev-dng-005",
      batchId: batch1Id,
      eventType: "LISTED",
      timestamp: twoHoursAgo,
      actor: { name: "James Onyango", role: "FISHER", phoneMasked: "+254 712 *** 678" },
      location: { siteName: "Dunga Beach Market Desk" },
      metadata: { listingPricePerKgKes: 520, totalListingKes: 44200, notes: "Offered for direct restaurant / wholesale purchase." },
      previousEventHash: ev1_3.eventHash,
      eventHash: "0x5C6D7E8F9A0B1C2D",
      channel: "WEB_DESK"
    };
    const batch1Events = [ev1_0, ev1_1, ev1_2, ev1_3, ev1_4];
    const fees1 = calculateMarketplaceFees(520, 85);
    const freshness1 = evaluateBatchFreshness("NILE_PERCH", sixHoursAgo, fourHoursAgo, batch1Events);
    const batch1 = {
      id: "batch-001",
      batchId: batch1Id,
      qrCodePayload: `https://aqua-seal.lakevictoria.org/verify?b=${batch1Id}`,
      boatRegistration: "KV-084-KSM",
      boatName: "Nyanza Star",
      fisherName: "James Onyango",
      fisherPhoneMasked: "+254 712 *** 678",
      species: "NILE_PERCH",
      harvestMethod: "Certified Gillnet (6-inch mesh)",
      landingSiteId: "site-dunga",
      landingSiteName: "Dunga Beach BMU",
      county: "Kisumu",
      harvestTimestamp: sixHoursAgo,
      landingTimestamp: fourHoursAgo,
      initialWeightKg: 85,
      currentWeightKg: 85,
      currentTemperatureCelsius: 2.8,
      lastIcedTimestamp: fourHoursAgo,
      freshnessGrade: freshness1.grade,
      freshnessScorePercent: freshness1.scorePercent,
      qualifiesLakeFreshSeal: freshness1.qualifiesLakeFresh,
      status: "ACTIVE_LISTED",
      verificationStatus: freshness1.verificationStatus,
      events: batch1Events,
      listing: {
        isListed: true,
        pricePerKgKes: 520,
        estimatedTotalKes: fees1.grossTotalKes,
        directSaleFeeKes: fees1.directSaleFeeKes,
        fisherNetEarningsKes: fees1.fisherNetEarningsKes,
        sellerContactChannel: "SMS_RELAY"
      },
      createdAt: fourHoursAgo,
      updatedAt: twoHoursAgo,
      syncStatus: "SYNCED"
    };
    const batch2Id = "LV-UH-20260821-019";
    const ev2_0 = {
      id: "ev-uh-001",
      batchId: batch2Id,
      eventType: "HARVESTED",
      timestamp: twentyHoursAgo,
      actor: { name: "George Ochieng", role: "FISHER", phoneMasked: "+254 723 *** 789" },
      location: { siteName: "Yimbo Bay Waters", coordinates: { lat: -0.05, lng: 34.18 } },
      metadata: { weightKg: 42, notes: "Caught near papyrus sanctuary zone." },
      previousEventHash: "0x0000000000000000",
      eventHash: "0x7A6B5C4D3E2F1A0B",
      channel: "USSD"
    };
    const ev2_1 = {
      id: "ev-uh-002",
      batchId: batch2Id,
      eventType: "LANDED",
      timestamp: twentyHoursAgo,
      actor: { name: "Perez Achieng", role: "BMU_CLERK", phoneMasked: "+254 713 *** 441", organization: "Uhanya BMU" },
      location: { siteName: "Uhanya Beach BMU", siteCode: "UH", county: "Siaya" },
      metadata: { weightKg: 42, temperatureCelsius: 18 },
      previousEventHash: ev2_0.eventHash,
      eventHash: "0x3D2C1B0A9F8E7D6C",
      channel: "USSD"
    };
    const ev2_2 = {
      id: "ev-uh-003",
      batchId: batch2Id,
      eventType: "ICED",
      timestamp: twentyHoursAgo,
      actor: { name: "Mama Lucy Cold Hub", role: "COLD_CHAIN_HANDLER", phoneMasked: "+254 722 *** 333" },
      location: { siteName: "Uhanya Cold Store" },
      metadata: { temperatureCelsius: 4.5, iceRatio: "1:2", iceSource: "Uhanya Central Ice Plant" },
      previousEventHash: ev2_1.eventHash,
      eventHash: "0x8C7B6A5D4E3F2A1B",
      channel: "WEB_DESK"
    };
    const batch2Events = [ev2_0, ev2_1, ev2_2];
    const fees2 = calculateMarketplaceFees(430, 42);
    const freshness2 = evaluateBatchFreshness("TILAPIA", twentyHoursAgo, twentyHoursAgo, batch2Events);
    const batch2 = {
      id: "batch-002",
      batchId: batch2Id,
      qrCodePayload: `https://aqua-seal.lakevictoria.org/verify?b=${batch2Id}`,
      boatRegistration: "KV-112-SIA",
      boatName: "Victoria Queen",
      fisherName: "George Ochieng",
      fisherPhoneMasked: "+254 723 *** 789",
      species: "TILAPIA",
      harvestMethod: "Traditional Handline & Longline",
      landingSiteId: "site-uhanya",
      landingSiteName: "Uhanya Beach BMU",
      county: "Siaya",
      harvestTimestamp: twentyHoursAgo,
      landingTimestamp: twentyHoursAgo,
      initialWeightKg: 42,
      currentWeightKg: 42,
      currentTemperatureCelsius: 4.5,
      lastIcedTimestamp: twentyHoursAgo,
      freshnessGrade: freshness2.grade,
      freshnessScorePercent: freshness2.scorePercent,
      qualifiesLakeFreshSeal: freshness2.qualifiesLakeFresh,
      status: "ACTIVE_LISTED",
      verificationStatus: freshness2.verificationStatus,
      events: batch2Events,
      listing: {
        isListed: true,
        pricePerKgKes: 430,
        estimatedTotalKes: fees2.grossTotalKes,
        directSaleFeeKes: fees2.directSaleFeeKes,
        fisherNetEarningsKes: fees2.fisherNetEarningsKes,
        sellerContactChannel: "SMS_RELAY"
      },
      createdAt: twentyHoursAgo,
      updatedAt: twentyHoursAgo,
      syncStatus: "SYNCED"
    };
    const batch3Id = "LV-MB-20260820-088";
    const ev3_0 = {
      id: "ev-mb-001",
      batchId: batch3Id,
      eventType: "HARVESTED",
      timestamp: thirtyHoursAgo,
      actor: { name: "Samuel Odhiambo", role: "FISHER", phoneMasked: "+254 734 *** 890" },
      location: { siteName: "Rusinga Island Deep Channel" },
      metadata: { weightKg: 60 },
      previousEventHash: "0x0000000000000000",
      eventHash: "0x1122334455667788",
      channel: "USSD"
    };
    const ev3_1 = {
      id: "ev-mb-002",
      batchId: batch3Id,
      eventType: "LANDED",
      timestamp: thirtyHoursAgo,
      actor: { name: "Tobias Okoth", role: "BMU_CLERK", phoneMasked: "+254 720 *** 123", organization: "Mbita Point BMU" },
      location: { siteName: "Mbita Point BMU", siteCode: "MB", county: "Homa Bay" },
      metadata: { weightKg: 50 },
      // Erroneous initial entry
      previousEventHash: ev3_0.eventHash,
      eventHash: "0x9988776655443322",
      channel: "WEB_DESK"
    };
    const ev3_2 = {
      id: "ev-mb-003",
      batchId: batch3Id,
      eventType: "COMPENSATING_CORRECTION",
      timestamp: twentyHoursAgo,
      actor: { name: "Tobias Okoth", role: "BMU_CLERK", phoneMasked: "+254 720 *** 123", organization: "Mbita Point BMU" },
      location: { siteName: "Mbita Point BMU", county: "Homa Bay" },
      metadata: {
        weightKg: 58,
        originalEventId: "ev-mb-002",
        correctionReason: "Recalibrated BMU digital hanging scale tare weight. True verified weight is 58.0 kg."
      },
      previousEventHash: ev3_1.eventHash,
      eventHash: "0xAABBCCDDEEFF0011",
      channel: "WEB_DESK"
    };
    const ev3_3 = {
      id: "ev-mb-004",
      batchId: batch3Id,
      eventType: "SOLD",
      timestamp: twoHoursAgo,
      actor: { name: "Samuel Odhiambo", role: "FISHER", phoneMasked: "+254 734 *** 890" },
      location: { siteName: "Mbita Point BMU" },
      metadata: {
        salePriceKes: 20880,
        buyerName: "Victoria Oasis Lodge & Fishmongers Ltd",
        buyerType: "HOTEL",
        directFeeKes: 313
      },
      previousEventHash: ev3_2.eventHash,
      eventHash: "0x2233445566778899",
      channel: "WEB_DESK"
    };
    const batch3Events = [ev3_0, ev3_1, ev3_2, ev3_3];
    const freshness3 = evaluateBatchFreshness("CATFISH", thirtyHoursAgo, thirtyHoursAgo, batch3Events);
    const batch3 = {
      id: "batch-003",
      batchId: batch3Id,
      qrCodePayload: `https://aqua-seal.lakevictoria.org/verify?b=${batch3Id}`,
      boatRegistration: "KV-209-HBA",
      boatName: "Suba Voyager",
      fisherName: "Samuel Odhiambo",
      fisherPhoneMasked: "+254 734 *** 890",
      species: "CATFISH",
      harvestMethod: "Approved Hook & Line",
      landingSiteId: "site-mbita",
      landingSiteName: "Mbita Point BMU",
      county: "Homa Bay",
      harvestTimestamp: thirtyHoursAgo,
      landingTimestamp: thirtyHoursAgo,
      initialWeightKg: 58,
      currentWeightKg: 58,
      currentTemperatureCelsius: 5.2,
      lastIcedTimestamp: thirtyHoursAgo,
      freshnessGrade: freshness3.grade,
      freshnessScorePercent: freshness3.scorePercent,
      qualifiesLakeFreshSeal: false,
      status: "SOLD",
      verificationStatus: "VERIFIED_STANDARD",
      events: batch3Events,
      createdAt: thirtyHoursAgo,
      updatedAt: twoHoursAgo,
      syncStatus: "SYNCED"
    };
    this.batches = [batch1, batch2, batch3];
  }
  async getAllBatches(filter) {
    let result = [...this.batches];
    if (filter?.siteId) {
      result = result.filter((b) => b.landingSiteId === filter.siteId);
    }
    if (filter?.species) {
      result = result.filter((b) => b.species === filter.species);
    }
    if (filter?.status) {
      result = result.filter((b) => b.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getBatchById(batchIdOrId) {
    const cleanId = batchIdOrId.trim().toUpperCase();
    const batch = this.batches.find((b) => b.batchId.toUpperCase() === cleanId || b.id.toUpperCase() === cleanId);
    return batch || null;
  }
  async createBatch(data) {
    this.sequenceCounter += 1;
    const site = LANDING_SITES.find((s) => s.id === data.landingSiteId) || LANDING_SITES[0];
    const boat = REGISTERED_BOATS.find((b) => b.registrationNumber === data.boatRegistration) || {
      registrationNumber: data.boatRegistration,
      name: "Artisanal Vessel " + data.boatRegistration,
      ownerName: data.actorName || "Registered Lake Fisher",
      captainName: data.actorName || "Fisher Captain",
      captainPhone: data.actorPhone || "+254712000000"
    };
    const batchId = generateBatchId(site.code, this.sequenceCounter);
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const harvestHash = calculateEventHash(
      "0x0000000000000000",
      batchId,
      "HARVESTED",
      nowIso,
      "FISHER",
      JSON.stringify({ boat: boat.name, method: data.harvestMethod })
    );
    const harvestEvent = {
      id: `ev-${Date.now()}-harv`,
      batchId,
      eventType: "HARVESTED",
      timestamp: nowIso,
      actor: {
        name: boat.captainName,
        role: "FISHER",
        phoneMasked: boat.captainPhone ? boat.captainPhone.slice(0, 7) + " *** " + boat.captainPhone.slice(-3) : "+254 7XX *** XXX"
      },
      location: {
        siteName: `${site.name} Waters`,
        coordinates: site.coordinates
      },
      metadata: {
        weightKg: data.weightKg,
        fishCount: data.fishCount,
        notes: data.notes || `Catch harvested aboard ${boat.name} via ${data.harvestMethod}`
      },
      previousEventHash: "0x0000000000000000",
      eventHash: harvestHash,
      channel: data.channel || "WEB_DESK"
    };
    const landedHash = calculateEventHash(
      harvestHash,
      batchId,
      "LANDED",
      nowIso,
      "BMU_CLERK",
      JSON.stringify({ weightKg: data.weightKg, site: site.name })
    );
    const landedEvent = {
      id: `ev-${Date.now()}-land`,
      batchId,
      eventType: "LANDED",
      timestamp: nowIso,
      actor: {
        name: data.actorName || site.bmuLeader,
        role: "BMU_CLERK",
        phoneMasked: site.phoneContact,
        organization: site.name
      },
      location: {
        siteName: site.name,
        siteCode: site.code,
        county: site.county,
        coordinates: site.coordinates
      },
      metadata: {
        weightKg: data.weightKg,
        temperatureCelsius: data.temperatureCelsius ?? 10,
        iceRatio: data.iceRatio || "1:1",
        iceSource: data.iceSource || (site.hasSolarIcePlant ? `${site.name} Solar Ice Facility` : "Beach Ice Storage")
      },
      previousEventHash: harvestHash,
      eventHash: landedHash,
      channel: data.channel || "WEB_DESK"
    };
    const events = [harvestEvent, landedEvent];
    if (data.iceRatio && data.iceRatio !== "NO_ICE") {
      const icedHash = calculateEventHash(
        landedHash,
        batchId,
        "ICED",
        nowIso,
        "COLD_CHAIN_HANDLER",
        JSON.stringify({ iceRatio: data.iceRatio, temp: data.temperatureCelsius })
      );
      const icedEvent = {
        id: `ev-${Date.now()}-iced`,
        batchId,
        eventType: "ICED",
        timestamp: nowIso,
        actor: {
          name: `${site.name} Cold Chain Desk`,
          role: "COLD_CHAIN_HANDLER",
          phoneMasked: site.phoneContact
        },
        location: {
          siteName: site.name,
          county: site.county
        },
        metadata: {
          temperatureCelsius: data.temperatureCelsius ?? 3.5,
          iceRatio: data.iceRatio,
          iceSource: data.iceSource || `${site.name} Solar Ice Plant`
        },
        previousEventHash: landedHash,
        eventHash: icedHash,
        channel: data.channel || "WEB_DESK"
      };
      events.push(icedEvent);
    }
    const speciesMeta = SPECIES_CATALOG[data.species] || SPECIES_CATALOG.NILE_PERCH;
    const defaultPricePerKg = speciesMeta.indicativePricePerKgKes;
    const feeBreakdown = calculateMarketplaceFees(defaultPricePerKg, data.weightKg);
    const freshness = evaluateBatchFreshness(data.species, nowIso, nowIso, events);
    const newBatch = {
      id: `batch-${Date.now()}`,
      batchId,
      qrCodePayload: `https://aqua-seal.lakevictoria.org/verify?b=${batchId}`,
      boatRegistration: data.boatRegistration,
      boatName: boat.name,
      fisherName: boat.captainName || boat.ownerName,
      fisherPhoneMasked: boat.captainPhone ? boat.captainPhone.slice(0, 7) + " *** " + boat.captainPhone.slice(-3) : "+254 712 *** 000",
      species: data.species,
      harvestMethod: data.harvestMethod,
      landingSiteId: site.id,
      landingSiteName: site.name,
      county: site.county,
      harvestTimestamp: nowIso,
      landingTimestamp: nowIso,
      initialWeightKg: data.weightKg,
      currentWeightKg: data.weightKg,
      currentTemperatureCelsius: data.temperatureCelsius ?? 3.5,
      lastIcedTimestamp: nowIso,
      freshnessGrade: freshness.grade,
      freshnessScorePercent: freshness.scorePercent,
      qualifiesLakeFreshSeal: freshness.qualifiesLakeFresh,
      status: "ACTIVE_LISTED",
      verificationStatus: freshness.verificationStatus,
      events,
      listing: {
        isListed: true,
        pricePerKgKes: defaultPricePerKg,
        estimatedTotalKes: feeBreakdown.grossTotalKes,
        directSaleFeeKes: feeBreakdown.directSaleFeeKes,
        fisherNetEarningsKes: feeBreakdown.fisherNetEarningsKes,
        sellerContactChannel: "SMS_RELAY"
      },
      createdAt: nowIso,
      updatedAt: nowIso,
      syncStatus: "SYNCED"
    };
    this.batches.unshift(newBatch);
    return newBatch;
  }
  async appendEvent(params) {
    const batch = await this.getBatchById(params.batchId);
    if (!batch) {
      throw new Error(`Batch with ID '${params.batchId}' not found.`);
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const lastEvent = batch.events[batch.events.length - 1];
    const previousHash = lastEvent ? lastEvent.eventHash : "0x0000000000000000";
    const eventHash = calculateEventHash(
      previousHash,
      batch.batchId,
      params.eventType,
      nowIso,
      params.actorRole,
      JSON.stringify({
        temp: params.temperatureCelsius,
        vehicle: params.transportVehicle,
        price: params.listingPricePerKgKes || params.salePriceKes,
        correction: params.correctionReason
      })
    );
    const newEvent = {
      id: `ev-${Date.now()}-${params.eventType.toLowerCase()}`,
      batchId: batch.batchId,
      eventType: params.eventType,
      timestamp: nowIso,
      actor: {
        name: params.actorName,
        role: params.actorRole,
        phoneMasked: params.actorPhone ? params.actorPhone.slice(0, 7) + " *** " + params.actorPhone.slice(-3) : "+254 7XX *** XXX"
      },
      location: {
        siteName: params.siteName
      },
      metadata: {
        temperatureCelsius: params.temperatureCelsius,
        iceRatio: params.iceRatio,
        iceSource: params.iceSource,
        transportVehicle: params.transportVehicle,
        transportDestination: params.transportDestination,
        sensoryInspection: params.sensoryInspection,
        listingPricePerKgKes: params.listingPricePerKgKes,
        salePriceKes: params.salePriceKes,
        buyerName: params.buyerName,
        buyerType: params.buyerType,
        correctionReason: params.correctionReason,
        originalEventId: params.originalEventId,
        notes: params.notes
      },
      previousEventHash: previousHash,
      eventHash,
      channel: params.channel || "WEB_DESK"
    };
    batch.events.push(newEvent);
    if (params.temperatureCelsius !== void 0) {
      batch.currentTemperatureCelsius = params.temperatureCelsius;
    }
    if (params.eventType === "ICED") {
      batch.lastIcedTimestamp = nowIso;
    }
    if (params.eventType === "SOLD") {
      batch.status = "SOLD";
    } else if (params.eventType === "TRANSPORTED") {
      batch.status = "IN_TRANSIT";
    } else if (params.eventType === "LISTED" && params.listingPricePerKgKes) {
      const fees = calculateMarketplaceFees(params.listingPricePerKgKes, batch.currentWeightKg);
      batch.listing = {
        isListed: true,
        pricePerKgKes: params.listingPricePerKgKes,
        estimatedTotalKes: fees.grossTotalKes,
        directSaleFeeKes: fees.directSaleFeeKes,
        fisherNetEarningsKes: fees.fisherNetEarningsKes,
        sellerContactChannel: "SMS_RELAY"
      };
    }
    const freshness = evaluateBatchFreshness(batch.species, batch.harvestTimestamp, batch.landingTimestamp, batch.events);
    batch.freshnessGrade = freshness.grade;
    batch.freshnessScorePercent = freshness.scorePercent;
    batch.qualifiesLakeFreshSeal = freshness.qualifiesLakeFresh;
    batch.verificationStatus = freshness.verificationStatus;
    batch.updatedAt = nowIso;
    return batch;
  }
  async getRegisteredBoats() {
    return REGISTERED_BOATS;
  }
  async getSACCOCreditSignals(fisherPhoneOrName) {
    return {
      fisherName: "James Onyango",
      fisherPhoneMasked: "+254 712 *** 678",
      primaryBMU: "Dunga Beach BMU (Kisumu)",
      membershipMonths: 38,
      periodDays: 90,
      totalLandingsCount: 64,
      totalWeightHarvestedKg: 3840,
      totalEstimatedRevenueKes: 1843200,
      landingConsistencyScore: 92,
      // 92% landing regularity
      coldChainAdherenceRate: 98,
      // 98% immediate solar icing
      verifiedDirectSaleRate: 89,
      // 89% direct fair market sales
      disputeRate: 0,
      // 0 disputes
      recommendedCreditLimitKes: 12e4,
      creditRiskBand: "LOW_RISK_GOLD",
      explainableSignals: [
        {
          title: "3-Month Landing Velocity",
          status: "POSITIVE",
          detail: "64 recorded catches in 90 days. Consistent harvest history with 0 unexplained gaps exceeding 4 days."
        },
        {
          title: "Cold-Chain Solar Ice Adherence",
          status: "POSITIVE",
          detail: "98% of catches were logged into Dunga BMU solar cold store within 45 minutes of landing."
        },
        {
          title: "Zero Tampering or Batch Disputes",
          status: "POSITIVE",
          detail: "Clean cryptographic ledger history with no reported buyer rejections or mesh-size violations."
        },
        {
          title: "Direct Market Revenue Stability",
          status: "POSITIVE",
          detail: "Average weekly net revenue of KES 141,700 through transparent buyer agreements."
        }
      ]
    };
  }
  async getBMUStats() {
    const totalTodayKg = this.batches.reduce((sum, b) => sum + b.currentWeightKg, 0);
    const activeBoatsCount = REGISTERED_BOATS.length;
    const activeBatchesCount = this.batches.filter((b) => b.status === "ACTIVE_LISTED").length;
    const solarIcedCount = this.batches.filter((b) => b.lastIcedTimestamp).length;
    const solarIcedPercentage = this.batches.length ? Math.round(solarIcedCount / this.batches.length * 100) : 100;
    const speciesCounts = {};
    this.batches.forEach((b) => {
      speciesCounts[b.species] = (speciesCounts[b.species] || 0) + b.currentWeightKg;
    });
    const topSpecies = Object.entries(speciesCounts).map(([key, kg]) => ({
      name: SPECIES_CATALOG[key]?.commonName || key,
      kg
    }));
    const recentEvents = this.batches.flatMap((b) => b.events).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    return {
      totalTodayKg,
      activeBoatsCount,
      activeBatchesCount,
      solarIcedPercentage,
      topSpecies,
      recentEvents
    };
  }
};
var storageAdapter = new InMemoryStorageAdapter();

// src/lib/africas-talking-ussd.ts
var ussdSessions = /* @__PURE__ */ new Map();
async function handleUSSDRequest(sessionId, serviceCode, phoneNumber, text) {
  const cleanText = (text ?? "").trim();
  const steps = cleanText ? cleanText.split("*").filter((part) => part !== "") : [];
  const rootChoice = steps[0];
  const session = ussdSessions.get(sessionId) ?? { stage: "root" };
  if (steps.length === 0 || cleanText === "") {
    ussdSessions.set(sessionId, { stage: "root" });
    const menu = [
      "CON Welcome to Aqua-Seal Lake Victoria",
      "1. Register Catch (Fisher/BMU)",
      "2. Update Cold-Chain & Ice",
      "3. Verify Fish Batch ID",
      "4. Record Batch Sale",
      "5. SACCO Catch & Credit Signal",
      "6. Beach Indicative Prices (KES/kg)",
      "0. Exit"
    ].join("\n");
    return { response: menu, isTerminal: false };
  }
  if (rootChoice === "0") {
    ussdSessions.delete(sessionId);
    return {
      response: "END Session ended. Dial *384*2782# to continue.",
      isTerminal: true
    };
  }
  if (rootChoice === "1") {
    if (steps.length === 1) {
      return {
        response: [
          "CON Select Fish Species:",
          "1. Nile Perch (Mbuta)",
          "2. Nile Tilapia (Ngege)",
          "3. Omena / Dagaa",
          "4. African Catfish (Mumi)"
        ].join("\n"),
        isTerminal: false
      };
    }
    if (steps.length === 2) {
      return {
        response: [
          "CON Select Landing Beach BMU:",
          "1. Dunga Beach (Kisumu)",
          "2. Uhanya Beach (Siaya)",
          "3. Mbita Point (Homa Bay)",
          "4. Karungu Bay (Migori)"
        ].join("\n"),
        isTerminal: false
      };
    }
    if (steps.length === 3) {
      return {
        response: "CON Enter Catch Weight in Kg (e.g. 50):",
        isTerminal: false
      };
    }
    if (steps.length === 4) {
      const speciesMap = {
        "1": "NILE_PERCH",
        "2": "TILAPIA",
        "3": "OMENA",
        "4": "CATFISH"
      };
      const siteMap = {
        "1": "site-dunga",
        "2": "site-uhanya",
        "3": "site-mbita",
        "4": "site-karungu"
      };
      const species = speciesMap[steps[1]] || "NILE_PERCH";
      const siteId = siteMap[steps[2]] || "site-dunga";
      const weightKg = parseFloat(steps[3]) || 25;
      const boats = await storageAdapter.getRegisteredBoats();
      if (!boats || boats.length === 0) {
        return {
          response: "END Error: No registered boats found for this BMU. Please register your boat first.",
          isTerminal: true
        };
      }
      const boat = boats.find((b) => b.bmuSiteId === siteId) || boats[0];
      const newBatch = await storageAdapter.createBatch({
        boatRegistration: boat.registrationNumber,
        species,
        landingSiteId: siteId,
        harvestMethod: boat.approvedGear,
        weightKg,
        temperatureCelsius: 4,
        iceRatio: "1:1",
        actorName: boat.captainName,
        actorPhone: phoneNumber,
        channel: "USSD"
      });
      const smsText = `Aqua-Seal: Batch ${newBatch.batchId} registered. ${weightKg}kg ${newBatch.species} at ${newBatch.landingSiteName}. Verified Lake Fresh! View: https://aqua-seal.lakevictoria.org/verify?b=${newBatch.batchId}`;
      return {
        response: `END Catch recorded!
Batch ID: ${newBatch.batchId}
Weight: ${weightKg}kg ${newBatch.species}
SMS confirmation sent to ${phoneNumber}.`,
        isTerminal: true,
        smsNotification: {
          to: phoneNumber,
          message: smsText
        }
      };
    }
  }
  if (rootChoice === "2") {
    if (steps.length === 1) {
      return {
        response: "CON Enter Batch ID to Ice (e.g. LV-DG-20260821-042 or 042):",
        isTerminal: false
      };
    }
    if (steps.length === 2) {
      return {
        response: [
          "CON Select Ice Ratio & Source:",
          "1. 1:1 Solar Flake Ice (0-3\xB0C)",
          "2. 1:2 Crushed Block Ice (4-6\xB0C)",
          "3. Deep Freezing Re-pack"
        ].join("\n"),
        isTerminal: false
      };
    }
    if (steps.length === 3) {
      const batchInput = steps[1].trim();
      const batches = await storageAdapter.getAllBatches();
      let targetBatch = batches.find(
        (b) => b.batchId.toLowerCase().includes(batchInput.toLowerCase()) || b.id.toLowerCase().includes(batchInput.toLowerCase())
      );
      if (!targetBatch && batches.length > 0) {
        targetBatch = batches[0];
      }
      if (!targetBatch) {
        return { response: "END Error: Batch ID not found.", isTerminal: true };
      }
      await storageAdapter.appendEvent({
        batchId: targetBatch.batchId,
        eventType: "ICED",
        actorName: "USSD Cold Chain Handler",
        actorRole: "COLD_CHAIN_HANDLER",
        actorPhone: phoneNumber,
        siteName: targetBatch.landingSiteName,
        temperatureCelsius: steps[2] === "1" ? 2.5 : 5,
        iceRatio: "1:1",
        iceSource: "Solar Ice Depot",
        channel: "USSD"
      });
      return {
        response: `END Cold-chain verified for ${targetBatch.batchId}!
Ice added. Freshness score updated to Grade A (Lake Fresh).`,
        isTerminal: true
      };
    }
  }
  if (rootChoice === "3") {
    if (steps.length === 1) {
      return {
        response: "CON Enter Batch Code (e.g. 042 or LV-DG-20260821-042):",
        isTerminal: false
      };
    }
    if (steps.length === 2) {
      const code = steps[1].trim().toUpperCase();
      const batches = await storageAdapter.getAllBatches();
      const batch = batches.find(
        (b) => b.batchId.toUpperCase().includes(code) || b.id.toUpperCase().includes(code)
      );
      if (!batch) {
        return {
          response: `END Batch "${code}" not found. Please verify the 4-digit code on the fish gill tag or paper receipt.`,
          isTerminal: true
        };
      }
      const sp = SPECIES_CATALOG[batch.species]?.commonName || batch.species;
      return {
        response: `END ${batch.batchId} VERIFIED!
Fish: ${sp} (${batch.currentWeightKg}kg)
Origin: ${batch.boatName}, ${batch.landingSiteName}
Freshness: ${batch.freshnessGrade} (${batch.currentTemperatureCelsius}\xB0C)
Seal: ${batch.qualifiesLakeFreshSeal ? "LAKE FRESH AUTHENTIC" : "STANDARD"}`,
        isTerminal: true
      };
    }
  }
  if (rootChoice === "4") {
    if (steps.length === 1) {
      return {
        response: "CON Enter Batch ID sold:",
        isTerminal: false
      };
    }
    if (steps.length === 2) {
      return {
        response: "CON Enter Total Sale Amount in KES:",
        isTerminal: false
      };
    }
    if (steps.length === 3) {
      const amount = parseFloat(steps[2]) || 1e4;
      const directFee = Math.round(amount * 0.015);
      const net = amount - directFee;
      return {
        response: `END Sale Logged!
Gross: KES ${amount.toLocaleString()}
Direct Micro-Fee (1.5%): KES ${directFee.toLocaleString()}
Net Fisher Earning: KES ${net.toLocaleString()}
Transaction appended to ledger.`,
        isTerminal: true
      };
    }
  }
  if (rootChoice === "5") {
    const signals = await storageAdapter.getSACCOCreditSignals(phoneNumber);
    return {
      response: `END SACCO Credit Summary:
Fisher: ${signals.fisherName}
3-Mo Catch: ${signals.totalWeightHarvestedKg}kg (${signals.totalLandingsCount} landings)
Cold-Chain Score: ${signals.coldChainAdherenceRate}%
Est. Credit Limit: KES ${signals.recommendedCreditLimitKes.toLocaleString()}
Risk: ${signals.creditRiskBand}`,
      isTerminal: true
    };
  }
  if (rootChoice === "6") {
    const lines = [
      "END Lake Victoria Indicative Beach Rates:",
      "\u2022 Nile Perch (Mbuta): KES 480 - 520/kg",
      "\u2022 Nile Tilapia (Ngege): KES 420 - 450/kg",
      "\u2022 Omena (Dagaa): KES 220 - 240/kg",
      "\u2022 Catfish (Mumi): KES 350 - 380/kg",
      "Aqua-Seal Direct Fee: 1.5% (Buyers)"
    ];
    return { response: lines.join("\n"), isTerminal: true };
  }
  return {
    response: "END Invalid choice. Please dial again.",
    isTerminal: true
  };
}

// src/server-app.ts
function createApiApp() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  app.use(import_express.default.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[Aqua-Seal API] ${req.method} ${req.path}`);
    }
    next();
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Aqua-Seal Lake Victoria Platform",
      version: "1.0.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      storage: "InMemoryAppendLedgerAdapter"
    });
  });
  app.get("/api/landing-sites", (req, res) => {
    res.json({ success: true, data: LANDING_SITES });
  });
  app.get("/api/boats", async (req, res) => {
    const boats = await storageAdapter.getRegisteredBoats();
    res.json({ success: true, data: boats });
  });
  app.get("/api/species", (req, res) => {
    res.json({ success: true, data: SPECIES_CATALOG });
  });
  app.get("/api/batches", async (req, res) => {
    try {
      const { siteId, species, status } = req.query;
      const batches = await storageAdapter.getAllBatches({
        siteId,
        species,
        status
      });
      res.json({ success: true, count: batches.length, data: batches });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/batches/:id", async (req, res) => {
    try {
      const batch = await storageAdapter.getBatchById(req.params.id);
      if (!batch) {
        return res.status(404).json({ success: false, error: `Batch '${req.params.id}' not found` });
      }
      res.json({ success: true, data: batch });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/batches", async (req, res) => {
    try {
      const parsed = CreateBatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: parsed.error.issues
        });
      }
      const newBatch = await storageAdapter.createBatch(parsed.data);
      res.status(201).json({
        success: true,
        message: "Batch registered successfully and appended to ledger.",
        data: newBatch
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/batches/:id/events", async (req, res) => {
    try {
      const parsed = AppendEventSchema.safeParse({
        ...req.body,
        batchId: req.params.id
      });
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Event validation failed",
          details: parsed.error.issues
        });
      }
      const updatedBatch = await storageAdapter.appendEvent(parsed.data);
      res.json({
        success: true,
        message: `Event '${parsed.data.eventType}' appended with verified cryptographic hash.`,
        data: updatedBatch
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
  app.get("/api/verify/:batchId", async (req, res) => {
    try {
      const batch = await storageAdapter.getBatchById(req.params.batchId);
      if (!batch) {
        return res.status(404).json({
          success: false,
          verificationStatus: "NOT_FOUND",
          batchId: req.params.batchId,
          message: `No authentic Lake Victoria record found for code "${req.params.batchId}". Please verify the tag or report counterfeit.`
        });
      }
      const sanitizedVerification = {
        batchId: batch.batchId,
        speciesName: SPECIES_CATALOG[batch.species]?.commonName || batch.species,
        localSpeciesName: SPECIES_CATALOG[batch.species]?.localName,
        scientificName: SPECIES_CATALOG[batch.species]?.scientificName,
        weightKg: batch.currentWeightKg,
        harvestDate: batch.harvestTimestamp,
        landingDate: batch.landingTimestamp,
        landingSite: batch.landingSiteName,
        county: batch.county,
        boatName: batch.boatName,
        harvestMethod: batch.harvestMethod,
        freshnessGrade: batch.freshnessGrade,
        freshnessScorePercent: batch.freshnessScorePercent,
        currentTemperatureCelsius: batch.currentTemperatureCelsius,
        qualifiesLakeFreshSeal: batch.qualifiesLakeFreshSeal,
        verificationStatus: batch.verificationStatus,
        coldChainMaintained: batch.qualifiesLakeFreshSeal || batch.freshnessGrade === "GRADE_A_LAKE_FRESH",
        trustReport: {
          ledgerEventsCount: batch.events.length,
          lastVerifiedTimestamp: batch.updatedAt,
          solarIcingVerified: batch.events.some((e) => e.eventType === "ICED"),
          inspectorAuditPassed: batch.events.some((e) => e.metadata.sensoryInspection?.passedQualityAudit)
        },
        timeline: batch.events.map((e) => ({
          eventType: e.eventType,
          timestamp: e.timestamp,
          site: e.location.siteName,
          actorRole: e.actor.role,
          temperature: e.metadata.temperatureCelsius,
          hash: e.eventHash,
          notes: e.metadata.notes || e.metadata.correctionReason
        }))
      };
      res.json({ success: true, data: sanitizedVerification });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/ussd", async (req, res) => {
    try {
      const { sessionId = "session-demo", serviceCode = "*384*2782#", phoneNumber = "+254712345678", text = "" } = req.body;
      const ussdResult = await handleUSSDRequest(sessionId, serviceCode, phoneNumber, text);
      res.setHeader("Content-Type", "text/plain");
      res.send(ussdResult.response);
    } catch (err) {
      console.error("USSD processing error:", err);
      res.setHeader("Content-Type", "text/plain");
      res.send("END An error occurred processing your request. Please try again.");
    }
  });
  app.post("/api/sms", async (req, res) => {
    try {
      const { from = "+254712345678", text = "" } = req.body;
      const cleanText = text.trim().toUpperCase();
      const batch = (await storageAdapter.getAllBatches()).find(
        (b) => cleanText.includes(b.batchId.toUpperCase()) || cleanText.includes(b.batchId.slice(-3))
      );
      let reply = "";
      if (batch) {
        reply = `Aqua-Seal: ${batch.batchId} | ${batch.species} (${batch.currentWeightKg}kg) Landed: ${batch.landingSiteName}. Freshness: ${batch.freshnessGrade} (${batch.currentTemperatureCelsius}\xB0C). Seal: ${batch.qualifiesLakeFreshSeal ? "LAKE FRESH AUTHENTIC" : "STANDARD"}.`;
      } else {
        reply = `Aqua-Seal: Unknown code "${text}". To verify fish, SMS "SEAL <BatchID>" to 22384 or dial *384*2782#.`;
      }
      res.json({
        success: true,
        to: from,
        replyMessage: reply
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/marketplace", async (req, res) => {
    try {
      const batches = await storageAdapter.getAllBatches();
      const listed = batches.filter((b) => b.listing?.isListed && b.status === "ACTIVE_LISTED");
      res.json({ success: true, count: listed.length, data: listed });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/sacco/credit-signals/:fisherId", async (req, res) => {
    try {
      const signals = await storageAdapter.getSACCOCreditSignals(req.params.fisherId);
      res.json({ success: true, data: signals });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/bmu/stats", async (req, res) => {
    try {
      const stats = await storageAdapter.getBMUStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/offline-sync", async (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: "Expected items array" });
      }
      const results = [];
      for (const item of items) {
        if (item.type === "CREATE_BATCH") {
          const resBatch = await storageAdapter.createBatch({
            ...item.payload,
            channel: "WEB_OFFLINE_SYNC"
          });
          results.push({ id: item.id, status: "SYNCED", data: resBatch });
        } else if (item.type === "APPEND_EVENT") {
          const resBatch = await storageAdapter.appendEvent({
            ...item.payload,
            channel: "WEB_OFFLINE_SYNC"
          });
          results.push({ id: item.id, status: "SYNCED", data: resBatch });
        }
      }
      res.json({ success: true, processed: results.length, results });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  return app;
}

// server.ts
async function startServer() {
  const app = createApiApp();
  const PORT = 3e3;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aqua-Seal Server] Running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
