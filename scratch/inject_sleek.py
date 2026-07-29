with open('public/admin.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find bounds
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '<!-- VIEW: LEGAL MATRIX -->' in line:
        start_idx = i
    if '</main>' in line and start_idx != -1:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    del lines[start_idx:end_idx]

# Now, we define our 4 new ultra-sleek workflows.
new_views = """
      <!-- VIEW: LEGAL MATRIX (SLEEK) -->
      <div id="legalView" class="ehr-view hidden" style="padding: 48px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 36px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">Legal & Compliance</h2>
            <p style="color: #64748b; font-size: 18px; margin-top: 8px;">Active consent forms and audit logs</p>
          </div>
          <button style="padding: 12px 24px; background: #0f172a; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">+ New Consent</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
          <!-- Consent Forms -->
          <div style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 24px;">Active Consents</h3>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="padding: 16px; background: #f8fafc; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; color: #0f172a;">Surgery Consent (PT-889)</div>
                  <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Signed by Patient ┬À 2h ago</div>
                </div>
                <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">Valid</span>
              </div>
              <div style="padding: 16px; background: #f8fafc; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; color: #0f172a;">Data Sharing Auth (PT-102)</div>
                  <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Pending Guardian Signature</div>
                </div>
                <span style="background: #fef9c3; color: #854d0e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">Pending</span>
              </div>
            </div>
          </div>
          <!-- Audit Log -->
          <div style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 24px;">Security Audit Log</h3>
            <div id="legalAuditList" style="display: flex; flex-direction: column; gap: 16px;">
              <!-- Dynamically populated -->
              <div style="text-align: center; color: #94a3b8; padding: 20px;">Fetching secure logs...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW: INPATIENT WARDS (SLEEK) -->
      <div id="wardsView" class="ehr-view hidden" style="padding: 48px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 36px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">Inpatient Wards</h2>
          <p style="color: #64748b; font-size: 18px; margin-top: 8px;">Live bed management and allocations</p>
        </div>
        
        <!-- Stats Row -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px;">
          <div style="background: white; border-radius: 24px; padding: 32px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
            <div style="color: #64748b; font-weight: 600; margin-bottom: 8px;">Total Beds</div>
            <div id="wardStatTotal" style="font-size: 48px; font-weight: 800; color: #0f172a; letter-spacing: -0.04em;">-</div>
          </div>
          <div style="background: white; border-radius: 24px; padding: 32px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
            <div style="color: #64748b; font-weight: 600; margin-bottom: 8px;">Occupied</div>
            <div id="wardStatOccupied" style="font-size: 48px; font-weight: 800; color: #e11d48; letter-spacing: -0.04em;">-</div>
          </div>
          <div style="background: white; border-radius: 24px; padding: 32px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
            <div style="color: #64748b; font-weight: 600; margin-bottom: 8px;">Available</div>
            <div id="wardStatAvailable" style="font-size: 48px; font-weight: 800; color: #10b981; letter-spacing: -0.04em;">-</div>
          </div>
        </div>

        <!-- Bed Grid -->
        <div id="liveWardsGrid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
          <div style="grid-column: span 4; text-align: center; color: #94a3b8; padding: 40px;">Syncing live bed states...</div>
        </div>
      </div>

      <!-- VIEW: LABS (SLEEK) -->
      <div id="labsView" class="ehr-view hidden" style="padding: 48px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 36px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">Lab & Diagnostics</h2>
          <p style="color: #64748b; font-size: 18px; margin-top: 8px;">Pending orders and recent results</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
          <!-- Pending Requests -->
          <div style="background: white; border-radius: 24px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.04);">
            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 24px; display: flex; justify-content: space-between;">
              Pending Requests <span style="background: #fee2e2; color: #b91c1c; padding: 2px 10px; border-radius: 12px; font-size: 14px;">3</span>
            </h3>
            <div id="labsPendingList" style="display: flex; flex-direction: column; gap: 16px;">
              <div style="padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 18px;">Full Blood Count (FBC)</div>
                    <div style="color: #64748b; font-size: 14px; margin-top: 4px;">PT-901 ┬À Stat Priority</div>
                  </div>
                </div>
                <button style="width: 100%; padding: 12px; background: #eff6ff; color: #2563eb; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;">Process Sample</button>
              </div>
            </div>
          </div>
          
          <!-- Recent Results -->
          <div style="background: white; border-radius: 24px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.04);">
            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 24px;">Recent Results</h3>
            <div id="labsResultsList" style="display: flex; flex-direction: column; gap: 16px;">
              <div style="padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px;">
                <div style="font-weight: 700; color: #0f172a; font-size: 18px;">Malaria RDT</div>
                <div style="color: #64748b; font-size: 14px; margin-top: 4px;">PT-404 ┬À Completed 1h ago</div>
                <div style="margin-top: 16px; display: inline-block; background: #fef2f2; color: #dc2626; padding: 6px 16px; border-radius: 8px; font-weight: 700;">Result: POSITIVE +</div>
              </div>
              <div style="padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px;">
                <div style="font-weight: 700; color: #0f172a; font-size: 18px;">Lipid Panel</div>
                <div style="color: #64748b; font-size: 14px; margin-top: 4px;">PT-112 ┬À Completed 3h ago</div>
                <div style="margin-top: 16px; display: inline-block; background: #ecfdf5; color: #059669; padding: 6px 16px; border-radius: 8px; font-weight: 700;">Result: NORMAL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW: BILLING (SLEEK) -->
      <div id="billingView" class="ehr-view hidden" style="padding: 48px; max-width: 1000px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 40px; text-align: center;">
          <h2 style="font-size: 20px; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Outstanding Revenue</h2>
          <div id="billingTotalRev" style="font-size: 64px; font-weight: 800; color: #0f172a; letter-spacing: -0.04em; margin-top: 8px;">\u20A60.00</div>
        </div>

        <div style="background: white; border-radius: 24px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b;">Unpaid Invoices</h3>
            <button style="padding: 8px 16px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Export CSV</button>
          </div>
          <div id="billingInvoiceList" style="display: flex; flex-direction: column; gap: 12px;">
            <div style="text-align: center; color: #94a3b8; padding: 20px;">Fetching financial data...</div>
          </div>
        </div>
      </div>
"""

# Insert the new views right before the closing main tag
for i, line in enumerate(lines):
    if '</main>' in line:
        lines.insert(i, new_views + '\n')
        break

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Injected ultra-sleek views.")
