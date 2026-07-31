import os
import re

filepath = r'C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr\public\command.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

js_pattern = r'(    function switchEhrView\(viewId, isPopState = false\) \{)'

js_injection = r"""
    // ── EHR: Inpatient Wards (GET /api/beds)
    async function fetchLiveWards() {
      try {
        const res = await fetch(`/api/beds`);
        if (res.ok) {
          const beds = await res.json();
          const tbody = document.getElementById('liveWardsTableBody');
          if (!tbody) return;
          tbody.innerHTML = '';
          if (beds.length === 0) tbody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">No beds registered in system.</td></tr>';
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

    // ── EHR: Labs & Diagnostics (GET /api/labresults)
    async function fetchLiveLabs() {
      try {
        const res = await fetch(`/api/labresults`);
        if (res.ok) {
          const labs = await res.json();
          const tbody = document.getElementById('liveLabsTableBody');
          if (!tbody) return;
          tbody.innerHTML = '';
          if (labs.length === 0) tbody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">No lab results found.</td></tr>';
          else {
            labs.slice(0, 15).forEach(l => {
              tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 12px 8px; font-family: monospace; color: #8b5cf6; font-weight:bold;">${l.id}</td>
                  <td style="padding: 12px 8px; font-family: monospace;">${l.patientId}</td>
                  <td style="padding: 12px 8px;">${l.date}</td>
                  <td style="padding: 12px 8px;">
                    <span style="background: ${l.criticalFlag ? '#fee2e2' : '#f3f4f6'}; color: ${l.criticalFlag ? '#b91c1c' : '#6b7280'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${l.criticalFlag ? '🚨 CRITICAL' : 'Routine'}
                    </span>
                  </td>
                </tr>
              `;
            });
          }
        }
      } catch (err) {}
    }

    // ── EHR: Billing (GET /api/billing)
    async function fetchLiveBilling() {
      try {
        const res = await fetch(`/api/billing`);
        if (res.ok) {
          const bills = await res.json();
          const tbody = document.getElementById('liveBillingTableBody');
          if (!tbody) return;
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

\1"""

if re.search(js_pattern, content):
    content = re.sub(js_pattern, js_injection, content)
    
    # We already have some intercept logic in the code as seen from grep. Let's make sure it handles these view ids.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Success adding JS')
else:
    print('Could not find JS injection point!')
