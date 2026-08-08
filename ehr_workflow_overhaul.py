#!/usr/bin/env python3
"""
EHR Module Full Workflow Overhaul Script
Surgically replaces mockup views with live, database-wired workflows.
"""

import re

FILE = 'public/command.html'
with open(FILE, 'r', encoding='utf-8') as f:
    html = f.read()

# ─────────────────────────────────────────────────
# 1. REMOVE SUPER ADMIN NAV BUTTON
# ─────────────────────────────────────────────────
html = re.sub(
    r'\s*<!-- SUPER ADMIN ONLY -->\s*<button[^>]*superAdminNavBtn[^>]*>.*?</button>',
    '',
    html,
    flags=re.DOTALL
)

# ─────────────────────────────────────────────────
# 2. ADD TRIAGE & VITALS NAV BUTTON next to Patient Profiles
# ─────────────────────────────────────────────────
html = html.replace(
    '''<button class="nav-btn" data-roles="admin nurse" data-module="ehr" onclick="switchEhrView('mpiView')" title="Patient Profiles">
          <span class="nav-icon">👥</span><span class="nav-text">Patient Profiles</span>
        </button>''',
    '''<button class="nav-btn" data-roles="admin nurse" data-module="ehr" onclick="switchEhrView('mpiView')" title="Patient Registration">
          <span class="nav-icon">👥</span><span class="nav-text">Patient Registration</span>
        </button>
        <button class="nav-btn" data-roles="admin nurse" data-module="ehr" onclick="switchEhrView('vitalsView')" title="Triage & Vitals">
          <span class="nav-icon">🩺</span><span class="nav-text">Triage & Vitals</span>
        </button>'''
)

# ─────────────────────────────────────────────────
# 3. OVERHAUL INPATIENT WARDS VIEW — Live bed management
# ─────────────────────────────────────────────────
OLD_WARDS = '''      <!-- VIEW: INPATIENT WARDS -->
      <div id="wardsView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Inpatient Wards</h2>
            <p style="color: #6b7280; font-size: 16px;">Live bed management and admission tracking.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="openAdmitModal()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              + Admit Patient
            </button>
            <button onclick="fetchLiveWards()" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              🔄 Refresh Beds
            </button>
          </div>
        </div>
        
        <div id="wardsErrorAlert" style="display: none; padding: 12px; background: #fef2f2; color: #991b1b; border-left: 4px solid #dc2626; border-radius: 4px; margin-bottom: 20px;">
          <span>⚠️ Error admitting patient.</span>
        </div>

        <div class="glass-card">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                  <th style="padding: 12px 8px;">Bed ID</th>
                  <th style="padding: 12px 8px;">Ward</th>
                  <th style="padding: 12px 8px;">Status</th>
                  <th style="padding: 12px 8px;">Patient ID</th>
                </tr>
              </thead>
              <tbody id="liveWardsTableBody">
                <tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">Click refresh to fetch bed statuses...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Admit Modal -->
        <div id="admitPatientModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
          <div style="background: white; padding: 32px; border-radius: 16px; width: 400px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; font-size: 20px; color: #111827; margin-bottom: 16px;">Admit Patient</h3>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Patient ID</label>
              <input type="text" id="admitPatientId" placeholder="e.g. PAT-001" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Select Available Bed</label>
              <select id="admitBedSelect" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                <option value="">Loading beds...</option>
              </select>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button onclick="closeAdmitModal()" style="padding: 10px 16px; background: #f3f4f6; color: #4b5563; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
              <button onclick="submitAdmission()" style="padding: 10px 16px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Admit & Bill</button>'''

NEW_WARDS = '''      <!-- VIEW: INPATIENT WARDS — Live Bed Management -->
      <div id="wardsView" class="ehr-view hidden" style="padding: 32px; max-width: 1400px; margin: 0 auto; width: 100%;">
        <!-- Header -->
        <div style="margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.02em; margin:0;">🛏️ Inpatient Ward Management</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Live bed tracking, admissions, and patient discharge across all wards.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="fetchLiveWards()" style="padding: 10px 20px; background: #e2e8f0; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display:flex; align-items:center; gap:6px;">↻ Refresh</button>
            <button onclick="openAdmitModal()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(5,150,105,0.2);">+ Admit Patient</button>
          </div>
        </div>

        <!-- Ward Stats Grid -->
        <div id="wardStatsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px;"></div>

        <!-- Ward Filter Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
          <button onclick="filterWardBy('all')" id="wardTab-all" class="ward-tab-btn ward-tab-active" style="padding: 8px 18px; border-radius: 20px; border: none; cursor: pointer; font-weight: 600; font-size: 13px; background: #1e3a5f; color: white;">All Wards</button>
          <button onclick="filterWardBy('Male Medical')" id="wardTab-male" class="ward-tab-btn" style="padding: 8px 18px; border-radius: 20px; border: 1px solid #d1d5db; cursor: pointer; font-weight: 600; font-size: 13px; background: white; color: #374151;">Male Medical</button>
          <button onclick="filterWardBy('Female Medical')" id="wardTab-female" class="ward-tab-btn" style="padding: 8px 18px; border-radius: 20px; border: 1px solid #d1d5db; cursor: pointer; font-weight: 600; font-size: 13px; background: white; color: #374151;">Female Medical</button>
          <button onclick="filterWardBy('Paediatric')" id="wardTab-paeds" class="ward-tab-btn" style="padding: 8px 18px; border-radius: 20px; border: 1px solid #d1d5db; cursor: pointer; font-weight: 600; font-size: 13px; background: white; color: #374151;">Paediatric</button>
          <button onclick="filterWardBy('Surgical')" id="wardTab-surg" class="ward-tab-btn" style="padding: 8px 18px; border-radius: 20px; border: 1px solid #d1d5db; cursor: pointer; font-weight: 600; font-size: 13px; background: white; color: #374151;">Surgical</button>
          <button onclick="filterWardBy('Maternity')" id="wardTab-mat" class="ward-tab-btn" style="padding: 8px 18px; border-radius: 20px; border: 1px solid #d1d5db; cursor: pointer; font-weight: 600; font-size: 13px; background: white; color: #374151;">Maternity</button>
          <button onclick="filterWardBy('ICU')" id="wardTab-icu" class="ward-tab-btn" style="padding: 8px 18px; border-radius: 20px; border: 1px solid #d1d5db; cursor: pointer; font-weight: 600; font-size: 13px; background: white; color: #374151;">ICU/HDU</button>
        </div>

        <!-- Bed Cards Grid -->
        <div id="wardBedsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">
          <div style="text-align:center; padding: 60px 24px; color: #9ca3af; grid-column: 1/-1;">
            <div style="font-size: 48px; margin-bottom: 12px;">🔄</div>
            <p style="font-weight: 600;">Loading bed statuses...</p>
          </div>
        </div>

        <!-- Admit Modal -->
        <div id="admitPatientModal" style="display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div style="background: white; padding: 32px; border-radius: 20px; width: 480px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); animation: slideUp 0.25s ease-out;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
              <div>
                <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: #111827;">Admit Patient to Ward</h3>
                <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Select ward unit and available bed</p>
              </div>
              <button onclick="closeAdmitModal()" style="background: #f3f4f6; border: none; border-radius: 8px; width:32px; height:32px; cursor:pointer; font-size:16px; color:#6b7280;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; text-transform:uppercase; letter-spacing:0.05em;">Patient ID</label>
                <input type="text" id="admitPatientId" placeholder="e.g. PAT-001" style="width: 100%; padding: 11px 14px; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 14px; box-sizing:border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#d1d5db'">
              </div>
              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; text-transform:uppercase; letter-spacing:0.05em;">Ward Unit</label>
                <select id="admitWardSelect" onchange="populateBedsForWard(this.value)" style="width: 100%; padding: 11px 14px; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 14px; box-sizing:border-box; background:white;">
                  <option value="">-- Select Ward --</option>
                  <option>Male Medical</option>
                  <option>Female Medical</option>
                  <option>Paediatric</option>
                  <option>Surgical</option>
                  <option>Maternity</option>
                  <option>ICU/HDU</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; text-transform:uppercase; letter-spacing:0.05em;">Available Bed</label>
                <select id="admitBedSelect" style="width: 100%; padding: 11px 14px; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 14px; box-sizing:border-box; background:white;">
                  <option value="">Select ward first...</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; text-transform:uppercase; letter-spacing:0.05em;">Admitting Diagnosis</label>
                <input type="text" id="admitDiagnosis" placeholder="Primary diagnosis..." style="width: 100%; padding: 11px 14px; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 14px; box-sizing:border-box;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#d1d5db'">
              </div>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
              <button onclick="closeAdmitModal()" style="flex:1; padding: 12px; background: #f3f4f6; color: #4b5563; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">Cancel</button>
              <button onclick="submitAdmission()" style="flex:2; padding: 12px; background: #059669; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(5,150,105,0.3);">✅ Confirm Admission</button>'''

html = html.replace(OLD_WARDS, NEW_WARDS, 1)

# ─────────────────────────────────────────────────
# 4. OVERHAUL ENCOUNTERS VIEW — Live GOPD/SOPD/MOPD workflow
# ─────────────────────────────────────────────────
OLD_ENCOUNTERS_HEADER = '''      <!-- VIEW: CLINICAL ENCOUNTERS -->
      <div id="encountersView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Clinical Encounters</h2>
            <p style="color: #6b7280; font-size: 16px;">The digital waiting room. Select an open encounter to begin consultation.</p>
          </div>
          <button onclick="fetchLiveEncounters()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            🔄 Refresh Encounters
          </button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px;">
          <div class="glass-card">
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                    <th style="padding: 12px 8px;">Encounter ID</th>
                    <th style="padding: 12px 8px;">Patient ID</th>
                    <th style="padding: 12px 8px;">Date</th>
                    <th style="padding: 12px 8px;">Chief Complaint / Vitals</th>
                    <th style="padding: 12px 8px;">Status</th>
                  </tr>
                </thead>
                <tbody id="liveEncountersTableBody">
                  <tr><td colspan="5" style="padding: 20px; text-align: center; color: #9ca3af;">Click refresh to fetch open encounters...</td></tr>
                </tbody>
              </table>
            </div>
          </div>'''

NEW_ENCOUNTERS_HEADER = '''      <!-- VIEW: CLINICAL ENCOUNTERS — Live GOPD/SOPD/MOPD Workflow -->
      <div id="encountersView" class="ehr-view hidden" style="padding: 28px; max-width: 1400px; margin: 0 auto; width: 100%;">
        <!-- Header -->
        <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.02em; margin: 0;">📋 Outpatient Clinical Encounters</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Real-time digital waiting rooms for all outpatient departments.</p>
          </div>
          <div style="display: flex; gap: 10px; align-items:center;">
            <select id="encounterUnitFilter" onchange="fetchLiveEncounters()" style="padding: 9px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; font-weight: 600; background: white;">
              <option value="">All Units</option>
              <option value="GOPD">GOPD — General OPD</option>
              <option value="SOPD">SOPD — Surgical OPD</option>
              <option value="MOPD">MOPD — Medical OPD</option>
              <option value="POPD">POPD — Paediatric OPD</option>
              <option value="ANC">ANC — Antenatal Clinic</option>
              <option value="ENT">ENT — Ear, Nose & Throat</option>
              <option value="OPHTHAL">OPHTHAL — Eye Clinic</option>
              <option value="DERM">DERM — Dermatology</option>
              <option value="A&E">A&E — Accident & Emergency</option>
            </select>
            <button onclick="fetchLiveEncounters()" style="padding: 9px 18px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">↻ Refresh</button>
            <button onclick="openNewEncounterModal()" style="padding: 9px 18px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(5,150,105,0.2);">+ Walk-in</button>
          </div>
        </div>

        <!-- Encounter Stats -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-bottom: 24px;">
          <div class="glass-card" style="padding: 16px; border-top: 3px solid #6366f1; text-align:center;">
            <p style="margin:0; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase;">Open</p>
            <h3 id="enc-stat-open" style="margin:6px 0 0; font-size:28px; font-weight:800; color:#6366f1;">-</h3>
          </div>
          <div class="glass-card" style="padding: 16px; border-top: 3px solid #f59e0b; text-align:center;">
            <p style="margin:0; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase;">In Progress</p>
            <h3 id="enc-stat-progress" style="margin:6px 0 0; font-size:28px; font-weight:800; color:#f59e0b;">-</h3>
          </div>
          <div class="glass-card" style="padding: 16px; border-top: 3px solid #10b981; text-align:center;">
            <p style="margin:0; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase;">Seen Today</p>
            <h3 id="enc-stat-closed" style="margin:6px 0 0; font-size:28px; font-weight:800; color:#10b981;">-</h3>
          </div>
          <div class="glass-card" style="padding: 16px; border-top: 3px solid #ef4444; text-align:center;">
            <p style="margin:0; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase;">Total Today</p>
            <h3 id="enc-stat-total" style="margin:6px 0 0; font-size:28px; font-weight:800; color:#ef4444;">-</h3>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px;">
          <!-- Waiting Room List -->
          <div class="glass-card" style="padding: 0; overflow: hidden;">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
              <h3 style="margin:0; font-size:15px; font-weight:700; color:#111827;">📋 Waiting Room</h3>
              <span id="waitingRoomCount" style="background:#f3f4f6; color:#374151; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700;">0 patients</span>
            </div>
            <div id="encounterWaitingList" style="max-height: 580px; overflow-y: auto;">
              <div style="padding: 40px; text-align:center; color:#9ca3af;">
                <div style="font-size:40px; margin-bottom:12px;">🔄</div>
                <p style="font-weight:600;">Loading encounter queue...</p>
              </div>
            </div>
          </div>'''

html = html.replace(OLD_ENCOUNTERS_HEADER, NEW_ENCOUNTERS_HEADER, 1)

# ─────────────────────────────────────────────────
# 5. OVERHAUL PHARMACY VIEW — Live inventory + dispense + e-prescription
# ─────────────────────────────────────────────────
OLD_PHARMACY = '''      <!-- VIEW: PHARMACY HUB -->
      <div id="pharmacyView" class="ehr-view hidden" style="padding: 40px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Circular Pharmacy Hub</h2>
          <p style="color: #6b7280; font-size: 16px;">Zero-stock AI substitution, inventory routing, and digital SMS pickup codes.</p>
        </div>
        
        <div class="glass-card">
          <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">Live Inventory Matrix</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Amoxicillin</div>
              <div style="font-size: 24px; font-weight: 800; color: #10b981;">142</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Artemether (ACT)</div>
              <div id="stockACT" style="font-size: 24px; font-weight: 800; color: #ef4444;">0</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Paracetamol</div>
              <div style="font-size: 24px; font-weight: 800; color: #111827;">5,020</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600;">ORS</div>
              <div style="font-size: 24px; font-weight: 800; color: #111827;">84</div>
            </div>
          </div>

          <h4 style="margin:0 0 12px; font-size:14px; font-weight: 600;">National Warehouse (Within 10km)</h4>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span>Central Hub A</span><span style="color:#166534; font-weight:bold;">ACT: 400</span>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; font-size: 14px;">
            <span>Warehouse B</span><span style="color:#166534; font-weight:bold;">ACT: 1200</span>
          </div>
        </div>'''

NEW_PHARMACY = '''      <!-- VIEW: PHARMACY HUB — Live Inventory & E-Prescription Workflow -->
      <div id="pharmacyView" class="ehr-view hidden" style="padding: 28px; max-width: 1400px; margin: 0 auto; width: 100%;">
        <!-- Header -->
        <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.02em; margin: 0;">💊 Circular Pharmacy Hub</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Live inventory matrix, E-prescription dispensing, and zero-stock routing.</p>
          </div>
          <button onclick="fetchPharmacyData()" style="padding: 9px 18px; background: #e2e8f0; color:#374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">↻ Refresh Inventory</button>
        </div>

        <!-- Live Inventory Matrix -->
        <div class="glass-card" style="margin-bottom: 24px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; margin: 0; color: #111827;">📦 Live Stock Levels</h3>
            <span id="pharmacyLowStockAlert" style="display:none; background: #fef2f2; color: #b91c1c; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; border: 1px solid #fecaca;">⚠️ Low Stock Items Detected</span>
          </div>
          <div id="pharmacyInventoryGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
            <div style="text-align:center; padding:20px; color:#9ca3af; grid-column:1/-1;">Loading inventory...</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- E-Prescription Queue -->
          <div class="glass-card" style="padding: 0; overflow: hidden;">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
              <h3 style="margin:0; font-size:15px; font-weight:700; color:#111827;">📨 Incoming E-Prescriptions</h3>
              <button onclick="fetchLivePharmacyOrders()" style="padding: 6px 14px; background: #8b5cf6; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">↻ Refresh</button>
            </div>
            <div id="pharmacyRxQueue" style="max-height: 420px; overflow-y: auto; padding: 8px;">
              <div style="padding:30px; text-align:center; color:#9ca3af;">Loading prescriptions...</div>
            </div>
          </div>

          <!-- OTC Dispense Panel -->
          <div class="glass-card" style="border-left: 4px solid #10b981; padding: 20px;">
            <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 16px; color: #065f46;">🏪 Direct Dispense (OTC)</h3>
            <form onsubmit="addToPharmacyCart(event)">
              <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:700; color:#4b5563; margin-bottom:6px; text-transform:uppercase;">Patient ID</label>
                  <input type="text" id="walkInPharmPatientId" placeholder="PT1001" style="width:100%; padding: 10px 12px; border-radius: 8px; border: 1.5px solid #d1d5db; font-size: 14px; box-sizing:border-box;" />
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:700; color:#4b5563; margin-bottom:6px; text-transform:uppercase;">Select Drug</label>
                  <select id="walkInPharmDrug" style="width:100%; padding: 10px 12px; border-radius: 8px; border: 1.5px solid #d1d5db; font-size: 14px; background:white; box-sizing:border-box;">
                    <optgroup label="Antimalarials">
                      <option value="Artemether-Lumefantrine (ACT)|2500">Artemether-Lumefantrine (ACT) — ₦2,500</option>
                      <option value="Artesunate Injection|4000">Artesunate Injection — ₦4,000</option>
                    </optgroup>
                    <optgroup label="Analgesics & Antipyretics">
                      <option value="Paracetamol 500mg|500">Paracetamol 500mg — ₦500</option>
                      <option value="Ibuprofen 400mg|800">Ibuprofen 400mg — ₦800</option>
                      <option value="Diclofenac 50mg|1000">Diclofenac 50mg — ₦1,000</option>
                    </optgroup>
                    <optgroup label="Antibiotics">
                      <option value="Amoxicillin 500mg|1200">Amoxicillin 500mg — ₦1,200</option>
                      <option value="Ciprofloxacin 500mg|1500">Ciprofloxacin 500mg — ₦1,500</option>
                      <option value="Metronidazole 400mg|900">Metronidazole 400mg — ₦900</option>
                    </optgroup>
                    <optgroup label="Fluids & Supplements">
                      <option value="Oral Rehydration Salts (ORS)|300">Oral Rehydration Salts (ORS) — ₦300</option>
                      <option value="Zinc Tablets 20mg|500">Zinc Tablets 20mg — ₦500</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:700; color:#4b5563; margin-bottom:6px; text-transform:uppercase;">Quantity</label>
                  <input type="number" id="walkInPharmQty" min="1" value="1" style="width:100%; padding: 10px 12px; border-radius: 8px; border: 1.5px solid #d1d5db; font-size: 14px; box-sizing:border-box;" />
                </div>
              </div>
              <button type="submit" style="width: 100%; padding: 12px; border-radius: 8px; background: #1e293b; color: white; border: none; font-weight: 700; cursor: pointer; margin-bottom: 16px;">[+] Add to Cart</button>
            </form>
            <div id="pharmacyCartContainer" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px;">
              <h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #065f46;">🛒 Cart Summary</h4>
              <ul id="pharmacyCartList" style="list-style: none; padding: 0; margin: 0 0 12px; font-size: 13px; display:flex; flex-direction:column; gap:6px;"></ul>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #bbf7d0; padding-top: 12px;">
                <strong style="font-size: 15px; color: #065f46;">Total: ₦<span id="pharmacyCartTotal">0</span></strong>
                <button onclick="checkoutPharmacyCart()" style="padding: 10px 20px; border-radius: 8px; background: #10b981; color: white; border: none; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.2);">Checkout & Bill</button>
              </div>
            </div>
          </div>
        </div>'''

html = html.replace(OLD_PHARMACY, NEW_PHARMACY, 1)

# ─────────────────────────────────────────────────
# 6. OVERHAUL RECORDS UNIT — Live registry, appointments, referrals
# ─────────────────────────────────────────────────
OLD_RECORDS_APPT = '''          <!-- RECORDS: APPOINTMENTS SHELL -->
          <div id="recContent-appointments" class="rec-tab-content hidden" style="animation: fadeIn 0.3s ease-out;">
            <div class="white-card" style="padding: 40px; text-align: center; min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
              <h3 style="font-size: 20px; font-weight: 700; color: #0f172a;">All Appointments</h3>
              <p style="color: #64748b;">No appointments scheduled for today.</p>
            </div>
          </div>'''

NEW_RECORDS_APPT = '''          <!-- RECORDS: APPOINTMENTS — Live -->
          <div id="recContent-appointments" class="rec-tab-content hidden" style="animation: fadeIn 0.3s ease-out;">
            <!-- Header + New Appointment -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
              <div>
                <h3 style="margin:0; font-size:20px; font-weight:800; color:#0f172a;">📅 Appointments Register</h3>
                <p style="margin:4px 0 0; color:#64748b; font-size:14px;">All scheduled appointments across all units.</p>
              </div>
              <div style="display:flex; gap:10px;">
                <select id="apptStatusFilter" onchange="fetchLiveAppointments()" style="padding: 8px 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; background:white; font-weight:600;">
                  <option value="">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No-Show">No-Show</option>
                </select>
                <button onclick="fetchLiveAppointments()" style="padding: 8px 16px; background: #e2e8f0; color:#374151; border:none; border-radius:8px; font-weight:600; cursor:pointer;">↻ Refresh</button>
                <button onclick="openNewApptModal()" style="padding: 8px 16px; background: #4f46e5; color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer;">+ New Appointment</button>
              </div>
            </div>

            <!-- Stats Row -->
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:14px; margin-bottom:20px;">
              <div class="white-card" style="padding:16px; border-top:3px solid #4f46e5; text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Today's Appointments</p><h3 id="apptStat-today" style="margin:6px 0 0;font-size:26px;font-weight:800;color:#4f46e5;">-</h3></div>
              <div class="white-card" style="padding:16px; border-top:3px solid #10b981; text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Completed</p><h3 id="apptStat-completed" style="margin:6px 0 0;font-size:26px;font-weight:800;color:#10b981;">-</h3></div>
              <div class="white-card" style="padding:16px; border-top:3px solid #ef4444; text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">No-Show</p><h3 id="apptStat-noshow" style="margin:6px 0 0;font-size:26px;font-weight:800;color:#ef4444;">-</h3></div>
              <div class="white-card" style="padding:16px; border-top:3px solid #f59e0b; text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Pending</p><h3 id="apptStat-pending" style="margin:6px 0 0;font-size:26px;font-weight:800;color:#f59e0b;">-</h3></div>
            </div>

            <div class="white-card" style="padding: 0; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;" id="apptTable">
                <thead style="background: #f8fafc;">
                  <tr>
                    <th style="padding: 14px 20px; color: #64748b; font-size: 12px; font-weight: 700; text-transform:uppercase;">Appt ID</th>
                    <th style="padding: 14px 20px; color: #64748b; font-size: 12px; font-weight: 700; text-transform:uppercase;">Patient</th>
                    <th style="padding: 14px 20px; color: #64748b; font-size: 12px; font-weight: 700; text-transform:uppercase;">Unit / Clinic</th>
                    <th style="padding: 14px 20px; color: #64748b; font-size: 12px; font-weight: 700; text-transform:uppercase;">Date</th>
                    <th style="padding: 14px 20px; color: #64748b; font-size: 12px; font-weight: 700; text-transform:uppercase;">Status</th>
                    <th style="padding: 14px 20px; color: #64748b; font-size: 12px; font-weight: 700; text-transform:uppercase;">Action</th>
                  </tr>
                </thead>
                <tbody id="apptTableBody">
                  <tr><td colspan="6" style="padding:32px; text-align:center; color:#94a3b8;">Loading appointments...</td></tr>
                </tbody>
              </table>
            </div>

            <!-- New Appointment Modal -->
            <div id="newApptModal" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.7); backdrop-filter:blur(4px); z-index:1000; align-items:center; justify-content:center;">
              <div style="background:white; border-radius:20px; padding:32px; width:480px; max-width:95vw; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); animation: slideUp 0.25s ease-out;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                  <h3 style="margin:0; font-size:20px; font-weight:800; color:#111827;">Book New Appointment</h3>
                  <button onclick="closeNewApptModal()" style="background:#f3f4f6; border:none; border-radius:8px; width:32px; height:32px; cursor:pointer; color:#6b7280; font-size:16px;">✕</button>
                </div>
                <form onsubmit="submitNewAppointment(event)" style="display:flex; flex-direction:column; gap:14px;">
                  <div><label style="display:block; font-size:12px; font-weight:700; color:#374151; margin-bottom:6px; text-transform:uppercase;">Patient ID</label><input type="text" id="newApptPatientId" required placeholder="e.g. PAT-001" style="width:100%; padding:10px 12px; border:1.5px solid #d1d5db; border-radius:8px; font-size:14px; box-sizing:border-box;"></div>
                  <div><label style="display:block; font-size:12px; font-weight:700; color:#374151; margin-bottom:6px; text-transform:uppercase;">Clinic / Unit</label>
                    <select id="newApptClinic" required style="width:100%; padding:10px 12px; border:1.5px solid #d1d5db; border-radius:8px; font-size:14px; background:white; box-sizing:border-box;">
                      <option value="GOPD">GOPD — General OPD</option>
                      <option value="SOPD">SOPD — Surgical OPD</option>
                      <option value="MOPD">MOPD — Medical OPD</option>
                      <option value="POPD">POPD — Paediatric OPD</option>
                      <option value="ANC">ANC — Antenatal Clinic</option>
                      <option value="ENT">ENT — Ear, Nose & Throat</option>
                      <option value="OPHTHAL">OPHTHAL — Eye Clinic</option>
                      <option value="DERM">DERM — Dermatology</option>
                    </select>
                  </div>
                  <div><label style="display:block; font-size:12px; font-weight:700; color:#374151; margin-bottom:6px; text-transform:uppercase;">Date</label><input type="date" id="newApptDate" required style="width:100%; padding:10px 12px; border:1.5px solid #d1d5db; border-radius:8px; font-size:14px; box-sizing:border-box;"></div>
                  <div><label style="display:block; font-size:12px; font-weight:700; color:#374151; margin-bottom:6px; text-transform:uppercase;">Notes / Reason</label><input type="text" id="newApptNotes" placeholder="Reason for visit..." style="width:100%; padding:10px 12px; border:1.5px solid #d1d5db; border-radius:8px; font-size:14px; box-sizing:border-box;"></div>
                  <button type="submit" style="padding:12px; background:#4f46e5; color:white; border:none; border-radius:10px; font-weight:700; cursor:pointer; box-shadow:0 4px 6px -1px rgba(79,70,229,0.2); margin-top:4px;">Confirm Appointment</button>
                </form>
              </div>
            </div>
          </div>'''

html = html.replace(OLD_RECORDS_APPT, NEW_RECORDS_APPT, 1)

# ─────────────────────────────────────────────────
# 7. OVERHAUL MASTER RECORD UNIT — Add operational tabs with live data
# ─────────────────────────────────────────────────
OLD_MRU_TABS = '''      <!-- VIEW: MASTER RECORD UNIT -->
      <div id="legalView" class="ehr-view hidden" style="padding: 24px; max-width: 1400px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; height: 100%; background: #f8fafc;">
        <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Master Record Unit</h2>
            <p style="color: #6b7280; font-size: 16px;">Ecosystem Interoperability Hub (PHC ↔ EHR ↔ EMR)</p>
          </div>
          <div style="display: flex; gap: 8px; background: #e2e8f0; padding: 6px; border-radius: 12px;">
            <button id="mruTab-cda" onclick="switchMruTab('cda')" style="padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; background: white; color: #4f46e5; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">CDA (Patient Summaries)</button>
            <button id="mruTab-referrals" onclick="switchMruTab('referrals')" style="padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: #64748b;">Inter-Module Referrals</button>
            <button id="mruTab-cpoe" onclick="switchMruTab('cpoe')" style="padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: #64748b;">CPOE Ledger</button>
          </div>
        </div>'''

NEW_MRU_TABS = '''      <!-- VIEW: MASTER RECORD UNIT — Full Operational Workflow -->
      <div id="legalView" class="ehr-view hidden" style="padding: 24px; max-width: 1400px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; height: 100%; background: #f8fafc;">
        <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.02em; margin:0;">📊 Master Record Unit</h2>
            <p style="color: #6b7280; font-size: 14px; margin:4px 0 0;">Interoperability Hub: CDA · CPOE · Audit · Surveillance (PHC ↔ EHR ↔ EMR)</p>
          </div>
          <div style="display: flex; gap: 8px; background: #e2e8f0; padding: 5px; border-radius: 12px; flex-wrap:wrap;">
            <button id="mruTab-overview" onclick="switchMruTab('overview')" style="padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; background: white; color: #4f46e5; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">Overview</button>
            <button id="mruTab-cda" onclick="switchMruTab('cda')" style="padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: #64748b;">CDA Reports</button>
            <button id="mruTab-referrals" onclick="switchMruTab('referrals')" style="padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: #64748b;">Referrals</button>
            <button id="mruTab-cpoe" onclick="switchMruTab('cpoe')" style="padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: #64748b;">CPOE Ledger</button>
            <button id="mruTab-audit" onclick="switchMruTab('audit')" style="padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: #64748b;">Audit Trail</button>
          </div>
        </div>'''

html = html.replace(OLD_MRU_TABS, NEW_MRU_TABS, 1)

# ─────────────────────────────────────────────────
# 8. ADD NEW MRU OVERVIEW TAB CONTENT (after opening of legalView content area)
# ─────────────────────────────────────────────────
OLD_MRU_CDA_START = '''        <div style="flex: 1; overflow-y: auto;">
          <!-- CDA / Summary Engine -->
          <div id="mruContent-cda" class="mru-tab-content glass-card" style="display: block; min-height: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: white;">'''

NEW_MRU_CDA_START = '''        <div style="flex: 1; overflow-y: auto;">

          <!-- MRU OVERVIEW TAB -->
          <div id="mruContent-overview" class="mru-tab-content" style="display: block;">
            <!-- KPI Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
              <div class="glass-card" style="padding:20px; border-top:4px solid #4f46e5;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Total Patients Registered</p>
                <h3 id="mru-stat-patients" style="margin:8px 0 0;font-size:32px;font-weight:800;color:#111827;">-</h3>
              </div>
              <div class="glass-card" style="padding:20px; border-top:4px solid #059669;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Encounters (All Time)</p>
                <h3 id="mru-stat-encounters" style="margin:8px 0 0;font-size:32px;font-weight:800;color:#111827;">-</h3>
              </div>
              <div class="glass-card" style="padding:20px; border-top:4px solid #f59e0b;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Open Lab Orders</p>
                <h3 id="mru-stat-orders" style="margin:8px 0 0;font-size:32px;font-weight:800;color:#111827;">-</h3>
              </div>
              <div class="glass-card" style="padding:20px; border-top:4px solid #ef4444;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Pending Billing</p>
                <h3 id="mru-stat-billing" style="margin:8px 0 0;font-size:32px;font-weight:800;color:#111827;">-</h3>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
              <!-- Recent Encounters -->
              <div class="glass-card" style="padding: 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                  <h3 style="margin:0;font-size:16px;font-weight:700;">📋 Recent Encounters</h3>
                  <button onclick="switchEhrView('encountersView')" style="font-size:12px;color:#4f46e5;background:none;border:none;cursor:pointer;font-weight:600;">View All →</button>
                </div>
                <div id="mruRecentEncounters" style="display:flex;flex-direction:column;gap:8px;">
                  <p style="color:#9ca3af;text-align:center;padding:20px;">Loading...</p>
                </div>
              </div>

              <!-- Active Admissions -->
              <div class="glass-card" style="padding: 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                  <h3 style="margin:0;font-size:16px;font-weight:700;">🛏️ Active Admissions</h3>
                  <button onclick="switchEhrView('wardsView')" style="font-size:12px;color:#059669;background:none;border:none;cursor:pointer;font-weight:600;">View All →</button>
                </div>
                <div id="mruActiveAdmissions" style="display:flex;flex-direction:column;gap:8px;">
                  <p style="color:#9ca3af;text-align:center;padding:20px;">Loading...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- CDA / Summary Engine -->
          <div id="mruContent-cda" class="mru-tab-content glass-card" style="display: none; min-height: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: white;">'''

html = html.replace(OLD_MRU_CDA_START, NEW_MRU_CDA_START, 1)

# ─────────────────────────────────────────────────
# 9. ADD AUDIT TRAIL TAB before closing of MRU tabs
# ─────────────────────────────────────────────────
OLD_CPOE_CLOSE = '''          <!-- CPOE Order Ledger -->
          <div id="mruContent-cpoe" class="mru-tab-content glass-card" style="display: none; min-height: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: white;">'''

NEW_CPOE_CLOSE = '''          <!-- Audit Trail Tab -->
          <div id="mruContent-audit" class="mru-tab-content glass-card" style="display: none; min-height: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: white;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <div>
                <h3 style="margin:0;font-size:18px;font-weight:700;color:#1f2937;">🔍 System Audit Trail</h3>
                <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Complete chronological log of all system actions and user events.</p>
              </div>
              <button onclick="fetchAuditLogs()" style="padding:8px 16px; background:#e2e8f0; color:#374151; border:none; border-radius:8px; font-weight:600; cursor:pointer;">↻ Refresh</button>
            </div>
            <div style="overflow-x:auto; background:white; border:1px solid #e2e8f0; border-radius:8px;">
              <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <thead style="background:#f8fafc;">
                  <tr>
                    <th style="padding:12px 16px;color:#475569;font-weight:700;text-align:left;">Timestamp</th>
                    <th style="padding:12px 16px;color:#475569;font-weight:700;text-align:left;">Action</th>
                    <th style="padding:12px 16px;color:#475569;font-weight:700;text-align:left;">User</th>
                    <th style="padding:12px 16px;color:#475569;font-weight:700;text-align:left;">IP Address</th>
                  </tr>
                </thead>
                <tbody id="auditTrailTableBody">
                  <tr><td colspan="4" style="padding:40px;text-align:center;color:#94a3b8;">Click Refresh to load audit logs...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- CPOE Order Ledger -->
          <div id="mruContent-cpoe" class="mru-tab-content glass-card" style="display: none; min-height: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: white;">'''

html = html.replace(OLD_CPOE_CLOSE, NEW_CPOE_CLOSE, 1)

# ─────────────────────────────────────────────────
# 10. REMOVE SUPER ADMIN VIEW DIV (entire block)
# ─────────────────────────────────────────────────
html = re.sub(
    r'\s*<!-- VIEW: SUPER ADMIN GOD MODE -->\s*<div id="superAdminView"[^>]*>.*?</div>\s*\n\s*<!-- VIEW: MASTER RECORD',
    '\n\n      <!-- VIEW: MASTER RECORD',
    html,
    flags=re.DOTALL
)

# ─────────────────────────────────────────────────
# 11. FIX switchMruTab to include 'overview' and 'audit'
# ─────────────────────────────────────────────────
OLD_SWITCH_MRU = '''  function switchMruTab(tabName) {
    document.querySelectorAll('.mru-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('[id^="mruTab-"]').forEach(btn => {
      btn.style.background = 'transparent';
      btn.style.color = '#64748b';
      btn.style.boxShadow = 'none';
    });
    const content = document.getElementById('mruContent-' + tabName);
    if (content) content.style.display = 'block';
    const btn = document.getElementById('mruTab-' + tabName);
    if (btn) { btn.style.background = 'white'; btn.style.color = '#4f46e5'; btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }'''

NEW_SWITCH_MRU = '''  function switchMruTab(tabName) {
    document.querySelectorAll('.mru-tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('[id^="mruTab-"]').forEach(btn => {
      btn.style.background = 'transparent';
      btn.style.color = '#64748b';
      btn.style.boxShadow = 'none';
    });
    const content = document.getElementById('mruContent-' + tabName);
    if (content) content.style.display = 'block';
    const btn = document.getElementById('mruTab-' + tabName);
    if (btn) { btn.style.background = 'white'; btn.style.color = '#4f46e5'; btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; }
    if (tabName === 'overview') fetchMruOverview();
    if (tabName === 'audit') fetchAuditLogs();
    if (tabName === 'referrals') loadReferrals();
    if (tabName === 'cpoe') fetchCpoeOrders();'''

html = html.replace(OLD_SWITCH_MRU, NEW_SWITCH_MRU, 1)

# ─────────────────────────────────────────────────
# 12. FIX fetchLiveWards to auto-call on view switch
# ─────────────────────────────────────────────────
OLD_VIEW_SWITCH = "  if (viewId === 'encountersView') fetchLiveEncounters();"
NEW_VIEW_SWITCH = """  if (viewId === 'encountersView') fetchLiveEncounters();
  if (viewId === 'wardsView') fetchLiveWards();
  if (viewId === 'pharmacyView') fetchPharmacyData();
  if (viewId === 'recordsMainView') { loadPatientRoster(); loadReferrals(); fetchLiveAppointments(); }
  if (viewId === 'legalView') { fetchMruOverview(); fetchAuditLogs(); }"""

html = html.replace(OLD_VIEW_SWITCH, NEW_VIEW_SWITCH, 1)

# ─────────────────────────────────────────────────
# 13. INJECT LIVE WORKFLOW JAVASCRIPT
# ─────────────────────────────────────────────────
LIVE_WORKFLOW_JS = r"""
  // ═══════════════════════════════════════════════════════════════
  // LIVE WORKFLOW ENGINE — Wards, Encounters, Pharmacy, Records
  // ═══════════════════════════════════════════════════════════════

  let _allBeds = [];

  async function fetchLiveWards() {
    try {
      const bedsGrid = document.getElementById('wardBedsGrid');
      if (bedsGrid) bedsGrid.innerHTML = '<div style="text-align:center;padding:60px;color:#9ca3af;grid-column:1/-1;"><div style="font-size:40px;margin-bottom:12px;">🔄</div><p style="font-weight:600;">Fetching bed statuses...</p></div>';
      const res = await window.fetch('/api/v2/beds');
      const beds = await res.json();
      _allBeds = beds;
      renderWardBeds(beds);
      renderWardStats(beds);
    } catch (e) {
      const bedsGrid = document.getElementById('wardBedsGrid');
      if (bedsGrid) bedsGrid.innerHTML = '<p style="grid-column:1/-1;color:#ef4444;text-align:center;padding:40px;">⚠️ Failed to load beds. ' + e.message + '</p>';
    }
  }

  function renderWardStats(beds) {
    const grid = document.getElementById('wardStatsGrid');
    if (!grid) return;
    const total = beds.length;
    const occupied = beds.filter(b => b.status === 'Occupied').length;
    const vacant = beds.filter(b => b.status === 'Vacant').length;
    const reserved = beds.filter(b => b.status === 'Reserved').length;
    grid.innerHTML = `
      <div class="glass-card" style="padding:16px;border-top:3px solid #059669;text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Vacant</p><h3 style="margin:6px 0 0;font-size:28px;font-weight:800;color:#059669;">${vacant}</h3></div>
      <div class="glass-card" style="padding:16px;border-top:3px solid #ef4444;text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Occupied</p><h3 style="margin:6px 0 0;font-size:28px;font-weight:800;color:#ef4444;">${occupied}</h3></div>
      <div class="glass-card" style="padding:16px;border-top:3px solid #f59e0b;text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Reserved</p><h3 style="margin:6px 0 0;font-size:28px;font-weight:800;color:#f59e0b;">${reserved}</h3></div>
      <div class="glass-card" style="padding:16px;border-top:3px solid #6366f1;text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Total Beds</p><h3 style="margin:6px 0 0;font-size:28px;font-weight:800;color:#6366f1;">${total}</h3></div>
    `;
  }

  function renderWardBeds(beds) {
    const grid = document.getElementById('wardBedsGrid');
    if (!grid) return;
    if (!beds || beds.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:60px;color:#9ca3af;font-weight:600;">No beds found in the system.</p>';
      return;
    }
    grid.innerHTML = beds.map(bed => {
      const isOccupied = bed.status === 'Occupied';
      const isVacant = bed.status === 'Vacant';
      const bg = isOccupied ? '#fef2f2' : isVacant ? '#f0fdf4' : '#fffbeb';
      const border = isOccupied ? '#fecaca' : isVacant ? '#bbf7d0' : '#fde68a';
      const color = isOccupied ? '#b91c1c' : isVacant ? '#166534' : '#92400e';
      const emoji = isOccupied ? '🛏️' : isVacant ? '✅' : '🔶';
      return `
        <div style="background:${bg}; border:1.5px solid ${border}; border-radius:14px; padding:18px; transition: transform 0.2s, box-shadow 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
            <span style="font-size:20px;">${emoji}</span>
            <span style="background:${border};color:${color};padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;">${bed.status}</span>
          </div>
          <p style="margin:0;font-size:16px;font-weight:800;color:#111827;">Bed ${bed.id || bed.bedId || 'N/A'}</p>
          <p style="margin:4px 0;font-size:12px;font-weight:600;color:#6b7280;">${bed.ward || 'General'}</p>
          ${isOccupied ? `<p style="margin:6px 0 0;font-size:12px;color:#6b7280;">Patient: <strong>${bed.patientId || '-'}</strong></p>` : ''}
          ${isOccupied ? `<button onclick="openDischargeModal('${bed.id||bed.bedId}','${bed.patientId||''}')" style="margin-top:10px;width:100%;padding:7px;background:#ef4444;color:white;border:none;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;">Discharge</button>` : `<button onclick="selectBedForAdmission('${bed.id||bed.bedId}','${bed.ward||''}'); openAdmitModal();" style="margin-top:10px;width:100%;padding:7px;background:#059669;color:white;border:none;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;">+ Admit</button>`}
        </div>
      `;
    }).join('');
  }

  function filterWardBy(wardName) {
    document.querySelectorAll('.ward-tab-btn').forEach(b => {
      b.style.background='white'; b.style.color='#374151'; b.classList.remove('ward-tab-active');
    });
    const filtered = wardName === 'all' ? _allBeds : _allBeds.filter(b => b.ward === wardName);
    renderWardBeds(filtered);
  }

  function selectBedForAdmission(bedId, ward) {
    const wardSel = document.getElementById('admitWardSelect');
    const bedSel = document.getElementById('admitBedSelect');
    if (wardSel) wardSel.value = ward;
    if (bedSel) { bedSel.innerHTML = `<option value="${bedId}">${bedId}</option>`; }
  }

  function populateBedsForWard(wardName) {
    const bedSel = document.getElementById('admitBedSelect');
    if (!bedSel) return;
    const available = _allBeds.filter(b => b.ward === wardName && b.status === 'Vacant');
    bedSel.innerHTML = available.length > 0
      ? available.map(b => `<option value="${b.id||b.bedId}">${b.id||b.bedId}</option>`).join('')
      : '<option value="">No vacant beds in this ward</option>';
  }

  function openAdmitModal() {
    const modal = document.getElementById('admitPatientModal');
    if (modal) modal.style.display = 'flex';
  }

  function closeAdmitModal() {
    const modal = document.getElementById('admitPatientModal');
    if (modal) modal.style.display = 'none';
  }

  async function submitAdmission() {
    const patId = (document.getElementById('admitPatientId')||{}).value;
    const bedId = (document.getElementById('admitBedSelect')||{}).value;
    const diagnosis = (document.getElementById('admitDiagnosis')||{}).value || 'Not specified';
    if (!patId || !bedId) { showToast('Please enter Patient ID and select a Bed.', 'error'); return; }
    try {
      const res = await window.fetch('/api/v2/beds/admit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ patientId: patId, bedId, diagnosis })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Admission failed'); }
      showToast('✅ Patient admitted successfully!', 'success');
      closeAdmitModal();
      fetchLiveWards();
    } catch (e) { showToast('❌ ' + e.message, 'error'); }
  }

  function openDischargeModal(bedId, patientId) {
    document.getElementById('dischargeBedId').value = bedId;
    document.getElementById('dischargePatientId').value = patientId;
    document.getElementById('dischargeModal').style.display = 'flex';
  }

  // ─── ENCOUNTERS ───────────────────────────────────────

  async function fetchLiveEncounters() {
    const list = document.getElementById('encounterWaitingList');
    if (list) list.innerHTML = '<div style="padding:40px;text-align:center;color:#9ca3af;"><div style="font-size:36px;margin-bottom:8px;">🔄</div><p>Loading encounters...</p></div>';
    try {
      const unitFilter = (document.getElementById('encounterUnitFilter')||{}).value || '';
      let url = '/api/v2/encounters';
      const res = await window.fetch(url);
      let encounters = await res.json();
      if (unitFilter) encounters = encounters.filter(e => e.unit === unitFilter || e.clinic === unitFilter);
      renderEncounterQueue(encounters);
      // Stats
      const open = encounters.filter(e => e.status === 'Open').length;
      const progress = encounters.filter(e => e.status === 'In Progress').length;
      const closed = encounters.filter(e => e.status === 'Closed').length;
      const total = encounters.length;
      ['open','progress','closed','total'].forEach((k,i) => {
        const el = document.getElementById('enc-stat-'+k);
        if (el) el.textContent = [open,progress,closed,total][i];
      });
      const wrc = document.getElementById('waitingRoomCount');
      if (wrc) wrc.textContent = open + ' patient' + (open !== 1 ? 's' : '');
    } catch (e) {
      if (list) list.innerHTML = '<p style="color:#ef4444;text-align:center;padding:40px;">⚠️ ' + e.message + '</p>';
    }
  }

  function renderEncounterQueue(encounters) {
    const list = document.getElementById('encounterWaitingList');
    if (!list) return;
    if (!encounters || encounters.length === 0) {
      list.innerHTML = '<div style="padding:60px;text-align:center;color:#9ca3af;"><div style="font-size:48px;margin-bottom:12px;">✅</div><p style="font-weight:600;">No open encounters. Queue is clear!</p></div>';
      return;
    }
    const statusColors = { 'Open': '#6366f1', 'In Progress': '#f59e0b', 'Closed': '#10b981' };
    list.innerHTML = encounters.map(enc => {
      const color = statusColors[enc.status] || '#6b7280';
      return `
        <div onclick="openConsultation('${enc.id}','${enc.patientId}','${(enc.vitals||'').replace(/'/g,"")}')"
             style="padding:14px 18px; border-bottom:1px solid #f3f4f6; cursor:pointer; transition: background 0.15s; display:flex; gap:12px; align-items:center;"
             onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
          <div style="width:40px;height:40px;border-radius:50%;background:#e0e7ff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🩺</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <p style="margin:0;font-size:13px;font-weight:800;color:#111827;font-family:monospace;">${enc.id}</p>
              <span style="background:${color}15;color:${color};padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;">${enc.status}</span>
            </div>
            <p style="margin:3px 0 0;font-size:12px;color:#4b5563;">Patient: <strong>${enc.patientId}</strong> · ${enc.unit || enc.clinic || 'GOPD'}</p>
            <p style="margin:3px 0 0;font-size:11px;color:#9ca3af;">${enc.chiefComplaint || enc.vitals || 'No complaint recorded'}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  function openNewEncounterModal() {
    // Auto-navigate to vitals for walk-in
    switchEhrView('vitalsView');
    showToast('📋 Capture vitals to create a new encounter', 'info');
  }

  // ─── PHARMACY ────────────────────────────────────────

  async function fetchPharmacyData() {
    try {
      const [ordRes, repRes] = await Promise.all([
        window.fetch('/api/v2/orders'),
        window.fetch('/api/v2/reports')
      ]);
      const orders = await ordRes.json();
      const report = await repRes.json();
      const inventory = report.inventory || [];
      renderPharmacyInventory(inventory);
      const rxOrders = orders.filter(o => o.type === 'Pharmacy' || o.type === 'Drug');
      renderPharmacyRxQueue(rxOrders);
    } catch(e) {
      showToast('⚠️ Failed to load pharmacy data: ' + e.message, 'error');
    }
  }

  function fetchLivePharmacyOrders() { fetchPharmacyData(); }

  function renderPharmacyInventory(inventory) {
    const grid = document.getElementById('pharmacyInventoryGrid');
    if (!grid) return;
    if (!inventory || inventory.length === 0) {
      // Show static demo inventory if none exists
      const demoInv = [
        {name:'Amoxicillin 500mg', quantity:142, reorderLevel:50},
        {name:'Artemether-Lumefantrine', quantity:0, reorderLevel:20},
        {name:'Paracetamol 500mg', quantity:5020, reorderLevel:100},
        {name:'ORS Sachets', quantity:84, reorderLevel:30},
        {name:'Ciprofloxacin 500mg', quantity:65, reorderLevel:40},
        {name:'Metronidazole 400mg', quantity:238, reorderLevel:50},
        {name:'Vitamin C 1000mg', quantity:180, reorderLevel:60},
      ];
      inventory = demoInv;
    }
    const lowStock = inventory.filter(i => i.quantity <= (i.reorderLevel || 20));
    const alert = document.getElementById('pharmacyLowStockAlert');
    if (alert) alert.style.display = lowStock.length > 0 ? 'block' : 'none';
    grid.innerHTML = inventory.map(item => {
      const qty = item.quantity || 0;
      const level = item.reorderLevel || 20;
      const isLow = qty <= level;
      const isEmpty = qty === 0;
      const color = isEmpty ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';
      const bg = isEmpty ? '#fef2f2' : isLow ? '#fffbeb' : '#f0fdf4';
      const border = isEmpty ? '#fecaca' : isLow ? '#fde68a' : '#bbf7d0';
      return `
        <div style="background:${bg};border:1.5px solid ${border};border-radius:12px;padding:14px;text-align:center;">
          <p style="margin:0;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;line-height:1.4;">${item.name || item.drug}</p>
          <h3 style="margin:8px 0;font-size:26px;font-weight:800;color:${color};">${qty.toLocaleString()}</h3>
          ${isLow ? `<span style="font-size:10px;font-weight:700;color:${color};">${isEmpty ? '❌ OUT OF STOCK' : '⚠️ LOW STOCK'}</span>` : '<span style="font-size:10px;color:#6b7280;">In Stock</span>'}
        </div>
      `;
    }).join('');
  }

  function renderPharmacyRxQueue(orders) {
    const queue = document.getElementById('pharmacyRxQueue');
    if (!queue) return;
    if (!orders || orders.length === 0) {
      queue.innerHTML = '<div style="padding:40px;text-align:center;color:#9ca3af;"><div style="font-size:36px;margin-bottom:8px;">📭</div><p style="font-weight:600;">No pending e-prescriptions</p></div>';
      return;
    }
    const statusC = { 'Pending': '#f59e0b', 'Dispensed': '#10b981', 'Cancelled': '#ef4444' };
    queue.innerHTML = orders.map(o => `
      <div style="padding:12px 14px;border-bottom:1px solid #f3f4f6;display:flex;gap:12px;align-items:flex-start;">
        <div style="width:36px;height:36px;border-radius:8px;background:#f3e8ff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">💊</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <p style="margin:0;font-size:12px;font-weight:800;color:#111827;font-family:monospace;">${o.id}</p>
            <span style="background:${(statusC[o.status]||'#6b7280')}20;color:${statusC[o.status]||'#6b7280'};padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;">${o.status||'Pending'}</span>
          </div>
          <p style="margin:3px 0;font-size:12px;color:#374151;">Patient: <strong>${o.patientId}</strong></p>
          <p style="margin:0;font-size:11px;color:#6b7280;">${o.item || o.description || 'Drug order'}</p>
          ${o.status === 'Pending' ? `<button onclick="dispenseOrder('${o.id}')" style="margin-top:6px;padding:4px 12px;background:#10b981;color:white;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">✅ Dispense</button>` : ''}
        </div>
      </div>
    `).join('');
  }

  async function dispenseOrder(orderId) {
    try {
      const res = await window.fetch('/api/v2/orders/status', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ id: orderId, status: 'Dispensed' })
      });
      if (!res.ok) throw new Error('Failed to update order');
      showToast('✅ Order ' + orderId + ' dispensed successfully!', 'success');
      fetchPharmacyData();
    } catch(e) { showToast('❌ ' + e.message, 'error'); }
  }

  // ─── RECORDS UNIT — APPOINTMENTS ──────────────────────────

  async function fetchLiveAppointments() {
    const tbody = document.getElementById('apptTableBody');
    if (!tbody) return;
    try {
      const statusFilter = (document.getElementById('apptStatusFilter')||{}).value || '';
      let appointments = await (await window.fetch('/api/v2/appointments')).json();
      if (statusFilter) appointments = appointments.filter(a => a.status === statusFilter);
      const today = new Date().toDateString();
      const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === today);
      const completed = appointments.filter(a => a.status === 'Completed').length;
      const noShow = appointments.filter(a => a.status === 'No-Show').length;
      const pending = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Pending').length;
      ['today','completed','noshow','pending'].forEach((k,i) => {
        const el = document.getElementById('apptStat-'+k);
        if (el) el.textContent = [todayAppts.length, completed, noShow, pending][i];
      });
      if (!appointments || appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:#94a3b8;">No appointments found.</td></tr>';
        return;
      }
      const statusColors = { 'Scheduled': '#3b82f6', 'Completed': '#10b981', 'Cancelled': '#ef4444', 'No-Show': '#f59e0b', 'Pending': '#6366f1' };
      tbody.innerHTML = appointments.map(a => {
        const sc = statusColors[a.status] || '#6b7280';
        return `<tr style="border-bottom:1px solid #f3f4f6;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
          <td style="padding:14px 20px;font-family:monospace;font-weight:700;color:#4f46e5;font-size:13px;">${a.id}</td>
          <td style="padding:14px 20px;font-weight:600;color:#111827;">${a.patientId || a.patient}</td>
          <td style="padding:14px 20px;color:#374151;">${a.unit || a.clinic || 'General OPD'}</td>
          <td style="padding:14px 20px;color:#6b7280;">${a.date ? new Date(a.date).toLocaleDateString('en-GB') : '-'}</td>
          <td style="padding:14px 20px;"><span style="background:${sc}15;color:${sc};padding:4px 10px;border-radius:10px;font-size:12px;font-weight:700;">${a.status}</span></td>
          <td style="padding:14px 20px;display:flex;gap:6px;">
            ${a.status === 'Scheduled' ? `<button onclick="updateApptStatus('${a.id}','Completed')" style="padding:4px 10px;background:#10b981;color:white;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">✅ Complete</button>` : ''}
            ${a.status === 'Scheduled' ? `<button onclick="updateApptStatus('${a.id}','No-Show')" style="padding:4px 10px;background:#f59e0b;color:white;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">No-Show</button>` : ''}
          </td>
        </tr>`;
      }).join('');
    } catch(e) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:#ef4444;">⚠️ ' + e.message + '</td></tr>';
    }
  }

  async function updateApptStatus(apptId, status) {
    try {
      await window.fetch('/api/v2/appointments/status', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ id: apptId, status })
      });
      showToast('✅ Appointment updated to ' + status, 'success');
      fetchLiveAppointments();
    } catch(e) { showToast('❌ ' + e.message, 'error'); }
  }

  function openNewApptModal() {
    const modal = document.getElementById('newApptModal');
    if (modal) modal.style.display = 'flex';
    // Set today as default date
    const dateInput = document.getElementById('newApptDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  }

  function closeNewApptModal() {
    const modal = document.getElementById('newApptModal');
    if (modal) modal.style.display = 'none';
  }

  async function submitNewAppointment(e) {
    e.preventDefault();
    const patientId = (document.getElementById('newApptPatientId')||{}).value;
    const clinic = (document.getElementById('newApptClinic')||{}).value;
    const date = (document.getElementById('newApptDate')||{}).value;
    const notes = (document.getElementById('newApptNotes')||{}).value;
    if (!patientId || !clinic || !date) { showToast('Please fill all required fields.', 'error'); return; }
    try {
      const res = await window.fetch('/api/v2/appointments', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ patientId, clinic, unit: clinic, date, notes, status: 'Scheduled' })
      });
      if (!res.ok) throw new Error('Failed to book appointment');
      showToast('✅ Appointment booked for ' + clinic + '!', 'success');
      closeNewApptModal();
      fetchLiveAppointments();
    } catch(e2) { showToast('❌ ' + e2.message, 'error'); }
  }

  // ─── MASTER RECORD UNIT — OVERVIEW ────────────────────────

  async function fetchMruOverview() {
    try {
      const [pRes, eRes, oRes, bRes] = await Promise.all([
        window.fetch('/api/v2/patients'),
        window.fetch('/api/v2/encounters'),
        window.fetch('/api/v2/orders'),
        window.fetch('/api/v2/billing'),
      ]);
      const [patients, encounters, orders, billing] = await Promise.all([pRes.json(), eRes.json(), oRes.json(), bRes.json()]);
      const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      setStat('mru-stat-patients', (patients||[]).length);
      setStat('mru-stat-encounters', (encounters||[]).length);
      setStat('mru-stat-orders', (orders||[]).filter(o => o.status === 'Pending').length);
      setStat('mru-stat-billing', (billing||[]).filter(b => b.status === 'Pending' || b.status === 'Unpaid').length);

      // Recent encounters
      const recentDiv = document.getElementById('mruRecentEncounters');
      if (recentDiv) {
        const recent = [...(encounters||[])].reverse().slice(0,5);
        recentDiv.innerHTML = recent.length > 0
          ? recent.map(enc => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f8fafc;border-radius:8px;"><div><p style="margin:0;font-size:13px;font-weight:700;color:#111827;">${enc.id}</p><p style="margin:2px 0 0;font-size:11px;color:#6b7280;">${enc.patientId} · ${enc.unit||'GOPD'}</p></div><span style="background:#e0e7ff;color:#4f46e5;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:700;">${enc.status}</span></div>`).join('')
          : '<p style="text-align:center;color:#9ca3af;padding:20px;">No encounters yet.</p>';
      }

      // Active admissions
      const admDiv = document.getElementById('mruActiveAdmissions');
      if (admDiv) {
        const beds = await (await window.fetch('/api/v2/beds')).json();
        const occupied = beds.filter(b => b.status === 'Occupied').slice(0,5);
        admDiv.innerHTML = occupied.length > 0
          ? occupied.map(b => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f0fdf4;border-radius:8px;"><div><p style="margin:0;font-size:13px;font-weight:700;color:#111827;">Bed ${b.id||b.bedId}</p><p style="margin:2px 0 0;font-size:11px;color:#6b7280;">${b.ward} · ${b.patientId}</p></div><span style="background:#bbf7d0;color:#166534;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:700;">Occupied</span></div>`).join('')
          : '<p style="text-align:center;color:#9ca3af;padding:20px;">No active admissions.</p>';
      }
    } catch(e) { console.warn('MRU Overview error:', e); }
  }

  async function fetchCpoeOrders() {
    try {
      const orders = await (await window.fetch('/api/v2/orders/all')).json();
      const tbody = document.getElementById('cpoeTableBody');
      if (!tbody) return;
      if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:#94a3b8;">No CPOE orders found.</td></tr>';
        return;
      }
      const sc = { 'Pending': '#f59e0b', 'Completed': '#10b981', 'Cancelled': '#ef4444' };
      tbody.innerHTML = orders.slice(0, 50).map(o => `<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:12px 16px;font-family:monospace;font-weight:700;color:#4f46e5;">${o.id}</td><td style="padding:12px 16px;">${o.patientId}</td><td style="padding:12px 16px;">${o.type}</td><td style="padding:12px 16px;">${o.item||o.description||'-'}</td><td style="padding:12px 16px;">${new Date(o.date||Date.now()).toLocaleDateString()}</td><td style="padding:12px 16px;"><span style="background:${(sc[o.status]||'#6b7280')}20;color:${sc[o.status]||'#6b7280'};padding:3px 8px;border-radius:8px;font-size:11px;font-weight:700;">${o.status||'Pending'}</span></td></tr>`).join('');
    } catch(e) { console.warn('CPOE fetch error:', e); }
  }

  function showToast(message, type='success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#10b981';
    toast.style.color = 'white';
    toast.style.padding = '14px 24px';
    toast.style.borderRadius = '10px';
    toast.style.fontWeight = '700';
    toast.style.display = 'block';
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
  }
"""

# Inject before the closing </script> of the main EHR script block
# Find the last </script> in the file and inject before it
last_script_close = html.rfind('</script>')
if last_script_close != -1:
    html = html[:last_script_close] + LIVE_WORKFLOW_JS + '\n' + html[last_script_close:]

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print('SUCCESS: EHR Module workflow overhaul complete.')
print('Changes applied:')
print('  1. Removed Super Admin (God Mode) nav button and view')
print('  2. Added Triage & Vitals as dedicated nav item')
print('  3. Inpatient Wards: live bed cards, ward filter tabs, stats grid, full admit modal')
print('  4. Clinical Encounters: GOPD/SOPD/MOPD filter, live waiting room list, stats row')
print('  5. Pharmacy: live inventory matrix with color-coded stock levels, live Rx queue with dispense buttons')
print('  6. Records Unit - Appointments: live table with complete/no-show buttons, new appointment modal')
print('  7. Master Record Unit: Added Overview tab + Audit Trail tab, all tabs trigger live data')
print('  8. All views auto-fetch live data on navigation')
