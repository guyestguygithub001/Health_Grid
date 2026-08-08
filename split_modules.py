import re

with open("public/command.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update logo text ID
content = content.replace(
    '<div style="color: #1f2937; font-weight: 800; font-size: 18px; letter-spacing: -0.5px; white-space: nowrap;">EHR System</div>',
    '<div id="moduleLogoText" style="color: #1f2937; font-weight: 800; font-size: 18px; letter-spacing: -0.5px; white-space: nowrap;">EHR System</div>'
)

# 2. Add phc-only to PHC SECTION and its buttons
phc_section_old = """<div class="nav-section-title">PHC SECTION</div>
        <button class="nav-btn active" data-roles="admin physician nurse" onclick="switchEhrView('phcWorkflowView')" title="Live PHC Workflow">
          <span class="nav-icon">🏥</span><span class="nav-text">Active PHC</span>
        </button>
        <button class="nav-btn" data-roles="admin nurse" onclick="switchEhrView('mpiView')" title="Patient Intake">
          <span class="nav-icon">👥</span><span class="nav-text">Patient Intake</span>
        </button>
        <button class="nav-btn" data-roles="admin nurse" onclick="switchEhrView('vitalsView')" title="Vitals & Triage">
          <span class="nav-icon">🩺</span><span class="nav-text">Vitals & Triage</span>
        </button>
        <button class="nav-btn" data-roles="admin physician" onclick="switchEhrView('encountersView')" title="Clinical Encounters">
          <span class="nav-icon">📝</span><span class="nav-text">Clinical Encounters</span>
        </button>
        <button class="nav-btn" data-roles="admin nurse physician" onclick="switchEhrView('mchView')" title="Maternal & Child Health">
          <span class="nav-icon">👶</span><span class="nav-text">MCH (ANC)</span>
        </button>"""

phc_section_new = """<div class="nav-section-title phc-only">PHC SECTION</div>
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

content = content.replace(phc_section_old, phc_section_new)

# 3. Add ehr-only to EHR SECTION and its buttons
ehr_section_old = """<div class="nav-section-title">EHR SECTION</div>
        <button class="nav-btn" data-roles="admin physician" onclick="switchEhrView('epidemicView')" title="Epidemic Radar">
          <span class="nav-icon">🦠</span><span class="nav-text">Epidemic Radar</span>
        </button>
        <button class="nav-btn" data-roles="admin physician" onclick="switchEhrView('pharmacyView')" title="Pharmacy Hub">
          <span class="nav-icon">💊</span><span class="nav-text">Pharmacy Hub</span>
        </button>
        <button class="nav-btn" data-roles="admin nurse" onclick="switchEhrView('recordsMainView')" title="Records Unit">
            <span>📂</span><span class="nav-text">Records Unit</span>
        </button>"""

ehr_section_new = """<div class="nav-section-title ehr-only">EHR SECTION</div>
        <button class="nav-btn ehr-only" data-roles="admin physician" onclick="switchEhrView('epidemicView')" title="Epidemic Radar">
          <span class="nav-icon">🦠</span><span class="nav-text">Epidemic Radar</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin physician" onclick="switchEhrView('pharmacyView')" title="Pharmacy Hub">
          <span class="nav-icon">💊</span><span class="nav-text">Pharmacy Hub</span>
        </button>
        <button class="nav-btn ehr-only" data-roles="admin nurse" onclick="switchEhrView('recordsMainView')" title="Records Unit">
            <span>📂</span><span class="nav-text">Records Unit</span>
        </button>"""

content = content.replace(ehr_section_old, ehr_section_new)

# 4. Modify switchAppRole to respect module context
switch_role_old = """function switchAppRole(role) {
        document.querySelectorAll('#ehrAppShell .nav-btn').forEach(btn => {
          if (!btn.dataset.roles) return; // skip if no roles
          const allowedRoles = btn.dataset.roles.split(' ');
          if (allowedRoles.includes(role) || allowedRoles.includes('all')) {
            btn.style.display = 'flex';
          } else {
            btn.style.display = 'none';
          }
        });
      }"""

switch_role_new = """function switchAppRole(role) {
        const currentModule = window.activeModule || 'ehr';
        
        // Handle section titles
        document.querySelectorAll('.nav-section-title').forEach(title => {
           if (currentModule === 'ehr' && title.classList.contains('phc-only')) title.style.display = 'none';
           else if (currentModule === 'phc' && title.classList.contains('ehr-only')) title.style.display = 'none';
           else title.style.display = '';
        });

        document.querySelectorAll('#ehrAppShell .nav-btn').forEach(btn => {
          if (!btn.dataset.roles) return; // skip if no roles
          
          if (currentModule === 'ehr' && btn.classList.contains('phc-only')) {
            btn.style.display = 'none';
            return;
          }
          if (currentModule === 'phc' && btn.classList.contains('ehr-only')) {
            btn.style.display = 'none';
            return;
          }

          const allowedRoles = btn.dataset.roles.split(' ');
          if (allowedRoles.includes(role) || allowedRoles.includes('all')) {
            btn.style.display = 'flex';
          } else {
            btn.style.display = 'none';
          }
        });
      }"""

content = content.replace(switch_role_old, switch_role_new)

# 5. Modify enter functions
enter_functions_old = """function enterEhrModule() {
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        switchAppRole('admin'); 
        switchEhrView('mpiView');
      }
      
      function enterPhcModule() {
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        switchAppRole('admin'); 
        switchEhrView('phcWorkflowView');
      }"""

enter_functions_new = """function enterEhrModule() {
        window.activeModule = 'ehr';
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        const logo = document.getElementById('moduleLogoText');
        if(logo) logo.innerText = 'EHR System';
        switchAppRole('admin'); 
        switchEhrView('recordsMainView'); // Since mpiView is PHC-only now, default to recordsMainView
      }
      
      function enterPhcModule() {
        window.activeModule = 'phc';
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        const logo = document.getElementById('moduleLogoText');
        if(logo) logo.innerText = 'PHC System';
        switchAppRole('admin'); 
        switchEhrView('phcWorkflowView');
      }"""

content = content.replace(enter_functions_old, enter_functions_new)

with open("public/command.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Modules split successfully!")
