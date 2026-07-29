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

**RBAC Role Definitions:**
- **System Admin (`admin`)**: Unrestricted access to all clinical and administrative units.
- **Physician (`physician`)**: Access to Clerking (Clinics), Triage, Pharmacy, Lab, Radiology, and Records. Cannot access Billing or Wards.
- **Nurse (`nurse`)**: Access to Triage, Inpatient Wards, and Pharmacy. Cannot access Clinics or Billing.
- **Pharmacist (`pharmacist`)**: Access restricted strictly to the Pharmacy unit and Omni-Bar.

**Troubleshooting Login Issues:**
- If a user cannot see certain units, verify their role in `data.json` under the `staff` collection.
- The login token is stored in `sessionStorage` (`staff_token`). Clearing session storage will force a logout.
