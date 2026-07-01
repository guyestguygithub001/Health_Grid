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

async function showFhirModal(encounterId) {
  try {
    const fhirCondition = await api(`/api/fhir/Condition/${encounterId}`);
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "fhirModal";
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>HL7 FHIR R4 Condition</h3>
          <button type="button" style="border:none; background:none; font-size:20px; cursor:pointer;" onclick="document.getElementById('fhirModal').remove()">×</button>
        </div>
        <pre class="modal-body" style="margin:0; white-space: pre-wrap; word-break: break-all;"><code>${JSON.stringify(fhirCondition, null, 2)}</code></pre>
        <div class="modal-footer">
          <button class="primary-btn" style="padding: 6px 12px;" onclick="document.getElementById('fhirModal').remove()">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  } catch (error) {
    showToast("Error loading FHIR: " + error.message);
  }
}
window.showFhirModal = showFhirModal;

function renderEncounters() {
  const target = document.querySelector("#encounterList");
  target.innerHTML = state.encounters.slice(0, 6).map(encounter => {
    const icdText = encounter.icd11Code 
      ? `<div style="margin-top:6px; font-size:13px; color:var(--brand-dark);">
           <strong>ICD-11:</strong> <code>${encounter.icd11Code}</code> - ${encounter.icd11Display}
           <span class="fhir-badge" onclick="showFhirModal('${encounter.id}')">FHIR JSON</span>
         </div>`
      : "";
    return `
      <article class="record">
        <strong>${patientName(encounter.patientId)} <span class="${badgeClass(encounter.status)}">${encounter.status}</span></strong>
        <span>${encounter.unit} at ${facilityName(encounter.facilityId)}</span>
        <span>${encounter.chiefComplaint}</span>
        ${icdText}
      </article>
    `;
  }).join("");
}

function renderFacilities() {
  const target = document.querySelector("#facilityGrid");
  target.innerHTML = state.facilities.map(facility => `
    <article class="facility-card">
      <h3>${facility.name}</h3>
      <span>${facility.type} · ${facility.lga} · ${facility.beds} beds</span>
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
    plan: fields.plan,
    icd11Code: fields.icd11Code || "",
    icd11Display: fields.icd11Display || ""
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

let selectedStemCode = null;
let selectedExtensions = [];

const icd11Search = document.querySelector("#icd11Search");
const icd11Results = document.querySelector("#icd11Results");
const icd11Builder = document.querySelector("#icd11Builder");
const icd11Extensions = document.querySelector("#icd11Extensions");
const icd11ExpressionPreview = document.querySelector("#icd11ExpressionPreview");
const icd11DisplayPreview = document.querySelector("#icd11DisplayPreview");
const icd11CodeHidden = document.querySelector("#icd11CodeHidden");
const icd11DisplayHidden = document.querySelector("#icd11DisplayHidden");

if (icd11Search) {
  icd11Search.addEventListener("input", async (e) => {
    const q = e.target.value.trim();
    if (!q) {
      icd11Results.innerHTML = "";
      return;
    }
    try {
      const results = await api(`/api/icd11/search?q=${encodeURIComponent(q)}`);
      icd11Results.innerHTML = results.map(item => `
        <div class="icd11-result-item" data-code="${item.code}" data-title="${item.title}" data-extensions="${item.allowedExtensions.join(',')}">
          <strong>${item.code}</strong> - ${item.title}
        </div>
      `).join("");
      
      document.querySelectorAll(".icd11-result-item").forEach(el => {
        el.addEventListener("click", () => {
          selectStemCode(el.dataset.code, el.dataset.title, el.dataset.extensions ? el.dataset.extensions.split(",") : []);
        });
      });
    } catch (err) {
      console.error(err);
    }
  });
}

function selectStemCode(code, title, allowedExtensions) {
  selectedStemCode = { code, title, allowedExtensions };
  selectedExtensions = [];
  icd11Search.value = `${code} - ${title}`;
  icd11Results.innerHTML = "";
  
  if (allowedExtensions && allowedExtensions.length > 0 && allowedExtensions[0] !== "") {
    icd11Builder.style.display = "block";
    loadExtensionOptions(allowedExtensions);
  } else {
    icd11Builder.style.display = "none";
  }
  updateClusterPreview();
}

function loadExtensionOptions(allowedExtensions) {
  const extensionDefs = {
    "XK8G": { title: "Left side", axis: "Laterality" },
    "XK9K": { title: "Right side", axis: "Laterality" },
    "XJ7ZH": { title: "Closed fracture", axis: "Fracture Type" },
    "XJ7YM": { title: "Open fracture", axis: "Fracture Type" },
    "XS2A": { title: "Mild severity", axis: "Severity" },
    "XS0T": { title: "Severe severity", axis: "Severity" }
  };
  
  const groups = {};
  allowedExtensions.forEach(code => {
    const def = extensionDefs[code];
    if (def) {
      if (!groups[def.axis]) groups[def.axis] = [];
      groups[def.axis].push({ code, ...def });
    }
  });
  
  icd11Extensions.innerHTML = Object.entries(groups).map(([axis, items]) => `
    <div class="icd11-extension-group">
      <h5>${axis}</h5>
      ${items.map(item => `
        <label class="icd11-extension-option">
          <input type="radio" name="axis_${axis.replace(/\s+/g, '_')}" value="${item.code}" data-title="${item.title}" class="icd11-ext-checkbox" />
          <span>${item.title}</span>
        </label>
      `).join("")}
      <label class="icd11-extension-option">
        <input type="radio" name="axis_${axis.replace(/\s+/g, '_')}" value="" checked class="icd11-ext-checkbox" />
        <span style="color:var(--muted)">None</span>
      </label>
    </div>
  `).join("");
  
  document.querySelectorAll(".icd11-ext-checkbox").forEach(el => {
    el.addEventListener("change", updateClusterPreview);
  });
}

function updateClusterPreview() {
  if (!selectedStemCode) {
    icd11ExpressionPreview.textContent = "Unspecified";
    icd11DisplayPreview.textContent = "Unspecified";
    icd11CodeHidden.value = "";
    icd11DisplayHidden.value = "";
    return;
  }
  
  let expression = selectedStemCode.code;
  let display = selectedStemCode.title;
  
  const selectedExts = [];
  document.querySelectorAll(".icd11-ext-checkbox:checked").forEach(el => {
    if (el.value) {
      selectedExts.push({ code: el.value, title: el.dataset.title });
    }
  });
  
  if (selectedExts.length > 0) {
    expression += "&" + selectedExts.map(ext => ext.code).join("&");
    display += ", " + selectedExts.map(ext => ext.title).join(", ");
  }
  
  icd11ExpressionPreview.textContent = expression;
  icd11DisplayPreview.textContent = display;
  icd11CodeHidden.value = expression;
  icd11DisplayHidden.value = display;
}

function resetIcd11() {
  selectedStemCode = null;
  selectedExtensions = [];
  if (icd11Search) icd11Search.value = "";
  if (icd11Results) icd11Results.innerHTML = "";
  if (icd11Builder) icd11Builder.style.display = "none";
  updateClusterPreview();
}

document.querySelector("#encounterForm").addEventListener("submit", async event => {
  event.preventDefault();
  await api("/api/encounters", {
    method: "POST",
    body: JSON.stringify(encounterPayloadFromForm(event.currentTarget))
  });
  event.currentTarget.reset();
  resetIcd11();
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
