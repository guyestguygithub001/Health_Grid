// ============================================================
//  PlateauCare EHR — Application JavaScript (Complete)
// ============================================================

// ── Login / Session Controller ─────────────────────────────
(function initLogin() {
  const loginScreen = document.getElementById("loginScreen");
  const loginForm   = document.getElementById("loginForm");
  const loginError  = document.getElementById("loginError");
  const loginBtn    = document.getElementById("loginBtn");

  function showLogin() {
    loginScreen.style.display = "flex";
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";
    loginError.style.display = "none";
    setTimeout(() => document.getElementById("loginUser").focus(), 50);
  }

  function hideLogin() {
    loginScreen.style.display = "none";
  }

  // Expose so api() can call it on 401
  window.showLoginScreen = showLogin;

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;
    const encoded = btoa(user + ":" + pass);
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in…";
    loginError.style.display = "none";
    try {
      const res = await fetch("/api/summary", {
        headers: { "Authorization": "Basic " + encoded, "Content-Type": "application/json" }
      });
      if (res.status === 401) {
        loginError.style.display = "block";
        loginBtn.disabled = false;
        loginBtn.textContent = "Sign In";
        return;
      }
      // Credentials valid — store and proceed
      sessionStorage.setItem("ehr_creds", encoded);
      hideLogin();
    } catch (err) {
      loginError.textContent = "Could not reach server. Please try again.";
      loginError.style.display = "block";
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign In";
    }
  });

  // On page load: check if we already have valid credentials stored
  const stored = sessionStorage.getItem("ehr_creds");
  if (!stored) {
    showLogin();
  } else {
    // Quick validate stored creds
    fetch("/api/summary", { headers: { "Authorization": "Basic " + stored } })
      .then(r => { if (r.status === 401) { sessionStorage.removeItem("ehr_creds"); showLogin(); } })
      .catch(() => { /* server may not be up yet; keep session */ });
  }
})();

const state = {
  facilities: [], patients: [], encounters: [], orders: [],
  reports: null, summary: null, consultations: [], billing: [],
  appointments: [], labResults: [], beds: [], admissions: []
};

const titles = {
  dashboard:     "State Command Dashboard",
  patients:      "Patient Registry",
  appointments:  "Appointment Scheduling",
  consultations: "Consultations (ICD-11 Active)",
  clinical:      "Clinical Units",
  beds:          "Ward & Bed Census",
  labresults:    "Laboratory Results",
  orders:        "Orders & Referrals",
  billing:       "Billing & Revenue Gateway",
  support:        "Decision Support & Clinical Tools",
  analytics:     "Analytics Dashboard",
  phc:           "PHC Network",
  reports:       "Reports & Quality",
  triage:        "Triage Station",
  emergency:     "Emergency Resus Bays",
  pharmacy:      "Pharmacy Dispensing Portal",
  radiology:     "Radiology Modality Desk",
  maternity:     "ANC & Maternity Registry",
  immunization:  "Child & Maternal Immunization",
  theatre:       "Operative Theatre Scheduler",
  referrals:     "Hospital Continuity Referrals"
};

const apiStatus = document.querySelector("#apiStatus");
const toast    = document.querySelector("#toast");

// ---------------------------------------------------------------
//  Utilities
// ---------------------------------------------------------------
function showToast(msg, duration = 2800) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

async function api(path, opts = {}) {
  const creds = sessionStorage.getItem("ehr_creds") || "";
  const headers = { "Content-Type": "application/json" };
  if (creds) headers["Authorization"] = "Basic " + creds;
  const res = await fetch(path, { headers, ...opts });
  if (res.status === 401) {
    sessionStorage.removeItem("ehr_creds");
    showLoginScreen();
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    let msg = `Server error ${res.status}`;
    try { const j = await res.clone().json(); msg = j.error || msg; } catch(_){}
    throw new Error(msg);
  }
  return res.json();
}

function patientName(id)  { return state.patients.find(p => p.id === id)?.name  || id; }
function facilityName(id) { return state.facilities.find(f => f.id === id)?.name || id; }

function badgeClass(v) {
  if (["Emergency","Escalated"].includes(v))          return "badge danger";
  if (["Urgent","Needs Sync","Rising"].includes(v))   return "badge warning";
  if (v === "Closed" || v === "Paid")                 return "badge success";
  return "badge";
}

function optionHtml(items, fn) {
  return items.map(i => `<option value="${i.id}">${fn(i)}</option>`).join("");
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function switchView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === id));
  document.querySelector("#viewTitle").textContent = titles[id] || "PlateauCare EHR";

  // Scroll view content container back to the top
  const viewEl = document.getElementById(id);
  if (viewEl) viewEl.scrollTop = 0;
}

// ---------------------------------------------------------------
//  Fill all <select> dropdowns
// ---------------------------------------------------------------
function fillSelects() {
  const fp = optionHtml(state.facilities, f => `${f.name} — ${f.lga}`);
  const pp = optionHtml(state.patients,   p => `${p.name} (${p.id})`);

  ["patientFacility","encounterFacility","orderFacility","consultationFacility","aptFacility","labFacility","admitBed","triFacility","emrFacility","phaFacility","radFacility","matFacility","immFacility","thrFacility","refFacility"].forEach(id => {
    const el = document.querySelector(`#${id}`);
    if (!el) return;
    if (id === "admitBed") {
      el.innerHTML = state.beds.filter(b => b.status === "Vacant").map(b => `<option value="${b.id}">${b.ward} — Bed ${b.bedNumber} (${b.facilityId})</option>`).join("");
    } else {
      el.innerHTML = fp;
    }
  });
  ["encounterPatient","orderPatient","consultationPatient","aptPatient","labPatient","admitPatient","triPatient","emrPatient","phaPatient","radPatient","matPatient","immPatient","thrPatient","refPatient"].forEach(id => {
    const el = document.querySelector(`#${id}`);
    if (el) el.innerHTML = pp;
  });
  // Populate lab order dropdown
  const labOrderEl = document.querySelector("#labOrder");
  if (labOrderEl) {
    labOrderEl.innerHTML = '<option value="">-- None --</option>' +
      state.orders.filter(o => o.type === "Laboratory" && o.status === "Pending").map(o => `<option value="${o.id}">${o.id} — ${o.item} (${patientName(o.patientId)})</option>`).join("");
  }
}

// ---------------------------------------------------------------
//  Render: Dashboard summary
// ---------------------------------------------------------------
function renderSummary() {
  const s = state.summary; if (!s) return;
  const el = id => document.querySelector(`#${id}`);
  if (el("metricFacilities"))  el("metricFacilities").textContent = s.facilities;
  if (el("metricPhcs"))        el("metricPhcs").textContent       = s.phcs;
  if (el("metricPatients"))    el("metricPatients").textContent   = s.patients;
  if (el("metricUrgent"))      el("metricUrgent").textContent     = s.urgentOrders + s.lowStock;
  if (el("metricAdmissions"))  el("metricAdmissions").textContent = s.activeAdmissions || 0;
  if (el("metricCriticalLabs")) el("metricCriticalLabs").textContent = s.criticalLabs || 0;
  if (el("metricCollection"))  el("metricCollection").textContent = (s.collectionRate || 0) + "%";
}

// ---------------------------------------------------------------
//  Render: Open Encounters queue
// ---------------------------------------------------------------
function renderEncounters() {
  const target = document.querySelector("#encounterList");
  if (!target) return;
  target.innerHTML = state.encounters.slice(0,6).map(enc => {
    const icd = enc.icd11Code
      ? `<div style="margin-top:5px;font-size:12px;color:var(--brand-dark);">
           <strong>ICD-11:</strong> <code>${enc.icd11Code}</code> — ${enc.icd11Display}
           <span class="fhir-badge" onclick="showFhirModal('${enc.id}')">FHIR JSON</span>
         </div>` : "";
    return `
      <article class="record reveal">
        <strong>${patientName(enc.patientId)} <span class="${badgeClass(enc.status)}">${enc.status}</span></strong>
        <span>${enc.unit} · ${facilityName(enc.facilityId)}</span>
        <span>${enc.chiefComplaint}</span>
        ${icd}
      </article>`;
  }).join("");
}

// ---------------------------------------------------------------
//  Render: Facility cards
// ---------------------------------------------------------------
function renderFacilities() {
  const target = document.querySelector("#facilityGrid");
  if (!target) return;
  target.innerHTML = state.facilities.map(f => `
    <article class="facility-card reveal">
      <h3>${f.name}</h3>
      <span>${f.type} · ${f.lga} · ${f.beds} beds</span>
      <div class="tag-row">
        <span class="${badgeClass(f.status)}">${f.status}</span>
        <span class="tag">${f.level}</span>
      </div>
      <div class="tag-row">
        ${f.services.slice(0,5).map(s => `<span class="tag">${s}</span>`).join("")}
      </div>
    </article>`).join("");
}

// ---------------------------------------------------------------
//  Render: Patient table
// ---------------------------------------------------------------
function renderPatients(filter = "") {
  const q = filter.toLowerCase();
  const patients = state.patients.filter(p =>
    [p.name,p.lga,p.community,p.risk,p.insurance].join(" ").toLowerCase().includes(q));
  document.querySelector("#patientTable").innerHTML = `
    <table><thead><tr>
      <th>ID</th><th>Patient</th><th>Location</th><th>Risk</th><th>Facility</th><th>Insurance</th><th>Actions</th>
    </tr></thead><tbody>
      ${patients.map(p => `<tr>
        <td>${p.id}</td>
        <td><strong>${p.name}</strong><br>${p.sex}, ${p.age} yrs${p.bloodGroup ? ` &bull; ${p.bloodGroup}` : ""}</td>
        <td>${p.community}<br><span style="color:var(--muted);font-size:12px;">${p.lga}</span></td>
        <td><span class="${badgeClass(p.risk==="Routine"?"Routine":"Urgent")}">${p.risk}</span></td>
        <td>${facilityName(p.facilityId)}</td>
        <td>${p.insurance}</td>
        <td>
          <button class="text-btn" onclick="showPatientTimeline('${p.id}')">Timeline</button> | 
          <button class="text-btn" style="color:var(--brand); font-weight:600;" onclick="openEditRecordModal('patients','${p.id}')">Edit</button>
        </td>
      </tr>`).join("")}
    </tbody></table>`;
}

// ---------------------------------------------------------------
//  Render: Orders queue
// ---------------------------------------------------------------
function renderOrders() {
  document.querySelector("#ordersTable").innerHTML = `
    <table><thead><tr>
      <th>Order</th><th>Patient</th><th>Type</th><th>Item</th><th>Priority</th><th>Status</th><th>Action</th>
    </tr></thead><tbody>
      ${state.orders.map(o => `<tr>
        <td>${o.id}</td>
        <td>${patientName(o.patientId)}</td>
        <td>${o.type}</td>
        <td>${o.item}</td>
        <td><span class="${badgeClass(o.priority)}">${o.priority}</span></td>
        <td>${o.status}</td>
        <td>
          <button class="text-btn" style="color:var(--brand); font-weight:600;" onclick="openEditRecordModal('orders','${o.id}')">Edit</button>
        </td>
      </tr>`).join("")}
    </tbody></table>`;
}

// ---------------------------------------------------------------
//  Render: Reports & Quality
// ---------------------------------------------------------------
function renderReports() {
  const r = state.reports; if (!r) return;
  const q = r.summary.quality;

  document.querySelector("#qualityList").innerHTML = `
    <div class="quality-row"><strong>Average wait time</strong><span>${q.avgWaitMinutes} min</span></div>
    <div class="quality-row"><strong>Triage under 10 min</strong><span>${q.triageUnder10Minutes}%</span></div>
    <div class="quality-row"><strong>Referral completion</strong><span>${q.referralCompletion}%</span></div>
    <div class="quality-row"><strong>ANC risk reviewed</strong><span>${q.ancRiskReviewed}%</span></div>`;

  document.querySelector("#facilityReport").innerHTML = `
    <table><thead><tr><th>Facility</th><th>LGA</th><th>Open Enc.</th><th>Orders</th></tr></thead><tbody>
      ${r.facilities.map(row => `<tr>
        <td>${row.name}</td><td>${row.lga}</td>
        <td>${row.openEncounters}</td><td>${row.orders}</td>
      </tr>`).join("")}
    </tbody></table>`;

  document.querySelector("#inventoryList").innerHTML = r.inventory.map(item => `
    <article class="record reveal">
      <strong>${item.item}
        <span class="${item.quantity<=item.reorderLevel?"badge danger":"badge"}">${item.quantity} left</span>
      </strong>
      <span>${facilityName(item.facilityId)}</span>
      <span>Reorder level: ${item.reorderLevel}</span>
    </article>`).join("");

  document.querySelector("#surveillanceList").innerHTML = r.surveillance.map(item => `
    <article class="signal">
      <strong>${item.condition} <span class="${badgeClass(item.trend)}">${item.trend}</span></strong>
      <span>${item.lga}: ${item.cases7d} cases/7 days</span>
      <span>${item.signal}</span>
    </article>`).join("");
}

// ---------------------------------------------------------------
//  AI output rendering
// ---------------------------------------------------------------
function renderSupportOutput(data) {
  const out = document.querySelector("#supportOutput");
  if (data.structuredSoap) {
    out.innerHTML = `
      <article class="ai-card"><strong>Quality Score: ${data.qualityScore}%</strong><p>${data.safety}</p></article>
      <article class="ai-card"><strong>Red Flags</strong>
        <ul>${(data.redFlags.length?data.redFlags:["None found."]).map(i=>`<li>${i}</li>`).join("")}</ul></article>
      <article class="ai-card"><strong>Documentation Issues</strong>
        <ul>${(data.documentationIssues.length?data.documentationIssues:["Complete."]).map(i=>`<li>${i}</li>`).join("")}</ul></article>
      <article class="ai-card"><strong>Suggestions</strong>
        <ul>${(data.suggestions.length?data.suggestions:["Continue assessment."]).map(i=>`<li>${i}</li>`).join("")}</ul></article>`;
    return;
  }
  out.innerHTML = `
    <article class="ai-card"><strong>Answer</strong><p>${data.answer}</p><small>${data.disclaimer}</small></article>
    <article class="ai-card"><strong>Suggested Actions</strong>
      <ul>${data.actions.map(i=>`<li>${i}</li>`).join("")}</ul></article>`;
}

// ---------------------------------------------------------------
//  FHIR Modal
// ---------------------------------------------------------------
async function showFhirModal(id) {
  try {
    const fhir = await api(`/api/fhir/Condition/${id}`);
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay"; overlay.id = "fhirModal";
    overlay.style.display = "flex";
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>HL7 FHIR R4 Condition</h3>
          <button type="button" onclick="document.getElementById('fhirModal').remove()" style="border:none;background:none;font-size:22px;cursor:pointer;">×</button>
        </div>
        <pre class="modal-body" style="overflow:auto;background:#0f172a;color:#e2e8f0;padding:16px;border-radius:0 0 12px 12px;font-size:13px;">${JSON.stringify(fhir,null,2)}</pre>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if(e.target===overlay) overlay.remove(); });
  } catch(err) { showToast("FHIR error: "+err.message); }
}
window.showFhirModal = showFhirModal;

// ---------------------------------------------------------------
//  ICD-11 helpers (shared across encounter + consultation forms)
// ---------------------------------------------------------------
const EXT_DEFS = {
  "XK8G": {title:"Left side",axis:"Laterality"},
  "XK9K": {title:"Right side",axis:"Laterality"},
  "XJ7ZH":{title:"Closed fracture",axis:"Fracture Type"},
  "XJ7YM":{title:"Open fracture",axis:"Fracture Type"},
  "XS2A": {title:"Mild severity",axis:"Severity"},
  "XS0T": {title:"Severe severity",axis:"Severity"}
};

function buildIcd11SearchUI(opts) {
  // opts: { searchEl, resultsEl, builderEl, extEl, exprEl, displayEl, codeHidden, displayHidden }
  const {searchEl, resultsEl, builderEl, extEl, exprEl, displayEl, codeHidden, displayHidden} = opts;
  let stemCode = null;

  function updatePreview() {
    if (!stemCode) {
      exprEl.textContent = "Unspecified"; displayEl.textContent = "Unspecified";
      codeHidden.value = ""; displayHidden.value = ""; return;
    }
    let expr = stemCode.code, disp = stemCode.title;
    extEl.querySelectorAll("input[type=radio]:checked").forEach(el => {
      if (el.value) { expr += "&"+el.value; disp += ", "+el.dataset.title; }
    });
    exprEl.textContent = expr; displayEl.textContent = disp;
    codeHidden.value = expr; displayHidden.value = disp;
  }

  function loadExtensions(codes) {
    const groups = {};
    codes.forEach(c => {
      const d = EXT_DEFS[c]; if (!d) return;
      (groups[d.axis] = groups[d.axis]||[]).push({code:c,...d});
    });
    extEl.innerHTML = Object.entries(groups).map(([axis,items]) => `
      <div class="icd11-extension-group">
        <h5>${axis}</h5>
        ${items.map(it=>`<label class="icd11-extension-option">
          <input type="radio" name="axis_${axis.replace(/\s+/g,'_')}_${Math.random().toString(36).slice(2)}" value="${it.code}" data-title="${it.title}" />
          <span>${it.title}</span></label>`).join("")}
        <label class="icd11-extension-option">
          <input type="radio" name="axis_${axis.replace(/\s+/g,'_')}_${Math.random().toString(36).slice(2)}" value="" checked />
          <span style="color:var(--muted)">None</span></label>
      </div>`).join("");
    extEl.querySelectorAll("input[type=radio]").forEach(el => el.addEventListener("change", updatePreview));
  }

  function selectStem(code, title, extCodes) {
    stemCode = {code, title};
    searchEl.value = `${code} — ${title}`;
    resultsEl.innerHTML = "";
    if (extCodes && extCodes.length && extCodes[0]) {
      builderEl.style.display = "block";
      loadExtensions(extCodes);
    } else { builderEl.style.display = "none"; }
    updatePreview();
  }

  searchEl.addEventListener("input", async e => {
    const q = e.target.value.trim();
    if (!q) { resultsEl.innerHTML = ""; return; }
    try {
      const results = await api(`/api/icd11/search?q=${encodeURIComponent(q)}`);
      resultsEl.innerHTML = results.map(r =>
        `<div class="icd11-result-item" data-code="${r.code}" data-title="${r.title}" data-ext="${r.allowedExtensions.join(',')}">
           <strong>${r.code}</strong> — ${r.title}
         </div>`).join("");
      resultsEl.querySelectorAll(".icd11-result-item").forEach(el => {
        el.addEventListener("click", () => selectStem(el.dataset.code, el.dataset.title,
          el.dataset.ext ? el.dataset.ext.split(",") : []));
      });
    } catch(err) { console.error(err); }
  });

  return {
    reset() {
      stemCode = null; searchEl.value = ""; resultsEl.innerHTML = "";
      builderEl.style.display = "none"; updatePreview();
    }
  };
}

// ---------------------------------------------------------------
//  Wire Encounter Form ICD-11
// ---------------------------------------------------------------
let icd11EncounterCtrl = null;
const encSearchEl = document.querySelector("#icd11Search");
if (encSearchEl) {
  icd11EncounterCtrl = buildIcd11SearchUI({
    searchEl: encSearchEl,
    resultsEl: document.querySelector("#icd11Results"),
    builderEl: document.querySelector("#icd11Builder"),
    extEl:     document.querySelector("#icd11Extensions"),
    exprEl:    document.querySelector("#icd11ExpressionPreview"),
    displayEl: document.querySelector("#icd11DisplayPreview"),
    codeHidden:    document.querySelector("#icd11CodeHidden"),
    displayHidden: document.querySelector("#icd11DisplayHidden")
  });
}

// ---------------------------------------------------------------
//  Wire Consultation Form ICD-11
// ---------------------------------------------------------------
let icd11ConsultCtrl = null;
const conSearchEl = document.querySelector("#consultationIcd11Search");
if (conSearchEl) {
  icd11ConsultCtrl = buildIcd11SearchUI({
    searchEl: conSearchEl,
    resultsEl: document.querySelector("#consultationIcd11Results"),
    builderEl: document.querySelector("#consultationIcd11Builder"),
    extEl:     document.querySelector("#consultationIcd11Extensions"),
    exprEl:    document.querySelector("#consultationIcd11ExpressionPreview"),
    displayEl: document.querySelector("#consultationIcd11DisplayPreview"),
    codeHidden:    document.querySelector("#consultationIcd11CodeHidden"),
    displayHidden: document.querySelector("#consultationIcd11DisplayHidden")
  });
}

// ---------------------------------------------------------------
//  Load data from server
// ---------------------------------------------------------------
async function loadData() {
  try {
    apiStatus.textContent = "Online";
    apiStatus.style.background = "#e0f2fe";
    [state.summary, state.facilities, state.patients, state.encounters,
     state.orders, state.reports, state.consultations, state.billing] = await Promise.all([
      api("/api/summary"), api("/api/facilities"), api("/api/patients"),
      api("/api/encounters"), api("/api/orders"), api("/api/reports"),
      api("/api/consultations"), api("/api/billing")
    ]);
    fillSelects();
    renderSummary(); renderEncounters(); renderFacilities();
    renderPatients(document.querySelector("#patientSearch")?.value||"");
    renderOrders(); renderReports(); renderConsultations(); renderBilling();
  } catch(err) {
    apiStatus.textContent = "Offline";
    apiStatus.style.background = "#ffe4e6";
    showToast("Backend not reachable. Check server.");
  }
}

// ---------------------------------------------------------------
//  Navigation
// ---------------------------------------------------------------
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});
document.querySelectorAll("[data-view-jump]").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.viewJump));
});
// Sidebar manual toggle listener
const sidebarToggleBtn = document.querySelector("#sidebarToggleBtn");
if (sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener("click", () => {
    document.querySelector(".app-shell").classList.toggle("sidebar-collapsed");
  });
}
document.querySelector("#refreshBtn").addEventListener("click", loadData);

// ---------------------------------------------------------------
//  Patient search
// ---------------------------------------------------------------
document.querySelector("#patientSearch").addEventListener("input", e => renderPatients(e.target.value));

// ---------------------------------------------------------------
//  Register Patient
// ---------------------------------------------------------------
document.querySelector("#patientForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = e.currentTarget.querySelector("button[type=submit]");
  const formData = formToObject(e.currentTarget);
  if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }
  try {
    const saved = await api("/api/patients", { method: "POST", body: JSON.stringify(formData) });
    e.currentTarget.reset();
    // Show the patient their portal login credentials
    const phone = formData.phone || "(not provided)";
    const patId  = saved.id || "PT-????";
    showToast(`✅ Registered! Portal login — Phone: ${phone} | Password: ${patId}`, 6000);
    await loadData();
  } catch (err) {
    showToast("❌ Save failed: " + err.message);
    console.error("Patient save error:", err);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Save Patient"; }
  }
});

// ---------------------------------------------------------------
//  New Encounter submit
// ---------------------------------------------------------------
document.querySelector("#encounterForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = formToObject(e.currentTarget);
  const payload = {
    patientId:f.patientId, facilityId:f.facilityId, unit:f.unit,
    chiefComplaint:f.chiefComplaint,
    vitals:{temperature:f.temperature,bp:f.bp,pulse:f.pulse,respiration:f.respiration,spo2:f.spo2,weight:f.weight},
    assessment:f.assessment, plan:f.plan,
    icd11Code:f.icd11Code||"", icd11Display:f.icd11Display||""
  };
  await api("/api/encounters", {method:"POST", body:JSON.stringify(payload)});
  e.currentTarget.reset();
  if (icd11EncounterCtrl) icd11EncounterCtrl.reset();
  showToast("Encounter saved & bill generated."); await loadData();
});

document.querySelector("#scrubEncounterBtn").addEventListener("click", async () => {
  const f = formToObject(document.querySelector("#encounterForm"));
  const result = await api("/api/support/scrub", {method:"POST", body:JSON.stringify({
    chiefComplaint:f.chiefComplaint, assessment:f.assessment, plan:f.plan,
    vitals:{temperature:f.temperature,bp:f.bp,pulse:f.pulse,respiration:f.respiration,spo2:f.spo2,weight:f.weight}
  })});
  switchView("ai"); renderSupportOutput(result);
});

// ---------------------------------------------------------------
//  Create Order
// ---------------------------------------------------------------
document.querySelector("#orderForm").addEventListener("submit", async e => {
  e.preventDefault();
  await api("/api/orders", {method:"POST", body:JSON.stringify(formToObject(e.currentTarget))});
  e.currentTarget.reset(); showToast("Order created."); await loadData();
});

// ---------------------------------------------------------------
//  Clinical Note Audit Form
// ---------------------------------------------------------------
document.querySelector("#supportScrubForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = formToObject(e.currentTarget);
  const result = await api("/api/support/scrub", {method:"POST", body:JSON.stringify({
    chiefComplaint:f.chiefComplaint, assessment:f.assessment, plan:f.plan,
    vitals:{temperature:f.temperature,bp:f.bp,pulse:f.pulse,respiration:f.respiration,spo2:f.spo2}
  })});
  renderSupportOutput(result);
});

// ---------------------------------------------------------------
//  Clinical Inquiry Form
// ---------------------------------------------------------------
document.querySelector("#supportInquiryForm").addEventListener("submit", async e => {
  e.preventDefault();
  const result = await api("/api/support/inquiry", {method:"POST", body:JSON.stringify(formToObject(e.currentTarget))});
  renderSupportOutput(result);
});

// ---------------------------------------------------------------
//  CONSULTATION MODULE
// ---------------------------------------------------------------

// Repeatable prescription rows
const addPrescBtn = document.querySelector("#addPrescriptionBtn");
const prescList   = document.querySelector("#prescriptionList");
if (addPrescBtn) {
  addPrescBtn.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "presc-row";
    row.innerHTML = `
      <input class="presc-drug"     placeholder="Drug name"        required style="flex:2;"/>
      <input class="presc-dose"     placeholder="Dose (e.g.500mg)" required style="flex:1;"/>
      <input class="presc-freq"     placeholder="Frequency (TDS)"  required style="flex:1;"/>
      <input class="presc-duration" placeholder="Duration"         required style="flex:1;"/>
      <button type="button" class="rm-presc" onclick="this.closest('.presc-row').remove()">×</button>`;
    prescList.appendChild(row);
  });
}

// Consultation form submit
const consultationForm = document.querySelector("#consultationForm");
if (consultationForm) {
  consultationForm.addEventListener("submit", async e => {
    e.preventDefault();
    const f = formToObject(e.currentTarget);
    const prescriptions = [];
    document.querySelectorAll(".presc-row").forEach(row => {
      const d = row.querySelector(".presc-drug")?.value;
      if (d) prescriptions.push({
        drug:d,
        dose:row.querySelector(".presc-dose").value,
        frequency:row.querySelector(".presc-freq").value,
        duration:row.querySelector(".presc-duration").value
      });
    });
    const payload = {
      patientId:f.patientId, facilityId:f.facilityId,
      doctorName:f.doctorName, specialty:f.specialty,
      chiefComplaint:f.chiefComplaint,
      historyOfPresentingComplaint:f.historyOfPresentingComplaint||"",
      pastMedicalHistory:f.pastMedicalHistory||"",
      examinationFindings:f.examinationFindings||"",
      vitals: {
        temperature: f.temperature || "",
        bp: f.bp || "",
        pulse: f.pulse || "",
        respiration: f.respiration || "",
        spo2: f.spo2 || "",
        weight: f.weight || ""
      },
      socialHistory: f.socialHistory || "",
      assessment: f.assessment, plan: f.plan,
      icd11Code: f.icd11Code || "", icd11Display: f.icd11Display || "",
      prescriptions
    };
    try {
      await api("/api/consultations", {method:"POST", body:JSON.stringify(payload)});
      showToast("Consultation saved & bill generated.");
      e.currentTarget.reset();
      if (prescList) prescList.innerHTML = "";
      if (icd11ConsultCtrl) icd11ConsultCtrl.reset();
      await loadData();
    } catch(err) { showToast("Save failed: "+err.message); }
  });
}

function renderConsultations() {
  const target = document.querySelector("#consultationList");
  if (!target) return;
  if (!state.consultations.length) {
    target.innerHTML = `<p style="text-align:center;color:var(--muted);padding:20px;">No consultations yet.</p>`;
    return;
  }
  target.innerHTML = state.consultations.map(c => {
    const icd = c.icd11Code
      ? `<div style="margin-top:5px;font-size:12px;color:var(--brand-dark);">
           <strong>ICD-11:</strong> <code>${c.icd11Code}</code> — ${c.icd11Display}
           <span class="fhir-badge" onclick="showFhirModal('${c.id}')">FHIR</span>
           <span class="fhir-badge" style="background:var(--brand); color:#fff; cursor:pointer;" onclick="openEditRecordModal('consultations','${c.id}')">Edit</span>
         </div>` : `<div style="margin-top:5px;"><span class="fhir-badge" style="background:var(--brand); color:#fff; cursor:pointer;" onclick="openEditRecordModal('consultations','${c.id}')">Edit Consultation</span></div>`;
    const rx = c.prescriptions?.length
      ? `<div style="margin-top:6px;font-size:12px;background:#f1f5f9;padding:8px;border-radius:6px;">
           <strong style="font-size:10px;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:4px;">Rx:</strong>
           ${c.prescriptions.map(p=>`• <strong>${p.drug}</strong> ${p.dose} ${p.frequency} × ${p.duration}`).join("<br>")}
         </div>` : "";
    return `
      <article class="record reveal">
        <div style="display:flex;justify-content:space-between;">
          <strong>${patientName(c.patientId)}</strong>
          <span style="font-size:11px;color:var(--muted);">${c.date}</span>
        </div>
        <span style="font-size:12px;color:var(--muted);">Dr. ${c.doctorName} · ${c.specialty} · ${facilityName(c.facilityId)}</span>
        <p style="margin:5px 0 0;font-size:13px;"><strong>CC:</strong> ${c.chiefComplaint}</p>
        ${icd}${rx}
      </article>`;
  }).join("");
}

// ---------------------------------------------------------------
//  BILLING GATEWAY
// ---------------------------------------------------------------
async function updateBillStatus(id, status) {
  try {
    await api("/api/billing/status", {method:"POST", body:JSON.stringify({id, status})});
    showToast(`Bill marked as ${status}`); await loadData();
  } catch(err) { showToast("Update failed: "+err.message); }
}
window.updateBillStatus = updateBillStatus;

function renderBilling(filter = "") {
  const tbl  = document.querySelector("#billingTable");
  const oEl  = document.querySelector("#billingOutstanding");
  const cEl  = document.querySelector("#billingCollected");
  const clEl = document.querySelector("#billingClaims");
  const ttEl = document.querySelector("#billingTotal");
  if (!tbl) return;

  let outstanding=0, collected=0, claims=0, total=0;
  (state.billing||[]).forEach(b => {
    total += b.totalAmount;
    if (b.status==="Pending")  { outstanding+=b.patientPayable; claims+=b.insuranceCovered; }
    if (b.status==="Paid")     { collected+=b.patientPayable; claims+=b.insuranceCovered; }
    if (b.status==="Claimed")  { collected+=b.totalAmount; }
  });
  if (oEl) oEl.textContent  = `₦${outstanding.toLocaleString()}`;
  if (cEl) cEl.textContent  = `₦${collected.toLocaleString()}`;
  if (clEl) clEl.textContent= `₦${claims.toLocaleString()}`;
  if (ttEl) ttEl.textContent= `₦${total.toLocaleString()}`;

  const q = filter.toLowerCase();
  const bills = (state.billing||[]).filter(b =>
    [b.id,b.patientName,b.service,b.status,b.insurance].join(" ").toLowerCase().includes(q));

  if (!bills.length) {
    tbl.innerHTML = `<p style="text-align:center;color:var(--muted);padding:30px;">No billing records yet. Service any patient to generate invoices.</p>`;
    return;
  }

  tbl.innerHTML = `<table>
    <thead><tr>
      <th>Bill ID</th><th>Patient</th><th>Service</th><th>Insurance</th>
      <th>Total</th><th>Coverage</th><th>Patient Due</th><th>Status</th><th>Action</th>
    </tr></thead>
    <tbody>
    ${bills.map(b => {
      const sBadge = {Pending:"badge warning",Paid:"badge success",Claimed:"badge",Waived:"badge"}[b.status]||"badge";
      const actions = b.status==="Pending"
        ? `<button class="bill-btn" onclick="updateBillStatus('${b.id}','Paid')">Pay</button>
           ${b.insurance!=="Private Pay"?`<button class="bill-btn claim" onclick="updateBillStatus('${b.id}','Claimed')">Claim</button>`:""}
           <button class="bill-btn waive" onclick="updateBillStatus('${b.id}','Waived')">Waive</button>`
        : `<span class="settled-lbl">Settled</span>`;
      return `<tr>
        <td><strong>${b.id}</strong><br><small>${b.date}</small></td>
        <td><strong>${b.patientName}</strong><br><small>${b.patientId}</small></td>
        <td><strong>${b.service}</strong><br><small style="color:var(--muted);font-size:11px;">${b.description}</small></td>
        <td><span class="tag">${b.insurance}</span></td>
        <td><strong>₦${b.totalAmount.toLocaleString()}</strong></td>
        <td style="color:var(--success);font-weight:700;">₦${b.insuranceCovered.toLocaleString()}</td>
        <td style="color:var(--danger);font-weight:700;">₦${b.patientPayable.toLocaleString()}</td>
        <td><span class="${sBadge}">${b.status}</span></td>
        <td class="bill-actions">
          ${actions}
          <button class="bill-btn" style="background:var(--brand); color:#fff; margin-left:4px;" onclick="openEditRecordModal('billing','${b.id}')">Edit</button>
        </td>
      </tr>`;
    }).join("")}
    </tbody></table>`;
}

const billingSearchEl = document.querySelector("#billingSearch");
if (billingSearchEl) {
  billingSearchEl.addEventListener("input", e => renderBilling(e.target.value));
}

// ---------------------------------------------------------------
//  CLINICAL UNIT MODALS — 12 Modules
// ---------------------------------------------------------------
const unitModal     = document.querySelector("#unitModal");
const unitModalTitle= document.querySelector("#unitModalTitle");
const unitFormWrap  = document.querySelector("#unitFormContent");
const unitModalForm = document.querySelector("#unitModalForm");

// Shared patient + facility selector HTML
function modalSelectors(code) {
  return `
    <input type="hidden" name="unit" value="${code}" />
    <div class="form-row">
      <label>Patient Name
        <select id="mp_${code}" name="patientId" required
          style="width:100%; min-width:0; max-width:100%; font-size:13px;"></select>
      </label>
      <label>Facility
        <select id="mf_${code}" name="facilityId" required></select>
      </label>
    </div>`;
}

// ICD-11 mini block for OPD modal
const opdIcd11Block = `
  <div style="background:#f1f5f9;border-radius:8px;padding:12px;margin-bottom:12px;">
    <span class="eyebrow" style="margin-bottom:6px;">ICD-11 Diagnosis</span>
    <input id="modalIcd11SearchInput" type="text" placeholder="Type to search (e.g. malaria)…" autocomplete="off"
      style="width:100%;padding:9px;border:1px solid var(--line);border-radius:6px;margin-top:4px;"/>
    <div id="modalIcd11Results" class="icd11-search-results"></div>
    <div style="margin-top:6px;padding:8px;border:1px dashed var(--brand);border-radius:6px;font-size:13px;">
      <strong>Code:</strong> <code id="modalIcd11Preview">—</code>
      <input type="hidden" name="icd11Code"    id="modalIcd11Code"/>
      <input type="hidden" name="icd11Display" id="modalIcd11Display"/>
    </div>
  </div>`;

const unitDefs = {
  TRI: {
    label: "Triage",
    form: code => `
      ${modalSelectors("Triage")}
      <div class="vitals-grid">
        <label>Temp (°C)<input name="temperature" type="number" step="0.1" placeholder="e.g. 36.8"/></label>
        <label>BP (mmHg)<input name="bp" placeholder="e.g. 120/80"/></label>
        <label>Pulse (bpm)<input name="pulse" type="number" placeholder="e.g. 80"/></label>
        <label>Resp (/min)<input name="respiration" type="number" placeholder="e.g. 18"/></label>
        <label>SpO2 (%)<input name="spo2" type="number" placeholder="e.g. 98"/></label>
        <label>Weight (kg)<input name="weight" type="number" step="0.1" placeholder="e.g. 70"/></label>
      </div>
      <label>Triage Priority
        <select name="status">
          <option value="">— Select priority level —</option>
          <option value="Open">Priority 4 — Stable / Non-urgent (Green)</option>
          <option value="Urgent">Priority 3 — Urgent (Yellow)</option>
          <option value="Urgent">Priority 2 — Very Urgent (Orange)</option>
          <option value="Emergency">Priority 1 — Immediate Resuscitation (Red)</option>
          <option value="Emergency">Priority 0 — Expectant / Deceased (Black)</option>
        </select>
      </label>
      <label>Presenting Complaint / Danger Signs
        <textarea name="chiefComplaint" rows="3" placeholder="Enter presenting symptoms, danger signs, mechanism of injury..." required></textarea>
      </label>
      <label>Triage Nurse Assessment
        <textarea name="assessment" rows="2" placeholder="Enter primary survey findings, AVPU score, initial observations..."></textarea>
      </label>
      <label>Routing &amp; Initial Action Plan
        <textarea name="plan" rows="2" placeholder="Enter routing decision, initial interventions, physician alerted..."></textarea>
      </label>`
  },
  OPD: {
    label: "Outpatient",
    form: code => `
      ${modalSelectors("OPD")}
      <label>Chief Complaint
        <textarea name="chiefComplaint" rows="2" placeholder="Presenting symptoms and duration" required></textarea>
      </label>
      <div class="vitals-grid">
        <label>Temp<input name="temperature" type="number" step="0.1" placeholder="37.0"/></label>
        <label>BP<input name="bp" placeholder="120/80"/></label>
        <label>Pulse<input name="pulse" type="number" placeholder="80"/></label>
        <label>Resp<input name="respiration" type="number" placeholder="18"/></label>
        <label>SpO2<input name="spo2" type="number" placeholder="98"/></label>
        <label>Weight<input name="weight" type="number" step="0.1" placeholder="70"/></label>
      </div>
      <label>Assessment / Working Diagnosis
        <textarea name="assessment" rows="2" placeholder="Clinical reasoning and findings" required></textarea>
      </label>
      ${opdIcd11Block}
      <label>Management Plan
        <textarea name="plan" rows="2" placeholder="Prescriptions, labs, follow-up date"></textarea>
      </label>`
  },
  EMR: {
    label: "Emergency",
    form: code => `
      ${modalSelectors("Emergency")}
      <div class="form-row">
        <label>Level
          <select name="status">
            <option value="Emergency">Level 1 — Code Red Resus</option>
            <option value="Urgent">Level 2 — Critical</option>
            <option value="Open">Level 3 — Semi-urgent</option>
          </select>
        </label>
        <label>GCS Score (3–15)
          <input name="gcs" type="number" min="3" max="15" placeholder="e.g. 15"/>
        </label>
      </div>
      <label>Mechanism / Chief Complaint
        <textarea name="chiefComplaint" rows="2" placeholder="Trauma, RTA, chest pain, stroke..." required></textarea>
      </label>
      <div class="vitals-grid">
        <label>Temp<input name="temperature" type="number" step="0.1" placeholder="36.8"/></label>
        <label>BP<input name="bp" placeholder="120/80"/></label>
        <label>Pulse<input name="pulse" type="number" placeholder="100"/></label>
        <label>SpO2<input name="spo2" type="number" placeholder="96"/></label>
      </div>
      <label>Primary Survey (ABCDE)
        <textarea name="assessment" rows="2" placeholder="Airway patent, IV access x2, fluid bolus given" required></textarea>
      </label>
      <label>Disposition Plan
        <textarea name="plan" rows="2" placeholder="Admit ICU, emergency surgery booking, obs q15min"></textarea>
      </label>`
  },
  IPD: {
    label: "Ward Admission",
    form: code => `
      ${modalSelectors("Ward")}
      <div class="form-row">
        <label>Ward / Unit
          <select name="ward">
            <option value="">— Select ward —</option>
            <option>General Male Ward</option>
            <option>General Female Ward</option>
            <option>Surgical Ward (Male/Female)</option>
            <option>Paediatric Ward</option>
            <option>Paediatric Isolation / HDU</option>
            <option>Neonatal ICU (NICU)</option>
            <option>Intensive Care Unit (ICU)</option>
            <option>Maternity / Postnatal Ward</option>
            <option>Gynaecological Ward</option>
            <option>Orthopaedic Ward</option>
            <option>Infectious Disease / Isolation</option>
            <option>Burns &amp; Plastics</option>
            <option>Psychiatric Ward</option>
            <option>Oncology Ward</option>
            <option>Ophthalmic Ward</option>
            <option>ENT Ward</option>
            <option>Dermatology Ward</option>
            <option>Renal / Dialysis Unit</option>
            <option>Cardiac Care Unit (CCU)</option>
            <option>Labour Ward (Delivery Suite)</option>
            <option>Observation Ward (A&amp;E Short stay)</option>
            <option>Private Suite / VIP Ward</option>
          </select>
        </label>
        <label>Bed Number<input name="bed" placeholder="e.g. 12-B" required/></label>
      </div>
      <label>Admitting Diagnosis / Reason
        <textarea name="chiefComplaint" rows="2" placeholder="Clinical justification for admission" required></textarea>
      </label>
      <label>Physician Assessment
        <textarea name="assessment" rows="2" placeholder="Stable, IV antibiotics started, post-op day 1" required></textarea>
      </label>
      <label>Nursing & Medical Plan
        <textarea name="plan" rows="2" placeholder="IV fluids, vitals q4h, wound care, ambulate tomorrow"></textarea>
      </label>`
  },
  LAB: {
    label: "Laboratory",
    form: code => `
      ${modalSelectors("Laboratory")}
      <div class="form-row">
        <label>Test Category &amp; Name
          <select name="chiefComplaint" required>
            <option value="">— Select test —</option>
            <optgroup label="🔴 Haematology">
              <option>Full Blood Count (FBC) / CBC</option>
              <option>Peripheral Blood Film / Malaria Microscopy (Thick &amp; Thin)</option>
              <option>Malaria Rapid Diagnostic Test (mRDT)</option>
              <option>Erythrocyte Sedimentation Rate (ESR)</option>
              <option>Reticulocyte Count</option>
              <option>Blood Group &amp; Rhesus Factor (Grouping)</option>
              <option>Haemoglobin Electrophoresis / Sickling Test (HbS)</option>
              <option>Prothrombin Time (PT) / INR / Clotting Profile</option>
              <option>Activated Partial Thromboplastin Time (aPTT)</option>
              <option>D-Dimer (PE / DVT / DIC screening)</option>
              <option>Cross-Match &amp; Blood Compatibility</option>
            </optgroup>
            <optgroup label="🟡 Biochemistry / Clinical Chemistry">
              <option>Random Blood Glucose (RBG)</option>
              <option>Fasting Blood Glucose (FBG)</option>
              <option>2-Hour Post-Prandial Glucose (2-hr PPG)</option>
              <option>HbA1c — Glycated Haemoglobin</option>
              <option>Urea, Electrolytes &amp; Creatinine (U&amp;E / RFT)</option>
              <option>eGFR — Estimated Glomerular Filtration Rate</option>
              <option>Liver Function Tests (LFT) — ALT, AST, ALP, GGT, Bilirubin</option>
              <option>Total Protein &amp; Albumin</option>
              <option>Lipid Profile — Total Cholesterol, TG, HDL, LDL</option>
              <option>Serum Uric Acid</option>
              <option>Serum Calcium, Phosphate &amp; Magnesium</option>
              <option>Serum Amylase &amp; Lipase (Pancreatitis)</option>
              <option>Serum Lactate (Sepsis / Shock)</option>
              <option>Serum Sodium, Potassium, Chloride, Bicarbonate</option>
              <option>CRP — C-Reactive Protein (Inflammation)</option>
              <option>Procalcitonin (Sepsis Marker)</option>
              <option>Serum Iron, TIBC &amp; Ferritin</option>
              <option>Vitamin B12 &amp; Folate</option>
              <option>Vitamin D (25-OH Cholecalciferol)</option>
            </optgroup>
            <optgroup label="🟢 Microbiology / Infectious Disease">
              <option>HIV 1 &amp; 2 Rapid Antibody Test</option>
              <option>CD4 Count (HIV Staging)</option>
              <option>Hepatitis B Surface Antigen (HBsAg)</option>
              <option>Hepatitis B e-Antigen (HBeAg)</option>
              <option>Hepatitis C Antibody (Anti-HCV)</option>
              <option>VDRL / RPR — Syphilis Serology</option>
              <option>Widal Test — Typhoid Fever (Salmonella)</option>
              <option>Brucella Agglutination Test</option>
              <option>Sputum AFB Smear — TB (Ziehl-Neelsen)</option>
              <option>GeneXpert MTB/RIF — TB PCR (Sputum)</option>
              <option>TB Culture &amp; Drug Sensitivity (MGIT)</option>
              <option>Blood Culture &amp; Sensitivity (C&amp;S)</option>
              <option>Urine Microscopy, Culture &amp; Sensitivity (MCS)</option>
              <option>High Vaginal Swab (HVS) — C&amp;S</option>
              <option>Cervical Swab — Gonorrhoea / Chlamydia PCR</option>
              <option>Wound Swab / Pus Swab — C&amp;S</option>
              <option>Stool Microscopy, Culture &amp; Sensitivity</option>
              <option>Stool Ova &amp; Parasites (O&amp;P)</option>
              <option>Skin Scraping — Fungal KOH Prep</option>
              <option>Cerebrospinal Fluid (CSF) Analysis — Meningitis</option>
              <option>Dengue NS1 Antigen / Dengue IgM/IgG</option>
              <option>Lassa Fever PCR (Refer to NCDC Lab)</option>
              <option>SARS-CoV-2 Antigen Test (COVID-19)</option>
            </optgroup>
            <optgroup label="🔵 Urinalysis / Renal">
              <option>Urinalysis — Dipstick (Urine Protein, Sugar, Ketones, Blood)</option>
              <option>Urine Protein:Creatinine Ratio (Spot)</option>
              <option>24-Hour Urine Protein / Creatinine Clearance</option>
              <option>Urine Microscopy (RBCs, Casts, WBCs)</option>
              <option>Urine β-hCG — Serum/Urine Pregnancy Test</option>
            </optgroup>
            <optgroup label="🟣 Hormones / Endocrinology">
              <option>Thyroid Function Tests (TFTs) — TSH, Free T3, Free T4</option>
              <option>Cortisol (Morning / Stress)</option>
              <option>Prolactin, FSH, LH, Oestradiol (Reproductive Panel)</option>
              <option>Testosterone (Male Reproductive)</option>
              <option>Progesterone (Luteal Phase)</option>
              <option>β-hCG — Quantitative (Serum, Ectopic / Early Pregnancy)</option>
              <option>PSA — Prostate Specific Antigen</option>
              <option>Anti-TPO / Anti-Thyroglobulin (Autoimmune Thyroid)</option>
            </optgroup>
            <optgroup label="⚫ Cardiac / Emergency Markers">
              <option>Troponin I or T — Acute MI / ACS</option>
              <option>CK-MB — Cardiac Enzyme</option>
              <option>BNP / NT-proBNP — Heart Failure Marker</option>
              <option>ABG — Arterial Blood Gas (Respiratory Failure / ICU)</option>
              <option>Venous Blood Gas (VBG)</option>
              <option>Blood Ketones / Urine Ketones (DKA)</option>
            </optgroup>
            <optgroup label="🟤 Immunology / Serology">
              <option>Rheumatoid Factor (RF) — RA Screening</option>
              <option>Anti-Nuclear Antibody (ANA)</option>
              <option>Anti-dsDNA (SLE)</option>
              <option>Complement C3 &amp; C4</option>
              <option>Anti-CCP (RA Confirmation)</option>
              <option>IgE — Total (Allergy Panel)</option>
              <option>ANCA (Vasculitis Panel)</option>
            </optgroup>
            <optgroup label="🔶 Histopathology / Cytology">
              <option>Cervical Smear / Pap Smear (Cancer Screening)</option>
              <option>Fine Needle Aspiration Cytology (FNAC)</option>
              <option>Tissue Biopsy — Histopathology (H&amp;E)</option>
              <option>Semen Analysis (Male Fertility)</option>
              <option>Bone Marrow Aspirate &amp; Trephine</option>
            </optgroup>
          </select>
        </label>
        <label>STAT Priority
          <select name="status">
            <option value="Open">Routine (24–48 hrs)</option>
            <option value="Urgent">Urgent (2–6 hrs)</option>
            <option value="Emergency">STAT / Emergency (&lt;1 hr)</option>
          </select>
        </label>
      </div>
      <label>Additional Tests (free text — list any extras not in the dropdown above)
        <textarea name="additionalTests" rows="2" placeholder="e.g. Anti-HBs titre, G6PD screen, Thyroglobulin..."></textarea>
      </label>
      <label>Clinical Indication &amp; History
        <textarea name="assessment" rows="3" placeholder="Enter clinical reason for request: symptoms, differential diagnosis, risk factors, relevant history..." required></textarea>
      </label>
      <label>Specimen Type, Collection &amp; Result Instructions
        <textarea name="plan" rows="2" placeholder="Enter specimen type (e.g. venous blood 5mL EDTA), collection time, transport, result turnaround, critical value notification..."></textarea>
      </label>`
  },
  PHA: {
    label: "Pharmacy",
    form: code => `
      ${modalSelectors("Pharmacy")}
      <div class="form-row">
        <label>Drug Class / Category
          <select name="drugCategory">
            <option value="">— Select drug class —</option>
            <optgroup label="Anti-infectives">
              <option>Antimalarial (Artemether-Lumefantrine, ASAQ, Artesunate IV)</option>
              <option>Antibiotic — Penicillin (Amoxicillin, Co-Amoxiclav, Ampicillin)</option>
              <option>Antibiotic — Cephalosporin (Cefuroxime, Ceftriaxone, Cefixime)</option>
              <option>Antibiotic — Fluoroquinolone (Ciprofloxacin, Ofloxacin)</option>
              <option>Antibiotic — Macrolide (Azithromycin, Erythromycin)</option>
              <option>Antibiotic — Metronidazole / Tinidazole</option>
              <option>Anti-TB (Rifampicin, Isoniazid, Pyrazinamide, Ethambutol)</option>
              <option>Antifungal (Fluconazole, Griseofulvin, Nystatin)</option>
              <option>Antiretroviral (TDF/3TC/DTG, EFV-based)</option>
              <option>Anthelmintic (Albendazole, Mebendazole, Praziquantel)</option>
            </optgroup>
            <optgroup label="Cardiovascular">
              <option>Antihypertensive — ACE Inhibitor (Enalapril, Lisinopril)</option>
              <option>Antihypertensive — CCB (Amlodipine, Nifedipine)</option>
              <option>Antihypertensive — Beta-Blocker (Atenolol, Metoprolol)</option>
              <option>Antihypertensive — Diuretic (Furosemide, HCTZ, Spironolactone)</option>
              <option>Antiplatelet (Aspirin 75–300mg, Clopidogrel)</option>
              <option>Statin (Atorvastatin, Simvastatin, Rosuvastatin)</option>
              <option>Digoxin (Heart failure / AF)</option>
              <option>MgSO4 — Magnesium Sulphate (Pre-eclampsia)</option>
            </optgroup>
            <optgroup label="Endocrine / Metabolic">
              <option>Insulin (Short-acting, Long-acting, Mixtard)</option>
              <option>Oral Hypoglycaemic (Metformin, Glibenclamide, Glimepiride)</option>
              <option>Levothyroxine (Hypothyroidism)</option>
              <option>Oral Contraceptive (Combined OCP, POP)</option>
              <option>Injectable Contraceptive (DMPA / Depo-Provera)</option>
            </optgroup>
            <optgroup label="Analgesics / Anaesthesia">
              <option>Non-Opioid (Paracetamol, Ibuprofen, Diclofenac)</option>
              <option>Opioid (Morphine, Tramadol, Pethidine)</option>
              <option>Local Anaesthetic (Lidocaine, Bupivacaine)</option>
              <option>Sedation (Midazolam, Diazepam, Ketamine)</option>
              <option>Antispasmodic (Hyoscine Butylbromide / Buscopan)</option>
            </optgroup>
            <optgroup label="GIT / Nutrition">
              <option>Antacid / PPI (Omeprazole, Ranitidine, Sucralfate)</option>
              <option>Antiemetic (Metoclopramide, Ondansetron, Promethazine)</option>
              <option>Iron Supplement (Ferrous Sulphate, Ferric)</option>
              <option>Folic Acid / Vitamin B Complex</option>
              <option>ORS — Oral Rehydration Salts</option>
              <option>IV Fluids (Normal Saline, Ringer's Lactate, Dextrose 5%)</option>
              <option>Zinc (Paediatric Diarrhoea Protocol)</option>
            </optgroup>
            <optgroup label="Respiratory">
              <option>Bronchodilator Inhaler (Salbutamol, Ipratropium)</option>
              <option>Prednisolone / Dexamethasone (Systemic Steroid)</option>
              <option>Aminophylline (IV Severe Asthma)</option>
            </optgroup>
            <optgroup label="Maternal / Neonatal">
              <option>Oxytocin (Labour Induction / PPH Prevention)</option>
              <option>Misoprostol (PPH / Cervical Ripening)</option>
              <option>Nifedipine (Tocolysis / BP in Pregnancy)</option>
              <option>Vitamin K Injection (Neonatal)</option>
              <option>Tetracycline Eye Ointment (Neonatal)</option>
              <option>Vitamin A (Child Health / Measles)</option>
            </optgroup>
          </select>
        </label>
        <label>Dispensing Status
          <select name="status">
            <option value="">— Select status —</option>
            <option value="Closed">Fully Dispensed</option>
            <option value="Open">Pending — Awaiting Stock</option>
            <option value="Urgent">Partial Dispense (shortage)</option>
          </select>
        </label>
      </div>
      <label>Specific Drug, Dose &amp; Formulation
        <input name="chiefComplaint" placeholder="Enter exact drug name, strength and form (e.g. Artemether-Lumefantrine 80/480mg tabs)" required/>
      </label>
      <label>Allergy Check &amp; Drug Interaction Safety Verification
        <textarea name="assessment" rows="2" placeholder="Enter allergy screening result, drug interaction check outcome, patient-specific safety considerations..." required></textarea>
      </label>
      <label>Dispensing, Counselling &amp; Adherence Notes
        <textarea name="plan" rows="2" placeholder="Enter dosing instructions, route, frequency, duration, patient counselling points, storage and return visit..."></textarea>
      </label>`
  },
  RAD: {
    label: "Radiology",
    form: code => `
      ${modalSelectors("Radiology")}
      <div class="form-row">
        <label>Imaging Study
          <select name="chiefComplaint" required>
            <option value="">— Select modality —</option>
            <optgroup label="Plain X-Ray (Radiograph)">
              <option>Chest X-Ray — PA View (CXR)</option>
              <option>Abdominal X-Ray (AXR) — Erect &amp; Supine</option>
              <option>Skull X-Ray — AP &amp; Lateral</option>
              <option>Cervical Spine X-Ray (C-Spine)</option>
              <option>Thoracic Spine X-Ray (T-Spine)</option>
              <option>Lumbar Spine X-Ray (L-Spine)</option>
              <option>Pelvis X-Ray</option>
              <option>Hip X-Ray — AP &amp; Lateral</option>
              <option>Knee X-Ray — AP &amp; Lateral</option>
              <option>Ankle &amp; Foot X-Ray</option>
              <option>Shoulder X-Ray</option>
              <option>Elbow X-Ray</option>
              <option>Wrist &amp; Hand X-Ray</option>
              <option>Forearm / Radius / Ulna X-Ray</option>
              <option>Humerus / Arm X-Ray</option>
              <option>Femur / Thigh X-Ray</option>
              <option>Tibia &amp; Fibula X-Ray</option>
              <option>Mandible / Facial Bones X-Ray</option>
              <option>Paranasal Sinuses X-Ray</option>
              <option>KUB X-Ray (Kidney, Ureter, Bladder)</option>
            </optgroup>
            <optgroup label="Ultrasound (USS)">
              <option>Obstetric Ultrasound — Dating / Anomaly / Viability Scan</option>
              <option>Obstetric USS — Fetal Wellbeing / Biophysical Profile</option>
              <option>Abdominal USS — Liver, Gallbladder, Spleen, Pancreas, Aorta</option>
              <option>Pelvic USS — Uterus, Ovaries (Transabdominal)</option>
              <option>Transvaginal Ultrasound (TVS) — Gynaecology / Early Pregnancy</option>
              <option>Scrotal / Testicular Ultrasound</option>
              <option>Renal USS — Kidneys, Ureters, Bladder (RUB)</option>
              <option>Thyroid Ultrasound</option>
              <option>Breast Ultrasound</option>
              <option>Soft Tissue / Superficial Mass USS</option>
              <option>FAST Scan — Emergency Trauma (Focused Abdominal USS)</option>
              <option>Doppler USS — Lower Limb DVT</option>
              <option>Doppler USS — Carotid Arteries</option>
              <option>Echocardiography (ECHO) — Cardiac Ultrasound</option>
            </optgroup>
            <optgroup label="CT Scan">
              <option>CT Head — Plain (Trauma / Stroke)</option>
              <option>CT Head — Contrast (Tumour / Abscess)</option>
              <option>CT Chest — High Resolution (HRCT) — TB / ILD</option>
              <option>CT Chest &amp; Abdomen — Contrast (Oncology)</option>
              <option>CT Abdomen &amp; Pelvis — Plain</option>
              <option>CT Abdomen &amp; Pelvis — Contrast</option>
              <option>CT Spine (Cervical / Thoracic / Lumbar)</option>
              <option>CT Pulmonary Angiogram (CTPA) — PE</option>
              <option>CT Angiogram — Aorta / Peripheral Vessels</option>
              <option>CT KUB — Renal Stones</option>
            </optgroup>
            <optgroup label="MRI">
              <option>MRI Brain (Plain)</option>
              <option>MRI Brain with Gadolinium Contrast</option>
              <option>MRI Spine — Cervical / Thoracic / Lumbar</option>
              <option>MRI Pelvis (Gynaecology / Prostate)</option>
              <option>MRI Knee / Shoulder / Hip (Musculoskeletal)</option>
              <option>MRI Liver — Hepatobiliary</option>
              <option>Magnetic Resonance Angiogram (MRA)</option>
            </optgroup>
            <optgroup label="Fluoroscopy / Contrast Studies">
              <option>Barium Swallow</option>
              <option>Barium Meal / Follow-Through</option>
              <option>Barium Enema</option>
              <option>Intravenous Urogram (IVU / IVP)</option>
              <option>Micturating Cystourethrogram (MCUG)</option>
              <option>Hysterosalpingogram (HSG) — Tubal Patency</option>
              <option>Myelogram</option>
            </optgroup>
            <optgroup label="Nuclear Medicine / Special">
              <option>Bone Scan (Technetium Scintigraphy)</option>
              <option>Thyroid Scan (Tc-99m)</option>
              <option>Ventilation-Perfusion (V/Q) Scan</option>
              <option>PET-CT Scan (Oncology)</option>
              <option>Mammography (Breast Cancer Screening)</option>
              <option>DEXA Scan (Bone Mineral Density)</option>
            </optgroup>
          </select>
        </label>
        <label>Priority
          <select name="status">
            <option value="">— Select priority —</option>
            <option value="Open">Routine (Elective)</option>
            <option value="Urgent">Urgent (Same Day)</option>
            <option value="Emergency">Emergency (Immediate)</option>
          </select>
        </label>
      </div>
      <label>Clinical Indication &amp; Question for Radiologist
        <textarea name="assessment" rows="3" placeholder="Enter clinical history, differential diagnosis, what you need answered (e.g. Rule out fracture, exclude TB, assess fetal lie and presentation at 36 weeks)..." required></textarea>
      </label>
      <label>Radiologist Report / Preliminary Findings
        <textarea name="plan" rows="2" placeholder="Enter radiologist report, preliminary findings, scheduled scan date/time, or result turnaround..."></textarea>
      </label>`
  },
  MAT: {
    label: "ANC & Maternity",
    form: code => `
      ${modalSelectors("ANC")}
      <div class="form-row">
        <label>Visit Type
          <select name="visitType">
            <option value="">— Select visit type —</option>
            <option>ANC Visit 1 (Booking / &lt;16 weeks)</option>
            <option>ANC Visit 2 (16–20 weeks)</option>
            <option>ANC Visit 3 (24–28 weeks)</option>
            <option>ANC Visit 4 (30–32 weeks)</option>
            <option>ANC Visit 5 (34–36 weeks)</option>
            <option>ANC Visit 6 (38 weeks)</option>
            <option>ANC Visit 7 (40 weeks)</option>
            <option>Labour / Active Delivery</option>
            <option>Immediate Postnatal (0–48 hrs)</option>
            <option>Postnatal Visit 1 (3–7 days)</option>
            <option>Postnatal Visit 2 (6 weeks)</option>
            <option>Gynaecological Visit</option>
            <option>Family Planning / Contraception</option>
          </select>
        </label>
        <label>Parity
          <input name="parity" placeholder="e.g. G3P2+0 (3 pregnancies, 2 live births)"/>
        </label>
      </div>
      <div class="vitals-grid">
        <label>Maternal BP<input name="bp" placeholder="e.g. 120/80" required/></label>
        <label>Temp (°C)<input name="temperature" type="number" step="0.1" placeholder="e.g. 36.5" required/></label>
        <label>GA (weeks)<input name="ga" type="number" placeholder="e.g. 28"/></label>
        <label>FHR (bpm)<input name="fhr" type="number" placeholder="e.g. 144"/></label>
        <label>Fundal Ht (cm)<input name="fundal" type="number" placeholder="e.g. 28"/></label>
        <label>Weight (kg)<input name="weight" type="number" step="0.1" placeholder="e.g. 72"/></label>
      </div>
      <label>Visit Reason / Maternal Complaint
        <textarea name="chiefComplaint" rows="2" placeholder="Enter visit reason, presenting complaint, or symptom (e.g. headache, reduced fetal movements, vaginal bleeding)..." required></textarea>
      </label>
      <label>Obstetric Assessment
        <textarea name="assessment" rows="3" placeholder="Enter obstetric findings: lie, presentation, engagement, fetal heart, uterine activity, pre-eclampsia screen, PMTCT status, danger signs..." required></textarea>
      </label>
      <label>Management Plan &amp; Danger Sign Counselling
        <textarea name="plan" rows="2" placeholder="Enter medications, supplements, referral plan, next appointment date, and danger signs discussed with patient..."></textarea>
      </label>`
  },
  IMM: {
    label: "Immunization",
    form: code => `
      ${modalSelectors("Immunization")}
      <div class="form-row">
        <label>Vaccine / Antigen
          <select name="chiefComplaint" required>
            <option value="">— Select vaccine —</option>
            <optgroup label="Childhood Routine EPI (Nigeria Schedule)">
              <option>BCG — Bacillus Calmette-Guérin (TB) — At Birth</option>
              <option>OPV0 — Oral Polio Vaccine (Birth Dose)</option>
              <option>OPV1 — Oral Polio (6 weeks)</option>
              <option>OPV2 — Oral Polio (10 weeks)</option>
              <option>OPV3 — Oral Polio (14 weeks)</option>
              <option>IPV — Inactivated Polio Vaccine (14 weeks)</option>
              <option>Pentavalent 1 — DPT-HepB-Hib (6 weeks)</option>
              <option>Pentavalent 2 — DPT-HepB-Hib (10 weeks)</option>
              <option>Pentavalent 3 — DPT-HepB-Hib (14 weeks)</option>
              <option>PCV10/13 Dose 1 — Pneumococcal (6 weeks)</option>
              <option>PCV10/13 Dose 2 — Pneumococcal (10 weeks)</option>
              <option>PCV10/13 Dose 3 — Pneumococcal (14 weeks)</option>
              <option>Rotavirus Dose 1 (6 weeks)</option>
              <option>Rotavirus Dose 2 (10 weeks)</option>
              <option>Measles-Rubella (MR) Dose 1 (9 months)</option>
              <option>Measles-Rubella (MR) Dose 2 (15 months)</option>
              <option>Yellow Fever (9 months — single dose, lifelong)</option>
              <option>Meningitis A — MenAfriVac (9–18 months)</option>
              <option>Typhoid Conjugate Vaccine (TCV) (9 months)</option>
              <option>Vitamin A Supplementation (6 months+)</option>
            </optgroup>
            <optgroup label="Maternal Immunization">
              <option>TT1 — Tetanus Toxoid (First ANC Contact)</option>
              <option>TT2 — Tetanus Toxoid (4 weeks after TT1)</option>
              <option>TT3 — Tetanus Toxoid (6 months after TT2)</option>
              <option>TT4 — Tetanus Toxoid (1 year after TT3)</option>
              <option>TT5 — Tetanus Toxoid (1 year after TT4)</option>
              <option>IPTp-SP — Intermittent Preventive Treatment (Malaria in Pregnancy)</option>
              <option>Hepatitis B (Maternal — If non-immune)</option>
              <option>COVID-19 (Maternal — mRNA or Viral Vector)</option>
            </optgroup>
            <optgroup label="Adult / Catch-Up / Special Campaign">
              <option>HPV Vaccine (Girls 9–14 yrs — Cervarix / Gardasil)</option>
              <option>Hepatitis B (HBV) — Adult 3-dose series</option>
              <option>Hepatitis A (HAV)</option>
              <option>Typhoid Vi Polysaccharide (Adults)</option>
              <option>Rabies (Pre-exposure / Post-exposure)</option>
              <option>COVID-19 Primary Series (AstraZeneca / Pfizer / J&amp;J)</option>
              <option>COVID-19 Booster</option>
              <option>Influenza (Seasonal Flu Vaccine)</option>
              <option>Cholera Oral Vaccine (OCV) — Campaign</option>
              <option>Meningococcal ACWY (Adults / Travel)</option>
            </optgroup>
          </select>
        </label>
        <label>Dose &amp; Series Status
          <select name="status">
            <option value="">— Select dose —</option>
            <option value="Open">Primary Dose 1</option>
            <option value="Open">Primary Dose 2</option>
            <option value="Open">Primary Dose 3</option>
            <option value="Closed">Booster Dose</option>
            <option value="Closed">Supplemental / Campaign Dose</option>
            <option value="Escalated">Catch-up (Defaulter)</option>
          </select>
        </label>
      </div>
      <label>Child / Patient Clinical Status at Time of Vaccination
        <textarea name="assessment" rows="2" placeholder="Enter patient weight, temperature, general condition, contraindications checked, AEFI history..." required></textarea>
      </label>
      <label>Next Dose Schedule, Cold-Chain &amp; Defaulter Prevention
        <textarea name="plan" rows="2" placeholder="Enter next vaccine due, date, site, cold chain verification, recall strategy, add to defaulter register if applicable..."></textarea>
      </label>`
  },
  THR: {
    label: "Theatre",
    form: code => `
      ${modalSelectors("Theatre")}
      <div class="form-row">
        <label>Procedure / Operation
          <select name="procedureCategory">
            <option value="">— Select procedure —</option>
            <optgroup label="Obstetrics &amp; Gynaecology">
              <option>Caesarean Section — LSCS (Lower Segment)</option>
              <option>Manual Removal of Placenta (MROP)</option>
              <option>Evacuation of Retained Products of Conception (ERPC)</option>
              <option>Repair of Obstetric Fistula (VVF / RVF)</option>
              <option>Laparotomy — Ruptured Ectopic Pregnancy</option>
              <option>Total Abdominal Hysterectomy (TAH)</option>
              <option>Myomectomy (Open / Laparoscopic)</option>
              <option>Dilation &amp; Curettage (D&amp;C)</option>
            </optgroup>
            <optgroup label="General Surgery">
              <option>Appendicectomy (Open / Laparoscopic)</option>
              <option>Exploratory Laparotomy</option>
              <option>Bowel Resection &amp; Anastomosis</option>
              <option>Hernia Repair — Inguinal / Umbilical</option>
              <option>Cholecystectomy (Open / Laparoscopic)</option>
              <option>Thyroidectomy</option>
              <option>Mastectomy (Simple / Radical)</option>
              <option>Haemorrhoidectomy</option>
            </optgroup>
            <optgroup label="Orthopaedics &amp; Trauma">
              <option>Open Reduction &amp; Internal Fixation (ORIF)</option>
              <option>Closed Reduction &amp; POP / K-Wire Fixation</option>
              <option>Intramedullary (IM) Nail — Femur / Tibia</option>
              <option>Hip Hemiarthroplasty / Total Hip Replacement</option>
              <option>Amputation — Below / Above Knee</option>
              <option>Debridement &amp; Wound Lavage</option>
            </optgroup>
            <optgroup label="Other Procedures">
              <option>Burr Hole / Craniotomy</option>
              <option>Ventriculoperitoneal (VP) Shunt</option>
              <option>Transurethral Resection of Prostate (TURP)</option>
              <option>Circumcision (Surgical)</option>
              <option>Tracheostomy</option>
              <option>Chest Drain Insertion (ICD)</option>
              <option>Central Venous Catheter (CVC) Insertion</option>
            </optgroup>
          </select>
        </label>
        <label>Anaesthesia Type
          <select name="anaesthesia">
            <option value="">— Select anaesthesia —</option>
            <option>Spinal / Subarachnoid Block (SAB)</option>
            <option>Epidural Anaesthesia</option>
            <option>General Anaesthesia (GA) — Endotracheal</option>
            <option>General Anaesthesia — LMA</option>
            <option>Ketamine IV Dissociative Anaesthesia</option>
            <option>Local Infiltration Anaesthesia</option>
            <option>IV Sedation (Midazolam + Fentanyl)</option>
          </select>
        </label>
      </div>
      <label>Specific Procedure / Operation Name
        <input name="chiefComplaint" placeholder="Enter exact procedure name (e.g. Exploratory Laparotomy + Peritoneal Lavage)..." required/>
      </label>
      <label>WHO Surgical Safety Checklist (Sign-In → Time-Out → Sign-Out)
        <textarea name="assessment" rows="3" placeholder="Enter checklist status: patient identity confirmed, procedure &amp; site verified, consent signed, allergies checked, airway assessed, imaging displayed, anticipated critical events discussed, pulse oximeter functional, instrument count correct..." required></textarea>
      </label>
      <label>Post-Operative Recovery, Monitoring &amp; Discharge Plan
        <textarea name="plan" rows="2" placeholder="Enter post-op ward, monitoring frequency, analgesia plan, IV fluids, wound care, drain management, NBM duration, follow-up date..."></textarea>
      </label>`
  },
  CLA: {
    label: "Insurance Claims",
    form: code => `
      ${modalSelectors("Claims")}
      <div class="form-row">
        <label>Insurance Scheme
          <select name="insurance" required>
            <option value="">— Select scheme —</option>
            <option value="PLASCHEMA">PLASCHEMA — Plateau State Health Insurance</option>
            <option value="NHIA">NHIA — National Health Insurance Authority</option>
            <option value="Basic Health Care Provision Fund">BHCPF — Basic Health Care Provision Fund</option>
            <option value="NHIA">NHIS — National Health Insurance Scheme (Legacy)</option>
            <option value="Private Insurance">Private Insurance (AXA Mansard, Hygeia, Reliance HMO)</option>
            <option value="GIFSHIP">GIFSHIP — Gov't & IGR Facility Self Health Insurance</option>
            <option value="Ekiti">State Contributory Scheme (Cross-listed / Visiting)</option>
          </select>
        </label>
        <label>Benefit Package / Claim Type
          <select name="claimType">
            <option value="">— Select type —</option>
            <option>Primary Care Package (OPD, Drugs, Labs)</option>
            <option>ANC / Maternal Package (ANC, Delivery, Postnatal)</option>
            <option>Surgical Package (Procedure + Theatre + Anaesthesia)</option>
            <option>Inpatient Admission Package (Ward + Nursing + Meals)</option>
            <option>Emergency Care Package</option>
            <option>Immunization Package</option>
            <option>Radiology / Diagnostics Package</option>
            <option>Specialist Consultation Package</option>
            <option>Chronic Disease Management (Hypertension, Diabetes, TB)</option>
          </select>
        </label>
      </div>
      <label>Pre-Authorization / Approval Code
        <input name="chiefComplaint" placeholder="Enter pre-authorization code (e.g. PL-9827-ANC, NHIA-00234)" required/>
      </label>
      <label>Eligibility Verification &amp; Beneficiary Check
        <textarea name="assessment" rows="2" placeholder="Enter verification outcome: card status, benefit limit, active membership, co-payment tier, benefit package confirmed..." required></textarea>
      </label>
      <label>Services Rendered &amp; Claim Bundle Details
        <textarea name="plan" rows="2" placeholder="List all services in this claim bundle, ICD-11 codes, quantities, unit costs and total claim amount submitted to portal..."></textarea>
      </label>`
  },
  REF: {
    label: "Referral",
    form: code => `
      ${modalSelectors("Referrals")}
      <div class="form-row">
        <label>Receiving Facility
          <select name="destination" required>
            <option value="">— Select receiving facility —</option>
            <optgroup label="Tertiary / Teaching Hospitals">
              <option>Jos University Teaching Hospital (JUTH)</option>
              <option>Plateau State Specialist Hospital (PSSH)</option>
              <option>Plateau State Specialist Hospital — Vom Campus</option>
              <option>Federal Medical Centre (FMC) Wase</option>
              <option>University of Jos Teaching Hospital (UniJOS)</option>
            </optgroup>
            <optgroup label="General Hospitals — Plateau State">
              <option>General Hospital Shendam</option>
              <option>General Hospital Mangu</option>
              <option>General Hospital Pankshin</option>
              <option>General Hospital Barkin Ladi</option>
              <option>General Hospital Langtang</option>
              <option>General Hospital Bassa</option>
              <option>General Hospital Kanke</option>
              <option>General Hospital Kanam</option>
              <option>General Hospital Mikang</option>
              <option>General Hospital Qua'an Pan</option>
              <option>General Hospital Riyom</option>
              <option>General Hospital Shendam</option>
              <option>General Hospital Wase</option>
              <option>General Hospital Jos East</option>
              <option>General Hospital Jos South</option>
              <option>General Hospital Jos North</option>
            </optgroup>
            <optgroup label="Specialist Referrals">
              <option>JUTH — Orthopaedics &amp; Trauma Centre</option>
              <option>JUTH — Neurosurgery</option>
              <option>JUTH — Paediatric Emergency (PICU / NICU)</option>
              <option>JUTH — Obstetrics &amp; Gynaecology (MFMU)</option>
              <option>JUTH — Cardiothoracic Surgery</option>
              <option>JUTH — Ophthalmology (Eye Clinic)</option>
              <option>JUTH — Renal / Dialysis Unit</option>
              <option>JUTH — Psychiatry (MHMS)</option>
              <option>JUTH — Oncology / Radiotherapy</option>
              <option>JUTH — Burns &amp; Plastics Unit</option>
            </optgroup>
            <optgroup label="Out-of-State / National Referral">
              <option>National Hospital Abuja (NHA)</option>
              <option>Federal Medical Centre Keffi (FMC Keffi)</option>
              <option>Ahmadu Bello University Teaching Hospital (ABUTH) Zaria</option>
              <option>Aminu Kano Teaching Hospital (AKTH) Kano</option>
              <option>NCDC / Reference Lab (Infectious Disease)</option>
            </optgroup>
          </select>
        </label>
        <label>Urgency Level
          <select name="status">
            <option value="Emergency">Emergency — Life Threatening</option>
            <option value="Urgent">Urgent — Same Day</option>
            <option value="Open">Routine — Elective</option>
          </select>
        </label>
      </div>
      <label>Reason for Referral
        <select name="chiefComplaint" required>
          <option value="Severe pre-eclampsia — requires urgent stabilisation">Severe pre-eclampsia</option>
          <option value="Severe malaria with complications">Severe malaria with complications</option>
          <option value="Emergency surgical intervention required">Emergency surgical intervention</option>
          <option value="Neonatal intensive care required">Neonatal intensive care required</option>
          <option value="Specialist review — chronic disease management">Specialist review — chronic disease</option>
          <option value="Trauma — orthopaedic surgery required">Trauma — orthopaedic surgery</option>
        </select>
      </label>
      <label>Clinical Status at Transfer
        <textarea name="assessment" rows="2" placeholder="BP 160/110, urine protein ++, MgSO4 loading dose given, IV access secured" required></textarea>
      </label>
      <label>Transfer & Feedback Plan
        <textarea name="plan" rows="2" placeholder="State ambulance dispatched, receiving physician alerted, feedback in 48hrs"></textarea>
      </label>`
  }
};

// Open a unit modal
function openUnitModal(code) {
  const def = unitDefs[code];
  if (!def) return;
  unitModalTitle.textContent = def.label + " — Clinical Record";
  unitFormWrap.innerHTML = def.form(code);

  // Populate patient + facility selects
  const fp = optionHtml(state.facilities, f => `${f.name} — ${f.lga}`);
  const pp = optionHtml(state.patients,   p => `${p.name} (${p.id})`);
  const pSel = unitFormWrap.querySelector(`#mp_${code}`);
  const fSel = unitFormWrap.querySelector(`#mf_${code}`);
  if (pSel) pSel.innerHTML = pp;
  if (fSel) fSel.innerHTML = fp;

  // Wire OPD ICD-11 inline search
  if (code === "OPD") {
    const srch = document.querySelector("#modalIcd11SearchInput");
    const res  = document.querySelector("#modalIcd11Results");
    const prev = document.querySelector("#modalIcd11Preview");
    const cHid = document.querySelector("#modalIcd11Code");
    const dHid = document.querySelector("#modalIcd11Display");
    if (srch) {
      srch.addEventListener("input", async e => {
        const q = e.target.value.trim();
        if (!q) { res.innerHTML=""; return; }
        try {
          const data = await api(`/api/icd11/search?q=${encodeURIComponent(q)}`);
          res.innerHTML = data.map(r =>
            `<div class="icd11-result-item modal-icd11-item" data-code="${r.code}" data-title="${r.title}">
               <strong>${r.code}</strong> — ${r.title}
             </div>`).join("");
          res.querySelectorAll(".modal-icd11-item").forEach(el => {
            el.addEventListener("click", () => {
              srch.value = `${el.dataset.code} — ${el.dataset.title}`;
              res.innerHTML = "";
              prev.textContent = `${el.dataset.code} — ${el.dataset.title}`;
              cHid.value = el.dataset.code;
              dHid.value = el.dataset.title;
            });
          });
        } catch(err) { console.error(err); }
      });
    }
  }

  unitModal.style.display = "flex";
}

// Bind module card clicks to direct fullscreen pages
document.querySelectorAll(".module-card").forEach(card => {
  const code = card.querySelector("span")?.textContent?.trim();
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    if (code === "TRI") { switchView("triage"); switchTriageSubTab("triage"); }
    else if (code === "OPD") switchView("consultations");
    else if (code === "EMR") { switchView("triage"); switchTriageSubTab("emergency"); }
    else if (code === "IPD") switchView("beds");
    else if (code === "LAB") switchView("labresults");
    else if (code === "PHA") switchView("pharmacy");
    else if (code === "RAD") switchView("radiology");
    else if (code === "MAT") switchView("maternity");
    else if (code === "IMM") switchView("immunization");
    else if (code === "THR") switchView("theatre");
    else if (code === "CLA") switchView("billing");
    else if (code === "REF") switchView("referrals");
  });
});

// Close modal
function closeUnitModal() { unitModal.style.display = "none"; }
window.closeUnitModal = closeUnitModal;
unitModal?.addEventListener("click", e => { if (e.target === unitModal) closeUnitModal(); });

// Submit unit modal form
if (unitModalForm) {
  unitModalForm.addEventListener("submit", async e => {
    e.preventDefault();
    const f = formToObject(e.currentTarget);
    const payload = {
      patientId: f.patientId, facilityId: f.facilityId,
      unit: f.unit, chiefComplaint: f.chiefComplaint,
      vitals: {
        temperature: f.temperature||"", bp: f.bp||"",
        pulse: f.pulse||"", respiration: f.respiration||"",
        spo2: f.spo2||"", weight: f.weight||""
      },
      assessment: f.assessment, plan: f.plan,
      icd11Code: f.icd11Code||"", icd11Display: f.icd11Display||""
    };
    try {
      await api("/api/encounters", {method:"POST", body:JSON.stringify(payload)});
      showToast(`${f.unit} record saved & bill generated.`);
      closeUnitModal();
      await loadData();
    } catch(err) { showToast("Submit failed: "+err.message); }
  });
}

// ---------------------------------------------------------------
//  Kick off on load
// ---------------------------------------------------------------
loadData();

// ═══════════════════════════════════════════════════════════════
//  NEW FEATURE MODULES — 2026 EHR Expansion
// ═══════════════════════════════════════════════════════════════

// ── Extended loadData ──────────────────────────────────────────
const _origLoadData = loadData;
async function loadAllNewData() {
  try {
    const [apts, labs, beds, admissions] = await Promise.all([
      api("/api/appointments"),
      api("/api/labresults"),
      api("/api/beds"),
      api("/api/beds").then(() => fetch("/api/beds").then(r=>r.json())).catch(()=>[])
    ]);
    // fetch admissions from beds logic
    const admRes = await fetch("/api/beds").then(r=>r.json()).catch(()=>[]);
    state.appointments = apts;
    state.labResults   = labs;
    state.beds         = beds;

    renderAppointments();
    renderLabResults();
    renderBeds();
    renderAdmissions();
    renderAnalytics();
    fillSelects();
  } catch(e) { console.warn("New data load:", e.message); }
}
// Patch the existing loadData to also call new loaders
const origLoadData = loadData;
loadData = async function() {
  await origLoadData();
  await loadAllNewData();
};

// ── APPOINTMENTS ───────────────────────────────────────────────
function renderAppointments() {
  const el = document.querySelector("#appointmentsTable");
  if (!el) return;
  const apts = state.appointments || [];
  if (!apts.length) { el.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;">No appointments booked yet.</p>'; return; }
  el.innerHTML = `
    <div class="apt-row header">
      <span>Date</span><span>Time</span><span>Patient</span><span>Department</span><span>Doctor</span><span>Status</span><span>Action</span>
    </div>
    ${apts.map(a => `<div class="apt-row">
      <span><strong>${a.date}</strong></span>
      <span>${a.time}</span>
      <span>${patientName(a.patientId)}</span>
      <span>${a.department}</span>
      <span>${a.doctor}</span>
      <span><span class="apt-status ${a.status.replace(/\s/g,'-')}">${a.status}</span></span>
      <span><button class="text-btn" style="color:var(--brand); font-weight:600;" onclick="openEditRecordModal('appointments','${a.id}')">Edit</button></span>
    </div>`).join("")}`;
}

const aptForm = document.querySelector("#appointmentForm");
if (aptForm) {
  aptForm.addEventListener("submit", async e => {
    e.preventDefault();
    const f = formToObject(e.currentTarget);
    try {
      await api("/api/appointments", { method: "POST", body: JSON.stringify(f) });
      showToast("Appointment booked & bill generated!");
      e.currentTarget.reset();
      const apts = await api("/api/appointments");
      state.appointments = apts;
      renderAppointments();
    } catch(err) { showToast("Error: " + err.message); }
  });
}

// ── LAB RESULTS ────────────────────────────────────────────────
let labTestCount = 0;
function addLabTestRow() {
  const container = document.querySelector("#labTestRows");
  if (!container) return;
  const idx = labTestCount++;
  const row = document.createElement("div");
  row.className = "lab-test-input-row";
  row.innerHTML = `
    <input name="test_name_${idx}" placeholder="Test name (e.g. Haemoglobin)" required />
    <input name="test_value_${idx}" placeholder="Value" required />
    <input name="test_unit_${idx}" placeholder="Unit (e.g. g/dL)" />
    <select name="test_interp_${idx}">
      <option>Normal</option><option>Abnormal</option><option>Critical</option>
    </select>
    <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;color:#ef4444;font-size:18px;cursor:pointer;">×</button>`;
  container.appendChild(row);
}

document.querySelector("#addLabTestBtn")?.addEventListener("click", addLabTestRow);
// Add first row by default
addLabTestRow();

const labResultForm = document.querySelector("#labResultForm");
if (labResultForm) {
  labResultForm.addEventListener("submit", async e => {
    e.preventDefault();
    const f = formToObject(e.currentTarget);
    const tests = [];
    let i = 0;
    while (f[`test_name_${i}`] !== undefined) {
      if (f[`test_name_${i}`]) {
        tests.push({ name: f[`test_name_${i}`], value: f[`test_value_${i}`], unit: f[`test_unit_${i}`] || "", refRange: "", interpretation: f[`test_interp_${i}`] });
      }
      i++;
    }
    const payload = { patientId: f.patientId, orderId: f.orderId, facilityId: f.facilityId, tests, technician: f.technician, notes: f.notes };
    try {
      const result = await api("/api/labresults", { method: "POST", body: JSON.stringify(payload) });
      showToast(result.criticalFlag ? "⚠️ Critical lab result saved! Alert clinician." : "Lab results saved.");
      e.currentTarget.reset();
      document.querySelector("#labTestRows").innerHTML = "";
      labTestCount = 0;
      addLabTestRow();
      const labs = await api("/api/labresults");
      state.labResults = labs;
      renderLabResults();
    } catch(err) { showToast("Error: " + err.message); }
  });
}

function renderLabResults() {
  const el = document.querySelector("#labResultsTable");
  if (!el) return;
  const labs = state.labResults || [];
  if (!labs.length) { el.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;">No lab results on file.</p>'; return; }
  el.innerHTML = labs.map(lr => `
    <div class="lab-result-card ${lr.criticalFlag ? 'critical' : ''}">
      <div class="lab-header">
        <div>
          <strong>${patientName(lr.patientId)}</strong>
          <span style="font-size:11px;color:var(--muted);margin-left:8px;">${lr.date} · ${lr.technician}</span>
        </div>
        ${lr.criticalFlag ? '<span class="badge critical">⚠ CRITICAL</span>' : '<span class="badge success">Normal Range</span>'}
      </div>
      ${lr.tests.map(t => `<div class="lab-test-row">
        <span class="test-name">${t.name}</span>
        <span><strong>${t.value}</strong> ${t.unit}</span>
        <span style="color:var(--muted);font-size:11px;">${t.refRange || '—'}</span>
        <span class="interpretation ${t.interpretation}">${t.interpretation}</span>
      </div>`).join("")}
      ${lr.notes ? `<p style="font-size:12px;color:var(--muted);margin-top:8px;font-style:italic;">${lr.notes}</p>` : ""}
    </div>`).join("");
}

// ── BEDS / WARD CENSUS ─────────────────────────────────────────
function renderBeds() {
  const el = document.querySelector("#bedGrid");
  if (!el) return;
  const beds = state.beds || [];
  if (!beds.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted);">No beds configured.</p>'; return; }

  // Ward display icons mapping
  const wardIcons = {
    "Male Medical": "👨‍⚕️",
    "Female Medical": "👩‍⚕️",
    "Surgery Ward": "🏥",
    "Maternity Ward": "🤱",
    "Paediatric Ward": "👶",
    "Paediatric": "👶",
    "Intensive Care Unit (ICU)": "🚨",
    "Isolation Ward": "😷",
    "Emergency Ward": "🚑",
    "General Ward": "🚪"
  };

  // Group beds by ward name
  const wards = {};
  beds.forEach(b => {
    const w = b.ward || "General Ward";
    if (!wards[w]) wards[w] = [];
    wards[w].push(b);
  });

  // Render vertical column layout for each ward
  el.innerHTML = Object.entries(wards).map(([wardName, wardBeds]) => {
    const icon = wardIcons[wardName] || "🛏️";
    const total = wardBeds.length;
    const occupied = wardBeds.filter(b => b.status === "Occupied").length;
    const countText = `${occupied}/${total} Occupied`;

    const bedsHtml = wardBeds.map(b => {
      const patient = b.status === "Occupied" ? patientName(b.patientId) : "";
      const statusClass = b.status.toLowerCase();
      const actionHtml = b.status === "Occupied"
        ? `<button class="text-btn" style="font-size:10px; margin-top:0; padding:2px 6px;" onclick="dischargeFromBed('${b.id}','${b.admissionId}')">Discharge</button>`
        : "";

      return `
        <div class="bed-card ${statusClass}">
          <div class="bed-info-left">
            <div class="bed-label">Bed ${b.bedNumber}</div>
            <div class="bed-patient">${patient || b.status}</div>
          </div>
          ${actionHtml}
        </div>`;
    }).join("");

    return `
      <div class="ward-column">
        <div class="ward-column-header">
          <h3><span class="ward-icon">${icon}</span> ${wardName}</h3>
          <span class="ward-count">${countText}</span>
        </div>
        <div class="bed-list">
          ${bedsHtml}
        </div>
      </div>`;
  }).join("");
}

const admitForm = document.querySelector("#admitForm");
if (admitForm) {
  admitForm.addEventListener("submit", async e => {
    e.preventDefault();
    const f = formToObject(e.currentTarget);
    try {
      await api("/api/beds/admit", { method: "POST", body: JSON.stringify(f) });
      showToast("Patient admitted to ward!");
      e.currentTarget.reset();
      const [beds, admissions] = await Promise.all([api("/api/beds"), api("/api/summary")]);
      state.beds = beds;
      state.summary = admissions;
      renderBeds(); renderAdmissions(); renderSummary(); fillSelects();
    } catch(err) { showToast("Error: " + err.message); }
  });
}

async function dischargeFromBed(bedId, admissionId) {
  if (!admissionId) { showToast("No active admission for this bed."); return; }
  try {
    const adm = await api("/api/beds/discharge", { method: "POST", body: JSON.stringify({ admissionId, dischargedBy: "Duty Clinician" }) });
    showToast("Patient discharged. Generating discharge summary...");
    // Get patient and admission data for discharge summary
    const admission = adm.admission;
    if (admission) {
      const patient = state.patients.find(p => p.id === admission.patientId);
      const encounter = state.encounters.find(e => e.patientId === admission.patientId);
      const labResults = state.labResults.filter(l => l.patientId === admission.patientId);
      const summaryRes = await api("/api/support/discharge-summary", {
        method: "POST",
        body: JSON.stringify({ patient, admission, encounter, labResults, prescriptions: [] })
      });
      showDischargeSummary(summaryRes.summary);
    }
    const beds = await api("/api/beds");
    state.beds = beds;
    renderBeds(); renderAdmissions();
  } catch(err) { showToast("Discharge error: " + err.message); }
}

function renderAdmissions() {
  const el = document.querySelector("#admissionsList");
  if (!el) return;
  // We load admissions from beds data (occupied beds = active admissions)
  const occupied = (state.beds || []).filter(b => b.status === "Occupied");
  if (!occupied.length) { el.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;">No active admissions.</p>'; return; }
  el.innerHTML = occupied.map(b => `
    <article class="record reveal">
      <strong>${patientName(b.patientId)}
        <span class="badge danger" style="margin-left:6px;">Admitted</span>
      </strong>
      <span>${b.ward} — Bed ${b.bedNumber}</span>
      <span>${facilityName(b.facilityId)}</span>
    </article>`).join("");
}

function showDischargeSummary(s) {
  const modal = document.querySelector("#dischargeModal");
  const body  = document.querySelector("#dischargeModalBody");
  if (!modal || !body) return;
  body.innerHTML = [
    ["Patient", s.patientInfo],
    ["Admitted", s.dateOfAdmission],
    ["Discharged", s.dateOfDischarge],
    ["Ward", s.ward],
    ["Admission Diagnosis", s.admittingDiagnosis],
    ["Final Diagnosis", s.finalDiagnosis],
    ["Clinical Course", s.hospitalCourse],
    ["Investigations", s.investigationsPerformed],
    ["Medications on Discharge", s.medicationsOnDischarge],
    ["Follow-up", s.followUpInstructions],
    ["Warning Signs", s.warningSignsToReturn],
    ["Clinician", s.clinicianSignature]
  ].map(([label, value]) => `<div class="discharge-section"><strong>${label}</strong><p>${value}</p></div>`).join("") +
    `<p style="font-size:11px;color:var(--muted);margin-top:12px;font-style:italic;">${s.footer}</p>`;
  modal.style.display = "flex";
}
window.dischargeFromBed = dischargeFromBed;

// ── ANALYTICS CHARTS ───────────────────────────────────────────
async function renderAnalytics() {
  try {
    const data = await api("/api/analytics");
    drawBarChart("chartDisease",   Object.keys(data.diseaseBurden),   Object.values(data.diseaseBurden),   "Cases/7 days",  ["#ef4444","#f59e0b","#3b82f6","#10b981"]);
    drawPieChart("chartInsurance", Object.keys(data.insuranceDist),   Object.values(data.insuranceDist));
    drawLineChart("chartRegistrations", Object.keys(data.registrationByMonth), Object.values(data.registrationByMonth), "Registrations");
    drawBarChart("chartBilling",   Object.keys(data.billingByStatus), Object.values(data.billingByStatus), "₦ Amount",      ["#f59e0b","#10b981","#3b82f6","#94a3b8"]);
  } catch(e) { console.warn("Analytics:", e.message); }
}

function drawBarChart(canvasId, labels, values, yLabel, colors) {
  const canvas = document.querySelector(`#${canvasId}`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.parentElement.clientWidth - 40 || 400;
  const H = parseInt(canvas.getAttribute("height")) || 220;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);
  const pad = { top: 20, right: 20, bottom: 50, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const max = Math.max(...values, 1);
  const barW = Math.max(20, chartW / labels.length - 8);
  ctx.fillStyle = "#94a3b8"; ctx.font = "11px Inter, sans-serif";
  labels.forEach((label, i) => {
    const x = pad.left + i * (chartW / labels.length) + (chartW / labels.length - barW) / 2;
    const barH = (values[i] / max) * chartH;
    const y = pad.top + chartH - barH;
    ctx.fillStyle = colors ? colors[i % colors.length] : "#2563eb";
    ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 4); ctx.fill();
    ctx.fillStyle = "#64748b"; ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(values[i], x + barW/2, y - 4);
    ctx.fillText(label.length > 10 ? label.slice(0,10)+"…" : label, x + barW/2, H - pad.bottom + 16);
  });
}

function drawPieChart(canvasId, labels, values) {
  const canvas = document.querySelector(`#${canvasId}`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.parentElement.clientWidth - 40 || 300;
  const H = parseInt(canvas.getAttribute("height")) || 220;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);
  const total = values.reduce((a,b) => a+b, 0) || 1;
  const colors = ["#2563eb","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];
  const cx = W * 0.35, cy = H / 2, r = Math.min(cx, cy) - 10;
  let angle = -Math.PI / 2;
  values.forEach((v, i) => {
    const slice = (v / total) * 2 * Math.PI;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice); ctx.closePath();
    ctx.fillStyle = colors[i % colors.length]; ctx.fill();
    angle += slice;
  });
  // Legend
  labels.forEach((label, i) => {
    const lx = W * 0.72, ly = 30 + i * 28;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(lx, ly, 12, 12);
    ctx.fillStyle = "#334155"; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`${label}: ${values[i]}`, lx + 16, ly + 10);
  });
}

function drawLineChart(canvasId, labels, values, yLabel) {
  const canvas = document.querySelector(`#${canvasId}`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.parentElement.clientWidth - 40 || 400;
  const H = parseInt(canvas.getAttribute("height")) || 220;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);
  const pad = { top: 20, right: 20, bottom: 50, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const max = Math.max(...values, 1);
  const step = chartW / Math.max(labels.length - 1, 1);
  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, "rgba(37,99,235,.3)"); grad.addColorStop(1, "rgba(37,99,235,0)");
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = pad.left + i * step;
    const y = pad.top + chartH - (v / max) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + (values.length-1) * step, pad.top + chartH);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.fillStyle = grad; ctx.fill();
  // Line
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = pad.left + i * step;
    const y = pad.top + chartH - (v / max) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.stroke();
  // Dots + labels
  values.forEach((v, i) => {
    const x = pad.left + i * step;
    const y = pad.top + chartH - (v / max) * chartH;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2);
    ctx.fillStyle = "#2563eb"; ctx.fill();
    ctx.fillStyle = "#64748b"; ctx.font = "10px Inter"; ctx.textAlign = "center";
    ctx.fillText(labels[i] || "", x, H - pad.bottom + 16);
  });
}

// ── PATIENT TIMELINE ───────────────────────────────────────────
async function showPatientTimeline(patientId) {
  const modal = document.querySelector("#timelineModal");
  const body  = document.querySelector("#timelineModalBody");
  const title = document.querySelector("#timelineModalTitle");
  if (!modal || !body) return;
  try {
    const tl = await api(`/api/patients/${patientId}/timeline`);
    title.textContent = `Timeline — ${tl.patient.name} (${patientId})`;
    // Merge all events into a chronological list
    const events = [
      ...tl.encounters.map(e => ({ date: e.date, type: "encounter", label: "Encounter", detail: `${e.unit} · ${e.chiefComplaint || ""} · ${e.status}` })),
      ...tl.appointments.map(a => ({ date: a.date, type: "appointment", label: "Appointment", detail: `${a.department} with ${a.doctor} · ${a.status}` })),
      ...tl.labResults.map(l => ({ date: l.date, type: "lab", label: "Lab Result", detail: l.tests.map(t => `${t.name}: ${t.value} ${t.unit} (${t.interpretation})`).join(", ") + (l.criticalFlag ? " ⚠️ CRITICAL" : "") })),
      ...tl.billing.map(b => ({ date: b.date, type: "billing", label: "Bill", detail: `${b.service} — ₦${b.totalAmount.toLocaleString()} (${b.status})` })),
      ...tl.admissions.map(a => ({ date: a.admissionDate, type: "admission", label: "Admission", detail: `${a.ward} · ${a.admissionDiagnosis} · ${a.status}` }))
    ].sort((a,b) => (b.date || "").localeCompare(a.date || ""));

    const patientInfo = `
      <div style="background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:20px;">
        <strong style="font-size:16px;">${tl.patient.name}</strong>
        <div style="font-size:13px;color:var(--muted);margin-top:4px;">
          ${tl.patient.sex}, ${tl.patient.age} yrs &bull; ${tl.patient.bloodGroup || ""} &bull; ${tl.patient.lga}, ${tl.patient.community}
        </div>
        <div style="font-size:12px;margin-top:6px;">
          Insurance: <strong>${tl.patient.insurance}</strong> &bull;
          Allergies: <strong style="color:#dc2626;">${tl.patient.allergies?.join(", ") || "None"}</strong> &bull;
          Next of Kin: ${tl.patient.nextOfKin || "—"}
        </div>
      </div>`;

    body.innerHTML = patientInfo + `<div class="timeline-wrap">${
      events.length ? events.map(ev => `
        <div class="timeline-item ${ev.type}">
          <div class="tl-date">${ev.date || "Unknown date"}</div>
          <div class="tl-card"><strong>${ev.label}</strong>${ev.detail}</div>
        </div>`).join("") : "<p style='color:var(--muted);'>No history on file for this patient.</p>"
    }</div>`;
    modal.style.display = "flex";
  } catch(err) {
    body.innerHTML = `<p style="color:#dc2626;">Could not load timeline: ${err.message}</p>`;
    modal.style.display = "flex";
  }
}
window.showPatientTimeline = showPatientTimeline;

// ── EWS CALCULATOR (Inline, auto-triggered from encounter form) ─
function setupEwsAutoCalc() {
  const vitalsInputs = document.querySelectorAll("#encounterForm input[name=bp], #encounterForm input[name=respiration], #encounterForm input[name=temperature], #encounterForm input[name=pulse], #encounterForm input[name=spo2]");
  vitalsInputs.forEach(input => {
    input.addEventListener("input", debounce(async () => {
      const form = document.querySelector("#encounterForm");
      if (!form) return;
      const f = formToObject(form);
      const vitals = { bp: f.bp||"120/80", temperature: f.temperature||"37", pulse: f.pulse||"80", respiration: f.respiration||"18", spo2: f.spo2||"98" };
      try {
        const ews = await api("/api/support/ews", { method: "POST", body: JSON.stringify({ vitals }) });
        let ewsEl = document.querySelector("#ewsInlineResult");
        if (!ewsEl) {
          ewsEl = document.createElement("div"); ewsEl.id = "ewsInlineResult";
          form.insertBefore(ewsEl, form.querySelector(".button-row"));
        }
        const riskClass = ews.overallRisk.includes("HIGH") ? "danger" : ews.overallRisk.includes("MODERATE") ? "warning" : "safe";
        ewsEl.innerHTML = `<div class="ews-overall ${riskClass}" style="margin:10px 0;">
          ⚡ EWS: qSOFA ${ews.qsofa.score}/3 · SIRS ${ews.sirs.score}/4 — ${ews.overallRisk}
        </div>`;
      } catch(e) { /* silent */ }
    }, 800));
  });
}
setupEwsAutoCalc();

function showEwsModal(data) {
  const modal = document.querySelector("#ewsModal");
  const body  = document.querySelector("#ewsModalBody");
  if (!modal || !body) return;
  const qClass = data.qsofa.score >= 2 ? "high" : data.qsofa.score === 1 ? "medium" : "low";
  const sClass = data.sirs.score >= 2 ? "high" : data.sirs.score === 1 ? "medium" : "low";
  const overall = data.overallRisk.includes("HIGH") ? "danger" : data.overallRisk.includes("MODERATE") ? "warning" : "safe";
  body.innerHTML = `
    <div class="ews-score-grid">
      <div class="ews-score-box ${qClass}">
        <div class="score-number">${data.qsofa.score}</div>
        <div class="score-label">qSOFA Score</div>
        <div class="score-risk">${data.qsofa.risk}</div>
        <ul class="ews-criteria-list">
          ${data.qsofa.criteria.length ? data.qsofa.criteria.map(c => `<li>${c}</li>`).join("") : "<li>No criteria met</li>"}
        </ul>
      </div>
      <div class="ews-score-box ${sClass}">
        <div class="score-number">${data.sirs.score}</div>
        <div class="score-label">SIRS Score</div>
        <div class="score-risk">${data.sirs.risk}</div>
        <ul class="ews-criteria-list">
          ${data.sirs.criteria.length ? data.sirs.criteria.map(c => `<li>${c}</li>`).join("") : "<li>No criteria met</li>"}
        </ul>
      </div>
    </div>
    <div class="ews-overall ${overall}">${data.recommendation}</div>
    <p style="font-size:11px;color:var(--muted);margin-top:10px;">${data.disclaimer}</p>`;
  modal.style.display = "flex";
}

// ── DRUG INTERACTION CHECKER ───────────────────────────────────
const drugCheckForm = document.querySelector("#drugCheckForm");
if (drugCheckForm) {
  drugCheckForm.addEventListener("submit", async e => {
    e.preventDefault();
    const drugs = document.querySelector("#drugCheckInput").value.split("\n").map(d => d.trim()).filter(Boolean);
    const allergies = document.querySelector("#drugAllergyInput").value.split(",").map(a => a.trim()).filter(Boolean);
    const resEl = document.querySelector("#drugCheckResults");
    try {
      const result = await api("/api/alerts/drug-check", { method: "POST", body: JSON.stringify({ drugs, allergies }) });
      if (!result.alerts.length) {
        resEl.innerHTML = '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;color:#065f46;font-weight:600;">✅ No interactions or allergy alerts found. Appears safe to prescribe.</div>';
        return;
      }
      resEl.innerHTML = `<p style="font-weight:700;margin-bottom:8px;">${result.alertCount} alert${result.alertCount > 1 ? "s" : ""} found:</p>` +
        result.alerts.map(a => `<div class="drug-alert-card ${a.severity}">
          <div class="alert-type">${a.type} — ${a.severity}</div>
          <div class="alert-message">${a.message}</div>
        </div>`).join("");
    } catch(err) { resEl.innerHTML = `<p style="color:#dc2626;">Error: ${err.message}</p>`; }
  });
}

// ── AI TRIAGE TOOL (in AI Suite) ──────────────────────────────
// Upgrade the Clinical view with triage + autonote tools
function upgradeAiView() {
  const aiSection = document.querySelector("#ai");
  if (!aiSection) return;
  // Add the drug checker button and triage form above existing content
  const toolBar = document.createElement("div");
  toolBar.style.cssText = "margin-bottom:16px;";
  toolBar.innerHTML = `
    <div class="ai-tool-grid">
      <div class="ai-tool-card" onclick="document.getElementById('drugModal').style.display='flex'">
        <div class="tool-icon">💊</div>
        <div class="tool-name">Drug & Allergy Check</div>
        <div class="tool-desc">Check drug interactions and patient allergy conflicts</div>
      </div>
      <div class="ai-tool-card" id="triageToolCard">
        <div class="tool-icon">🧠</div>
        <div class="tool-name">Symptom Triage Engine</div>
        <div class="tool-desc">AI acuity scoring + differential diagnosis suggestions</div>
      </div>
      <div class="ai-tool-card" id="ewsToolCard">
        <div class="tool-icon">⚠️</div>
        <div class="tool-name">EWS / Sepsis Monitor</div>
        <div class="tool-desc">qSOFA & SIRS score calculator from vitals</div>
      </div>
      <div class="ai-tool-card" id="autoNoteCard">
        <div class="tool-icon">🎙️</div>
        <div class="tool-name">Auto-Note Generator</div>
        <div class="tool-desc">Generate SOAP notes from vitals and complaint</div>
      </div>
    </div>
    <!-- Triage Form -->
    <div id="triagePanel" style="display:none;" class="ai-panel">
      <div class="ai-panel-title">🧠 Symptom Triage + Differential Diagnosis</div>
      <form id="triageForm" class="stack-form">
        <label>Symptoms (one per line)
          <textarea id="triageSymptoms" rows="3" placeholder="fever\nheadache\nvomiting"></textarea>
        </label>
        <div class="vitals-grid compact">
          <label>Temp<input id="triageTemp" placeholder="37.0"></label>
          <label>BP<input id="triageBp" placeholder="120/80"></label>
          <label>Pulse<input id="triagePulse" placeholder="80"></label>
          <label>RR<input id="triageRr" placeholder="18"></label>
          <label>SpO2<input id="triageSpo2" placeholder="98"></label>
        </div>
        <div class="form-row">
          <label>Age<input id="triageAge" type="number" placeholder="35"></label>
          <label>Sex<select id="triageSex"><option>Female</option><option>Male</option></select></label>
        </div>
        <label>Free text / additional history
          <textarea id="triageFreeText" rows="2" placeholder="Patient is 32 weeks pregnant, known diabetic..."></textarea>
        </label>
        <button class="primary-btn" type="submit">Run AI Triage</button>
      </form>
      <div id="triageResult"></div>
    </div>
    <!-- EWS Form -->
    <div id="ewsPanel" style="display:none;" class="ai-panel">
      <div class="ai-panel-title">⚠️ Early Warning Score Calculator</div>
      <form id="ewsForm" class="stack-form">
        <div class="vitals-grid compact">
          <label>Temp<input id="ewsTemp" placeholder="37.0"></label>
          <label>BP<input id="ewsBp" placeholder="120/80"></label>
          <label>Pulse<input id="ewsPulse" placeholder="80"></label>
          <label>RR<input id="ewsRr" placeholder="18"></label>
          <label>SpO2<input id="ewsSpo2" placeholder="98"></label>
        </div>
        <label>GCS (Glasgow Coma Scale, 3-15)<input id="ewsGcs" type="number" min="3" max="15" value="15"></label>
        <button class="primary-btn" type="submit">Calculate EWS</button>
      </form>
      <div id="ewsResult"></div>
    </div>
    <!-- Auto-Note Form -->
    <div id="autoNotePanel" style="display:none;" class="ai-panel">
      <div class="ai-panel-title">🎙️ Ambient AI Auto-Note Generator</div>
      <form id="autoNoteForm" class="stack-form">
        <label>Chief Complaint<textarea id="anComplaint" rows="2" placeholder="Fever with chills for 3 days"></textarea></label>
        <div class="vitals-grid compact">
          <label>Temp<input id="anTemp" placeholder="37.0"></label>
          <label>BP<input id="anBp" placeholder="120/80"></label>
          <label>Pulse<input id="anPulse" placeholder="80"></label>
          <label>RR<input id="anRr" placeholder="18"></label>
          <label>SpO2<input id="anSpo2" placeholder="98"></label>
          <label>Weight<input id="anWeight" placeholder="70"></label>
        </div>
        <div class="form-row">
          <label>Age<input id="anAge" type="number" placeholder="35"></label>
          <label>Sex<select id="anSex"><option>Female</option><option>Male</option></select></label>
        </div>
        <label>Known Allergies<input id="anAllergies" placeholder="Penicillin, Sulfa"></label>
        <label>Chronic Conditions<input id="anConditions" placeholder="Hypertension, Diabetes"></label>
        <button class="primary-btn" type="submit">Generate SOAP Note</button>
      </form>
      <div id="autoNoteResult"></div>
    </div>`;
  aiSection.insertBefore(toolBar, aiSection.firstChild);

  // Toggle tool panels
  document.querySelector("#triageToolCard")?.addEventListener("click", () => {
    togglePanel("triagePanel");
  });
  document.querySelector("#ewsToolCard")?.addEventListener("click", () => {
    togglePanel("ewsPanel");
  });
  document.querySelector("#autoNoteCard")?.addEventListener("click", () => {
    togglePanel("autoNotePanel");
  });

  // Triage submit
  document.querySelector("#triageForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const symptoms = document.querySelector("#triageSymptoms").value.split("\n").map(s=>s.trim()).filter(Boolean);
    const vitals = { temperature: document.querySelector("#triageTemp").value, bp: document.querySelector("#triageBp").value, pulse: document.querySelector("#triagePulse").value, respiration: document.querySelector("#triageRr").value, spo2: document.querySelector("#triageSpo2").value };
    const age = parseInt(document.querySelector("#triageAge").value) || null;
    const sex = document.querySelector("#triageSex").value;
    const freeText = document.querySelector("#triageFreeText").value;
    try {
      const result = await api("/api/support/triage", { method: "POST", body: JSON.stringify({ symptoms, vitals, age, sex, freeText }) });
      const resEl = document.querySelector("#triageResult");
      resEl.innerHTML = `
        <div class="triage-acuity ${result.acuity}">${result.acuity === "Emergency" ? "🚨" : result.acuity === "Urgent" ? "⚡" : "✅"} ACUITY: ${result.acuity.toUpperCase()}</div>
        ${result.redFlags.length ? `<div style="background:#fef2f2;border-radius:8px;padding:10px 14px;margin-bottom:10px;"><strong style="color:#dc2626;">🚩 Red Flags</strong><ul style="margin:6px 0 0;">${result.redFlags.map(r=>`<li style="font-size:13px;">${r}</li>`).join("")}</ul></div>` : ""}
        <p class="ai-section-label">Differential Diagnoses</p>
        ${result.differentials.map(d => `<div class="differential-item">
          <span class="rank">${d.rank}</span>
          <div><div class="dx-name">${d.diagnosis}</div><div class="dx-reason">${d.reasoning}</div></div>
          <span class="confidence">${d.confidence}</span>
        </div>`).join("")}
        ${result.suggestedOrders.length ? `<p class="ai-section-label" style="margin-top:12px;">Suggested Orders</p>
          <ul>${result.suggestedOrders.map(o=>`<li style="font-size:13px;">${o}</li>`).join("")}</ul>` : ""}
        <p style="font-size:11px;color:var(--muted);margin-top:10px;">${result.disclaimer}</p>`;
    } catch(err) { document.querySelector("#triageResult").innerHTML = `<p style="color:#dc2626;">${err.message}</p>`; }
  });

  // EWS submit
  document.querySelector("#ewsForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const vitals = { temperature: document.querySelector("#ewsTemp").value, bp: document.querySelector("#ewsBp").value, pulse: document.querySelector("#ewsPulse").value, respiration: document.querySelector("#ewsRr").value, spo2: document.querySelector("#ewsSpo2").value };
    const gcs = document.querySelector("#ewsGcs").value;
    try {
      const result = await api("/api/support/ews", { method: "POST", body: JSON.stringify({ vitals, gcs: parseInt(gcs) }) });
      showEwsModal(result);
    } catch(err) { showToast("EWS error: " + err.message); }
  });

  // Auto-note submit
  document.querySelector("#autoNoteForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      chiefComplaint: document.querySelector("#anComplaint").value,
      vitals: { temperature: document.querySelector("#anTemp").value, bp: document.querySelector("#anBp").value, pulse: document.querySelector("#anPulse").value, respiration: document.querySelector("#anRr").value, spo2: document.querySelector("#anSpo2").value, weight: document.querySelector("#anWeight").value },
      age: parseInt(document.querySelector("#anAge").value),
      sex: document.querySelector("#anSex").value,
      allergies: document.querySelector("#anAllergies").value.split(",").map(a=>a.trim()).filter(Boolean),
      conditions: document.querySelector("#anConditions").value.split(",").map(c=>c.trim()).filter(Boolean)
    };
    try {
      const result = await api("/api/support/autonote", { method: "POST", body: JSON.stringify(payload) });
      const resEl = document.querySelector("#autoNoteResult");
      const s = result.soap;
      resEl.innerHTML = `
        <p style="font-size:11px;color:var(--brand);font-weight:700;margin:12px 0 8px;">AI-GENERATED SOAP NOTE — REVIEW BEFORE USE</p>
        <div class="soap-block"><div class="soap-label">Subjective</div><div class="soap-text">${s.subjective}</div></div>
        <div class="soap-block"><div class="soap-label">Objective</div><div class="soap-text">${s.objective}</div></div>
        <div class="soap-block"><div class="soap-label">Assessment</div><div class="soap-text">${s.assessment}</div></div>
        <div class="soap-block"><div class="soap-label">Plan</div><div class="soap-text">${s.plan}</div></div>
        <p style="font-size:11px;color:var(--muted);margin-top:8px;">${result.disclaimer}</p>`;
    } catch(err) { document.querySelector("#autoNoteResult").innerHTML = `<p style="color:#dc2626;">${err.message}</p>`; }
  });
}

function togglePanel(id) {
  const panels = ["triagePanel","ewsPanel","autoNotePanel"];
  panels.forEach(pid => {
    const el = document.querySelector(`#${pid}`);
    if (el) el.style.display = pid === id && el.style.display === "none" ? "block" : "none";
  });
}

// ── Debounce utility ──────────────────────────────────────────
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// Initialise all new features
upgradeAiView();
loadAllNewData();

// Onboarding guided workflow step-links click handlers
document.querySelectorAll(".step-link").forEach(link => {
  link.addEventListener("click", () => {
    const view = link.dataset.stepView;
    if (view) switchView(view);
  });
});

// Collapsible dashboard panels toggle helper
function toggleDashboardPanel(contentId) {
  const content = document.getElementById(contentId);
  if (!content) return;
  const panel = content.parentElement;
  const isCollapsed = content.style.display === "none";
  content.style.display = isCollapsed ? "block" : "none";
  panel.classList.toggle("expanded", isCollapsed);
}
window.toggleDashboardPanel = toggleDashboardPanel;

// Sub-tabs switching helper for Triage & A&E Command
function switchTriageSubTab(tab) {
  const triageBtn = document.querySelector("#tabTriageBtn");
  const emergencyBtn = document.querySelector("#tabEmergencyBtn");
  const triageForm = document.querySelector("#formSubTriage");
  const emergencyForm = document.querySelector("#formSubEmergency");
  
  if (tab === "triage") {
    triageBtn?.classList.add("active");
    emergencyBtn?.classList.remove("active");
    if (triageForm) triageForm.style.display = "block";
    if (emergencyForm) emergencyForm.style.display = "none";
  } else {
    triageBtn?.classList.remove("active");
    emergencyBtn?.classList.add("active");
    if (triageForm) triageForm.style.display = "none";
    if (emergencyForm) emergencyForm.style.display = "block";
  }
}
window.switchTriageSubTab = switchTriageSubTab;

// Patch loadAllNewData to render new logs
const origLoadAllNewData = loadAllNewData;
loadAllNewData = async function() {
  await origLoadAllNewData();
  renderCombinedQueue();
  renderPharmacyLog();
  renderRadiologyLog();
  renderMaternityLog();
  renderImmunizationLog();
  renderTheatreLog();
  renderReferralsLog();
};

// ── NEW VIEWS RENDERING LOGS ──────────────────────────────────
function renderCombinedQueue() {
  const el = document.querySelector("#combinedQueueTable");
  if (!el) return;
  const queue = (state.encounters || []).filter(e => e.unit === "Triage" || e.unit === "Emergency");
  if (!queue.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted);text-align:center;">No active patients in triage or A&E queue.</p>'; return; }
  el.innerHTML = `
    <table><thead><tr><th>Date</th><th>Type</th><th>Patient</th><th>Vitals</th><th>Priority</th><th>Details / Survey</th></tr></thead>
    <tbody>
      ${queue.map(e => {
        const typeBadge = e.unit === "Emergency" ? '<span class="badge danger">A&E</span>' : '<span class="badge info">Triage</span>';
        const gcsText = e.unit === "Emergency" && e.gcs ? ` · <strong>GCS:</strong> ${e.gcs}/15` : "";
        const vitalsText = `T:${e.vitals?.temperature || "—"}°C, BP:${e.vitals?.bp || "—"}, P:${e.vitals?.pulse || "—"}bpm, SpO2:${e.vitals?.spo2 || "—"}%`;
        return `<tr>
          <td>${e.date}</td>
          <td>${typeBadge}</td>
          <td><strong>${patientName(e.patientId)}</strong></td>
          <td><span style="font-size:11px;color:var(--muted);">${vitalsText}</span></td>
          <td><span class="${badgeClass(e.status)}">${e.status}</span></td>
          <td><span style="font-size:12px;"><strong>CC:</strong> ${e.chiefComplaint}${gcsText}</span></td>
        </tr>`;
      }).join("")}
    </tbody></table>`;
}

function renderPharmacyLog() {
  const el = document.querySelector("#pharmacyLogTable");
  if (!el) return;
  const rx = (state.encounters || []).filter(e => e.unit === "Pharmacy");
  if (!rx.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted);text-align:center;">No dispensed logs.</p>'; return; }
  el.innerHTML = `
    <table><thead><tr><th>Date</th><th>Patient</th><th>Drug Class</th><th>Formulation</th><th>Status</th></tr></thead>
    <tbody>
      ${rx.map(e => `<tr>
        <td>${e.date}</td>
        <td><strong>${patientName(e.patientId)}</strong></td>
        <td>${e.drugCategory || "General"}</td>
        <td>${e.chiefComplaint}</td>
        <td><span class="badge success">${e.status || "Closed"}</span></td>
      </tr>`).join("")}
    </tbody></table>`;
}

function renderRadiologyLog() {
  const el = document.querySelector("#radiologyLogTable");
  if (!el) return;
  const rad = (state.encounters || []).filter(e => e.unit === "Radiology");
  if (!rad.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted);text-align:center;">No radiology cases reported.</p>'; return; }
  el.innerHTML = `
    <table><thead><tr><th>Date</th><th>Patient</th><th>Study</th><th>Priority</th><th>Findings</th></tr></thead>
    <tbody>
      ${rad.map(e => `<tr>
        <td>${e.date}</td>
        <td><strong>${patientName(e.patientId)}</strong></td>
        <td>${e.chiefComplaint}</td>
        <td><span class="badge info">${e.status || "Open"}</span></td>
        <td>${e.plan}</td>
      </tr>`).join("")}
    </tbody></table>`;
}

function renderMaternityLog() {
  const el = document.querySelector("#maternityLogTable");
  if (!el) return;
  const mat = (state.encounters || []).filter(e => e.unit === "ANC");
  if (!mat.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted);text-align:center;">No maternal records logged.</p>'; return; }
  el.innerHTML = `
    <table><thead><tr><th>Date</th><th>Patient</th><th>Visit Type</th><th>GA</th><th>FHR</th><th>BP</th></tr></thead>
    <tbody>
      ${mat.map(e => `<tr>
        <td>${e.date}</td>
        <td><strong>${patientName(e.patientId)}</strong></td>
        <td>${e.visitType || "ANC Booking"}</td>
        <td>${e.ga || "—"} wks</td>
        <td>${e.fhr || "—"} bpm</td>
        <td>${e.vitals?.bp || "—"}</td>
      </tr>`).join("")}
    </tbody></table>`;
}

function renderImmunizationLog() {
  const el = document.querySelector("#immunizationLogTable");
  if (!el) return;
  const imm = (state.encounters || []).filter(e => e.unit === "Immunization");
  if (!imm.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted);text-align:center;">No vaccination records logged.</p>'; return; }
  el.innerHTML = `
    <table><thead><tr><th>Date</th><th>Patient</th><th>Antigen / Vaccine</th><th>Status</th><th>Defaulter Plan</th></tr></thead>
    <tbody>
      ${imm.map(e => `<tr>
        <td>${e.date}</td>
        <td><strong>${patientName(e.patientId)}</strong></td>
        <td>${e.chiefComplaint}</td>
        <td><span class="badge success">${e.status}</span></td>
        <td>${e.plan}</td>
      </tr>`).join("")}
    </tbody></table>`;
}

function renderTheatreLog() {
  const el = document.querySelector("#theatreLogTable");
  if (!el) return;
  const thr = (state.encounters || []).filter(e => e.unit === "Theatre");
  if (!thr.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted);text-align:center;">No surgical records logged.</p>'; return; }
  el.innerHTML = `
    <table><thead><tr><th>Date</th><th>Patient</th><th>Category</th><th>Procedure Name</th><th>Safety Checklist</th></tr></thead>
    <tbody>
      ${thr.map(e => `<tr>
        <td>${e.date}</td>
        <td><strong>${patientName(e.patientId)}</strong></td>
        <td>${e.procedureCategory || "General"}</td>
        <td>${e.chiefComplaint}</td>
        <td>${e.assessment?.slice(0, 30) || "—"}…</td>
      </tr>`).join("")}
    </tbody></table>`;
}

function renderReferralsLog() {
  const el = document.querySelector("#referralsLogTable");
  if (!el) return;
  const ref = (state.encounters || []).filter(e => e.unit === "Referrals");
  if (!ref.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted);text-align:center;">No outpatient referrals issued.</p>'; return; }
  el.innerHTML = `
    <table><thead><tr><th>Date</th><th>Patient</th><th>Destination</th><th>Reason</th><th>Transfer Plan</th></tr></thead>
    <tbody>
      ${ref.map(e => `<tr>
        <td>${e.date}</td>
        <td><strong>${patientName(e.patientId)}</strong></td>
        <td>${e.destination || "General Hospital"}</td>
        <td>${e.chiefComplaint}</td>
        <td>${e.plan}</td>
      </tr>`).join("")}
    </tbody></table>`;
}

// ── WIRE NEW CLINICAL FORM SUBMISSIONS ────────────────────────
function wireFormSubmits() {
  const formMap = [
    { id: "triagePageForm", unit: "Triage", msg: "Triage registered successfully." },
    { id: "emergencyPageForm", unit: "Emergency", msg: "Emergency resus bay record saved." },
    { id: "pharmacyPageForm", unit: "Pharmacy", msg: "Medication dispensed & bill created." },
    { id: "radiologyPageForm", unit: "Radiology", msg: "Radiology scan logged." },
    { id: "maternityPageForm", unit: "ANC", msg: "Maternity ANC check completed." },
    { id: "immunizationPageForm", unit: "Immunization", msg: "Vaccination dose recorded." },
    { id: "theatrePageForm", unit: "Theatre", msg: "Operative procedure logged." },
    { id: "referralsPageForm", unit: "Referrals", msg: "Outpatient referral issued." }
  ];

  formMap.forEach(({ id, unit, msg }) => {
    const el = document.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener("submit", async e => {
      e.preventDefault();
      const f = formToObject(e.currentTarget);
      const payload = {
        patientId: f.patientId, facilityId: f.facilityId, unit,
        chiefComplaint: f.chiefComplaint || f.procedureCategory || f.visitType || "",
        vitals: {
          temperature: f.temperature || "", bp: f.bp || "",
          pulse: f.pulse || "", respiration: f.respiration || "",
          spo2: f.spo2 || "", weight: f.weight || ""
        },
        assessment: f.assessment || "", plan: f.plan || "",
        status: f.status || "Open",
        // Extra fields
        gcs: f.gcs || "",
        visitType: f.visitType || "", parity: f.parity || "", ga: f.ga || "", fhr: f.fhr || "",
        drugCategory: f.drugCategory || "", procedureCategory: f.procedureCategory || "",
        anaesthesia: f.anaesthesia || "", destination: f.destination || ""
      };
      try {
        await api("/api/encounters", { method: "POST", body: JSON.stringify(payload) });
        showToast(msg);
        e.currentTarget.reset();
        await loadData();
      } catch(err) { showToast("Submission failed: " + err.message); }
    });
  });
}

// Initialise form submission listeners
wireFormSubmits();
loadAllNewData();

// ---------------------------------------------------------------
//  GENERIC RECORD EDIT SYSTEM
// ---------------------------------------------------------------
function openEditRecordModal(collection, id) {
  const collectionList = {
    patients: state.patients,
    consultations: state.consultations,
    appointments: state.appointments,
    orders: state.orders,
    billing: state.billing
  };
  const list = collectionList[collection];
  if (!list) return;
  const record = list.find(r => r.id === id);
  if (!record) return;

  const titleEl = document.querySelector("#editRecordModalTitle");
  const collectionHidden = document.querySelector("#editRecordCollection");
  const idHidden = document.querySelector("#editRecordId");
  const fieldsEl = document.querySelector("#editRecordFields");

  titleEl.textContent = `Edit Record — ${record.id}`;
  collectionHidden.value = collection;
  idHidden.value = id;

  let fieldsHtml = "";

  if (collection === "patients") {
    fieldsHtml = `
      <label>Full Name
        <input type="text" name="name" value="${record.name || ''}" required />
      </label>
      <div class="form-row">
        <label>Age (Yrs)
          <input type="number" name="age" value="${record.age || 0}" required />
        </label>
        <label>Sex
          <select name="sex">
            <option ${record.sex === 'Male' ? 'selected' : ''}>Male</option>
            <option ${record.sex === 'Female' ? 'selected' : ''}>Female</option>
            <option ${record.sex === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </label>
      </div>
      <div class="form-row">
        <label>LGA
          <input type="text" name="lga" value="${record.lga || ''}" />
        </label>
        <label>Community
          <input type="text" name="community" value="${record.community || ''}" />
        </label>
      </div>
      <div class="form-row">
        <label>Insurance Provider
          <select name="insurance">
            <option ${record.insurance === 'Private Pay' ? 'selected' : ''}>Private Pay</option>
            <option ${record.insurance === 'PLASCHEMA' ? 'selected' : ''}>PLASCHEMA</option>
            <option ${record.insurance === 'NHIA' ? 'selected' : ''}>NHIA</option>
          </select>
        </label>
        <label>Clinical Risk Level
          <select name="risk">
            <option ${record.risk === 'Routine' ? 'selected' : ''}>Routine</option>
            <option ${record.risk === 'Medium' ? 'selected' : ''}>Medium</option>
            <option ${record.risk === 'High' ? 'selected' : ''}>High</option>
          </select>
        </label>
      </div>
      <label>Allergies (comma-separated)
        <input type="text" name="allergies" value="${(record.allergies || []).join(', ')}" />
      </label>
    `;
  } else if (collection === "consultations") {
    fieldsHtml = `
      <label>Chief Complaint / Symptoms
        <textarea name="chiefComplaint" rows="3" required>${record.chiefComplaint || ''}</textarea>
      </label>
      <label>History of Presenting Illness
        <textarea name="historyOfPresentingComplaint" rows="3">${record.historyOfPresentingComplaint || ''}</textarea>
      </label>
      <label>Past Medical History
        <textarea name="pastMedicalHistory" rows="3">${record.pastMedicalHistory || ''}</textarea>
      </label>
      <label>Clinical Examination Findings
        <textarea name="examinationFindings" rows="3">${record.examinationFindings || ''}</textarea>
      </label>
      <label>Assessment
        <textarea name="assessment" rows="3" required>${record.assessment || ''}</textarea>
      </label>
      <label>Management Plan
        <textarea name="plan" rows="3" required>${record.plan || ''}</textarea>
      </label>
    `;
  } else if (collection === "appointments") {
    fieldsHtml = `
      <div class="form-row">
        <label>Appointment Date
          <input type="date" name="date" value="${record.date || ''}" required />
        </label>
        <label>Time
          <input type="time" name="time" value="${record.time || '08:00'}" required />
        </label>
      </div>
      <div class="form-row">
        <label>Department
          <input type="text" name="department" value="${record.department || 'OPD'}" required />
        </label>
        <label>Assigned Doctor
          <input type="text" name="doctor" value="${record.doctor || ''}" />
        </label>
      </div>
      <label>Reason for Visit
        <input type="text" name="reason" value="${record.reason || ''}" />
      </label>
      <label>Status
        <select name="status">
          <option ${record.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
          <option ${record.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option ${record.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          <option ${record.status === 'No-Show' ? 'selected' : ''}>No-Show</option>
        </select>
      </label>
    `;
  } else if (collection === "orders") {
    fieldsHtml = `
      <label>Item Name / Description
        <input type="text" name="item" value="${record.item || ''}" required />
      </label>
      <div class="form-row">
        <label>Order Type
          <select name="type">
            <option ${record.type === 'Laboratory' ? 'selected' : ''}>Laboratory</option>
            <option ${record.type === 'Radiology' ? 'selected' : ''}>Radiology</option>
            <option ${record.type === 'Pharmacy' ? 'selected' : ''}>Pharmacy</option>
            <option ${record.type === 'Procedure' ? 'selected' : ''}>Procedure</option>
          </select>
        </label>
        <label>Priority
          <select name="priority">
            <option ${record.priority === 'Routine' ? 'selected' : ''}>Routine</option>
            <option ${record.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
            <option ${record.priority === 'Emergency' ? 'selected' : ''}>Emergency</option>
          </select>
        </label>
      </div>
      <label>Status
        <select name="status">
          <option ${record.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option ${record.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option ${record.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </label>
    `;
  } else if (collection === "billing") {
    fieldsHtml = `
      <label>Service Category
        <input type="text" name="service" value="${record.service || ''}" required />
      </label>
      <label>Description
        <input type="text" name="description" value="${record.description || ''}" required />
      </label>
      <div class="form-row">
        <label>Total Price (₦)
          <input type="number" name="totalAmount" value="${record.totalAmount || 0}" required />
        </label>
        <label>Patient Payable (₦)
          <input type="number" name="patientPayable" value="${record.patientPayable || 0}" required />
        </label>
      </div>
      <label>Invoice Status
        <select name="status">
          <option ${record.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option ${record.status === 'Paid' ? 'selected' : ''}>Paid</option>
          <option ${record.status === 'Claimed' ? 'selected' : ''}>Claimed</option>
          <option ${record.status === 'Waived' ? 'selected' : ''}>Waived</option>
        </select>
      </label>
    `;
  }

  fieldsEl.innerHTML = fieldsHtml;
  document.querySelector("#editRecordModal").style.display = "flex";
}
window.openEditRecordModal = openEditRecordModal;

// Wire Edit Record Form Submit
const editRecordForm = document.querySelector("#editRecordForm");
if (editRecordForm) {
  editRecordForm.addEventListener("submit", async e => {
    e.preventDefault();
    const collection = document.querySelector("#editRecordCollection").value;
    const id = document.querySelector("#editRecordId").value;
    const formData = formToObject(e.currentTarget);

    if (collection === "patients" && typeof formData.allergies === "string") {
      formData.allergies = formData.allergies.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (collection === "billing") {
      formData.totalAmount = Number(formData.totalAmount);
      formData.patientPayable = Number(formData.patientPayable);
      const originalBill = state.billing.find(b => b.id === id);
      if (originalBill) {
        formData.insuranceCovered = Math.max(0, formData.totalAmount - formData.patientPayable);
      }
    }

    try {
      await api("/api/update-record", {
        method: "POST",
        body: JSON.stringify({ collection, id, fields: formData })
      });
      showToast("Changes saved successfully.");
      document.querySelector("#editRecordModal").style.display = "none";
      await loadData();
    } catch (err) {
      showToast("Error updating record: " + err.message);
    }
  });
}

// ---------------------------------------------------------------
//  CONSULTATION PATIENT INLINE EDIT SYSTEM
// ---------------------------------------------------------------
function setupConsultationPatientEdit() {
  const conPatSelect = document.querySelector("#consultationPatient");
  const conPatEditCard = document.querySelector("#consultationPatientEditCard");
  if (conPatSelect && conPatEditCard) {
    conPatSelect.addEventListener("change", () => {
      const patId = conPatSelect.value;
      if (!patId) {
        conPatEditCard.style.display = "none";
        return;
      }
      const patient = state.patients.find(p => p.id === patId);
      if (!patient) {
        conPatEditCard.style.display = "none";
        return;
      }
      document.querySelector("#conPatAge").value = patient.age || 0;
      document.querySelector("#conPatSex").value = patient.sex || "Male";
      document.querySelector("#conPatInsurance").value = patient.insurance || "Private Pay";
      document.querySelector("#conPatRisk").value = patient.risk || "Routine";
      document.querySelector("#conPatAllergies").value = (patient.allergies || []).join(", ");
      conPatEditCard.style.display = "block";
    });
  }

  const saveConPatBtn = document.querySelector("#saveConPatBtn");
  if (saveConPatBtn) {
    saveConPatBtn.addEventListener("click", async () => {
      const patId = document.querySelector("#consultationPatient").value;
      if (!patId) return;
      const age = Number(document.querySelector("#conPatAge").value);
      const sex = document.querySelector("#conPatSex").value;
      const insurance = document.querySelector("#conPatInsurance").value;
      const risk = document.querySelector("#conPatRisk").value;
      const allergiesStr = document.querySelector("#conPatAllergies").value;
      const allergies = allergiesStr.split(",").map(s => s.trim()).filter(Boolean);

      try {
        await api("/api/update-record", {
          method: "POST",
          body: JSON.stringify({
            collection: "patients",
            id: patId,
            fields: { age, sex, insurance, risk, allergies }
          })
        });
        showToast("Patient demographics updated inline.");
        await loadData();
      } catch (err) {
        showToast("Error updating patient: " + err.message);
      }
    });
  }
}

// Initialize consultation patient editing once DOM is wired
setupConsultationPatientEdit();

// ---------------------------------------------------------------
//  AUTOMATIC ICD-11 DIAGNOSIS AUTO-SUGGEST
// ---------------------------------------------------------------
function wireIcd11SymptomSuggestions() {
  const configs = [
    {
      input: document.querySelector("#consultationForm textarea[name=chiefComplaint]"),
      suggestBox: document.querySelector("#consultationIcd11AutoSuggest"),
      searchEl: document.querySelector("#consultationIcd11Search"),
      resultsEl: document.querySelector("#consultationIcd11Results"),
      builderEl: document.querySelector("#consultationIcd11Builder"),
      extEl: document.querySelector("#consultationIcd11Extensions"),
      exprEl: document.querySelector("#consultationIcd11ExpressionPreview"),
      displayEl: document.querySelector("#consultationIcd11DisplayPreview"),
      codeHidden: document.querySelector("#consultationIcd11CodeHidden"),
      displayHidden: document.querySelector("#consultationIcd11DisplayHidden")
    },
    {
      input: document.querySelector("#encounterForm textarea[name=chiefComplaint]"),
      suggestBox: document.querySelector("#encounterIcd11AutoSuggest"),
      searchEl: document.querySelector("#icd11Search"),
      resultsEl: document.querySelector("#icd11Results"),
      builderEl: document.querySelector("#icd11Builder"),
      extEl: document.querySelector("#icd11Extensions"),
      exprEl: document.querySelector("#icd11ExpressionPreview"),
      displayEl: document.querySelector("#icd11DisplayPreview"),
      codeHidden: document.querySelector("#icd11CodeHidden"),
      displayHidden: document.querySelector("#icd11DisplayHidden")
    }
  ];

  configs.forEach(cfg => {
    if (!cfg.input || !cfg.suggestBox) return;

    cfg.input.addEventListener("input", debounce(async () => {
      const text = cfg.input.value.trim();
      if (text.length < 3) {
        cfg.suggestBox.style.display = "none";
        return;
      }
      try {
        const res = await api(`/api/icd11/suggest?symptoms=${encodeURIComponent(text)}`);
        if (res.suggestion) {
          const sug = res.suggestion;
          cfg.suggestBox.innerHTML = `
            <strong>💡 Suggested Diagnosis:</strong> ${sug.code} — ${sug.title} 
            <button type="button" class="text-btn" style="color:var(--brand-dark); font-weight:700; margin-left:8px; text-decoration:underline; cursor:pointer;" id="apply_sug_${sug.code}">Apply Diagnosis ✓</button>
          `;
          cfg.suggestBox.style.display = "block";

          const btn = cfg.suggestBox.querySelector("button");
          btn.addEventListener("click", () => {
            cfg.searchEl.value = `${sug.code} — ${sug.title}`;
            cfg.resultsEl.innerHTML = "";
            cfg.codeHidden.value = sug.code;
            cfg.displayHidden.value = sug.title;
            cfg.exprEl.textContent = sug.code;
            cfg.displayEl.textContent = sug.title;
            if (sug.allowedExtensions && sug.allowedExtensions.length) {
              cfg.builderEl.style.display = "block";
              const groups = {};
              sug.allowedExtensions.forEach(c => {
                const d = EXT_DEFS[c]; if (!d) return;
                (groups[d.axis] = groups[d.axis]||[]).push({code:c,...d});
              });
              cfg.extEl.innerHTML = Object.entries(groups).map(([axis,items]) => `
                <div class="icd11-extension-group">
                  <h5>${axis}</h5>
                  ${items.map(it=>`<label class="icd11-extension-option">
                    <input type="radio" name="axis_${axis.replace(/\s+/g,'_')}_${Math.random().toString(36).slice(2)}" value="${it.code}" data-title="${it.title}" />
                    <span>${it.title}</span></label>`).join("")}
                  <label class="icd11-extension-option">
                    <input type="radio" name="axis_${axis.replace(/\s+/g,'_')}_${Math.random().toString(36).slice(2)}" value="" checked />
                    <span style="color:var(--muted)">None</span></label>
                </div>`).join("");
              cfg.extEl.querySelectorAll("input[type=radio]").forEach(el => el.addEventListener("change", () => {
                let expr = sug.code, disp = sug.title;
                cfg.extEl.querySelectorAll("input[type=radio]:checked").forEach(rad => {
                  if (rad.value) { expr += "&"+rad.value; disp += ", "+rad.dataset.title; }
                });
                cfg.exprEl.textContent = expr; cfg.displayEl.textContent = disp;
                cfg.codeHidden.value = expr; cfg.displayHidden.value = disp;
              }));
            } else {
              cfg.builderEl.style.display = "none";
            }
            cfg.suggestBox.style.display = "none";
            showToast("Suggested diagnosis applied.");
          });
        } else {
          cfg.suggestBox.style.display = "none";
        }
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    }, 500));
  });
}

function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

wireIcd11SymptomSuggestions();


