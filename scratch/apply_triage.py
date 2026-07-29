# triageView HTML replacement
import re

new_html = """      <div id="triageView" class="emr-view hidden" style="padding: 32px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">Triage & Vitals</h2>
            <p style="color: #64748b; font-size: 16px; margin-top: 4px;">Assess arriving patients, record vitals, and assign priority.</p>
          </div>
          <button style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; gap: 8px; align-items: center; box-shadow: 0 4px 6px rgba(15, 23, 42, 0.2);" onclick="document.getElementById('addTriagePatientModal').style.display='flex'">
            <span>+</span> Walk-in Patient
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 350px 1fr; gap: 24px; min-height: 600px;">
          <!-- Queue Pane -->
          <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="padding: 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; font-weight: 700; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between; align-items: center;">
              Waiting Queue
              <span style="background: #ef4444; color: white; border-radius: 999px; padding: 2px 8px; font-size: 12px;">3</span>
            </div>
            <div style="flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
              
              <!-- Patient Card 1 -->
              <div onclick="selectTriagePatient('PT-889', 'Musa Ibrahim', '45 yrs', 'Male')" class="triage-card" style="padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <div style="font-weight: 700; color: #0f172a; font-size: 15px;">Musa Ibrahim</div>
                  <div style="font-size: 12px; color: #64748b; font-weight: 600;">PT-889</div>
                </div>
                <div style="display: flex; gap: 12px; font-size: 13px; color: #475569; margin-bottom: 12px;">
                  <span>45 yrs</span><span>•</span><span>Male</span>
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #ef4444; display: flex; align-items: center; gap: 4px;">
                  <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#ef4444;"></span> Chest Pain
                </div>
              </div>

              <!-- Patient Card 2 -->
              <div onclick="selectTriagePatient('PT-902', 'Ngozi Okafor', '28 yrs', 'Female')" class="triage-card" style="padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <div style="font-weight: 700; color: #0f172a; font-size: 15px;">Ngozi Okafor</div>
                  <div style="font-size: 12px; color: #64748b; font-weight: 600;">PT-902</div>
                </div>
                <div style="display: flex; gap: 12px; font-size: 13px; color: #475569; margin-bottom: 12px;">
                  <span>28 yrs</span><span>•</span><span>Female</span>
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #f59e0b; display: flex; align-items: center; gap: 4px;">
                  <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#f59e0b;"></span> Fever, Nausea
                </div>
              </div>

              <!-- Patient Card 3 -->
              <div onclick="selectTriagePatient('PT-915', 'Tunde Bakare', '62 yrs', 'Male')" class="triage-card" style="padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <div style="font-weight: 700; color: #0f172a; font-size: 15px;">Tunde Bakare</div>
                  <div style="font-size: 12px; color: #64748b; font-weight: 600;">PT-915</div>
                </div>
                <div style="display: flex; gap: 12px; font-size: 13px; color: #475569; margin-bottom: 12px;">
                  <span>62 yrs</span><span>•</span><span>Male</span>
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #3b82f6; display: flex; align-items: center; gap: 4px;">
                  <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#3b82f6;"></span> Routine Checkup
                </div>
              </div>

            </div>
          </div>

          <!-- Assessment Pane -->
          <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div id="triageEmptyState" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">🩺</div>
              <h3 style="font-size: 20px; font-weight: 700; color: #334155; margin-bottom: 8px;">Select a Patient</h3>
              <p style="color: #64748b; font-size: 15px; max-width: 300px;">Choose a patient from the queue to record their vitals and assign clinical priority.</p>
            </div>

            <div id="triageFormContainer" style="display: none; flex: 1; flex-direction: column;">
              <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h3 id="triagePatientName" style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">-</h3>
                  <div id="triagePatientDetails" style="font-size: 14px; color: #64748b; font-weight: 500;">-</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Time Arrived</div>
                  <div style="font-size: 15px; font-weight: 600; color: #334155;">10:15 AM (15m ago)</div>
                </div>
              </div>

              <div style="padding: 24px; flex: 1; overflow-y: auto;">
                <form id="vitalsForm" onsubmit="submitVitals(event)">
                  <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <span style="background: #e0e7ff; color: #4f46e5; padding: 4px; border-radius: 6px;">📊</span> Standard Vitals
                  </h4>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
                    <div>
                      <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Blood Pressure (mmHg)</label>
                      <input type="text" placeholder="120/80" required style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none; transition: border-color 0.2s;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Heart Rate (bpm)</label>
                      <input type="number" placeholder="72" required style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Temperature (°C)</label>
                      <input type="number" step="0.1" placeholder="36.5" required style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">SpO2 (%)</label>
                      <input type="number" placeholder="98" required style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Weight (kg)</label>
                      <input type="number" step="0.1" placeholder="75" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Height (cm)</label>
                      <input type="number" placeholder="175" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none;" />
                    </div>
                  </div>

                  <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <span style="background: #fef3c7; color: #d97706; padding: 4px; border-radius: 6px;">⚠️</span> Triage Priority
                  </h4>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 32px;">
                    <label class="priority-radio" style="cursor: pointer;">
                      <input type="radio" name="priority" value="routine" style="display: none;" checked>
                      <div class="p-card" style="padding: 16px; border: 2px solid #3b82f6; border-radius: 12px; text-align: center; background: #eff6ff; color: #1e3a8a;">
                        <div style="font-weight: 800; font-size: 15px; margin-bottom: 4px;">Routine</div>
                        <div style="font-size: 12px; opacity: 0.8;">Normal Queue</div>
                      </div>
                    </label>
                    <label class="priority-radio" style="cursor: pointer;">
                      <input type="radio" name="priority" value="urgent" style="display: none;">
                      <div class="p-card" style="padding: 16px; border: 2px solid #e2e8f0; border-radius: 12px; text-align: center; color: #64748b;">
                        <div style="font-weight: 800; font-size: 15px; margin-bottom: 4px;">Urgent</div>
                        <div style="font-size: 12px; opacity: 0.8;">See within 1hr</div>
                      </div>
                    </label>
                    <label class="priority-radio" style="cursor: pointer;">
                      <input type="radio" name="priority" value="emergency" style="display: none;">
                      <div class="p-card" style="padding: 16px; border: 2px solid #e2e8f0; border-radius: 12px; text-align: center; color: #64748b;">
                        <div style="font-weight: 800; font-size: 15px; margin-bottom: 4px;">Emergency</div>
                        <div style="font-size: 12px; opacity: 0.8;">Immediate</div>
                      </div>
                    </label>
                  </div>

                  <div style="margin-bottom: 32px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Chief Complaint / Nurse Notes</label>
                    <textarea rows="3" placeholder="Brief description of patient condition..." style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; resize: vertical;"></textarea>
                  </div>

                  <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                    <button type="button" onclick="cancelTriage()" style="padding: 12px 24px; background: white; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 700; cursor: pointer;">Cancel</button>
                    <button type="submit" style="padding: 12px 32px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">Save Vitals & Dispatch</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <style>
          .triage-card:hover { border-color: #94a3b8 !important; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .priority-radio input:checked + .p-card { border-color: currentColor !important; }
          .priority-radio input[value="routine"]:checked + .p-card { background: #eff6ff !important; color: #1e3a8a !important; border-color: #3b82f6 !important; }
          .priority-radio input[value="urgent"]:checked + .p-card { background: #fffbeb !important; color: #92400e !important; border-color: #f59e0b !important; }
          .priority-radio input[value="emergency"]:checked + .p-card { background: #fef2f2 !important; color: #991b1b !important; border-color: #ef4444 !important; }
          .priority-radio input:not(:checked) + .p-card { background: white !important; color: #64748b !important; border-color: #e2e8f0 !important; }
        </style>
        
        <script>
          function selectTriagePatient(id, name, age, gender) {
            document.getElementById('triageEmptyState').style.display = 'none';
            document.getElementById('triageFormContainer').style.display = 'flex';
            document.getElementById('triagePatientName').innerText = name;
            document.getElementById('triagePatientDetails').innerText = `${id} • ${age} • ${gender}`;
            document.getElementById('vitalsForm').reset();
            
            // Reset priority UI
            document.querySelector('input[value="routine"]').checked = true;
          }
          
          function cancelTriage() {
            document.getElementById('triageFormContainer').style.display = 'none';
            document.getElementById('triageEmptyState').style.display = 'flex';
          }
          
          function submitVitals(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const ogText = btn.innerText;
            btn.innerText = 'Saving...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
              btn.innerText = 'Dispatched!';
              btn.style.background = '#3b82f6';
              setTimeout(() => {
                btn.innerText = ogText;
                btn.style.background = '#10b981';
                btn.style.opacity = '1';
                cancelTriage();
                alert('Vitals saved successfully. Patient moved to physician queue.');
              }, 1500);
            }, 800);
          }
        </script>
      </div>"""

with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the old triage view
old_triage = r'<div id="triageView" class="emr-view hidden" style="padding: 40px; max-width: 1000px; margin: 0 auto;">.*?</div>\n      </div>'
html = re.sub(old_triage, new_html, html, flags=re.DOTALL)

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(html)
