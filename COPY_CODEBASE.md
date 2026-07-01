# PlateauCare EHR Full Codebase

Copy each file into the same folder structure shown below.

## `package.json`

```json
{
  "name": "plateau-ehr",
  "version": "1.0.0",
  "description": "Plateau State hospital and PHC EHR prototype with AI medical scrub/inquiry support.",
  "main": "server/server.js",
  "scripts": {
    "start": "node server/server.js"
  },
  "keywords": [
    "ehr",
    "hospital",
    "phc",
    "plateau-state",
    "healthcare"
  ],
  "author": "Daniel Kingsley Ene",
  "license": "MIT"
}
```

## `.gitignore`

```
node_modules/
.env
*.log
server.out.log
server.err.log
```

## `README.md`

```markdown
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
```

## `TESTING.md`

```markdown
# Testing PlateauCare EHR

## Start The Server

PowerShell:

```powershell
cd "C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr"
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```

Command Prompt:

```bat
cd /d "C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr"
start-server.cmd
```

Then open:

```text
http://localhost:8080
```

## Quick API Checks

```powershell
Invoke-RestMethod http://localhost:8080/api/summary
Invoke-RestMethod http://localhost:8080/api/facilities
Invoke-RestMethod http://localhost:8080/api/patients
```

## Manual Workflow Test

1. Open the dashboard and confirm metrics load.
2. Go to Patients and register a new patient.
3. Go to Clinical Units and create an encounter.
4. Use Scrub Before Save to run the AI Medical Scrub.
5. Go to Orders and create a lab, pharmacy, or referral order.
6. Go to Reports and confirm quality, stock, surveillance, and facility reports load.

## Prototype Warning

This is not approved for real patient care. Use it for demos, learning, planning, and software development only.
```

## `start-server.cmd`

```bat
@echo off
set "NODE_EXE=C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
cd /d "%~dp0"
"%NODE_EXE%" "server\server.js"
```

## `start-server.ps1`

```powershell
$NodeExe = "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot
Write-Host "Starting PlateauCare EHR..."
Write-Host "Open http://localhost:8080 in your browser."
& $NodeExe "server\server.js"
```

## `server/server.js`

```javascript
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_FILE = path.join(__dirname, "data.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(body));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function nextId(prefix, list) {
  const max = list.reduce((highest, item) => {
    const numeric = Number(String(item.id || "").replace(/\D/g, ""));
    return Number.isFinite(numeric) && numeric > highest ? numeric : highest;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

function parseBp(bp) {
  const [systolic, diastolic] = String(bp || "").split("/").map(Number);
  return { systolic, diastolic };
}

function scrubClinicalNote(payload) {
  const text = [
    payload.chiefComplaint,
    payload.assessment,
    payload.plan,
    payload.note
  ].filter(Boolean).join(" ").toLowerCase();
  const vitals = payload.vitals || {};
  const issues = [];
  const missing = [];
  const suggestions = [];
  const redFlags = [];

  ["temperature", "bp", "pulse", "respiration", "spo2"].forEach(field => {
    if (!vitals[field]) missing.push(field);
  });

  const { systolic, diastolic } = parseBp(vitals.bp);
  if (systolic >= 180 || diastolic >= 120) {
    redFlags.push("Severe hypertension range. Confirm manually, assess end-organ symptoms, and escalate per protocol.");
  } else if (systolic >= 140 || diastolic >= 90) {
    issues.push("Blood pressure is elevated. Document repeat BP and cardiovascular/obstetric risk assessment.");
  }

  if (Number(vitals.temperature) >= 38) {
    issues.push("Fever documented. Consider malaria testing, infection screen, hydration status, and local surveillance alerts.");
  }

  if (Number(vitals.spo2) && Number(vitals.spo2) < 94) {
    redFlags.push("Low oxygen saturation. Recheck probe, assess airway/breathing, and consider urgent escalation.");
  }

  if (text.includes("pregnan") && (systolic >= 140 || diastolic >= 90)) {
    redFlags.push("Pregnancy plus elevated BP. Screen for pre-eclampsia: urine protein, headache, visual symptoms, epigastric pain, platelets/LFT where available.");
  }

  if (text.includes("child") || text.includes("under-5") || text.includes("under 5")) {
    suggestions.push("For under-5 care, document weight-based dosing, danger signs, hydration, immunization status, and caregiver counselling.");
  }

  if (text.includes("malaria")) {
    suggestions.push("For suspected malaria, record RDT/microscopy result before treatment where feasible and report rising PHC clusters.");
  }

  if (text.includes("chest pain") || text.includes("stroke") || text.includes("unconscious") || text.includes("seizure")) {
    redFlags.push("Emergency symptom found in note. Activate emergency workflow and document time-critical actions.");
  }

  if (missing.length) {
    issues.push(`Missing core vitals: ${missing.join(", ")}.`);
  }

  return {
    safety: "Prototype clinical support only. A licensed clinician must make final decisions.",
    qualityScore: Math.max(45, 100 - issues.length * 10 - redFlags.length * 18 - missing.length * 5),
    redFlags,
    documentationIssues: issues,
    suggestions,
    structuredSoap: {
      subjective: payload.chiefComplaint || "Not documented",
      objective: vitals,
      assessment: payload.assessment || "Not documented",
      plan: payload.plan || "Not documented"
    }
  };
}

function answerClinicalInquiry(question) {
  const q = String(question || "").toLowerCase();
  const disclaimer = "Prototype doctor inquiry support. Verify with local clinical protocol and senior review where needed.";

  if (q.includes("pre-eclampsia") || q.includes("preeclampsia")) {
    return {
      disclaimer,
      answer: "In ANC, elevated BP after 20 weeks needs repeat BP, urine protein, symptom screen, and severity assessment. Red flags include severe headache, visual symptoms, epigastric pain, breathlessness, seizures, BP in severe range, low platelets, abnormal LFT/creatinine, or fetal concerns. Stabilize and refer urgently if severe features are present.",
      actions: ["Repeat BP correctly", "Check urine protein", "Assess danger symptoms", "Order FBC/LFT/renal tests where available", "Refer urgently for severe features"]
    };
  }

  if (q.includes("malaria")) {
    return {
      disclaimer,
      answer: "For suspected malaria, confirm with RDT or microscopy where possible, assess danger signs, hydration, pregnancy status, age, and ability to tolerate oral medication. PHCs should escalate severe malaria signs, persistent vomiting, altered consciousness, convulsions, respiratory distress, severe anaemia, or shock.",
      actions: ["Perform RDT/microscopy", "Check danger signs", "Use weight-based dosing", "Document treatment batch where possible", "Notify surveillance if cluster rises"]
    };
  }

  if (q.includes("hypertension") || q.includes("bp")) {
    return {
      disclaimer,
      answer: "For high BP, repeat measurement after rest with correct cuff size, check adherence and symptoms, assess renal/cardiac risk, review current medicines, and escalate severe range or end-organ symptoms. Document BP trend, counselling, and follow-up date.",
      actions: ["Repeat BP", "Screen chest pain, neuro signs, breathlessness", "Review medication adherence", "Check renal function if available", "Schedule follow-up or emergency referral"]
    };
  }

  return {
    disclaimer,
    answer: "I can help structure clinical thinking, identify missing documentation, flag danger signs, suggest orders/referrals, and prepare SOAP notes. Ask about a condition, medication safety, triage risk, ANC, malaria, hypertension, emergency symptoms, or PHC referral criteria.",
    actions: ["Add patient age/sex", "Add vital signs", "State pregnancy/child status", "Mention allergies and medicines", "Ask a focused clinical question"]
  };
}

function buildSummary(data) {
  const openEncounters = data.encounters.filter(item => item.status !== "Closed").length;
  const phcs = data.facilities.filter(item => item.type.includes("Primary")).length;
  const urgentOrders = data.orders.filter(item => ["Urgent", "Emergency"].includes(item.priority)).length;
  const lowStock = data.inventory.filter(item => item.quantity <= item.reorderLevel).length;

  return {
    facilities: data.facilities.length,
    phcs,
    patients: data.patients.length,
    openEncounters,
    urgentOrders,
    lowStock,
    surveillanceSignals: data.surveillance.length,
    quality: {
      avgWaitMinutes: 34,
      triageUnder10Minutes: 82,
      referralCompletion: 76,
      ancRiskReviewed: 91
    }
  };
}

async function handleApi(req, res, url) {
  const data = readData();

  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/summary") {
    sendJson(res, 200, buildSummary(data));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/facilities") {
    sendJson(res, 200, data.facilities);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/patients") {
    sendJson(res, 200, data.patients);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/patients") {
    const body = await collectBody(req);
    const patient = {
      id: nextId("PT", data.patients),
      name: body.name || "Unnamed Patient",
      sex: body.sex || "Unknown",
      age: Number(body.age || 0),
      phone: body.phone || "",
      lga: body.lga || "",
      community: body.community || "",
      facilityId: body.facilityId || "FAC-PLSH",
      insurance: body.insurance || "Private Pay",
      risk: body.risk || "Routine",
      allergies: String(body.allergies || "").split(",").map(item => item.trim()).filter(Boolean),
      lastVisit: new Date().toISOString().slice(0, 10)
    };
    data.patients.unshift(patient);
    writeData(data);
    sendJson(res, 201, patient);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/encounters") {
    sendJson(res, 200, data.encounters);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/encounters") {
    const body = await collectBody(req);
    const encounter = {
      id: nextId("ENC", data.encounters),
      patientId: body.patientId,
      facilityId: body.facilityId,
      unit: body.unit || "OPD",
      date: new Date().toISOString().slice(0, 10),
      chiefComplaint: body.chiefComplaint || "",
      vitals: body.vitals || {},
      assessment: body.assessment || "",
      plan: body.plan || "",
      status: body.status || "Open"
    };
    data.encounters.unshift(encounter);
    writeData(data);
    sendJson(res, 201, encounter);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/orders") {
    sendJson(res, 200, data.orders);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/orders") {
    const body = await collectBody(req);
    const order = {
      id: nextId("ORD", data.orders),
      patientId: body.patientId,
      type: body.type || "Laboratory",
      item: body.item || "Unspecified order",
      priority: body.priority || "Routine",
      status: "Pending",
      facilityId: body.facilityId || "FAC-PLSH"
    };
    data.orders.unshift(order);
    writeData(data);
    sendJson(res, 201, order);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/reports") {
    sendJson(res, 200, {
      summary: buildSummary(data),
      inventory: data.inventory,
      surveillance: data.surveillance,
      facilities: data.facilities.map(facility => ({
        id: facility.id,
        name: facility.name,
        lga: facility.lga,
        openEncounters: data.encounters.filter(item => item.facilityId === facility.id && item.status !== "Closed").length,
        orders: data.orders.filter(item => item.facilityId === facility.id).length
      }))
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/ai/scrub") {
    const body = await collectBody(req);
    sendJson(res, 200, scrubClinicalNote(body));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/ai/inquiry") {
    const body = await collectBody(req);
    sendJson(res, 200, answerClinicalInquiry(body.question));
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`PlateauCare EHR running at http://localhost:${PORT}`);
});
```

## `server/data.json`

```json
{
  "facilities": [
    {
      "id": "FAC-JUTH",
      "name": "Jos University Teaching Hospital",
      "type": "Tertiary Hospital",
      "lga": "Jos North",
      "level": "Referral",
      "beds": 520,
      "status": "Online",
      "services": ["Emergency", "Surgery", "ICU", "Laboratory", "Radiology", "Pharmacy", "Maternity"]
    },
    {
      "id": "FAC-PLSH",
      "name": "Plateau State Specialist Hospital",
      "type": "Specialist Hospital",
      "lga": "Jos North",
      "level": "Secondary",
      "beds": 280,
      "status": "Online",
      "services": ["OPD", "Emergency", "Laboratory", "Radiology", "Pharmacy", "Maternity"]
    },
    {
      "id": "FAC-WASE",
      "name": "Federal Medical Centre Wase",
      "type": "Federal Medical Centre",
      "lga": "Wase",
      "level": "Referral",
      "beds": 180,
      "status": "Online",
      "services": ["OPD", "Emergency", "Surgery", "Laboratory", "Pharmacy"]
    },
    {
      "id": "FAC-PHC-BARKIN",
      "name": "Barkin Ladi Model PHC",
      "type": "Primary Health Centre",
      "lga": "Barkin Ladi",
      "level": "Primary",
      "beds": 24,
      "status": "Online",
      "services": ["ANC", "Immunization", "Malaria", "Delivery", "Outreach"]
    },
    {
      "id": "FAC-PHC-MANGU",
      "name": "Mangu Central PHC",
      "type": "Primary Health Centre",
      "lga": "Mangu",
      "level": "Primary",
      "beds": 18,
      "status": "Online",
      "services": ["ANC", "Immunization", "Malaria", "Nutrition", "Outreach"]
    },
    {
      "id": "FAC-PHC-SHENDAM",
      "name": "Shendam Community PHC",
      "type": "Primary Health Centre",
      "lga": "Shendam",
      "level": "Primary",
      "beds": 20,
      "status": "Needs Sync",
      "services": ["ANC", "Immunization", "Malaria", "Delivery"]
    }
  ],
  "patients": [
    {
      "id": "PT-0001",
      "name": "Amina Musa",
      "sex": "Female",
      "age": 29,
      "phone": "08030000001",
      "lga": "Barkin Ladi",
      "community": "Ropp",
      "facilityId": "FAC-PHC-BARKIN",
      "insurance": "PLASCHEMA",
      "risk": "Pregnancy",
      "allergies": ["Sulfa"],
      "lastVisit": "2026-06-18"
    },
    {
      "id": "PT-0002",
      "name": "Yakubu Pam",
      "sex": "Male",
      "age": 54,
      "phone": "08030000002",
      "lga": "Jos South",
      "community": "Bukuru",
      "facilityId": "FAC-PLSH",
      "insurance": "NHIA",
      "risk": "Hypertension",
      "allergies": [],
      "lastVisit": "2026-06-22"
    },
    {
      "id": "PT-0003",
      "name": "Grace Dung",
      "sex": "Female",
      "age": 7,
      "phone": "Guardian: 08030000003",
      "lga": "Mangu",
      "community": "Panyam",
      "facilityId": "FAC-PHC-MANGU",
      "insurance": "Basic Health Care Provision Fund",
      "risk": "Under-5",
      "allergies": ["Penicillin"],
      "lastVisit": "2026-06-20"
    },
    {
      "id": "PT-0004",
      "name": "Samuel Longji",
      "sex": "Male",
      "age": 37,
      "phone": "08030000004",
      "lga": "Wase",
      "community": "Wase Town",
      "facilityId": "FAC-WASE",
      "insurance": "Private Pay",
      "risk": "Trauma Follow-up",
      "allergies": [],
      "lastVisit": "2026-06-23"
    }
  ],
  "encounters": [
    {
      "id": "ENC-1001",
      "patientId": "PT-0001",
      "facilityId": "FAC-PHC-BARKIN",
      "unit": "ANC",
      "date": "2026-06-18",
      "chiefComplaint": "Routine antenatal visit, intermittent headache",
      "vitals": {
        "temperature": 36.8,
        "bp": "142/94",
        "pulse": 88,
        "respiration": 18,
        "spo2": 98,
        "weight": 72
      },
      "assessment": "Pregnancy at 28 weeks with elevated blood pressure. Rule out pre-eclampsia.",
      "plan": "Check urine protein, FBC, LFT, counsel danger signs, refer if severe features.",
      "status": "Open"
    },
    {
      "id": "ENC-1002",
      "patientId": "PT-0002",
      "facilityId": "FAC-PLSH",
      "unit": "OPD",
      "date": "2026-06-22",
      "chiefComplaint": "Headache and dizziness for three days",
      "vitals": {
        "temperature": 37.1,
        "bp": "168/104",
        "pulse": 94,
        "respiration": 20,
        "spo2": 97,
        "weight": 86
      },
      "assessment": "Poorly controlled hypertension.",
      "plan": "Review adherence, renal function, ECG, adjust antihypertensive after clinician review.",
      "status": "Open"
    },
    {
      "id": "ENC-1003",
      "patientId": "PT-0003",
      "facilityId": "FAC-PHC-MANGU",
      "unit": "PHC",
      "date": "2026-06-20",
      "chiefComplaint": "Fever, chills, vomiting",
      "vitals": {
        "temperature": 39.2,
        "bp": "92/60",
        "pulse": 124,
        "respiration": 28,
        "spo2": 96,
        "weight": 21
      },
      "assessment": "Suspected malaria with dehydration. Under-5 high risk.",
      "plan": "RDT, oral rehydration if tolerated, urgent referral if lethargy/persistent vomiting.",
      "status": "Escalated"
    }
  ],
  "orders": [
    {
      "id": "ORD-5001",
      "patientId": "PT-0001",
      "type": "Laboratory",
      "item": "Urine Protein, FBC, LFT",
      "priority": "Urgent",
      "status": "Pending",
      "facilityId": "FAC-PHC-BARKIN"
    },
    {
      "id": "ORD-5002",
      "patientId": "PT-0002",
      "type": "Pharmacy",
      "item": "Amlodipine review, adherence counselling",
      "priority": "Routine",
      "status": "In Progress",
      "facilityId": "FAC-PLSH"
    },
    {
      "id": "ORD-5003",
      "patientId": "PT-0003",
      "type": "Referral",
      "item": "Refer to General Hospital Mangu if danger signs persist",
      "priority": "Emergency",
      "status": "Escalated",
      "facilityId": "FAC-PHC-MANGU"
    }
  ],
  "inventory": [
    {
      "item": "Artemisinin Combination Therapy",
      "facilityId": "FAC-PHC-MANGU",
      "quantity": 18,
      "reorderLevel": 30
    },
    {
      "item": "Oxytocin",
      "facilityId": "FAC-PHC-BARKIN",
      "quantity": 9,
      "reorderLevel": 15
    },
    {
      "item": "RDT Kits",
      "facilityId": "FAC-PHC-SHENDAM",
      "quantity": 45,
      "reorderLevel": 50
    }
  ],
  "surveillance": [
    {
      "condition": "Malaria",
      "lga": "Mangu",
      "cases7d": 43,
      "trend": "Rising",
      "signal": "PHC outreach recommended"
    },
    {
      "condition": "Measles-like illness",
      "lga": "Shendam",
      "cases7d": 4,
      "trend": "Watch",
      "signal": "Verify immunization status"
    },
    {
      "condition": "Maternal hypertension",
      "lga": "Barkin Ladi",
      "cases7d": 8,
      "trend": "Rising",
      "signal": "ANC clinical audit"
    }
  ]
}
```

## `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PlateauCare EHR | Hospitals and PHCs</title>
  <meta name="description" content="A Plateau State hospital and PHC electronic health record prototype with clinical, operational, reporting, and AI medical scrub modules." />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">PC</div>
        <div>
          <strong>PlateauCare</strong>
          <span>EHR Command</span>
        </div>
      </div>

      <nav class="nav-menu" aria-label="Primary">
        <button class="nav-item active" data-view="dashboard">Dashboard</button>
        <button class="nav-item" data-view="patients">Patients</button>
        <button class="nav-item" data-view="clinical">Clinical Units</button>
        <button class="nav-item" data-view="phc">PHC Network</button>
        <button class="nav-item" data-view="orders">Orders</button>
        <button class="nav-item" data-view="ai">AI Medical Scrub</button>
        <button class="nav-item" data-view="reports">Reports</button>
      </nav>

      <div class="sidebar-card">
        <span class="eyebrow">Deployment Scope</span>
        <strong>Statewide hospitals + PHCs</strong>
        <p>Designed for referral continuity, PHC outreach, maternal-child health, surveillance, claims, and clinical quality.</p>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <span class="eyebrow">Plateau State health system</span>
          <h1 id="viewTitle">State Command Dashboard</h1>
        </div>
        <div class="top-actions">
          <span id="apiStatus" class="status-pill">Connecting</span>
          <button id="refreshBtn" class="icon-btn" type="button" title="Refresh data">Refresh</button>
        </div>
      </header>

      <section id="dashboard" class="view active">
        <div class="metric-grid">
          <article class="metric">
            <span>Facilities</span>
            <strong id="metricFacilities">0</strong>
            <small>Hospitals and PHCs connected</small>
          </article>
          <article class="metric">
            <span>PHCs</span>
            <strong id="metricPhcs">0</strong>
            <small>Primary care access points</small>
          </article>
          <article class="metric">
            <span>Patients</span>
            <strong id="metricPatients">0</strong>
            <small>Registered records</small>
          </article>
          <article class="metric urgent">
            <span>Urgent Work</span>
            <strong id="metricUrgent">0</strong>
            <small>Urgent orders and escalations</small>
          </article>
        </div>

        <div class="split-grid">
          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">Live queue</span>
                <h2>Open Encounters</h2>
              </div>
              <button class="text-btn" data-view-jump="clinical">Open units</button>
            </div>
            <div id="encounterList" class="record-list"></div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">Public health</span>
                <h2>Surveillance Signals</h2>
              </div>
              <button class="text-btn" data-view-jump="reports">Reports</button>
            </div>
            <div id="surveillanceList" class="signal-list"></div>
          </section>
        </div>

        <section class="panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">Facility map</span>
              <h2>Plateau Network Readiness</h2>
            </div>
          </div>
          <div id="facilityGrid" class="facility-grid"></div>
        </section>
      </section>

      <section id="patients" class="view">
        <div class="split-grid wide-left">
          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">Registry</span>
                <h2>Patient Directory</h2>
              </div>
              <input id="patientSearch" class="search-input" type="search" placeholder="Search patients, LGA, risk..." />
            </div>
            <div id="patientTable" class="table-wrap"></div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">Quick capture</span>
                <h2>Register Patient</h2>
              </div>
            </div>
            <form id="patientForm" class="stack-form">
              <label>Full Name<input name="name" required placeholder="Patient full name" /></label>
              <div class="form-row">
                <label>Sex<select name="sex"><option>Female</option><option>Male</option><option>Other</option></select></label>
                <label>Age<input name="age" type="number" min="0" required placeholder="0" /></label>
              </div>
              <label>Phone<input name="phone" placeholder="Phone or guardian contact" /></label>
              <div class="form-row">
                <label>LGA<input name="lga" placeholder="Jos North" /></label>
                <label>Community<input name="community" placeholder="Community" /></label>
              </div>
              <label>Facility<select id="patientFacility" name="facilityId"></select></label>
              <label>Insurance<select name="insurance"><option>PLASCHEMA</option><option>NHIA</option><option>Basic Health Care Provision Fund</option><option>Private Pay</option></select></label>
              <label>Risk Group<input name="risk" placeholder="Routine, Pregnancy, Under-5, Hypertension..." /></label>
              <label>Allergies<input name="allergies" placeholder="Comma-separated allergies" /></label>
              <button class="primary-btn" type="submit">Save Patient</button>
            </form>
          </section>
        </div>
      </section>

      <section id="clinical" class="view">
        <div class="module-grid">
          <article class="module-card"><span>TRI</span><h3>Triage</h3><p>Arrival time, vital signs, acuity, danger signs, queue routing.</p></article>
          <article class="module-card"><span>OPD</span><h3>Outpatient</h3><p>SOAP notes, diagnosis, prescriptions, labs, follow-up.</p></article>
          <article class="module-card"><span>EMR</span><h3>Emergency</h3><p>Resus notes, trauma, stroke/chest pain pathway, handover.</p></article>
          <article class="module-card"><span>IPD</span><h3>Wards</h3><p>Admissions, nursing charts, ward rounds, discharge summaries.</p></article>
          <article class="module-card"><span>LAB</span><h3>Laboratory</h3><p>Requests, specimen tracking, results, critical value alerts.</p></article>
          <article class="module-card"><span>PHA</span><h3>Pharmacy</h3><p>Prescriptions, allergy checks, stock, dispensing, counselling.</p></article>
          <article class="module-card"><span>RAD</span><h3>Radiology</h3><p>Imaging requests, reports, clinical indications, scheduling.</p></article>
          <article class="module-card"><span>MAT</span><h3>ANC and Maternity</h3><p>ANC risk, labour, delivery, postnatal, PMTCT, referral alerts.</p></article>
          <article class="module-card"><span>IMM</span><h3>Immunization</h3><p>Child schedule, defaulters, cold-chain notes, outreach line lists.</p></article>
          <article class="module-card"><span>THR</span><h3>Theatre</h3><p>Procedure booking, consent, checklist, operative notes.</p></article>
          <article class="module-card"><span>CLA</span><h3>Claims</h3><p>PLASCHEMA/NHIA eligibility, claim bundles, approvals, audit trail.</p></article>
          <article class="module-card"><span>REF</span><h3>Referrals</h3><p>PHC-to-hospital escalation, feedback loop, transport notes.</p></article>
        </div>

        <section class="panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">Clinical documentation</span>
              <h2>New Encounter</h2>
            </div>
          </div>
          <form id="encounterForm" class="encounter-form">
            <label>Patient<select id="encounterPatient" name="patientId"></select></label>
            <label>Facility<select id="encounterFacility" name="facilityId"></select></label>
            <label>Unit<select name="unit"><option>OPD</option><option>Emergency</option><option>ANC</option><option>PHC</option><option>Ward</option><option>Theatre</option></select></label>
            <label>Chief Complaint<textarea name="chiefComplaint" rows="3" placeholder="Presenting complaint and duration"></textarea></label>
            <div class="vitals-grid">
              <label>Temp<input name="temperature" type="number" step="0.1" placeholder="37.0" /></label>
              <label>BP<input name="bp" placeholder="120/80" /></label>
              <label>Pulse<input name="pulse" type="number" placeholder="80" /></label>
              <label>Resp<input name="respiration" type="number" placeholder="18" /></label>
              <label>SpO2<input name="spo2" type="number" placeholder="98" /></label>
              <label>Weight<input name="weight" type="number" step="0.1" placeholder="70" /></label>
            </div>
            <label>Assessment<textarea name="assessment" rows="3" placeholder="Working diagnosis and clinical reasoning"></textarea></label>
            <label>Plan<textarea name="plan" rows="3" placeholder="Investigations, treatment, counselling, referral, follow-up"></textarea></label>
            <div class="button-row">
              <button class="primary-btn" type="submit">Save Encounter</button>
              <button class="secondary-btn" id="scrubEncounterBtn" type="button">Scrub Before Save</button>
            </div>
          </form>
        </section>
      </section>

      <section id="phc" class="view">
        <div class="split-grid">
          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">Primary care</span>
                <h2>PHC Operating Model</h2>
              </div>
            </div>
            <div class="workflow">
              <div><strong>1. Community capture</strong><span>Registration, household, risk group, insurance.</span></div>
              <div><strong>2. Triage and PHC care</strong><span>Vitals, malaria, ANC, immunization, minor ailments.</span></div>
              <div><strong>3. Referral escalation</strong><span>Danger signs routed to general/specialist hospitals.</span></div>
              <div><strong>4. Feedback and follow-up</strong><span>Hospital outcome returns to PHC for continuity.</span></div>
              <div><strong>5. State reporting</strong><span>Routine indicators, outbreak signals, stock and quality.</span></div>
            </div>
          </section>
          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">Stock</span>
                <h2>PHC Supply Alerts</h2>
              </div>
            </div>
            <div id="inventoryList" class="record-list"></div>
          </section>
        </div>
      </section>

      <section id="orders" class="view">
        <div class="split-grid wide-left">
          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">Diagnostics and treatment</span>
                <h2>Orders Queue</h2>
              </div>
            </div>
            <div id="ordersTable" class="table-wrap"></div>
          </section>
          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">Quick order</span>
                <h2>Create Order</h2>
              </div>
            </div>
            <form id="orderForm" class="stack-form">
              <label>Patient<select id="orderPatient" name="patientId"></select></label>
              <label>Facility<select id="orderFacility" name="facilityId"></select></label>
              <label>Type<select name="type"><option>Laboratory</option><option>Pharmacy</option><option>Radiology</option><option>Referral</option><option>Procedure</option></select></label>
              <label>Item<textarea name="item" rows="3" placeholder="Order details"></textarea></label>
              <label>Priority<select name="priority"><option>Routine</option><option>Urgent</option><option>Emergency</option></select></label>
              <button class="primary-btn" type="submit">Create Order</button>
            </form>
          </section>
        </div>
      </section>

      <section id="ai" class="view">
        <div class="split-grid">
          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">AI Medical Scrub</span>
                <h2>Clinical Note Quality Check</h2>
              </div>
            </div>
            <form id="aiScrubForm" class="stack-form">
              <label>Chief Complaint<textarea name="chiefComplaint" rows="3">Pregnant patient with headache and BP 150/96</textarea></label>
              <div class="vitals-grid compact">
                <label>Temp<input name="temperature" value="36.9" /></label>
                <label>BP<input name="bp" value="150/96" /></label>
                <label>Pulse<input name="pulse" value="90" /></label>
                <label>Resp<input name="respiration" value="18" /></label>
                <label>SpO2<input name="spo2" value="98" /></label>
              </div>
              <label>Assessment<textarea name="assessment" rows="3">Pregnancy with elevated blood pressure</textarea></label>
              <label>Plan<textarea name="plan" rows="3">Check urine protein and refer if severe symptoms</textarea></label>
              <button class="primary-btn" type="submit">Run Medical Scrub</button>
            </form>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">Doctor inquiry</span>
                <h2>Ask Clinical Support</h2>
              </div>
            </div>
            <form id="aiInquiryForm" class="stack-form">
              <label>Question<textarea name="question" rows="5" placeholder="Ask about malaria, hypertension, pre-eclampsia, referral criteria...">What should a PHC document before referring suspected severe malaria?</textarea></label>
              <button class="primary-btn" type="submit">Ask Inquiry</button>
            </form>
            <div id="aiOutput" class="ai-output"></div>
          </section>
        </div>
      </section>

      <section id="reports" class="view">
        <div class="report-grid">
          <section class="panel">
            <span class="eyebrow">Quality</span>
            <h2>Clinical Quality Indicators</h2>
            <div id="qualityList" class="quality-list"></div>
          </section>
          <section class="panel">
            <span class="eyebrow">State reporting</span>
            <h2>Facility Performance</h2>
            <div id="facilityReport" class="table-wrap"></div>
          </section>
        </div>
      </section>
    </main>
  </div>

  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <script src="app.js"></script>
</body>
</html>
```

## `public/styles.css`

```css
:root {
  --ink: #10201b;
  --muted: #62706b;
  --line: #dce5e1;
  --paper: #f6f8f7;
  --panel: #ffffff;
  --brand: #0e7a61;
  --brand-dark: #075541;
  --accent: #b8872f;
  --danger: #bc3d35;
  --warning: #d8912a;
  --success: #16845f;
  --blue: #2b6ca3;
  --shadow: 0 18px 50px rgba(16, 32, 27, 0.1);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  display: grid;
  grid-template-columns: 284px minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 22px;
  color: white;
  background: #10251f;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 28px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: var(--brand);
  font-weight: 800;
}

.brand strong,
.brand span {
  display: block;
}

.brand span {
  color: #b5c8c1;
  font-size: 13px;
}

.nav-menu {
  display: grid;
  gap: 6px;
}

.nav-item {
  width: 100%;
  padding: 12px 14px;
  color: #dce9e5;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
}

.nav-item:hover,
.nav-item.active {
  color: white;
  background: rgba(14, 122, 97, 0.32);
  border-color: rgba(255, 255, 255, 0.08);
}

.sidebar-card {
  margin-top: 28px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.sidebar-card p {
  margin: 10px 0 0;
  color: #bfd0ca;
  font-size: 13px;
  line-height: 1.5;
}

.main {
  padding: 26px;
  min-width: 0;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-bottom: 22px;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0;
  font-size: 30px;
}

h2 {
  margin-bottom: 0;
  font-size: 19px;
}

.eyebrow {
  display: block;
  color: var(--brand);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.top-actions,
.button-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  color: var(--brand-dark);
  background: #dff3ed;
  border: 1px solid #bfe4d8;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
}

.icon-btn,
.text-btn,
.primary-btn,
.secondary-btn {
  border-radius: 8px;
  border: 1px solid var(--line);
  min-height: 40px;
  padding: 0 14px;
  background: white;
  color: var(--ink);
  font-weight: 700;
}

.primary-btn {
  color: white;
  border-color: var(--brand);
  background: var(--brand);
}

.secondary-btn {
  color: var(--brand-dark);
  background: #e7f5f0;
  border-color: #bfe1d7;
}

.text-btn {
  color: var(--brand-dark);
  background: transparent;
}

.view {
  display: none;
}

.view.active {
  display: block;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.metric,
.panel,
.module-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.metric {
  padding: 18px;
}

.metric span,
.metric small {
  display: block;
  color: var(--muted);
}

.metric strong {
  display: block;
  margin: 8px 0;
  font-size: 34px;
}

.metric.urgent strong {
  color: var(--danger);
}

.split-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.split-grid.wide-left {
  grid-template-columns: minmax(0, 1.5fr) minmax(340px, 0.7fr);
}

.panel {
  padding: 18px;
  overflow: hidden;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.record-list,
.signal-list,
.quality-list {
  display: grid;
  gap: 10px;
}

.record,
.signal,
.quality-row {
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfc;
}

.record {
  display: grid;
  gap: 6px;
}

.record strong,
.signal strong {
  display: block;
}

.record span,
.signal span,
.quality-row span {
  color: var(--muted);
  font-size: 13px;
}

.facility-grid,
.module-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.facility-card {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfc;
}

.facility-card h3 {
  margin-bottom: 6px;
  font-size: 16px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.tag,
.badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  color: var(--brand-dark);
  background: #e7f5f0;
  font-size: 12px;
  font-weight: 700;
}

.badge.warning {
  color: #7a4a08;
  background: #fff1d6;
}

.badge.danger {
  color: #84241f;
  background: #ffe2df;
}

.search-input,
input,
select,
textarea {
  width: 100%;
  padding: 10px 11px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: white;
  color: var(--ink);
}

textarea {
  resize: vertical;
}

.stack-form,
.encounter-form {
  display: grid;
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.form-row,
.vitals-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.vitals-grid {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.vitals-grid.compact {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.table-wrap {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 680px;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}

th {
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
}

.module-card {
  padding: 16px;
}

.module-card span {
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 32px;
  margin-bottom: 14px;
  color: white;
  border-radius: 8px;
  background: var(--brand);
  font-weight: 800;
  font-size: 12px;
}

.module-card p {
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 0;
}

.workflow {
  display: grid;
  gap: 10px;
}

.workflow div {
  display: grid;
  gap: 4px;
  padding: 12px;
  border-left: 4px solid var(--brand);
  background: #f3faf7;
  border-radius: 8px;
}

.workflow span {
  color: var(--muted);
}

.ai-output {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.ai-card {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfc;
}

.ai-card ul {
  padding-left: 18px;
  margin-bottom: 0;
}

.report-grid {
  display: grid;
  grid-template-columns: 0.7fr 1.3fr;
  gap: 16px;
}

.quality-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  max-width: 360px;
  padding: 14px 16px;
  color: white;
  background: var(--ink);
  border-radius: 8px;
  box-shadow: var(--shadow);
  opacity: 0;
  transform: translateY(12px);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1100px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
  }

  .nav-menu {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .metric-grid,
  .facility-grid,
  .module-grid,
  .split-grid,
  .split-grid.wide-left,
  .report-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .main,
  .sidebar {
    padding: 16px;
  }

  .topbar,
  .panel-head {
    align-items: stretch;
    flex-direction: column;
  }

  .nav-menu,
  .form-row,
  .vitals-grid,
  .vitals-grid.compact {
    grid-template-columns: 1fr;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

## `public/app.js`

```javascript
const state = {
  facilities: [],
  patients: [],
  encounters: [],
  orders: [],
  reports: null,
  summary: null
};

const titles = {
  dashboard: "State Command Dashboard",
  patients: "Patient Registry",
  clinical: "Clinical Units",
  phc: "PHC Network",
  orders: "Orders and Referrals",
  ai: "AI Medical Scrub",
  reports: "Reports and Quality"
};

const apiStatus = document.querySelector("#apiStatus");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}

function viewName(id) {
  return titles[id] || "PlateauCare EHR";
}

function switchView(id) {
  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.id === id);
  });
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === id);
  });
  document.querySelector("#viewTitle").textContent = viewName(id);
}

function patientName(id) {
  return state.patients.find(patient => patient.id === id)?.name || id;
}

function facilityName(id) {
  return state.facilities.find(facility => facility.id === id)?.name || id;
}

function badgeClass(value) {
  if (["Emergency", "Escalated"].includes(value)) return "badge danger";
  if (["Urgent", "Needs Sync", "Rising"].includes(value)) return "badge warning";
  return "badge";
}

function optionHtml(items, labelFn) {
  return items.map(item => `<option value="${item.id}">${labelFn(item)}</option>`).join("");
}

function fillSelects() {
  const facilityOptions = optionHtml(state.facilities, facility => `${facility.name} - ${facility.lga}`);
  const patientOptions = optionHtml(state.patients, patient => `${patient.name} (${patient.id})`);

  ["patientFacility", "encounterFacility", "orderFacility"].forEach(id => {
    const element = document.querySelector(`#${id}`);
    if (element) element.innerHTML = facilityOptions;
  });

  ["encounterPatient", "orderPatient"].forEach(id => {
    const element = document.querySelector(`#${id}`);
    if (element) element.innerHTML = patientOptions;
  });
}

function renderSummary() {
  const summary = state.summary;
  if (!summary) return;

  document.querySelector("#metricFacilities").textContent = summary.facilities;
  document.querySelector("#metricPhcs").textContent = summary.phcs;
  document.querySelector("#metricPatients").textContent = summary.patients;
  document.querySelector("#metricUrgent").textContent = summary.urgentOrders + summary.lowStock;
}

function renderEncounters() {
  const target = document.querySelector("#encounterList");
  target.innerHTML = state.encounters.slice(0, 6).map(encounter => `
    <article class="record">
      <strong>${patientName(encounter.patientId)} <span class="${badgeClass(encounter.status)}">${encounter.status}</span></strong>
      <span>${encounter.unit} at ${facilityName(encounter.facilityId)}</span>
      <span>${encounter.chiefComplaint}</span>
    </article>
  `).join("");
}

function renderFacilities() {
  const target = document.querySelector("#facilityGrid");
  target.innerHTML = state.facilities.map(facility => `
    <article class="facility-card">
      <h3>${facility.name}</h3>
      <span>${facility.type} Â· ${facility.lga} Â· ${facility.beds} beds</span>
      <div class="tag-row">
        <span class="${badgeClass(facility.status)}">${facility.status}</span>
        <span class="tag">${facility.level}</span>
      </div>
      <div class="tag-row">
        ${facility.services.slice(0, 5).map(service => `<span class="tag">${service}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderPatients(filter = "") {
  const q = filter.toLowerCase();
  const patients = state.patients.filter(patient => {
    return [patient.name, patient.lga, patient.community, patient.risk, patient.insurance]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  document.querySelector("#patientTable").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Patient</th>
          <th>Location</th>
          <th>Risk</th>
          <th>Facility</th>
          <th>Insurance</th>
        </tr>
      </thead>
      <tbody>
        ${patients.map(patient => `
          <tr>
            <td>${patient.id}</td>
            <td><strong>${patient.name}</strong><br>${patient.sex}, ${patient.age} yrs</td>
            <td>${patient.community}<br>${patient.lga}</td>
            <td><span class="${badgeClass(patient.risk === "Routine" ? "Routine" : "Urgent")}">${patient.risk}</span></td>
            <td>${facilityName(patient.facilityId)}</td>
            <td>${patient.insurance}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderOrders() {
  document.querySelector("#ordersTable").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Order</th>
          <th>Patient</th>
          <th>Type</th>
          <th>Item</th>
          <th>Priority</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${state.orders.map(order => `
          <tr>
            <td>${order.id}</td>
            <td>${patientName(order.patientId)}</td>
            <td>${order.type}</td>
            <td>${order.item}</td>
            <td><span class="${badgeClass(order.priority)}">${order.priority}</span></td>
            <td>${order.status}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderReports() {
  const reports = state.reports;
  if (!reports) return;

  const quality = reports.summary.quality;
  document.querySelector("#qualityList").innerHTML = `
    <div class="quality-row"><strong>Average wait time</strong><span>${quality.avgWaitMinutes} minutes</span></div>
    <div class="quality-row"><strong>Triage under 10 min</strong><span>${quality.triageUnder10Minutes}%</span></div>
    <div class="quality-row"><strong>Referral completion</strong><span>${quality.referralCompletion}%</span></div>
    <div class="quality-row"><strong>ANC risk reviewed</strong><span>${quality.ancRiskReviewed}%</span></div>
  `;

  document.querySelector("#facilityReport").innerHTML = `
    <table>
      <thead>
        <tr><th>Facility</th><th>LGA</th><th>Open Encounters</th><th>Orders</th></tr>
      </thead>
      <tbody>
        ${reports.facilities.map(row => `
          <tr>
            <td>${row.name}</td>
            <td>${row.lga}</td>
            <td>${row.openEncounters}</td>
            <td>${row.orders}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.querySelector("#inventoryList").innerHTML = reports.inventory.map(item => `
    <article class="record">
      <strong>${item.item} <span class="${item.quantity <= item.reorderLevel ? "badge danger" : "badge"}">${item.quantity} left</span></strong>
      <span>${facilityName(item.facilityId)}</span>
      <span>Reorder level: ${item.reorderLevel}</span>
    </article>
  `).join("");

  document.querySelector("#surveillanceList").innerHTML = reports.surveillance.map(item => `
    <article class="signal">
      <strong>${item.condition} <span class="${badgeClass(item.trend)}">${item.trend}</span></strong>
      <span>${item.lga}: ${item.cases7d} cases in 7 days</span>
      <span>${item.signal}</span>
    </article>
  `).join("");
}

function renderAiOutput(data) {
  if (data.structuredSoap) {
    document.querySelector("#aiOutput").innerHTML = `
      <article class="ai-card">
        <strong>Quality Score: ${data.qualityScore}%</strong>
        <p>${data.safety}</p>
      </article>
      <article class="ai-card">
        <strong>Red Flags</strong>
        <ul>${(data.redFlags.length ? data.redFlags : ["No immediate red flags found."]).map(item => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="ai-card">
        <strong>Documentation Issues</strong>
        <ul>${(data.documentationIssues.length ? data.documentationIssues : ["Core documentation looks complete."]).map(item => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="ai-card">
        <strong>Suggestions</strong>
        <ul>${(data.suggestions.length ? data.suggestions : ["Continue clinician-led assessment."]).map(item => `<li>${item}</li>`).join("")}</ul>
      </article>
    `;
    return;
  }

  document.querySelector("#aiOutput").innerHTML = `
    <article class="ai-card">
      <strong>Answer</strong>
      <p>${data.answer}</p>
      <small>${data.disclaimer}</small>
    </article>
    <article class="ai-card">
      <strong>Suggested Actions</strong>
      <ul>${data.actions.map(item => `<li>${item}</li>`).join("")}</ul>
    </article>
  `;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function encounterPayloadFromForm(form) {
  const fields = formToObject(form);
  return {
    patientId: fields.patientId,
    facilityId: fields.facilityId,
    unit: fields.unit,
    chiefComplaint: fields.chiefComplaint,
    vitals: {
      temperature: fields.temperature,
      bp: fields.bp,
      pulse: fields.pulse,
      respiration: fields.respiration,
      spo2: fields.spo2,
      weight: fields.weight
    },
    assessment: fields.assessment,
    plan: fields.plan
  };
}

async function loadData() {
  try {
    apiStatus.textContent = "Online";
    [state.summary, state.facilities, state.patients, state.encounters, state.orders, state.reports] = await Promise.all([
      api("/api/summary"),
      api("/api/facilities"),
      api("/api/patients"),
      api("/api/encounters"),
      api("/api/orders"),
      api("/api/reports")
    ]);
    fillSelects();
    renderSummary();
    renderEncounters();
    renderFacilities();
    renderPatients(document.querySelector("#patientSearch")?.value || "");
    renderOrders();
    renderReports();
  } catch (error) {
    apiStatus.textContent = "Offline";
    showToast("Backend is not reachable. Start the server and refresh.");
  }
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll("[data-view-jump]").forEach(button => {
  button.addEventListener("click", () => switchView(button.dataset.viewJump));
});

document.querySelector("#refreshBtn").addEventListener("click", loadData);

document.querySelector("#patientSearch").addEventListener("input", event => {
  renderPatients(event.target.value);
});

document.querySelector("#patientForm").addEventListener("submit", async event => {
  event.preventDefault();
  await api("/api/patients", {
    method: "POST",
    body: JSON.stringify(formToObject(event.currentTarget))
  });
  event.currentTarget.reset();
  showToast("Patient registered.");
  await loadData();
});

document.querySelector("#encounterForm").addEventListener("submit", async event => {
  event.preventDefault();
  await api("/api/encounters", {
    method: "POST",
    body: JSON.stringify(encounterPayloadFromForm(event.currentTarget))
  });
  event.currentTarget.reset();
  showToast("Encounter saved.");
  await loadData();
});

document.querySelector("#scrubEncounterBtn").addEventListener("click", async () => {
  const form = document.querySelector("#encounterForm");
  const result = await api("/api/ai/scrub", {
    method: "POST",
    body: JSON.stringify(encounterPayloadFromForm(form))
  });
  switchView("ai");
  renderAiOutput(result);
});

document.querySelector("#orderForm").addEventListener("submit", async event => {
  event.preventDefault();
  await api("/api/orders", {
    method: "POST",
    body: JSON.stringify(formToObject(event.currentTarget))
  });
  event.currentTarget.reset();
  showToast("Order created.");
  await loadData();
});

document.querySelector("#aiScrubForm").addEventListener("submit", async event => {
  event.preventDefault();
  const fields = formToObject(event.currentTarget);
  const result = await api("/api/ai/scrub", {
    method: "POST",
    body: JSON.stringify({
      chiefComplaint: fields.chiefComplaint,
      assessment: fields.assessment,
      plan: fields.plan,
      vitals: {
        temperature: fields.temperature,
        bp: fields.bp,
        pulse: fields.pulse,
        respiration: fields.respiration,
        spo2: fields.spo2
      }
    })
  });
  renderAiOutput(result);
});

document.querySelector("#aiInquiryForm").addEventListener("submit", async event => {
  event.preventDefault();
  const result = await api("/api/ai/inquiry", {
    method: "POST",
    body: JSON.stringify(formToObject(event.currentTarget))
  });
  renderAiOutput(result);
});

loadData();
```
