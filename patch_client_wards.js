const fs = require('fs');
let c = fs.readFileSync('public/emr.html', 'utf8');

// 1. Add API functions
const apiInjections = `    async getWards() {
      const res = await fetch('/api/v2/wards', { headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('staff_token') } });
      return res.json();
    },
    async admitPatient(wardId, bedId, patientId) {
      const res = await fetch('/api/v2/wards/admit', { method: 'POST', headers: this._headers(), body: JSON.stringify({wardId, bedId, patientId}) });
      return res.json();
    },
    async dischargePatient(wardId, bedId) {
      const res = await fetch('/api/v2/wards/discharge', { method: 'POST', headers: this._headers(), body: JSON.stringify({wardId, bedId}) });
      return res.json();
    },
    async getPatients() {`;

c = c.replace("    async getPatients() {", apiInjections);

// 2. Replace wardsView UI
const wardsViewReplacement = `      <!-- VIEW: Inpatient Wards -->
      <div id="wardsView" class="emr-view hidden" style="width: 100%; max-width: 1600px; margin: 0 auto; padding: 32px 48px; display: flex; flex-direction: column; flex: 1;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
          <div>
            <h1 style="font-size:32px;font-weight:800;letter-spacing:-0.02em;margin:0;color:#0f172a;"><i data-lucide="bed" style="width: 1em; height: 1em; display: inline-block; vertical-align: middle;"></i> Inpatient Wards</h1>
            <p style="color:#6b7280;font-size:16px;margin-top:8px;">Live management of bed allocations and patient admissions across all departments.</p>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="display: flex; gap: 16px; background: white; padding: 12px 24px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 600;">
                <div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;margin-right:6px;"></span>Available: <span id="wardsAvailableCount">0</span></div>
                <div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;margin-right:6px;"></span>Occupied: <span id="wardsOccupiedCount">0</span></div>
            </div>
            <button onclick="fetchLiveWards()" style="background:#0B5E7E;color:white;border:none;padding:12px 24px;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px;box-shadow:0 4px 6px rgba(11, 94, 126,0.2);"><i data-lucide="refresh-cw" style="width: 1em; height: 1em; display: inline-block; vertical-align: middle;"></i> Refresh</button>
          </div>
        </div>
        
        <div id="wardsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px; overflow-y: auto; padding-bottom: 48px;">
          <!-- Ward Cards Injected Here -->
          <div style="color:#9ca3af;text-align:center;padding:48px;grid-column: 1 / -1;">Loading wards database...</div>
        </div>
      </div>
      
      <!-- ADMIT PATIENT MODAL -->
      <div id="admitPatientModal" class="hidden" style="position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: none; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px);">
        <div style="background: white; border-radius: 20px; width: 500px; max-width: 90%; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
          <div style="background: #3b82f6; padding: 24px; color: white; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0; font-size: 20px; font-weight: 800;">Admit Patient</h3>
              <p id="admitModalSubtitle" style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Ward Name • Bed ID</p>
            </div>
            <button onclick="document.getElementById('admitPatientModal').classList.add('hidden'); document.getElementById('admitPatientModal').style.display='none';" style="background: transparent; border: none; color: white; font-size: 28px; cursor: pointer; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">×</button>
          </div>
          <div style="padding: 32px;">
            <input type="hidden" id="admitWardId">
            <input type="hidden" id="admitBedId">
            
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 8px;">Select Patient to Admit</label>
              <div style="position: relative;">
                <i data-lucide="search" style="position: absolute; left: 14px; top: 14px; color: #94a3b8; width: 18px; height: 18px;"></i>
                <input type="text" id="admitSearchInput" placeholder="Search by Name or ID..." onkeyup="searchPatientForAdmission(this.value)" autocomplete="off" style="width: 100%; padding: 14px 14px 14px 40px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 15px; outline: none; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
              </div>
            </div>
            
            <div id="admitSearchResults" style="max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 12px; display: none; background: #f8fafc;">
            </div>
            
            <div id="selectedAdmitPatient" class="hidden" style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
              <div>
                <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; margin-bottom: 4px;">Patient Selected</div>
                <div id="selectedAdmitName" style="font-weight: 700; color: #14532d; font-size: 16px;">--</div>
                <div id="selectedAdmitId" style="font-size: 13px; color: #166534;">--</div>
              </div>
              <button onclick="confirmAdmission()" style="background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 4px rgba(34,197,94,0.2);">Confirm</button>
            </div>
          </div>
        </div>
      </div>
`;

// Replace the placeholder wardsView
c = c.replace(/<!-- VIEW: Inpatient Wards -->[\s\S]*?<!-- VIEW: Pharmacy -->/, wardsViewReplacement + '\n\n      <!-- VIEW: Pharmacy -->');

// 3. Add JS functions for Wards logic
const jsInjections = `  // --- WARDS LOGIC ---
  let allWardsData = [];
  
  async function fetchLiveWards() {
    try {
      const data = await window.API.getWards();
      if(data && data.wards) {
        allWardsData = data.wards;
        renderWards();
      }
    } catch (e) {
      console.error("Failed to fetch wards:", e);
    }
  }
  
  function renderWards() {
    const container = document.getElementById('wardsContainer');
    if (!container) return;
    
    let totalAvail = 0;
    let totalOcc = 0;
    
    let html = '';
    
    allWardsData.forEach(ward => {
      let avail = ward.beds.filter(b => b.status === 'available').length;
      let occ = ward.capacity - avail;
      totalAvail += avail;
      totalOcc += occ;
      
      let occPercentage = Math.round((occ / ward.capacity) * 100);
      let pColor = occPercentage > 85 ? '#ef4444' : (occPercentage > 50 ? '#f59e0b' : '#22c55e');
      
      let bedsHtml = ward.beds.map(b => {
        if (b.status === 'available') {
          return \`<div onclick="openAdmitModal('\${ward.id}', '\${ward.name}', '\${b.bedId}')" style="background: #f0fdf4; border: 1px dashed #4ade80; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#dcfce7';this.style.borderColor='#22c55e';" onmouseout="this.style.background='#f0fdf4';this.style.borderColor='#4ade80';">
            <i data-lucide="bed" style="color: #22c55e; width: 24px; height: 24px; margin-bottom: 8px;"></i>
            <div style="font-size: 13px; font-weight: 700; color: #166534;">\${b.bedId}</div>
            <div style="font-size: 11px; color: #22c55e; font-weight: 600; margin-top: 4px;">AVAILABLE</div>
          </div>\`;
        } else {
          return \`<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; text-align: left; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="font-size: 13px; font-weight: 800; color: #1e3a8a;">\${b.bedId}</div>
                <button onclick="dischargePatient('\${ward.id}', '\${b.bedId}', '\${b.patientName}')" style="background: white; border: 1px solid #e2e8f0; border-radius: 6px; color: #ef4444; font-size: 10px; font-weight: 700; padding: 4px 8px; cursor: pointer;" onmouseover="this.style.background='#fef2f2';this.style.borderColor='#fca5a5'" onmouseout="this.style.background='white';this.style.borderColor='#e2e8f0'">DISCHARGE</button>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;">\${(b.patientName||'?').charAt(0).toUpperCase()}</div>
                <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e40af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;" title="\${b.patientName}">\${b.patientName}</div>
                    <div style="font-size: 11px; color: #3b82f6;">\${b.patientId}</div>
                </div>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 8px; border-top: 1px solid #dbeafe; padding-top: 6px;">
                Admitted: \${new Date(b.admittedAt).toLocaleDateString()}
            </div>
          </div>\`;
        }
      }).join('');
      
      html += \`
        <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
          <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">\${ward.category}</div>
              <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;">\${ward.name}</h2>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 13px; font-weight: 700; color: #334155;">\${occ} / \${ward.capacity} Beds</div>
              <div style="width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; margin-top: 6px; overflow: hidden;">
                <div style="width: \${occPercentage}%; height: 100%; background: \${pColor};"></div>
              </div>
            </div>
          </div>
          <div style="padding: 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; background: white; flex: 1; align-content: start;">
            \${bedsHtml}
          </div>
        </div>
      \`;
    });
    
    container.innerHTML = html;
    document.getElementById('wardsAvailableCount').innerText = totalAvail;
    document.getElementById('wardsOccupiedCount').innerText = totalOcc;
    
    if(window.lucide) window.lucide.createIcons();
  }
  
  function openAdmitModal(wId, wName, bId) {
    document.getElementById('admitWardId').value = wId;
    document.getElementById('admitBedId').value = bId;
    document.getElementById('admitModalSubtitle').innerText = \`\${wName} • Bed \${bId}\`;
    
    document.getElementById('admitSearchInput').value = '';
    document.getElementById('admitSearchResults').style.display = 'none';
    document.getElementById('selectedAdmitPatient').classList.add('hidden');
    document.getElementById('selectedAdmitPatient').style.display = 'none';
    
    const m = document.getElementById('admitPatientModal');
    m.classList.remove('hidden');
    m.style.display = 'flex';
    setTimeout(() => document.getElementById('admitSearchInput').focus(), 100);
  }
  
  let admitSearchTimer;
  async function searchPatientForAdmission(query) {
    clearTimeout(admitSearchTimer);
    if (!query || query.length < 2) {
      document.getElementById('admitSearchResults').style.display = 'none';
      return;
    }
    admitSearchTimer = setTimeout(async () => {
      try {
        const res = await fetch(\`/api/v2/mpi/search?q=\${encodeURIComponent(query)}\`, { headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('staff_token') }});
        const data = await res.json();
        const resDiv = document.getElementById('admitSearchResults');
        if (data.results && data.results.length > 0) {
          resDiv.style.display = 'block';
          resDiv.innerHTML = data.results.map(pt => \`
            <div onclick="selectPatientForAdmit('\${pt.id}', '\${pt.name.replace(/'/g, "\\\\'")}')" style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
              <div>
                <div style="font-weight: 700; color: #0f172a; font-size: 14px;">\${pt.name}</div>
                <div style="font-size: 12px; color: #64748b;">\${pt.age || '?'} yrs • \${pt.gender || '?'}</div>
              </div>
              <div style="font-family: monospace; font-weight: 700; color: #3b82f6;">\${pt.id}</div>
            </div>
          \`).join('');
        } else {
          resDiv.style.display = 'block';
          resDiv.innerHTML = '<div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 13px;">No patient found</div>';
        }
      } catch (err) {}
    }, 400);
  }
  
  window.selectedAdmitPid = null;
  function selectPatientForAdmit(pid, pname) {
    window.selectedAdmitPid = pid;
    document.getElementById('admitSearchResults').style.display = 'none';
    document.getElementById('selectedAdmitName').innerText = pname;
    document.getElementById('selectedAdmitId').innerText = pid;
    
    const s = document.getElementById('selectedAdmitPatient');
    s.classList.remove('hidden');
    s.style.display = 'flex';
  }
  
  async function confirmAdmission() {
    const wId = document.getElementById('admitWardId').value;
    const bId = document.getElementById('admitBedId').value;
    const pId = window.selectedAdmitPid;
    if (!wId || !bId || !pId) return;
    
    try {
      const res = await window.API.admitPatient(wId, bId, pId);
      if (res.success) {
        showToast(\`Patient successfully admitted to \${bId}\`);
        document.getElementById('admitPatientModal').classList.add('hidden');
        document.getElementById('admitPatientModal').style.display = 'none';
        fetchLiveWards(); // refresh grid
      } else {
        alert("Admission failed: " + res.error);
      }
    } catch(err) {
      alert("System error during admission");
    }
  }
  
  async function dischargePatient(wId, bId, pName) {
    if(!confirm(\`Are you sure you want to discharge \${pName} from \${bId}?\`)) return;
    try {
      const res = await window.API.dischargePatient(wId, bId);
      if (res.success) {
        showToast(\`Patient discharged successfully from \${bId}\`);
        fetchLiveWards();
      } else {
        alert("Discharge failed: " + res.error);
      }
    } catch(err) {
      alert("System error during discharge");
    }
  }
  
  // --- END WARDS LOGIC ---`;

c = c.replace("// --- MAIN APPLICATION STATE ---", jsInjections + '\n\n  // --- MAIN APPLICATION STATE ---');

fs.writeFileSync('public/emr.html', c);
console.log('Frontend logic and UI injected');
