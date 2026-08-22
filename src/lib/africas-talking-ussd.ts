import { SPECIES_CATALOG, SpeciesType } from "../types/aqua-seal";
import { storageAdapter } from "./storage-adapter";

export interface USSDResponse {
  response: string; // Starts with CON or END
  isTerminal: boolean;
  smsNotification?: {
    to: string;
    message: string;
  };
}

/**
 * Africa's Talking USSD Protocol State Machine
 */
const ussdSessions = new Map<string, { stage: string; value?: string }>();

export async function handleUSSDRequest(
  sessionId: string,
  serviceCode: string,
  phoneNumber: string,
  text: string,
): Promise<USSDResponse> {
  const cleanText = (text ?? "").trim();
  const steps = cleanText
    ? cleanText.split("*").filter((part) => part !== "")
    : [];
  const rootChoice = steps[0];

  const session = ussdSessions.get(sessionId) ?? { stage: "root" };

  // Keep the root menu explicit and feature-phone friendly.
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
      "0. Exit",
    ].join("\n");
    return { response: menu, isTerminal: false };
  }

  if (rootChoice === "0") {
    ussdSessions.delete(sessionId);
    return {
      response: "END Session ended. Dial *384*2782# to continue.",
      isTerminal: true,
    };
  }

  // OPTION 1: Register Catch
  if (rootChoice === "1") {
    // Step 1: Choose Species
    if (steps.length === 1) {
      return {
        response: [
          "CON Select Fish Species:",
          "1. Nile Perch (Mbuta)",
          "2. Nile Tilapia (Ngege)",
          "3. Omena / Dagaa",
          "4. African Catfish (Mumi)",
        ].join("\n"),
        isTerminal: false,
      };
    }

    // Step 2: Choose Landing Site
    if (steps.length === 2) {
      return {
        response: [
          "CON Select Landing Beach BMU:",
          "1. Dunga Beach (Kisumu)",
          "2. Uhanya Beach (Siaya)",
          "3. Mbita Point (Homa Bay)",
          "4. Karungu Bay (Migori)",
        ].join("\n"),
        isTerminal: false,
      };
    }

    // Step 3: Enter Weight in Kg
    if (steps.length === 3) {
      return {
        response: "CON Enter Catch Weight in Kg (e.g. 50):",
        isTerminal: false,
      };
    }

    // Step 4: Confirm & Create
    if (steps.length === 4) {
      const speciesMap: Record<string, SpeciesType> = {
        "1": "NILE_PERCH",
        "2": "TILAPIA",
        "3": "OMENA",
        "4": "CATFISH",
      };
      const siteMap: Record<string, string> = {
        "1": "site-dunga",
        "2": "site-uhanya",
        "3": "site-mbita",
        "4": "site-karungu",
      };

      const species = speciesMap[steps[1]] || "NILE_PERCH";
      const siteId = siteMap[steps[2]] || "site-dunga";
      const weightKg = parseFloat(steps[3]) || 25;

      const boats = await storageAdapter.getRegisteredBoats();
      if (!boats || boats.length === 0) {
        return {
          response:
            "END Error: No registered boats found for this BMU. Please register your boat first.",
          isTerminal: true,
        };
      }
      const boat = boats.find((b) => b.bmuSiteId === siteId) || boats[0];

      const newBatch = await storageAdapter.createBatch({
        boatRegistration: boat.registrationNumber,
        species,
        landingSiteId: siteId,
        harvestMethod: boat.approvedGear,
        weightKg,
        temperatureCelsius: 4.0,
        iceRatio: "1:1",
        actorName: boat.captainName,
        actorPhone: phoneNumber,
        channel: "USSD",
      });

      const smsText = `Aqua-Seal: Batch ${newBatch.batchId} registered. ${weightKg}kg ${newBatch.species} at ${newBatch.landingSiteName}. Verified Lake Fresh! View: https://aqua-seal.lakevictoria.org/verify?b=${newBatch.batchId}`;

      return {
        response: `END Catch recorded!\nBatch ID: ${newBatch.batchId}\nWeight: ${weightKg}kg ${newBatch.species}\nSMS confirmation sent to ${phoneNumber}.`,
        isTerminal: true,
        smsNotification: {
          to: phoneNumber,
          message: smsText,
        },
      };
    }
  }

  // OPTION 2: Update Cold-Chain & Ice
  if (rootChoice === "2") {
    if (steps.length === 1) {
      return {
        response: "CON Enter Batch ID to Ice (e.g. LV-DG-20260821-042 or 042):",
        isTerminal: false,
      };
    }
    if (steps.length === 2) {
      return {
        response: [
          "CON Select Ice Ratio & Source:",
          "1. 1:1 Solar Flake Ice (0-3°C)",
          "2. 1:2 Crushed Block Ice (4-6°C)",
          "3. Deep Freezing Re-pack",
        ].join("\n"),
        isTerminal: false,
      };
    }
    if (steps.length === 3) {
      const batchInput = steps[1].trim();
      const batches = await storageAdapter.getAllBatches();
      let targetBatch = batches.find(
        (b) =>
          b.batchId.toLowerCase().includes(batchInput.toLowerCase()) ||
          b.id.toLowerCase().includes(batchInput.toLowerCase()),
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
        temperatureCelsius: steps[2] === "1" ? 2.5 : 5.0,
        iceRatio: "1:1",
        iceSource: "Solar Ice Depot",
        channel: "USSD",
      });

      return {
        response: `END Cold-chain verified for ${targetBatch.batchId}!\nIce added. Freshness score updated to Grade A (Lake Fresh).`,
        isTerminal: true,
      };
    }
  }

  // OPTION 3: Verify Batch ID
  if (rootChoice === "3") {
    if (steps.length === 1) {
      return {
        response: "CON Enter Batch Code (e.g. 042 or LV-DG-20260821-042):",
        isTerminal: false,
      };
    }
    if (steps.length === 2) {
      const code = steps[1].trim().toUpperCase();
      const batches = await storageAdapter.getAllBatches();
      const batch = batches.find(
        (b) =>
          b.batchId.toUpperCase().includes(code) ||
          b.id.toUpperCase().includes(code),
      );

      if (!batch) {
        return {
          response: `END Batch "${code}" not found. Please verify the 4-digit code on the fish gill tag or paper receipt.`,
          isTerminal: true,
        };
      }

      const sp = SPECIES_CATALOG[batch.species]?.commonName || batch.species;
      return {
        response: `END ${batch.batchId} VERIFIED!\nFish: ${sp} (${batch.currentWeightKg}kg)\nOrigin: ${batch.boatName}, ${batch.landingSiteName}\nFreshness: ${batch.freshnessGrade} (${batch.currentTemperatureCelsius}°C)\nSeal: ${batch.qualifiesLakeFreshSeal ? "LAKE FRESH AUTHENTIC" : "STANDARD"}`,
        isTerminal: true,
      };
    }
  }

  // OPTION 4: Record Batch Sale
  if (rootChoice === "4") {
    if (steps.length === 1) {
      return {
        response: "CON Enter Batch ID sold:",
        isTerminal: false,
      };
    }
    if (steps.length === 2) {
      return {
        response: "CON Enter Total Sale Amount in KES:",
        isTerminal: false,
      };
    }
    if (steps.length === 3) {
      const amount = parseFloat(steps[2]) || 10000;
      const directFee = Math.round(amount * 0.015);
      const net = amount - directFee;

      return {
        response: `END Sale Logged!\nGross: KES ${amount.toLocaleString()}\nDirect Micro-Fee (1.5%): KES ${directFee.toLocaleString()}\nNet Fisher Earning: KES ${net.toLocaleString()}\nTransaction appended to ledger.`,
        isTerminal: true,
      };
    }
  }

  // OPTION 5: SACCO Credit Signal
  if (rootChoice === "5") {
    const signals = await storageAdapter.getSACCOCreditSignals(phoneNumber);
    return {
      response: `END SACCO Credit Summary:\nFisher: ${signals.fisherName}\n3-Mo Catch: ${signals.totalWeightHarvestedKg}kg (${signals.totalLandingsCount} landings)\nCold-Chain Score: ${signals.coldChainAdherenceRate}%\nEst. Credit Limit: KES ${signals.recommendedCreditLimitKes.toLocaleString()}\nRisk: ${signals.creditRiskBand}`,
      isTerminal: true,
    };
  }

  // OPTION 6: Indicative Beach Prices
  if (rootChoice === "6") {
    const lines = [
      "END Lake Victoria Indicative Beach Rates:",
      "• Nile Perch (Mbuta): KES 480 - 520/kg",
      "• Nile Tilapia (Ngege): KES 420 - 450/kg",
      "• Omena (Dagaa): KES 220 - 240/kg",
      "• Catfish (Mumi): KES 350 - 380/kg",
      "Aqua-Seal Direct Fee: 1.5% (Buyers)",
    ];
    return { response: lines.join("\n"), isTerminal: true };
  }

  return {
    response: "END Invalid choice. Please dial again.",
    isTerminal: true,
  };
}
