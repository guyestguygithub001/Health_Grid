import re

with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Define the new Clinics Dashboard View HTML
new_clinics_view = """
      <!-- VIEW: Clinics Dashboard (Categorized Unified Workspace) -->
      <div id="clinicsDashboardView" class="emr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 8px; letter-spacing: -0.02em;">Unified Clinical Workspace</h2>
        <p id="clinicsSubtitle" style="color: #64748b; margin-bottom: 40px; font-size: 16px;">Select a department category to manage its waiting list and active encounters.</p>
        
        <!-- LEVEL 1: Categories Grid -->
        <div id="clinicsCategoriesGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
          
          <div onclick="showClinicCategory('cat_primary')" class="clinic-category-card">
            <div class="cat-icon" style="background: #eff6ff; color: #3b82f6;">🚨</div>
            <h3>Primary &amp; Emergency</h3>
            <p>GOPD, A&E, EPU, Amenity</p>
          </div>

          <div onclick="showClinicCategory('cat_surgical')" class="clinic-category-card">
            <div class="cat-icon" style="background: #fef2f2; color: #ef4444;">🔪</div>
            <h3>Surgical &amp; Procedures</h3>
            <p>Theater, Ortho, Endoscopy</p>
          </div>

          <div onclick="showClinicCategory('cat_specialist')" class="clinic-category-card">
            <div class="cat-icon" style="background: #fdf2f8; color: #ec4899;">🫀</div>
            <h3>Specialist Care</h3>
            <p>Cardiac, Renal, Oncology...</p>
          </div>

          <div onclick="showClinicCategory('cat_women')" class="clinic-category-card">
            <div class="cat-icon" style="background: #faf5ff; color: #a855f7;">🤰</div>
            <h3>Women &amp; Children</h3>
            <p>O&G, Antenatal, Pediatrics</p>
          </div>

          <div onclick="showClinicCategory('cat_mental')" class="clinic-category-card">
            <div class="cat-icon" style="background: #f0fdf4; color: #22c55e;">🧠</div>
            <h3>Mental &amp; Allied Health</h3>
            <p>Psychiatry, Physio, Nutrition</p>
          </div>

          <div onclick="showClinicCategory('cat_dental')" class="clinic-category-card">
            <div class="cat-icon" style="background: #f0f9ff; color: #0ea5e9;">🦷</div>
            <h3>Dental &amp; Head</h3>
            <p>Dentistry, Maxillofacial, Eye</p>
          </div>

        </div>

        <!-- LEVEL 2: Units Containers (Hidden by default) -->
        <div id="clinicsUnitsContainer" style="display: none;">
          <button onclick="showClinicsGrid()" style="background: transparent; border: none; color: #64748b; font-weight: 700; font-size: 14px; cursor: pointer; margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
            <span>←</span> Back to Categories
          </button>
          
          <!-- Category: Primary & Emergency -->
          <div id="cat_primary" class="clinic-category-units" style="display: none;">
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Primary &amp; Emergency Units</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              <button onclick="loadUnifiedWaitingList('GOPD')" class="clinic-btn">🩺 General Outpatient (GOPD)</button>
              <button onclick="loadUnifiedWaitingList('A &amp; E')" class="clinic-btn" style="border-left-color: #ef4444;">🚨 Accident &amp; Emergency</button>
              <button onclick="loadUnifiedWaitingList('EPU')" class="clinic-btn">🚑 Emergency Pediatric Unit (EPU)</button>
              <button onclick="loadUnifiedWaitingList('Amenity Clinic')" class="clinic-btn">⭐ Amenity Clinic</button>
            </div>
          </div>

          <!-- Category: Surgical & Theater -->
          <div id="cat_surgical" class="clinic-category-units" style="display: none;">
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Surgical &amp; Procedures Units</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              <button onclick="loadUnifiedWaitingList('Theater')" class="clinic-btn" style="border-left-color: #ef4444;">🔪 Theater (Surgery)</button>
              <button onclick="loadUnifiedWaitingList('Orthopaedics')" class="clinic-btn">🦴 Orthopaedics</button>
              <button onclick="loadUnifiedWaitingList('Endoscopy')" class="clinic-btn">🔍 Endoscopy</button>
              <button onclick="loadUnifiedWaitingList('Procedure')" class="clinic-btn">💉 General Procedures</button>
            </div>
          </div>

          <!-- Category: Specialist Care -->
          <div id="cat_specialist" class="clinic-category-units" style="display: none;">
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Specialist Care Units</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              <button onclick="loadUnifiedWaitingList('Cardiac Centre')" class="clinic-btn" style="border-left-color: #ec4899;">❤️ Cardiac Centre</button>
              <button onclick="loadUnifiedWaitingList('Cardiology')" class="clinic-btn" style="border-left-color: #ec4899;">🫀 Cardiology</button>
              <button onclick="loadUnifiedWaitingList('Urology')" class="clinic-btn">💧 Urology</button>
              <button onclick="loadUnifiedWaitingList('Renal')" class="clinic-btn">🩸 Renal</button>
              <button onclick="loadUnifiedWaitingList('Endocrinology')" class="clinic-btn">🧪 Endocrinology</button>
              <button onclick="loadUnifiedWaitingList('Dermatology')" class="clinic-btn">✋ Dermatology</button>
              <button onclick="loadUnifiedWaitingList('Oncology')" class="clinic-btn">🎗️ Oncology</button>
            </div>
          </div>

          <!-- Category: Women & Children -->
          <div id="cat_women" class="clinic-category-units" style="display: none;">
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Women &amp; Children Units</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              <button onclick="loadUnifiedWaitingList('O &amp; G')" class="clinic-btn" style="border-left-color: #a855f7;">🤰 Obstetrics &amp; Gynaecology</button>
              <button onclick="loadUnifiedWaitingList('Antenatal')" class="clinic-btn" style="border-left-color: #a855f7;">👶 Antenatal</button>
              <button onclick="loadUnifiedWaitingList('Post Natal')" class="clinic-btn" style="border-left-color: #a855f7;">🍼 Post Natal</button>
              <button onclick="loadUnifiedWaitingList('Pediatrics')" class="clinic-btn">🧸 Pediatrics</button>
              <button onclick="loadUnifiedWaitingList('Family Planning')" class="clinic-btn">👨‍👩‍👧 Family Planning</button>
            </div>
          </div>

          <!-- Category: Mental & Allied Health -->
          <div id="cat_mental" class="clinic-category-units" style="display: none;">
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Mental &amp; Allied Health Units</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              <button onclick="loadUnifiedWaitingList('Psychiatry')" class="clinic-btn">🧠 Psychiatry</button>
              <button onclick="loadUnifiedWaitingList('Psychology')" class="clinic-btn">🛋️ Psychology</button>
              <button onclick="loadUnifiedWaitingList('Physiotherapy')" class="clinic-btn">🏃 Physiotherapy</button>
              <button onclick="loadUnifiedWaitingList('Nutrition &amp; Dietetics')" class="clinic-btn">🥗 Nutrition &amp; Dietetics</button>
            </div>
          </div>

          <!-- Category: Dental & ENT -->
          <div id="cat_dental" class="clinic-category-units" style="display: none;">
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Dental &amp; Head Units</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              <button onclick="loadUnifiedWaitingList('Dentistry')" class="clinic-btn" style="border-left-color: #0ea5e9;">🦷 Dentistry</button>
              <button onclick="loadUnifiedWaitingList('Maxillofacial')" class="clinic-btn" style="border-left-color: #0ea5e9;">💀 Maxillofacial</button>
              <button onclick="loadUnifiedWaitingList('Dental Therapy')" class="clinic-btn" style="border-left-color: #0ea5e9;">🪥 Dental Therapy</button>
              <button onclick="loadUnifiedWaitingList('E.N.T.')" class="clinic-btn">👂 E.N.T. Clinic</button>
              <button onclick="loadUnifiedWaitingList('Eye Clinic')" class="clinic-btn">👁️ Eye Clinic</button>
            </div>
          </div>

        </div>

        <style>
          .clinic-category-card { background: white; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .clinic-category-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #cbd5e1; }
          .clinic-category-card .cat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
          .clinic-category-card h3 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
          .clinic-category-card p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
          
          .clinic-btn { background: white; border: 1px solid #e2e8f0; border-left: 4px solid #0B5E7E; padding: 16px 20px; border-radius: 8px; font-size: 15px; font-weight: 600; color: #1e293b; text-align: left; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
          .clinic-btn:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: #cbd5e1; }
        </style>
        
        <script>
          function showClinicCategory(catId) {
            document.getElementById('clinicsCategoriesGrid').style.display = 'none';
            document.getElementById('clinicsUnitsContainer').style.display = 'block';
            
            // Hide all
            document.querySelectorAll('.clinic-category-units').forEach(el => el.style.display = 'none');
            
            // Show selected
            document.getElementById(catId).style.display = 'block';
            document.getElementById('clinicsSubtitle').style.display = 'none';
          }
          
          function showClinicsGrid() {
            document.getElementById('clinicsCategoriesGrid').style.display = 'grid';
            document.getElementById('clinicsUnitsContainer').style.display = 'none';
            document.getElementById('clinicsSubtitle').style.display = 'block';
          }
        </script>
      </div>
"""

start_idx = html.find('<div id="clinicsDashboardView"')
end_idx = html.find('<!-- VIEW 2: Clinical Workspace -->')

if start_idx != -1 and end_idx != -1:
    new_html = html[:start_idx] + new_clinics_view + html[end_idx:]
    with open('public/emr.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("Clinics Dashboard View successfully rewritten!")
else:
    print("Could not find the exact markers.")

