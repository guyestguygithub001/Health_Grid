
    
    
    
    // --- ANCILLARY CART & BED BOARD LOGIC ---
    const ancillaryCarts = { pharmacyView: [], labView: [], radView: [] };

    function selectAncillaryOrder(viewId, orderId, patientName, colorHex) {
        // Activate Right Pane
        const fulfillmentPane = document.getElementById(viewId + '-fulfillment');
        fulfillmentPane.style.opacity = '1';
        fulfillmentPane.style.pointerEvents = 'auto';
        
        document.getElementById(viewId + '-patientName').innerText = patientName;
        document.getElementById(viewId + '-orderId').innerText = "Order: " + orderId;
        
        // Reset Cart
        ancillaryCarts[viewId] = [];
        renderAncillaryCart(viewId, colorHex);
    }

    function addToAncillaryCart(viewId, itemName, price) {
        ancillaryCarts[viewId].push({ name: itemName, price: price });
        // Find the color hex based on viewId for rendering
        const color = viewId === 'pharmacyView' ? '#10b981' : (viewId === 'labView' ? '#8b5cf6' : '#f59e0b');
        renderAncillaryCart(viewId, color);
    }

    function renderAncillaryCart(viewId, colorHex) {
        const cartDiv = document.getElementById(viewId + '-cart');
        const cart = ancillaryCarts[viewId];
        let total = 0;
        
        if (cart.length === 0) {
            cartDiv.innerHTML = '<p style="color: #94a3b8; font-size: 13px; font-style: italic;">Cart is empty. Select items to dispense.</p>';
        } else {
            cartDiv.innerHTML = cart.map((item, idx) => {
                total += item.price;
                return `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
                    <span style="font-size: 13px; color: #334155; font-weight: 500;">${item.name}</span>
                    <span style="font-size: 13px; color: #0f172a; font-weight: 700;">₦${item.price.toLocaleString()}</span>
                  </div>
                `;
            }).join('');
        }
        document.getElementById(viewId + '-total').innerText = '₦' + total.toLocaleString();
    }

    function fulfillAncillaryOrder(viewId) {
        const cart = ancillaryCarts[viewId];
        if (cart.length === 0) {
            alert("Cart is empty! Select items to fulfill this order.");
            return;
        }
        
        // Clear Queue mock
        document.getElementById(viewId + '-queue').innerHTML = `
          <div style="padding: 40px; text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h4 style="font-size: 16px; font-weight: 600; color: #64748b;">Queue Cleared!</h4>
            <p style="font-size: 13px; color: #94a3b8;">Excellent work. E-notes and Billing have been synced.</p>
          </div>
        `;
        
        // Disable Right Pane
        const fulfillmentPane = document.getElementById(viewId + '-fulfillment');
        fulfillmentPane.style.opacity = '0.5';
        fulfillmentPane.style.pointerEvents = 'none';
        
        document.getElementById(viewId + '-patientName').innerText = "Select an Order";
        document.getElementById(viewId + '-orderId').innerText = "Waiting for selection...";
        ancillaryCarts[viewId] = [];
        renderAncillaryCart(viewId, '#000');
    }

    function openNursesWorkstation(bed, name, dx) {
        document.getElementById('np-bed').innerText = bed;
        document.getElementById('np-name').innerText = name;
        document.getElementById('np-dx').innerText = dx;
        document.getElementById('nursingPanel').style.opacity = '1'; document.getElementById('nursingPanel').style.pointerEvents = 'auto'; document.getElementById('nursingPanel').style.transform = 'translate(-50%, -50%) scale(1)'; document.getElementById('nursingBackdrop').style.opacity = '1'; document.getElementById('nursingBackdrop').style.pointerEvents = 'auto';
    }

    function closeNursingPanel() {
        document.getElementById('nursingPanel').style.opacity = '0'; document.getElementById('nursingPanel').style.pointerEvents = 'none'; document.getElementById('nursingPanel').style.transform = 'translate(-50%, -50%) scale(0.95)'; document.getElementById('nursingBackdrop').style.opacity = '0'; document.getElementById('nursingBackdrop').style.pointerEvents = 'none';
    }

    
    
    // --- UNIVERSAL WALK-IN LOGIC ---
    let currentWalkInDept = '';
    
    const catalogs = {
        'Pharmacy': ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Artemether-Lumefantrine', 'Ibuprofen 400mg', 'Cough Syrup'],
        'Laboratory': ['Full Blood Count (FBC)', 'Malaria Parasite (MP)', 'Widal Test', 'Urinalysis', 'Fasting Blood Sugar'],
        'Radiology': ['Chest X-Ray', 'Pelvic Ultrasound', 'MRI Brain', 'CT Scan Abdomen']
    };

    const deptColors = {
        'Pharmacy': '#10b981',
        'Laboratory': '#8b5cf6',
        'Radiology': '#f59e0b'
    };

    function openWalkInModal(dept) {
        currentWalkInDept = dept;
        const color = deptColors[dept];
        
        document.getElementById('walkInHeader').style.background = color;
        document.getElementById('dispatchBtn').style.background = color;
        document.getElementById('dispatchBtn').style.boxShadow = `0 4px 12px ${color}40`;
        document.getElementById('walkInTitle').innerText = `${dept} Walk-In Order`;
        
        const catalogDiv = document.getElementById('walkInCatalog');
        catalogDiv.innerHTML = catalogs[dept].map((item, idx) => `
            <label style="display: flex; align-items: center; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" value="${item}" class="walkin-checkbox" style="margin-right: 12px; transform: scale(1.2);">
                <span style="font-weight: 600; color: #1e293b; font-size: 14px;">${item}</span>
            </label>
        `).join('');

        document.getElementById('walkInPatientName').value = '';
        document.getElementById('universalWalkInModal').classList.remove('hidden');
    }

    function closeWalkInModal() {
        document.getElementById('universalWalkInModal').classList.add('hidden');
    }

    async function dispatchWalkInOrder() {
        const patientName = document.getElementById('walkInPatientName').value.trim();
        if (!patientName) return alert("Please enter the patient's name.");
        
        const checkboxes = document.querySelectorAll('.walkin-checkbox:checked');
        if (checkboxes.length === 0) return alert("Please select at least one item.");
        
        const selectedItems = Array.from(checkboxes).map(cb => cb.value).join(', ');
        const orderId = "WLK-" + Math.floor(1000 + Math.random() * 9000);
        
        // 1. Send to Backend
        try {
            const token = sessionStorage.getItem('ehr_admin_token') || localStorage.getItem('ehr_admin_token');
            await fetch('/api/v2/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    patientId: patientName,
                    type: currentWalkInDept,
                    item: selectedItems,
                    priority: 'Walk-In',
                    facilityId: sessionStorage.getItem("emr_facility_id") || "FAC-PLSH",
                    orderedBy: "Front Desk"
                })
            });
        } catch (e) {
            console.error("Failed to post walk-in order", e);
        }

        // 2. Populate Print Slip
        document.getElementById('printDept').innerText = currentWalkInDept + " Requisition";
        document.getElementById('printPatient').innerText = patientName;
        document.getElementById('printDate').innerText = new Date().toLocaleDateString();
        document.getElementById('printOrderId').innerText = orderId;
        
        document.getElementById('printItemsList').innerHTML = Array.from(checkboxes)
            .map(cb => `<li>${cb.value}</li>`).join('');

        // 3. Trigger Print & Close
        window.print();
        closeWalkInModal();
        
        // The live polling will automatically pull this order into the queue within 5 seconds!
    }

    
    // --- NURSES WORKSTATION & LIVE BEDS LOGIC ---
    let selectedPendingPatient = null;

    function selectPendingPatient(patientId, reqId) {
        selectedPendingPatient = { patientId, reqId };
        document.querySelectorAll('.pending-req-card').forEach(c => {
            c.style.borderColor = '#e2e8f0';
            c.style.background = 'white';
        });
        const card = document.getElementById('pending-req-' + reqId);
        if(card) {
            card.style.borderColor = '#ef4444';
            card.style.background = '#fef2f2';
        }
        showToast("Select a vacant bed on the board to assign this patient.");
    }

    async function assignBed(bedId, wardName) {
        if (!selectedPendingPatient) {
            alert("Please select a patient from the Pending Admissions queue first!");
            return;
        }
        if (!confirm(`Assign Patient ${selectedPendingPatient.patientId} to ${bedId} (${wardName})?`)) return;
        
        try {
            await fetch('/api/v2/beds/admit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: selectedPendingPatient.patientId, bedId: bedId, diagnosis: "Assigned by Nurse" })
            });
            selectedPendingPatient = null;
            fetchLiveWards();
            showToast(`Patient successfully admitted to ${bedId}!`);
        } catch(e) { console.error("Bed assignment failed", e); }
    }

    let bedsInterval = null;

    function switchWorkstationTab(tab) {
        document.querySelectorAll('.ws-tab').forEach(t => {
            t.style.borderBottom = '3px solid transparent';
            t.style.color = '#64748b';
            t.style.fontWeight = '600';
        });
        document.querySelectorAll('.ws-content').forEach(c => c.style.display = 'none');
        
        const activeBtn = document.getElementById('tab-' + tab);
        activeBtn.style.borderBottom = '3px solid #3b82f6';
        activeBtn.style.color = '#3b82f6';
        activeBtn.style.fontWeight = '700';
        
        document.getElementById('content-' + tab).style.display = 'block';
    }

    async function fetchLiveWards() {
        if (!document.getElementById('wardsView') || document.getElementById('wardsView').classList.contains('hidden')) return;
        try {
            // Fetch Pending Queue
            const qRes = await fetch('/api/v2/emr/admissions/pending');
            const queue = await qRes.json();
            const qContainer = document.getElementById('wards-queue');
            if(queue.length > 0) {
                qContainer.innerHTML = queue.map(q => `
                    <div id="pending-req-${q.id}" class="pending-req-card" onclick="selectPendingPatient('${q.patientId}', '${q.id}')" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s;">
                        <div style="font-weight: 800; color: #0f172a; font-size: 15px; margin-bottom: 4px;">${q.patientName}</div>
                        <div style="font-size: 12px; color: #64748b; font-weight: 700;">ID: ${q.patientId}</div>
                    </div>
                `).join('');
            } else {
                qContainer.innerHTML = `<p style="font-size: 13px; color: #94a3b8; text-align: center;">Queue is empty.</p>`;
            }

            const res = await fetch('/api/v2/beds');
            const beds = await res.json();
            
            // Group beds by ward
            const wardsMap = {};
            beds.forEach(b => {
                if (!wardsMap[b.ward]) wardsMap[b.ward] = [];
                wardsMap[b.ward].push(b);
            });

            let html = '';
            for (const [wardName, wardBeds] of Object.entries(wardsMap)) {
                html += `<h3 style="font-size: 16px; font-weight: 700; color: #475569; margin-bottom: 16px; margin-top: 16px;">${wardName}</h3>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">`;
                
                wardBeds.forEach(bed => {
                    if (bed.status === 'Occupied') {
                        html += `
                        <div onclick="openNursesWorkstation('${bed.id}', '${bed.patientId}', '${bed.admissionId}', '${bed.ward}', '${bed.patientName}')" style="background: white; border: 1px solid #fecaca; border-top: 4px solid #ef4444; border-radius: 8px; padding: 16px; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                <span style="font-weight: 800; font-size: 18px; color: #0f172a;">${bed.id}</span>
                                <span style="font-size: 10px; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: 800;">OCCUPIED</span>
                            </div>
                            <p style="font-weight: 700; color: #1e293b; font-size: 14px; margin: 0 0 4px 0;">Patient: ${bed.patientId}</p>
                        </div>`;
                    } else {
                        html += `
                        <div onclick="assignBed('${bed.id}', '${wardName}')" style="background: #f8fafc; border: 1px dashed #bbf7d0; border-top: 4px solid #22c55e; border-radius: 8px; padding: 16px; opacity: 0.8; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                <span style="font-weight: 800; font-size: 18px; color: #64748b;">${bed.id}</span>
                                <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: 800;">AVAILABLE</span>
                            </div>
                            <p style="font-weight: 600; color: #22c55e; font-size: 12px; text-align: center; margin-top: 8px;">Click to Assign</p>
                        </div>`;
                    }
                });
                html += `</div>`;
            }
            document.getElementById('liveBedsGrid').innerHTML = html;
        } catch (e) { console.error("Failed to fetch beds", e); }
    }

    async function saveNursingNote(type) {
        const patientId = document.getElementById('np-mpi').innerText;
        const admissionId = document.getElementById('currentAdmissionId').value;
        const token = sessionStorage.getItem('ehr_creds');
        
        let payload = { patientId, admissionId };
        
        if (type === 'vitals') {
            const bp = document.getElementById('np-bp-input').value || '0/0';
            payload.vitals = { 
                heartRate: document.getElementById('np-hr-input').value || '--',
                bloodPressureSystolic: bp.split('/')[0] || '--',
                bloodPressureDiastolic: bp.split('/')[1] || '--',
                temperature: document.getElementById('np-temp-input').value || '--',
                weight: document.getElementById('np-weight-input').value || '--'
            };
            payload.notes = "Vitals updated.";
        } else if (type === 'fluids') {
            payload.fluid = document.getElementById('np-fluid-select').value;
            payload.notes = "Fluid administered: " + payload.fluid;
        } else if (type === 'text') {
            payload.notes = prompt("Enter nursing observation note:");
            if (!payload.notes) return;
        }
        
        try {
            const res = await fetch('/api/v2/emr/nursing-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast("Nursing record pushed to Universal Timeline!");
                // Refresh workstation
                const bedId = document.getElementById('np-bed').innerText;
                const pName = document.getElementById('np-name').innerText;
                openNursesWorkstation(bedId, patientId, admissionId, null, pName);
            }
        } catch(e) { console.error(e); }
    }

    async function openNursesWorkstation(bedId, patientId, admissionId, ward, patientName) {
        document.getElementById('nursingPanel').style.opacity = '1'; document.getElementById('nursingPanel').style.pointerEvents = 'auto'; document.getElementById('nursingPanel').style.transform = 'translate(-50%, -50%) scale(1)'; document.getElementById('nursingBackdrop').style.opacity = '1'; document.getElementById('nursingBackdrop').style.pointerEvents = 'auto';
        document.getElementById('np-bed').innerText = bedId;
        document.getElementById('np-mpi').innerText = patientId;
        document.getElementById('currentAdmissionId').value = admissionId;
        document.getElementById('np-name').innerText = patientName || `Patient ${patientId}`;
        
        switchWorkstationTab('vitals');

        try {
            const token = sessionStorage.getItem('ehr_creds');
            // Fetch EMR Encounters (secure EMR API)
            const res = await fetch(`/api/v2/emr/encounters?patientId=${patientId}`, { headers: { "Authorization": `Bearer ${token}` }});
            if (!res.ok) throw new Error("Encounters fetch failed");
            const db = await res.json();
            
            // Get latest DOCTOR encounter for E-Notes
            const doctorEncounters = (db.encounters || []).filter(e => e.type !== "Nursing Note");
            const lastEnc = doctorEncounters.length > 0 ? doctorEncounters[0] : null;
            
            document.getElementById('np-dx').innerText = lastEnc ? lastEnc.icd11Display || "Observation" : "No Diagnosis";
            document.getElementById('np-enotes').innerText = lastEnc ? (lastEnc.text) : "No clinical notes available.";
            
            // Render the timeline inside the Workstation!
            const tContainer = document.getElementById('np-timeline');
            if(db.encounters && db.encounters.length > 0) {
                tContainer.innerHTML = db.encounters.map(e => `
                    <div style="position: relative; margin-bottom: 24px;">
                        <div style="position: absolute; left: -25px; top: 0; width: 10px; height: 10px; background: ${e.type === 'Nursing Note' ? '#0ea5e9' : '#8b5cf6'}; border-radius: 50%; border: 2px solid white;"></div>
                        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; margin-bottom: 4px;">${new Date(e.date).toLocaleDateString()} - ${e.id}</div>
                        ${e.type === 'Nursing Note' 
                            ? `<span style="background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800;">🩺 NURSING LOG</span>`
                            : `<span style="font-weight: 700; color: #475569; font-size: 12px;">${e.icd11Display || 'Encounter'}</span>`
                        }
                        <p style="font-size: 13px; color: #334155; margin-top: 6px; line-height: 1.5;">
                            ${e.type === 'Nursing Note' && e.vitals ? `<b>HR:</b> ${e.vitals.heartRate} | <b>BP:</b> ${e.vitals.bloodPressureSystolic}/${e.vitals.bloodPressureDiastolic} <br>` : ''}
                            ${e.text || ''}
                        </p>
                    </div>
                `).join('');
            } else {
                tContainer.innerHTML = '<p style="color: #94a3b8; font-size: 13px;">No history.</p>';
            }

            // Populate Meds Tab
            if (db.prescriptions && db.prescriptions.length > 0) {
                document.getElementById('np-rx-list').innerHTML = db.prescriptions.map(rx => `
                    <div style="background: white; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                        <span style="font-weight: 700; color: #0f172a; font-size: 14px;">${rx.item}</span>
                        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">${rx.dosage || 'Standard dose'}</p>
                    </div>
                `).join('');
            } else {
                document.getElementById('np-rx-list').innerHTML = '<p style="font-size: 14px; color: #64748b;">No active prescriptions found.</p>';
            }

        } catch (e) {
            console.error(e);
            document.getElementById('np-name').innerText = "Patient " + patientId;
        }
    }

    function closeNursingPanel() {
        document.getElementById('nursingPanel').style.opacity = '0'; document.getElementById('nursingPanel').style.pointerEvents = 'none'; document.getElementById('nursingPanel').style.transform = 'translate(-50%, -50%) scale(0.95)'; document.getElementById('nursingBackdrop').style.opacity = '0'; document.getElementById('nursingBackdrop').style.pointerEvents = 'none';
    }

    async function dischargePatient() {
        const admissionId = document.getElementById('currentAdmissionId').value;
        if (!admissionId) return;
        if (!confirm("Are you sure you want to discharge this patient? This will clear the bed on the Ward Board.")) return;

        try {
            const token = sessionStorage.getItem('ehr_admin_token') || localStorage.getItem('ehr_admin_token');
            await fetch('/api/v2/beds/discharge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ admissionId: admissionId, dischargedBy: "Nurses Workstation" })
            });
            closeNursingPanel();
            fetchLiveWards(); // Force refresh immediately
        } catch (e) {
            console.error("Discharge failed", e);
            alert("Discharge failed.");
        }
    }


    // --- PHARMACY LIVE INVENTORY LOGIC ---
    let invInterval = null;
    async function fetchLiveInventory() {
        if (!document.getElementById('pharmacyView') || document.getElementById('pharmacyView').classList.contains('hidden')) return;
        try {
            const res = await fetch('/api/v2/reports');
            const db = await res.json();
            
            const tbody = document.getElementById('pharmacyInventoryBody');
            if(!tbody) return;

            let html = '';
            db.inventory.forEach(item => {
                const isLow = item.quantity <= item.reorderLevel;
                const statusBadge = isLow ? 
                    `<span style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-weight: 800; font-size: 11px;">🔴 LOW STOCK</span>` : 
                    `<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-weight: 800; font-size: 11px;">🟢 IN STOCK</span>`;
                
                html += `
                    <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 16px 12px; font-size: 13px; font-weight: 600; color: #64748b;">${item.id}</td>
                        <td style="padding: 16px 12px; font-size: 14px; font-weight: 700; color: #0f172a;">${item.name}</td>
                        <td style="padding: 16px 12px; font-size: 13px; color: #475569;">${item.category}</td>
                        <td style="padding: 16px 12px; font-size: 15px; font-weight: 800; color: ${isLow ? '#ef4444' : '#0f172a'};">${item.quantity} <span style="font-size: 11px; font-weight: 600; color: #94a3b8;">${item.unit}</span></td>
                        <td style="padding: 16px 12px;">${statusBadge}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch(e) { console.error("Failed to fetch inventory", e); }
    }


    // --- switchEmrView polling hooks moved into the real function below ---

    
        // --- LAB CATALOG LOGIC ---
    async function fetchLabCatalog() {
        try {
            const res = await fetch('/api/v2/emr/lab-catalog');
            const catalog = await res.json();
            const grid = document.getElementById('labView-catalog');
            if(!grid) return;
            
            // Group by category
            const categories = {};
            catalog.forEach(item => {
                if(!categories[item.category]) categories[item.category] = [];
                categories[item.category].push(item);
            });

            let html = '';
            for (const [category, items] of Object.entries(categories)) {
                html += `<h5 style="font-size: 13px; font-weight: 800; color: #8b5cf6; margin-bottom: 8px; text-transform: uppercase;">${category}</h5>`;
                html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">`;
                items.forEach(test => {
                    html += `
                    <button onclick="addToAncillaryCart('labView', '${test.name}', ${test.price})" style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: left; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;" onmouseover="this.style.borderColor='#8b5cf6'; this.style.boxShadow='0 2px 4px rgba(139, 92, 246, 0.1)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
                        <div style="font-weight: 600; color: #1e293b; font-size: 13px;">${test.name}</div>
                        <div style="font-size: 12px; color: #8b5cf6; font-weight: 700; margin-top: 4px;">₦${test.price.toLocaleString()}</div>
                    </button>`;
                });
                html += `</div>`;
            }
            grid.innerHTML = html;
        } catch(e) { console.error("Failed to load lab catalog", e); }
    }
    
    // Call on load
    document.addEventListener('DOMContentLoaded', () => {
        fetchLabCatalog();
    });

    // --- ROLE BASED ACCESS CONTROL (RBAC) ---
    function setEmrRole(role) {
        const accessMap = {
            'admin': ['triageView', 'clinicsDashboardView', 'wardsView', 'pharmacyView', 'labView', 'radView', 'billingView', 'recordsMainView'],
            'physician': ['clinicsDashboardView', 'wardsView'],
            'doctor': ['clinicsDashboardView', 'wardsView'], // legacy support
            'nurse': ['triageView', 'wardsView'],
            'pharmacist': ['pharmacyView'],
            'pharmacy': ['pharmacyView'],
            'lab': ['labView'],
            'rad': ['radView'],
            'billing': ['billingView'],
            'records': ['recordsMainView']
        };

        const displayNames = {
            'admin': 'System Admin (Full Access)',
            'physician': 'Physician',
            'doctor': 'Physician',
            'nurse': 'Nursing & Wards',
            'pharmacist': 'Pharmacist',
            'pharmacy': 'Pharmacist',
            'lab': 'Laboratory Tech',
            'rad': 'Radiologist',
            'billing': 'Billing Cashier',
            'records': 'Records Officer'
        };

        const allowedViews = accessMap[role] || [];
        
        document.querySelectorAll('.nav-btn[data-target-view]').forEach(btn => {
            const target = btn.getAttribute('data-target-view');
            if (role === 'admin' || allowedViews.includes(target)) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
        
        const displayEl = document.getElementById('activeRoleDisplay');
        if (displayEl) {
            displayEl.innerText = displayNames[role] || role.toUpperCase();
        }

        const signupBtn = document.getElementById('emrSignupBtn');
        if (signupBtn) {
            signupBtn.style.display = role === 'admin' ? 'block' : 'none';
        }
        
        // Force navigate to Omni-Bar to reset context and prevent access to hidden views
        switchEmrView('omniBar');
        showToast("Logged in as " + (displayNames[role] || role.toUpperCase()));
    }

    // --- WALK-IN ADMISSIONS ---
    function openWalkInAdmissionModal() {
        document.getElementById('walkinAdmissionBackdrop').style.opacity = '1';
        document.getElementById('walkinAdmissionBackdrop').style.pointerEvents = 'auto';
        document.getElementById('walkinAdmissionModal').style.opacity = '1';
        document.getElementById('walkinAdmissionModal').style.pointerEvents = 'auto';
        document.getElementById('walkinAdmissionModal').style.transform = 'translate(-50%, -50%) scale(1)';
        document.getElementById('wa-patientId').value = '';
        document.getElementById('wa-diagnosis').value = '';
    }

    function closeWalkInAdmissionModal() {
        document.getElementById('walkinAdmissionBackdrop').style.opacity = '0';
        document.getElementById('walkinAdmissionBackdrop').style.pointerEvents = 'none';
        document.getElementById('walkinAdmissionModal').style.opacity = '0';
        document.getElementById('walkinAdmissionModal').style.pointerEvents = 'none';
        document.getElementById('walkinAdmissionModal').style.transform = 'translate(-50%, -45%) scale(0.95)';
    }

    async function submitWalkInAdmission() {
        const patientId = document.getElementById('wa-patientId').value;
        const diagnosis = document.getElementById('wa-diagnosis').value || 'Walk-In Admission';
        if (!patientId) { alert("Patient ID is required."); return; }
        
        const token = sessionStorage.getItem('ehr_creds');

        try {
            const res = await fetch('/api/v2/emr/admissions/request', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    patientId: patientId,
                    patientName: "Patient " + patientId,
                    admittingDoctor: "Staff/Nurse",
                    diagnosis: diagnosis
                })
            });
            if (!res.ok) throw new Error("Failed to book admission");
            
            showToast("Direct Admission booked! Please select them from the Pending Queue and assign a bed.");
            closeWalkInAdmissionModal();
            fetchLiveWards(); // Refresh the queue
        } catch (e) {
            console.error("Failed to book walk-in admission", e);
            alert("Error booking admission. Check console.");
        }
    }

    // --- LIVE ANCILLARY POLLING LOGIC ---
    let ancillaryPollInterval = null;

    function startAncillaryPolling() {
        if (ancillaryPollInterval) clearInterval(ancillaryPollInterval);
        
        // Initial fetch
        fetchLiveAncillaryOrders();
        
        // Poll every 5 seconds
        ancillaryPollInterval = setInterval(fetchLiveAncillaryOrders, 5000);
    }

    async function fetchLiveAncillaryOrders() {
        try {
            const token = sessionStorage.getItem('ehr_admin_token') || localStorage.getItem('ehr_admin_token');
            const res = await fetch('/api/v2/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;
            const orders = await res.json();
            
            // Filter and render for each department
            renderAncillaryQueue('pharmacyView', orders.filter(o => o.type === 'Pharmacy'), '#10b981');
            renderAncillaryQueue('labView', orders.filter(o => o.type === 'Laboratory'), '#8b5cf6');
            renderAncillaryQueue('radView', orders.filter(o => o.type === 'Radiology'), '#f59e0b');
            
        } catch (error) {
            console.error("Polling error:", error);
        }
    }

    function renderAncillaryQueue(viewId, deptOrders, colorHex) {
        const queueDiv = document.getElementById(viewId + '-queue');
        if (!queueDiv) return;
        
        if (deptOrders.length === 0) {
            queueDiv.innerHTML = `
              <div style="padding: 40px; text-align: center;">
                <p style="color: #94a3b8; font-size: 14px;">No pending orders in queue.</p>
              </div>
            `;
            return;
        }
        
        queueDiv.innerHTML = deptOrders.map(o => `
          <div onclick="selectAncillaryOrder('${viewId}', '${o.id}', '${o.patientName || 'Unknown Patient'}', '${colorHex}')" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); margin-bottom: 12px; border-left: 4px solid ${colorHex};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #64748b;">${o.id}</span>
              <span style="font-size: 11px; font-weight: 700; color: ${colorHex}; background: ${colorHex}15; padding: 2px 6px; border-radius: 4px;">Live</span>
            </div>
            <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${o.patientName || 'Unknown Patient'}</h4>
            <p style="font-size: 13px; color: #64748b;">Ordered by: ${o.doctorName || 'Physician'}</p>
          </div>
        `).join('');
    }

    // Start polling when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        startAncillaryPolling();
    });

    // --- UNIFIED CLINICAL WORKSPACE LOGIC ---
    async function loadUnifiedWaitingList(clinicName) {
      currentClinicContext = clinicName;
      document.getElementById('clinicHeaderTitle').innerText = clinicName;
      
      switchEmrView('workspace');
      switchClinicTab('waiting');
      
      const tbody = document.getElementById('waitingListBody');
      tbody.innerHTML = '<tr><td colspan="5" style="padding: 40px; text-align: center; color: #64748b;">Loading queue...</td></tr>';
      
      try {
        // Fetch all patients and mock a queue for this specific department
        const token = sessionStorage.getItem('ehr_creds');
        const res = await fetch('/api/v2/patients', { headers: { 'Authorization': `Bearer ${token}` } });
        if(!res.ok) throw new Error("API failed");
        const allPatients = await res.json();
        
        // Mock filtering: just take a random subset for demo purposes to simulate departmental queues
        const numWaiting = Math.floor(Math.random() * 8) + 2; // 2 to 10 patients
        const queue = [...allPatients].sort(() => 0.5 - Math.random()).slice(0, numWaiting);
        
        document.getElementById('wlStatTotal').innerText = queue.length;
        document.getElementById('wlStatAssigned').innerText = Math.floor(queue.length / 3);
        document.getElementById('wlStatCompleted').innerText = Math.floor(Math.random() * 5);
        
        tbody.innerHTML = '';
        if(queue.length === 0) {
           tbody.innerHTML = `<tr><td colspan="5" style="padding: 60px; text-align: center;">
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
             <h4 style="font-size: 18px; font-weight: 600; color: #64748b;">No patients currently in queue.</h4>
             <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">Waiting list is clear for this department.</p>
           </td></tr>`;
           return;
        }
        
        queue.forEach((p, index) => {
          // Dynamic Badges
          const isPaid = Math.random() > 0.3;
          const payBadge = isPaid ? `<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">PAID</span>` 
                                  : `<span style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">UNPAID</span>`;
          const typeBadge = Math.random() > 0.5 ? `<span style="color: #475569; font-size: 12px; font-weight: 600; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">Follow-up</span>` 
                                                : `<span style="color: #4f46e5; font-size: 12px; font-weight: 600; background: #e0e7ff; padding: 4px 8px; border-radius: 4px;">Initial</span>`;
          
          const timeIn = new Date(Date.now() - Math.random() * 10000000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid #f1f5f9';
          tr.onmouseover = () => tr.style.background = '#f8fafc';
          tr.onmouseout = () => tr.style.background = 'transparent';
          
          tr.innerHTML = `
            <td style="padding: 16px 24px;">
              <p style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${p.name}</p>
              <p style="font-size: 12px; color: #64748b; font-family: monospace;">${p.id}</p>
            </td>
            <td style="padding: 16px 24px; color: #475569; font-size: 14px; font-weight: 500;">${timeIn}</td>
            <td style="padding: 16px 24px;">${payBadge}</td>
            <td style="padding: 16px 24px;">${typeBadge}</td>
            <td style="padding: 16px 24px; text-align: right; position: relative;">
              <button onclick="toggleKebabMenu('kebab-${p.id}')" style="background: transparent; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 4px;">⋮</button>
              
              <!-- Clean Kebab Dropdown -->
              <div id="kebab-${p.id}" class="kebab-menu hidden" style="position: absolute; right: 24px; top: 40px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 180px; z-index: 100; text-align: left; overflow: hidden;">
                <button onclick="startUnifiedConsult('${p.id}', '${p.name}')" style="width: 100%; text-align: left; padding: 12px 16px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; cursor: pointer; color: #0f172a; font-size: 13px; font-weight: 600;">🩺 Start Encounter</button>
                <button style="width: 100%; text-align: left; padding: 12px 16px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; cursor: pointer; color: #475569; font-size: 13px;">🔄 Route Patient</button>
                <button style="width: 100%; text-align: left; padding: 12px 16px; background: transparent; border: none; cursor: pointer; color: #ef4444; font-size: 13px;">❌ Remove from Queue</button>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });
        
      } catch(e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 40px; text-align: center; color: #ef4444;">Connection failed.</td></tr>';
      }
    }

    function toggleKebabMenu(menuId) {
      document.querySelectorAll('.kebab-menu').forEach(m => {
        if(m.id !== menuId) m.classList.add('hidden');
      });
      document.getElementById(menuId).classList.toggle('hidden');
    }
    
    // Close dropdowns if clicked outside
    document.addEventListener('click', (e) => {
      if(!e.target.innerText || e.target.innerText !== '⋮') {
        document.querySelectorAll('.kebab-menu').forEach(m => m.classList.add('hidden'));
      }
    });

    function startUnifiedConsult(patientId, patientName) {
      // Set the active consult tab
      const consultBtn = document.getElementById('tabConsult');
      consultBtn.style.display = 'block'; // Make it visible
      switchClinicTab('consult');
      
      // Load patient details (reusing existing functions if available)
      window.EMRContext.patient = { id: patientId, name: patientName };
      document.getElementById('patName').innerText = patientName;
      document.getElementById('patDetails').innerText = "ID: " + patientId;
      document.getElementById('composer').innerHTML = '';
      document.getElementById('timelineFeed').innerHTML = '<p style="color: #6b7280; font-size: 14px;">Fetching history...</p>';
    }

    // Overwrite switchClinicTab to handle the 3 workspace tabs
    function old_switchClinicTab(tab) {
      const btnWaiting = document.getElementById('tabWaiting');
      const btnConsult = document.getElementById('tabConsult');
      const btnRecords = document.getElementById('tabRecords');
      
      const contentWaiting = document.getElementById('waitingListTabContent');
      const contentConsult = document.getElementById('consultTabContent');
      const contentRecords = document.getElementById('recordsTabContent');
      
      // Reset
      [btnWaiting, btnConsult, btnRecords].forEach(btn => {
         if(btn) { btn.style.background = 'transparent'; btn.style.color = '#6b7280'; btn.style.boxShadow = 'none'; }
      });
      [contentWaiting, contentConsult, contentRecords].forEach(c => {
         if(c) c.classList.add('hidden');
      });
      
      // Activate
      const activeBtn = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
      const activeContent = document.getElementById(tab + 'TabContent');
      
      if(activeBtn) {
        activeBtn.style.background = 'white';
        activeBtn.style.color = '#0B5E7E';
        activeBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
      }
      if(activeContent) activeContent.classList.remove('hidden');
    }

    // --- RECORDS UNIT LOGIC ---
    // --- BILLING LOGIC ---
    let billingInterval = null;

    async function loadBilling() {
      try {
        const token = sessionStorage.getItem('ehr_creds');
        const res = await fetch('/api/v2/billing', { headers: { 'Authorization': `Bearer ${token}` } });
        if(!res.ok) return;
        let bills = await res.json();
        
        // Calculate KPIs
        let totalBilled = 0, totalCollected = 0, nhisClaims = 0, outstanding = 0;
        bills.forEach(b => {
          totalBilled += b.totalAmount || 0;
          nhisClaims += b.nhisCoverage || 0;
          if (b.status === 'Paid') {
            totalCollected += b.patientPayable || 0;
          } else if (b.status === 'Pending') {
            outstanding += b.patientPayable || 0;
          }
        });
        
        document.getElementById('bill-kpi-total').innerText = '₦' + totalBilled.toLocaleString();
        document.getElementById('bill-kpi-collected').innerText = '₦' + totalCollected.toLocaleString();
        document.getElementById('bill-kpi-claims').innerText = '₦' + nhisClaims.toLocaleString();
        document.getElementById('bill-kpi-outstanding').innerText = '₦' + outstanding.toLocaleString();
        
        // Filter
        const filterStatus = document.getElementById('billStatusFilter').value;
        if(filterStatus !== 'All') {
          bills = bills.filter(b => b.status === filterStatus);
        }
        
        const tbody = document.getElementById('billingTableBody');
        if(bills.length === 0) {
          tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:40px; color:#94a3b8; font-weight:bold; font-size:16px;"><div style="font-size:48px; margin-bottom:16px;">💳</div>No Invoices Found!</td></tr>`;
          return;
        }
        
        tbody.innerHTML = '';
        bills.forEach(b => {
          let statusColor = '#64748b';
          if(b.status === 'Pending') statusColor = '#ef4444';
          if(b.status === 'Paid') statusColor = '#10b981';
          if(b.status === 'Waived') statusColor = '#f59e0b';
          
          let actionBtns = '';
          if(b.status === 'Pending') {
             actionBtns = `<button onclick="updateBillStatus('${b.id}', 'Paid')" style="background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight:bold; margin-right:4px;">Mark Paid</button>
                           <button onclick="updateBillStatus('${b.id}', 'Waived')" style="background: #f59e0b; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight:bold;">Waive</button>`;
          } else {
             actionBtns = `<span style="color:#94a3b8; font-style:italic;">Settled</span>`;
          }

          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid #f1f5f9';
          tr.innerHTML = `
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a;">${b.id}</td>
            <td style="padding: 12px 16px;">${new Date(b.createdAt).toLocaleDateString()}</td>
            <td style="padding: 12px 16px; font-family: monospace;">${b.patientId}</td>
            <td style="padding: 12px 16px;"><strong>${b.service}</strong><br/>${b.description}</td>
            <td style="padding: 12px 16px;">₦${(b.totalAmount || 0).toLocaleString()}</td>
            <td style="padding: 12px 16px; color: #3b82f6;">₦${(b.nhisCoverage || 0).toLocaleString()}</td>
            <td style="padding: 12px 16px; font-weight: bold; color: #0f172a;">₦${(b.patientPayable || 0).toLocaleString()}</td>
            <td style="padding: 12px 16px; color: ${statusColor}; font-weight: bold;">${b.status}</td>
            <td style="padding: 12px 16px;">${actionBtns}</td>
          `;
          tbody.appendChild(tr);
        });
      } catch(e) {
        window.showGlobalError("Failed to load billing data.");
        console.error("Billing error", e);
      }
    }

    async function updateBillStatus(id, newStatus) {
      const token = sessionStorage.getItem('ehr_creds');
      await fetch(`/api/v2/billing/status`, {
        method: 'POST', // The backend route expects POST for status update in this codebase
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, status: newStatus })
      });
      loadBilling();
    }

    // --- REFERRALS POLLING LOGIC ---
    let referralsInterval = null;

    async function loadReferrals() {
      try {
        const token = sessionStorage.getItem('ehr_creds');
        const res = await fetch('/api/v2/referrals', { headers: { 'Authorization': `Bearer ${token}` } });
        if(!res.ok) return;
        const refs = await res.json();
        
        document.getElementById('ref-kpi-total').innerText = refs.length;
        document.getElementById('ref-kpi-accepted').innerText = refs.filter(r => r.status === 'Accepted').length;
        document.getElementById('ref-kpi-pending').innerText = refs.filter(r => r.status === 'Pending').length;
        document.getElementById('ref-kpi-completed').innerText = refs.filter(r => r.status === 'Completed').length;
        
        const tbody = document.getElementById('referralsTableBody');
        if(refs.length === 0) {
          tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:40px; color:#94a3b8; font-weight:bold; font-size:16px;"><div style="font-size:48px; margin-bottom:16px;">🚫</div>No Records Found!</td></tr>`;
          return;
        }
        
        tbody.innerHTML = '';
        refs.forEach((r, idx) => {
          const statusColor = r.status === 'Pending' ? '#cc0000' : (r.status === 'Accepted' ? '#008000' : '#0f766e');
          
          let actionBtns = '';
          if(r.status === 'Pending') {
             actionBtns = `<button onclick="updateReferral('${r.id}', 'Accepted')" style="background: #008000; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight:bold; margin-right:4px;">Accept</button>
                           <button onclick="updateReferral('${r.id}', 'Rejected')" style="background: #cc0000; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight:bold;">Reject</button>`;
          } else if(r.status === 'Accepted') {
             actionBtns = `<button onclick="updateReferral('${r.id}', 'Completed')" style="background: #0f766e; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight:bold;">Complete</button>`;
          } else {
             actionBtns = `<span style="color:#94a3b8; font-style:italic;">Archived</span>`;
          }

          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid #f1f5f9';
          tr.innerHTML = `
            <td style="padding: 12px 16px; color: #0f172a;">${idx + 1}</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a;">${r.patientName}</td>
            <td style="padding: 12px 16px; font-family: monospace;">${r.patientId}</td>
            <td style="padding: 12px 16px;">${r.fromUnit}</td>
            <td style="padding: 12px 16px; font-weight:600; color:#4f46e5;">${r.toUnit}</td>
            <td style="padding: 12px 16px;">${r.diagnosis}</td>
            <td style="padding: 12px 16px;">${new Date(r.date).toLocaleString()}</td>
            <td style="padding: 12px 16px; color: ${statusColor}; font-weight: bold;">${r.status}</td>
            <td style="padding: 12px 16px;">${actionBtns}</td>
          `;
          tbody.appendChild(tr);
        });
      } catch(e) {
        console.error("Referrals sync error", e);
      }
    }

    async function updateReferral(id, newStatus) {
      const token = sessionStorage.getItem('ehr_creds');
      await fetch(`/api/v2/referrals/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      loadReferrals();
    }

    function switchRecordsTab(tabName) {
      // Reset buttons
      document.querySelectorAll('[id^="recTab-"]').forEach(btn => {
        if(btn.id !== 'recTab-register') {
           btn.style.background = 'transparent'; btn.style.color = '#64748b'; btn.style.boxShadow = 'none';
        }
      });
      // Set active button (except register which is styled differently)
      if(tabName !== 'register') {
        const activeBtn = document.getElementById('recTab-' + tabName);
        activeBtn.style.background = 'white'; activeBtn.style.color = '#4f46e5'; activeBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
      }
      
      // Hide all contents
      document.querySelectorAll('.rec-tab-content').forEach(c => c.classList.add('hidden'));
      // Show active
      document.getElementById('recContent-' + tabName).classList.remove('hidden');
      
      if(tabName === 'referrals') { loadReferrals(); if(!referralsInterval) referralsInterval = setInterval(loadReferrals, 5000); } else { clearInterval(referralsInterval); referralsInterval = null; }
      if(tabName === 'patients') {
        loadRecordsData(); // Refresh data when opening tab
      }
    }

    async function loadRecordsData() {
      try {
        const token = sessionStorage.getItem('ehr_creds');
        const res = await fetch('/api/v2/patients', { headers: { 'Authorization': `Bearer ${token}` } });
        if(!res.ok) return;
        const patients = await res.json();
        
        // 1. Update Summary Cards
        document.getElementById('recStat-total').innerText = patients.length;
        const males = patients.filter(p => p.gender && p.gender.toLowerCase() === 'male').length;
        const females = patients.filter(p => p.gender && p.gender.toLowerCase() === 'female').length;
        document.getElementById('recStat-male').innerText = males;
        document.getElementById('recStat-female').innerText = females;
        
        // Mock new patients count
        document.getElementById('recStat-new').innerText = Math.floor(patients.length / 4) || 1;
        
        // 2. Render Modern Table
        const tbody = document.getElementById('recPatientsBody');
        tbody.innerHTML = '';
        document.getElementById('recShowingCount').innerText = patients.length;
        
        patients.forEach(p => {
          const hospId = p.id;
          const statusBadge = `<span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; border: 1px solid #bbf7d0;">Active</span>`;
          
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid #f1f5f9';
          tr.style.transition = 'background 0.2s';
          tr.onmouseover = () => tr.style.background = '#f8fafc';
          tr.onmouseout = () => tr.style.background = 'transparent';
          
          tr.innerHTML = `
            <td style="padding: 16px 24px; font-family: monospace; font-size: 14px; font-weight: 600; color: #475569;">${hospId}</td>
            <td style="padding: 16px 24px; font-weight: 700; color: #0f172a;">${p.name}</td>
            <td style="padding: 16px 24px; color: #64748b; font-size: 14px;">${p.gender || '-'}</td>
            <td style="padding: 16px 24px; color: #64748b; font-size: 14px;">${p.phone || '-'}</td>
            <td style="padding: 16px 24px;">${statusBadge}</td>
            <td style="padding: 16px 24px;">
              <button class="icon-btn" style="background: #f1f5f9; border-radius: 6px; padding: 6px 10px; color: #4f46e5; font-size: 14px; font-weight: 600;" onclick="switchEmrView('omniBar'); document.getElementById('mpiSearch').value='${hospId}'; debounceSearch();">View</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
        
      } catch(e) {
        window.showGlobalError("Failed to load records data.");
        console.error("Records error", e);
      }
    }

    function filterRecordsTable() {
      const q = document.getElementById('recSearchInput').value.toLowerCase();
      const rows = document.getElementById('recPatientsBody').querySelectorAll('tr');
      let visible = 0;
      rows.forEach(row => {
        if(row.innerText.toLowerCase().includes(q)) {
          row.style.display = '';
          visible++;
        } else {
          row.style.display = 'none';
        }
      });
      document.getElementById('recShowingCount').innerText = visible;
    }

    function nextStep(step) {
      // Hide all forms
      document.querySelectorAll('.step-form').forEach(f => f.classList.add('hidden'));
      document.getElementById('stepForm-' + step).classList.remove('hidden');
      
      // Update progress bar width
      const prog = document.getElementById('stepProgress');
      if(step === 1) prog.style.width = '0%';
      if(step === 2) prog.style.width = '50%';
      if(step === 3) prog.style.width = '100%';
      
      // Update indicators
      for(let i=1; i<=3; i++) {
        const ind = document.getElementById('stepInd-' + i);
        const circle = ind.children[0];
        const label = ind.children[1];
        if(i <= step) {
          circle.style.background = '#4f46e5';
          circle.style.color = 'white';
          label.style.color = '#0f172a';
        } else {
          circle.style.background = '#e2e8f0';
          circle.style.color = '#64748b';
          label.style.color = '#64748b';
        }
      }
    }
    
    async function submitWizard() {
      const name = document.getElementById('wizFirst').value + ' ' + document.getElementById('wizLast').value;
      const dob = document.getElementById('wizDob').value;
      const gender = document.getElementById('wizSex').value;
      const phone = document.getElementById('wizPhone').value;
      
      if(!document.getElementById('wizFirst').value || !document.getElementById('wizLast').value) {
        alert("Please enter First and Last Name.");
        return;
      }
      
      // Fake submit (just loading omnibar logic)
      document.getElementById('regName').value = name;
      document.getElementById('regDob').value = dob;
      document.getElementById('regGender').value = gender;
      document.getElementById('regPhone').value = phone;
      
      await submitQuickRegister(); // Reuse existing quick register API logic
      
      showToast("Patient Registered Successfully! ID created.");
      
      // Reset wizard & go back to list
      document.querySelectorAll('.step-form input').forEach(i => i.value='');
      nextStep(1);
      switchRecordsTab('patients');
    }

    let currentClinicContext = "GOPD";
    
    function old_enterClinic(clinicName) {
      currentClinicContext = clinicName;
      document.getElementById('clinicHeaderTitle').innerText = clinicName + ' Workspace';
      switchEmrView('workspace');
      switchClinicTab('consult');
    }

    function old_switchClinicTab(tab) {
      const btnConsult = document.getElementById('tabConsult');
      const btnRecords = document.getElementById('tabRecords');
      const contentConsult = document.getElementById('consultTabContent');
      const contentRecords = document.getElementById('recordsTabContent');
      
      if(tab === 'consult') {
        btnConsult.style.background = 'white';
        btnConsult.style.color = '#0B5E7E';
        btnConsult.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        
        btnRecords.style.background = 'transparent';
        btnRecords.style.color = '#6b7280';
        btnRecords.style.boxShadow = 'none';
        
        contentConsult.classList.remove('hidden');
        contentRecords.classList.add('hidden');
      } else {
        btnRecords.style.background = 'white';
        btnRecords.style.color = '#0B5E7E';
        btnRecords.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        
        btnConsult.style.background = 'transparent';
        btnConsult.style.color = '#6b7280';
        btnConsult.style.boxShadow = 'none';
        
        contentRecords.classList.remove('hidden');
        contentConsult.classList.add('hidden');
      }
    }

    // ----------------------------------------------------
    // Node B: Gatekeeper & Initialization
    // ----------------------------------------------------
    window.EMRContext = { patient: null };
    let nlpTimer = null;
    let autoSaveTimer = null;
    
    document.addEventListener("DOMContentLoaded", () => {
      let token = sessionStorage.getItem("ehr_creds") || localStorage.getItem("ehr_admin_token");
      if (!token) {
        window.location.href = "command.html";
        return;
      }
      let userRole = localStorage.getItem('ehr_user_role') || 'admin';
      setTimeout(() => setEmrRole(userRole), 100);

      // Check Context
      const facility = sessionStorage.getItem("emr_facility_id");
      if (facility) {
        document.getElementById("contextModal").classList.add("hidden");
        showOmniBar();
      }
    });

    function setContext() {
      const val = document.getElementById("facilitySelect").value;
      if (!val) { alert('Please select a facility first.'); return; }
      sessionStorage.setItem("emr_facility_id", val);
      const modal = document.getElementById("contextModal");
      modal.style.display = 'none';
      showOmniBar();
    }

    // Auto-restore context if already set
    (function checkExistingContext() {
      const existingFacility = sessionStorage.getItem("emr_facility_id");
      if (existingFacility) {
        const modal = document.getElementById("contextModal");
        if (modal) modal.style.display = 'none';
        showOmniBar();
      }
    })();


    // History API Listener for Back/Forward Navigation
    window.onpopstate = function(event) {
      if (event.state && event.state.viewId) {
        switchEmrView(event.state.viewId, false);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        if (view) {
          switchEmrView(view, false);
        } else {
          switchEmrView('omniBar', false);
        }
      }
    };

    function switchEmrView(viewId, pushState = true) {
      if (pushState) {
        history.pushState({ viewId: viewId }, "", "?view=" + viewId);
      }
      document.querySelectorAll('.emr-view').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
        el.style.display = 'none';
      });
      const target = document.getElementById(viewId);
      if(target) {
        target.classList.remove('hidden');
        target.classList.add('active');
        // Restore flex display to maintain internal grid/flex layouts
        target.style.display = 'flex';
      }
      
      // Update sidebar active states
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.querySelector(`.nav-btn[onclick="switchEmrView('${viewId}')"]`);
      if(activeBtn) activeBtn.classList.add('active');
      
      if(viewId === 'omniBar') {
        setTimeout(() => {
          const s = document.getElementById("mpiSearch");
          if(s) s.focus();
        }, 100);
      }
      
      // --- Realtime polling hooks ---
      clearInterval(bedsInterval);
      clearInterval(invInterval);
      clearInterval(billingInterval);
      clearInterval(referralsInterval);
      
      if (viewId === 'wardsView') {
        if(typeof fetchLiveWards === 'function') { fetchLiveWards(); bedsInterval = setInterval(fetchLiveWards, 5000); }
      } else if (viewId === 'pharmacyView') {
        if(typeof fetchLiveInventory === 'function') { fetchLiveInventory(); invInterval = setInterval(fetchLiveInventory, 10000); }
      } else if (viewId === 'billingView') {
        if(typeof loadBilling === 'function') { loadBilling(); billingInterval = setInterval(loadBilling, 8000); }
      } else if (viewId === 'recordsMainView') {
        if(typeof loadRecordsData === 'function') { loadRecordsData(); }
      }
    }

    function showOmniBar() {
      switchEmrView('omniBar');
    }
    
    function printSummary() {
      alert("Printing Patient Summary... (Mock)");
    }


    // ----------------------------------------------------
    // Node H: MPI Search
    // ----------------------------------------------------
    let searchTimer = null;
    function debounceSearch() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(performSearch, 500);
    }
    
    async function performSearch() {
      const q = document.getElementById("mpiSearch").value;
      if (q.length < 2) {
        document.getElementById("searchResults").innerHTML = "";
        return;
      }
      
      const token = sessionStorage.getItem("ehr_creds");
      try {
        const res = await fetch(`/api/v2/mpi/search?q=${encodeURIComponent(q)}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        let html = "";
        if (data.results && data.results.length > 0) {
          data.results.forEach(p => {
            html += `<div class="search-result-item" onclick='loadPatient(${JSON.stringify(p)})'>
              <strong>${p.name}</strong> <span style="color:#6b7280; font-size:12px;">(${p.id})</span>
            </div>`;
          });
        } else {
          html = `<div style="padding: 12px; color: #6b7280; font-size: 14px;">No patients found. Use "+ New Patient" below.</div>`;
        }
        document.getElementById("searchResults").innerHTML = html;
      } catch (err) {
        console.error("Search error", err);
      }
    }

    function toggleQuickRegister() {
      document.getElementById("quickRegisterForm").classList.toggle("hidden");
    }

    async function submitQuickRegister() {
      const name = document.getElementById("regName").value;
      const dob = document.getElementById("regDob").value;
      const gender = document.getElementById("regGender").value;
      const phone = document.getElementById("regPhone").value;
      
      if (!name || !dob) { alert("Name and DOB required"); return; }
      
      const token = sessionStorage.getItem("ehr_creds");
      try {
        const res = await fetch(`/api/v2/mpi/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ name, dob, gender, phone })
        });
        const data = await res.json();
        if (data.success) {
          loadPatient(data.patient);
        }
      } catch (err) {
        console.error(err);
      }
    }

    // ----------------------------------------------------
    // Node K: Load Context & Workspace
    // ----------------------------------------------------
    async function loadPatient(patient) {
      window.EMRContext.patient = patient;
      switchEmrView('workspace');
      
      document.getElementById("patName").textContent = patient.name;
      document.getElementById("patDetails").textContent = `${patient.id} | DOB: ${patient.dob || 'Unknown'} | ${patient.gender || ''}`;
      
      document.getElementById("composer").innerHTML = "";
      document.getElementById("aiChips").innerHTML = "";
      
      const draft = localStorage.getItem(`emr_draft_${patient.id}`);
      if (draft) {
        if(confirm("Restore unsaved draft?")) {
          document.getElementById("composer").innerText = draft;
        } else {
          localStorage.removeItem(`emr_draft_${patient.id}`);
        }
      }
      
      document.getElementById("composer").focus();
      
      // Node N: Auto-save scratchpad
      if(autoSaveTimer) clearInterval(autoSaveTimer);
      autoSaveTimer = setInterval(() => {
        const text = document.getElementById("composer").innerText;
        if(text.trim()) localStorage.setItem(`emr_draft_${patient.id}`, text);
      }, 3000);
      
      // Setup Composer NLP Listener
      document.getElementById("composer").addEventListener("input", () => {
        clearTimeout(nlpTimer);
        nlpTimer = setTimeout(triggerNLPEngine, 2000);
      });
      
      await loadTimeline(patient.id);
    }
    
    function exitEncounter() {
      if(!confirm("Are you sure you want to cancel this encounter? Unsaved notes will be lost.")) return;
      if(autoSaveTimer) clearInterval(autoSaveTimer);
      window.EMRContext.patient = null;
      document.getElementById("mpiSearch").value = "";
      document.getElementById("searchResults").innerHTML = "";
      document.getElementById("quickRegisterForm").classList.add("hidden");
      showOmniBar();
    }

    async function loadTimeline(patientId) {
      const token = sessionStorage.getItem("ehr_creds");
      try {
        const res = await fetch(`/api/v2/emr/encounters?patientId=${patientId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const feed = document.getElementById("timelineFeed");
        if (data.encounters && data.encounters.length > 0) {
          feed.innerHTML = data.encounters.map(e => `
            <div class="timeline-item" style="${e.type === 'Nursing Note' ? 'border-left-color: #0ea5e9;' : ''}">
              <div class="timeline-date">${new Date(e.date).toLocaleDateString()} - ${e.id}</div>
              ${e.type === 'Nursing Note' 
                ? `<div style="display: inline-block; background: #e0f2fe; color: #0284c7; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 12px; margin-bottom: 8px; letter-spacing: 0.05em; border: 1px solid #bae6fd;">🩺 NURSING LOG</div>`
                : `<div class="timeline-dx">${e.icd11 ? `ICD-11: ${e.icd11}` : `Observation: ${e.icd11Display || 'N/A'}`}</div>`
              }
              <div style="font-size: 13px; color: #4b5563; margin-top:8px; line-height: 1.5;">
                ${e.type === 'Nursing Note' ? (
                  (e.vitals ? `<span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:600; color:#334155; margin-right:8px; font-size: 12px;">❤️ HR: ${e.vitals.heartRate}</span><span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:600; color:#334155; font-size: 12px; margin-bottom: 8px; display:inline-block;">🩸 BP: ${e.vitals.bloodPressureSystolic}/${e.vitals.bloodPressureDiastolic}</span><br>` : '') +
                  (e.fluid ? `<b>Fluid Administered:</b> ${e.fluid}<br>` : '') +
                  (e.text || '')
                ) : (e.text || 'No clinical notes recorded.')}
              </div>
            </div>
          `).join('');
        } else {
          feed.innerHTML = `<p style="font-size:13px; color:#9ca3af;">No historical encounters.</p>`;
        }
      } catch(err) {}
    }

    // ----------------------------------------------------
    // Node O: Speech to Text (Web Speech API)
    // ----------------------------------------------------
    let recognition;
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = function(event) {
        let final_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (final_transcript) {
          const comp = document.getElementById("composer");
          comp.innerText += final_transcript;
          // trigger NLP manually
          clearTimeout(nlpTimer);
          nlpTimer = setTimeout(triggerNLPEngine, 2000);
        }
      };
    }
    
    document.getElementById("composerMicBtn").addEventListener("click", function() {
      if(!recognition) return alert("Speech API not supported");
      if(this.classList.contains("active")) {
        recognition.stop();
        this.classList.remove("active");
        this.innerHTML = "🎤 Dictate";
      } else {
        recognition.start();
        this.classList.add("active");
        this.innerHTML = "🛑 Stop";
      }
    });

    // ----------------------------------------------------
    // Node P & Q: NLP Highlighting & AI Chips
    // ----------------------------------------------------
    async function triggerNLPEngine() {
      const comp = document.getElementById("composer");
      const text = comp.innerText;
      if(!text.trim()) return;
      
      // Node P: Lightweight NLP highlighting overlay (simplified for non-destructive DOM updates without messing up caret)
      // Because modifying innerHTML directly destroys the user's cursor position in contenteditable,
      // true robust highlighting requires complex Range mapping. 
      // For this isolated implementation, we'll focus on the AI chips which satisfy Nodes Q-U.
      
      const token = sessionStorage.getItem("ehr_creds");
      try {
        const res = await fetch(`/api/v2/emr/ai/suggest`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        
        const chipContainer = document.getElementById("aiChips");
        chipContainer.innerHTML = "";
        if(data.chips) {
          data.chips.forEach(chip => {
            const btn = document.createElement("button");
            btn.className = "chip";
            btn.textContent = chip;
            btn.onclick = () => appendChipToPlan(chip);
            chipContainer.appendChild(btn);
          });
        }
      } catch(err) {}
    }
    
    function appendChipToPlan(chipText) {
      const comp = document.getElementById("composer");
      let text = comp.innerText;
      if(text.includes("Plan:")) {
        comp.innerText = text.replace("Plan:", `Plan:
- ${chipText}`);
      } else {
        comp.innerText = text + `

Plan:
- ${chipText}`;
      }
      triggerNLPEngine(); // refresh chips
    }

    // ----------------------------------------------------
    // Node W-AE: Sign & Close Encounter
    // ----------------------------------------------------
    function saveDraft() {
      const patientId = window.EMRContext.patient.id;
      const text = document.getElementById("composer").innerText;
      localStorage.setItem(`emr_draft_${patientId}`, text);
      showToast("Draft saved.");
    }
    
    let pendingEncounterPayload = null;
    let pendingSubstitute = null;
    
    async function signAndClose() {
      const text = document.getElementById("composer").innerText;
      if(!text.trim()) return alert("Encounter is empty.");
      
      const patientId = window.EMRContext.patient.id;
      
      // Parse Plan for drugs (Mock regex for "Rx: drugname")
      const rxMatches = [...text.matchAll(/Rx:\s*([A-Za-z0-9\s-]+)/g)];
      const prescriptions = rxMatches.map(m => m[1].trim());
      
      const token = sessionStorage.getItem("ehr_creds");
      
      // Node X: Isolated Inventory Check
      if(prescriptions.length > 0) {
        try {
          // Check the first drug for mock purposes
          const res = await fetch(`/api/v2/emr/inventory/check?drug=${encodeURIComponent(prescriptions[0])}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await res.json();
          if(!res.ok && data.substitute) {
            // Node Y -> Z: Show Modal
            pendingEncounterPayload = { text, patientId, prescriptions };
            pendingSubstitute = { original: prescriptions[0], substitute: data.substitute };
            document.getElementById("oosMessage").innerText = `"${prescriptions[0]}" is out of stock. Suggested substitute: ${data.substitute}.`;
            document.getElementById("oosModal").style.display = "flex";
            return; // Halt flow
          }
        } catch(err) { console.error(err); }
      }
      
      // Proceed to commit
      const admitWard = document.getElementById('admitWardSelect').value;
      if (admitWard) {
          // Find a vacant bed in the selected ward
          try {
              const bRes = await fetch('/api/v2/beds');
              const beds = await bRes.json();
              const vacantBed = beds.find(b => b.ward === admitWard && b.status === 'Vacant');
              if (vacantBed) {
                  await fetch('/api/v2/beds/admit', {
                      method: 'POST',
                      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                      body: JSON.stringify({ patientId: patientId, bedId: vacantBed.id, diagnosis: "Automated Admission from Consult" })
                  });
              } else {
                  alert(`No vacant beds available in ${admitWard}!`);
              }
          } catch(e) { console.error("Admission failed", e); }
      }
      
      await commitEncounter({ text, patientId, prescriptions });
    }
    
    function closeOosModal() {
      document.getElementById("oosModal").style.display = "none";
      pendingEncounterPayload = null;
      pendingSubstitute = null;
    }
    
    async function acceptSubstitute() {
      document.getElementById("oosModal").style.display = "none";
      if(pendingEncounterPayload && pendingSubstitute) {
        // Swap it in text
        let newText = pendingEncounterPayload.text.replace(new RegExp(`Rx:\\s*${pendingSubstitute.original}`, "g"), `Rx: ${pendingSubstitute.substitute}`);
        document.getElementById("composer").innerText = newText;
        pendingEncounterPayload.text = newText;
        pendingEncounterPayload.prescriptions = [pendingSubstitute.substitute];
        
        await commitEncounter(pendingEncounterPayload);
      }
    }
    
    async function commitEncounter(payload) {
      const token = sessionStorage.getItem("ehr_creds");
      try {
        const res = await fetch(`/api/v2/emr/encounters/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.success) {
          // Reset
          localStorage.removeItem(`emr_draft_${payload.patientId}`);
          showToast("Encounter signed & closed successfully!");
          setTimeout(() => {
            window.EMRContext.patient = null;
            if(autoSaveTimer) clearInterval(autoSaveTimer);
            document.getElementById("mpiSearch").value = "";
            document.getElementById("searchResults").innerHTML = "";
            switchEmrView('postEncounterView');
          }, 1500);
        } else {
          alert("Commit failed: " + data.error);
        }
      } catch(err) {
        alert("Commit error");
      }
    }
    
    // Warn before exit if dirty form
    window.addEventListener("beforeunload", (e) => {
      if (!document.getElementById("workspace").classList.contains("hidden")) {
        const text = document.getElementById("composer").innerText;
        if (text.trim().length > 0) {
          e.preventDefault();
          e.returnValue = "";
        }
      }
    });
    
    function showToast(msg) {
      const toast = document.getElementById("toast");
      toast.innerText = msg;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3000);
    }
  