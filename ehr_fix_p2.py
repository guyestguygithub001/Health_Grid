#!/usr/bin/env python3
"""
Phase 2 Final: Fix audit trail, remove superAdminNavBtn JS ref, overhaul billing to be fully live.
"""

FILE = 'public/command.html'
with open(FILE, 'r', encoding='utf-8') as f:
    html = f.read()

# ─────────────────────────────────────────────────
# FIX 1: Remove superAdminNavBtn JS reference (safe - button already removed from HTML)
# ─────────────────────────────────────────────────
html = html.replace(
    "const btn = document.getElementById('superAdminNavBtn');\n              if(btn) btn.style.display = 'flex';\n              renderPermissionMatrix();",
    "renderPermissionMatrix();"
)

# ─────────────────────────────────────────────────
# FIX 2: Inject Audit Trail tab before CPOE Ledger
# ─────────────────────────────────────────────────
AUDIT_TAB_HTML = '''          <!-- Audit Trail Tab -->
          <div id="mruContent-audit" class="mru-tab-content glass-card" style="display: none; min-height: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: white;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <div>
                <h3 style="margin:0;font-size:18px;font-weight:700;color:#1f2937;">&#x1F50D; System Audit Trail</h3>
                <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Complete chronological log of all system actions and user events.</p>
              </div>
              <button onclick="fetchAuditLogs()" style="padding:8px 16px;background:#e2e8f0;color:#374151;border:none;border-radius:8px;font-weight:600;cursor:pointer;">&#x21BB; Refresh</button>
            </div>
            <div style="overflow-x:auto;background:white;border:1px solid #e2e8f0;border-radius:8px;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead style="background:#f8fafc;">
                  <tr>
                    <th style="padding:12px 16px;color:#475569;font-weight:700;text-align:left;border-bottom:1px solid #e2e8f0;">Timestamp</th>
                    <th style="padding:12px 16px;color:#475569;font-weight:700;text-align:left;border-bottom:1px solid #e2e8f0;">Action</th>
                    <th style="padding:12px 16px;color:#475569;font-weight:700;text-align:left;border-bottom:1px solid #e2e8f0;">User</th>
                    <th style="padding:12px 16px;color:#475569;font-weight:700;text-align:left;border-bottom:1px solid #e2e8f0;">IP Address</th>
                  </tr>
                </thead>
                <tbody id="auditTrailTableBody">
                  <tr><td colspan="4" style="padding:40px;text-align:center;color:#94a3b8;">Click Refresh to load audit logs...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

'''

# Find the CPOE ledger div and inject audit trail before it
cpoe_target = '          <!-- CPOE Ledger -->'
if cpoe_target in html:
    html = html.replace(cpoe_target, AUDIT_TAB_HTML + cpoe_target, 1)
    print('Audit trail tab injected successfully.')
else:
    # Try alternate comment text
    alt_target = 'id="mruContent-cpoe"'
    idx = html.find(alt_target)
    if idx > -1:
        # Find the comment before it
        comment_start = html.rfind('<!--', 0, idx)
        html = html[:comment_start] + AUDIT_TAB_HTML + html[comment_start:]
        print('Audit trail tab injected (alt method).')
    else:
        print('WARNING: Could not find CPOE section to inject audit trail')

# ─────────────────────────────────────────────────
# FIX 3: OVERHAUL BILLING - Make metrics live, replace hardcoded table rows
# ─────────────────────────────────────────────────

# Replace the hardcoded metrics cards
OLD_BILLING_METRICS = '''        <!-- Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-bottom: 32px;">
          <div class="glass-card" style="border-top: 4px solid #10b981;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600;">Today's Revenue</h3>
            <p style="font-size: 32px; font-weight: 800; color: #111827; margin: 8px 0;">&#x20A6;36,563</p>
            <p style="font-size: 13px; color: #10b981; font-weight: 500;">14 payments today</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #ef4444;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600;">Outstanding</h3>
            <p style="font-size: 32px; font-weight: 800; color: #111827; margin: 8px 0;">&#x20A6;0</p>
            <p style="font-size: 13px; color: #ef4444; font-weight: 500;">Unpaid invoices</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #f59e0b;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600;">Pending Claims</h3>
            <p style="font-size: 32px; font-weight: 800; color: #111827; margin: 8px 0;">0</p>
            <p style="font-size: 13px; color: #f59e0b; font-weight: 500;">NHIA / PLASCHEMA</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #3b82f6;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600;">Monthly Revenue</h3>
            <p style="font-size: 32px; font-weight: 800; color: #111827; margin: 8px 0;">&#x20A6;0</p>
            <p style="font-size: 13px; color: #3b82f6; font-weight: 500;">This month</p>
          </div>
        </div>'''

NEW_BILLING_METRICS = '''        <!-- Metrics Grid — LIVE -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 28px;">
          <div class="glass-card" style="border-top: 4px solid #10b981; padding: 20px;">
            <h3 style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform:uppercase; margin:0 0 8px;">Total Revenue</h3>
            <p id="bill-stat-revenue" style="font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 4px; font-family:monospace;">&#x20A6;-</p>
            <p id="bill-stat-paid-count" style="font-size: 12px; color: #10b981; font-weight: 600; margin:0;">Loading...</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #ef4444; padding: 20px;">
            <h3 style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform:uppercase; margin:0 0 8px;">Outstanding</h3>
            <p id="bill-stat-outstanding" style="font-size: 28px; font-weight: 800; color: #ef4444; margin: 0 0 4px; font-family:monospace;">&#x20A6;-</p>
            <p id="bill-stat-unpaid-count" style="font-size: 12px; color: #ef4444; font-weight: 600; margin:0;">Loading...</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #f59e0b; padding: 20px;">
            <h3 style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform:uppercase; margin:0 0 8px;">Pending Claims</h3>
            <p id="bill-stat-claims" style="font-size: 28px; font-weight: 800; color: #f59e0b; margin: 0 0 4px; font-family:monospace;">0</p>
            <p style="font-size: 12px; color: #f59e0b; font-weight: 600; margin:0;">NHIA / PLASCHEMA</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #3b82f6; padding: 20px;">
            <h3 style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform:uppercase; margin:0 0 8px;">Total Invoices</h3>
            <p id="bill-stat-total" style="font-size: 28px; font-weight: 800; color: #3b82f6; margin: 0 0 4px; font-family:monospace;">0</p>
            <p style="font-size: 12px; color: #3b82f6; font-weight: 600; margin:0;">All time</p>
          </div>
        </div>'''

if OLD_BILLING_METRICS in html:
    html = html.replace(OLD_BILLING_METRICS, NEW_BILLING_METRICS, 1)
    print('Billing metrics replaced.')
else:
    print('WARNING: Could not find old billing metrics - trying partial match')
    # Try to find by unique substring
    if 'Today\'s Revenue' in html:
        print('Found Today Revenue reference - metrics may already be partially updated')

# Replace hardcoded table body rows with live tbody
OLD_BILLING_TBODY = '''                <tbody id="liveBillingTableBody">
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 8px; font-family: monospace; color: #10b981; font-weight:bold;">INV-1001</td>
                    <td style="padding: 12px 8px; font-weight: 500;">Musa Ibrahim</td>
                    <td style="padding: 12px 8px;">Outpatient</td>
                    <td style="padding: 12px 8px;">&#x20A6;1,000</td>
                    <td style="padding: 12px 8px; color: #6b7280;">PLASCHEMA (70%)</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: #ef4444;">&#x20A6;300</td>
                    <td style="padding: 12px 8px;"><span style="background: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Unpaid</span></td>
                    <td style="padding: 12px 8px;"><button onclick="openRealInvoice('INV-1001')" style="padding: 4px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">Receive</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 8px; font-family: monospace; color: #10b981; font-weight:bold;">INV-1002</td>
                    <td style="padding: 12px 8px; font-weight: 500;">Ngozi Okafor</td>
                    <td style="padding: 12px 8px;">Laboratory</td>
                    <td style="padding: 12px 8px;">&#x20A6;2,000</td>
                    <td style="padding: 12px 8px; color: #6b7280;">NHIA (60%)</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: #10b981;">&#x20A6;800</td>
                    <td style="padding: 12px 8px;"><span style="background: #dcfce3; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Paid</span></td>
                    <td style="padding: 12px 8px;"><button onclick="openRealInvoice('INV-1002')" style="padding: 4px 10px; background: #e5e7eb; color: #374151; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">Receipt</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 8px; font-family: monospace; color: #10b981; font-weight:bold;">INV-1003</td>
                    <td style="padding: 12px 8px; font-weight: 500;">Tunde Bakare</td>
                    <td style="padding: 12px 8px;">Wards (5 days)</td>
                    <td style="padding: 12px 8px;">&#x20A6;25,000</td>
                    <td style="padding: 12px 8px; color: #6b7280;">BHCPF (90%)</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: #f59e0b;">&#x20A6;2,500</td>
                    <td style="padding: 12px 8px;"><span style="background: #fef3c7; color: #b45309; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Claimed</span></td>
                    <td style="padding: 12px 8px;"><button onclick="openRealInvoice('INV-1003')" style="padding: 4px 10px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">Claim</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 8px; font-family: monospace; color: #10b981; font-weight:bold;">INV-1004</td>
                    <td style="padding: 12px 8px; font-weight: 500;">Aisha Sule</td>
                    <td style="padding: 12px 8px;">Emergency</td>
                    <td style="padding: 12px 8px;">&#x20A6;3,000</td>
                    <td style="padding: 12px 8px; color: #6b7280;">Self-Pay</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: #ef4444;">&#x20A6;3,000</td>
                    <td style="padding: 12px 8px;"><span style="background: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Unpaid</span></td>
                    <td style="padding: 12px 8px;"><button onclick="openRealInvoice('INV-1004')" style="padding: 4px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">Receive</button></td>
                  </tr>
                </tbody>'''

NEW_BILLING_TBODY = '''                <tbody id="liveBillingTableBody">
                  <tr><td colspan="8" style="padding:40px;text-align:center;color:#94a3b8;font-style:italic;">Loading billing records...</td></tr>
                </tbody>'''

if OLD_BILLING_TBODY in html:
    html = html.replace(OLD_BILLING_TBODY, NEW_BILLING_TBODY, 1)
    print('Billing table body replaced with live stub.')
else:
    print('WARNING: Could not replace billing tbody - checking for shorter match')
    # Try to find the tbody by ID and extract its full content
    start = html.find('<tbody id="liveBillingTableBody">')
    if start > -1:
        end = html.find('</tbody>', start) + len('</tbody>')
        old_section = html[start:end]
        new_section = '<tbody id="liveBillingTableBody">\n                  <tr><td colspan="8" style="padding:40px;text-align:center;color:#94a3b8;font-style:italic;">Loading billing records...</td></tr>\n                </tbody>'
        html = html[:start] + new_section + html[end:]
        print('Billing table body replaced (alt method).')

# ─────────────────────────────────────────────────
# FIX 4: Add billing status filter live wiring + enhanced filter
# ─────────────────────────────────────────────────
OLD_BILLING_STATUS_SEL = '''              <select style="padding: 6px 12px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px; background: white;">
                <option>All Status</option>
                <option>Unpaid</option>
                <option>Paid</option>
                <option>Claimed</option>
              </select>'''

NEW_BILLING_STATUS_SEL = '''              <select id="billingStatusFilter" onchange="fetchLiveBilling()" style="padding: 7px 12px; border-radius: 8px; border: 1.5px solid #d1d5db; font-size: 13px; background: white; font-weight: 600;">
                <option value="">All Status</option>
                <option value="Pending">Unpaid / Pending</option>
                <option value="Paid">Paid</option>
                <option value="Claimed">Claimed (Insurance)</option>
                <option value="Waived">Waived</option>
              </select>'''

if OLD_BILLING_STATUS_SEL in html:
    html = html.replace(OLD_BILLING_STATUS_SEL, NEW_BILLING_STATUS_SEL, 1)
    print('Billing status filter wired to live fetch.')

# ─────────────────────────────────────────────────
# FIX 5: Inject the live fetchLiveBilling + billing JS engine BEFORE </script> close
# ─────────────────────────────────────────────────
BILLING_JS = r"""
  // ═══════════════════════════════════════════════════════════════
  // BILLING WORKFLOW ENGINE — Live invoicing, claims, payments
  // ═══════════════════════════════════════════════════════════════

  async function fetchLiveBilling() {
    const tbody = document.getElementById('liveBillingTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="padding:32px;text-align:center;color:#9ca3af;">&#x1F504; Loading billing records...</td></tr>';
    try {
      const statusFilter = (document.getElementById('billingStatusFilter') || {}).value || '';
      let bills = await (await window.fetch('/api/v2/billing')).json();
      if (statusFilter) bills = bills.filter(b => b.status === statusFilter);

      // Compute live stats
      const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + (b.amount || 0), 0);
      const outstanding = bills.filter(b => b.status === 'Pending' || b.status === 'Unpaid').reduce((s, b) => s + (b.amount || 0), 0);
      const claimsCount = bills.filter(b => b.status === 'Claimed').length;
      const paidCount = bills.filter(b => b.status === 'Paid').length;
      const unpaidCount = bills.filter(b => b.status === 'Pending' || b.status === 'Unpaid').length;

      const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      setStat('bill-stat-revenue', formatNaira(totalRevenue));
      setStat('bill-stat-outstanding', formatNaira(outstanding));
      setStat('bill-stat-claims', claimsCount);
      setStat('bill-stat-total', bills.length);
      setStat('bill-stat-paid-count', paidCount + ' payment' + (paidCount !== 1 ? 's' : '') + ' received');
      setStat('bill-stat-unpaid-count', unpaidCount + ' unpaid invoice' + (unpaidCount !== 1 ? 's' : ''));

      if (!tbody) return;
      if (!bills || bills.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="padding:40px;text-align:center;color:#9ca3af;">No billing records found.</td></tr>';
        return;
      }

      const insuranceMap = { 'PLASCHEMA': 0.7, 'NHIA': 0.6, 'BHCPF': 0.9, 'Self-Pay': 0 };
      const statusStyles = {
        'Paid':    { bg: '#dcfce7', color: '#166534', label: 'Paid' },
        'Pending': { bg: '#fee2e2', color: '#b91c1c', label: 'Unpaid' },
        'Unpaid':  { bg: '#fee2e2', color: '#b91c1c', label: 'Unpaid' },
        'Claimed': { bg: '#fef3c7', color: '#b45309', label: 'Claimed' },
        'Waived':  { bg: '#f3f4f6', color: '#6b7280', label: 'Waived' },
      };

      tbody.innerHTML = bills.map(bill => {
        const amount = bill.amount || 0;
        const ins = bill.insurance || bill.payer || 'Self-Pay';
        const coverage = insuranceMap[ins] || 0;
        const patientOwes = amount * (1 - coverage);
        const s = statusStyles[bill.status] || { bg: '#f3f4f6', color: '#374151', label: bill.status || 'Unknown' };
        const isPending = bill.status === 'Pending' || bill.status === 'Unpaid';
        const isClaimed = bill.status === 'Claimed';
        const isPaid = bill.status === 'Paid';
        return `<tr style="border-bottom:1px solid #f3f4f6;transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
          <td style="padding:12px 16px;font-family:monospace;font-weight:700;color:#4f46e5;font-size:13px;">${bill.id}</td>
          <td style="padding:12px 16px;font-weight:600;color:#111827;">${bill.patientId || bill.patient || '-'}</td>
          <td style="padding:12px 16px;color:#374151;">${bill.service || bill.description || 'Service'}</td>
          <td style="padding:12px 16px;font-family:monospace;font-weight:700;color:#059669;">${formatNaira(amount)}</td>
          <td style="padding:12px 16px;color:#6b7280;font-size:12px;">${ins}${coverage > 0 ? ' (' + Math.round(coverage*100) + '%)' : ''}</td>
          <td style="padding:12px 16px;font-weight:700;color:${patientOwes > 0 ? '#ef4444' : '#10b981'};">${formatNaira(patientOwes)}</td>
          <td style="padding:12px 16px;"><span style="background:${s.bg};color:${s.color};padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;">${s.label}</span></td>
          <td style="padding:12px 16px;display:flex;gap:6px;flex-wrap:wrap;">
            ${isPending ? `<button onclick="receiveBillPayment('${bill.id}',${patientOwes})" style="padding:5px 12px;background:#10b981;color:white;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;">&#x2705; Receive</button>` : ''}
            ${isPending && coverage > 0 ? `<button onclick="submitInsuranceClaim('${bill.id}','${ins}')" style="padding:5px 12px;background:#f59e0b;color:white;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;">&#x1F4CB; Claim</button>` : ''}
            ${isPaid || isClaimed ? `<button onclick="printBillReceipt('${bill.id}')" style="padding:5px 12px;background:#e2e8f0;color:#374151;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">&#x1F9FE; Receipt</button>` : ''}
          </td>
        </tr>`;
      }).join('');
    } catch(e) {
      const tbody2 = document.getElementById('liveBillingTableBody');
      if (tbody2) tbody2.innerHTML = `<tr><td colspan="8" style="padding:40px;text-align:center;color:#ef4444;">&#x26A0;&#xFE0F; Failed to load billing: ${e.message}</td></tr>`;
    }
  }

  function formatNaira(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '&#x20A6;0';
    return '&#x20A6;' + Number(amount).toLocaleString('en-NG', {minimumFractionDigits: 0, maximumFractionDigits: 0});
  }

  async function receiveBillPayment(billId, amount) {
    const confirmed = confirm('Confirm receipt of payment: ' + '&#x20A6;' + Number(amount).toLocaleString() + ' for invoice ' + billId + '?');
    if (!confirmed) return;
    try {
      const res = await window.fetch('/api/v2/billing/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: billId, status: 'Paid' })
      });
      if (!res.ok) throw new Error('Payment update failed');
      showToast('&#x2705; Payment received for ' + billId, 'success');
      fetchLiveBilling();
    } catch(e) { showToast('&#x274C; ' + e.message, 'error'); }
  }

  async function submitInsuranceClaim(billId, insurer) {
    const confirmed = confirm('Submit insurance claim for ' + billId + ' to ' + insurer + '?');
    if (!confirmed) return;
    try {
      const res = await window.fetch('/api/v2/billing/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: billId, status: 'Claimed', insurer })
      });
      if (!res.ok) throw new Error('Claim submission failed');
      showToast('&#x1F4CB; Insurance claim submitted to ' + insurer, 'success');
      fetchLiveBilling();
    } catch(e) { showToast('&#x274C; ' + e.message, 'error'); }
  }

  function printBillReceipt(billId) {
    showToast('&#x1F9FE; Receipt for ' + billId + ' ready to print', 'info');
    // Open a print-ready receipt window
    const w = window.open('', '_blank', 'width=600,height=400');
    if (w) {
      w.document.write('<html><head><title>Receipt ' + billId + '</title></head><body style="font-family:monospace;padding:40px;"><h2>PAYMENT RECEIPT</h2><p><strong>Invoice:</strong> ' + billId + '</p><p><strong>Date:</strong> ' + new Date().toLocaleString() + '</p><p><strong>Hospital:</strong> Plateau State Health Grid</p><hr/><p style="color:#10b981;font-weight:bold;">STATUS: PAID</p><br/><button onclick="window.print()">Print</button></body></html>');
      w.document.close();
    }
  }

  async function fetchAuditLogs() {
    const tbody = document.getElementById('auditTrailTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="padding:32px;text-align:center;color:#9ca3af;">&#x1F504; Loading audit logs...</td></tr>';
    try {
      const res = await window.fetch('/api/v2/audit');
      const data = await res.json();
      const logs = data.log || data.logs || data || [];
      if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="padding:40px;text-align:center;color:#9ca3af;">No audit logs found.</td></tr>';
        return;
      }
      tbody.innerHTML = logs.slice(0, 100).map(log => {
        const ts = log.timestamp ? new Date(log.timestamp).toLocaleString() : '-';
        return `<tr style="border-bottom:1px solid #f3f4f6;transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
          <td style="padding:10px 16px;font-size:12px;color:#6b7280;white-space:nowrap;">${ts}</td>
          <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#111827;">${log.action || log.event || '-'}</td>
          <td style="padding:10px 16px;font-size:13px;color:#374151;">${log.user || log.username || '-'}</td>
          <td style="padding:10px 16px;font-size:12px;color:#6b7280;font-family:monospace;">${log.ip || '-'}</td>
        </tr>`;
      }).join('');
    } catch(e) {
      tbody.innerHTML = `<tr><td colspan="4" style="padding:40px;text-align:center;color:#ef4444;">&#x26A0;&#xFE0F; Failed to load audit logs: ${e.message}</td></tr>`;
    }
  }
"""

# Inject before the very last </script> in the file
last_script = html.rfind('</script>')
if last_script != -1:
    html = html[:last_script] + BILLING_JS + '\n' + html[last_script:]
    print('Billing + audit JS engine injected.')

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print('\nPhase 2 complete. Changes:')
print('  1. superAdminNavBtn JS reference removed')
print('  2. Audit Trail tab injected into MRU')
print('  3. Billing metrics replaced with live IDs (bill-stat-*)')
print('  4. Billing table body replaced with live loading stub')
print('  5. Billing status filter wired to fetchLiveBilling()')
print('  6. Full fetchLiveBilling() engine with real API calls')
print('  7. receiveBillPayment(), submitInsuranceClaim(), printBillReceipt()')
print('  8. fetchAuditLogs() wired to /api/v2/audit')
print('  9. formatNaira() helper for consistent currency display')
