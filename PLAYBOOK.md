# Engineering Playbook & Runbook

## 1. Authentication & Security
- **Bypass Tokens (Deprecated)**: Hardcoded mock tokens (like mock-jwt-token-12345) have been removed from the frontend. Do NOT commit test credentials. Use the dev DB seed script instead.
- **RBAC**: The JWT assigns roles (physician, 
urse, pharmacist, dmin). Make sure you pass the Bearer token in the Authorization header for all etch() calls or Vercel will bounce it with a 401.
- **Patient Portal**: Read-only access. Period. Do not expose PUT or DELETE endpoints to the portal role.

## 2. Clinical Encounter API 
- **Workflow**:
  1. Doctors select a patient in the EHR.
  2. The POST /api/v2/encounters endpoint receives the unified payload.
  3. **IMPORTANT**: If labOrders or prescriptions are present, the backend orchestration dynamically pushes these to the respective queues. Do not try to write to the orders collection directly from the frontend. Let the backend handle the transaction.

## 3. Deployment Notes (Vercel/Neon)
- **CORS Issues**: Keep all etch() API calls relative (e.g., /api/v2/encounters). Absolute paths will break across staging/production environments.
- **Connection Pools**: Neon requires strict connection limits. The pg-pool configuration in server/db-postgres.js is capped at 5 max connections. DO NOT increase this unless DevOps upgrades the Neon instance tier. If you see Connection terminated due to connection timeout, it's because you leaked a pool connection without calling client.release().
- **Environment Vars**: Copy .env.example to .env. Ensure .env is in .gitignore so you don't leak DB creds again.

*Last updated by: lead_dev*

## 4. Pitch Demo State Architecture (EMRState)
- **Concept**: For live software pitches where backends might not be fully seeded with edge cases, we use an in-memory EMRState global JS object in emr.html.
- **Function**: It allows data to flow seamlessly between isolated DOM modules. For example, when a nurse clicks Save Vitals in the Triage module, it updates EMRState.vitals. When a doctor selects that patient in the Consultation module, the script reads EMRState.vitals and populates the UI instantly.
- **Scope**: Used for Vitals, Pharmacy Orders, Lab Requests, and Radiology Scans.
