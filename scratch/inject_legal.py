import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    content = f.read()

legal_view_html = r"""
      <!-- VIEW: LEGAL REPOSITORY -->
      <div id="legalView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Document Repository</h2>
            <p style="color: #6b7280; font-size: 16px;">Legal agreements, policies, and terms.</p>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 250px 1fr; gap: 32px; align-items: start;">
          <div class="glass-card" style="padding: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #374151;">Documents</h3>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;" id="docMenuList">
              <li><button onclick="showLegalDoc('tos')" class="doc-menu-btn active" style="width:100%; text-align:left; padding:10px 12px; border:none; background:#e0f2fe; color:#0284c7; border-radius:8px; font-weight:600; cursor:pointer;">Terms of Service</button></li>
              <li><button onclick="showLegalDoc('privacy')" class="doc-menu-btn" style="width:100%; text-align:left; padding:10px 12px; border:none; background:transparent; color:#4b5563; border-radius:8px; font-weight:500; cursor:pointer;">Privacy Policy</button></li>
              <li><button onclick="showLegalDoc('dpa')" class="doc-menu-btn" style="width:100%; text-align:left; padding:10px 12px; border:none; background:transparent; color:#4b5563; border-radius:8px; font-weight:500; cursor:pointer;">Data Processing Agreement</button></li>
              <li><button onclick="showLegalDoc('refund')" class="doc-menu-btn" style="width:100%; text-align:left; padding:10px 12px; border:none; background:transparent; color:#4b5563; border-radius:8px; font-weight:500; cursor:pointer;">Refund Policy</button></li>
              <li><button onclick="showLegalDoc('msa')" class="doc-menu-btn" style="width:100%; text-align:left; padding:10px 12px; border:none; background:transparent; color:#4b5563; border-radius:8px; font-weight:500; cursor:pointer;">Master Service Agreement</button></li>
            </ul>
          </div>
          
          <div class="glass-card" style="padding: 32px; min-height: 500px;" id="docContentContainer">
            <!-- TOS -->
            <div id="doc-tos" class="legal-doc-content" style="display:block;">
              <h3 style="font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 24px;">Terms of Service</h3>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;"><strong>Last Updated: July 2026</strong></p>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">By accessing the Plateau State EHR platform, you agree to be bound by these Terms of Service. You agree to use the platform only for lawful medical, administrative, and clinical purposes.</p>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">Unauthorized access, data extraction, or abuse of the billing and claims APIs is strictly prohibited and will result in immediate termination of access and potential legal action under applicable laws.</p>
            </div>
            <!-- Privacy -->
            <div id="doc-privacy" class="legal-doc-content" style="display:none;">
              <h3 style="font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 24px;">Privacy Policy</h3>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">We take patient privacy and data security seriously. All Electronic Health Records (EHR) and Personal Health Information (PHI) are encrypted at rest and in transit.</p>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">We strictly adhere to local healthcare data regulations (e.g., NDPR) and ensure that only authorized personnel can access sensitive clinical and demographic data.</p>
            </div>
            <!-- DPA -->
            <div id="doc-dpa" class="legal-doc-content" style="display:none;">
              <h3 style="font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 24px;">Data Processing Agreement</h3>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">This Data Processing Agreement (DPA) supplements the Master Service Agreement. It defines the responsibilities of the data controller (the healthcare facility) and the data processor (the platform provider) regarding patient data.</p>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">The processor shall only process personal data on documented instructions from the controller, particularly regarding data transfers and data retention limits.</p>
            </div>
            <!-- Refund -->
            <div id="doc-refund" class="legal-doc-content" style="display:none;">
              <h3 style="font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 24px;">Refund Policy</h3>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">Due to the nature of medical services and claims processing, refunds for services rendered (e.g., Laboratory tests, Outpatient consultations) are generally not provided once the service is fulfilled.</p>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">In the event of a billing error or an overcharge identified during claims reconciliation, the surplus amount will be credited back to the patient's digital wallet or the respective insurance scheme within 7-14 business days.</p>
            </div>
            <!-- MSA -->
            <div id="doc-msa" class="legal-doc-content" style="display:none;">
              <h3 style="font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 24px;">Master Service Agreement</h3>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">This Master Service Agreement (MSA) outlines the comprehensive terms between the Ministry of Health and the software provider regarding the deployment and maintenance of the EHR system.</p>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">It includes SLAs for uptime (99.9%), support response times, continuous deployment protocols, and disaster recovery procedures.</p>
            </div>
          </div>
        </div>
      </div>
"""

js_code = r"""
    // ── Document Repository Logic
    function showLegalDoc(docId) {
      document.querySelectorAll('.legal-doc-content').forEach(el => el.style.display = 'none');
      document.getElementById('doc-' + docId).style.display = 'block';
      
      const btns = document.querySelectorAll('.doc-menu-btn');
      btns.forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = '#4b5563';
        btn.style.fontWeight = '500';
      });
      
      const activeBtn = event.currentTarget;
      activeBtn.style.background = '#e0f2fe';
      activeBtn.style.color = '#0284c7';
      activeBtn.style.fontWeight = '600';
    }
"""

nav_button = r"""
        <button class="nav-btn" data-roles="admin" onclick="switchEhrView('legalView')" title="Document Repository">
          <span class="nav-icon">📄</span><span class="nav-text">Document Repository</span>
        </button>
"""

# Replace in sidebar
if 'switchEhrView(\'billingView\')' in content:
    content = re.sub(r'(<button class="nav-btn" data-roles="admin" onclick="switchEhrView\(\'billingView\'\)"[^>]*>.*?<\/button>)', r'\1\n' + nav_button, content, flags=re.DOTALL)

# Inject view before </main>
if '</main>' in content:
    content = content.replace('</main>', legal_view_html + '\n</main>')

# Inject JS
if 'function switchEhrView(viewId)' in content:
    content = content.replace('function switchEhrView(viewId)', js_code + '\n    function switchEhrView(viewId)')

with open('public/command.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected Legal Document Repository")
