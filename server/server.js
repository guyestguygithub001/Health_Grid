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

const ICD11_DB = {
  stems: {
    "1A00": { title: "Cholera", allowedExtensions: [] },
    "1D2Z": { title: "Malaria, unspecified", allowedExtensions: [] },
    "BA00.0": { title: "Essential hypertension", allowedExtensions: [] },
    "JA60": { title: "Pre-eclampsia", allowedExtensions: ["XS2A", "XS0T"] },
    "NC72.Z": { title: "Fracture of forearm, unspecified", allowedExtensions: ["XK8G", "XK9K", "XJ7ZH", "XJ7YM"] },
    "5A11": { title: "Type 2 diabetes mellitus", allowedExtensions: [] },
    "1C44.Z": { title: "Tuberculosis of lungs, unspecified", allowedExtensions: [] },
    "1E31": { title: "Type A influenza", allowedExtensions: [] },
    "NE60": { title: "Burns of unspecified body region", allowedExtensions: ["XK8G", "XK9K"] }
  },
  extensions: {
    "XK8G": { title: "Left side", axis: "Laterality" },
    "XK9K": { title: "Right side", axis: "Laterality" },
    "XJ7ZH": { title: "Closed fracture", axis: "Fracture Type" },
    "XJ7YM": { title: "Open fracture", axis: "Fracture Type" },
    "XS2A": { title: "Mild severity", axis: "Severity" },
    "XS0T": { title: "Severe severity", axis: "Severity" }
  }
};

function searchIcd11(query) {
  const q = String(query).toLowerCase().trim();
  if (!q) return [];
  const results = [];
  for (const [code, info] of Object.entries(ICD11_DB.stems)) {
    if (code.toLowerCase().includes(q) || info.title.toLowerCase().includes(q)) {
      results.push({
        code,
        title: info.title,
        type: "stem",
        allowedExtensions: info.allowedExtensions
      });
    }
  }
  return results;
}

function validateIcd11Cluster(expression) {
  if (!expression) {
    return { isValid: false, error: "Empty expression" };
  }
  const parts = expression.split("&");
  const stemCode = parts[0];
  const extensionCodes = parts.slice(1);
  
  const stem = ICD11_DB.stems[stemCode];
  if (!stem) {
    return { isValid: false, error: `Invalid stem code: ${stemCode}` };
  }
  
  const seenAxes = {};
  const validatedExtensions = [];
  
  for (const extCode of extensionCodes) {
    const ext = ICD11_DB.extensions[extCode];
    if (!ext) {
      return { isValid: false, error: `Invalid extension code: ${extCode}` };
    }
    if (!stem.allowedExtensions.includes(extCode)) {
      return { isValid: false, error: `Extension ${extCode} (${ext.title}) is not permitted for stem ${stemCode}` };
    }
    if (seenAxes[ext.axis]) {
      return { isValid: false, error: `Axis conflict: ${ext.axis} specified twice` };
    }
    seenAxes[ext.axis] = extCode;
    validatedExtensions.push({ code: extCode, title: ext.title, axis: ext.axis });
  }
  
  return {
    isValid: true,
    stem: { code: stemCode, title: stem.title },
    extensions: validatedExtensions,
    formattedDisplay: stem.title + (validatedExtensions.length ? ", " + validatedExtensions.map(e => e.title).join(", ") : "")
  };
}

const serviceCosts = {
  "Triage": 500,
  "Outpatient": 1000,
  "Emergency": 3000,
  "Wards": 5000,
  "Laboratory": 2000,
  "Pharmacy": 1200,
  "Radiology": 4500,
  "ANC and Maternity": 1000,
  "Immunization": 300,
  "Theatre": 15000,
  "Claims": 200,
  "Referrals": 800,
  "Consultation": 1500
};

const unitToServiceMap = {
  "OPD": "Outpatient",
  "Emergency": "Emergency",
  "Ward": "Wards",
  "ANC": "ANC and Maternity",
  "PHC": "Triage",
  "Theatre": "Theatre",
  "Triage": "Triage",
  "Laboratory": "Laboratory",
  "Pharmacy": "Pharmacy",
  "Radiology": "Radiology",
  "Immunization": "Immunization",
  "Claims": "Claims",
  "Referrals": "Referrals"
};

const insuranceCoverage = {
  "PLASCHEMA": 0.7,
  "NHIA": 0.6,
  "Basic Health Care Provision Fund": 0.9,
  "Private Pay": 0.0
};

function createAutoBill(data, patientId, serviceType, description) {
  if (!data.billing) data.billing = [];
  const patient = data.patients.find(p => p.id === patientId);
  const patientName = patient ? patient.name : "Unknown Patient";
  const insurance = patient ? patient.insurance : "Private Pay";
  
  const cost = serviceCosts[serviceType] || 1000;
  const coveragePercent = insuranceCoverage[insurance] !== undefined ? insuranceCoverage[insurance] : 0.0;
  
  const totalAmount = cost;
  const insuranceCovered = Math.round(cost * coveragePercent);
  const patientPayable = totalAmount - insuranceCovered;
  
  const bill = {
    id: nextId("BILL", data.billing),
    patientId,
    patientName,
    service: serviceType,
    description: description || `${serviceType} services rendered`,
    totalAmount,
    insuranceCovered,
    patientPayable,
    insurance,
    status: "Pending",
    date: new Date().toISOString().slice(0, 10)
  };
  
  data.billing.unshift(bill);
  return bill;
}

async function handleApi(req, res, url) {
  const data = readData();

  if (!data.consultations) data.consultations = [];
  if (!data.billing) data.billing = [];

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
      status: body.status || "Open",
      icd11Code: body.icd11Code || "",
      icd11Display: body.icd11Display || ""
    };
    data.encounters.unshift(encounter);
    
    // Auto-create bill for clinical encounter
    const serviceType = unitToServiceMap[encounter.unit] || "Outpatient";
    createAutoBill(data, encounter.patientId, serviceType, `${encounter.unit} encounter recorded: ${encounter.chiefComplaint || "Clinical services"}`);
    
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

  if (req.method === "GET" && url.pathname === "/api/icd11/search") {
    const q = url.searchParams.get("q") || "";
    sendJson(res, 200, searchIcd11(q));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/icd11/validate") {
    const body = await collectBody(req);
    sendJson(res, 200, validateIcd11Cluster(body.expression));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/consultations") {
    sendJson(res, 200, data.consultations);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/consultations") {
    const body = await collectBody(req);
    const consultation = {
      id: nextId("CNS", data.consultations),
      patientId: body.patientId,
      facilityId: body.facilityId,
      doctorName: body.doctorName || "Dr. Staff",
      specialty: body.specialty || "General Medicine",
      chiefComplaint: body.chiefComplaint || "",
      historyOfPresentingComplaint: body.historyOfPresentingComplaint || "",
      pastMedicalHistory: body.pastMedicalHistory || "",
      allergies: body.allergies || "",
      examinationFindings: body.examinationFindings || "",
      assessment: body.assessment || "",
      plan: body.plan || "",
      icd11Code: body.icd11Code || "",
      icd11Display: body.icd11Display || "",
      prescriptions: body.prescriptions || [],
      date: new Date().toISOString().slice(0, 10)
    };
    data.consultations.unshift(consultation);
    
    // Auto-create bill for consultation
    createAutoBill(data, body.patientId, "Consultation", `Doctor Consultation (${consultation.specialty})`);
    
    writeData(data);
    sendJson(res, 201, consultation);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/billing") {
    sendJson(res, 200, data.billing);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/billing") {
    const body = await collectBody(req);
    const bill = createAutoBill(data, body.patientId, body.service, body.description);
    writeData(data);
    sendJson(res, 201, bill);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/billing/status") {
    const body = await collectBody(req);
    const bill = data.billing.find(b => b.id === body.id);
    if (bill) {
      bill.status = body.status; // e.g. "Paid", "Claimed", "Waived"
      writeData(data);
      sendJson(res, 200, bill);
    } else {
      sendJson(res, 404, { error: `Bill not found: ${body.id}` });
    }
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/fhir/Condition/")) {
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 1];
    const encounter = data.encounters.find(e => e.id === id);
    if (!encounter) {
      sendJson(res, 404, { error: `Encounter not found: ${id}` });
      return;
    }
    const patient = data.patients.find(p => p.id === encounter.patientId);
    const patientName = patient ? patient.name : "Unknown Patient";
    const stemCode = encounter.icd11Code ? encounter.icd11Code.split("&")[0] : "";
    const stemTitle = encounter.icd11Display ? encounter.icd11Display.split(",")[0] : "Unspecified Diagnosis";
    const extensionCodes = encounter.icd11Code ? encounter.icd11Code.split("&").slice(1) : [];

    const fhirCondition = {
      resourceType: "Condition",
      id: encounter.id,
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: encounter.status === "Closed" ? "resolved" : "active"
          }
        ]
      },
      verificationStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
            code: "confirmed"
          }
        ]
      },
      subject: {
        reference: `Patient/${encounter.patientId}`,
        display: patientName
      },
      recordedDate: encounter.date,
      code: {
        coding: [
          {
            system: "http://id.who.int/icd/release/11/mms",
            code: stemCode || "Unspecified",
            display: stemTitle
          }
        ],
        text: encounter.icd11Display || encounter.assessment || "Unspecified Diagnosis"
      }
    };

    if (encounter.icd11Code) {
      fhirCondition.extension = [
        {
          url: "http://hl7.org/fhir/StructureDefinition/condition-icd11-postcoordination",
          extension: [
            {
              url: "clusterExpression",
              valueString: encounter.icd11Code
            },
            {
              url: "stemCode",
              valueCode: stemCode
            },
            ...extensionCodes.map(code => ({
              url: "extensionCode",
              valueCode: code
            }))
          ]
        }
      ];
    }
    sendJson(res, 200, fhirCondition);
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

  // Basic Auth Check
  const authHeader = req.headers.authorization || "";
  const b64auth = authHeader.split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64").toString().split(":");
  
  const validUser = process.env.APP_USER || "guyestguy";
  const validPass = process.env.APP_PASS || "guyestguygithub001";

  if (login !== validUser || password !== validPass) {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
    res.end("Access denied");
    return;
  }

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
