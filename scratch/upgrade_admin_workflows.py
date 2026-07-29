"""
Upgrade admin.html with sleek workflows for Admin Units
"""
import os

filepath = 'public/admin.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject sleek Modals at the end of the body (before <script>)
modals_html = """
  <!-- Sleek Modals for Workflows -->
  
  <!-- Discharge Modal -->
  <div id="dischargeModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 1000; justify-content: center; align-items: center;">
    <div style="background: white; border-radius: 16px; padding: 32px; width: 100%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); animation: slideUp 0.3s forwards;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: #fee2e2; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px;">🛏️</div>
        <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0;">Discharge Patient</h3>
        <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Are you sure you want to discharge this patient and mark the bed as Vacant?</p>
      </div>
      <input type="hidden" id="dischargeBedId">
      <input type="hidden" id="dischargePatientId">
      <div style="display: flex; gap: 12px;">
        <button onclick="document.getElementById('dischargeModal').style.display='none'" style="flex: 1; padding: 12px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">Cancel</button>
        <button onclick="confirmDischarge()" style="flex: 1; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2); transition: background 0.2s;">Confirm Discharge</button>
      </div>
    </div>
  </div>

  <!-- Lab Results Modal -->
  <div id="labResultModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 1000; justify-content: center; align-items: center;">
    <div style="background: white; border-radius: 16px; padding: 32px; width: 100%; max-width: 450px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); animation: slideUp 0.3s forwards;">
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <div style="width: 40px; height: 40px; background: #f3e8ff; color: #9333ea; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🧪</div>
          <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0;">Enter Lab Results</h3>
        </div>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Record diagnostic values for this order.</p>
      </div>
      <input type="hidden" id="labOrderId">
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px;">Clinical Findings / Values</label>
        <textarea id="labResultText" rows="4" placeholder="e.g. Hemoglobin 12.5 g/dL, WBC 5.4..." style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.2s;"></textarea>
      </div>
      <div style="display: flex; gap: 12px;">
        <button onclick="document.getElementById('labResultModal').style.display='none'" style="flex: 1; padding: 12px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
        <button onclick="confirmLabComplete()" style="flex: 2; padding: 12px; background: #9333ea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(147, 51, 234, 0.2);">Mark as Completed</button>
      </div>
    </div>
  </div>

  <!-- Payment Receipt Modal -->
  <div id="paymentModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 1000; justify-content: center; align-items: center;">
    <div style="background: white; border-radius: 16px; padding: 32px; width: 100%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); animation: slideUp 0.3s forwards;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px dashed #e2e8f0; padding-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px;">💳</div>
        <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0;">Payment Processing</h3>
        <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Receive funds and generate digital receipt.</p>
      </div>
      <input type="hidden" id="paymentBillId">
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px;">
        <span style="color: #64748b;">Amount Due:</span>
        <strong style="color: #0f172a; font-size: 20px;">₦<span id="paymentAmountDisplay"></span></strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 15px;">
        <span style="color: #64748b;">Payment Method:</span>
        <select style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px; font-size: 14px; outline: none;">
          <option>Cash / POS</option>
          <option>Bank Transfer</option>
          <option>NHIS / HMO Claim</option>
        </select>
      </div>
      <div style="display: flex; gap: 12px;">
        <button onclick="document.getElementById('paymentModal').style.display='none'" style="flex: 1; padding: 12px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
        <button onclick="confirmPayment()" style="flex: 2; padding: 12px; background: #16a34a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.2);">Confirm Payment</button>
      </div>
    </div>
  </div>
  <style>
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    .terminal-scroll::-webkit-scrollbar { width: 8px; }
    .terminal-scroll::-webkit-scrollbar-track { background: #0f172a; }
    .terminal-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  </style>
"""

if "<!-- Sleek Modals for Workflows -->" not in content:
    content = content.replace("</main>", "</main>\n" + modals_html)


# 2. Upgrade Legal Matrix View
old_legal_view_inner = """
          <h4 style="color:#fff; font-size:16px; margin:24px 0 8px;">1. Terms of Service & Explicit Consent</h4>
          <p style="color:#94a3b8; font-size: 14px; line-height: 1.6;">Use of the Global Health Grid requires explicit, click-through consent before account authorization. All clinical staff and users are responsible for credential security and acceptable use.</p>

          <h4 style="color:#fff; font-size:16px; margin:24px 0 8px;">2. Privacy Policy & Data Sovereignty</h4>
          <p style="color:#94a3b8; font-size: 14px; line-height: 1.6;">Personal health information (PHI) is processed under lawful bases established by the Nigeria Data Protection Act (NDPA 2023). Biometric data is stored in locally encrypted SQLite caches and never transmitted raw.</p>
"""

new_legal_view_inner = """
          <div style="margin-top: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="color:#fff; font-size:16px; margin: 0; display: flex; align-items: center; gap: 8px;"><span style="color: #10b981;">●</span> Live System Audit Trail</h4>
              <button onclick="fetchAuditLogs()" style="padding: 6px 12px; background: #334155; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Refresh Stream</button>
            </div>
            
            <div id="auditTerminal" class="terminal-scroll" style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; height: 350px; overflow-y: auto; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #a5b4fc; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
              <div id="auditLogOutput">Initializing secure audit stream...</div>
            </div>
          </div>
"""

if "Live System Audit Trail" not in content:
    content = content.replace(old_legal_view_inner, old_legal_view_inner + new_legal_view_inner)


# 3. Upgrade Wards Table mapping
old_wards_table = """                  <td style="padding: 12px 8px; font-weight: 500;">${b.ward}</td>
                  <td style="padding: 12px 8px; font-weight: 700; color: #111827;">${b.id}</td>
                  <td style="padding: 12px 8px;">${b.patientId ? `<span style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:700;">${b.patientId}</span>` : '<span style="color:#9ca3af;">—</span>'}</td>
                  <td style="padding: 12px 8px;"><span style="padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; background: ${b.status==='Occupied' ? '#fee2e2' : '#dcfce7'}; color: ${b.status==='Occupied' ? '#991b1b' : '#166534'};">${b.status}</span></td>"""

new_wards_table = """                  <td style="padding: 12px 8px; font-weight: 500;">${b.ward}</td>
                  <td style="padding: 12px 8px; font-weight: 700; color: #111827;">${b.id}</td>
                  <td style="padding: 12px 8px;">${b.patientId ? `<span style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:700;">${b.patientId}</span>` : '<span style="color:#9ca3af;">—</span>'}</td>
                  <td style="padding: 12px 8px;">
                    <span style="padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; background: ${b.status==='Occupied' ? '#fee2e2' : '#dcfce7'}; color: ${b.status==='Occupied' ? '#991b1b' : '#166534'}; display: inline-block; margin-right: 8px;">${b.status}</span>
                    ${b.status==='Occupied' ? `<button onclick="showDischargeModal('${b.id}', '${b.patientId}')" style="padding: 4px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; font-weight: 600; color: #ef4444; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Discharge</button>` : ''}
                  </td>"""

content = content.replace(old_wards_table, new_wards_table)

# 4. Upgrade Labs Table mapping
old_labs_table = """              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6; transition: background 0.2s;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #6b7280;">${l.id}</td>
                  <td style="padding: 12px 8px;"><span style="background:#f3e8ff; color:#7e22ce; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:700;">${l.patientId}</span></td>
                  <td style="padding: 12px 8px; font-weight: 500; color: #111827;">${l.item}</td>
                  <td style="padding: 12px 8px;"><span style="padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${l.priority==='Urgent' ? '#fee2e2' : '#f1f5f9'}; color: ${l.priority==='Urgent' ? '#991b1b' : '#475569'};">${l.priority}</span></td>
                </tr>
              `;"""

new_labs_table = """              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6; transition: background 0.2s;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #6b7280;">${l.id}</td>
                  <td style="padding: 12px 8px;"><span style="background:#f3e8ff; color:#7e22ce; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:700;">${l.patientId}</span></td>
                  <td style="padding: 12px 8px; font-weight: 500; color: #111827;">${l.item}</td>
                  <td style="padding: 12px 8px;">
                    <span style="padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${l.priority==='Urgent' ? '#fee2e2' : '#f1f5f9'}; color: ${l.priority==='Urgent' ? '#991b1b' : '#475569'}; display: inline-block; margin-right: 8px;">${l.priority}</span>
                    <button onclick="showLabResultModal('${l.id}')" style="padding: 4px 12px; background: #8b5cf6; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);">Enter Results</button>
                  </td>
                </tr>
              `;"""

content = content.replace(old_labs_table, new_labs_table)


# 5. Upgrade Billing Table mapping
old_billing_table = """              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #6b7280;">${b.id}</td>
                  <td style="padding: 12px 8px; font-weight: 600;">${b.patientId}</td>
                  <td style="padding: 12px 8px;">${b.service}</td>
                  <td style="padding: 12px 8px; font-weight: 700; color: #111827;">${b.patientPayable.toLocaleString()}</td>
                  <td style="padding: 12px 8px;"><span style="padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${b.status==='Paid' ? '#dcfce7' : '#fef9c3'}; color: ${b.status==='Paid' ? '#166534' : '#854d0e'};">${b.status}</span></td>
                </tr>
              `;"""

new_billing_table = """              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #6b7280;">${b.id}</td>
                  <td style="padding: 12px 8px; font-weight: 600;">${b.patientId}</td>
                  <td style="padding: 12px 8px;">${b.service}</td>
                  <td style="padding: 12px 8px; font-weight: 700; color: #111827;">${b.patientPayable.toLocaleString()}</td>
                  <td style="padding: 12px 8px; display: flex; align-items: center; gap: 8px;">
                    <span style="padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: ${b.status==='Paid' ? '#dcfce7' : '#fef9c3'}; color: ${b.status==='Paid' ? '#166534' : '#854d0e'}; width: 60px; text-align: center;">${b.status}</span>
                    ${b.status === 'Pending' ? `<button onclick="showPaymentModal('${b.id}', ${b.patientPayable})" style="padding: 4px 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">Receive Pay</button>` : ''}
                  </td>
                </tr>
              `;"""

content = content.replace(old_billing_table, new_billing_table)


# 6. Inject JS Logic for Modals & APIs
js_functions = """
    // ── SLEEK WORKFLOW FUNCTIONS ────────────────────────────
    
    // Wards
    window.showDischargeModal = function(bedId, patientId) {
      document.getElementById('dischargeBedId').value = bedId;
      document.getElementById('dischargePatientId').value = patientId;
      document.getElementById('dischargeModal').style.display = 'flex';
    };
    window.confirmDischarge = async function() {
      const patientId = document.getElementById('dischargePatientId').value;
      try {
        await fetch(`${API_URL}/emr/beds/discharge`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId })
        });
        document.getElementById('dischargeModal').style.display = 'none';
        showToast("Patient Discharged Successfully!");
        if(typeof fetchLiveWards === 'function') fetchLiveWards();
      } catch (e) { alert("Discharge Failed"); }
    };

    // Labs
    window.showLabResultModal = function(orderId) {
      document.getElementById('labOrderId').value = orderId;
      document.getElementById('labResultText').value = '';
      document.getElementById('labResultModal').style.display = 'flex';
    };
    window.confirmLabComplete = async function() {
      const orderId = document.getElementById('labOrderId').value;
      const result = document.getElementById('labResultText').value;
      try {
        await fetch(`${API_URL}/orders/status`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: orderId, status: "Completed", result })
        });
        document.getElementById('labResultModal').style.display = 'none';
        showToast("Lab Results Saved & Completed!");
        if(typeof fetchLiveLabs === 'function') fetchLiveLabs();
      } catch (e) { alert("Failed to save results"); }
    };

    // Billing
    window.showPaymentModal = function(billId, amount) {
      document.getElementById('paymentBillId').value = billId;
      document.getElementById('paymentAmountDisplay').innerText = amount.toLocaleString();
      document.getElementById('paymentModal').style.display = 'flex';
    };
    window.confirmPayment = async function() {
      const billId = document.getElementById('paymentBillId').value;
      try {
        await fetch(`${API_URL}/billing/status`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: billId, status: "Paid" })
        });
        document.getElementById('paymentModal').style.display = 'none';
        showToast("Payment Processed Successfully!");
        if(typeof fetchLiveBilling === 'function') fetchLiveBilling();
      } catch (e) { alert("Payment Failed"); }
    };

    // Legal Audit Streaming
    window.fetchAuditLogs = async function() {
      const output = document.getElementById('auditLogOutput');
      output.innerHTML = 'Connecting to secure stream...<br>';
      try {
        const res = await fetch(`${API_URL}/audit`);
        const data = await res.json();
        if (data.logs && data.logs.length > 0) {
          let html = '';
          data.logs.forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const color = log.method === 'DELETE' ? '#ef4444' : log.method === 'POST' ? '#10b981' : '#f59e0b';
            html += `<div style="margin-bottom: 8px;">
              <span style="color: #64748b;">[${time}]</span> 
              <span style="color: ${color}; font-weight: bold;">${log.method}</span> 
              <span style="color: #e2e8f0;">${log.url}</span> 
              <span style="color: #64748b;">by</span> <span style="color: #38bdf8;">${log.user}</span>
            </div>`;
          });
          output.innerHTML = html;
        } else {
          output.innerHTML = 'No recent audit events.';
        }
      } catch(e) {
        output.innerHTML = '<span style="color: #ef4444;">Error fetching audit stream.</span>';
      }
    };
"""

if "SLEEK WORKFLOW FUNCTIONS" not in content:
    content = content.replace("function showToast(msg)", js_functions + "\n    function showToast(msg)")

# Hook up fetchAuditLogs when switching to Legal Matrix
if "if (viewId === 'billingView') fetchLiveBilling();" in content:
    content = content.replace("if (viewId === 'billingView') fetchLiveBilling();", "if (viewId === 'billingView') fetchLiveBilling();\n      if (viewId === 'legalView') fetchAuditLogs();")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Upgraded admin.html with sleek workflows")
