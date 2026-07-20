/**
 * SmartClinic Enterprise — Full Seed Data Generator
 * Generates rich realistic data for all 15 clinical modules
 * Run: node server/seed_enterprise.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const today = new Date();
const daysAgo = (n) => new Date(today - n * 86400000).toISOString();
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uid = (prefix, n) => `${prefix}-${String(n).padStart(4, "0")}`;

// ── Patients ─────────────────────────────────────────────────────────────────
const NAMES = [
  "Amina Bello", "Joseph Dang", "Grace Mwanret", "Ibrahim Dashe", "Esther Pam",
  "Daniel Goshit", "Miriam Bulus", "Patrick Yakubu", "Fatima Usman", "Emmanuel Gwar",
  "Rebecca Chollom", "Solomon Lalong", "Naomi Fwangje", "Moses Rwang", "Comfort Mangs",
  "Jonah Jatau", "Christiana Zango", "Elijah Dalyop", "Tabitha Nden", "Caleb Ityem",
  "Hadiza Mailafiya", "Felix Golta", "Perpetua Longtoe", "Sunday Angwe", "Ruth Dakwak"
];
const CONDITIONS = ["Hypertension", "Type 2 Diabetes", "Malaria", "HIV on ART", "Sickle Cell Disease", "TB on treatment", "None", "Asthma", "CKD Stage 3"];
const INSURANCE = ["PLASCHEMA", "NHIA", "Basic Health Care Provision Fund", "Private Pay"];
const BLOOD_GROUPS = ["A+", "B+", "O+", "AB+", "O-", "A-"];
const GENOTYPES = ["AA", "AS", "SS", "AC"];
const LGAZ = ["Jos North", "Jos South", "Pankshin", "Shendam", "Langtang North", "Wase", "Mangu", "Bassa", "Barkin Ladi"];
const FACILITIES = ["FAC-JUTH", "FAC-PLSH", "FAC-WASE", "FAC-PAN", "FAC-SHE"];

const patients = NAMES.map((name, i) => ({
  id: uid("PT", i + 1),
  name,
  age: rand(18, 78),
  sex: i % 3 === 0 ? "Female" : "Male",
  dob: daysAgo(rand(6570, 28470)).slice(0, 10),
  phone: `0${pick(["803","806","813","816","811","815","905","906"])}${String(rand(1000000, 9999999))}`,
  community: `${pick(LGAZ)} LGA`,
  lga: pick(LGAZ),
  facilityId: pick(FACILITIES),
  bloodGroup: pick(BLOOD_GROUPS),
  genotype: pick(GENOTYPES),
  nin: `NIN${String(rand(10000000000, 99999999999))}`,
  nemsasId: `NEM26-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
  insurance: pick(INSURANCE),
  chronicConditions: [pick(CONDITIONS)],
  allergies: i % 4 === 0 ? ["Penicillin"] : i % 7 === 0 ? ["NSAIDs"] : [],
  hivStatus: i % 8 === 0 ? "Positive" : "Negative",
  nextOfKin: NAMES[rand(0, NAMES.length - 1)].split(" ")[0] + " (Spouse)",
  emergencyPhone: `0803${String(rand(1000000, 9999999))}`,
  registeredAt: daysAgo(rand(30, 730)),
  lastVisit: daysAgo(rand(1, 90)),
  status: "Active"
}));

// ── Encounters ───────────────────────────────────────────────────────────────
const ICD11 = [
  { code: "BA00.0", display: "Essential Hypertension" },
  { code: "5A11", display: "Type 2 Diabetes Mellitus" },
  { code: "1D2Z", display: "Malaria, Unspecified" },
  { code: "CA22.Z", display: "Pneumonia, Unspecified" },
  { code: "MG43", display: "Sepsis, Unspecified" },
  { code: "KA21", display: "Sickle Cell Disease" },
  { code: "1C82.Z", display: "HIV Disease, Unspecified" },
  { code: "1C44.Z", display: "Tuberculosis of Lungs" },
  { code: "5B55", display: "Severe Acute Malnutrition" },
  { code: "BB22", display: "Ischaemic Stroke" }
];
const DOCTORS = ["Dr. A. Mwanret", "Dr. B. Dashe", "Dr. C. Pam", "Dr. D. Goshit", "Dr. E. Bala"];
const UNITS = ["OPD", "Emergency", "ANC", "Ward", "Triage"];
const EWS_LEVELS = ["Low Risk", "Low Risk", "Low Risk", "Moderate Risk", "High Risk"];

const encounters = [];
patients.forEach((p, i) => {
  const numEncounters = rand(1, 3);
  for (let j = 0; j < numEncounters; j++) {
    const icd = pick(ICD11);
    const enc = {
      id: uid("ENC", encounters.length + 1),
      patientId: p.id,
      facilityId: p.facilityId,
      doctor: pick(DOCTORS),
      unit: pick(UNITS),
      date: daysAgo(rand(0, 60)).slice(0, 10),
      status: rand(0, 3) === 0 ? "Open" : "Closed",
      icd11Code: icd.code,
      icd11Display: icd.display,
      assessment: icd.display,
      plan: `Management per ${icd.display} protocol. Follow-up in 2 weeks.`,
      vitals: {
        bp: `${rand(100, 170)}/${rand(60, 100)}`,
        pulse: rand(60, 110),
        temp: (rand(365, 395) / 10).toFixed(1),
        spo2: rand(92, 100),
        rr: rand(14, 22),
        weight: rand(45, 95),
        height: rand(155, 185),
        fbs: (rand(40, 120) / 10).toFixed(1)
      },
      chiefComplaint: `Patient presents with ${icd.display.toLowerCase()} symptoms`,
      ewsScore: pick(EWS_LEVELS),
      createdAt: daysAgo(rand(0, 60))
    };
    encounters.push(enc);
  }
});

// ── Lab Orders ────────────────────────────────────────────────────────────────
const LAB_TESTS = [
  { loincCode: "6690-2", name: "Full Blood Count (FBC)" },
  { loincCode: "2160-0", name: "Serum Creatinine" },
  { loincCode: "4548-4", name: "HbA1c" },
  { loincCode: "718-7", name: "Haemoglobin" },
  { loincCode: "45066-8", name: "Hepatitis B Surface Antigen" },
  { loincCode: "7917-8", name: "HIV Antibody Test" },
  { loincCode: "2085-9", name: "HDL Cholesterol" },
  { loincCode: "33037-3", name: "Total Bilirubin" }
];

const labOrders = [];
patients.slice(0, 15).forEach((p, i) => {
  const isResulted = rand(0, 1) === 1;
  const isCritical = rand(0, 5) === 0;
  const tests = [pick(LAB_TESTS), pick(LAB_TESTS)].filter((v,idx,a) => a.findIndex(t => t.loincCode === v.loincCode) === idx);
  labOrders.push({
    id: uid("LBO", i + 1),
    patientId: p.id,
    orderedBy: pick(DOCTORS),
    tests,
    priority: pick(["Routine", "Routine", "Urgent", "Stat"]),
    status: isResulted ? (isCritical ? "Critical" : "Resulted") : pick(["Ordered", "Collected", "Processing"]),
    specimenId: isResulted ? `SPEC-${rand(10000, 99999)}` : null,
    collectedAt: isResulted ? daysAgo(rand(0, 5)) : null,
    results: isResulted ? tests.map(t => ({
      loincCode: t.loincCode,
      name: t.name,
      value: (rand(10, 200) / 10).toFixed(1),
      unit: "mmol/L",
      isCritical: isCritical && rand(0, 1) === 0
    })) : [],
    criticalAlert: isCritical && isResulted,
    createdAt: daysAgo(rand(0, 14))
  });
});

// ── Radiology Orders ──────────────────────────────────────────────────────────
const MODALITIES = ["X-Ray", "Ultrasound", "CT Scan", "MRI", "Mammography"];
const RAD_STUDIES = [
  "Chest PA View", "Abdominal Ultrasound", "CT Abdomen with Contrast",
  "X-Ray Right Knee", "Cranial CT without Contrast", "Pelvis Ultrasound",
  "MRI Brain", "X-Ray Lumbar Spine", "Neck Ultrasound"
];

const radiologyOrders = patients.slice(0, 12).map((p, i) => {
  const reported = rand(0, 1) === 1;
  return {
    id: uid("RAD", i + 1),
    patientId: p.id,
    modality: pick(MODALITIES),
    studyDescription: pick(RAD_STUDIES),
    clinicalIndication: `Investigate ${pick(ICD11).display.toLowerCase()}`,
    priority: pick(["Routine", "Routine", "Urgent"]),
    status: reported ? "Reported" : pick(["Ordered", "Scheduled", "Performed"]),
    orderedBy: pick(DOCTORS),
    reportBy: reported ? pick(["Dr. Radiol. A", "Dr. Radiol. B"]) : null,
    report: reported ? "The study shows no acute pathology. Lungs are clear bilaterally. Heart size is normal. Bony structures intact. Impression: Normal chest radiograph." : "",
    aiSuggestions: reported ? [] : [],
    createdAt: daysAgo(rand(0, 21))
  };
});

// ── Theatre Bookings ──────────────────────────────────────────────────────────
const PROCEDURES = [
  "Appendicectomy", "Caesarean Section", "Hernia Repair (Open)",
  "Laparoscopic Cholecystectomy", "Open Cholecystectomy", "Total Hip Replacement",
  "Exploratory Laparotomy", "Thyroidectomy", "Myomectomy", "Prostatectomy"
];
const THEATRE_ROOMS = ["OT-1 (General)", "OT-2 (Gynaecology)", "OT-3 (Orthopaedics)", "OT-4 (Emergency)"];
const THEATRE_STATUSES = ["Scheduled", "Scheduled", "In Progress", "Completed", "Completed", "Cancelled"];
const ANAES = ["General Anaesthesia", "Spinal Anaesthesia", "Epidural", "Local with Sedation"];

const theatreBookings = patients.slice(0, 10).map((p, i) => {
  const status = pick(THEATRE_STATUSES);
  const completed = status === "Completed";
  return {
    id: uid("THR", i + 1),
    patientId: p.id,
    patientName: p.name,
    surgeonId: pick(DOCTORS),
    anaesthetistId: pick(["Dr. Anaes. A", "Dr. Anaes. B", "Dr. Anaes. C"]),
    procedure: pick(PROCEDURES),
    theatreRoom: pick(THEATRE_ROOMS),
    scheduledDate: daysAgo(rand(-7, 14)).slice(0, 10),
    estimatedDuration: pick([45, 60, 90, 120, 180]),
    priority: pick(["Elective", "Elective", "Urgent", "Emergency"]),
    status,
    anaesthesiaType: pick(ANAES),
    checklist: {
      signIn:  [{ id:"si1", item:"Patient identity confirmed", completed: true }, { id:"si2", item:"Consent obtained", completed: true }, { id:"si3", item:"Allergies checked", completed: status !== "Scheduled" }],
      timeOut: [{ id:"to1", item:"Team introduced", completed: completed }, { id:"to2", item:"Procedure confirmed", completed: completed }, { id:"to3", item:"Antibiotic given", completed: completed }],
      signOut: [{ id:"so1", item:"Procedure recorded", completed: completed }, { id:"so2", item:"Sponge count correct", completed: completed }]
    },
    operativeNotes: completed ? `Procedure performed without complications. Patient tolerated ${pick(ANAES).toLowerCase()} well. Estimated blood loss < 100mL. Wound closed in layers.` : "",
    anaesthesiaRecord: { technique: completed ? pick(ANAES) : "", agents: completed ? ["Propofol", "Suxamethonium"] : [], complications: "None", postOpPlan: completed ? "Analgesia PRN, mobilise day 1" : "" },
    implants: [],
    createdAt: daysAgo(rand(0, 30))
  };
});

// ── Referrals ─────────────────────────────────────────────────────────────────
const SPECIALTIES = ["Cardiology", "Neurology", "Oncology", "Orthopaedics", "Nephrology", "Haematology", "Gastroenterology"];
const REFERRING_TO = ["FAC-JUTH", "FAC-FMC-AB", "FAC-LUTH", "FAC-PLSH"];
const REF_STATUSES = ["Pending", "Pending", "Accepted", "Seen", "Feedback Received"];
const REF_TYPES = ["external", "internal"];

const referralRecords = patients.slice(0, 12).map((p, i) => {
  const status = pick(REF_STATUSES);
  return {
    id: uid("REF", i + 1),
    patientId: p.id,
    patientName: p.name,
    type: pick(REF_TYPES),
    fromFacility: p.facilityId,
    toFacility: pick(REFERRING_TO),
    toSpecialty: pick(SPECIALTIES),
    referringDoctor: pick(DOCTORS),
    urgency: pick(["Routine", "Routine", "Urgent", "Emergency"]),
    reason: `Patient requires specialist assessment for ${pick(ICD11).display}`,
    clinicalSummary: `${p.name}, ${p.age}/${p.sex[0]}, known ${pick(CONDITIONS)}. Requires specialist consultation.`,
    status,
    feedback: status === "Feedback Received" ? "Patient seen, management plan communicated. Continue current medications." : "",
    feedbackDate: status === "Feedback Received" ? daysAgo(rand(1, 7)) : null,
    transportPlan: "Patient to arrange transport. Ambulance available if needed.",
    letterGenerated: status !== "Pending",
    createdAt: daysAgo(rand(0, 21))
  };
});

// ── Supply / Inventory ────────────────────────────────────────────────────────
const SUPPLY_ITEMS = [
  { name: "Amoxicillin 500mg Capsules", category: "Antibiotics", unit: "tablets", reorderLevel: 200 },
  { name: "Metformin 500mg Tablets", category: "Antidiabetics", unit: "tablets", reorderLevel: 300 },
  { name: "Amlodipine 5mg Tablets", category: "Antihypertensives", unit: "tablets", reorderLevel: 200 },
  { name: "Artemether-Lumefantrine 20/120mg", category: "Antimalarials", unit: "tabs", reorderLevel: 150 },
  { name: "ORS Sachets 500ml", category: "Fluids & Electrolytes", unit: "sachets", reorderLevel: 100 },
  { name: "Paracetamol 500mg Tablets", category: "Analgesics", unit: "tablets", reorderLevel: 500 },
  { name: "Gentamicin 80mg Injection", category: "Antibiotics", unit: "vials", reorderLevel: 50 },
  { name: "Normal Saline 0.9% 500ml", category: "IV Fluids", unit: "bags", reorderLevel: 50, isColdChain: false },
  { name: "Hepatitis B Vaccine", category: "Vaccines", unit: "vials", reorderLevel: 30, isColdChain: true, minTemp: 2, maxTemp: 8 },
  { name: "OPV Vaccine", category: "Vaccines", unit: "vials", reorderLevel: 20, isColdChain: true, minTemp: -20, maxTemp: -15 },
  { name: "Latex Examination Gloves (M)", category: "Consumables", unit: "boxes", reorderLevel: 20 },
  { name: "Surgical Masks (Type IIR)", category: "PPE", unit: "boxes", reorderLevel: 10 },
  { name: "Insulin Regular 100IU/ml", category: "Antidiabetics", unit: "vials", reorderLevel: 25, isColdChain: true, minTemp: 2, maxTemp: 8 },
  { name: "Magnesium Sulphate 50% 10ml", category: "Obstetric Emergency", unit: "ampoules", reorderLevel: 30 },
  { name: "Oxytocin 10IU/ml", category: "Uterotonics", unit: "ampoules", reorderLevel: 40, isColdChain: true, minTemp: 2, maxTemp: 8 }
];

const supplyItems = SUPPLY_ITEMS.map((item, i) => {
  const qty = rand(0, 1000);
  const daysToExpiry = rand(-30, 365);
  const expiry = new Date(today.getTime() + daysToExpiry * 86400000).toISOString().slice(0, 10);
  return {
    id: uid("SUP", i + 1),
    ...item,
    isColdChain: item.isColdChain || false,
    minTemp: item.minTemp || null,
    maxTemp: item.maxTemp || null,
    quantity: qty,
    unitCost: rand(50, 5000),
    vendor: pick(["Emzor Pharma", "May & Baker", "Fidson Healthcare", "Swipha", "NAFDAC Approved Store"]),
    batchNumber: `BATCH-${String(rand(10000, 99999))}`,
    expiryDate: expiry,
    location: pick(["Main Pharmacy", "Emergency Store", "Ward C Store", "Cold Chain Room"]),
    gtin: `GTN${String(rand(100000000, 999999999))}`,
    createdAt: daysAgo(rand(60, 365))
  };
});

// ── Purchase Orders ───────────────────────────────────────────────────────────
const purchaseOrders = [
  { vendor: "Emzor Pharma Ltd", status: "Approved", totalValue: 450000, items: [{ name: "Amoxicillin 500mg", qty: 1000, unitCost: 150 }, { name: "Paracetamol 500mg", qty: 2000, unitCost: 75 }] },
  { vendor: "May & Baker Nigeria", status: "Draft", totalValue: 280000, items: [{ name: "Metformin 500mg", qty: 500, unitCost: 200 }, { name: "Amlodipine 5mg", qty: 300, unitCost: 250 }] },
  { vendor: "Federal Medical Supplies", status: "Received", totalValue: 1200000, items: [{ name: "Normal Saline 0.9%", qty: 500, unitCost: 800 }, { name: "Surgical Gloves", qty: 100, unitCost: 2500 }] },
  { vendor: "Swipha Ltd", status: "Submitted", totalValue: 680000, items: [{ name: "Artemether-Lumefantrine", qty: 1000, unitCost: 380 }, { name: "ORS Sachets", qty: 500, unitCost: 180 }] }
].map((po, i) => ({
  id: uid("PO", i + 1),
  ...po,
  requestedBy: "USR-0001",
  approvedBy: po.status !== "Draft" ? pick(DOCTORS) : null,
  requestedAt: daysAgo(rand(5, 30)),
  approvedAt: po.status !== "Draft" ? daysAgo(rand(1, 5)) : null,
  receivedAt: po.status === "Received" ? daysAgo(rand(0, 3)) : null,
  notes: "Urgent restocking required"
}));

// ── Billing ───────────────────────────────────────────────────────────────────
const CPT_MAP = [
  { code: "99213", name: "Office Visit - Established (Low)", price: 5000 },
  { code: "99214", name: "Office Visit - Established (Moderate)", price: 8000 },
  { code: "85025", name: "Complete Blood Count", price: 3500 },
  { code: "82948", name: "Blood Glucose", price: 1500 },
  { code: "71046", name: "Chest X-Ray 2 Views", price: 8000 },
  { code: "99283", name: "Emergency Dept Visit (Moderate)", price: 10000 },
  { code: "47562", name: "Laparoscopic Cholecystectomy", price: 180000 },
  { code: "G0439", name: "Annual Wellness Visit", price: 4000 }
];
const INSURANCE_COV = { "PLASCHEMA": 0.7, "NHIA": 0.6, "Basic Health Care Provision Fund": 0.9, "Private Pay": 0 };
const BILL_STATUSES = ["Paid", "Paid", "Pending", "Pending", "Claim Submitted"];

const billing = [];
patients.forEach(p => {
  const numBills = rand(1, 3);
  for (let j = 0; j < numBills; j++) {
    const cpt = pick(CPT_MAP);
    const cov = INSURANCE_COV[p.insurance] || 0;
    billing.push({
      id: `BILL-${rand(100000, 999999)}`,
      patientId: p.id,
      patientName: p.name,
      cptCode: cpt.code,
      service: cpt.name,
      description: `${cpt.name} — ${p.name}`,
      totalAmount: cpt.price,
      insurance: p.insurance,
      insuranceCovered: Math.round(cpt.price * cov),
      patientPayable: Math.round(cpt.price * (1 - cov)),
      status: pick(BILL_STATUSES),
      date: daysAgo(rand(0, 60)).slice(0, 10)
    });
  }
});

// ── Insurance Claims ──────────────────────────────────────────────────────────
const insuranceClaims = [
  { id: "CLM-0001", insurer: "PLASCHEMA", status: "Approved", totalClaimed: 245000, billCount: 12, submittedAt: daysAgo(14), approvedAt: daysAgo(7) },
  { id: "CLM-0002", insurer: "NHIA", status: "Submitted", totalClaimed: 180000, billCount: 8, submittedAt: daysAgo(5) },
  { id: "CLM-0003", insurer: "Basic Health Care Provision Fund", status: "Paid", totalClaimed: 560000, billCount: 25, submittedAt: daysAgo(30), approvedAt: daysAgo(22), paidAt: daysAgo(15) },
  { id: "CLM-0004", insurer: "PLASCHEMA", status: "Denied", totalClaimed: 95000, billCount: 5, submittedAt: daysAgo(21), denialReason: "Pre-authorisation not obtained. Resubmit with clinical justification." }
];

// ── Telehealth Sessions ───────────────────────────────────────────────────────
const SESS_STATUSES = ["ended", "ended", "ended", "waiting", "active"];
const telehealthSessions = patients.slice(0, 8).map((p, i) => {
  const status = pick(SESS_STATUSES);
  const started = status !== "waiting";
  return {
    id: `TLH-${Date.now() - i * 3600000}-DEMO`,
    patientId: p.id,
    patientName: p.name,
    doctorId: pick(DOCTORS),
    status,
    scheduledTime: daysAgo(rand(-2, 7)),
    startedAt: started ? daysAgo(rand(0, 7)) : null,
    endedAt: status === "ended" ? daysAgo(rand(0, 5)) : null,
    duration: status === "ended" ? rand(8, 35) : 0,
    roomToken: crypto.randomBytes(16).toString("hex"),
    notes: status === "ended" ? `Patient reviewed. ${pick(ICD11).display} management discussed. Prescription issued. Follow-up in 2 weeks.` : "",
    prescriptions: status === "ended" ? [{ drug: pick(["Amoxicillin 500mg", "Metformin 500mg", "Amlodipine 5mg"]), dose: "TDS × 5 days" }] : [],
    createdAt: daysAgo(rand(0, 14))
  };
});

// ── Staff Users ───────────────────────────────────────────────────────────────
const staffUsers = [
  { id: "USR-0001", username: "guyestguy", fullName: "System Administrator", role: "system_admin", email: "admin@plateaucare.gov.ng", department: "Administration", specialisation: "" },
  { id: "USR-0002", username: "dr.mwanret", fullName: "Dr. A. Mwanret", role: "doctor", email: "mwanret@plateaucare.gov.ng", department: "Internal Medicine", specialisation: "Internal Medicine" },
  { id: "USR-0003", username: "dr.dashe", fullName: "Dr. B. Dashe", role: "doctor", email: "dashe@plateaucare.gov.ng", department: "Surgery", specialisation: "General Surgery" },
  { id: "USR-0004", username: "nurse.pam", fullName: "Nurse Esther Pam", role: "nurse", email: "pam@plateaucare.gov.ng", department: "Ward A", specialisation: "" },
  { id: "USR-0005", username: "pharm.bulus", fullName: "Pharm. Miriam Bulus", role: "pharmacist", email: "bulus@plateaucare.gov.ng", department: "Pharmacy", specialisation: "" },
  { id: "USR-0006", username: "lab.gwar", fullName: "MLT Emmanuel Gwar", role: "lab_technician", email: "gwar@plateaucare.gov.ng", department: "Laboratory", specialisation: "Haematology" },
  { id: "USR-0007", username: "acct.chollom", fullName: "Rebecca Chollom", role: "accountant", email: "chollom@plateaucare.gov.ng", department: "Finance", specialisation: "" },
  { id: "USR-0008", username: "hmo.lalong", fullName: "Solomon Lalong", role: "hmo_manager", email: "lalong@plateaucare.gov.ng", department: "HMO Desk", specialisation: "" }
].map(u => ({ ...u, isActive: true, createdAt: daysAgo(rand(90, 365)), lastLogin: daysAgo(rand(0, 7)) }));

// ── Appointments ──────────────────────────────────────────────────────────────
const APT_TYPES = ["Follow-Up", "New Patient", "ANC", "Post-Op Review", "Lab Review", "Immunization"];
const APT_STATUSES = ["Confirmed", "Confirmed", "Pending", "Attended", "Cancelled"];
const appointments = patients.map((p, i) => ({
  id: uid("APT", i + 1),
  patientId: p.id,
  patientName: p.name,
  doctor: pick(DOCTORS),
  type: pick(APT_TYPES),
  date: daysAgo(rand(-14, 7)).slice(0, 10),
  time: `${String(rand(8, 16)).padStart(2,"0")}:${pick(["00","15","30","45"])}`,
  facilityId: p.facilityId,
  status: pick(APT_STATUSES),
  notes: "",
  createdAt: daysAgo(rand(1, 30))
}));

// ── Beds / Admissions ─────────────────────────────────────────────────────────
const admissions = patients.slice(0, 8).map((p, i) => ({
  id: uid("ADM", i + 1),
  patientId: p.id,
  patientName: p.name,
  ward: pick(["Ward A", "Ward B", "ICU", "Maternity", "Children's Ward", "Surgical Ward"]),
  bedNumber: `BED-${rand(1, 30)}`,
  admittedAt: daysAgo(rand(0, 14)),
  status: i < 5 ? "Active" : "Discharged",
  dischargedAt: i >= 5 ? daysAgo(rand(0, 5)) : null,
  diagnosis: pick(ICD11).display,
  admittingDoctor: pick(DOCTORS)
}));

// ── Assemble full database ────────────────────────────────────────────────────
const existingData = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf8"));

const newData = {
  ...existingData,
  patients,
  encounters,
  appointments,
  admissions: [...(existingData.admissions || []), ...admissions],
  labOrders,
  labResults: existingData.labResults || [],
  radiologyOrders,
  theatreBookings,
  referralRecords,
  supplyItems,
  purchaseOrders,
  billing,
  insuranceClaims,
  telehealthSessions,
  staffUsers,
  orders: existingData.orders || [],
  beds: existingData.beds || [],
  consultations: existingData.consultations || [],
  inventory: existingData.inventory || supplyItems.slice(0, 8).map(s => ({ ...s, quantity: s.quantity, reorderLevel: s.reorderLevel })),
  dischargeSummaries: existingData.dischargeSummaries || [],
  phcOutreach: existingData.phcOutreach || [],
  surveillance: existingData.surveillance || [],
  immunizations: existingData.immunizations || [],
  claims: existingData.claims || [],
  auditLog: []
};

fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(newData, null, 2));
console.log(`✅ Enterprise seed data written successfully!`);
console.log(`   Patients: ${patients.length}`);
console.log(`   Encounters: ${encounters.length}`);
console.log(`   Lab Orders: ${labOrders.length}`);
console.log(`   Radiology Orders: ${radiologyOrders.length}`);
console.log(`   Theatre Bookings: ${theatreBookings.length}`);
console.log(`   Referrals: ${referralRecords.length}`);
console.log(`   Supply Items: ${supplyItems.length}`);
console.log(`   Billing Records: ${billing.length}`);
console.log(`   Telehealth Sessions: ${telehealthSessions.length}`);
console.log(`   Staff Users: ${staffUsers.length}`);
