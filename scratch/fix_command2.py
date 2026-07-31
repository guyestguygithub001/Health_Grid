import os
import re

filepath = r'C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr\public\command.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add EHR buttons to sidebar
# Find <button ... Records Unit ... </button> and add the new buttons after it, before </nav>
sidebar_pattern = r"(<button class=\"nav-btn\" data-roles=\"admin nurse\" onclick=\"switchEhrView\('recordsMainView'\)\" title=\"Records Unit\">\s*<span>📂</span><span class=\"nav-text\">Records Unit</span>\s*</button>)"

new_buttons = r"""\1
        <div class="nav-section-title">HOSPITAL OVERSIGHT (EHR)</div>
        <button class="nav-btn" data-roles="admin physician nurse" onclick="switchEhrView('wardsView')" title="Inpatient Wards">
          <span class="nav-icon">🛏️</span><span class="nav-text">Inpatient Wards</span>
        </button>
        <button class="nav-btn" data-roles="admin physician nurse" onclick="switchEhrView('labsView')" title="Lab & Diagnostics">
          <span class="nav-icon">🧪</span><span class="nav-text">Lab & Diagnostics</span>
        </button>
        <button class="nav-btn" data-roles="admin" onclick="switchEhrView('billingView')" title="Billing & Claims">
          <span class="nav-icon">💳</span><span class="nav-text">Billing & Claims</span>
        </button>"""

if re.search(sidebar_pattern, content):
    content = re.sub(sidebar_pattern, new_buttons, content)
else:
    print('Could not find sidebar injection point!')

# 2. Add JS Functions
# Find function startEHRApp
js_pattern = r"(function startEHRApp\(\) \{)"

js_injection = r"""
    // ── EHR: Inpatient Wards (GET /api/beds)
    async function fetchLiveWards() {
      try {
        const res = await fetch(`${API_URL}/beds`);
        if (res.ok) {
          const beds = await res.json();
          const tbody = document.getElementById('liveWardsTableBody');
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
        const res = await fetch(`${API_URL}/labresults`);
        if (res.ok) {
          const labs = await res.json();
          const tbody = document.getElementById('liveLabsTableBody');
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
    switchEhrView = function(viewId, isPopState = false) {
      tertiarySwitch(viewId, isPopState);
      if (viewId === 'wardsView') fetchLiveWards();
      if (viewId === 'labsView') fetchLiveLabs();
      if (viewId === 'billingView') fetchLiveBilling();
    };

\1"""

if re.search(js_pattern, content):
    content = re.sub(js_pattern, js_injection, content)
else:
    print('Could not find JS injection point!')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
