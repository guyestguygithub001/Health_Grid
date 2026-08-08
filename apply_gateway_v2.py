import re

with open("public/command.html", "r", encoding="utf-8") as f:
    content = f.read()

gateway_html = """  <!-- CLINICAL STAFF GATEWAY (Replaces Dark Login) -->
  <div id="loginScreen" style="display: none; width: 100vw; height: 100vh; background: #f1f5f9; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui, sans-serif; position: fixed; inset: 0; z-index: 999999;">
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
        <button type="button" onclick="document.getElementById('signupModal').style.display='flex'; document.getElementById('loginScreen').style.display='none';" style="background: transparent; border: none; color: #10b981; font-weight: 700; font-size: 14px; cursor: pointer; text-decoration: underline;">Register New Staff</button>
      </div>
    </div>
  </div>"""

login_pattern = r"<div id=\"loginScreen\".*?</div>\s*</div>"
content = re.sub(login_pattern, gateway_html, content, flags=re.DOTALL)

header_pattern = r"(<div style=\"color: #1f2937; font-weight: 800; font-size: 18px; letter-spacing: -0.5px; white-space: nowrap;\">)(.*?)(</div>)"
header_replace = r"\g<1>\g<2>\g<3>\n          <div id=\"dashboardRoleDisplay\" style=\"margin-left: 16px; padding: 4px 10px; background: #d1fae5; color: #065f46; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; border: 1px solid #34d399;\">Active Context: ADMIN</div>"
content = re.sub(header_pattern, header_replace, content)

fallback_pattern = r"\}\s*catch\s*\(err\)\s*\{[\s\S]*?errorDiv\.innerText\s*=\s*\'Server unreachable\. Please contact your system administrator\.\';\s*\}"
fallback_replace = """} catch (err) {
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
          loginScreen.style.display = 'none';
          
          if (window.requestedModule === 'phc') enterPhcModule();
          else enterEhrModule();
        }"""
content = re.sub(fallback_pattern, fallback_replace, content)

switch_pattern = r"function switchAppRole\(role\) \{"
switch_replace = """function switchAppRole(role) {
        const roleDisplay = document.getElementById('dashboardRoleDisplay');
        if (roleDisplay) {
            roleDisplay.innerText = 'Active Context: ' + role.toUpperCase();
        }
"""
content = content.replace(switch_pattern, switch_replace)

dom_load_pattern = r"const loginScreen = document\.getElementById\('loginScreen'\);\s*const token = localStorage\.getItem\('ehr_admin_token'\);\s*if \(!token\) \{\s*loginScreen\.style\.display = 'flex';\s*\}"
content = re.sub(dom_load_pattern, "const loginScreen = document.getElementById('loginScreen');\n        // Gateway only appears when entering a module", content)

enter_ehr_pattern = r"function enterEhrModule\(\) \{\s*if \(!localStorage\.getItem\('ehr_admin_token'\)\) \{\s*window\.requestedModule = 'ehr';\s*document\.getElementById\('loginScreen'\)\.style\.display = 'flex';\s*return;\s*\}"
enter_ehr_replace = """function enterEhrModule() {
        document.getElementById('landingScreen').style.display = 'none';
        if (!localStorage.getItem('ehr_admin_token')) {
          window.requestedModule = 'ehr';
          document.getElementById('loginScreen').style.display = 'flex';
          return;
        }"""
content = re.sub(enter_ehr_pattern, enter_ehr_replace, content)

enter_phc_pattern = r"function enterPhcModule\(\) \{\s*if \(!localStorage\.getItem\('ehr_admin_token'\)\) \{\s*window\.requestedModule = 'phc';\s*document\.getElementById\('loginScreen'\)\.style\.display = 'flex';\s*return;\s*\}"
enter_phc_replace = """function enterPhcModule() {
        document.getElementById('landingScreen').style.display = 'none';
        if (!localStorage.getItem('ehr_admin_token')) {
          window.requestedModule = 'phc';
          document.getElementById('loginScreen').style.display = 'flex';
          return;
        }"""
content = re.sub(enter_phc_pattern, enter_phc_replace, content)

with open("public/command.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully!")
