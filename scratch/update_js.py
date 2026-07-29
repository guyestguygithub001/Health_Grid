with open('public/admin.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def replace_func(lines, name, new_impl):
    start = -1
    for i, line in enumerate(lines):
        if f'async function {name}' in line or f'function {name}' in line:
            start = i
            break
    if start == -1: return
    end = -1
    braces = 0
    for i in range(start, len(lines)):
        braces += lines[i].count('{') - lines[i].count('}')
        if braces == 0 and i > start:
            end = i
            break
    
    if start != -1 and end != -1:
        del lines[start:end+1]
        lines.insert(start, new_impl + '\n')

new_audit = """
    async function fetchAuditLogs() {
      try {
        const res = await fetch(`${API_URL}/audit`);
        if (res.ok) {
          const logs = await res.json();
          const list = document.getElementById('legalAuditList');
          if (!list) return;
          list.innerHTML = logs.slice(0, 5).map(log => `
            <div style="padding: 16px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-weight: 600; color: #1e293b;">${log.action}</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">User: ${log.user} | IP: ${log.ip}</div>
              </div>
              <div style="font-size: 12px; color: #94a3b8;">${new Date(log.timestamp).toLocaleTimeString()}</div>
            </div>
          `).join('');
        }
      } catch (e) {
        console.error("Audit load failed:", e);
      }
    }
"""

new_wards = """
    async function fetchLiveWards() {
      try {
        const resOrders = await fetch(`${API_URL}/orders`);
        const res = await fetch(`${API_URL}/beds`);
        
        if (res.ok && resOrders.ok) {
          const beds = await res.json();
          const admissions = await resOrders.json();
          
          if (!document.getElementById('wardStatTotal')) return;
          
          const total = beds.length;
          const occupied = beds.filter(b => b.status === 'Occupied').length;
          const available = total - occupied;
          
          document.getElementById('wardStatTotal').innerText = total || '-';
          document.getElementById('wardStatOccupied').innerText = occupied || '0';
          document.getElementById('wardStatAvailable').innerText = available || '0';
          
          const grid = document.getElementById('liveWardsGrid');
          grid.innerHTML = beds.map(bed => {
            const isOccupied = bed.status === 'Occupied';
            return `
              <div style="background: ${isOccupied ? '#fef2f2' : '#ecfdf5'}; border: 1px solid ${isOccupied ? '#fca5a5' : '#6ee7b7'}; border-radius: 16px; padding: 20px; text-align: center;">
                <div style="font-size: 24px; font-weight: 800; color: ${isOccupied ? '#991b1b' : '#065f46'};">${bed.bedId}</div>
                <div style="font-size: 14px; color: ${isOccupied ? '#b91c1c' : '#059669'}; margin-top: 4px; font-weight: 600;">${bed.status}</div>
                ${!isOccupied ? `<button style="margin-top: 16px; width: 100%; padding: 8px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="alert('Open admission flow for ${bed.bedId}')">Admit</button>` : `<div style="margin-top: 16px; font-size: 12px; color: #7f1d1d; opacity: 0.8;">Patient ID: ${bed.patientId}</div>`}
              </div>
            `;
          }).join('');
        }
      } catch (e) {
        console.error("Wards load failed:", e);
      }
    }
"""

new_labs = """
    async function fetchLiveLabs() {
      try {
        const res = await fetch(`${API_URL}/orders`);
        if (res.ok) {
          const orders = await res.json();
          const labOrders = orders.filter(o => o.type === 'Lab');
          
          const pending = labOrders.filter(o => o.status === 'Pending');
          const completed = labOrders.filter(o => o.status === 'Completed').slice(0, 5); // Last 5
          
          if (!document.getElementById('labsPendingList')) return;
          
          const pendingList = document.getElementById('labsPendingList');
          if (pending.length === 0) {
            pendingList.innerHTML = '<div style="color:#94a3b8; text-align:center; padding: 20px;">No pending lab requests.</div>';
          } else {
            pendingList.innerHTML = pending.map(o => `
              <div style="padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 18px;">${o.details.testName || 'Lab Test'}</div>
                    <div style="color: #64748b; font-size: 14px; margin-top: 4px;">PT ID: ${o.patientId}</div>
                  </div>
                </div>
                <button style="width: 100%; padding: 12px; background: #eff6ff; color: #2563eb; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;" onclick="alert('Processing ${o.id}')">Process Sample</button>
              </div>
            `).join('');
          }
          
          const resultsList = document.getElementById('labsResultsList');
          if (completed.length === 0) {
            resultsList.innerHTML = '<div style="color:#94a3b8; text-align:center; padding: 20px;">No recent results.</div>';
          } else {
            resultsList.innerHTML = completed.map(o => `
              <div style="padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px;">
                <div style="font-weight: 700; color: #0f172a; font-size: 18px;">${o.details.testName || 'Lab Test'}</div>
                <div style="color: #64748b; font-size: 14px; margin-top: 4px;">PT ID: ${o.patientId}</div>
                <div style="margin-top: 16px; display: inline-block; background: #ecfdf5; color: #059669; padding: 6px 16px; border-radius: 8px; font-weight: 700;">Result: ${o.details.result || 'READY'}</div>
              </div>
            `).join('');
          }
        }
      } catch (e) {
        console.error("Labs load failed:", e);
      }
    }
"""

new_billing = """
    async function fetchLiveBilling() {
      try {
        const res = await fetch(`${API_URL}/billing`);
        if (res.ok) {
          const invoices = await res.json();
          if (!document.getElementById('billingTotalRev')) return;
          
          const unpaid = invoices.filter(inv => inv.status === 'Unpaid');
          const totalRev = unpaid.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
          
          document.getElementById('billingTotalRev').innerText = '₦' + totalRev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
          
          const list = document.getElementById('billingInvoiceList');
          if (unpaid.length === 0) {
            list.innerHTML = '<div style="color:#94a3b8; text-align:center; padding: 20px;">All invoices are settled!</div>';
          } else {
            list.innerHTML = unpaid.map(inv => `
              <div style="padding: 16px 20px; background: #f8fafc; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; color: #0f172a;">${inv.description}</div>
                  <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Patient ID: ${inv.patientId}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <div style="font-weight: 800; color: #0f172a; font-size: 18px;">₦${Number(inv.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="alert('Settling invoice ${inv.id}')">Settle Bill</button>
                </div>
              </div>
            `).join('');
          }
        }
      } catch (e) {
        console.error("Billing load failed:", e);
      }
    }
"""

replace_func(lines, 'fetchAuditLogs', new_audit)
replace_func(lines, 'fetchLiveWards', new_wards)
replace_func(lines, 'fetchLiveLabs', new_labs)
replace_func(lines, 'fetchLiveBilling', new_billing)

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated JS functions successfully.")
