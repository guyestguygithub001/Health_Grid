import re

html_to_inject = """
          <div id="recContent-referrals" class="rec-tab-content hidden" style="animation: fadeIn 0.3s ease-out; background: white; padding: 0;">
            <!-- Legacy Header Bar -->
            <div style="background: #8b5cf6; color: white; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px; background: white; color: #8b5cf6; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold;">S</span>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; text-transform: uppercase;">Records Unit | Referrals Ledger</h3>
              </div>
              <div>
                <button style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 6px 16px; border-radius: 4px; font-size: 12px; cursor: pointer;">Search for Patient</button>
              </div>
            </div>

            <!-- KPI Cards (6 Boxes) -->
            <div style="padding: 24px;">
              <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: #000080; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="font-size: 12px; font-weight: 600;">Overall Total</div>
                  <div id="ref-kpi-total" style="font-size: 24px; font-weight: bold; margin-top: 8px;">0</div>
                </div>
                <div style="background: #008000; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="font-size: 12px; font-weight: 600;">Total Accepted</div>
                  <div id="ref-kpi-accepted" style="font-size: 24px; font-weight: bold; margin-top: 8px;">0</div>
                </div>
                <div style="background: #cc0000; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="font-size: 12px; font-weight: 600;">Total Pending</div>
                  <div id="ref-kpi-pending" style="font-size: 24px; font-weight: bold; margin-top: 8px;">0</div>
                </div>
                <div style="background: #3b82f6; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="font-size: 12px; font-weight: 600;">Inbound to Us</div>
                  <div id="ref-kpi-inbound" style="font-size: 24px; font-weight: bold; margin-top: 8px;">0</div>
                </div>
                <div style="background: #b45309; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="font-size: 12px; font-weight: 600;">Outbound from Us</div>
                  <div id="ref-kpi-outbound" style="font-size: 24px; font-weight: bold; margin-top: 8px;">0</div>
                </div>
                <div style="background: #0f766e; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="font-size: 12px; font-weight: 600;">Completed</div>
                  <div id="ref-kpi-completed" style="font-size: 24px; font-weight: bold; margin-top: 8px;">0</div>
                </div>
              </div>

              <!-- Filter Bar -->
              <div style="display: flex; gap: 24px; align-items: flex-end; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
                <div>
                  <label style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">From *</label><br/>
                  <input type="date" style="border: none; border-bottom: 1px solid #cbd5e1; padding: 4px 0; font-size: 14px; color: #333; outline: none; background: transparent;" />
                </div>
                <div>
                  <label style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">To *</label><br/>
                  <input type="date" style="border: none; border-bottom: 1px solid #cbd5e1; padding: 4px 0; font-size: 14px; color: #333; outline: none; background: transparent;" />
                </div>
                <div>
                  <button style="background: #facc15; color: #854d0e; font-weight: 700; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;" onclick="loadReferrals()">
                    <span>🔄</span> Refresh
                  </button>
                </div>
              </div>

              <!-- Data Table -->
              <div style="overflow-x: auto; background: white; border: 1px solid #e2e8f0; border-radius: 4px;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
                  <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <tr>
                      <th style="padding: 12px 16px; color: #475569; font-weight: 600;">S/N</th>
                      <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Patient Name</th>
                      <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Hospital Number</th>
                      <th style="padding: 12px 16px; color: #475569; font-weight: 600;">From Unit</th>
                      <th style="padding: 12px 16px; color: #475569; font-weight: 600;">To Unit</th>
                      <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Diagnosis</th>
                      <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Date & Time</th>
                      <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Status</th>
                      <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Action</th>
                    </tr>
                  </thead>
                  <tbody id="referralsTableBody">
                    <tr><td colspan="9" style="text-align:center; padding:40px; color:#94a3b8;"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1' width='64' height='64'%3E%3Cpath d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E" alt="No data"/><br/>No Records Found!</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
"""

js_to_inject = """
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
"""

def inject_ui(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the block to replace
    start = content.find('<div id="recContent-referrals"')
    if start == -1: return False
    
    end = content.find('</div>', start)
    end = content.find('</div>', end + 1)
    end = content.find('</div>', end + 1) # close tag
    end = end + 6
    
    content = content[:start] + html_to_inject.strip() + content[end:]
    
    # Inject JS
    if 'async function loadReferrals()' not in content:
        content = content.replace('function switchRecordsTab(tabName) {', js_to_inject.strip() + '\\n\\n    function switchRecordsTab(tabName) {')
        # Inject polling start into switchRecordsTab
        polling_logic = "if(tabName === 'referrals') { loadReferrals(); if(!referralsInterval) referralsInterval = setInterval(loadReferrals, 5000); } else { clearInterval(referralsInterval); referralsInterval = null; }"
        content = content.replace('if(tabName === \'patients\') {', polling_logic + '\\n      if(tabName === \'patients\') {')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

success_emr = inject_ui('public/emr.html')
success_admin = inject_ui('public/admin.html')
print(f"EMR: {success_emr}, ADMIN: {success_admin}")
