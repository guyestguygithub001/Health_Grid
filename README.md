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

---

## Security Posture & Playbook

### Environment Variables
This application enforces strict environment variable separation for secrets. The following keys must be present in the `.env` file at the root of the project:
- `JWT_SECRET`: Used for signing patient authentication tokens.
- `POSTGRES_PASSWORD`: Database password for local/remote connections.
- `PAYSTACK_SECRET_KEY`: Secret key for payment processing.
- `PAYSTACK_PUBLIC_KEY`: Public key for the frontend checkout.

**If these variables are missing, the server will either fail to boot or log severe warnings, and certain functionalities (like auth and payments) will be blocked.**

### Key Rotation Playbook
In the event of a suspected breach or regular security audit, follow these steps to rotate keys:
1. **Paystack/External APIs**: Log into your respective dashboard (e.g., Paystack Dashboard -> Settings -> API Keys). Generate new secret and public keys.
2. **Update `.env`**: Replace the old keys in your production `.env` file with the newly generated ones.
3. **Burn Old Keys**: In the external dashboard, explicitly **revoke** or delete the old keys to ensure they can no longer be used.
4. **Internal Keys (JWT)**: Generate a new random cryptographically secure string (e.g., `openssl rand -hex 32` or via Node crypto) and update `JWT_SECRET`. Note: Rotating `JWT_SECRET` will immediately invalidate all active user sessions, requiring them to log in again.
5. **Restart Service**: Restart your Node.js application or Vercel instance to apply the new `.env` variables.

### Pre-Commit Hook Security
This repository is configured with a Git `pre-commit` hook located at `.git/hooks/pre-commit`.
- **Purpose**: It uses regular expressions to scan every staged commit for patterns matching AWS keys, Stripe/Paystack keys, JWT tokens, and hardcoded passwords.
- **Action**: If a secret is detected, the commit is blocked to prevent accidental leaks.
- **Bypass**: If you encounter a false positive (e.g., a documentation example), you can bypass the hook using `git commit --no-verify`. **Use this with extreme caution.**


## Recent Updates (Aug 7 - Aug 8)

### Architecture & Scaling
- **Neon Serverless PostgreSQL**: Transitioned Health Grid backend off of local JSON mocks and provisioned a highly scalable Neon Database cluster. Migrated all core schemas and integrated the connection pool (`NEON_DATABASE_URL`).
- **Vercel Edge Resiliency**: Implemented robust 'Static Mock Fallbacks' for Vercel preview environments, intercepting backend 404/500 routing errors to ensure the frontend prototype remains seamlessly interactive for investors and testers.

### PHC Module Enhancements
- **MPI Fallback Registration**: Expanded the Master Patient Index (MPI) to gracefully handle patients without a National ID by capturing comprehensive fallback demographics including Religion, Nationality, and Ethnicity.
- **Schema Evolution**: Altered the `patients` Postgres schema via a new migration script (`005_mpi_demographics.sql`) to safely persist the new fallback fields across the database network.
- **Workflow Streamlining**: Overhauled the registration handoff protocol. Creating an MPI now automatically generates the UUID and bridges directly into the Patient Records Unit for immediate Appointment Booking.

### Backend Fixes
- Resolved critical Node.js `collectBody` asynchronous stream deadlock in `server.js` that previously blocked authentication routing.
- Re-mapped the `POST /api/v2/patients` route to properly intersect with the PostgreSQL `patient-api.js` handler.
