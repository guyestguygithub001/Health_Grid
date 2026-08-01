# Health Grid

Welcome to the main repository for the **Health Grid** project. We recently completed a major update, moving into a fully hardened, offline-first health information system designed to be neutral and adaptable for any state or regional government deployment. 

Here is a summary of the project architecture, recent feature updates, and how the system separates secondary care (EHR) from primary care (PHC).

---

## 🚀 Recent Updates (August 2026)

### 1. Master Record Unit & CDA Generation
We completely overhauled the legacy legal views into a full-featured **Master Record Unit**. This module acts as the definitive source of truth for a patient's health data, generating **Clinical Document Architecture (CDA)** summaries that compile encounters, prescriptions, and lab results into a single interoperable document.

### 2. PHC Module Redesign (Rural Outposts)
We separated the **PHC Workspace** entirely from the **EHR Workspace**. The PHC module now features workflows specifically tailored for Community Health Extension Workers (CHEWs) in rural settings:
- **Sub-Center Hub:** A command center monitoring offline data syncs.
- **IMCI Wizard:** Integrated Management of Childhood Illnesses step-by-step assessment protocol.
- **ANC Tracker:** WHO 8-contact Antenatal Care tracker.
- **Household Roster:** Village-level tracking for mass immunization.
- **Epidemic Radar:** Syndromic surveillance reporting for early outbreak detection.

### 3. HIE Referral & Offline Sync
- **Referral Engine:** We implemented an active referral inbox/outbox system, allowing PHC workers to escalate complex cases (like IMCI danger signs) directly to the EHR hospital system via a unified backend endpoint (/api/v2/referrals).
- **Offline-First PHC:** Because rural clinics lack stable internet, the PHC module saves data (ANC, IMCI) to a local cache. Workers can then physically move to a connectivity zone and click **"Sync to EHR Hub"** to push records to the central /api/v2/phc/sync endpoint.

---

## 🏗 System Architecture

The ecosystem relies on an **Omni-Shield** architecture. It acts as a zero-trust monolithic Express.js app routing data for both the Hospital EHR and the PHC system.

### Core Stack
* **Frontend:** Vanilla HTML/JS with responsive grid layouts and modern "glassmorphism" styling. No complex build steps required.
* **Backend:** Node.js + Express (server/server.js).
* **Database:** In-memory local file persistence (data.json) designed to run offline without cloud dependencies.

---

## 🔒 Security & Compliance

The system has undergone extensive audits to ensure data privacy and legal compliance:
* **Strict RBAC:** Role-Based Access Control limits what doctors, nurses, pharmacists, and CHEWs can see and modify.
* **HIPAA/NDPR Compliance:** Data is isolated between the EMR, EHR, and PHC layers to prevent unauthorized cross-contamination.
* **Terms of Service:** Features explicit click-through consent, age restriction (18+), acceptable use rules, and binding arbitration logic.

---

## 🚀 Getting Started

1. **Install Node.js** (v18 or higher recommended).
2. Clone the repository and navigate to the project directory:
   `ash
   cd health-grid-ehr
   `
3. Install dependencies:
   `ash
   npm install
   `
4. Start the server:
   `ash
   npm start
   `
5. Open your browser and navigate to http://localhost:8082.

---
* © 2026 Health Grid. All rights reserved.*
