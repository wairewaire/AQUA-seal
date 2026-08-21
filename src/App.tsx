import React, { useEffect, useState } from "react";
import { Navbar, ActiveTab } from "./components/Navbar";
import { CatchRegistrationView } from "./components/CatchRegistrationView";
import { TraceabilityLedgerView } from "./components/TraceabilityLedgerView";
import { ColdChainStationView } from "./components/ColdChainStationView";
import { ConsumerVerificationView } from "./components/ConsumerVerificationView";
import { MarketplaceView } from "./components/MarketplaceView";
import { SACCOCreditView } from "./components/SACCOCreditView";
import { USSDSimulatorModal } from "./components/USSDSimulatorModal";
import { SMSWhatsAppSimulatorModal } from "./components/SMSWhatsAppSimulatorModal";
import { FishTagQRModal } from "./components/FishTagQRModal";
import { FishBatch, RegisteredBoat, LANDING_SITES } from "./types/aqua-seal";
import { REGISTERED_BOATS } from "./lib/storage-adapter";

export type AppRole = "BMU" | "SELLER" | "BUYER";

const DEMO_USERS: Record<AppRole, { name: string; phone: string }> = {
  BMU: { name: "Otieno Maurice", phone: "+254 722 314 890" },
  SELLER: { name: "James Onyango", phone: "+254 712 345 678" },
  BUYER: { name: "Mama Pendo Foods", phone: "+254 700 123 456" },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("REGISTRATION");
  const [appRole, setAppRole] = useState<AppRole>("BMU");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("site-dunga");
  const [networkMode, setNetworkMode] = useState<
    "ONLINE" | "INTERMITTENT_2G" | "OFFLINE"
  >("ONLINE");

  const [batches, setBatches] = useState<FishBatch[]>([]);
  const [boats, setBoats] = useState<RegisteredBoat[]>(REGISTERED_BOATS);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showUSSD, setShowUSSD] = useState(false);
  const [showSMS, setShowSMS] = useState(false);
  const [tagModalBatch, setTagModalBatch] = useState<FishBatch | null>(null);
  const [verifyInitialCode, setVerifyInitialCode] = useState<string>("");

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBatches(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch batches from server", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();

    // Check URL parameters for direct verification link
    const urlParams = new URLSearchParams(window.location.search);
    const verifyCode = urlParams.get("verify") || urlParams.get("b");
    if (verifyCode) {
      setVerifyInitialCode(verifyCode);
      setActiveTab("VERIFICATION");
    }
  }, []);

  const handleBatchCreated = (newBatch: FishBatch) => {
    setBatches((prev) => [newBatch, ...prev]);
    setTagModalBatch(newBatch);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans selection:bg-[#004D40] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appRole={appRole}
        currentUser={DEMO_USERS[appRole]}
        onRoleChange={(role) => {
          setAppRole(role);
          if (role !== "BMU") setActiveTab("MARKETPLACE");
        }}
        selectedSiteId={selectedSiteId}
        setSelectedSiteId={setSelectedSiteId}
        onOpenUSSD={() => setShowUSSD(true)}
        onOpenSMS={() => setShowSMS(true)}
        onOpenNewCatch={() => setActiveTab("REGISTRATION")}
        networkMode={networkMode}
        setNetworkMode={setNetworkMode}
        onRefreshData={fetchBatches}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-[#004D40] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Connecting to Aqua-Seal Lake Victoria Node...
            </p>
          </div>
        ) : (
          <>
            {activeTab === "REGISTRATION" && (
              <CatchRegistrationView
                selectedSiteId={selectedSiteId}
                boats={boats}
                batches={batches}
                networkMode={networkMode}
                onBatchCreated={handleBatchCreated}
                onOpenTagModal={(b) => setTagModalBatch(b)}
              />
            )}

            {activeTab === "LEDGER" && (
              <TraceabilityLedgerView
                batches={batches}
                onOpenTagModal={(b) => setTagModalBatch(b)}
                onRefreshData={fetchBatches}
              />
            )}

            {activeTab === "COLD_CHAIN" && (
              <ColdChainStationView
                batches={batches}
                onRefreshData={fetchBatches}
              />
            )}

            {activeTab === "VERIFICATION" && (
              <ConsumerVerificationView
                batches={batches}
                initialBatchCode={verifyInitialCode}
              />
            )}

            {activeTab === "MARKETPLACE" && (
              <MarketplaceView
                batches={batches}
                onRefreshData={fetchBatches}
                appRole={appRole}
                currentUser={DEMO_USERS[appRole]}
                onOpenVerification={(batchId) => {
                  setVerifyInitialCode(batchId);
                  setActiveTab("VERIFICATION");
                }}
              />
            )}

            {activeTab === "SACCO_CREDIT" && <SACCOCreditView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center space-y-1 mt-auto">
        <div className="font-semibold text-slate-300">
          Aqua-Seal Lake Victoria • Small-Scale Fisheries Provenance &amp;
          Micro-Marketplace
        </div>
        <p className="text-slate-500">
          Supporting Beach Management Units (BMUs) across Kisumu, Siaya, Homa
          Bay, Migori, and Busia. USSD Gateway:{" "}
          <span className="font-mono text-teal-400">*384*2782#</span> • SMS:{" "}
          <span className="font-mono text-teal-400">22384</span>
        </p>
      </footer>

      {/* Persistent Modals */}
      {showUSSD && (
        <USSDSimulatorModal
          onClose={() => setShowUSSD(false)}
          onBatchCreated={fetchBatches}
        />
      )}

      {showSMS && (
        <SMSWhatsAppSimulatorModal
          onClose={() => setShowSMS(false)}
          batches={batches}
        />
      )}

      {tagModalBatch && (
        <FishTagQRModal
          batch={tagModalBatch}
          onClose={() => setTagModalBatch(null)}
        />
      )}
    </div>
  );
}
