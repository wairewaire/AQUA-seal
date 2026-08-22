import React, { useEffect, useState } from 'react';
import {
  Anchor,
  Phone,
  MessageSquare,
  PlusCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  ShoppingBag,
  ShieldCheck,
  Award,
  Thermometer,
  CreditCard,
} from 'lucide-react';
import { LANDING_SITES } from '../types/aqua-seal';
import { offlineQueue } from '../lib/offline-queue';
import type { AppRole } from '../App';

export type ActiveTab =
  | 'REGISTRATION'
  | 'LEDGER'
  | 'COLD_CHAIN'
  | 'VERIFICATION'
  | 'MARKETPLACE'
  | 'SACCO_CREDIT';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  appRole: AppRole;
  currentUser: { name: string; phone: string };
  onRoleChange: (role: AppRole) => void;
  selectedSiteId: string;
  setSelectedSiteId: (siteId: string) => void;
  onOpenUSSD: () => void;
  onOpenSMS: () => void;
  onOpenNewCatch: () => void;
  networkMode: 'ONLINE' | 'INTERMITTENT_2G' | 'OFFLINE';
  setNetworkMode: (mode: 'ONLINE' | 'INTERMITTENT_2G' | 'OFFLINE') => void;
  onRefreshData: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  appRole,
  currentUser,
  onRoleChange,
  selectedSiteId,
  setSelectedSiteId,
  onOpenUSSD,
  onOpenSMS,
  onOpenNewCatch,
  networkMode,
  setNetworkMode,
  onRefreshData,
}) => {
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      setQueuedCount(offlineQueue.getItems().length);
    };
    updateCount();
    return offlineQueue.subscribe(updateCount);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await offlineQueue.syncAll();
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const currentSite =
    LANDING_SITES.find((s) => s.id === selectedSiteId) || LANDING_SITES[0];

  return (
    <header className="bg-[#004D40] text-white shadow-md sticky top-0 z-40">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="bg-white/20 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight uppercase leading-tight">
                Aqua-Seal
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 text-teal-100 tracking-wider font-mono">
                LAKE VICTORIA
              </span>
            </div>
            <p className="text-[10px] opacity-75 tracking-widest leading-none mt-0.5 uppercase">
              {currentSite.name} • {currentSite.county}
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Demo role login */}
          <div className="flex items-center gap-2 bg-black/20 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-teal-200 font-medium text-[11px] uppercase tracking-wider">Login:</span>
            <select
              value={appRole}
              onChange={(e) => onRoleChange(e.target.value as AppRole)}
              className="bg-transparent border-none text-white font-semibold focus:outline-hidden text-xs cursor-pointer"
              aria-label="Choose demo user role"
            >
              <option value="BMU" className="bg-[#004D40] text-white">BMU desk</option>
              <option value="SELLER" className="bg-[#004D40] text-white">Fisher seller</option>
              <option value="BUYER" className="bg-[#004D40] text-white">Buyer</option>
            </select>
            <span className="hidden xl:inline text-teal-100/70">{currentUser.name}</span>
          </div>

          {/* Landing Site Selector */}
          <div className="flex items-center bg-black/20 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white">
            <span className="text-teal-200 mr-1.5 font-medium text-[11px] uppercase tracking-wider">
              BMU:
            </span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-transparent border-none text-white font-semibold focus:outline-hidden text-xs cursor-pointer"
            >
              {LANDING_SITES.map((site) => (
                <option
                  key={site.id}
                  value={site.id}
                  className="bg-[#004D40] text-white"
                >
                  {site.name} ({site.county})
                </option>
              ))}
            </select>
          </div>

          {/* Network Simulator Mode Selector */}
          <div className="flex items-center bg-black/20 border border-white/15 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setNetworkMode("ONLINE")}
              className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-colors ${
                networkMode === "ONLINE"
                  ? "bg-emerald-500 text-white font-bold"
                  : "text-teal-100 hover:text-white"
              }`}
              title="Standard 4G/WiFi connection"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse mr-0.5" />
              <span className="text-xs font-medium">Online</span>
            </button>
            <button
              onClick={() => setNetworkMode("INTERMITTENT_2G")}
              className={`px-2 py-1 rounded flex items-center space-x-1 transition-colors ${
                networkMode === "INTERMITTENT_2G"
                  ? "bg-amber-600 text-white font-bold"
                  : "text-teal-100 hover:text-white"
              }`}
              title="Simulate 2G/intermittent edge network"
            >
              <span className="text-[11px]">2G</span>
            </button>
            <button
              onClick={() => setNetworkMode("OFFLINE")}
              className={`px-2 py-1 rounded flex items-center space-x-1 transition-colors ${
                networkMode === "OFFLINE"
                  ? "bg-rose-600 text-white font-bold"
                  : "text-teal-100 hover:text-white"
              }`}
              title="Simulate landing beach without internet"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Offline</span>
            </button>
          </div>

          {/* Offline Queue Sync Indicator */}
          {queuedCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing || networkMode === "OFFLINE"}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-400 text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-xs animate-pulse"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span>{queuedCount} Queued Sync</span>
            </button>
          )}

          {/* USSD Phone Launcher */}
          <button
            onClick={onOpenUSSD}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-mono font-bold transition-colors"
            title="Dial Africa's Talking USSD Code"
          >
            <Phone className="w-3.5 h-3.5 text-teal-200" />
            <span>*384*2782#</span>
          </button>

          {/* SMS / WhatsApp Launcher */}
          <button
            onClick={onOpenSMS}
            className="p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors"
            title="Open WhatsApp & SMS Verification Simulator"
          >
            <MessageSquare className="w-4 h-4 text-teal-200" />
          </button>

          {/* Officer Info Badge */}
          <div className="hidden lg:block text-right pl-2 border-l border-white/20">
            <p className="text-xs font-semibold leading-tight">
              {currentSite.bmuLeader}
            </p>
            <p className="text-[10px] opacity-70 leading-tight">
              BMU Desk ID: {currentSite.code}-01
            </p>
          </div>

          {/* New Catch Quick Button */}
          <button
            onClick={onOpenNewCatch}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#006064] hover:bg-[#00382E] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-colors border border-teal-300/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Catch</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#00382E] border-t border-teal-900/60 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 py-1.5 text-xs font-medium">
          <button
            onClick={() => setActiveTab("REGISTRATION")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 whitespace-nowrap text-xs font-semibold transition-all ${
              activeTab === "REGISTRATION"
                ? "bg-white/20 text-white shadow-xs"
                : "text-teal-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-300" />
            <span>BMU Catch Desk</span>
          </button>

          <button
            onClick={() => setActiveTab("LEDGER")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 whitespace-nowrap text-xs font-semibold transition-all ${
              activeTab === "LEDGER"
                ? "bg-white/20 text-white shadow-xs"
                : "text-teal-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-300" />
            <span>Live Traceability Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("COLD_CHAIN")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 whitespace-nowrap text-xs font-semibold transition-all ${
              activeTab === "COLD_CHAIN"
                ? "bg-white/20 text-white shadow-xs"
                : "text-teal-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-teal-300" />
            <span>Cold-Chain & Ice Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("VERIFICATION")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 whitespace-nowrap text-xs font-semibold transition-all ${
              activeTab === "VERIFICATION"
                ? "bg-white/20 text-white shadow-xs"
                : "text-teal-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Consumer QR Verification</span>
          </button>

          <button
            onClick={() => setActiveTab("MARKETPLACE")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 whitespace-nowrap text-xs font-semibold transition-all ${
              activeTab === "MARKETPLACE"
                ? "bg-white/20 text-white shadow-xs"
                : "text-teal-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-teal-300" />
            <span>Marketplace Discover (1.5% Fee)</span>
          </button>

          <button
            onClick={() => setActiveTab("SACCO_CREDIT")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 whitespace-nowrap text-xs font-semibold transition-all ${
              activeTab === "SACCO_CREDIT"
                ? "bg-white/20 text-white shadow-xs"
                : "text-teal-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-teal-300" />
            <span>SACCO Credit Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};