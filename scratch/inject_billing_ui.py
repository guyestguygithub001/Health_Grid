import re

html_to_inject = """
      <!-- VIEW 9: Billing Shell -->
      <div id="billingView" class="emr-view hidden" style="height: 100%; padding: 24px; display: flex; flex-direction: column; background: #f8fafc;">
        <!-- Legacy Header Bar -->
        <div style="background: #10b981; color: white; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px 4px 0 0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px; background: white; color: #10b981; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold;">₦</span>
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; text-transform: uppercase;">Central Billing & Accounts</h3>
          </div>
          <div>
            <button style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 6px 16px; border-radius: 4px; font-size: 12px; cursor: pointer;">Generate Invoice</button>
          </div>
        </div>

        <div style="padding: 24px; background: white; border: 1px solid #e2e8f0; border-top: none; flex: 1; overflow-y: auto;">
          <!-- KPI Cards -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #3b82f6; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 12px; font-weight: 600;">Total Billed</div>
              <div id="bill-kpi-total" style="font-size: 24px; font-weight: bold; margin-top: 8px;">₦0</div>
            </div>
            <div style="background: #10b981; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 12px; font-weight: 600;">Total Collected (Patient)</div>
              <div id="bill-kpi-collected" style="font-size: 24px; font-weight: bold; margin-top: 8px;">₦0</div>
            </div>
            <div style="background: #f59e0b; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 12px; font-weight: 600;">NHIS Claims Pending</div>
              <div id="bill-kpi-claims" style="font-size: 24px; font-weight: bold; margin-top: 8px;">₦0</div>
            </div>
            <div style="background: #ef4444; color: white; padding: 16px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 12px; font-weight: 600;">Outstanding Balance</div>
              <div id="bill-kpi-outstanding" style="font-size: 24px; font-weight: bold; margin-top: 8px;">₦0</div>
            </div>
          </div>

          <!-- Filter Bar -->
          <div style="display: flex; gap: 24px; align-items: flex-end; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
            <div>
              <label style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Status *</label><br/>
              <select id="billStatusFilter" style="border: none; border-bottom: 1px solid #cbd5e1; padding: 4px 0; font-size: 14px; color: #333; outline: none; background: transparent;" onchange="loadBilling()">
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Waived">Waived</option>
              </select>
            </div>
            <div>
              <button style="background: #facc15; color: #854d0e; font-weight: 700; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;" onclick="loadBilling()">
                <span>🔄</span> Refresh
              </button>
            </div>
          </div>

          <!-- Data Table -->
          <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 4px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
              <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <tr>
                  <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Invoice ID</th>
                  <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Date</th>
                  <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Patient ID</th>
                  <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Service / Description</th>
                  <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Total Amount</th>
                  <th style="padding: 12px 16px; color: #475569; font-weight: 600;">NHIS Claim</th>
                  <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Patient Payable</th>
                  <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Status</th>
                  <th style="padding: 12px 16px; color: #475569; font-weight: 600;">Action</th>
                </tr>
              </thead>
              <tbody id="billingTableBody">
                <tr><td colspan="9" style="text-align:center; padding:40px; color:#94a3b8;"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1' width='64' height='64'%3E%3Cpath d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E" alt="No data"/><br/>Loading Invoices...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
"""

js_to_inject = """
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
        console.error("Billing sync error", e);
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
"""

def inject_billing(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the block to replace
    start = content.find('<!-- VIEW 9: Billing Shell -->')
    if start == -1: return False
    
    end = content.find('</div>', start)
    end = content.find('</div>', end + 1)
    end = content.find('</div>', end + 1) # close tag
    end = end + 6
    
    if "billingView" not in content[start:end]: return False
    
    # Replace emr-view with ehr-view if it's admin.html
    html_inj = html_to_inject
    if 'admin.html' in filepath:
        html_inj = html_inj.replace('class="emr-view hidden"', 'class="ehr-view hidden"')
        
    content = content[:start] + html_inj.strip() + content[end:]
    
    # Inject JS
    if 'async function loadBilling()' not in content:
        content = content.replace('// --- REFERRALS POLLING LOGIC ---', js_to_inject.strip() + '\\n\\n    // --- REFERRALS POLLING LOGIC ---')
        
        # In switchEmrView or switchEhrView, trigger loadBilling
        # EMR:
        if 'admin.html' not in filepath:
            content = content.replace("history.pushState({ viewId }, \"\", \"#\" + viewId);", "history.pushState({ viewId }, \"\", \"#\" + viewId);\n      if(viewId === 'billingView') { loadBilling(); if(!billingInterval) billingInterval = setInterval(loadBilling, 5000); } else { clearInterval(billingInterval); billingInterval = null; }")
        else:
            # admin.html
            content = content.replace("history.pushState({ viewId }, \"\", \"#\" + viewId);", "history.pushState({ viewId }, \"\", \"#\" + viewId);\n      if(viewId === 'billingView') { loadBilling(); if(!billingInterval) billingInterval = setInterval(loadBilling, 5000); } else { clearInterval(billingInterval); billingInterval = null; }")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

success_emr = inject_billing('public/emr.html')
success_admin = inject_billing('public/admin.html')
print(f"EMR: {success_emr}, ADMIN: {success_admin}")
