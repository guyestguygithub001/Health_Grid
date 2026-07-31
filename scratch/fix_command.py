import os

filepath = r'C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr\public\command.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add EHR buttons to sidebar
old_nav_end = '''        <div class="nav-section-title">EHR SECTION</div>
        <button class="nav-btn" data-roles="admin physician" onclick="switchEhrView('epidemicView')" title="Epidemic Radar">
          <span class="nav-icon">🦠</span><span class="nav-text">Epidemic Radar</span>
        </button>
        <button class="nav-btn" data-roles="admin physician" onclick="switchEhrView('pharmacyView')" title="Pharmacy Hub">
          <span class="nav-icon">💊</span><span class="nav-text">Pharmacy Hub</span>
        </button>
        <button class="nav-btn" data-roles="admin nurse" onclick="switchEhrView('recordsMainView')" title="Records Unit">
            <span>📂</span><span class="nav-text">Records Unit</span>
        </button>

        

      </nav>'''

new_nav_end = '''        <div class="nav-section-title">EHR SECTION</div>
        <button class="nav-btn" data-roles="admin physician" onclick="switchEhrView('epidemicView')" title="Epidemic Radar">
          <span class="nav-icon">🦠</span><span class="nav-text">Epidemic Radar</span>
        </button>
        <button class="nav-btn" data-roles="admin physician" onclick="switchEhrView('pharmacyView')" title="Pharmacy Hub">
          <span class="nav-icon">💊</span><span class="nav-text">Pharmacy Hub</span>
        </button>
        <button class="nav-btn" data-roles="admin nurse" onclick="switchEhrView('recordsMainView')" title="Records Unit">
            <span>📂</span><span class="nav-text">Records Unit</span>
        </button>
        <div class="nav-section-title">HOSPITAL OVERSIGHT (EHR)</div>
        <button class="nav-btn" data-roles="admin physician nurse" onclick="switchEhrView('wardsView')" title="Inpatient Wards">
          <span class="nav-icon">🛏️</span><span class="nav-text">Inpatient Wards</span>
        </button>
        <button class="nav-btn" data-roles="admin physician nurse" onclick="switchEhrView('labsView')" title="Lab & Diagnostics">
          <span class="nav-icon">🧪</span><span class="nav-text">Lab & Diagnostics</span>
        </button>
        <button class="nav-btn" data-roles="admin" onclick="switchEhrView('billingView')" title="Billing & Claims">
          <span class="nav-icon">💳</span><span class="nav-text">Billing & Claims</span>
        </button>
      </nav>'''

if old_nav_end in content:
    content = content.replace(old_nav_end, new_nav_end)
else:
    print('Could not find sidebar injection point!')

# 2. Add EHR Views
old_views_end = '''      <!-- VIEW: PHC WORKFLOW -->'''

new_views = '''      <!-- VIEW: INPATIENT WARDS -->
      <div id="wardsView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Inpatient Wards</h2>
            <p style="color: #6b7280; font-size: 16px;">Live bed management and admission tracking.</p>
          </div>
          <button onclick="fetchLiveWards()" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            🔄 Refresh Beds
          </button>
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
      </div>

      <!-- VIEW: LABS -->
      <div id="labsView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Laboratory & Diagnostics</h2>
            <p style="color: #6b7280; font-size: 16px;">Regional laboratory result processing.</p>
          </div>
          <button onclick="fetchLiveLabs()" style="padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            🔄 Refresh Labs
          </button>
        </div>
        
        <div class="glass-card">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                  <th style="padding: 12px 8px;">Lab ID</th>
                  <th style="padding: 12px 8px;">Patient ID</th>
                  <th style="padding: 12px 8px;">Date</th>
                  <th style="padding: 12px 8px;">Critical Flag</th>
                </tr>
              </thead>
              <tbody id="liveLabsTableBody">
                <tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">Click refresh to fetch labs...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- VIEW: BILLING -->
      <div id="billingView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Billing & Claims</h2>
            <p style="color: #6b7280; font-size: 16px;">Financial reconciliation and NHIS claims processing.</p>
          </div>
          <button onclick="fetchLiveBilling()" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            🔄 Refresh Billing
          </button>
        </div>
        
        <div class="glass-card">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                  <th style="padding: 12px 8px;">Bill ID</th>
                  <th style="padding: 12px 8px;">Patient ID</th>
                  <th style="padding: 12px 8px;">Service</th>
                  <th style="padding: 12px 8px;">Amount (NGN)</th>
                  <th style="padding: 12px 8px;">Status</th>
                </tr>
              </thead>
              <tbody id="liveBillingTableBody">
                <tr><td colspan="5" style="padding: 20px; text-align: center; color: #9ca3af;">Click refresh to fetch billing records...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- VIEW: PHC WORKFLOW -->'''
if old_views_end in content:
    content = content.replace(old_views_end, new_views)
else:
    print('Could not find views injection point!')

# 3. Add JS Functions
js_injection = '''
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

    // Intercept switchEhrView again to auto-load these views
    const tertiarySwitch = switchEhrView;
    switchEhrView = function(viewId, isPopState = false) {
      tertiarySwitch(viewId, isPopState);
      if (viewId === 'wardsView') fetchLiveWards();
      if (viewId === 'labsView') fetchLiveLabs();
    };

    function startEHRApp() {'''

if '    function startEHRApp() {' in content:
    content = content.replace('    function startEHRApp() {', js_injection)
else:
    print('Could not find JS injection point!')

# 4. Modify landing slides and fade background
old_slides = '''    const landingSlides = [
      {
        time: 'Morning',
        icon: '☀️',
        greeting: 'Good Morning.',
        subGreeting: 'Start your shift with a clear overview of facility operations.',
        bg: 'assets/landing_bg/doctor_portrait_1_1784893334111.jpg'
      },
      {
        time: 'Afternoon',
        icon: '🏙️',
        greeting: 'Good Afternoon.',
        subGreeting: 'Track peak encounter volumes and outpatient workflows.',
        bg: 'assets/landing_bg/doctor_sketch_2_1784893342797.jpg'
      },
      {
        time: 'Evening',
        icon: '🌅',
        greeting: 'Good Evening.',
        subGreeting: 'Review daily clinical summaries and prepare for night handover.',
        bg: 'assets/landing_bg/doctor_portrait_3_1784893353199.jpg'
      },
      {
        time: 'Night',
        icon: '🌙',
        greeting: 'Good Night.',
        subGreeting: 'Emergency and critical care operations are active. Stay vigilant.',
        bg: 'assets/landing_bg/doctor_sketch_4_1784893362459.jpg'
      }
    ];'''

new_slides = '''    const landingSlides = [
      {
        time: 'Morning',
        icon: '☀️',
        greeting: 'Good Morning.',
        subGreeting: 'Start your shift with a clear overview of facility operations.',
        bg: 'assets/landing_bg/female_doctor_cartoon.jpg'
      },
      {
        time: 'Afternoon',
        icon: '🏙️',
        greeting: 'Good Afternoon.',
        subGreeting: 'Track peak encounter volumes and outpatient workflows.',
        bg: 'assets/landing_bg/female_nurse_cartoon.jpg'
      },
      {
        time: 'Evening',
        icon: '🌅',
        greeting: 'Good Evening.',
        subGreeting: 'Review daily clinical summaries and prepare for night handover.',
        bg: 'assets/landing_bg/female_doctor_cartoon.jpg'
      },
      {
        time: 'Night',
        icon: '🌙',
        greeting: 'Good Night.',
        subGreeting: 'Emergency and critical care operations are active. Stay vigilant.',
        bg: 'assets/landing_bg/female_nurse_cartoon.jpg'
      }
    ];'''
if old_slides in content:
    content = content.replace(old_slides, new_slides)
else:
    print('Could not find landingSlides array!')

# Fade the dynamic background
content = content.replace('opacity: 0.15;', 'opacity: 0.08;') # Fade further for more transparency

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
