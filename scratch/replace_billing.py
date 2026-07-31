import re

filepath = r'C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr\public\command.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

billing_pattern = r'(<!-- VIEW: BILLING -->\s*<div id="billingView" class="ehr-view hidden"[\s\S]*?</div>\s*</div>\s*</div>)'

new_billing_ui = r"""<!-- VIEW: BILLING -->
      <div id="billingView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">💳 Billing & Claims</h2>
            <p style="color: #6b7280; font-size: 16px;">Patient invoices, NHIA / PLASCHEMA claims, and payment reconciliation</p>
          </div>
          <div style="display: flex; gap: 12px;">
            <button onclick="fetchLiveBilling()" style="padding: 10px 20px; background: #e5e7eb; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <span>↻</span> Refresh
            </button>
            <button onclick="openGenerateInvoiceModal()" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.2);">
              <span>+</span> Generate Invoice
            </button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-bottom: 32px;">
          <div class="glass-card" style="border-top: 4px solid #10b981;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600;">Today's Revenue</h3>
            <p style="font-size: 32px; font-weight: 800; color: #111827; margin: 8px 0;">₦36,563</p>
            <p style="font-size: 13px; color: #10b981; font-weight: 500;">14 payments today</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #ef4444;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600;">Outstanding</h3>
            <p style="font-size: 32px; font-weight: 800; color: #111827; margin: 8px 0;">₦0</p>
            <p style="font-size: 13px; color: #ef4444; font-weight: 500;">Unpaid invoices</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #f59e0b;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600;">Pending Claims</h3>
            <p style="font-size: 32px; font-weight: 800; color: #111827; margin: 8px 0;">0</p>
            <p style="font-size: 13px; color: #f59e0b; font-weight: 500;">NHIA / PLASCHEMA</p>
          </div>
          <div class="glass-card" style="border-top: 4px solid #3b82f6;">
            <h3 style="color: #6b7280; font-size: 14px; font-weight: 600;">Monthly Revenue</h3>
            <p style="font-size: 32px; font-weight: 800; color: #111827; margin: 8px 0;">₦0</p>
            <p style="font-size: 13px; color: #3b82f6; font-weight: 500;">This month</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 32px;">
          <!-- Coverage Breakdown -->
          <div class="glass-card">
            <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">📊 Insurance Coverage</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; font-weight: 600;"><span>PLASCHEMA</span><span>70%</span></div>
                <div style="width: 100%; background: #e5e7eb; border-radius: 4px; height: 8px;"><div style="width: 70%; background: #10b981; height: 100%; border-radius: 4px;"></div></div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; font-weight: 600;"><span>NHIA</span><span>60%</span></div>
                <div style="width: 100%; background: #e5e7eb; border-radius: 4px; height: 8px;"><div style="width: 60%; background: #3b82f6; height: 100%; border-radius: 4px;"></div></div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; font-weight: 600;"><span>BHCPF</span><span>90%</span></div>
                <div style="width: 100%; background: #e5e7eb; border-radius: 4px; height: 8px;"><div style="width: 90%; background: #f59e0b; height: 100%; border-radius: 4px;"></div></div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; font-weight: 600;"><span>Self-Pay</span><span>0%</span></div>
                <div style="width: 100%; background: #e5e7eb; border-radius: 4px; height: 8px;"><div style="width: 0%; background: #6b7280; height: 100%; border-radius: 4px;"></div></div>
              </div>
            </div>
          </div>
          
          <!-- Table Area -->
          <div class="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">
              <h3 style="font-size: 18px; font-weight: 700; color: #1f2937;">📄 Invoice & Claims Register</h3>
              <select style="padding: 6px 12px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px; background: white;">
                <option>All Status</option>
                <option>Unpaid</option>
                <option>Paid</option>
                <option>Claimed</option>
              </select>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                    <th style="padding: 12px 8px;">Invoice ID</th>
                    <th style="padding: 12px 8px;">Patient</th>
                    <th style="padding: 12px 8px;">Service</th>
                    <th style="padding: 12px 8px;">Amount</th>
                    <th style="padding: 12px 8px;">Insurance</th>
                    <th style="padding: 12px 8px;">Patient Owes</th>
                    <th style="padding: 12px 8px;">Status</th>
                    <th style="padding: 12px 8px;">Action</th>
                  </tr>
                </thead>
                <tbody id="liveBillingTableBody">
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 8px; font-family: monospace; color: #10b981; font-weight:bold;">INV-1001</td>
                    <td style="padding: 12px 8px; font-weight: 500;">Musa Ibrahim</td>
                    <td style="padding: 12px 8px;">Outpatient</td>
                    <td style="padding: 12px 8px;">₦1,000</td>
                    <td style="padding: 12px 8px; color: #6b7280;">PLASCHEMA (70%)</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: #ef4444;">₦300</td>
                    <td style="padding: 12px 8px;"><span style="background: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Unpaid</span></td>
                    <td style="padding: 12px 8px;"><button onclick="openRealInvoice('INV-1001')" style="padding: 4px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">Receive</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 8px; font-family: monospace; color: #10b981; font-weight:bold;">INV-1002</td>
                    <td style="padding: 12px 8px; font-weight: 500;">Ngozi Okafor</td>
                    <td style="padding: 12px 8px;">Laboratory</td>
                    <td style="padding: 12px 8px;">₦2,000</td>
                    <td style="padding: 12px 8px; color: #6b7280;">NHIA (60%)</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: #10b981;">₦800</td>
                    <td style="padding: 12px 8px;"><span style="background: #dcfce3; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Paid</span></td>
                    <td style="padding: 12px 8px;"><button onclick="openRealInvoice('INV-1002')" style="padding: 4px 10px; background: #e5e7eb; color: #374151; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">Receipt</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 8px; font-family: monospace; color: #10b981; font-weight:bold;">INV-1003</td>
                    <td style="padding: 12px 8px; font-weight: 500;">Tunde Bakare</td>
                    <td style="padding: 12px 8px;">Wards (5 days)</td>
                    <td style="padding: 12px 8px;">₦25,000</td>
                    <td style="padding: 12px 8px; color: #6b7280;">BHCPF (90%)</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: #f59e0b;">₦2,500</td>
                    <td style="padding: 12px 8px;"><span style="background: #fef3c7; color: #b45309; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Claimed</span></td>
                    <td style="padding: 12px 8px;"><button onclick="openRealInvoice('INV-1003')" style="padding: 4px 10px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">Claim</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 8px; font-family: monospace; color: #10b981; font-weight:bold;">INV-1004</td>
                    <td style="padding: 12px 8px; font-weight: 500;">Aisha Sule</td>
                    <td style="padding: 12px 8px;">Emergency</td>
                    <td style="padding: 12px 8px;">₦3,000</td>
                    <td style="padding: 12px 8px; color: #6b7280;">Self-Pay</td>
                    <td style="padding: 12px 8px; font-weight: 600; color: #ef4444;">₦3,000</td>
                    <td style="padding: 12px 8px;"><span style="background: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Unpaid</span></td>
                    <td style="padding: 12px 8px;"><button onclick="openRealInvoice('INV-1004')" style="padding: 4px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">Receive</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div id="billingErrorAlert" style="display:none; background: #fee2e2; color: #b91c1c; padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 14px; font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
              <span>⚠️ An unexpected error occurred.</span>
              <button onclick="document.getElementById('billingErrorAlert').style.display='none'" style="background:none; border:none; color:#b91c1c; cursor:pointer; font-size: 16px; font-weight: bold;">✕</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- INVOICE GENERATOR MODAL -->
      <div id="invoiceGeneratorModal" style="display:none; position: fixed; inset: 0; background: rgba(17,24,39,0.7); backdrop-filter: blur(4px); z-index: 1000; justify-content: center; align-items: center;">
        <div class="glass-card" style="width: 100%; max-width: 500px; padding: 32px; position: relative;">
          <button onclick="closeInvoiceModal()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 20px; color: #6b7280; cursor: pointer;">✕</button>
          <h2 style="font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 24px;">Generate New Invoice</h2>
          <form onsubmit="event.preventDefault(); submitNewInvoice();">
            <div style="margin-bottom: 16px;">
              <label style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Patient Name / ID</label>
              <input type="text" id="invPatient" required placeholder="e.g. PAT-9092" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Service Department</label>
              <select id="invService" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; box-sizing: border-box;">
                <option value="Outpatient">Outpatient Consultation</option>
                <option value="Laboratory">Laboratory Diagnostics</option>
                <option value="Pharmacy">Pharmacy Dispensation</option>
                <option value="Wards">Inpatient Wards</option>
              </select>
            </div>
            <div style="margin-bottom: 24px;">
              <label style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Total Amount (NGN)</label>
              <input type="number" id="invAmount" required placeholder="e.g. 5000" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; box-sizing: border-box;">
            </div>
            <button type="submit" style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Create Invoice</button>
          </form>
        </div>
      </div>
      
      <!-- REAL INVOICE (PAYMENT HANDSHAKE SIMULATION) -->
      <div id="realInvoiceView" class="ehr-view hidden" style="padding: 40px; max-width: 800px; margin: 0 auto; width: 100%;">
        <div class="glass-card" style="padding: 40px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed #e5e7eb; padding-bottom: 24px; margin-bottom: 24px;">
            <div>
              <h1 style="font-size: 36px; font-weight: 900; color: #111827; margin:0;">INVOICE</h1>
              <p id="riId" style="font-family: monospace; color: #6b7280; font-size: 16px; margin: 8px 0 0 0;">#INV-XXXX</p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin:0; color: #374151;">Plateau State Hospital</h3>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">123 Healthcare Ave, Jos.</p>
              <p id="riDate" style="margin: 4px 0; color: #6b7280; font-size: 14px;">Date: YYYY-MM-DD</p>
            </div>
          </div>
          
          <div style="margin-bottom: 32px;">
            <h4 style="margin:0 0 8px 0; color: #9ca3af; text-transform: uppercase; font-size: 12px;">Bill To:</h4>
            <p id="riPatient" style="margin:0; font-size: 18px; font-weight: 700; color: #1f2937;">Patient Name</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px 0; text-align: left; color: #6b7280;">Description</th>
                <th style="padding: 12px 0; text-align: right; color: #6b7280;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td id="riService" style="padding: 16px 0; font-weight: 500; color: #111827;">Service Name</td>
                <td id="riAmount" style="padding: 16px 0; text-align: right; font-weight: 600; font-size: 16px;">₦0</td>
              </tr>
            </tbody>
          </table>
          
          <div style="background: #f9fafb; padding: 24px; border-radius: 8px; text-align: center;">
            <p style="margin:0 0 16px 0; color: #6b7280;">Ready for payment via Bank Handshake API</p>
            <button onclick="simulatePayment()" id="payBtn" style="padding: 14px 32px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(59,130,246,0.2);">Initialize Live Payment 💳</button>
            <p id="payStatus" style="display:none; margin: 16px 0 0 0; color: #10b981; font-weight: 700;">✅ Payment Successful! Handshake completed.</p>
          </div>
          
          <div style="margin-top: 24px; text-align: center;">
            <button onclick="switchEhrView('billingView')" style="background: none; border: none; color: #6b7280; text-decoration: underline; cursor: pointer; font-weight: 500;">← Back to Billing Registry</button>
          </div>
        </div>
      </div>
"""

if re.search(billing_pattern, content):
    content = re.sub(billing_pattern, new_billing_ui, content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Billing replaced successfully.")
else:
    print("Could not find billing pattern.")
