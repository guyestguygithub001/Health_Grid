/**
 * SmartClinic Enterprise Module
 * Injected into the existing Plateau EHR hybrid server
 * Namespace: /api/v1/* — no collision with existing /api/*
 * All routes, RBAC, blockchain integrity, telehealth, theatre, supply chain
 */

const crypto = require("crypto");

// ─── RBAC Roles & Permissions ────────────────────────────────────────────────
const ROLES = {
  "system_admin":    { label: "System Administrator", level: 10, permissions: ["*"] },
  "hospital_admin":  { label: "Hospital Administrator", level: 9,  permissions: ["patients.*","encounters.*","billing.*","reports.*","users.*","appointments.*","beds.*","inventory.*","theatre.*","referrals.*","telehealth.*"] },
  "doctor":          { label: "Medical Officer / Doctor", level: 7, permissions: ["patients.read","patients.update","encounters.*","prescriptions.*","orders.*","labresults.read","radiology.read","telehealth.*","referrals.*","theatre.read"] },
  "nurse":           { label: "Registered Nurse", level: 6,  permissions: ["patients.read","encounters.read","encounters.create","vitals.*","orders.read","appointments.read","beds.update","ward.*"] },
  "pharmacist":      { label: "Pharmacist", level: 6,        permissions: ["prescriptions.*","inventory.*","dispensing.*","patients.read","encounters.read"] },
  "lab_technician":  { label: "Laboratory Technician", level: 5, permissions: ["labresults.*","orders.read","patients.read","specimens.*"] },
  "radiologist":     { label: "Radiologist", level: 6,       permissions: ["radiology.*","orders.read","patients.read"] },
  "receptionist":    { label: "Receptionist / Front Desk", level: 4, permissions: ["patients.read","patients.create","appointments.*","billing.read"] },
  "accountant":      { label: "Accounts Officer", level: 5,  permissions: ["billing.*","payments.*","reports.financial"] },
  "hmo_manager":     { label: "HMO / Insurance Manager", level: 5, permissions: ["claims.*","billing.read","patients.read"] },
  "patient":         { label: "Patient (Self-Service)", level: 1, permissions: ["portal.*"] }
};

function hasPermission(userRole, resource, action) {
  const role = ROLES[userRole];
  if (!role) return false;
  const key = `${resource}.${action}`;
  return role.permissions.includes("*") ||
         role.permissions.includes(key) ||
         role.permissions.includes(`${resource}.*`);
}

// ─── Blockchain Integrity Layer ───────────────────────────────────────────────
const auditChain = [];

function hashRecord(record, prevHash) {
  const payload = JSON.stringify({ record, prevHash, timestamp: Date.now() });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function appendToChain(action, collection, recordId, performedBy, data) {
  const prevHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].hash : "GENESIS";
  const entry = {
    index: auditChain.length,
    timestamp: new Date().toISOString(),
    action,           // CREATE | UPDATE | DELETE | READ | LOGIN | DISPENSE
    collection,       // patients | encounters | billing | etc.
    recordId,
    performedBy,
    summary: typeof data === "object" ? Object.keys(data).join(",") : String(data)
  };
  entry.hash = hashRecord(entry, prevHash);
  auditChain.push(entry);
  // Keep last 10,000 entries in memory; flush older to data.auditLog array
  return entry.hash;
}

function verifyChainIntegrity() {
  for (let i = 1; i < auditChain.length; i++) {
    const entry = auditChain[i];
    const prevHash = auditChain[i - 1].hash;
    const recomputed = hashRecord({ ...entry, hash: undefined }, prevHash);
    if (recomputed !== entry.hash) {
      return { valid: false, brokenAt: i, entry };
    }
  }
  return { valid: true, chainLength: auditChain.length };
}

// ─── Namespaced SSE Channels ─────────────────────────────────────────────────
const sseNamespaces = {
  emr:        new Set(),
  pharmacy:   new Set(),
  lab:        new Set(),
  radiology:  new Set(),
  telehealth: new Set(),
  billing:    new Set(),
  admin:      new Set(),
  theatre:    new Set(),
  supply:     new Set()
};

function broadcastToNamespace(namespace, event, payload) {
  const clients = sseNamespaces[namespace];
  if (!clients) return;
  const msg = `data: ${JSON.stringify({ event, namespace, payload, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of clients) {
    try {
      client.write(msg);
    } catch (e) {
      clients.delete(client);
    }
  }
}

// Broadcast to all namespaces (backward compat with old global broadcast)
function broadcastAll(event, payload) {
  Object.keys(sseNamespaces).forEach(ns => broadcastToNamespace(ns, event, payload));
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
const rateLimitStore = new Map(); // key: ip+user, value: { count, resetAt }

function checkRateLimit(identifier, maxPerMinute = 100) {
  const now = Date.now();
  const key = identifier;
  let entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + 60000 };
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: maxPerMinute - 1 };
  }
  entry.count++;
  if (entry.count > maxPerMinute) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: maxPerMinute - entry.count };
}

// ─── Active Telehealth Sessions ───────────────────────────────────────────────
const telehealthSessions = new Map();

function createTelehealthSession(doctorId, patientId, scheduledTime) {
  const sessionId = `TLH-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const session = {
    id: sessionId,
    doctorId,
    patientId,
    status: "waiting",        // waiting | active | ended | cancelled
    scheduledTime: scheduledTime || new Date().toISOString(),
    startedAt: null,
    endedAt: null,
    duration: 0,
    roomToken: crypto.randomBytes(16).toString("hex"),
    intakeForm: null,
    notes: "",
    prescriptions: [],
    waitingRoomQueue: [],
    createdAt: new Date().toISOString()
  };
  telehealthSessions.set(sessionId, session);
  broadcastToNamespace("telehealth", "session:created", { sessionId, doctorId, patientId });
  return session;
}

// ─── CPT/HCPCS Charge Codes ───────────────────────────────────────────────────
const CPT_CODES = {
  "99201": { name: "Office Visit - New Patient (Low)", price: 3500 },
  "99202": { name: "Office Visit - New Patient (Straightforward)", price: 5000 },
  "99203": { name: "Office Visit - New Patient (Low Complexity)", price: 7500 },
  "99204": { name: "Office Visit - New Patient (Moderate)", price: 10000 },
  "99205": { name: "Office Visit - New Patient (High)", price: 15000 },
  "99211": { name: "Office Visit - Established (Nurse)", price: 1500 },
  "99212": { name: "Office Visit - Established (Low)", price: 3000 },
  "99213": { name: "Office Visit - Established (Low Complexity)", price: 5000 },
  "99214": { name: "Office Visit - Established (Moderate)", price: 8000 },
  "99215": { name: "Office Visit - Established (High)", price: 12000 },
  "99281": { name: "Emergency Dept Visit (Minor)", price: 5000 },
  "99282": { name: "Emergency Dept Visit (Low)", price: 7500 },
  "99283": { name: "Emergency Dept Visit (Moderate)", price: 10000 },
  "99284": { name: "Emergency Dept Visit (High)", price: 15000 },
  "99285": { name: "Emergency Dept Visit (High + Threats)", price: 25000 },
  "86900": { name: "Blood Grouping, ABO", price: 2000 },
  "85025": { name: "Complete Blood Count (CBC)", price: 3500 },
  "82948": { name: "Glucose, Blood (RBS/FBS)", price: 1500 },
  "81003": { name: "Urinalysis", price: 1200 },
  "87040": { name: "Blood Culture", price: 4500 },
  "71046": { name: "Chest X-Ray (2 Views)", price: 8000 },
  "74177": { name: "CT Abdomen/Pelvis w/ Contrast", price: 45000 },
  "73030": { name: "X-Ray Shoulder", price: 6000 },
  "00400": { name: "Anesthesia - Integumentary (superficial)", price: 12000 },
  "00840": { name: "Anesthesia - Intraperitoneal", price: 35000 },
  "27447": { name: "Knee Arthroplasty (Total)", price: 350000 },
  "47562": { name: "Laparoscopic Cholecystectomy", price: 180000 },
  "G0439": { name: "Annual Wellness Visit (Subsequent)", price: 4000 },
  "G0463": { name: "Hospital Outpatient Clinic Visit", price: 5000 }
};

// ─── LOINC Lab Test Codes ─────────────────────────────────────────────────────
const LOINC_TESTS = {
  "2160-0": { name: "Creatinine [Mass/Vol] in Serum", unit: "mg/dL", normalRange: "0.6-1.2", category: "Renal" },
  "3094-0": { name: "Urea nitrogen [Mass/Vol] in Serum (BUN)", unit: "mg/dL", normalRange: "7-20", category: "Renal" },
  "2951-2": { name: "Sodium [Moles/Vol] in Serum", unit: "mmol/L", normalRange: "136-145", category: "Electrolytes" },
  "2823-3": { name: "Potassium [Moles/Vol] in Serum", unit: "mmol/L", normalRange: "3.5-5.0", category: "Electrolytes" },
  "789-8":  { name: "Erythrocytes [#/Vol] in Blood (RBC)", unit: "x10^6/uL", normalRange: "4.5-5.5 (M), 4.0-5.0 (F)", category: "Haematology" },
  "6690-2": { name: "Leucocytes [#/Vol] in Blood (WBC)", unit: "x10^3/uL", normalRange: "4.5-11.0", category: "Haematology" },
  "777-3":  { name: "Platelets [#/Vol] in Blood", unit: "x10^3/uL", normalRange: "150-400", category: "Haematology" },
  "718-7":  { name: "Hemoglobin [Mass/Vol] in Blood", unit: "g/dL", normalRange: "13.5-17.5 (M), 12.0-15.5 (F)", category: "Haematology" },
  "1742-6": { name: "Alanine aminotransferase [Enzymatic activity/Vol] (ALT)", unit: "U/L", normalRange: "7-56", category: "Liver" },
  "1920-8": { name: "Aspartate aminotransferase [Enzymatic activity/Vol] (AST)", unit: "U/L", normalRange: "10-40", category: "Liver" },
  "33037-3": { name: "Total bilirubin [Mass/Vol] in Serum", unit: "mg/dL", normalRange: "0.1-1.2", category: "Liver" },
  "14804-9": { name: "Lactate dehydrogenase [Enzymatic activity/Vol]", unit: "U/L", normalRange: "140-280", category: "Cardiac" },
  "49765-1": { name: "Calcium [Moles/Vol] in Serum", unit: "mg/dL", normalRange: "8.5-10.5", category: "Electrolytes" },
  "4548-4": { name: "Hemoglobin A1c/Hemoglobin.total in Blood (HbA1c)", unit: "%", normalRange: "<5.7", category: "Diabetes" },
  "2085-9": { name: "Cholesterol in HDL [Mass/Vol] in Serum", unit: "mg/dL", normalRange: ">40 (M), >50 (F)", category: "Lipids" },
  "13457-7": { name: "Cholesterol in LDL [Mass/Vol] in Serum", unit: "mg/dL", normalRange: "<100 (optimal)", category: "Lipids" },
  "2571-8": { name: "Triglyceride [Mass/Vol] in Serum", unit: "mg/dL", normalRange: "<150", category: "Lipids" },
  "45066-8": { name: "Hepatitis B surface Ag [Presence] in Serum", unit: "Pos/Neg", normalRange: "Negative", category: "Serology" },
  "7917-8": { name: "HIV 1+2 Ab [Presence] in Serum", unit: "Pos/Neg", normalRange: "Negative", category: "Serology" },
  "5804-0": { name: "Protein [Mass/Vol] in Urine (24h)", unit: "mg/24h", normalRange: "<150", category: "Renal" }
};

// ─── WHO Surgical Safety Checklist Items ─────────────────────────────────────
const WHO_CHECKLIST = {
  signIn: [
    { id: "si1", item: "Patient identity confirmed (name, DOB, ID)", required: true },
    { id: "si2", item: "Surgical site and procedure confirmed with patient", required: true },
    { id: "si3", item: "Informed consent obtained and documented", required: true },
    { id: "si4", item: "Anaesthesia machine and medication check complete", required: true },
    { id: "si5", item: "Pulse oximeter functional and attached", required: true },
    { id: "si6", item: "Allergies: None / Known allergen stated", required: true },
    { id: "si7", item: "Aspiration risk assessed; full stomach protocol applied if needed", required: false },
    { id: "si8", item: "Blood loss risk assessed; adequate IV access and fluids available", required: true }
  ],
  timeOut: [
    { id: "to1", item: "All team members introduced by name and role", required: true },
    { id: "to2", item: "Patient name, procedure, and incision site confirmed by team", required: true },
    { id: "to3", item: "Antibiotic prophylaxis administered in last 60 minutes", required: true },
    { id: "to4", item: "Anaesthesia concerns communicated to team", required: true },
    { id: "to5", item: "Surgeon communicated: critical steps, case duration, expected blood loss", required: true },
    { id: "to6", item: "Nursing team confirmed: sterility, equipment concerns", required: true },
    { id: "to7", item: "Imaging required: displayed and available", required: false }
  ],
  signOut: [
    { id: "so1", item: "Procedure name recorded", required: true },
    { id: "so2", item: "Instrument and sponge count correct", required: true },
    { id: "so3", item: "Specimen labelled correctly", required: false },
    { id: "so4", item: "Equipment problems to address noted", required: false },
    { id: "so5", item: "Surgeon, anaesthetist and nurse reviewed key recovery concerns", required: true }
  ]
};

// ─── Helper: Generate NEMSAS-Style ID ────────────────────────────────────────
function generateNemId() {
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `NEM${year}-${rand}`;
}

// ─── Helper: MPI De-duplication Check ────────────────────────────────────────
function checkMpiDuplicate(patients, newPatient) {
  const nameSimilar = (a, b) => {
    const na = String(a).toLowerCase().replace(/\s+/g, "");
    const nb = String(b).toLowerCase().replace(/\s+/g, "");
    if (!na || !nb) return false;
    const shorter = na.length < nb.length ? na : nb;
    const longer  = na.length < nb.length ? nb : na;
    let match = 0;
    for (const ch of shorter) if (longer.includes(ch)) match++;
    return match / longer.length > 0.75;
  };

  return patients.find(p => {
    const samePhone = p.phone && newPatient.phone && p.phone === newPatient.phone;
    const sameName  = nameSimilar(p.name, newPatient.name);
    const sameNin   = p.nin && newPatient.nin && p.nin === newPatient.nin;
    return sameNin || samePhone || (sameName && p.age === newPatient.age);
  }) || null;
}

// ─── Error Response Factory ───────────────────────────────────────────────────
const ERROR_CODES = {
  "EMR-001": "Patient not found",
  "EMR-002": "Duplicate patient — MPI conflict detected",
  "EMR-003": "Encounter already closed",
  "PHR-001": "Drug interaction detected — requires clinical override",
  "PHR-002": "Insufficient stock",
  "PHR-003": "Prescription expired",
  "LAB-001": "Specimen rejected — reason required",
  "LAB-002": "Critical value — notification sent",
  "BIL-001": "Insurance authorisation required before service",
  "BIL-002": "Payment gateway timeout",
  "TLH-001": "Video session capacity exceeded",
  "TLH-002": "Patient not checked in for session",
  "SEC-001": "MFA required for this action",
  "SEC-002": "Insufficient role permissions",
  "INT-001": "FHIR resource validation failed",
  "INT-002": "External API unreachable — circuit open"
};

function errorResponse(code, detail) {
  return { success: false, error: { code, message: ERROR_CODES[code] || "Unknown error", detail: detail || null } };
}

function successResponse(data, meta) {
  return { success: true, data, meta: meta || null };
}

// ─── FHIR R6 Resource Builder ─────────────────────────────────────────────────
function buildFhirPatient(patient) {
  return {
    resourceType: "Patient",
    id: patient.id,
    meta: { versionId: "1", lastUpdated: patient.lastVisit || new Date().toISOString() },
    identifier: [
      { system: "urn:plateau-ehr:patient-id", value: patient.id },
      patient.nin ? { system: "urn:nigeria:nin", value: patient.nin } : null,
      patient.nemsasId ? { system: "urn:nigeria:nemsas", value: patient.nemsasId } : null
    ].filter(Boolean),
    active: true,
    name: [{ use: "official", text: patient.name, family: patient.name.split(" ").slice(-1)[0], given: [patient.name.split(" ")[0]] }],
    telecom: [{ system: "phone", value: patient.phone, use: "mobile" }],
    gender: patient.sex ? patient.sex.toLowerCase() : "unknown",
    birthDate: patient.dob || null,
    address: [{ use: "home", text: patient.community || patient.address || "" }],
    contact: patient.nextOfKin ? [{ name: { text: patient.nextOfKin }, telecom: [{ system: "phone", value: patient.emergencyPhone || "" }] }] : [],
    extension: [
      { url: "urn:plateau-ehr:blood-group",   valueString: patient.bloodGroup || "" },
      { url: "urn:plateau-ehr:genotype",       valueString: patient.genotype || "" },
      { url: "urn:plateau-ehr:insurance",      valueString: patient.insurance || "Private Pay" },
      { url: "urn:plateau-ehr:hiv-status",     valueString: patient.hivStatus || "Unknown" }
    ]
  };
}

function buildFhirEncounter(encounter, patient) {
  return {
    resourceType: "Encounter",
    id: encounter.id,
    status: encounter.status === "Closed" ? "finished" : "in-progress",
    class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: "AMB", display: "ambulatory" },
    subject: { reference: `Patient/${encounter.patientId}`, display: patient?.name },
    participant: [{ individual: { display: encounter.doctor || "Unknown" } }],
    period: { start: encounter.date },
    reasonCode: encounter.icd11Code ? [{ coding: [{ system: "http://id.who.int/icd/release/11/mms", code: encounter.icd11Code, display: encounter.icd11Display }] }] : []
  };
}

// ─── Main Enterprise API Handler ─────────────────────────────────────────────
async function handleEnterpriseApi(req, res, url, data, user) {
  const pathname = url.pathname;
  const method   = req.method;
  const parts    = pathname.split("/").filter(Boolean); // ["api","v1","resource",...]

  // Apply rate limiting
  const rateLimitId = `${req.socket.remoteAddress}:${user || "anon"}`;
  const rateCheck   = checkRateLimit(rateLimitId, 100);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", rateCheck.retryAfter);
    return sendEnterpriseJson(res, 429, errorResponse("TLH-001", "Too many requests. Please slow down."));
  }

  // ── FHIR R6 Endpoints ──────────────────────────────────────────────────────
  if (pathname.startsWith("/fhir/r6/")) {
    return handleFhirEndpoints(req, res, url, data, parts);
  }

  // ── Audit Chain ────────────────────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/audit/chain") {
    return sendEnterpriseJson(res, 200, successResponse(auditChain.slice(-200)));
  }
  if (method === "GET" && pathname === "/api/v1/audit/verify") {
    return sendEnterpriseJson(res, 200, successResponse(verifyChainIntegrity()));
  }
  if (method === "GET" && pathname === "/api/v1/audit/trail") {
    const userId = url.searchParams.get("userId");
    const collection = url.searchParams.get("collection");
    let entries = auditChain;
    if (userId) entries = entries.filter(e => e.performedBy === userId);
    if (collection) entries = entries.filter(e => e.collection === collection);
    return sendEnterpriseJson(res, 200, successResponse(entries.slice(-500)));
  }

  // ── RBAC / Roles ───────────────────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/roles") {
    return sendEnterpriseJson(res, 200, successResponse(Object.entries(ROLES).map(([id, r]) => ({ id, ...r }))));
  }
  if (method === "GET" && pathname === "/api/v1/users") {
    return sendEnterpriseJson(res, 200, successResponse(
      (data.staffUsers || []).map(u => ({ ...u, passwordHash: undefined }))
    ));
  }
  if (method === "POST" && pathname === "/api/v1/users") {
    const body = await collectBody(req);
    if (!body.username || !body.role || !ROLES[body.role]) {
      return sendEnterpriseJson(res, 400, errorResponse("SEC-002", "Invalid role or missing username"));
    }
    if (!data.staffUsers) data.staffUsers = [];
    const existing = data.staffUsers.find(u => u.username === body.username);
    if (existing) return sendEnterpriseJson(res, 409, errorResponse("EMR-002", "Username already exists"));
    const staffUser = {
      id: `USR-${String(data.staffUsers.length + 1).padStart(4, "0")}`,
      username: body.username,
      fullName: body.fullName || body.username,
      role: body.role,
      email: body.email || "",
      phone: body.phone || "",
      department: body.department || "",
      specialisation: body.specialisation || "",
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      passwordHash: crypto.createHash("sha256").update(body.password || "changeme123").digest("hex")
    };
    data.staffUsers.push(staffUser);
    appendToChain("CREATE", "staffUsers", staffUser.id, user, staffUser);
    await writeDataShared(data);
    return sendEnterpriseJson(res, 201, successResponse({ ...staffUser, passwordHash: undefined }));
  }

  // ── Telehealth Sessions ────────────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/telehealth/sessions") {
    const sessions = Array.from(telehealthSessions.values());
    const status = url.searchParams.get("status");
    return sendEnterpriseJson(res, 200, successResponse(
      status ? sessions.filter(s => s.status === status) : sessions
    ));
  }
  if (method === "POST" && pathname === "/api/v1/telehealth/sessions") {
    const body = await collectBody(req);
    if (!body.doctorId || !body.patientId) {
      return sendEnterpriseJson(res, 400, errorResponse("TLH-002", "doctorId and patientId are required"));
    }
    const session = createTelehealthSession(body.doctorId, body.patientId, body.scheduledTime);
    if (!data.telehealthSessions) data.telehealthSessions = [];
    data.telehealthSessions.unshift({ ...session });
    appendToChain("CREATE", "telehealthSessions", session.id, user, session);
    await writeDataShared(data);
    broadcastToNamespace("telehealth", "session:new", session);
    return sendEnterpriseJson(res, 201, successResponse(session));
  }
  if (method === "PATCH" && pathname.startsWith("/api/v1/telehealth/sessions/")) {
    const sessionId = parts[3];
    const body = await collectBody(req);
    const session = telehealthSessions.get(sessionId);
    if (!session) return sendEnterpriseJson(res, 404, errorResponse("TLH-002", "Session not found"));
    if (body.status === "active" && session.status === "waiting") {
      session.startedAt = new Date().toISOString();
    }
    if (body.status === "ended") {
      session.endedAt = new Date().toISOString();
      if (session.startedAt) {
        session.duration = Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000);
      }
    }
    Object.assign(session, body);
    // Sync to data store
    if (!data.telehealthSessions) data.telehealthSessions = [];
    const idx = data.telehealthSessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) data.telehealthSessions[idx] = { ...session };
    else data.telehealthSessions.unshift({ ...session });
    appendToChain("UPDATE", "telehealthSessions", sessionId, user, body);
    await writeDataShared(data);
    broadcastToNamespace("telehealth", "session:updated", session);
    return sendEnterpriseJson(res, 200, successResponse(session));
  }
  if (method === "POST" && pathname === "/api/v1/telehealth/intake") {
    const body = await collectBody(req);
    const session = telehealthSessions.get(body.sessionId);
    if (!session) return sendEnterpriseJson(res, 404, errorResponse("TLH-002", "Session not found"));
    session.intakeForm = { ...body.form, submittedAt: new Date().toISOString() };
    broadcastToNamespace("telehealth", "intake:received", { sessionId: body.sessionId, patientId: session.patientId });
    return sendEnterpriseJson(res, 200, successResponse({ message: "Intake form saved" }));
  }
  if (method === "GET" && pathname === "/api/v1/telehealth/waiting-room") {
    const waiting = Array.from(telehealthSessions.values()).filter(s => s.status === "waiting");
    return sendEnterpriseJson(res, 200, successResponse(waiting));
  }

  // ── Namespaced SSE Streams ─────────────────────────────────────────────────
  if (method === "GET" && pathname.startsWith("/api/v1/stream/")) {
    const ns = parts[3]; // emr | pharmacy | lab | telehealth | billing | admin | theatre
    if (!sseNamespaces[ns]) return sendEnterpriseJson(res, 404, { error: "Unknown namespace" });
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
    res.write(`data: ${JSON.stringify({ event: "connected", namespace: ns, timestamp: new Date().toISOString() })}\n\n`);
    sseNamespaces[ns].add(res);
    req.on("close", () => sseNamespaces[ns].delete(res));
    return;
  }

  // ── Theatre / Operating Room ───────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/theatre/bookings") {
    return sendEnterpriseJson(res, 200, successResponse(data.theatreBookings || []));
  }
  if (method === "POST" && pathname === "/api/v1/theatre/bookings") {
    const body = await collectBody(req);
    if (!data.theatreBookings) data.theatreBookings = [];
    const booking = {
      id: `THR-${String(data.theatreBookings.length + 1).padStart(4, "0")}`,
      patientId: body.patientId,
      surgeonId: body.surgeonId || user,
      anaesthetistId: body.anaesthetistId || "",
      procedure: body.procedure,
      procedureCode: body.procedureCode || "",
      theatreRoom: body.theatreRoom || "OT-1",
      scheduledDate: body.scheduledDate,
      estimatedDuration: body.estimatedDuration || 60,
      priority: body.priority || "Elective",
      status: "Scheduled",
      checklist: {
        signIn:  WHO_CHECKLIST.signIn.map(i => ({ ...i, completed: false })),
        timeOut: WHO_CHECKLIST.timeOut.map(i => ({ ...i, completed: false })),
        signOut: WHO_CHECKLIST.signOut.map(i => ({ ...i, completed: false }))
      },
      operativeNotes: "",
      anaesthesiaRecord: { agents: [], technique: "", complications: "", postOpPlan: "" },
      implants: [],
      cptCode: body.cptCode || "",
      createdAt: new Date().toISOString()
    };
    data.theatreBookings.unshift(booking);
    appendToChain("CREATE", "theatreBookings", booking.id, user, booking);
    await writeDataShared(data);
    broadcastToNamespace("theatre", "booking:new", booking);
    createAutoBillEnterprise(data, booking.patientId, "Theatre", `Surgical procedure: ${body.procedure}`, 15000);
    return sendEnterpriseJson(res, 201, successResponse(booking));
  }
  if (method === "PATCH" && pathname.startsWith("/api/v1/theatre/bookings/")) {
    const id = parts[4];
    const body = await collectBody(req);
    if (!data.theatreBookings) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Booking not found"));
    const bk = data.theatreBookings.find(b => b.id === id);
    if (!bk) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Booking not found"));
    Object.assign(bk, body);
    appendToChain("UPDATE", "theatreBookings", id, user, body);
    await writeDataShared(data);
    broadcastToNamespace("theatre", "booking:updated", bk);
    return sendEnterpriseJson(res, 200, successResponse(bk));
  }
  if (method === "GET" && pathname === "/api/v1/theatre/checklist-template") {
    return sendEnterpriseJson(res, 200, successResponse(WHO_CHECKLIST));
  }

  // ── Supply Chain & Inventory ───────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/supply/items") {
    const items = data.supplyItems || [];
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    let results = items;
    if (search) results = results.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.gtin && i.gtin.includes(search)));
    if (category) results = results.filter(i => i.category === category);
    // Flag low stock and expiry alerts
    const now = new Date();
    results = results.map(item => ({
      ...item,
      isLowStock: item.quantity <= item.reorderLevel,
      daysToExpiry: item.expiryDate ? Math.ceil((new Date(item.expiryDate) - now) / 86400000) : null,
      expiryAlert: item.expiryDate ? Math.ceil((new Date(item.expiryDate) - now) / 86400000) <= 30 : false
    }));
    return sendEnterpriseJson(res, 200, successResponse(results));
  }
  if (method === "POST" && pathname === "/api/v1/supply/items") {
    const body = await collectBody(req);
    if (!data.supplyItems) data.supplyItems = [];
    const item = {
      id: `SUP-${String(data.supplyItems.length + 1).padStart(4, "0")}`,
      name: body.name, category: body.category || "General", gtin: body.gtin || "",
      unit: body.unit || "unit", quantity: Number(body.quantity) || 0,
      reorderLevel: Number(body.reorderLevel) || 10, unitCost: Number(body.unitCost) || 0,
      vendor: body.vendor || "", batchNumber: body.batchNumber || "",
      expiryDate: body.expiryDate || null, location: body.location || "Main Store",
      isColdChain: body.isColdChain || false, minTemp: body.minTemp || null, maxTemp: body.maxTemp || null,
      createdAt: new Date().toISOString()
    };
    data.supplyItems.unshift(item);
    if (item.isLowStock) broadcastToNamespace("supply", "stock:low", item);
    appendToChain("CREATE", "supplyItems", item.id, user, item);
    await writeDataShared(data);
    return sendEnterpriseJson(res, 201, successResponse(item));
  }
  if (method === "POST" && pathname === "/api/v1/supply/movement") {
    const body = await collectBody(req);
    if (!data.supplyItems) data.supplyItems = [];
    if (!data.supplyMovements) data.supplyMovements = [];
    const item = data.supplyItems.find(i => i.id === body.itemId);
    if (!item) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Supply item not found"));
    const prev = item.quantity;
    if (body.type === "dispense" || body.type === "issue") {
      if (item.quantity < body.quantity) return sendEnterpriseJson(res, 400, errorResponse("PHR-002", "Insufficient stock"));
      item.quantity -= Number(body.quantity);
    } else {
      item.quantity += Number(body.quantity);
    }
    const movement = {
      id: `MOV-${Date.now()}`, itemId: body.itemId, itemName: item.name,
      type: body.type, quantity: Number(body.quantity),
      previousQty: prev, newQty: item.quantity,
      reason: body.reason || "", performedBy: user,
      timestamp: new Date().toISOString()
    };
    data.supplyMovements.unshift(movement);
    if (item.quantity <= item.reorderLevel) {
      broadcastToNamespace("supply", "stock:low", { ...item, movement });
      broadcastToNamespace("admin", "system:alert", { severity: "warning", component: "Supply Chain", message: `Low stock: ${item.name} (${item.quantity} ${item.unit} remaining)` });
    }
    appendToChain("UPDATE", "supplyItems", item.id, user, { type: body.type, qty: body.quantity });
    await writeDataShared(data);
    return sendEnterpriseJson(res, 200, successResponse(movement));
  }
  if (method === "GET" && pathname === "/api/v1/supply/purchase-orders") {
    return sendEnterpriseJson(res, 200, successResponse(data.purchaseOrders || []));
  }
  if (method === "POST" && pathname === "/api/v1/supply/purchase-orders") {
    const body = await collectBody(req);
    if (!data.purchaseOrders) data.purchaseOrders = [];
    const po = {
      id: `PO-${String(data.purchaseOrders.length + 1).padStart(4, "0")}`,
      vendor: body.vendor, items: body.items || [], totalValue: body.totalValue || 0,
      status: "Draft", requestedBy: user, approvedBy: null,
      requestedAt: new Date().toISOString(), approvedAt: null, receivedAt: null,
      notes: body.notes || ""
    };
    data.purchaseOrders.unshift(po);
    appendToChain("CREATE", "purchaseOrders", po.id, user, po);
    await writeDataShared(data);
    broadcastToNamespace("admin", "system:alert", { severity: "info", component: "Supply Chain", message: `New Purchase Order ${po.id} for ${po.vendor}` });
    return sendEnterpriseJson(res, 201, successResponse(po));
  }

  // ── Referrals ─────────────────────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/referrals") {
    return sendEnterpriseJson(res, 200, successResponse(data.referralRecords || []));
  }
  if (method === "POST" && pathname === "/api/v1/referrals") {
    const body = await collectBody(req);
    if (!data.referralRecords) data.referralRecords = [];
    const patient = (data.patients || []).find(p => p.id === body.patientId);
    if (!patient) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Patient not found for referral"));
    const referral = {
      id: `REF-${String(data.referralRecords.length + 1).padStart(4, "0")}`,
      patientId: body.patientId, patientName: patient.name,
      type: body.type || "external",    // internal | external
      fromFacility: body.fromFacility || "FAC-JUTH",
      toFacility: body.toFacility, toSpecialty: body.toSpecialty,
      referringDoctor: body.referringDoctor || user,
      urgency: body.urgency || "Routine",   // Emergency | Urgent | Routine
      reason: body.reason, clinicalSummary: body.clinicalSummary || "",
      status: "Pending",    // Pending | Accepted | Seen | Feedback Received | Declined
      feedback: "", feedbackDate: null, transportPlan: body.transportPlan || "",
      letterGenerated: false, createdAt: new Date().toISOString()
    };
    data.referralRecords.unshift(referral);
    appendToChain("CREATE", "referralRecords", referral.id, user, referral);
    await writeDataShared(data);
    broadcastToNamespace("emr", "referral:new", referral);
    return sendEnterpriseJson(res, 201, successResponse(referral));
  }
  if (method === "PATCH" && pathname.startsWith("/api/v1/referrals/")) {
    const id = parts[3];
    const body = await collectBody(req);
    if (!data.referralRecords) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Referral not found"));
    const ref = data.referralRecords.find(r => r.id === id);
    if (!ref) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Referral not found"));
    Object.assign(ref, body);
    appendToChain("UPDATE", "referralRecords", id, user, body);
    await writeDataShared(data);
    broadcastToNamespace("emr", "referral:updated", ref);
    return sendEnterpriseJson(res, 200, successResponse(ref));
  }
  if (method === "GET" && pathname === "/api/v1/referrals/partner-facilities") {
    return sendEnterpriseJson(res, 200, successResponse([
      { id: "FAC-JUTH", name: "Jos University Teaching Hospital", specialties: ["Cardiology","Neurology","Oncology","Paediatrics"], level: "Tertiary", distance: "0km" },
      { id: "FAC-PLSH", name: "Plateau State Specialist Hospital", specialties: ["Internal Medicine","Surgery","Gynaecology"], level: "Secondary", distance: "2km" },
      { id: "FAC-FMC-AB", name: "Federal Medical Centre Abuja", specialties: ["Cardiothoracic Surgery","Neurosurgery","Transplant"], level: "National Referral", distance: "325km" },
      { id: "FAC-LUTH", name: "Lagos University Teaching Hospital", specialties: ["Haematology","Radiology","Oncology"], level: "Tertiary", distance: "650km" }
    ]));
  }

  // ── Advanced Billing v2 (CPT-coded) ───────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/billing/cpt-codes") {
    const q = url.searchParams.get("q") || "";
    const codes = Object.entries(CPT_CODES).map(([code, data]) => ({ code, ...data }));
    return sendEnterpriseJson(res, 200, successResponse(
      q ? codes.filter(c => c.code.includes(q) || c.name.toLowerCase().includes(q.toLowerCase())) : codes
    ));
  }
  if (method === "POST" && pathname === "/api/v1/billing/charge") {
    const body = await collectBody(req);
    if (!data.billing) data.billing = [];
    const patient = (data.patients || []).find(p => p.id === body.patientId);
    if (!patient) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Patient not found"));
    const cpt = CPT_CODES[body.cptCode];
    const amount = cpt ? cpt.price : (body.amount || 1000);
    const bill = {
      id: `BILL-${Date.now()}`,
      patientId: body.patientId, patientName: patient.name,
      cptCode: body.cptCode || "", service: cpt ? cpt.name : (body.service || "Service"),
      description: body.description || "", totalAmount: amount,
      insurance: patient.insurance || "Private Pay",
      insuranceCovered: Math.round(amount * ({"PLASCHEMA":0.7,"NHIA":0.6,"Basic Health Care Provision Fund":0.9}[patient.insurance] || 0)),
      patientPayable: Math.round(amount * (1 - ({"PLASCHEMA":0.7,"NHIA":0.6,"Basic Health Care Provision Fund":0.9}[patient.insurance] || 0))),
      status: "Pending", date: new Date().toISOString().slice(0, 10),
      encounterId: body.encounterId || null, claimRef: null
    };
    data.billing.unshift(bill);
    appendToChain("CREATE", "billing", bill.id, user, bill);
    await writeDataShared(data);
    broadcastToNamespace("billing", "charge:new", bill);
    return sendEnterpriseJson(res, 201, successResponse(bill));
  }
  if (method === "POST" && pathname === "/api/v1/billing/payment") {
    const body = await collectBody(req);
    const bill = (data.billing || []).find(b => b.id === body.billId);
    if (!bill) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Bill not found"));
    bill.status = "Paid";
    bill.paidAt = new Date().toISOString();
    bill.paymentMethod = body.method || "Cash";
    bill.paymentRef = body.reference || `PAY-${Date.now()}`;
    appendToChain("UPDATE", "billing", bill.id, user, { status: "Paid", method: body.method });
    await writeDataShared(data);
    broadcastToNamespace("billing", "payment:confirmed", { billId: bill.id, amount: bill.patientPayable, method: bill.paymentMethod, reference: bill.paymentRef });
    return sendEnterpriseJson(res, 200, successResponse(bill));
  }
  if (method === "GET" && pathname === "/api/v1/billing/claims") {
    const claims = (data.billing || []).filter(b => b.insurance && b.insurance !== "Private Pay");
    return sendEnterpriseJson(res, 200, successResponse(claims));
  }
  if (method === "POST" && pathname === "/api/v1/billing/claims/submit") {
    const body = await collectBody(req);
    const bills = (data.billing || []).filter(b => body.billIds.includes(b.id));
    if (!data.insuranceClaims) data.insuranceClaims = [];
    const claim = {
      id: `CLM-${String(data.insuranceClaims.length + 1).padStart(4, "0")}`,
      billIds: body.billIds, insurer: body.insurer, totalClaimed: bills.reduce((s,b) => s + b.insuranceCovered, 0),
      status: "Submitted", submittedAt: new Date().toISOString(), approvedAt: null, deniedAt: null, denialReason: ""
    };
    data.insuranceClaims.unshift(claim);
    bills.forEach(b => { b.claimRef = claim.id; b.status = "Claim Submitted"; });
    appendToChain("CREATE", "insuranceClaims", claim.id, user, claim);
    await writeDataShared(data);
    broadcastToNamespace("billing", "claim:submitted", claim);
    return sendEnterpriseJson(res, 201, successResponse(claim));
  }

  // ── Lab Orders v2 (LOINC-coded) ───────────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/lab/tests") {
    const q = url.searchParams.get("q") || "";
    const tests = Object.entries(LOINC_TESTS).map(([code, t]) => ({ loincCode: code, ...t }));
    return sendEnterpriseJson(res, 200, successResponse(q ? tests.filter(t => t.name.toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase())) : tests));
  }
  if (method === "GET" && pathname === "/api/v1/lab/orders") {
    return sendEnterpriseJson(res, 200, successResponse(data.labOrders || []));
  }
  if (method === "POST" && pathname === "/api/v1/lab/orders") {
    const body = await collectBody(req);
    if (!data.labOrders) data.labOrders = [];
    const order = {
      id: `LBO-${String(data.labOrders.length + 1).padStart(4, "0")}`,
      patientId: body.patientId, encounterId: body.encounterId || null,
      orderedBy: user, tests: body.tests || [], // [{ loincCode, name }]
      priority: body.priority || "Routine",  // Stat | Routine | Urgent
      status: "Ordered",  // Ordered | Collected | Processing | Resulted | Verified
      specimenId: null, collectedAt: null, collectedBy: null,
      results: [], verifiedBy: null, verifiedAt: null,
      criticalAlert: false, createdAt: new Date().toISOString()
    };
    data.labOrders.unshift(order);
    appendToChain("CREATE", "labOrders", order.id, user, order);
    await writeDataShared(data);
    broadcastToNamespace("lab", "order:new", order);
    return sendEnterpriseJson(res, 201, successResponse(order));
  }
  if (method === "POST" && pathname === "/api/v1/lab/results") {
    const body = await collectBody(req);
    if (!data.labOrders) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Lab order not found"));
    const order = data.labOrders.find(o => o.id === body.orderId);
    if (!order) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Lab order not found"));
    order.results = body.results || [];
    order.status = "Resulted";
    order.resultedAt = new Date().toISOString();
    // Check for critical values
    order.criticalAlert = body.results.some(r => r.isCritical);
    if (order.criticalAlert) {
      broadcastToNamespace("lab", "result:critical", { orderId: order.id, patientId: order.patientId, tests: body.results.filter(r => r.isCritical) });
      broadcastToNamespace("emr", "alert:critical", { patientId: order.patientId, alertType: "Lab Critical", severity: "HIGH", message: `Critical lab result for patient ${order.patientId}` });
    } else {
      broadcastToNamespace("lab", "result:ready", { orderId: order.id, patientId: order.patientId, isCritical: false });
    }
    appendToChain("UPDATE", "labOrders", order.id, user, { status: "Resulted", criticalAlert: order.criticalAlert });
    await writeDataShared(data);
    return sendEnterpriseJson(res, 200, successResponse(order));
  }

  // ── Radiology ─────────────────────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/radiology/orders") {
    return sendEnterpriseJson(res, 200, successResponse(data.radiologyOrders || []));
  }
  if (method === "POST" && pathname === "/api/v1/radiology/orders") {
    const body = await collectBody(req);
    if (!data.radiologyOrders) data.radiologyOrders = [];
    const rOrder = {
      id: `RAD-${String(data.radiologyOrders.length + 1).padStart(4, "0")}`,
      patientId: body.patientId, encounterId: body.encounterId || null,
      modality: body.modality || "X-Ray",  // X-Ray | CT | MRI | USS | PET | Mammography
      studyDescription: body.studyDescription,
      clinicalIndication: body.clinicalIndication || "",
      priority: body.priority || "Routine",
      status: "Ordered",  // Ordered | Scheduled | Performed | Reported | Verified
      orderedBy: user, scheduledAt: null, performedAt: null,
      report: "", reportBy: null, reportAt: null,
      aiSuggestions: [],  // AI-flagged findings (never final diagnosis)
      dicomStudyId: null, imageCount: 0,
      createdAt: new Date().toISOString()
    };
    data.radiologyOrders.unshift(rOrder);
    appendToChain("CREATE", "radiologyOrders", rOrder.id, user, rOrder);
    await writeDataShared(data);
    broadcastToNamespace("radiology", "order:new", rOrder);
    createAutoBillEnterprise(data, body.patientId, "Radiology", `${body.modality}: ${body.studyDescription}`, CPT_CODES["71046"]?.price || 8000);
    return sendEnterpriseJson(res, 201, successResponse(rOrder));
  }
  if (method === "PATCH" && pathname.startsWith("/api/v1/radiology/orders/")) {
    const id = parts[4];
    const body = await collectBody(req);
    if (!data.radiologyOrders) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Radiology order not found"));
    const rOrder = data.radiologyOrders.find(r => r.id === id);
    if (!rOrder) return sendEnterpriseJson(res, 404, errorResponse("EMR-001", "Radiology order not found"));
    Object.assign(rOrder, body);
    if (body.report && body.status === "Reported") {
      broadcastToNamespace("radiology", "report:signed", { orderId: id, patientId: rOrder.patientId, reportBy: user });
    }
    appendToChain("UPDATE", "radiologyOrders", id, user, body);
    await writeDataShared(data);
    return sendEnterpriseJson(res, 200, successResponse(rOrder));
  }

  // ── Analytics Dashboard ────────────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/v1/analytics/kpi") {
    const patients   = data.patients || [];
    const encounters = data.encounters || [];
    const billing    = data.billing || [];
    const labs       = data.labOrders || [];
    const theatre    = data.theatreBookings || [];
    const referrals  = data.referralRecords || [];
    const now        = new Date();
    const thisMonth  = now.getMonth();
    const thisYear   = now.getFullYear();

    return sendEnterpriseJson(res, 200, successResponse({
      patients: { total: patients.length, thisMonth: patients.filter(p => { const d = new Date(p.lastVisit || 0); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).length },
      encounters: { total: encounters.length, open: encounters.filter(e => e.status !== "Closed").length, closed: encounters.filter(e => e.status === "Closed").length },
      revenue: {
        totalBilled:    billing.reduce((s, b) => s + (b.totalAmount || 0), 0),
        totalCollected: billing.filter(b => b.status === "Paid").reduce((s, b) => s + (b.patientPayable || 0), 0),
        pending:        billing.filter(b => b.status === "Pending").reduce((s, b) => s + (b.patientPayable || 0), 0),
        claimsSubmitted: billing.filter(b => b.status === "Claim Submitted").reduce((s, b) => s + (b.insuranceCovered || 0), 0)
      },
      labs: { total: labs.length, pending: labs.filter(l => l.status === "Ordered").length, critical: labs.filter(l => l.criticalAlert).length },
      theatre: { total: theatre.length, scheduled: theatre.filter(t => t.status === "Scheduled").length, completed: theatre.filter(t => t.status === "Completed").length },
      referrals: { total: referrals.length, pending: referrals.filter(r => r.status === "Pending").length },
      telehealth: { total: (data.telehealthSessions || []).length, active: Array.from(telehealthSessions.values()).filter(s => s.status === "active").length },
      supplyAlerts: (data.supplyItems || []).filter(i => i.quantity <= i.reorderLevel).length,
      auditChainLength: auditChain.length,
      chainIntegrity: verifyChainIntegrity().valid
    }));
  }

  if (method === "GET" && pathname === "/api/v1/analytics/diagnosis-trends") {
    const encounters = data.encounters || [];
    const diagnosisCount = {};
    encounters.forEach(e => {
      if (e.icd11Code) {
        const key = `${e.icd11Code} — ${e.icd11Display || e.assessment || "Unknown"}`;
        diagnosisCount[key] = (diagnosisCount[key] || 0) + 1;
      }
    });
    const trends = Object.entries(diagnosisCount)
      .map(([diagnosis, count]) => ({ diagnosis, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    return sendEnterpriseJson(res, 200, successResponse(trends));
  }

  if (method === "GET" && pathname === "/api/v1/analytics/revenue-by-service") {
    const billing = data.billing || [];
    const byService = {};
    billing.forEach(b => {
      const svc = b.service || "Uncategorized";
      if (!byService[svc]) byService[svc] = { service: svc, totalBilled: 0, totalCollected: 0, count: 0 };
      byService[svc].totalBilled    += b.totalAmount || 0;
      byService[svc].totalCollected += b.status === "Paid" ? (b.patientPayable || 0) : 0;
      byService[svc].count++;
    });
    return sendEnterpriseJson(res, 200, successResponse(Object.values(byService).sort((a, b) => b.totalBilled - a.totalBilled)));
  }

  // ── FHIR R6 Stub Delegation ────────────────────────────────────────────────
  if (pathname.startsWith("/fhir/r6/")) {
    return handleFhirEndpoints(req, res, url, data, parts);
  }

  // ── Not Found ──────────────────────────────────────────────────────────────
  return sendEnterpriseJson(res, 404, errorResponse("INT-001", `Enterprise endpoint ${pathname} not found`));
}

// ─── FHIR R6 Handler ─────────────────────────────────────────────────────────
async function handleFhirEndpoints(req, res, url, data, parts) {
  const resource = parts[2]; // Patient | Encounter | Observation | MedicationRequest ...
  const id       = parts[3];

  if (resource === "Patient") {
    if (!id) {
      const q = url.searchParams.get("name") || url.searchParams.get("identifier") || "";
      const patients = (data.patients || [])
        .filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.id.includes(q))
        .map(buildFhirPatient);
      return sendEnterpriseJson(res, 200, { resourceType: "Bundle", type: "searchset", total: patients.length, entry: patients.map(r => ({ resource: r })) });
    }
    const patient = (data.patients || []).find(p => p.id === id);
    if (!patient) return sendEnterpriseJson(res, 404, { resourceType: "OperationOutcome", issue: [{ severity: "error", code: "not-found", diagnostics: "Patient not found" }] });
    return sendEnterpriseJson(res, 200, buildFhirPatient(patient));
  }

  if (resource === "Encounter") {
    if (!id) {
      const encounters = (data.encounters || []).map(e => {
        const patient = (data.patients || []).find(p => p.id === e.patientId);
        return buildFhirEncounter(e, patient);
      });
      return sendEnterpriseJson(res, 200, { resourceType: "Bundle", type: "searchset", total: encounters.length, entry: encounters.map(r => ({ resource: r })) });
    }
    const enc = (data.encounters || []).find(e => e.id === id);
    if (!enc) return sendEnterpriseJson(res, 404, { resourceType: "OperationOutcome", issue: [{ severity: "error", code: "not-found" }] });
    const patient = (data.patients || []).find(p => p.id === enc.patientId);
    return sendEnterpriseJson(res, 200, buildFhirEncounter(enc, patient));
  }

  if (resource === "metadata") {
    return sendEnterpriseJson(res, 200, {
      resourceType: "CapabilityStatement", status: "active", kind: "instance",
      fhirVersion: "6.0.0-ballot1", format: ["json"],
      rest: [{
        mode: "server",
        resource: [
          { type: "Patient",    interaction: [{ code: "read" }, { code: "search-type" }, { code: "create" }] },
          { type: "Encounter",  interaction: [{ code: "read" }, { code: "search-type" }] },
          { type: "Observation",interaction: [{ code: "read" }] }
        ]
      }]
    });
  }

  return sendEnterpriseJson(res, 404, { resourceType: "OperationOutcome", issue: [{ severity: "error", code: "not-supported", diagnostics: `Resource type ${resource} not yet implemented` }] });
}

// ─── Auto-bill helper (enterprise version) ────────────────────────────────────
function createAutoBillEnterprise(data, patientId, service, description, amount) {
  if (!data.billing) data.billing = [];
  const patient = (data.patients || []).find(p => p.id === patientId);
  const coverage = { "PLASCHEMA": 0.7, "NHIA": 0.6, "Basic Health Care Provision Fund": 0.9 };
  const cov = coverage[patient?.insurance] || 0;
  const bill = {
    id: `BILL-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
    patientId, patientName: patient?.name || "Unknown",
    service, description, totalAmount: amount,
    insurance: patient?.insurance || "Private Pay",
    insuranceCovered: Math.round(amount * cov),
    patientPayable: Math.round(amount * (1 - cov)),
    status: "Pending", date: new Date().toISOString().slice(0, 10)
  };
  data.billing.unshift(bill);
  broadcastToNamespace("billing", "charge:new", bill);
  return bill;
}

// ─── JSON Response Helper ─────────────────────────────────────────────────────
function sendEnterpriseJson(res, status, body) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "X-SmartClinic-Version": "3.0",
    "X-Chain-Integrity": verifyChainIntegrity().valid ? "verified" : "compromised"
  });
  res.end(raw);
}

// ─── Collect Body (shared) ────────────────────────────────────────────────────
function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 5_000_000) reject(new Error("Body too large")); });
    req.on("end", () => { if (!raw) { resolve({}); return; } try { resolve(JSON.parse(raw)); } catch(e) { reject(e); } });
  });
}

// ─── Shared writeData reference (set from main server) ───────────────────────
let writeDataShared = async () => {};
function setWriteData(fn) { writeDataShared = fn; }

module.exports = {
  handleEnterpriseApi,
  broadcastToNamespace,
  broadcastAll,
  appendToChain,
  verifyChainIntegrity,
  generateNemId,
  checkMpiDuplicate,
  WHO_CHECKLIST,
  CPT_CODES,
  LOINC_TESTS,
  ROLES,
  hasPermission,
  setWriteData,
  errorResponse,
  successResponse
};
