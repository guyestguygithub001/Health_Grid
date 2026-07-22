// GHG Workflows Interactive Logic

// --- Workflow 1: MPI Onboarding ---
let isOffline = false;

function toggleNetworkMode(checkbox) {
  isOffline = !checkbox.checked;
  const statusEl = document.getElementById('networkStatus');
  const overlay = document.getElementById('biometricCacheOverlay');
  
  if (isOffline) {
    statusEl.textContent = 'OFFLINE';
    statusEl.style.color = '#ef4444';
    overlay.style.display = 'block';
    logToMpiConsole('Network disconnected. Switched to offline biometrics cache.');
  } else {
    statusEl.textContent = 'ONLINE';
    statusEl.style.color = '#10b981';
    overlay.style.display = 'none';
    logToMpiConsole('Network restored. Central sync active.');
  }
}

function queryNationalId() {
  const nin = document.getElementById('mpiNin').value;
  if (!nin) {
    alert("Please enter an ID to query.");
    return;
  }
  
  if (isOffline) {
    logToMpiConsole(`Querying local SQLite biometric cache for ID: ${nin}...`);
    setTimeout(() => {
      document.getElementById('mpiName').value = "Anonymous Match (Local)";
      document.getElementById('mpiAge').value = "34";
      logToMpiConsole(`Local match found. Awaiting connectivity to merge.`);
    }, 800);
  } else {
    logToMpiConsole(`Querying National API for ID: ${nin}...`);
    setTimeout(() => {
      document.getElementById('mpiName').value = "Adebayo Johnson";
      document.getElementById('mpiAge').value = "45";
      logToMpiConsole(`National API Match: 98% confidence.`);
    }, 1200);
  }
}

function handleMpiSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('mpiName').value;
  // Generate pseudo UUIDv7
  const uuid = '018b' + Math.floor(Math.random()*100000000).toString(16) + '-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  
  logToMpiConsole(`Generating UUID v7 locally...`);
  setTimeout(() => {
    logToMpiConsole(`Stored locally. Encrypted with AES-256.`);
    if (!isOffline) {
      logToMpiConsole(`Syncing to Central MPI... Success.`);
    } else {
      logToMpiConsole(`Waiting for connectivity to sync Central MPI...`);
    }
    
    document.getElementById('patientUuidDisplay').textContent = uuid;
    document.getElementById('qrWalletContainer').style.display = 'block';
    
    setTimeout(() => {
      // Auto move to next step
      switchView('triage');
      document.getElementById('triageQrInput').value = uuid;
    }, 2500);
  }, 1000);
}

function logToMpiConsole(msg) {
  const c = document.getElementById('mpiConsole');
  c.innerHTML += `<br>> ${msg}`;
  c.scrollTop = c.scrollHeight;
}


// --- Workflow 2: Clinical Encounter (Triage) ---
function loadTriagePatient() {
  const uuid = document.getElementById('triageQrInput').value;
  if (!uuid) return alert("Scan QR or enter UUID");
  
  const formContainer = document.getElementById('triageFormContainer');
  formContainer.style.opacity = '1';
  formContainer.style.pointerEvents = 'auto';
  
  document.getElementById('xaiPlaceholder').style.display = 'none';
  document.getElementById('xaiOutput').style.display = 'flex';
  document.getElementById('xaiUrgencyBox').style.background = '#475569';
  document.getElementById('xaiUrgencyBox').textContent = "Awaiting AI Triage...";
  document.getElementById('xaiExplanation').textContent = "Input vitals and SDOH to run inference.";
  document.getElementById('xaiActionContainer').innerHTML = '';
}

function runXaiTriage(e) {
  e.preventDefault();
  const hr = parseInt(document.getElementById('triageHr').value);
  const temp = parseFloat(document.getElementById('triageTemp').value);
  const food = document.getElementById('triageFood').value;
  
  const box = document.getElementById('xaiUrgencyBox');
  const exp = document.getElementById('xaiExplanation');
  const actions = document.getElementById('xaiActionContainer');
  
  box.textContent = "Processing...";
  
  setTimeout(() => {
    let isRed = false;
    let explanation = "Patient vitals are stable. ";
    
    if (hr > 100 || temp > 38.5) {
      isRed = true;
      explanation = `High risk due to abnormal vitals (HR: ${hr}, Temp: ${temp}°C). `;
    }
    if (food === 'insecure') {
      isRed = true;
      explanation += `Critical Social Determinant: Food insecurity flags patient for urgent social worker referral.`;
    }
    
    if (isRed) {
      box.style.background = '#ef4444';
      box.textContent = "URGENCY: RED (REFERRAL REQUIRED)";
      exp.textContent = explanation;
      actions.innerHTML = `
        <button class="primary-btn" style="background:#ef4444; border-color:#ef4444;" onclick="switchView('pharmacy')">Generate Geo-tagged Referral Note</button>
      `;
    } else {
      box.style.background = '#10b981';
      box.textContent = "URGENCY: GREEN (LOCAL TREATMENT)";
      exp.textContent = explanation + " Proceed with local prescription.";
      actions.innerHTML = `
        <button class="primary-btn" style="background:#10b981; border-color:#10b981;" onclick="switchView('pharmacy')">Issue Local Prescription</button>
      `;
    }
  }, 1500);
}


// --- Workflow 3: Circular Pharmacy ---
function queryPharmacyInventory() {
  const drug = document.getElementById('pharmaDrug').value;
  const visual = document.getElementById('pharmaProcessVisual');
  visual.style.display = 'flex';
  visual.innerHTML = `<div style="padding:12px; background:#f1f5f9; border-radius:8px; font-size:13px;">🔄 Querying local facility inventory for ${drug}...</div>`;
  
  setTimeout(() => {
    if (drug === 'Artemether-Lumefantrine') {
      // Simulate Zero Stock
      visual.innerHTML += `<div style="padding:12px; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; font-size:13px; color:#991b1b;">❌ Local stock is ZERO.</div>`;
      setTimeout(() => {
        visual.innerHTML += `<div style="padding:12px; background:#eff6ff; border:1px solid #93c5fd; border-radius:8px; font-size:13px; color:#1e3a8a;">🤖 Triggering AI Substitution Check...</div>`;
        setTimeout(() => {
          visual.innerHTML += `<div style="padding:12px; background:#f0fdf4; border:1px solid #86efac; border-radius:8px; font-size:13px; color:#166534;">✅ Found stock at 'Warehouse B' (8km away). Generating E-Transfer. SMS sent to Patient.</div>`;
          setTimeout(() => switchView('epidemic'), 2500);
        }, 1200);
      }, 1200);
    } else {
      // Simulate Available Stock
      visual.innerHTML += `<div style="padding:12px; background:#f0fdf4; border:1px solid #86efac; border-radius:8px; font-size:13px; color:#166534;">✅ Stock available. Reserving pending dispensation... Dispense notification sent to Pharmacy Tech.</div>`;
      setTimeout(() => switchView('epidemic'), 2000);
    }
  }, 1000);
}


// --- Workflow 4: Epidemic Intelligence ---
function logKafka(msg, isAlert = false) {
  const c = document.getElementById('kafkaConsole');
  if(c) {
    c.innerHTML += `<br><span style="color:${isAlert ? '#ef4444' : '#10b981'}">> ${msg}</span>`;
    c.scrollTop = c.scrollHeight;
  }
}

let kafkaInterval;
function startKafkaStream() {
  const messages = [
    "[CHW] Normal vital payload received.",
    "[PHARMA] Inventory sync OK.",
    "[LAB] Malaria Negative - PT-882"
  ];
  kafkaInterval = setInterval(() => {
    logKafka(messages[Math.floor(Math.random() * messages.length)]);
  }, 2000);
}
// Start it when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startKafkaStream, 3000);
});

function triggerOutbreakSimulation() {
  clearInterval(kafkaInterval);
  
  document.getElementById('ingressChw').innerHTML += "<br><span style='color:red;'>⚠️ +15 Fever/Diarrhea cases</span>";
  setTimeout(() => {
    document.getElementById('ingressPharm').innerHTML += "<br><span style='color:red;'>⚠️ +300% ORS Sales spike</span>";
    logKafka("[ANOMALY] Exceeds Geo-cluster Threshold in Region 4!", true);
    
    setTimeout(() => {
      document.getElementById('ingressLab').innerHTML += "<br><span style='color:red;'>⚠️ Cholera Culture POSITIVE</span>";
      logKafka("[CRITICAL] Cholera confirmed. Generating Outbreak Signal...", true);
      
      setTimeout(() => {
        document.getElementById('goarnAlertStatus').style.display = 'block';
        document.getElementById('droneActionPanel').style.display = 'flex';
      }, 1000);
    }, 1500);
  }, 1500);
}

function deployDrones() {
  const panel = document.getElementById('droneActionPanel');
  panel.innerHTML = `<div style="font-size:14px; color:#10b981; font-weight:bold;">✅ Drone Logistics API Triggered. Diagnostic kits en route.</div>`;
  logKafka("[LOGISTICS] Drones deployed to Zone 4 coordinates.", false);
}
