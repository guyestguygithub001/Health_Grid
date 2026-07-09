# 🏥 PlateauCare EHR

> **A state-wide Electronic Health Records system prototype for Plateau State, Nigeria**  
> Built for hospitals, general facilities and Primary Health Care (PHC) centres — integrating clinical documentation, ICD-11 coding, billing, immunization, referrals and AI-assisted quality review.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Clinical Unit Modules](#-clinical-unit-modules-12-active)
- [Laboratory Test Coverage](#-laboratory-test-coverage)
- [Billing & Insurance Gateway](#-billing--insurance-gateway)
- [ICD-11 Integration](#-icd-11--fhir-r4-integration)
- [AI Medical Scrub](#-ai-medical-scrub)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Design System](#-design-system)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview

**PlateauCare EHR** is a full-stack prototype Electronic Health Records platform designed for the Plateau State public health system in Nigeria. It aims to digitise clinical workflows across all tiers of care — from community PHC outreach to specialist hospital units — with a focus on:

- **Interoperability**: ICD-11 WHO classification + HL7 FHIR R4 condition export  
- **Insurance integration**: PLASCHEMA, NHIA, BHCPF billing and claims automation  
- **Clinical completeness**: 12 active clinical unit modules covering the full patient journey  
- **Public health surveillance**: Outbreak signal detection and PHC network monitoring  
- **AI-assisted documentation**: Clinical note quality scoring and decision support  

The system is intentionally designed as a **zero-dependency prototype** — no frontend framework, no external database — so it can be evaluated, demonstrated and extended without complex infrastructure.

---

## 🚀 Live Demo

Run locally in under 30 seconds:

```bash
git clone https://github.com/guyestguygithub001/Health_Grid.git
cd Health_Grid
node server/server.js
# → open http://localhost:8080
```

---

## ✨ Key Features

### 🏥 Clinical Operations
| Feature | Description |
|--------|-------------|
| **12 Active Unit Modals** | Click any unit card to open a full clinical form — Triage, OPD, Emergency, Ward, Lab, Pharmacy, Radiology, ANC/Maternity, Immunization, Theatre, Claims, Referrals |
| **Patient Registration** | Full demographic capture with insurance, LGA, risk group and allergy recording |
| **Encounter Documentation** | SOAP-structured notes with vitals grid and unit assignment |
| **Consultation Module** | Specialist consultations with ICD-11 live search, history, examination, assessment, plan and Rx |
| **Orders & Referrals** | Laboratory, pharmacy, radiology and procedural orders with priority flagging |
| **Prescription Gateway** | Repeatable medication rows with drug, dose, frequency and duration fields |

### 📊 Data & Reporting
| Feature | Description |
|--------|-------------|
| **State Dashboard** | Real-time summary: facilities, PHCs, patients, urgent work |
| **Surveillance Signals** | Public health alerts — disease clusters and trend monitoring |
| **Quality Indicators** | Average wait times, triage performance, ANC risk review rates |
| **Facility Performance** | Per-facility encounter and orders reporting |
| **PHC Supply Alerts** | Stock threshold monitoring with reorder alerts |

### 💰 Financial
| Feature | Description |
|--------|-------------|
| **Auto-Billing** | Every service rendered automatically generates an invoice |
| **Insurance Coverage** | Calculates patient payable vs insurance-covered amounts (PLASCHEMA 70%, NHIA 60%, BHCPF 90%) |
| **Billing Actions** | Mark bills as Paid, Claimed (insurance) or Waived per record |
| **Billing Ledger** | Searchable invoice table with totals for outstanding, collected and claims |

---

## 🏗 System Architecture

```
Health_Grid/
├── public/                  # Frontend (served as static files)
│   ├── index.html           # Single-page application shell
│   ├── app.js               # All client-side logic (~1,200 lines)
│   └── styles.css           # Design system (~500 lines)
│
├── server/
│   ├── server.js            # Node.js HTTP API server (~670 lines)
│   └── data.json            # JSON file-based data store
│
└── README.md
```

### Data Flow

```
Browser (app.js)
      │
      │  fetch() API calls
      ▼
Node.js HTTP Server (server.js)
      │
      │  readData() / writeData()
      ▼
data.json (flat-file persistence)
```

> The server requires **zero npm dependencies** — it uses only Node.js built-in modules: `http`, `fs`, and `path`.

---

## 🏥 Clinical Unit Modules (12 Active)

Each module opens as a modal form from the Clinical Units page. All forms:
- Pre-populate with registered patients and facilities from the database
- Save to the encounters API and auto-generate a billing invoice
- Start with **empty fields** — placeholder hints guide the user but nothing is pre-filled

| Code | Module | Key Fields |
|------|--------|-----------|
| **TRI** | Triage | Vitals (Temp, BP, Pulse, Resp, SpO2, Weight), 5-level priority, presenting complaint, nurse assessment |
| **OPD** | Outpatient | Chief complaint, vitals, assessment, ICD-11 diagnosis search, management plan |
| **EMR** | Emergency | Emergency level, GCS score, mechanism/complaint, ABCDE primary survey, disposition plan |
| **IPD** | Ward Admission | 20 ward types (ICU, NICU, CCU, Burns, Psych, Oncology etc.), bed number, admitting diagnosis |
| **LAB** | Laboratory | 60+ tests across 8 categories (see below), STAT priority, clinical indication, specimen notes |
| **PHA** | Pharmacy | 7 drug class groups (40+ drugs), specific formulation, allergy check, dispensing counselling |
| **RAD** | Radiology | 6 modality groups (80+ imaging studies), clinical question for radiologist, report section |
| **MAT** | ANC & Maternity | 13 visit types, parity, 6 obstetric vitals, obstetric assessment, danger sign counselling |
| **IMM** | Immunization | Full Nigeria EPI schedule + maternal + adult vaccines (30+ antigens), dose & series tracking |
| **THR** | Theatre | 4 surgical specialty groups (30+ procedures), 7 anaesthesia types, WHO surgical checklist, post-op plan |
| **CLA** | Insurance Claims | 7 insurance schemes, 9 benefit package types, pre-authorization code, eligibility verification |
| **REF** | Referrals | 30+ facilities (JUTH specialist units, all Plateau State General Hospitals, national referrals), urgency level |

---

## 🔬 Laboratory Test Coverage

The **LAB** module contains over **60 tests** organized into clinical categories:

### 🔴 Haematology (11 tests)
Full Blood Count (FBC/CBC) · Peripheral Blood Film / Malaria Microscopy · Malaria RDT · ESR · Reticulocyte Count · Blood Group & Rhesus Factor · Haemoglobin Electrophoresis / Sickling Test · PT/INR / Clotting Profile · aPTT · D-Dimer · Cross-Match & Blood Compatibility

### 🟡 Biochemistry / Clinical Chemistry (19 tests)
Random & Fasting Blood Glucose · 2-hr Post-Prandial Glucose · HbA1c · U&E/Creatinine · eGFR · LFT (ALT, AST, ALP, GGT, Bilirubin) · Total Protein & Albumin · Lipid Profile · Serum Uric Acid · Calcium/Phosphate/Magnesium · Amylase & Lipase · Serum Lactate · Electrolytes · CRP · Procalcitonin · Ferritin/Iron/TIBC · Vitamin B12 & Folate · Vitamin D

### 🟢 Microbiology / Infectious Disease (22 tests)
HIV 1&2 Rapid Test · CD4 Count · HBsAg · HBeAg · Anti-HCV · VDRL/RPR (Syphilis) · Widal Test (Typhoid) · Brucella · Sputum AFB Smear (TB) · GeneXpert MTB/RIF · TB Culture & DST · Blood Culture C&S · Urine MCS · HVS C&S · Gonorrhoea/Chlamydia PCR · Wound Swab C&S · Stool Microscopy · Stool O&P · Fungal KOH · CSF Analysis (Meningitis) · Dengue NS1 · COVID-19 Antigen · Lassa Fever PCR

### 🔵 Urinalysis / Renal (5 tests)
Urinalysis Dipstick · Urine Protein:Creatinine Ratio · 24-hr Urine Protein · Urine Microscopy · Urine β-hCG Pregnancy Test

### 🟣 Hormones / Endocrinology (8 tests)
TFTs (TSH, T3, T4) · Cortisol · Prolactin/FSH/LH/Oestradiol · Testosterone · Progesterone · Quantitative β-hCG · PSA · Anti-TPO/Anti-Thyroglobulin

### ⚫ Cardiac / Emergency Markers (6 tests)
Troponin I/T · CK-MB · BNP/NT-proBNP · ABG · VBG · Blood/Urine Ketones (DKA)

### 🟤 Immunology / Serology (7 tests)
Rheumatoid Factor · ANA · Anti-dsDNA · Complement C3/C4 · Anti-CCP · Total IgE · ANCA

### 🔶 Histopathology / Cytology (5 tests)
Cervical Smear/Pap Smear · FNAC · Tissue Biopsy (H&E) · Semen Analysis · Bone Marrow Aspirate & Trephine

---

## 💳 Billing & Insurance Gateway

Every patient service automatically triggers an invoice. The billing system applies Nigerian health insurance coverage rules:

| Scheme | Coverage | Description |
|--------|----------|-------------|
| **PLASCHEMA** | 70% | Plateau State Health Insurance |
| **NHIA** | 60% | National Health Insurance Authority |
| **BHCPF** | 90% | Basic Health Care Provision Fund (PHC-level) |
| **Private Pay** | 0% | Full out-of-pocket payment |

### Service Fee Schedule

| Service | Fee (₦) |
|---------|---------|
| Triage | 500 |
| Outpatient (OPD) | 1,000 |
| Consultation | 1,500 |
| Laboratory | 2,000 |
| Emergency | 3,000 |
| Pharmacy | 1,200 |
| Radiology | 4,500 |
| Ward/Inpatient | 5,000 |
| Referral | 800 |
| ANC | 1,000 |
| Immunization | 300 |
| Theatre | 15,000 |

### Billing Actions
- **Pay** — Mark patient's portion as collected
- **Claim** — Submit insurance coverage portion to scheme
- **Waive** — Write off balance for indigent/exempted patients

---

## 🧬 ICD-11 & FHIR R4 Integration

### ICD-11 Live Search
Available in both the **Consultation** form and **OPD unit modal**. As you type, the system searches a curated ICD-11 database and returns matching diagnostic codes with titles.

**Supported Diagnoses (examples):**

| Code | Diagnosis |
|------|-----------|
| `JA60` | Pre-eclampsia |
| `1D2Z` | Malaria, unspecified |
| `BA00.0` | Essential hypertension |
| `NC72.Z` | Fracture of forearm, unspecified |
| `5A11` | Type 2 diabetes mellitus |
| `1C44.Z` | Tuberculosis of lungs, unspecified |
| `NE60` | Burns of unspecified body region |

### Post-Coordination (Chapter 28 Extensions)
For codes that support post-coordination, the **Post-Coordination Builder** appears automatically. Extension axes include:

- **Laterality**: Left side (`XK8G`) / Right side (`XK9K`)
- **Fracture Type**: Closed (`XJ7ZH`) / Open (`XJ7YM`)
- **Severity**: Mild (`XS2A`) / Severe (`XS0T`)

### HL7 FHIR R4 Export
Every encounter with an ICD-11 code generates a valid **FHIR R4 Condition resource**. Click the **FHIR JSON** badge on any encounter to view the full resource including:

- `Condition.code` — ICD-11 stem code + display text
- `Condition.clinicalStatus` — active / resolved
- `Condition.subject` — Patient reference
- `Condition.extension` — Full post-coordinated cluster expression

---

## 🤖 AI Medical Scrub

The **AI Medical Scrub** module provides automated clinical note quality review and decision support.

### Quality Scoring
Analyses entered SOAP notes against clinical documentation standards and returns:

| Output | Description |
|--------|-------------|
| **Quality Score** | 0–100% documentation completeness |
| **Red Flags** | Life-threatening conditions requiring urgent escalation |
| **Documentation Issues** | Missing fields, incomplete assessments |
| **Suggestions** | Protocol reminders (malaria testing, pre-eclampsia screening etc.) |

### Triggered Red Flags
- Severe hypertension (≥180/120 mmHg)
- Low SpO2 (< 94%)
- Pregnancy + elevated BP → pre-eclampsia screen
- Emergency symptoms: chest pain, stroke, seizure, unconscious patient

### Clinical Inquiry
Ask open clinical questions and receive structured guidance on:
- Pre-eclampsia assessment and referral criteria
- Malaria danger signs and PHC escalation thresholds
- Hypertension BP management and follow-up
- Documentation completeness advice

---

## 🛠 Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | Vanilla HTML5 / CSS3 / JavaScript (ES2020+) | Zero build step, runs anywhere |
| **Styling** | Custom CSS Design System | Full control, no framework overhead |
| **Font** | Google Fonts — Outfit (300–700) | Modern, clinical, highly legible |
| **Backend** | Node.js (built-ins only: `http`, `fs`, `path`) | No npm install required |
| **Database** | JSON flat file (`data.json`) | Portable, no database server needed |
| **Standards** | ICD-11 WHO · HL7 FHIR R4 | International health interoperability |
| **Version Control** | Git / GitHub | Collaborative development |

### Why No npm / No Framework?
This is a **prototype and demonstration system**. The design decision to avoid npm dependencies means:
- ✅ Works offline after a single `git clone`
- ✅ No security audit required for dependencies
- ✅ Any evaluator can run it without Node experience
- ✅ Easy to port to any backend language (Python/Flask, PHP etc.)

---

## 📁 Project Structure

```
Health_Grid/
│
├── 📄 README.md
│
├── 📁 public/                        # Client-side application
│   │
│   ├── 📄 index.html                 # App shell — all views, modals, nav
│   │   ├── #dashboard                Dashboard with metrics + surveillance
│   │   ├── #patients                 Patient registry + registration form
│   │   ├── #consultations            Consultation form + history list
│   │   ├── #clinical                 12 Unit Cards + Encounter form
│   │   ├── #phc                      PHC operating model + supply alerts
│   │   ├── #orders                   Orders queue + create order form
│   │   ├── #billing                  Billing metrics + invoice ledger
│   │   ├── #ai                       AI Scrub + Clinical Inquiry
│   │   ├── #reports                  Quality + Facility + Inventory + Surveillance
│   │   └── #unitModal                Clinical unit form modal (shared)
│   │
│   ├── 📄 app.js                     Client-side application logic
│   │   ├── State management          (state object, loadData, fillSelects)
│   │   ├── Navigation & views        (switchView, nav-item binding)
│   │   ├── Render functions          (renderEncounters, renderPatients, etc.)
│   │   ├── ICD-11 search engine      (buildIcd11SearchUI, post-coordination)
│   │   ├── Consultation module       (form submit, prescription rows)
│   │   ├── Billing gateway           (renderBilling, updateBillStatus)
│   │   ├── Clinical unit modals      (unitDefs map, openUnitModal)
│   │   └── AI output rendering       (renderAiOutput, FHIR modal)
│   │
│   └── 📄 styles.css                 Design system
│       ├── CSS custom properties     (color tokens, spacing, typography)
│       ├── App shell layout          (sidebar + main split)
│       ├── Component styles          (cards, panels, forms, tables, badges)
│       ├── Modal styles              (overlay, header, body, footer)
│       └── Responsive breakpoints    (≤900px, ≤640px)
│
└── 📁 server/
    │
    ├── 📄 server.js                  Node.js API server (zero dependencies)
    │   ├── Static file serving       (public/ directory)
    │   ├── /api/summary              Dashboard metrics
    │   ├── /api/facilities           Facility list
    │   ├── /api/patients             GET + POST patient records
    │   ├── /api/encounters           GET + POST clinical encounters
    │   ├── /api/orders               GET + POST clinical orders
    │   ├── /api/consultations        GET + POST specialist consultations
    │   ├── /api/billing              GET billing records
    │   ├── /api/billing/status       POST update bill status
    │   ├── /api/reports              Quality + inventory + surveillance
    │   ├── /api/icd11/search         ICD-11 diagnosis search
    │   ├── /api/icd11/validate       Post-coordination expression validator
    │   ├── /api/fhir/Condition/:id   HL7 FHIR R4 Condition export
    │   ├── /api/ai/scrub             Clinical note quality analysis
    │   └── /api/ai/inquiry           Clinical decision support
    │
    └── 📄 data.json                  Flat-file data store
        ├── facilities[]              Hospital and PHC records
        ├── patients[]                Registered patient demographics
        ├── encounters[]              Clinical encounter records
        ├── orders[]                  Lab/pharmacy/radiology orders
        ├── inventory[]               Drug and supply stock levels
        ├── surveillance[]            Disease outbreak signals
        ├── consultations[]           Specialist consultation records
        └── billing[]                 Invoice and payment records
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | ≥ 14.x | `node --version` |
| Git | Any | `git --version` |

> No npm install. No build step. No database setup.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/guyestguygithub001/Health_Grid.git

# 2. Enter the project directory
cd Health_Grid

# 3. Start the server (default port 8080)
node server/server.js
```

Open your browser at **[http://localhost:8080](http://localhost:8080)**

### Custom Port

```bash
# PowerShell (Windows)
$env:PORT=8082; node server/server.js

# Bash / macOS / Linux
PORT=8082 node server/server.js
```

### Default Login / Access
No authentication is implemented in this prototype. The system opens directly to the State Command Dashboard.

---

## 📡 API Reference

### Base URL
```
http://localhost:8080
```

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | List all registered patients |
| `POST` | `/api/patients` | Register a new patient |

**POST /api/patients — Request Body:**
```json
{
  "name": "Amina Bello",
  "sex": "Female",
  "age": 28,
  "phone": "08012345678",
  "lga": "Jos North",
  "community": "Anglo-Jos",
  "facilityId": "FAC-PLSH",
  "insurance": "PLASCHEMA",
  "risk": "Pregnancy",
  "allergies": "Penicillin"
}
```

### Encounters

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/encounters` | List all clinical encounters |
| `POST` | `/api/encounters` | Create encounter (auto-generates bill) |

**POST /api/encounters — Request Body:**
```json
{
  "patientId": "PT-0001",
  "facilityId": "FAC-PLSH",
  "unit": "OPD",
  "chiefComplaint": "Fever and headache for 3 days",
  "vitals": {
    "temperature": "38.5",
    "bp": "110/70",
    "pulse": "98",
    "respiration": "20",
    "spo2": "97",
    "weight": "65"
  },
  "assessment": "Suspected malaria",
  "plan": "Malaria RDT, start AL if positive",
  "icd11Code": "1D2Z",
  "icd11Display": "Malaria, unspecified"
}
```

### Consultations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/consultations` | List all consultations |
| `POST` | `/api/consultations` | Create consultation (auto-generates bill) |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/billing` | List all invoices |
| `POST` | `/api/billing` | Manually create a bill |
| `POST` | `/api/billing/status` | Update bill status (Paid/Claimed/Waived) |

**POST /api/billing/status — Request Body:**
```json
{
  "id": "BILL-0001",
  "status": "Paid"
}
```

### ICD-11

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/icd11/search?q=malaria` | Search ICD-11 diagnoses |
| `POST` | `/api/icd11/validate` | Validate a post-coordinated expression |

**GET /api/icd11/search — Response:**
```json
[
  {
    "code": "1D2Z",
    "title": "Malaria, unspecified",
    "type": "stem",
    "allowedExtensions": []
  }
]
```

### FHIR R4

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/fhir/Condition/:encounterId` | Export HL7 FHIR R4 Condition resource |

**Response (example):**
```json
{
  "resourceType": "Condition",
  "id": "ENC-0001",
  "clinicalStatus": {
    "coding": [{ "system": "...", "code": "active" }]
  },
  "code": {
    "coding": [{
      "system": "http://id.who.int/icd/release/11/mms",
      "code": "1D2Z",
      "display": "Malaria, unspecified"
    }]
  },
  "subject": { "reference": "Patient/PT-0001", "display": "Amina Bello" },
  "recordedDate": "2026-07-09"
}
```

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/scrub` | Analyse clinical note quality |
| `POST` | `/api/ai/inquiry` | Answer a clinical question |

---

## 🎨 Design System

### Color Palette
```css
--brand:       #0891b2;   /* Teal-600 — primary actions */
--brand-dark:  #0e7490;   /* Teal-700 — hover states */
--brand-light: #e0f2fe;   /* Sky-100 — backgrounds, badges */
--success:     #059669;   /* Emerald-600 — paid, resolved */
--warning:     #d97706;   /* Amber-600 — urgent, pending */
--danger:      #dc2626;   /* Red-600 — emergency, critical */
--sidebar-bg:  #0f2133;   /* Deep navy — sidebar */
--bg:          #f0f6f9;   /* Cool off-white — page background */
```

### Typography
- **Font**: [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts) — weights 300, 400, 500, 600, 700
- **Base size**: 14px
- **Line height**: 1.55

### Responsive Breakpoints
| Breakpoint | Behaviour |
|-----------|-----------|
| `> 900px` | Full sidebar (220px) + content |
| `≤ 900px` | Sidebar collapses to icon strip (60px) |
| `≤ 640px` | Sidebar becomes horizontal top bar, content stacks vertically |

---

## 🗺 PHC Network Model

The system is designed around the Nigerian **Primary Health Care delivery system**:

```
Community Level
      │  Registration, household, risk group, insurance
      ▼
PHC Facility
      │  Triage, immunization, ANC, malaria, minor ailments
      ▼
General Hospital (LGA/Zonal)
      │  OPD, emergency, ward, surgery, lab, radiology
      ▼
Specialist / Teaching Hospital
      │  JUTH, PSSH, FMC — specialist care, ICU, theatre
      ▼
Feedback Loop
      │  Outcome returns to referring PHC for continuity
      ▼
State Dashboard
         Surveillance, quality, inventory, reporting
```

---

## 🔐 Security Notes

> ⚠️ **This is a prototype system for demonstration and evaluation purposes only.**

The following security features are **not implemented** in this version and **must be added** before any production use:

- [ ] User authentication and role-based access control (RBAC)
- [ ] HTTPS / TLS encryption
- [ ] Input sanitisation and SQL-injection prevention
- [ ] Patient data encryption at rest
- [ ] Audit logging for all data access and modifications
- [ ] Session management and token expiry
- [ ] HIPAA / NDPR compliance measures
- [ ] Backup and disaster recovery
- [ ] Rate limiting on API endpoints

---

## 🛣 Roadmap

### Phase 2 — Authentication & Access Control
- [ ] Staff login with JWT authentication
- [ ] Role-based access: Admin, Doctor, Nurse, Lab Technician, Pharmacist, Billing Officer
- [ ] Facility-scoped data access

### Phase 3 — Persistence
- [ ] PostgreSQL or MongoDB backend
- [ ] Patient history and longitudinal records
- [ ] Multi-facility data isolation

### Phase 4 — Interoperability
- [ ] DHIS2 integration for national health data reporting
- [ ] Full HL7 FHIR R4 server compliance
- [ ] OpenMRS data migration support
- [ ] ICD-11 full API integration (WHO cloud)

### Phase 5 — Mobile & Offline
- [ ] Progressive Web App (PWA) with offline-first capability
- [ ] Community health worker mobile interface
- [ ] USSD/SMS integration for rural outreach workers
- [ ] Sync-on-connect for low-connectivity PHCs

### Phase 6 — Advanced Clinical Tools
- [ ] E-prescribing with drug interaction checking
- [ ] Clinical decision support rules engine
- [ ] Maternal early warning score (MEOWS) automation
- [ ] Paediatric growth monitoring (z-scores, WHO charts)

---

## 🤝 Contributing

Contributions are welcome. Please follow this workflow:

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# 4. Commit with a descriptive message
git commit -m "feat: add [feature description]"

# 5. Push to your fork
git push origin feature/your-feature-name

# 6. Open a Pull Request on GitHub
```

### Commit Convention
Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation updates |
| `style:` | CSS/formatting changes |
| `refactor:` | Code restructure |
| `chore:` | Build, tooling, dependencies |

---

## 📜 Standards & Compliance

| Standard | Usage in PlateauCare EHR |
|----------|--------------------------|
| **ICD-11** (WHO, 2022) | Primary diagnostic coding system |
| **HL7 FHIR R4** | Condition resource export |
| **Nigeria EPI Schedule** | Immunization module antigen list |
| **WHO Safe Surgery Checklist** | Theatre module documentation |
| **PLASCHEMA Benefit Packages** | Billing and claims module |
| **NHIA Tariff Structure** | Insurance coverage calculation |
| **BHCPF PHC Package** | Primary care billing |
| **WHO 5-Level Triage** | Triage module priority classification |

---

## 📞 Contact & Support

**Project**: PlateauCare EHR / Health_Grid  
**Repository**: [github.com/guyestguygithub001/Health_Grid](https://github.com/guyestguygithub001/Health_Grid)  
**Platform**: Plateau State Ministry of Health — Digital Health Initiative  

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 PlateauCare EHR / Health_Grid Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Built for Plateau State · Designed for Nigeria · Structured for Africa**

*PlateauCare EHR — Connecting every clinic, every patient, every story.*

</div>
