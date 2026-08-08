import re

with open("public/command.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace the EHR SECTION in the sidebar
old_ehr_sidebar = """<div class="nav-section-title ehr-only">EHR SECTION</div>
        <button class="nav-btn ehr-only" data-roles="admin physician" onclick="switchEhrView('epidemicView')" title="Epidemic Radar">
          <span class="nav-icon">🦠</span><span class="nav-text">Epidemic Radar</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin physician" onclick="switchEhrView('pharmacyView')" title="Pharmacy Hub">
          <span class="nav-icon">💊</span><span class="nav-text">Pharmacy Hub</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin nurse" onclick="switchEhrView('recordsMainView')" title="Records Unit">
            <span>📂</span><span class="nav-text">Records Unit</span>
        </button>"""

new_ehr_sidebar = """<div class="nav-section-title ehr-only">EHR SECTION</div>
        <button class="nav-btn ehr-only" data-roles="admin nurse" onclick="switchEhrView('mpiView')" title="Patient Intake">
          <span class="nav-icon">👥</span><span class="nav-text">Patient Intake</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin nurse" onclick="switchEhrView('vitalsView')" title="Vitals & Triage">
          <span class="nav-icon">🩺</span><span class="nav-text">Vitals & Triage</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin physician" onclick="switchEhrView('encountersView')" title="Clinical Encounters">
          <span class="nav-icon">📝</span><span class="nav-text">Clinical Encounters</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin physician" onclick="switchEhrView('labOrdersView')" title="Order Management">
          <span class="nav-icon">🔬</span><span class="nav-text">Order Management</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin physician" onclick="switchEhrView('pharmacyView')" title="Pharmacy (e-Rx)">
          <span class="nav-icon">💊</span><span class="nav-text">Pharmacy (e-Rx)</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin physician nurse" onclick="switchEhrView('referralsView')" title="Care Coordination">
          <span class="nav-icon">🔄</span><span class="nav-text">Care Coordination</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin nurse" onclick="switchEhrView('recordsMainView')" title="Medical Records">
          <span class="nav-icon">📂</span><span class="nav-text">Medical Records</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin" onclick="switchEhrView('billingView')" title="Billing & Finance">
          <span class="nav-icon">💳</span><span class="nav-text">Billing & Finance</span>
        </button>"""

content = content.replace(old_ehr_sidebar, new_ehr_sidebar)

# 2. Inject new views before the closing tag of ehrAppShell
# To do this safely, we will look for the last ehr-view and insert after it, or just before </div><!-- /ehrAppShell -->
new_views = """
      <!-- VIEW: LAB ORDERS (Order Management) -->
      <div id="labOrdersView" class="ehr-view hidden" style="padding: 40px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Order Management</h2>
            <p style="color: #6b7280; font-size: 16px;">Request and track laboratory and radiology tests.</p>
          </div>
          <button style="padding: 12px 24px; border-radius: 8px; background: #3b82f6; color: white; border: none; font-weight: 700; cursor: pointer;">+ New Order</button>
        </div>
        <div class="glass-card">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                <th style="padding: 12px;">Order ID</th>
                <th style="padding: 12px;">Patient</th>
                <th style="padding: 12px;">Test Type</th>
                <th style="padding: 12px;">Status</th>
                <th style="padding: 12px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="5" style="padding: 24px; text-align: center; color: #9ca3af;">No pending orders.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VIEW: CARE COORDINATION & REFERRALS -->
      <div id="referralsView" class="ehr-view hidden" style="padding: 40px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Care Coordination</h2>
            <p style="color: #6b7280; font-size: 16px;">Manage patient transfers between EHR, PHC, and EMR.</p>
          </div>
          <button style="padding: 12px 24px; border-radius: 8px; background: #10b981; color: white; border: none; font-weight: 700; cursor: pointer;">Initiate Referral ➔</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div class="glass-card">
            <h3 style="margin-top:0;">Outbound Referrals</h3>
            <p style="color:#6b7280; font-size:14px;">Patients transferred to Primary Health Centers (PHC) or external hospitals.</p>
            <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;">
            <p style="text-align:center; color:#9ca3af; padding: 20px;">0 Active Outbound</p>
          </div>
          <div class="glass-card">
            <h3 style="margin-top:0;">Inbound Referrals</h3>
            <p style="color:#6b7280; font-size:14px;">Incoming transfers from PHC networks requesting advanced care.</p>
            <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;">
            <p style="text-align:center; color:#9ca3af; padding: 20px;">0 Pending Inbound</p>
          </div>
        </div>
      </div>

      <!-- VIEW: BILLING & FINANCE -->
      <div id="billingView" class="ehr-view hidden" style="padding: 40px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Billing & Finance</h2>
          <p style="color: #6b7280; font-size: 16px;">Track patient invoices, insurance claims, and payments.</p>
        </div>
        <div class="glass-card">
          <h3 style="margin-top:0;">Recent Invoices</h3>
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                <th style="padding: 12px;">Invoice #</th>
                <th style="padding: 12px;">Patient</th>
                <th style="padding: 12px;">Amount</th>
                <th style="padding: 12px;">Status</th>
                <th style="padding: 12px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="5" style="padding: 24px; text-align: center; color: #9ca3af;">No recent transactions.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
"""

# Insert right before the last closing div of ehrAppShell (which is followed by script tags)
# It's safer to just replace `    </div>\n\n  <!-- MODALS -->` with `new_views + '\n    </div>\n\n  <!-- MODALS -->'`
# Wait, let's just append it before `<!-- APP SHELL FOR EHR/PHC MODULE -->` ends? No, before `<script>`.
# Better: find the end of the ehrAppShell which usually is `  </div>\n\n  <!-- SCRIPTS -->` or similar.
# Let's search for `  <!-- SCRIPTS -->` and insert before it.

content = content.replace("  <!-- SCRIPTS -->", new_views + "\n  <!-- SCRIPTS -->")

with open("public/command.html", "w", encoding="utf-8") as f:
    f.write(content)
print("EHR update complete.")
