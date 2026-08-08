const fs = require('fs');
const path = require('path');

const commandHtmlPath = path.join(__dirname, 'public', 'command.html');
let content = fs.readFileSync(commandHtmlPath, 'utf8');

const newViews = `
      <!-- PHC VIEW: Nutrition & Growth -->
      <div id="nutritionView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Nutrition & Growth (CMAM)</h2>
          <p style="color: #6b7280; font-size: 16px;">Community Management of Acute Malnutrition & Child Growth Monitoring.</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 32px;">
          <div class="glass-card" style="border-top: 4px solid #10b981;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase;">Normal MUAC (>12.5cm)</h3>
            <p style="font-size: 36px; font-weight: 800; color: #111827; margin: 8px 0;">142</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #f59e0b;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase;">MAM (11.5 - 12.5cm)</h3>
            <p style="font-size: 36px; font-weight: 800; color: #111827; margin: 8px 0;">34</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #ef4444;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase;">SAM (<11.5cm)</h3>
            <p style="font-size: 36px; font-weight: 800; color: #111827; margin: 8px 0;">12</p>
          </div>
        </div>
        
        <div class="glass-card">
          <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">New Nutrition Assessment</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div>
              <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">Patient ID / Name</label>
              <input type="text" class="form-input" placeholder="Search child...">
            </div>
            <div>
              <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">MUAC (cm)</label>
              <input type="number" class="form-input" placeholder="e.g. 11.2">
            </div>
            <div>
              <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">Weight (kg)</label>
              <input type="number" class="form-input" placeholder="e.g. 6.5">
            </div>
          </div>
          <div style="margin-top: 16px; display: flex; gap: 12px; align-items: center;">
            <input type="checkbox" id="edema" style="width:18px;height:18px;">
            <label for="edema" style="font-weight: 600; font-size: 14px;">Bilateral Pitting Edema Present</label>
          </div>
          <button style="margin-top: 24px; padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Save Assessment
          </button>
        </div>
      </div>

      <!-- PHC VIEW: Essential Drugs Dispensary -->
      <div id="dispensaryView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Essential Drugs</h2>
            <p style="color: #6b7280; font-size: 16px;">Primary Health Care EML Dispensary Operations.</p>
          </div>
          <button style="padding: 10px 20px; background: #111827; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            + Log Stock Receipt
          </button>
        </div>

        <div class="glass-card">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px 8px; color: #6b7280; font-size: 14px;">Patient</th>
                <th style="padding: 12px 8px; color: #6b7280; font-size: 14px;">Prescribed Drugs (EML)</th>
                <th style="padding: 12px 8px; color: #6b7280; font-size: 14px;">Prescriber</th>
                <th style="padding: 12px 8px; color: #6b7280; font-size: 14px;">Status</th>
                <th style="padding: 12px 8px; color: #6b7280; font-size: 14px;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px 8px; font-weight: 600;">Hauwa Musa</td>
                <td style="padding: 16px 8px;">Artemether/Lumefantrine 20/120mg x 6</td>
                <td style="padding: 16px 8px;">Dr. Adeyemi</td>
                <td style="padding: 16px 8px;"><span style="padding: 4px 8px; background: #fef3c7; color: #d97706; border-radius: 4px; font-size: 12px; font-weight: 700;">PENDING</span></td>
                <td style="padding: 16px 8px;"><button style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Dispense</button></td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px 8px; font-weight: 600;">Chinedu Okeke</td>
                <td style="padding: 16px 8px;">Amoxicillin 250mg susp. x 1 bottle</td>
                <td style="padding: 16px 8px;">Nurse Sarah</td>
                <td style="padding: 16px 8px;"><span style="padding: 4px 8px; background: #d1fae5; color: #059669; border-radius: 4px; font-size: 12px; font-weight: 700;">DISPENSED</span></td>
                <td style="padding: 16px 8px;"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PHC VIEW: Community Outreach -->
      <div id="outreachView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Community Outreach</h2>
            <p style="color: #6b7280; font-size: 16px;">Community Health Extension Worker (CHEW) Data Sync.</p>
          </div>
          <button style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Sync Offline Devices
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px;">
          <div class="glass-card">
            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">Log New Field Data</h3>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">Village/Settlement</label>
                <input type="text" class="form-input" placeholder="e.g. Sabon Gari">
              </div>
              <div>
                <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">Activity Type</label>
                <select class="form-input">
                  <option>House-to-House Immunization</option>
                  <option>Mosquito Net Distribution</option>
                  <option>Health Education Talk</option>
                  <option>WASH Assessment</option>
                </select>
              </div>
              <div>
                <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">Number of People Reached</label>
                <input type="number" class="form-input" placeholder="0">
              </div>
              <button style="padding: 12px 24px; background: #111827; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                Submit Field Report
              </button>
            </div>
          </div>
          
          <div class="glass-card">
            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">Recent Outreach Activities</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="margin: 0; font-size: 16px; color: #111827;">Polio Immunization Drive</h4>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Wadata Village | By: CHEW Ibrahim</p>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 18px; font-weight: 800; color: #3b82f6;">45</span>
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Children Reached</p>
                </div>
              </li>
              <li style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="margin: 0; font-size: 16px; color: #111827;">Bed Net Distribution</h4>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">North Ward | By: CHEW Amina</p>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 18px; font-weight: 800; color: #10b981;">120</span>
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Nets Distributed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
`;

if (!content.includes('id="nutritionView"')) {
    content = content.replace('    </main>', newViews + '\n    </main>');
    fs.writeFileSync(commandHtmlPath, content);
    console.log('Successfully injected new PHC views!');
} else {
    console.log('Views already exist.');
}
