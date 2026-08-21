 ## Aqua-Seal: Lake Victoria BMU Traceability & Small-Scale Micro-Marketplace
 ```

> **Decentralized artisanal fisheries traceability, solar cold-chain assurance, and fair-trade micro-marketplace tailored for Lake Victoria Beach Management Units (BMUs) and small-scale fishers.**

```

##  The Problem Statement (In-Depth Field Context)
<pre>
Lake Victoria is Africa's largest freshwater fishery, supporting over **200,000 artisanal fishers** and sustaining livelihoods for upwards of **35 million people** across Kenya, Uganda, and Tanzania. Despite being a multi-million-dollar economic engine producing prized Nile Perch (*Lates niloticus*), Nile Tilapia (*Oreochromis niloticus*), and Lake Victoria Sardine / Omena (*Rastrineobola argentea*), the artisanal value chain suffers from systemic failures that trap fishers in cyclical poverty, degrade food safety, and jeopardize marine sustainability.


+--------------------------------------------------------------------------------------------------+
|                                THE ARTISANAL FISHERY VALUE LEAKAGE                               |
+--------------------------------------------------------------------------------------------------+
|  [Artisanal Fisher]  --->  [Middleman / Broker]  --->  [Wholesale Dealer]  --->  [Urban Consumer] |
|   • 100% Fuel Risk          • 50%+ Price Margin         • Quality Degradation     • No Provenance|
|   • 30-40% Spoilage         • Delayed Cash Relay        • Counterfeit Sourcing    • Food Safety  |
|   • Zero Credit Rating      • Informal Price-Fixing     • Opaque Transport        • Unknown Date |
+--------------------------------------------------------------------------------------------------+
</pre>

### 1. The 4-Hour "Spoilage Cliff" & Post-Harvest Losses
```
* **Tropical Ambient Heat**: Daily temperatures around Lake Victoria landing beaches (Kisumu, Siaya, Homa Bay, Migori, Busia) routinely exceed **28°C–34°C**.
* **Rapid Enzymatic & Bacterial Breakdown**: Freshly landed freshwater fish without prompt chilling undergo rapid bacterial proliferation and rigor-mortis decay within **3 to 4 hours**.
* **Severe Economic Destruction**: Post-harvest losses across East African small-scale fisheries range from **30% to 40%**. Fishers are routinely forced into distress sales (selling high-grade Nile Perch for less than 30% of its real value) simply because they lack verifiable cold storage or ice verification before the fish spoils.
```
### 2. Information Asymmetry & Predatory Middlemen (*Omena/Fish Brokers*)
```
* **Price Monopsony**: Fishers landing at remote Beach Management Units (e.g., Uhanya, Wichlum, Karungu) have zero real-time visibility into market prices in major urban consumption hubs like Kisumu, Nakuru, and Nairobi.
* **Informal Exploitation**: Middlemen exploit this information void by imposing arbitrary "lake-side deductions" for supposed quality flaws, pocketing margins upwards of **55%** while leaving primary producers with bare subsistence earnings that fail to cover kerosene, boat maintenance, and net repairs.
* **Opaque Transactions**: Without recorded weight, species, or pricing receipts, fishers have no legal or contractual protection against delayed payments, shortfalls, or disputed weights.
```
### 3. Traceability Vacuum & Illegal, Unreported, and Unregulated (IUU) Fishing
```
* **Rampant Mislabeling & Counterfeiting**: Premium wild-caught Lake Victoria Tilapia is frequently counterfeited or substituted in urban retail markets with unverified, lower-grade, or illegally harvested stock.
* **Destructive Harvest Practices**: The lack of landing site origin verification makes it impossible to distinguish sustainable, legal mesh-size catches (complying with **KMFRI — Kenya Marine and Fisheries Research Institute** regulations) from destructive juvenile harvesting or banned monofilament gillnets.
* **Consumer Trust Deficit**: Eco-conscious consumers, restaurants, and export aggregators are willing to pay a premium for verified sustainable, ethically caught freshwater fish, but no accessible, tamper-evident provenance mechanism exists for small-scale landing sites.
```
### 4. Financial Exclusion & The "Unbanked Fisher" Dilemma
```
* **Inability to Prove Creditworthiness**: Traditional commercial banks and even local Savings and Credit Cooperatives (SACCOs) classify artisanal fishers as "unbankable" high-risk borrowers due to irregular seasonal incomes and lack of titled collateral.
* **No Formal Transactional Trail**: A fisher who has landed 100 kg of Grade-A Nile Perch every week for three years has zero formal credit footprint to show a lender.
* **Predatory Moneylenders**: When boat engines fail or nets tear, fishers are forced to borrow from informal loan sharks charging extortionate interest rates (often requiring fishers to surrender their entire catch at discounted rates as loan servicing), perpetuating generational debt traps.
```
### 5. The Digital Divide & 2G Infrastructure Reality
```
* **Feature Phone Dominance**: Over **70% of Lake Victoria fishers** rely on basic 2G/GSM feature phones (Nokia/Tecno button devices) rather than smartphones.
* **Intermittent Offshore Connectivity**: Data networks (3G/4G/5G) are non-existent or unreliable several nautical miles out on open lake waters.
* **Failure of "Modern" Apps**: Smartphone-only apps, heavy web portals, and complex blockchain wallets completely fail in real-world landing beaches. A viable solution must bridge low-tech 2G USSD/SMS protocols with institutional-grade web dashboards and cryptographic ledgers.

```

## The Aqua-Seal Solution Architecture
```
Aqua-Seal bridges this chasm by delivering an **inclusive, hybrid digital-physical ecosystem** designed specifically around the operational realities of Beach Management Units (BMUs) on Lake Victoria.


                          ┌──────────────────────────────────────────────┐
                          │         AQUA-SEAL DIGITAL ECOSYSTEM          │
                          └──────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
   [2G / USSD & SMS Gateway]                                         [Modern Progressive Web App]
   • Dial *384*2782# on Button Phone                                 • BMU Beach Clerk Station
   • Offline Catch Logging via SMS                                   • Solar Cold-Chain Auditing
   • Instant SMS Batch & Price Dispatch                              • Direct Fair-Trade Marketplace
                 │                                                                 │
                 └────────────────────────────────┬────────────────────────────────┘
                                                  ▼
                                ┌───────────────────────────────────┐
                                │     CRYPTOGRAPHIC BMU LEDGER      │
                                │   • SHA-256 Provenance Hashes     │
                                │   • Immutable Custody Timeline    │
                                │   • FAO Sensory Quality Index     │
                                └───────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
   [Physical Waterproof QR Gill Tags]                                [Explainable SACCO Credit Passport]
   • Tamper-Evident Crate & Fish Tags                                • Landing Frequency Score (0-100)
   • Scan to Verify on Any Smartphone                                • Cold-Chain Adherence Rate
   • Instant Lake Fresh Quality Seal                                 • Evidence-Based Credit Limit (KES)
```

## Key Features & Functional Modules

### 1. Omnichannel Catch Registration (USSD `*384*2782#` & Web)
```
* **Interactive USSD Gateway**: Fishers on any basic 2G feature phone dial `*384*2782#` to register catch species, boat vessel, landing beach, and weight in seconds.
* **SMS Bot (`22384`)**: Natural language text relay to check batch integrity or report icing status.
* **BMU Beach Clerk Portal**: Comprehensive desktop/tablet interface for landing site clerks with offline-tolerant sync, boat registry lookups, and one-click presets.
```
### 2. Solar Cold-Chain & FAO Organoleptic Quality Assurance
* **Solar Flake Ice Audits**: Tracks ice application ratios (1:1 heavy solar flake ice, 1:2 standard chilling) and ice plant source.
* **Core Temperature Thresholds**: Enforces the Lake Victoria Cold Chain Rule (**Core Temp < 4.0°C** guarantees Grade A Fresh Seal).
* **FAO Organoleptic Sensory Audit**: Structured 4-factor evaluation based on official FAO freshwater fish inspection guidelines:
  1. *Eye Clarity*: Clear & convex/bulging (Grade A) vs. flat/cloudy (Grade B) vs. sunken (Grade C).
  2. *Gill Condition*: Bright red & mucus-free (Grade A) vs. pale pink (Grade B) vs. brown/slimy (Grade C).
  3. *Flesh Elasticity*: Firm & springy elastic (Grade A) vs. slightly soft (Grade B) vs. soft/collapsing (Grade C).
  4. *Odor Profile*: Fresh lake/neutral algae (Grade A) vs. mild fishy (Grade B) vs. ammoniacal/stale (Grade C).

### 3. Cryptographic Ledger & Physical QR Gill Tags
```
* **Tamper-Evident Traceability**: Each landed batch receives a unique identifier (e.g., `LV-DG-20260821-042`) and an immutable cryptographic chain-of-custody log.
* **Printable Physical Fish & Crate Tags**: Generates high-density QR code tags with string-hole guides designed for physical gill attachment or insulated fish crates.
* **Instant Consumer Verification Portal**: Consumers, chefs, or retail buyers scan the QR code or enter the batch ID to view the full journey from boat to table, vessel captain, harvest date, and temperature audit logs.
```
### 4. Fair-Trade Verified Micro-Marketplace
```
* **Direct Buyer-Fisher Connection**: Urban restaurants, hotels, and retail buyers purchase directly from certified landing batches.
* **Zero Fisher Listing Fees**: 100% free for artisanal fishers; transparent 1.5% buyer assurance fee funding BMU digital operations.
* **SMS Relay Bidding**: Instant SMS dispatch notifying fishers and BMU desks of buyer inquiries and purchase commitments.
```
### 5. Explainable SACCO Credit Passport
```
* **Evidence-Based Underwriting**: Completely replaces opaque credit scores with transparent, empirical fishery metrics:
  * **Landing Frequency & Consistency Score**: Tracks 90-day landing regularity and unexcused fishing gaps.
  * **Solar Cold-Chain Adherence Rate**: Measures the percentage of catches iced within 45 minutes of landing.
  * **Cumulative Verified Revenue (KES)**: Verified gross turnover recorded through official BMU weigh-ins.
* **Actionable Underwriting Recommendations**: Generates clear credit tier ratings (*Tier 1 Low Risk*, *Tier 2 Moderate*, *Tier 3 Monitored*) and recommended credit ceilings for vessel engine upgrades, solar ice boxes, and legal gillnet financing.
```


## Technology Stack
```
| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | High-performance Single Page Application with zero lag |
| **Language** | TypeScript (Strict Mode) | Full type-safety across all telemetry and ledger models |
| **Styling & Design System** | Tailwind CSS (Sleek Theme) | Custom color tokens (`#004D40`, `#006064`, `#E0F2F1`, `#F1F5F9`) |
| **Icons & Visuals** | Lucide React | Clean, domain-specific icons (Anchor, Snowflake, ShieldCheck, etc.) |
| **QR Code Engine** | `qrcode.react` (Canvas) | High-contrast client-side QR generation for printable gill tags |
| **Backend & Routing** | Express.js (Node.js) | RESTful API endpoints (`/api/batches`, `/api/ussd`, `/api/sms`) |
| **Telephony Gateway** | Simulated Africa's Talking API | Realistic USSD session state machine and SMS bot parser |
| **Data Validation** | Zod Schema Validation | Robust schema enforcement for all incoming batch logs |

```

## Project Directory Structure

```
├── .env.example                     # Environment variable declarations
├── index.html                       # HTML5 entry template
├── metadata.json                    # Application metadata and capability declarations
├── package.json                     # NPM dependencies and run scripts
├── server.ts                        # Express API server & mock telephony gateway
├── src/
│   ├── App.tsx                      # Root component & state management
│   ├── main.tsx                     # React DOM initialization
│   ├── index.css                    # Tailwind CSS directives and global styles
│   ├── types/
│   │   └── aqua-seal.ts             # Domain types, Zod schemas, landing site catalog
│   ├── lib/
│   │   └── storage-adapter.ts       # Data adapter, sample seed batches, local persistence
│   └── components/
│       ├── Navbar.tsx               # Top header, BMU selector, connectivity toggle
│       ├── CatchRegistrationView.tsx# Web landing registration form & quick presets
│       ├── TraceabilityLedgerView.tsx# Immutable provenance audit trail & search
│       ├── ColdChainStationView.tsx # Solar flake ice audits & FAO organoleptic scoring
│       ├── ConsumerVerificationView.tsx# Public QR scan portal & custody timeline
│       ├── MarketplaceView.tsx      # Fair-trade direct batch catalog & SMS inquiry
│       ├── SACCOCreditView.tsx      # Explainable fisher financial credit passport
│       ├── FishTagQRModal.tsx       # Printable waterproof gill tag dialog
│       ├── USSDSimulatorModal.tsx   # Africa's Talking 2G feature phone keypad simulator
│       └── SMSWhatsAppSimulatorModal.tsx# SMS bot (22384) & WhatsApp inquiry simulator
└── tsconfig.json                    # TypeScript compiler configuration
```


## Getting Started

## Prerequisites
* **Node.js**: `v18.0.0` or higher
* **Package Manager**: `npm` or `bun`

## Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/your-username/aqua-seal.git
cd aqua-seal

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev

The application will be accessible at `http://localhost:3000`.

```

## How to Test the Simulators
```
1. **Test 2G USSD Catch Logging**:
   * Click **"USSD (*384*2782#)"** in the top navigation bar.
   * Click **"Dial"** or enter `*384*2782#`.
   * Follow the prompts: Select `1. Register Catch`, enter species (`1` for Nile Perch), select boat (`1`), enter weight in KG (e.g., `45`), and select ice plant.
   * Notice the instant confirmation SMS and the newly generated batch appearing in the Traceability Ledger!

2. **Test FAO Sensory & Solar Ice Audit**:
   * Navigate to the **"Solar Cold-Chain"** tab.
   * Select an active batch, adjust the measured core temperature, and select FAO organoleptic qualities (Eyes, Gills, Flesh, Odor).
   * Click **"Append Cold-Chain Record to Ledger"** to seal the record.

3. **Test Consumer QR Verification**:
   * Go to the **"Verify Catch"** tab.
   * Click one of the quick sample batch codes (e.g., `LV-DG-20260821-042`) or enter an invalid code to test anti-counterfeit warnings.
   * Review the full provenance timeline from landing site to transport dispatch.

4. **Test Printable Waterproof Gill Tag**:
   * In the **"Traceability Ledger"**, click **"Print Tag"** on any batch.
   * View the physical layout formatted for thermal barcode and waterproof gill tagging.

```

## Policy & Regulatory Alignment
```
Aqua-Seal is designed in strict accordance with East African regional fisheries governance frameworks:
* **Beach Management Unit (BMU) Regulations (Kenya Fisheries Act)**: Empowers local community co-management of landing beaches.
* **KMFRI (Kenya Marine and Fisheries Research Institute)**: Compliance checks for legal mesh sizes and minimum harvest lengths (50 cm for Nile Perch, 25 cm for Tilapia).
* **Lake Victoria Fisheries Organization (LVFO)**: Harmonized regional fisheries standards across Kenya, Uganda, and Tanzania.
* **FAO Code of Conduct for Responsible Fisheries**: Scientific organoleptic inspection standards for small-scale post-harvest quality preservation.
```