import re

with open("public/command.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the roleSwitcherContainer to hide in PHC
# Update switchAppRole to hide the roleSwitcherContainer if in PHC
old_switch_role = """        document.querySelectorAll('.nav-section-title').forEach(title => {"""
new_switch_role = """        // Hide Active Role switcher in PHC mode
        const roleContainer = document.getElementById('roleSwitcherContainer');
        if (roleContainer) {
            if (currentModule === 'phc') {
                roleContainer.style.display = 'none';
                roleContainer.classList.add('phc-hidden-override');
            } else {
                roleContainer.classList.remove('phc-hidden-override');
                // The CSS .sidebar-expanded #roleSwitcherContainer { display: block !important; } handles the rest
            }
        }

        document.querySelectorAll('.nav-section-title').forEach(title => {"""

content = content.replace(old_switch_role, new_switch_role)

# To ensure CSS doesn't override our override, add a quick style
old_style = """#ehrAppShell .sidebar-expanded #roleSwitcherContainer { display: block !important; }"""
new_style = """#ehrAppShell .sidebar-expanded #roleSwitcherContainer { display: block !important; }
        #ehrAppShell .sidebar-expanded #roleSwitcherContainer.phc-hidden-override { display: none !important; }"""
content = content.replace(old_style, new_style)

# 2. Replace the PHC SECTION in the sidebar
phc_section_old = """<div class="nav-section-title phc-only">PHC SECTION</div>
        <button class="nav-btn active phc-only" data-roles="admin physician nurse" onclick="switchEhrView('phcWorkflowView')" title="Live PHC Workflow">
          <span class="nav-icon">🏥</span><span class="nav-text">Active PHC</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin nurse" onclick="switchEhrView('mpiView')" title="Patient Intake">
          <span class="nav-icon">👥</span><span class="nav-text">Patient Intake</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin nurse" onclick="switchEhrView('vitalsView')" title="Vitals & Triage">
          <span class="nav-icon">🩺</span><span class="nav-text">Vitals & Triage</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin physician" onclick="switchEhrView('encountersView')" title="Clinical Encounters">
          <span class="nav-icon">📝</span><span class="nav-text">Clinical Encounters</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin nurse physician" onclick="switchEhrView('mchView')" title="Maternal & Child Health">
          <span class="nav-icon">👶</span><span class="nav-text">MCH (ANC)</span>
        </button>"""

phc_section_new = """<!-- PHC Navigation -->
        <button class="nav-btn active phc-only" data-roles="admin nurse" onclick="switchEhrView('mpiView')" title="Registration & Intake">
          <span class="nav-icon">👥</span><span class="nav-text">Registration & Intake</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin nurse" onclick="switchEhrView('vitalsView')" title="Vitals & Screening">
          <span class="nav-icon">🩺</span><span class="nav-text">Vitals & Screening</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin physician nurse" onclick="switchEhrView('phcWorkflowView')" title="Outpatient Consultation">
          <span class="nav-icon">🏥</span><span class="nav-text">Outpatient (OPD)</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin nurse physician" onclick="switchEhrView('mchView')" title="Maternal & Child Health">
          <span class="nav-icon">👶</span><span class="nav-text">MCH / ANC</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin nurse" onclick="switchEhrView('nutritionView')" title="Nutrition & Growth">
          <span class="nav-icon">⚖️</span><span class="nav-text">Nutrition & Growth</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin physician nurse" onclick="switchEhrView('dispensaryView')" title="Essential Drugs">
          <span class="nav-icon">💊</span><span class="nav-text">Essential Drugs</span>
        </button>
        <button class="nav-btn phc-only" data-roles="admin nurse" onclick="switchEhrView('outreachView')" title="Community Outreach">
          <span class="nav-icon">🌍</span><span class="nav-text">Community Outreach</span>
        </button>"""

content = content.replace(phc_section_old, phc_section_new)

# 3. Inject new views before the closing tag of ehrAppShell
new_views = """
      <!-- VIEW: NUTRITION & GROWTH -->
      <div id="nutritionView" class="ehr-view hidden phc-only-view" style="padding: 40px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Nutrition & Growth</h2>
            <p style="color: #6b7280; font-size: 16px;">Malnutrition screening (MUAC), child growth monitoring, and supplements.</p>
          </div>
          <button style="padding: 12px 24px; border-radius: 8px; background: #eab308; color: white; border: none; font-weight: 700; cursor: pointer;">Record New Assessment</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div class="glass-card">
            <h3 style="margin-top:0;">Severe Acute Malnutrition (SAM)</h3>
            <p style="color:#6b7280; font-size:14px;">Patients currently enrolled in the CMAM program (MUAC < 115mm).</p>
            <p style="text-align:center; color:#9ca3af; padding: 20px;">0 Active Cases</p>
          </div>
          <div class="glass-card">
            <h3 style="margin-top:0;">Supplement Distribution</h3>
            <p style="color:#6b7280; font-size:14px;">Vitamin A, Iron/Folic Acid, and RUTF dispensation log.</p>
            <p style="text-align:center; color:#9ca3af; padding: 20px;">0 Distributions Today</p>
          </div>
        </div>
      </div>

      <!-- VIEW: DISPENSARY -->
      <div id="dispensaryView" class="ehr-view hidden phc-only-view" style="padding: 40px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Essential Drugs Dispensary</h2>
            <p style="color: #6b7280; font-size: 16px;">Dispense medications from the Essential Medicines List (EML).</p>
          </div>
        </div>
        <div class="glass-card">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                <th style="padding: 12px;">Prescription ID</th>
                <th style="padding: 12px;">Patient</th>
                <th style="padding: 12px;">Drug (EML)</th>
                <th style="padding: 12px;">Qty</th>
                <th style="padding: 12px;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="5" style="padding: 24px; text-align: center; color: #9ca3af;">No pending prescriptions.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VIEW: COMMUNITY OUTREACH -->
      <div id="outreachView" class="ehr-view hidden phc-only-view" style="padding: 40px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Community Outreach (CHW)</h2>
          <p style="color: #6b7280; font-size: 16px;">Data synchronized from Community Health Extension Workers (CHEWs).</p>
        </div>
        <div class="glass-card">
          <h3 style="margin-top:0;">Recent Field Reports</h3>
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                <th style="padding: 12px;">Date</th>
                <th style="padding: 12px;">Community/Village</th>
                <th style="padding: 12px;">Officer (CHEW)</th>
                <th style="padding: 12px;">Households Visited</th>
                <th style="padding: 12px;">Referrals Made</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="5" style="padding: 24px; text-align: center; color: #9ca3af;">No field data recorded yet.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
"""

content = content.replace("  <!-- SCRIPTS -->", new_views + "\n  <!-- SCRIPTS -->")

# 4. Modify enterPhcModule to default to mpiView (Registration & Intake) since it's the first step
enter_phc_old = """function enterPhcModule() {
        window.activeModule = 'phc';
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        const logo = document.getElementById('moduleLogoText');
        if(logo) logo.innerText = 'PHC System';
        switchAppRole('admin'); 
        switchEhrView('phcWorkflowView');
      }"""

enter_phc_new = """function enterPhcModule() {
        window.activeModule = 'phc';
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        const logo = document.getElementById('moduleLogoText');
        if(logo) logo.innerText = 'PHC System';
        switchAppRole('admin'); 
        switchEhrView('mpiView'); // Default to Registration & Intake
      }"""

content = content.replace(enter_phc_old, enter_phc_new)

with open("public/command.html", "w", encoding="utf-8") as f:
    f.write(content)
print("PHC update complete.")
