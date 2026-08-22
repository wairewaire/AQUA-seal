import express, { Request, Response } from "express";
import path from "node:path";
import { LANDING_SITES, SPECIES_CATALOG } from "./src/types/aqua-seal";
import { storageAdapter } from "./src/lib/storage-adapter";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request Logging
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[Aqua-Seal API] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "Aqua-Seal Lake Victoria Platform",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      storage: "InMemoryAppendLedgerAdapter",
    });
  });

  // Get Landing Sites
  app.get("/api/landing-sites", (req: Request, res: Response) => {
    res.json({ success: true, data: LANDING_SITES });
  });

  // Get Registered Boats
  app.get("/api/boats", async (req: Request, res: Response) => {
    const boats = await storageAdapter.getRegisteredBoats();
    res.json({ success: true, data: boats });
  });

  // Get Species Catalog
  app.get("/api/species", (req: Request, res: Response) => {
    res.json({ success: true, data: SPECIES_CATALOG });
  });

  // Get Batches (with filters)
  app.get("/api/batches", async (req: Request, res: Response) => {
    try {
      const { siteId, species, status } = req.query;
      const batches = await storageAdapter.getAllBatches({
        siteId: siteId as string | undefined,
        species: species as any | undefined,
        status: status as string | undefined,
      });
      res.json({ success: true, count: batches.length, data: batches });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Single Batch
  app.get("/api/batches/:id", async (req: Request, res: Response) => {
    try {
      const batch = await storageAdapter.getBatchById(req.params.id);
      if (!batch) {
        return res
          .status(404)
          .json({
            success: false,
            error: `Batch '${req.params.id}' not found`,
          });
      }
      res.json({ success: true, data: batch });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create Batch (Validated with Zod)
  app.post("/api/batches", async (req: Request, res: Response) => {
    try {
      const parsed = CreateBatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: parsed.error.issues,
        });
      }

      const newBatch = await storageAdapter.createBatch(parsed.data);
      res.status(201).json({
        success: true,
        message: "Batch registered successfully and appended to ledger.",
        data: newBatch,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Append Event to Batch Ledger (Immutable event log)
  app.post("/api/batches/:id/events", async (req: Request, res: Response) => {
    try {
      const parsed = AppendEventSchema.safeParse({
        ...req.body,
        batchId: req.params.id,
      });
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Event validation failed",
          details: parsed.error.issues,
        });
      }

      const updatedBatch = await storageAdapter.appendEvent(parsed.data);
      res.json({
        success: true,
        message: `Event '${parsed.data.eventType}' appended with verified cryptographic hash.`,
        data: updatedBatch,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Public Consumer & QR Verification Endpoint (Privacy-safe)
  app.get("/api/verify/:batchId", async (req: Request, res: Response) => {
    try {
      const batch = await storageAdapter.getBatchById(req.params.batchId);
      if (!batch) {
        return res.status(404).json({
          success: false,
          verificationStatus: "NOT_FOUND",
          batchId: req.params.batchId,
          message: `No authentic Lake Victoria record found for code "${req.params.batchId}". Please verify the tag or report counterfeit.`,
        });
      }

      // Format privacy-sanitized payload for public consumer inspection
      const sanitizedVerification = {
        batchId: batch.batchId,
        speciesName:
          SPECIES_CATALOG[batch.species]?.commonName || batch.species,
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
        coldChainMaintained:
          batch.qualifiesLakeFreshSeal ||
          batch.freshnessGrade === "GRADE_A_LAKE_FRESH",
        trustReport: {
          ledgerEventsCount: batch.events.length,
          lastVerifiedTimestamp: batch.updatedAt,
          solarIcingVerified: batch.events.some((e) => e.eventType === "ICED"),
          inspectorAuditPassed: batch.events.some(
            (e) => e.metadata.sensoryInspection?.passedQualityAudit,
          ),
        },
        timeline: batch.events.map((e) => ({
          eventType: e.eventType,
          timestamp: e.timestamp,
          site: e.location.siteName,
          actorRole: e.actor.role,
          temperature: e.metadata.temperatureCelsius,
          hash: e.eventHash,
          notes: e.metadata.notes || e.metadata.correctionReason,
        })),
      };

      res.json({ success: true, data: sanitizedVerification });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Africa's Talking USSD Webhook Handler
  app.post("/api/ussd", async (req: Request, res: Response) => {
    try {
      const parsed = USSDRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.setHeader("Content-Type", "text/plain");
        return res
          .status(400)
          .send("END Invalid USSD request. Please try again.");
      }

      const { sessionId, serviceCode, phoneNumber, text } = parsed.data;
      const ussdResult = await handleUSSDRequest(
        sessionId,
        serviceCode,
        phoneNumber,
        text,
      );

      // Africa's Talking expects plain text response
      res.setHeader("Content-Type", "text/plain");
      res.send(ussdResult.response);
    } catch (err: any) {
      console.error("USSD processing error:", err);
      res.setHeader("Content-Type", "text/plain");
      res.send(
        "END An error occurred processing your request. Please try again.",
      );
    }
  });

  // SMS Verification & Relay Webhook
  app.post("/api/sms", async (req: Request, res: Response) => {
    try {
      const { from = "+254712345678", text = "" } = req.body;
      const cleanText = text.trim().toUpperCase();

      // If querying batch e.g. "SEAL 042" or "VERIFY LV-DG-20260821-042"
      const batch = (await storageAdapter.getAllBatches()).find(
        (b) =>
          cleanText.includes(b.batchId.toUpperCase()) ||
          cleanText.includes(b.batchId.slice(-3)),
      );

      let reply = "";
      if (batch) {
        reply = `Aqua-Seal: ${batch.batchId} | ${batch.species} (${batch.currentWeightKg}kg) Landed: ${batch.landingSiteName}. Freshness: ${batch.freshnessGrade} (${batch.currentTemperatureCelsius}°C). Seal: ${batch.qualifiesLakeFreshSeal ? "LAKE FRESH AUTHENTIC" : "STANDARD"}.`;
      } else {
        reply = `Aqua-Seal: Unknown code "${text}". To verify fish, SMS "SEAL <BatchID>" to 22384 or dial *384*2782#.`;
      }

      res.json({
        success: true,
        to: from,
        replyMessage: reply,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Marketplace Listings
  app.get("/api/marketplace", async (req: Request, res: Response) => {
    try {
      const batches = await storageAdapter.getAllBatches();
      const listed = batches.filter(
        (b) => b.listing?.isListed && b.status === "ACTIVE_LISTED",
      );
      res.json({ success: true, count: listed.length, data: listed });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // SACCO Explainable Credit Signals
  app.get(
    "/api/sacco/credit-signals/:fisherId",
    async (req: Request, res: Response) => {
      try {
        const signals = await storageAdapter.getSACCOCreditSignals(
          req.params.fisherId,
        );
        res.json({ success: true, data: signals });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
      }
    },
  );

  // BMU Landing Site Stats
  app.get("/api/bmu/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storageAdapter.getBMUStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Offline Sync Batch Ingestion
  app.post("/api/offline-sync", async (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res
          .status(400)
          .json({ success: false, error: "Expected items array" });
      }

      const results = [];
      for (const item of items) {
        if (item.type === "CREATE_BATCH") {
          const resBatch = await storageAdapter.createBatch({
            ...item.payload,
            channel: "WEB_OFFLINE_SYNC",
          });
          results.push({ id: item.id, status: "SYNCED", data: resBatch });
        } else if (item.type === "APPEND_EVENT") {
          const resBatch = await storageAdapter.appendEvent({
            ...item.payload,
            channel: "WEB_OFFLINE_SYNC",
          });
          results.push({ id: item.id, status: "SYNCED", data: resBatch });
        }
      }

      res.json({ success: true, processed: results.length, results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aqua-Seal Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
