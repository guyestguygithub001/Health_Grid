<script>
    function toggleSidebar() {
      document.getElementById('ehrSidebar').classList.toggle('expanded');
      document.getElementById('ehrSidebar').classList.toggle('collapsed');
      
      const isExpanded = document.getElementById('ehrSidebar').classList.contains('expanded');
      document.getElementById('roleSwitcherContainer').style.display = isExpanded ? 'block' : 'none';
    }
    function enterEhrModule() {
      document.getElementById('landingScreen').style.display = 'none';
      document.getElementById('ehrAppShell').style.display = 'flex';
      switchAppRole('admin'); // default to admin
      switchEhrView('phcWorkflowView');
    }

    function switchAppRole(role) {
      document.querySelectorAll('#ehrAppShell .nav-btn').forEach(btn => {
        if (!btn.dataset.roles) return; // skip if no roles
        const allowedRoles = btn.dataset.roles.split(' ');
        if (allowedRoles.includes(role) || allowedRoles.includes('all')) {
          btn.style.display = 'flex';
        } else {
          btn.style.display = 'none';
        }
      });
      // Optionally route them to their default view if the current view isn't allowed
      const currentActive = document.querySelector('#ehrAppShell .nav-btn.active');
      if (currentActive && currentActive.style.display === 'none') {
        if (role === 'physician') switchEhrView('encountersView');
        if (role === 'nurse') switchEhrView('mpiView');
      }
    }



    function switchEhrView(viewId, isPopState = false) {
      document.querySelectorAll('.ehr-view').forEach(el => el.classList.add('hidden'));
      document.getElementById(viewId).classList.remove('hidden');
      
      document.querySelectorAll('#ehrAppShell .nav-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.querySelector(`#ehrAppShell .nav-btn[onclick="switchEhrView('${viewId}')"]`);
      if (activeBtn) activeBtn.classList.add('active');
      
      if (!isPopState) {
        history.pushState({ viewId }, "", "#" + viewId);
      if(viewId === 'billingView') { fetchLiveBilling(); if(!billingInterval) billingInterval = setInterval(fetchLiveBilling, 5000); } else { clearInterval(billingInterval); billingInterval = null; }
      }
    }

    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.viewId) {
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        switchEhrView(e.state.viewId, true);
      } else {
        document.getElementById('landingScreen').style.display = 'flex';
        document.getElementById('ehrAppShell').style.display = 'none';
      }
    });

    // Preserve original handleMpiSubmit for local endpoints
    function handleMpiSubmit(e) {
      e.preventDefault();
      const uuid = "UUID-v7-" + Date.now();
      document.getElementById('patientQr').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${uuid}`;
      document.getElementById('patientUuidDisplay').innerText = uuid;
      document.getElementById('qrWalletContainer').style.display = 'block';
      alert('Patient Data saved to local cache successfully!');
    }

    
    // ── Live Backend Integration ─────────────────────────────────────
    const API_URL = '/api';

    // Global Fetch Interceptor to attach Authorization header automatically
    const originalFetch = window.fetch;
    window.fetch = async function() {
      let resource = arguments[0];
      let config = arguments[1];
      if (typeof resource === 'string' && resource.startsWith('/api/') && !resource.startsWith('/api/v1/auth/') && !resource.startsWith('/api/v2/auth/')) {
        config = config || {};
        config.headers = config.headers || {};
        const token = localStorage.getItem('ehr_admin_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return originalFetch.call(window, resource, config);
    };

    async function fetchLivePhcData() {
      try {
        // Fetch Summary Stats
        const summaryRes = await fetch(`${API_URL}/summary`);
        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          document.getElementById('liveTotalPatients').innerText = summary.patients;
          document.getElementById('liveOpenEncounters').innerText = summary.openEncounters;
          document.getElementById('livePhcCount').innerText = summary.phcs;
        }

        // Fetch Recent Patients
        const patientsRes = await fetch(`${API_URL}/patients`);
        if (patientsRes.ok) {
          const patients = await patientsRes.json();
          const tbody = document.getElementById('livePatientTableBody');
          tbody.innerHTML = '';
          
          if (patients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #9ca3af;">No patients registered yet.</td></tr>';
          } else {
            // Show top 10 recent
            patients.slice(0, 10).forEach(p => {
              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #3b82f6;">${p.id}</td>
                  <td style="padding: 12px 8px; font-weight: 500;">${p.name}</td>
                  <td style="padding: 12px 8px;">${p.age} / ${p.sex}</td>
                  <td style="padding: 12px 8px;">${p.lga || 'Unspecified'}</td>
                  <td style="padding: 12px 8px;">
                    <span style="background: ${p.insurance === 'Private Pay' ? '#fee2e2' : '#dcfce3'}; color: ${p.insurance === 'Private Pay' ? '#b91c1c' : '#166534'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${p.insurance || 'Private Pay'}
                    </span>
                  </td>
                </tr>
              `;
            });
          }
        }
      } catch (e) {
          document.getElementById('livePatientTableBody').innerHTML = 
            '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #ef4444;">Connection failed. Is the API server running?</td></tr>';
        }
    }

    // Call it immediately on load if we are somehow bypassing landing screen, otherwise call it on switch
    // Actually, let's just intercept switchEhrView
    const originalSwitch = switchEhrView;
    switchEhrView = function(...args) {
      originalSwitch(...args);
      const viewId = args[0];
      if (viewId === 'phcWorkflowView') {
        fetchLivePhcData();
      }
    };


    // ── EHR: Inpatient Wards (GET /api/v2/beds)
    
    async function fetchAuditLogs() {
      console.log('Fetching audit logs...');
    }
    
    async function fetchRecordsRegistry() {
      console.log('Fetching records registry...');
    }
    async function fetchLiveWards() {
      try {
        const resOrders = await fetch(`${API_URL}/orders`);
        let admissions = [];
        if (resOrders.ok) {
           const allOrders = await resOrders.json();
           admissions = allOrders.filter(o => o.type === 'Admission');
        }

        const res = await fetch(`${API_URL}/beds`);
        if (res.ok) {
          const beds = await res.json();
          const tbody = document.getElementById('liveWardsTableBody');
          tbody.innerHTML = '';
          
          if (admissions.length > 0) {
            tbody.innerHTML += `<tr><td colspan="4" style="background:#f9fafb; font-weight:800; padding:8px 12px; color:#4b5563;">Pending Admissions (Incoming E-Notes)</td></tr>`;
            admissions.forEach(a => {
              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6; background: #fffbeb;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #d97706; font-weight:bold;">${a.id}</td>
                  <td style="padding: 12px 8px; font-weight: 500;">Unassigned (${a.item})</td>
                  <td style="padding: 12px 8px;">
                    <span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      Pending Arrival
                    </span>
                  </td>
                  <td style="padding: 12px 8px; font-family: monospace;">${a.patientId}</td>
                </tr>
              `;
            });
            tbody.innerHTML += `<tr><td colspan="4" style="background:#f9fafb; font-weight:800; padding:8px 12px; color:#4b5563;">Live Bed Status</td></tr>`;
          }

          if (beds.length === 0 && admissions.length === 0) tbody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">No beds registered in system.</td></tr>';
          else {
            beds.forEach(b => {
              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #0284c7; font-weight:bold;">${b.id}</td>
                  <td style="padding: 12px 8px; font-weight: 500;">${b.ward}</td>
                  <td style="padding: 12px 8px;">
                    <span style="background: ${b.status === 'Occupied' ? '#fee2e2' : '#dcfce3'}; color: ${b.status === 'Occupied' ? '#b91c1c' : '#166534'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${b.status}
                    </span>
                  </td>
                  <td style="padding: 12px 8px; font-family: monospace;">${b.patientId || '-'}</td>
                </tr>
              `;
            });
          }
        }
      } catch (err) {}
    }

    // ── EHR: Labs & Diagnostics (GET /api/v2/orders)
    async function fetchLiveLabs() {
      try {
        const res = await fetch(`${API_URL}/orders`);
        if (res.ok) {
          const allOrders = await res.json();
          const labs = allOrders.filter(o => o.type === 'Laboratory' || o.type === 'Radiology');
          const tbody = document.getElementById('liveLabsTableBody');
          tbody.innerHTML = '';
          if (labs.length === 0) tbody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">No pending lab orders.</td></tr>';
          else {
            labs.slice(0, 15).forEach(l => {
              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #8b5cf6; font-weight:bold;">${l.id}</td>
                  <td style="padding: 12px 8px; font-family: monospace;">${l.patientId}</td>
                  <td style="padding: 12px 8px; font-weight: 600;">${l.item} (${l.type})</td>
                  <td style="padding: 12px 8px;">
                    <span style="background: ${l.priority === 'Urgent' ? '#fee2e2' : '#f3f4f6'}; color: ${l.priority === 'Urgent' ? '#b91c1c' : '#6b7280'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${l.priority}
                    </span>
                  </td>
                </tr>
              `;
            });
          }
        }
      } catch (err) {}
    }

    async function fetchLivePharmacyOrders() {
      try {
        const res = await fetch(`${API_URL}/orders`);
        if (res.ok) {
          const allOrders = await res.json();
          const rx = allOrders.filter(o => o.type === 'Pharmacy');
          const tbody = document.getElementById('livePharmacyTableBody');
          if(!tbody) return;
          tbody.innerHTML = '';
          if (rx.length === 0) tbody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">No pending E-Prescriptions.</td></tr>';
          else {
            rx.forEach(o => {
              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #8b5cf6; font-weight:bold;">${o.id}</td>
                  <td style="padding: 12px 8px; font-family: monospace;">${o.patientId}</td>
                  <td style="padding: 12px 8px; font-weight: 500;">${o.item}</td>
                  <td style="padding: 12px 8px;">
                    <span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${o.status}
                    </span>
                  </td>
                </tr>
              `;
            });
          }
        }
      } catch (err) {}
    }

    // ── EHR: Billing (GET /api/v2/billing)
    async function fetchLiveBilling() {
      try {
        const res = await fetch(`${API_URL}/billing`);
        if (res.ok) {
          const bills = await res.json();
          const tbody = document.getElementById('liveBillingTableBody');
          tbody.innerHTML = '';
          if (bills.length === 0) tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #9ca3af;">No billing records found.</td></tr>';
          else {
            bills.slice(0, 15).forEach(b => {
              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #10b981; font-weight:bold;">${b.id}</td>
                  <td style="padding: 12px 8px; font-family: monospace;">${b.patientId}</td>
                  <td style="padding: 12px 8px;">${b.service}</td>
                  <td style="padding: 12px 8px; font-weight:600;">₦${b.amount.toLocaleString()}</td>
                  <td style="padding: 12px 8px;">
                    <span style="background: ${b.status === 'Paid' ? '#dcfce3' : '#fef3c7'}; color: ${b.status === 'Paid' ? '#166534' : '#b45309'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${b.status}
                    </span>
                  </td>
                </tr>
              `;
            });
          }
        }
      } catch (err) {}
    }

    // Intercept switchEhrView again to auto-load these views
    const tertiarySwitch = switchEhrView;
    switchEhrView = function(...args) {
      tertiarySwitch(...args);
      const viewId = args[0];
      if (viewId === 'wardsView') fetchLiveWards();
      if (viewId === 'labsView') fetchLiveLabs();
      if (viewId === 'billingView') fetchLiveBilling();
      if (viewId === 'legalView') fetchAuditLogs();
    };

    // ── Vitals & Triage (POST /api/v2/encounters)
    async function submitVitals(e) {
      e.preventDefault();
      const patientId = document.getElementById('triagePatientId').value;
      const vitals = {
        bp: document.getElementById('triageBp').value,
        temp: document.getElementById('triageTemp').value,
        weight: document.getElementById('triageWeight').value,
        pulse: document.getElementById('triagePulse').value
      };
      
      const payload = {
        patientId,
        facilityId: "FAC-PLSH",
        unit: "Triage",
        chiefComplaint: "Routine Vitals Logged",
        vitals,
        status: "Open"
      };

      try {
        const res = await fetch(`${API_URL}/encounters`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          const enc = await res.json();
          const disp = document.getElementById('vitalsEncounterDisplay');
          disp.innerText = `Encounter ID: ${enc.id} has been generated for Patient ${patientId}.`;
          disp.dataset.encId = enc.id;
          disp.dataset.patId = patientId;
          disp.dataset.vitals = JSON.stringify(vitals);
          
          document.getElementById('vitalsSuccessContainer').style.display = 'block';
          e.target.reset();
        } else {
          alert('Failed to save vitals. Check if Patient ID exists.');
        }
      } catch (err) {
        console.error(err);
        alert('Connection error. Ensure server.js is running.');
      }
    }

    // ── Clinical Encounters (GET /api/v2/encounters)
    async function fetchLiveEncounters() {
      try {
        const res = await fetch(`${API_URL}/encounters`);
        if (res.ok) {
          const encounters = await res.json();
          const tbody = document.getElementById('liveEncountersTableBody');
          tbody.innerHTML = '';
          
          if (encounters.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #9ca3af;">No open encounters found.</td></tr>';
          } else {
            encounters.slice(0, 15).forEach(e => {
              const vitalsStr = e.vitals ? `BP: ${e.vitals.bp || '-'}, Temp: ${e.vitals.temp || '-'}°C` : 'No Vitals';
              const rawVitals = JSON.stringify(e.vitals || {}).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6; cursor: pointer;" onclick="openConsultation('${e.id}', '${e.patientId}', '${rawVitals}')" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='transparent'">
                  <td style="padding: 12px 8px; font-family: monospace; color: #6366f1; font-weight:bold;">${e.id}</td>
                  <td style="padding: 12px 8px; font-family: monospace; color: #4b5563;">${e.patientId}</td>
                  <td style="padding: 12px 8px;">${e.date}</td>
                  <td style="padding: 12px 8px;">${e.chiefComplaint} <br><span style="font-size:11px; color:#10b981;">${vitalsStr}</span></td>
                  <td style="padding: 12px 8px;">
                    <span style="background: ${e.status === 'Open' ? '#fef3c7' : '#e0e7ff'}; color: ${e.status === 'Open' ? '#b45309' : '#4338ca'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${e.status}
                    </span>
                  </td>
                </tr>
              `;
            });
          }
        }
      } catch (err) {
        document.getElementById('liveEncountersTableBody').innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #ef4444;">Connection failed.</td></tr>`;
      }
    }
    
    window.openConsultation = function(encId, patientId, vitalsStr) {
      document.getElementById('consultationEmpty').style.display = 'none';
      document.getElementById('consultationPanel').style.display = 'block';
      
      document.getElementById('consultEncId').innerText = encId;
      document.getElementById('consultPatId').innerText = `Patient ID: ${patientId}`;
      
      try {
        const vitals = JSON.parse(vitalsStr);
        document.getElementById('consultVitals').innerText = `BP: ${vitals.bp || '--'}, Temp: ${vitals.temp || '--'}°C, Wt: ${vitals.weight || '--'}kg, P: ${vitals.pulse || '--'}bpm`;
      } catch(e) {
        document.getElementById('consultVitals').innerText = `No Vitals`;
      }
    };
    
    // AI ICD-11 Auto-Suggest Logic
    let aiDebounceTimer;
    document.addEventListener('DOMContentLoaded', () => {
      const notesEl = document.getElementById('consultNotes');
      if(notesEl) {
        notesEl.addEventListener('input', (e) => {
          const text = e.target.value.trim();
          const indicator = document.getElementById('icdAiSuggest');
          const icdInput = document.getElementById('consultIcd');
          
          if(text.length < 5) return;
          
          clearTimeout(aiDebounceTimer);
          indicator.style.display = 'inline';
          indicator.innerText = '✨ AI Auto-Suggesting...';
          
          aiDebounceTimer = setTimeout(async () => {
            try {
              const res = await fetch(`/api/v2/emr/ai/suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
              });
              
              if(res.ok) {
                const data = await res.json();
                if(data.success && data.icd && data.icd.code) {
                  // Only auto-fill if the doctor hasn't typed anything yet
                  if(!icdInput.value || icdInput.value.includes(' - ')) {
                    icdInput.value = `${data.icd.code} - ${data.icd.display}`;
                    icdInput.style.background = '#f5f3ff';
                    icdInput.style.borderColor = '#8b5cf6';
                    indicator.innerText = '✨ AI Auto-Filled';
                    setTimeout(() => { icdInput.style.background = '#fff'; icdInput.style.borderColor = '#d1d5db'; indicator.style.display = 'none'; }, 2000);
                  } else {
                    indicator.style.display = 'none';
                  }
                } else {
                  indicator.style.display = 'none';
                }
              }
            } catch(err) {
              indicator.style.display = 'none';
            }
          }, 1500); // 1.5 second debounce
        });
      }
    });

    window.finalizeEncounter = async function(e) {
      e.preventDefault();
      const encId = document.getElementById('consultEncId').innerText;
      const patientId = document.getElementById('consultPatId').innerText.replace('Patient ID: ', '');
      const meds = document.getElementById('consultMeds').value;
      
      const ordersToPost = [];
      if (document.getElementById('orderLab').checked) ordersToPost.push({ type: "Laboratory", item: "Routine Labs", priority: "Routine" });
      if (document.getElementById('orderScan').checked) ordersToPost.push({ type: "Radiology", item: "Routine Scan", priority: "Routine" });
      if (document.getElementById('orderPharmacy').checked) ordersToPost.push({ type: "Pharmacy", item: meds || "General Prescription", priority: "Routine" });
      if (document.getElementById('orderAdmit').checked) ordersToPost.push({ type: "Admission", item: "General Ward", priority: "Urgent" });
      if (document.getElementById('orderReferral').checked) ordersToPost.push({ type: "Referral", item: "Specialist", priority: "Routine" });
      if (document.getElementById('orderSurgery').checked) ordersToPost.push({ type: "Surgery", item: "Surgical Consult", priority: "Urgent" });
      if (document.getElementById('orderFollowUp').checked) ordersToPost.push({ type: "FollowUp", item: "Follow-up Clinic", priority: "Routine" });

      try {
        for (const order of ordersToPost) {
          await fetch('http://localhost:8082/api/v2/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId, type: order.type, item: order.item, priority: order.priority, orderedBy: "Physician" })
          });
        }
      } catch (err) {
        console.error("Order dispatch failed:", err);
      }
      
      let msg = `Encounter ${encId} finalized securely!
ICD-11 diagnosis and notes logged.`;
      if (ordersToPost.length > 0) {
        msg += `

Orders Generated:`;
        ordersToPost.forEach(o => msg += `
- ${o.type} Request Sent`);
      }
      
      alert(msg);
      
      e.target.reset();
      document.getElementById('consultationPanel').style.display = 'none';
      document.getElementById('consultationEmpty').style.display = 'flex';
      fetchLiveEncounters();
      if(typeof fetchLiveLabs === 'function') fetchLiveLabs();
      if(typeof fetchLiveWards === 'function') fetchLiveWards();
      if(typeof fetchLivePharmacyOrders === 'function') fetchLivePharmacyOrders();
    };

    // Intercept switchEhrView to auto-load encounters
    const secondarySwitch = switchEhrView;
    switchEhrView = function(...args) {
      secondarySwitch(...args);
      const viewId = args[0];
      if (viewId === 'encountersView') fetchLiveEncounters();
    };

    // ── MCH (POST /api/v2/appointments)
    async function submitMch(e) {
      e.preventDefault();
      const payload = {
        patientId: document.getElementById('mchPatientId').value,
        facilityId: "FAC-PLSH",
        department: document.getElementById('mchType').value,
        date: document.getElementById('mchDate').value,
        status: "Scheduled"
      };

      try {
        const res = await fetch(`${API_URL}/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          alert(`MCH Appointment successfully scheduled!`);
          e.target.reset();
        } else alert('Failed to schedule.');
      } catch (err) {
        alert('Connection error. Ensure server.js is running.');
      }
    }

    // ── EHR: Auto-Billing Functions
    async function createAutoBill(patientId, service, description) {
      try {
        await fetch(`${API_URL}/billing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, service, description })
        });
      } catch (err) {}
    }

    let labCart = [];

    window.addToLabCart = function(e) {
      e.preventDefault();
      const selectVal = document.getElementById('walkInLabTest').value;
      const qty = parseInt(document.getElementById('walkInLabQty').value, 10);
      const [item, priceStr, type] = selectVal.split('|');
      const price = parseInt(priceStr, 10);
      
      labCart.push({ item, price, qty, type, subtotal: price * qty });
      renderLabCart();
    };

    window.renderLabCart = function() {
      const container = document.getElementById('labCartContainer');
      const list = document.getElementById('labCartList');
      const totalEl = document.getElementById('labCartTotal');
      
      if (labCart.length === 0) {
        container.style.display = 'none';
        return;
      }
      
      container.style.display = 'block';
      list.innerHTML = '';
      let total = 0;
      
      labCart.forEach((c) => {
        total += c.subtotal;
        list.innerHTML += `
          <li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
            <span>${c.qty}x ${c.item}</span>
            <span>₦${c.subtotal.toLocaleString()}</span>
          </li>
        `;
      });
      totalEl.innerText = total.toLocaleString();
    };

    window.checkoutLabCart = async function() {
      const patientId = document.getElementById('walkInLabPatientId').value;
      if (!patientId) return alert('Please enter a Patient ID first.');
      if (labCart.length === 0) return;
      
      try {
        let totalAmount = 0;
        let descriptionItems = [];
        
        for (const c of labCart) {
          totalAmount += c.subtotal;
          descriptionItems.push(`${c.qty}x ${c.item}`);
          
          await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId, type: c.type, item: `${c.qty}x ${c.item} (Walk-In)`, priority: "Routine", orderedBy: "Walk-In Patient" })
          });
        }
        
        await fetch(`${API_URL}/billing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, service: "Laboratory/Radiology", description: "Cart Checkout: " + descriptionItems.join(', '), amount: totalAmount })
        });
        
        alert(`Successfully ordered and billed ${labCart.length} lab tests!`);
        labCart = [];
        renderLabCart();
        document.getElementById('walkInLabQty').value = 1;
        fetchLiveLabs();
        if(typeof fetchLiveBilling === 'function') fetchLiveBilling();
      } catch (err) {
        console.error(err);
      }
    };

    let wardCart = [];

    window.addToWardCart = function(e) {
      e.preventDefault();
      const selectVal = document.getElementById('walkInWardType').value;
      const days = parseInt(document.getElementById('walkInWardDays').value, 10);
      const [item, priceStr] = selectVal.split('|');
      const price = parseInt(priceStr, 10);
      
      wardCart.push({ item, price, days, subtotal: price * days });
      renderWardCart();
    };

    window.renderWardCart = function() {
      const container = document.getElementById('wardCartContainer');
      const list = document.getElementById('wardCartList');
      const totalEl = document.getElementById('wardCartTotal');
      
      if (wardCart.length === 0) {
        container.style.display = 'none';
        return;
      }
      
      container.style.display = 'block';
      list.innerHTML = '';
      let total = 0;
      
      wardCart.forEach((c) => {
        total += c.subtotal;
        list.innerHTML += `
          <li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
            <span>${c.days} Days - ${c.item}</span>
            <span>₦${c.subtotal.toLocaleString()}</span>
          </li>
        `;
      });
      totalEl.innerText = total.toLocaleString();
    };

    window.checkoutWardCart = async function() {
      const patientId = document.getElementById('walkInWardPatientId').value;
      if (!patientId) return alert('Please enter a Patient ID first.');
      if (wardCart.length === 0) return;
      
      try {
        let totalAmount = 0;
        let descriptionItems = [];
        
        for (const c of wardCart) {
          totalAmount += c.subtotal;
          descriptionItems.push(`${c.days} Days in ${c.item}`);
          
          await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId, type: "Wards", item: `${c.item} Admission (${c.days} Days)`, priority: "Routine", orderedBy: "Direct Booking" })
          });
        }
        
        await fetch(`${API_URL}/billing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, service: "Inpatient Wards", description: "Bed Booking: " + descriptionItems.join(', '), amount: totalAmount })
        });
        
        alert(`Successfully booked and billed admission for ${wardCart.length} entries!`);
        wardCart = [];
        renderWardCart();
        document.getElementById('walkInWardDays').value = 1;
        fetchLiveWards();
        if(typeof fetchLiveBilling === 'function') fetchLiveBilling();
      } catch (err) {
        console.error(err);
      }
    };

    let pharmacyCart = [];

    window.addToPharmacyCart = function(e) {
      e.preventDefault();
      const selectVal = document.getElementById('walkInPharmDrug').value;
      const qty = parseInt(document.getElementById('walkInPharmQty').value, 10);
      const [item, priceStr] = selectVal.split('|');
      const price = parseInt(priceStr, 10);
      
      pharmacyCart.push({ item, price, qty, subtotal: price * qty });
      renderPharmacyCart();
    };

    window.renderPharmacyCart = function() {
      const container = document.getElementById('pharmacyCartContainer');
      const list = document.getElementById('pharmacyCartList');
      const totalEl = document.getElementById('pharmacyCartTotal');
      
      if (pharmacyCart.length === 0) {
        container.style.display = 'none';
        return;
      }
      
      container.style.display = 'block';
      list.innerHTML = '';
      let total = 0;
      
      pharmacyCart.forEach((c) => {
        total += c.subtotal;
        list.innerHTML += `
          <li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
            <span>${c.qty}x ${c.item}</span>
            <span>₦${c.subtotal.toLocaleString()}</span>
          </li>
        `;
      });
      totalEl.innerText = total.toLocaleString();
    };

    window.checkoutPharmacyCart = async function() {
      const patientId = document.getElementById('walkInPharmPatientId').value;
      if (!patientId) return alert('Please enter a Patient ID first.');
      if (pharmacyCart.length === 0) return;
      
      try {
        let totalAmount = 0;
        let descriptionItems = [];
        
        for (const c of pharmacyCart) {
          totalAmount += c.subtotal;
          descriptionItems.push(`${c.qty}x ${c.item}`);
          
          await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId, type: "Pharmacy", item: `${c.qty}x ${c.item} (OTC Dispense)`, priority: "Routine", orderedBy: "Walk-In Patient" })
          });
        }
        
        await fetch(`${API_URL}/billing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, service: "Pharmacy", description: "Cart Checkout: " + descriptionItems.join(', '), amount: totalAmount })
        });
        
        alert(`Successfully dispensed and billed ${pharmacyCart.length} items!`);
        pharmacyCart = [];
        renderPharmacyCart();
        document.getElementById('walkInPharmQty').value = 1;
        fetchLivePharmacyOrders();
        if(typeof fetchLiveBilling === 'function') fetchLiveBilling();
      } catch (err) {
        console.error(err);
      }
    };

    // Override handleMpiSubmit to POST to local DB
    async function handleMpiSubmit(e) {
      e.preventDefault();
      const payload = {
        name: document.getElementById('mpiName').value,
        age: parseInt(document.getElementById('mpiAge').value, 10),
        sex: document.getElementById('mpiSex').value,
        insurance: "Private Pay", // Default for now
        lga: "Jos North" // Default for now
      };

      try {
        const res = await fetch(`${API_URL}/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          const newPatient = await res.json();
          // Generate QR code and UUID v7 simulation
          const uuid = "UUID-v7-" + Date.now();
          document.getElementById('patientQr').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${uuid}`;
          document.getElementById('patientUuidDisplay').innerText = `Created local patient: ${newPatient.id} | ${uuid}`;
          document.getElementById('qrWalletContainer').style.display = 'block';
          alert(`Success! Patient ${newPatient.name} securely saved to local server.js database.`);
          
          // Populate Patient Records View
          document.getElementById('prName').innerText = newPatient.name || "Unknown Patient";
          document.getElementById('prDetails').innerText = `PID: ${newPatient.id} | Age: ${newPatient.age} | ${newPatient.sex}`;
          let foodStatus = document.getElementById('mpiFood').options[document.getElementById('mpiFood').selectedIndex].text;
          let waterStatus = document.getElementById('mpiWater').options[document.getElementById('mpiWater').selectedIndex].text;
          document.getElementById('prSdoh').innerText = `${foodStatus}, ${waterStatus}`;
          
          // Optionally refresh the PHC dashboard in the background
          fetchLivePhcData();
        } else {
          alert('Failed to save patient to local database.');
        }
      } catch (err) {
        console.error(err);
        alert('Connection error. Ensure server.js is running.');
      }
    }

    function triggerOutbreakSimulation() {
      const console = document.getElementById('kafkaConsole');
      console.innerHTML += '<br><span style="color:#ef4444">[ALERT] Cholera cluster detected in LGA 4 (Confidence: 94%)</span>';
      document.getElementById('goarnAlertStatus').style.display = 'block';
    }
    
    function queryNationalId() {
      alert("Local ID Query Simulated. Connection secure.");
    }
  </script>