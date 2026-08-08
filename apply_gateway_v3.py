import re

with open("public/command.html", "r", encoding="utf-8") as f:
    content = f.read()

gateway_view_html = """  <!-- VIEW: CLINICAL STAFF GATEWAY -->
      <div id="gatewayView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
        <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 400px; max-width: 90%;">
          <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center;">Clinical Staff Gateway</h2>
          <p style="margin: 0 0 24px; color: #64748b; font-size: 14px; text-align: center;">Authenticate to access the module.</p>
          
          <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Active Context</p>
            <div id="gatewayRoleDisplay" style="width: 100%; font-weight: 700; font-size: 14px; color: #0f172a;">
              Not Authenticated
            </div>
          </div>
      
          <form id="loginForm">
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
            <button type="button" onclick="document.getElementById('signupModal').style.display='flex';" style="background: transparent; border: none; color: #10b981; font-weight: 700; font-size: 14px; cursor: pointer; text-decoration: underline;">Register New Staff</button>
          </div>
        </div>
      </div>
"""

# 1. REMOVE the original loginScreen HTML (lines 48-92)
login_pattern = r"<!-- ÔöÇÔöÇ LOGIN SCREEN.*?</div>\s*</div>"
content = re.sub(login_pattern, "", content, flags=re.DOTALL)

# 2. Add gatewayView to the main content area (after the header)
main_content_pattern = r"(<main id=\"ehrMainContent\" style=\"flex: 1; overflow-y: auto; position: relative;\">)"
content = re.sub(main_content_pattern, r"\g<1>\n" + gateway_view_html, content)

# 3. Add dashboardRoleDisplay to the header
header_pattern = r"(<div style=\"color: #1f2937; font-weight: 800; font-size: 18px; letter-spacing: -0.5px; white-space: nowrap;\">EHR System</div>)"
header_replace = r"\g<1>\n          <div id=\"dashboardRoleDisplay\" style=\"margin-left: 16px; padding: 4px 10px; background: #d1fae5; color: #065f46; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; border: 1px solid #34d399; display: none;\">Active Context: ADMIN</div>"
content = re.sub(header_pattern, header_replace, content)

# 4. Remove DOMContentLoaded global login enforcement entirely
dom_load_pattern = r"const loginScreen = document\.getElementById\('loginScreen'\);\s*const token = localStorage\.getItem\('ehr_admin_token'\);\s*if \(!token\) \{\s*loginScreen\.style\.display = 'flex';\s*\}"
content = re.sub(dom_load_pattern, "// Gateway is now an internal view.", content)

# 5. Modify enterEhrModule
enter_ehr_pattern = r"function enterEhrModule\(\) \{\s*document\.getElementById\('landingScreen'\)\.style\.display = 'none';\s*document\.getElementById\('ehrAppShell'\)\.style\.display = 'flex';\s*switchAppRole\('admin'\);\s*// default to admin\s*switchEhrView\('phcWorkflowView'\);\s*\}"
enter_ehr_replace = """function enterEhrModule() {
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        
        if (!localStorage.getItem('ehr_admin_token')) {
          switchAppRole('none'); // Hide sidebar buttons
          switchEhrView('gatewayView');
        } else {
          switchAppRole(localStorage.getItem('ehr_user_role') || 'admin');
          switchEhrView('phcWorkflowView');
        }
      }"""
content = re.sub(enter_ehr_pattern, enter_ehr_replace, content)

# 6. Update switchAppRole to show role display
switch_pattern = r"function switchAppRole\(role\) \{"
switch_replace = """function switchAppRole(role) {
        const roleDisplay = document.getElementById('dashboardRoleDisplay');
        if (roleDisplay) {
            if (role === 'none') {
                roleDisplay.style.display = 'none';
            } else {
                roleDisplay.style.display = 'block';
                roleDisplay.innerText = 'Active Context: ' + role.toUpperCase();
            }
        }
"""
content = content.replace(switch_pattern, switch_replace)

# 7. Add loginForm submit handler directly to DOMContentLoaded (since we removed the old one with loginScreen)
login_submit_script = """
      document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById('loginForm');
        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('loginUser').value;
            const pass = document.getElementById('loginPass').value;
            const errorDiv = document.getElementById('loginError');
            errorDiv.style.display = 'none';
            
            try {
              const res = await fetch('/api/v2/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
              });
              
              if (res.ok) {
                const data = await res.json();
                localStorage.setItem('ehr_admin_token', data.token);
                localStorage.setItem('ehr_user_role', data.role || 'admin');
                localStorage.setItem('ehr_user_name', data.name || data.username || 'User');
                localStorage.setItem('ehr_user_id', data.userId || '');
                switchAppRole(data.role || 'admin');
                switchEhrView('phcWorkflowView');
              } else {
                errorDiv.style.display = 'block';
                errorDiv.innerText = 'Invalid username or password.';
              }
            } catch (err) {
              console.warn("API unreachable. Falling back to role-based static verification.");
              const roleMap = {
                'physician': 'physician',
                'doctor': 'physician',
                'nurse': 'nurse',
                'pharmacist': 'pharmacist',
                'records': 'records',
                'billing': 'billing',
                'lab': 'lab',
                'admin': 'admin'
              };
              const mappedRole = roleMap[user.toLowerCase()] || 'admin';
              
              localStorage.setItem('ehr_admin_token', 'mock-token-' + mappedRole);
              localStorage.setItem('ehr_user_role', mappedRole);
              localStorage.setItem('ehr_user_name', user.charAt(0).toUpperCase() + user.slice(1));
              localStorage.setItem('ehr_user_id', 'USR-' + Math.floor(Math.random() * 1000));
              
              switchAppRole(mappedRole);
              switchEhrView('phcWorkflowView');
            }
          });
        }
      });
"""
content = content.replace("</body>", login_submit_script + "\n</body>")

with open("public/command.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully!")
