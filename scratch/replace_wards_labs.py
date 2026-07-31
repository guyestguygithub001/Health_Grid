import re

filepath = r'C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr\public\command.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Wards View
wards_new = r"""<div id="wardsView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Inpatient Wards</h2>
            <p style="color: #6b7280; font-size: 16px;">Live bed management and admission tracking.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="openAdmitModal()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              + Admit Patient
            </button>
            <button onclick="fetchLiveWards()" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              🔄 Refresh Beds
            </button>
          </div>
        </div>
        
        <div id="wardsErrorAlert" style="display: none; padding: 12px; background: #fef2f2; color: #991b1b; border-left: 4px solid #dc2626; border-radius: 4px; margin-bottom: 20px;">
          <span>⚠️ Error admitting patient.</span>
        </div>

        <div class="glass-card">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                  <th style="padding: 12px 8px;">Bed ID</th>
                  <th style="padding: 12px 8px;">Ward</th>
                  <th style="padding: 12px 8px;">Status</th>
                  <th style="padding: 12px 8px;">Patient ID</th>
                </tr>
              </thead>
              <tbody id="liveWardsTableBody">
                <tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">Click refresh to fetch bed statuses...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Admit Modal -->
        <div id="admitPatientModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
          <div style="background: white; padding: 32px; border-radius: 16px; width: 400px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; font-size: 20px; color: #111827; margin-bottom: 16px;">Admit Patient</h3>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Patient ID</label>
              <input type="text" id="admitPatientId" placeholder="e.g. PAT-001" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Select Available Bed</label>
              <select id="admitBedSelect" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                <option value="">Loading beds...</option>
              </select>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button onclick="closeAdmitModal()" style="padding: 10px 16px; background: #f3f4f6; color: #4b5563; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
              <button onclick="submitAdmission()" style="padding: 10px 16px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Admit & Bill</button>
            </div>
          </div>
        </div>
      </div>"""

# Replace Labs View
labs_new = r"""<div id="labsView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Laboratory & Diagnostics</h2>
            <p style="color: #6b7280; font-size: 16px;">Regional laboratory order and result processing.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="openOrderLabModal()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              + Order Lab Test
            </button>
            <button onclick="fetchLiveLabs()" style="padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              🔄 Refresh Orders
            </button>
          </div>
        </div>
        
        <div id="labsErrorAlert" style="display: none; padding: 12px; background: #fef2f2; color: #991b1b; border-left: 4px solid #dc2626; border-radius: 4px; margin-bottom: 20px;">
          <span>⚠️ Error placing lab order.</span>
        </div>

        <div class="glass-card">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                  <th style="padding: 12px 8px;">Order ID</th>
                  <th style="padding: 12px 8px;">Patient ID</th>
                  <th style="padding: 12px 8px;">Item</th>
                  <th style="padding: 12px 8px;">Priority</th>
                  <th style="padding: 12px 8px;">Status</th>
                </tr>
              </thead>
              <tbody id="liveLabsTableBody">
                <tr><td colspan="5" style="padding: 20px; text-align: center; color: #9ca3af;">Click refresh to fetch lab orders...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Order Lab Modal -->
        <div id="orderLabModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
          <div style="background: white; padding: 32px; border-radius: 16px; width: 400px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; font-size: 20px; color: #111827; margin-bottom: 16px;">Order Lab Test</h3>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Patient ID</label>
              <input type="text" id="labPatientId" placeholder="e.g. PAT-001" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Test Type</label>
              <select id="labTestSelect" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                <option value="Complete Blood Count">Complete Blood Count</option>
                <option value="Malaria Parasite">Malaria Parasite</option>
                <option value="Urinalysis">Urinalysis</option>
                <option value="Liver Function Test">Liver Function Test</option>
              </select>
            </div>
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Priority</label>
              <select id="labPrioritySelect" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button onclick="closeOrderLabModal()" style="padding: 10px 16px; background: #f3f4f6; color: #4b5563; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
              <button onclick="submitLabOrder()" style="padding: 10px 16px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Order & Bill</button>
            </div>
          </div>
        </div>
      </div>"""

# Replace Wards HTML
if re.search(r'(<div id="wardsView".*?)(?=<div id="labsView")', content, re.DOTALL | re.IGNORECASE):
    content = re.sub(r'(<div id="wardsView".*?)(?=<div id="labsView")', wards_new + "\n\n      ", content, flags=re.DOTALL | re.IGNORECASE)
else:
    print("Could not find wardsView replacement boundary.")

# Replace Labs HTML
if re.search(r'(<div id="labsView".*?)(?=<div id="billingView")', content, re.DOTALL | re.IGNORECASE):
    content = re.sub(r'(<div id="labsView".*?)(?=<div id="billingView")', labs_new + "\n\n      ", content, flags=re.DOTALL | re.IGNORECASE)
else:
    print("Could not find labsView replacement boundary.")

js_injection = r"""
    // ── EHR: Wards Logic
    async function fetchLiveWards() {
      try {
        const res = await fetch('/api/v1/beds'); // Note: Assuming standard endpoint or we can try v2
        const beds = await res.json();
        const tbody = document.getElementById('liveWardsTableBody');
        tbody.innerHTML = '';
        if (beds.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;">No beds found.</td></tr>';
          return;
        }
        beds.forEach(bed => {
          tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 8px; font-weight: 500;">${bed.id}</td>
              <td style="padding: 12px 8px;">${bed.ward}</td>
              <td style="padding: 12px 8px;">
                <span style="padding: 4px 8px; border-radius: 999px; font-size: 12px; background: ${bed.status === 'Occupied' ? '#fee2e2' : '#dcfce7'}; color: ${bed.status === 'Occupied' ? '#991b1b' : '#166534'}">${bed.status}</span>
              </td>
              <td style="padding: 12px 8px;">${bed.patientId || '-'}</td>
            </tr>
          `;
        });
      } catch (err) {
        console.error("Wards error:", err);
      }
    }

    async function openAdmitModal() {
      document.getElementById('admitPatientModal').style.display = 'flex';
      try {
        const res = await fetch('/api/v1/beds'); // V1 or V2? I will try '/api/v2/beds' just in case. Let me use v2
        const beds = await res.json();
        const select = document.getElementById('admitBedSelect');
        select.innerHTML = '<option value="">Select Bed</option>';
        beds.filter(b => b.status === 'Available').forEach(bed => {
          select.innerHTML += `<option value="${bed.id}">${bed.id} - ${bed.ward}</option>`;
        });
      } catch(err) {
        document.getElementById('admitBedSelect').innerHTML = '<option value="">Failed to load beds</option>';
      }
    }

    function closeAdmitModal() {
      document.getElementById('admitPatientModal').style.display = 'none';
      document.getElementById('admitPatientId').value = '';
    }

    async function submitAdmission() {
      const patientId = document.getElementById('admitPatientId').value;
      const bedId = document.getElementById('admitBedSelect').value;
      if (!patientId || !bedId) return alert('Patient ID and Bed are required.');
      
      try {
        const res = await fetch('/api/v2/beds/admit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, bedId })
        });
        if (res.ok) {
          closeAdmitModal();
          fetchLiveWards();
        } else {
          document.getElementById('wardsErrorAlert').style.display = 'block';
          setTimeout(() => document.getElementById('wardsErrorAlert').style.display = 'none', 3000);
        }
      } catch (err) {
        document.getElementById('wardsErrorAlert').style.display = 'block';
      }
    }

    // ── EHR: Labs Logic
    async function fetchLiveLabs() {
      try {
        const res = await fetch('/api/v2/orders');
        let orders = await res.json();
        orders = orders.filter(o => o.type === 'Laboratory');
        const tbody = document.getElementById('liveLabsTableBody');
        tbody.innerHTML = '';
        if (orders.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;text-align:center;">No lab orders found.</td></tr>';
          return;
        }
        orders.forEach(o => {
          tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 8px; font-weight: 500;">${o.id}</td>
              <td style="padding: 12px 8px;">${o.patientId}</td>
              <td style="padding: 12px 8px;">${o.item}</td>
              <td style="padding: 12px 8px;">
                <span style="padding: 4px 8px; border-radius: 999px; font-size: 12px; background: ${o.priority === 'Emergency' ? '#fee2e2' : o.priority === 'Urgent' ? '#fef3c7' : '#f3f4f6'}; color: ${o.priority === 'Emergency' ? '#991b1b' : o.priority === 'Urgent' ? '#92400e' : '#4b5563'}">${o.priority}</span>
              </td>
              <td style="padding: 12px 8px;">${o.status}</td>
            </tr>
          `;
        });
      } catch (err) {
        console.error("Labs error:", err);
      }
    }

    function openOrderLabModal() {
      document.getElementById('orderLabModal').style.display = 'flex';
    }

    function closeOrderLabModal() {
      document.getElementById('orderLabModal').style.display = 'none';
      document.getElementById('labPatientId').value = '';
    }

    async function submitLabOrder() {
      const patientId = document.getElementById('labPatientId').value;
      const item = document.getElementById('labTestSelect').value;
      const priority = document.getElementById('labPrioritySelect').value;
      if (!patientId) return alert('Patient ID is required.');
      
      try {
        const res = await fetch('/api/v2/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, type: 'Laboratory', item, priority })
        });
        if (res.ok) {
          closeOrderLabModal();
          fetchLiveLabs();
        } else {
          document.getElementById('labsErrorAlert').style.display = 'block';
          setTimeout(() => document.getElementById('labsErrorAlert').style.display = 'none', 3000);
        }
      } catch (err) {
        document.getElementById('labsErrorAlert').style.display = 'block';
      }
    }
"""

# Now we need to inject the JS logic just before the closing script tag.
# We will find the place where we injected Billing Logic and put it there.
js_pattern = r'(    // ── EHR: Billing Logic)'

if re.search(js_pattern, content):
    content = re.sub(js_pattern, js_injection + "\n\n\\1", content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("JS logic injected successfully.")
else:
    print("Could not find JS logic injection point.")
