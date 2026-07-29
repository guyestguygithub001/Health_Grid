import re
import os

with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace the "Active Context" select block with a rigid display and a Sign Up button.
old_context_block = """<p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Active Context</p>
            <select id="roleSelector" onchange="setEmrRole(this.value)" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; color: #0f172a; font-weight: 700; font-size: 13px; outline: none; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <option value="admin">System Admin (Full Access)</option>
                <option value="doctor">Physician</option>
                <option value="nurse">Nursing & Wards</option>
                <option value="pharmacy">Pharmacist</option>
                <option value="lab">Laboratory Tech</option>
                <option value="rad">Radiologist</option>
                <option value="billing">Billing Cashier</option>
                <option value="records">Records Officer</option>
            </select>"""

new_context_block = """<p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Active Context</p>
            <div id="activeRoleDisplay" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; color: #0f172a; font-weight: 700; font-size: 13px; margin-bottom: 8px;">
                Role Loading...
            </div>
            <button id="emrSignupBtn" onclick="document.getElementById('emrSignupModal').style.display='flex'" style="width: 100%; padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
                ➕ Register Staff
            </button>"""

if old_context_block in html:
    html = html.replace(old_context_block, new_context_block)
else:
    print("Could not find Active Context block")


# 2. Inject the Sign Up modal just before </body>
modal_html = """
  <!-- Clinical Staff Registration Modal (EMR) -->
  <div id="emrSignupModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.8); z-index:99999; justify-content:center; align-items:center; backdrop-filter:blur(5px);">
    <div style="background:white; padding:32px; border-radius:16px; width:400px; max-width:90%; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); position:relative;">
      <span onclick="document.getElementById('emrSignupModal').style.display='none'" style="position:absolute; top:16px; right:16px; font-size:24px; color:#94a3b8; cursor:pointer; font-weight:bold;">&times;</span>
      <h3 style="margin:0 0 8px; font-size:24px; font-weight:800; color:#1e293b; letter-spacing:-0.02em;">Register Clinical Staff</h3>
      <p style="margin:0 0 24px; color:#64748b; font-size:14px;">Create a new staff identity and assign clinical access levels.</p>
      
      <form id="emrSignupForm">
        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:6px; text-transform:uppercase;">Full Name</label>
          <input type="text" id="emrSignupName" required style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:15px; outline:none;" placeholder="Dr. John Doe">
        </div>
        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:6px; text-transform:uppercase;">Username</label>
          <input type="text" id="emrSignupUser" required style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:15px; outline:none;" placeholder="johndoe">
        </div>
        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:6px; text-transform:uppercase;">Password</label>
          <input type="password" id="emrSignupPass" required style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:15px; outline:none;" placeholder="••••••••">
        </div>
        <div style="margin-bottom:24px;">
          <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:6px; text-transform:uppercase;">Clinical Role</label>
          <select id="emrSignupRole" required style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:15px; outline:none; background:white;">
            <option value="physician">Physician (Clerking / Rx)</option>
            <option value="nurse">Nurse (Triage / Wards)</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="admin">System Admin</option>
          </select>
        </div>
        <div id="emrSignupError" style="display:none; margin-bottom:16px; padding:10px; background:#fef2f2; border:1px solid #fecaca; color:#ef4444; border-radius:8px; font-size:13px; font-weight:500;"></div>
        <button type="submit" style="width:100%; padding:12px; background:#2563eb; color:white; border:none; border-radius:8px; font-weight:700; font-size:15px; cursor:pointer; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);">Register Staff Member</button>
      </form>
    </div>
  </div>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById('emrSignupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('emrSignupUser').value;
        const pass = document.getElementById('emrSignupPass').value;
        const name = document.getElementById('emrSignupName').value;
        const role = document.getElementById('emrSignupRole').value;
        const errorDiv = document.getElementById('emrSignupError');
        errorDiv.style.display = 'none';
        
        try {
          const res = await fetch('/api/v2/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass, name: name, role: role })
          });
          
          if (res.ok) {
            alert('Staff registered successfully!');
            document.getElementById('emrSignupModal').style.display = 'none';
            document.getElementById('emrSignupForm').reset();
          } else {
            const data = await res.json();
            errorDiv.style.display = 'block';
            errorDiv.innerText = data.error || 'Registration failed.';
          }
        } catch (err) {
          errorDiv.style.display = 'block';
          errorDiv.innerText = 'Server unreachable.';
        }
      });
    });
  </script>
</body>
"""

if '<!-- Clinical Staff Registration Modal (EMR) -->' not in html:
    html = html.replace('</body>', modal_html)


# 3. Rewrite setEmrRole logic. 
# Right now, setEmrRole(role) is defined, but we want it to automatically run on load based on ehr_user_role.
# And we want the activeRoleDisplay to show the role name.
old_rbac = """    // --- ROLE BASED ACCESS CONTROL (RBAC) ---
    function setEmrRole(role) {
        const accessMap = {
            'admin': ['triageView', 'clinicsDashboardView', 'wardsView', 'pharmacyView', 'labView', 'radView', 'billingView', 'recordsMainView'],
            'doctor': ['clinicsDashboardView', 'wardsView'],
            'nurse': ['triageView', 'wardsView'],
            'pharmacy': ['pharmacyView'],
            'lab': ['labView'],
            'rad': ['radView'],
            'billing': ['billingView'],
            'records': ['recordsMainView']
        };

        const allowedViews = accessMap[role] || [];
        
        document.querySelectorAll('.nav-btn[data-target-view]').forEach(btn => {
            const target = btn.getAttribute('data-target-view');
            if (role === 'admin' || allowedViews.includes(target)) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
        
        // Force navigate to Omni-Bar to reset context and prevent access to hidden views
        switchEmrView('omniBar');
        showToast("Role context switched to " + role.toUpperCase());
    }"""

new_rbac = """    // --- ROLE BASED ACCESS CONTROL (RBAC) ---
    function setEmrRole(role) {
        const accessMap = {
            'admin': ['triageView', 'clinicsDashboardView', 'wardsView', 'pharmacyView', 'labView', 'radView', 'billingView', 'recordsMainView'],
            'physician': ['clinicsDashboardView', 'wardsView'],
            'doctor': ['clinicsDashboardView', 'wardsView'], // legacy support
            'nurse': ['triageView', 'wardsView'],
            'pharmacist': ['pharmacyView'],
            'pharmacy': ['pharmacyView'],
            'lab': ['labView'],
            'rad': ['radView'],
            'billing': ['billingView'],
            'records': ['recordsMainView']
        };

        const displayNames = {
            'admin': 'System Admin (Full Access)',
            'physician': 'Physician',
            'doctor': 'Physician',
            'nurse': 'Nursing & Wards',
            'pharmacist': 'Pharmacist',
            'pharmacy': 'Pharmacist',
            'lab': 'Laboratory Tech',
            'rad': 'Radiologist',
            'billing': 'Billing Cashier',
            'records': 'Records Officer'
        };

        const allowedViews = accessMap[role] || [];
        
        document.querySelectorAll('.nav-btn[data-target-view]').forEach(btn => {
            const target = btn.getAttribute('data-target-view');
            if (role === 'admin' || allowedViews.includes(target)) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
        
        const displayEl = document.getElementById('activeRoleDisplay');
        if (displayEl) {
            displayEl.innerText = displayNames[role] || role.toUpperCase();
        }

        const signupBtn = document.getElementById('emrSignupBtn');
        if (signupBtn) {
            signupBtn.style.display = role === 'admin' ? 'block' : 'none';
        }
        
        // Force navigate to Omni-Bar to reset context and prevent access to hidden views
        switchEmrView('omniBar');
        showToast("Logged in as " + (displayNames[role] || role.toUpperCase()));
    }"""

if old_rbac in html:
    html = html.replace(old_rbac, new_rbac)
else:
    print("Could not find old RBAC logic")
    
# Hook it into DOMContentLoaded
dom_loaded_hook = """document.addEventListener("DOMContentLoaded", () => {
      let token = sessionStorage.getItem("ehr_creds") || localStorage.getItem("ehr_admin_token");
      if (!token) {
        window.location.href = "command.html";
        return;
      }"""

new_dom_loaded_hook = dom_loaded_hook + """
      let userRole = localStorage.getItem('ehr_user_role') || 'admin';
      setTimeout(() => setEmrRole(userRole), 100);
"""

if dom_loaded_hook in html and "setTimeout(() => setEmrRole(userRole)" not in html:
    html = html.replace(dom_loaded_hook, new_dom_loaded_hook)
else:
    print("DOM loaded hook not found or already injected.")

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Finished rewriting RBAC and Signup UI in EMR.")
