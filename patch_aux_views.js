const fs = require('fs');
let c = fs.readFileSync('public/emr.html', 'utf8');

const missingViews = `      <!-- VIEW: Inpatient Wards -->
      <div id="wardsView" class="emr-view hidden" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
        <div style="background: white; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; padding: 64px; text-align: center; width: 100%; max-width: 600px;">
          <div style="background: #eff6ff; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #3b82f6;">
            <i data-lucide="bed" style="width: 40px; height: 40px;"></i>
          </div>
          <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Inpatient Wards</h2>
          <p style="color: #64748b; font-size: 16px; margin: 0 0 32px 0; line-height: 1.6;">The Wards Management module is currently being provisioned. Once online, you will be able to manage bed allocations, inpatient nursing logs, and ward rounds.</p>
          <button style="background: #3b82f6; color: white; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2); transition: all 0.2s;" onclick="alert('Module provisioning in progress')">Notify Me When Ready</button>
        </div>
      </div>

      <!-- VIEW: Pharmacy -->
      <div id="pharmacyView" class="emr-view hidden" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
        <div style="background: white; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; padding: 64px; text-align: center; width: 100%; max-width: 600px;">
          <div style="background: #f0fdf4; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #22c55e;">
            <i data-lucide="pill" style="width: 40px; height: 40px;"></i>
          </div>
          <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Central Pharmacy</h2>
          <p style="color: #64748b; font-size: 16px; margin: 0 0 32px 0; line-height: 1.6;">The Dispensary and Inventory Management module is undergoing final QA. This unit will handle automated prescription routing and stock alerts.</p>
          <button style="background: #22c55e; color: white; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.2); transition: all 0.2s;" onclick="alert('Module provisioning in progress')">Notify Me When Ready</button>
        </div>
      </div>

      <!-- VIEW: Laboratory -->
      <div id="labView" class="emr-view hidden" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
        <div style="background: white; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; padding: 64px; text-align: center; width: 100%; max-width: 600px;">
          <div style="background: #fdf2f8; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #ec4899;">
            <i data-lucide="flask-conical" style="width: 40px; height: 40px;"></i>
          </div>
          <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Laboratory Diagnostics</h2>
          <p style="color: #64748b; font-size: 16px; margin: 0 0 32px 0; line-height: 1.6;">The LIS (Laboratory Information System) integration is initializing. You will soon be able to process pathology requests and upload diagnostic reports here.</p>
          <button style="background: #ec4899; color: white; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(236, 72, 153, 0.2); transition: all 0.2s;" onclick="alert('Module provisioning in progress')">Notify Me When Ready</button>
        </div>
      </div>

      <!-- VIEW: Radiology -->
      <div id="radView" class="emr-view hidden" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
        <div style="background: white; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; padding: 64px; text-align: center; width: 100%; max-width: 600px;">
          <div style="background: #f3e8ff; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #a855f7;">
            <i data-lucide="radio" style="width: 40px; height: 40px;"></i>
          </div>
          <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Radiology & Imaging</h2>
          <p style="color: #64748b; font-size: 16px; margin: 0 0 32px 0; line-height: 1.6;">The RIS/PACS viewing gateway is currently being configured. X-Ray, MRI, and Ultrasound imaging queues will appear here once live.</p>
          <button style="background: #a855f7; color: white; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(168, 85, 247, 0.2); transition: all 0.2s;" onclick="alert('Module provisioning in progress')">Notify Me When Ready</button>
        </div>
      </div>

      <!-- VIEW: Billing -->
      <div id="billingView" class="emr-view hidden" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
        <div style="background: white; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; padding: 64px; text-align: center; width: 100%; max-width: 600px;">
          <div style="background: #fffbeb; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #f59e0b;">
            <i data-lucide="credit-card" style="width: 40px; height: 40px;"></i>
          </div>
          <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Finance & Billing</h2>
          <p style="color: #64748b; font-size: 16px; margin: 0 0 32px 0; line-height: 1.6;">The Revenue Cycle Management engine is currently offline. Invoice generation, HMO claims, and payment collections will be activated shortly.</p>
          <button style="background: #f59e0b; color: white; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2); transition: all 0.2s;" onclick="alert('Module provisioning in progress')">Notify Me When Ready</button>
        </div>
      </div>
`;

c = c.replace('<div id="appointmentRequestsView"', missingViews + '\n      <div id="appointmentRequestsView"');
fs.writeFileSync('public/emr.html', c);
console.log('Injected missing auxiliary views');
