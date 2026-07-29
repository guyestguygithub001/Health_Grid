import re

with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Wrap the entire body content in emrMainApp
body_start = html.find('<body')
body_close_angle = html.find('>', body_start) + 1

body_end = html.rfind('</body>')

# Extract everything between <body> and </body>
content = html[body_close_angle:body_end]

gateway_html = """
<div id="emrAuthGateway" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #f1f5f9; z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui, sans-serif;">
  <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 400px; max-width: 90%;">
    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center;">Clinical Staff Gateway</h2>
    <p style="margin: 0 0 24px; color: #64748b; font-size: 14px; text-align: center;">Authenticate to access the EMR module.</p>
    
    <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Active Context</p>
      <div id="gatewayRoleDisplay" style="width: 100%; font-weight: 700; font-size: 14px; color: #0f172a;">
        Not Authenticated
      </div>
    </div>

    <form id="staffLoginForm">
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; text-transform: uppercase;">Username</label>
        <input type="text" id="loginUser" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 15px; outline: none;">
      </div>
      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; text-transform: uppercase;">Password</label>
        <input type="password" id="loginPass" required style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 15px; outline: none;">
      </div>
      <div id="loginError" style="display: none; margin-bottom: 16px; padding: 10px; background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; border-radius: 8px; font-size: 13px; font-weight: 500;"></div>
      <button type="submit" style="width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 15px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2); margin-bottom: 16px;">Secure Login</button>
    </form>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
      <button onclick="document.getElementById('emrSignupModal').style.display='flex'" style="background: transparent; border: none; color: #10b981; font-weight: 700; font-size: 14px; cursor: pointer; text-decoration: underline;">Register New Staff</button>
    </div>
  </div>
</div>
"""

# Modify the script block to handle auth and RBAC
auth_logic = """
<script>
  // Auth and RBAC Logic
  const roleMappings = {
    'admin': ['omniBar', 'triageView', 'clinicsDashboardView', 'wardsView', 'pharmacyView', 'labView', 'radView', 'billingView', 'recordsMainView', 'postEncounterView', 'workspace'],
    'physician': ['omniBar', 'triageView', 'clinicsDashboardView', 'pharmacyView', 'labView', 'radView', 'recordsMainView', 'postEncounterView', 'workspace'],
    'nurse': ['omniBar', 'triageView', 'wardsView', 'pharmacyView', 'workspace'],
    'pharmacist': ['omniBar', 'pharmacyView', 'workspace']
  };

  function applyRbac(role) {
    const allowedViews = roleMappings[role] || [];
    
    // Hide all sidebar buttons first
    document.querySelectorAll('#emrSidebar .nav-btn').forEach(btn => {
      // Find what view this button switches to by looking at its onclick or data-target-view
      const onclickAttr = btn.getAttribute('onclick') || '';
      let targetViewMatch = onclickAttr.match(/switchEmrView\('([^']+)'\)/);
      if (targetViewMatch) {
        const viewId = targetViewMatch[1];
        if (!allowedViews.includes(viewId)) {
          btn.style.display = 'none';
        } else {
          btn.style.display = 'flex';
        }
      } else {
         // Things like "Exit to Admin" or others - keep them visible
         // Ensure they are visible if they were accidentally hidden
      }
    });

    // Auto-navigate to the first allowed view (usually omniBar)
    if (allowedViews.length > 0) {
      switchEmrView(allowedViews[0]);
    }
  }

  function checkSession() {
    const token = sessionStorage.getItem('staff_token');
    const role = sessionStorage.getItem('staff_role');
    const name = sessionStorage.getItem('staff_name');
    
    if (token && role) {
      document.getElementById('emrAuthGateway').style.display = 'none';
      document.getElementById('emrMainApp').style.display = 'flex';
      
      const roleNames = {
        'admin': 'System Admin (Full Access)',
        'physician': 'Physician (Clerking / Rx)',
        'nurse': 'Nurse (Triage / Wards)',
        'pharmacist': 'Pharmacist'
      };
      
      const roleText = (name ? name + " - " : "") + (roleNames[role] || role);
      document.getElementById('activeRoleDisplay').innerText = roleText;
      
      applyRbac(role);
    } else {
      document.getElementById('emrAuthGateway').style.display = 'flex';
      document.getElementById('emrMainApp').style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    
    const loginForm = document.getElementById('staffLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('loginUser').value;
        const p = document.getElementById('loginPass').value;
        const errDiv = document.getElementById('loginError');
        errDiv.style.display = 'none';
        
        try {
          const res = await fetch('/api/v2/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: u, password: p})
          });
          const data = await res.json();
          if (res.ok) {
            sessionStorage.setItem('staff_token', data.token);
            sessionStorage.setItem('staff_role', data.user.role);
            sessionStorage.setItem('staff_name', data.user.name);
            checkSession();
          } else {
            errDiv.style.display = 'block';
            errDiv.innerText = data.error || 'Login failed.';
          }
        } catch (err) {
          errDiv.style.display = 'block';
          errDiv.innerText = 'Network error.';
        }
      });
    }
  });

  function staffLogout() {
    sessionStorage.removeItem('staff_token');
    sessionStorage.removeItem('staff_role');
    sessionStorage.removeItem('staff_name');
    checkSession();
  }
</script>
"""

# Replace exit button with Logout button
content = content.replace(
    '''<button class="nav-btn" onclick="window.location.href='/command.html'" title="Exit to EHR Dashboard"><span>🚪</span><span class="nav-text">Exit to Admin</span></button>''',
    '''<button class="nav-btn" onclick="staffLogout()" title="Logout"><span>🚪</span><span class="nav-text">Logout</span></button>'''
)

new_html = html[:body_close_angle] + '\n' + gateway_html + '\n<div id="emrMainApp" style="display: none; height: 100vh; flex-direction: row; width: 100vw;">\n' + content + '\n</div>\n' + auth_logic + '\n</body>'

# Actually, the original structure had body { display: flex; }. 
# We wrapped it in a div with height 100vh, flex-direction row, which replicates the body flex behavior perfectly.

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
    print("Frontend gateway and RBAC logic injected successfully!")
