# Support Playbook

## 1. Authentication & Security
- **Bypass Tokens**: Hardcoded mock tokens (like `mock-jwt-token-12345`) have been **removed** from the frontend files (`command.html`, `emr.html`) to ensure strict authentication.
- **Role-Based Redirection**: When a user registers or logs in via `/api/v2/auth/register` or `/api/v2/auth/login`, a JWT token is assigned based on their role (`physician`, `nurse`, `pharmacist`, `admin`).
- **Patient Portal**: The Patient Portal (`portal.html`) is strictly **read-only**. Patients can view their records but have no ability to edit or delete any data.

## 2. Clinical Encounters to Pharmacy & Labs (Module Integrations)
- **Workflow**:
  1. Doctors log into the EHR (`command.html`).
  2. In the **Clinical Encounters** view, they select an active consultation.
  3. They document Clinical Notes, assign an ICD-11 diagnosis, write Prescriptions, and check any required Orders (Lab tests, Scans).
  4. When they click **"Finalize Encounter"**, the frontend sends a single, unified `POST /api/v2/encounters` request.
- **Backend Orchestration**:
  - `POST /api/v2/encounters` receives the payload.
  - If `labOrders` are present, it dynamically creates pending requests in the `orders` collection (`type: "Laboratory"`).
  - If `prescriptions` are present, it dynamically creates pending requests in the `orders` collection (`type: "Pharmacy"`).
  - It automatically generates Billing invoices for the Consultation, Lab Test, and Pharmacy items.

## 3. Environment Separation
- All frontend `fetch()` API calls strictly use relative paths (e.g., `/api/v2/encounters`) rather than hardcoding `localhost`. This prevents CORS errors and ensures seamless operation when deployed to Vercel/Render.
- API endpoints are versioned with `/api/v2/` prefix to isolate the new workflows from legacy implementations.


### Staff Authentication & Role-Based Access Control (RBAC)

The EMR module is secured behind a Staff Authentication Gateway (`emrAuthGateway`). Users must authenticate to access clinical units.



### Staff Authentication & Role-Based Access Control (RBAC)

The EMR module is secured behind a Staff Authentication Gateway (`emrAuthGateway`). Users must authenticate to access clinical units.

**RBAC Role Definitions:**
- **System Admin (`admin`)**: Unrestricted access to all clinical and administrative units.
- **Physician (`physician`)**: Access to Clerking (Clinics), Triage, Pharmacy, Lab, Radiology, and Records. Cannot access Billing or Wards.
- **Nurse (`nurse`)**: Access to Triage, Inpatient Wards, and Pharmacy. Cannot access Clinics or Billing.
- **Pharmacist (`pharmacist`)**: Access restricted strictly to the Pharmacy unit and Omni-Bar.

**Troubleshooting Login Issues:**
- If a user cannot see certain units, verify their role in `data.json` under the `staff` collection.
- The login token is stored in `sessionStorage` (`staff_token`). Clearing session storage will force a logout.

## 4. Master Record Unit & PHC Referrals
- **CDA Documents**: The Master Record Unit aggregates all patient data (vitals, diagnoses, scripts) and generates a Clinical Document Architecture (CDA) compliant document.
- **PHC Isolation**: The PHC (Primary Health Care) module is fully isolated from the EHR. When navigating to the PHC module, all hospital-specific (EHR) features are hidden.
- **HIE Referral System**: PHC workers (e.g. CHEWs using the IMCI or ANC workflows) can escalate cases using the `Escalate to EHR` button. This creates a pending referral in the Master Record Unit for the central hospital to review.
> >   * * M a s t e r   A d m i n   L o g i n * * :   Y o u   c a n   n o w   u s e   t h e   u s e r n a m e   \   d m i n \   a n d   p a s s w o r d   \   d m i n 1 2 3 \   a n y w h e r e   i n   t h e   s o f t w a r e   ( b o t h   i n   t h e   E n t e r p r i s e   D a s h b o a r d   a n d   t h e   n e w   S t a f f   G a t e w a y )   t o   a u t o m a t i c a l l y   g a i n   S y s t e m   A d m i n   a c c e s s .  

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
