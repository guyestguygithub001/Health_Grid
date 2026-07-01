# PlateauCare EHR

PlateauCare EHR is a full-stack prototype Electronic Health Record designed for hospitals, general hospitals, specialist units, and Primary Health Centres across Plateau State.

It includes a hospital-grade clinical workflow, PHC-friendly public health modules, and a doctor-facing AI Medical Scrub/Inquiry assistant. The AI module in this prototype is rule-based and safe for local testing; it is structured so a real clinical AI model can be connected later.

## Included Modules

- State command dashboard
- Facility network for hospitals and PHCs
- Patient registry and demographics
- Triage and vital signs
- OPD consultations
- Emergency unit
- Inpatient wards
- Laboratory orders and results
- Pharmacy and medication safety
- Radiology
- Antenatal care and maternal health
- Immunization
- Theatre and procedures
- Referrals between PHCs and hospitals
- Disease surveillance and outbreak signals
- Health insurance and claims
- Inventory and stock alerts
- Reports and quality indicators
- AI Medical Scrub and Doctor Inquiry

## Project Structure

```text
plateau-ehr/
  package.json
  README.md
  server/
    server.js
    data.json
  public/
    index.html
    styles.css
    app.js
```

## How To Run

If Node.js is installed:

```bash
cd plateau-ehr
npm start
```

Then open:

```text
http://localhost:8080
```

If Node.js is not available on your PATH in Codex Desktop, use the bundled Node executable:

```powershell
& "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" "C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr\server\server.js"
```

## API Endpoints

- `GET /api/summary`
- `GET /api/facilities`
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/encounters`
- `POST /api/encounters`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/reports`
- `POST /api/ai/scrub`
- `POST /api/ai/inquiry`

## Important Safety Note

This is a prototype. It must not be used for real patient care until it has gone through clinical validation, security hardening, privacy review, role-based access control, audit logging, backup planning, and regulatory approval.
