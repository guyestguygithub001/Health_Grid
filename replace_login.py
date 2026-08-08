import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the loginScreen div
start_idx = content.find('<div id="loginScreen"')
if start_idx == -1:
    print("Could not find <div id=\"loginScreen\"")
    exit(1)

# Find the end of it. We know it ends before `<div id="resetModal"` or `<div id="signupModal"`
end_idx = content.find('<div id="resetModal"', start_idx)
if end_idx == -1:
    end_idx = content.find('<div id="signupModal"', start_idx)

if end_idx == -1:
    print("Could not find end of loginScreen")
    exit(1)

new_login_screen = """  <div id="loginScreen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #f1f5f9; z-index: 999999; display: none; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui, sans-serif;">
    <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 400px; max-width: 90%;">
      <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center;">Clinical Staff Gateway</h2>
      <p style="margin: 0 0 24px; color: #64748b; font-size: 14px; text-align: center;">Authenticate to access the EHR & PHC modules.</p>
      
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
        <button onclick="document.getElementById('signupModal').style.display='flex'" style="background: transparent; border: none; color: #10b981; font-weight: 700; font-size: 14px; cursor: pointer; text-decoration: underline;">Register New Staff</button>
      </div>
    </div>
  </div>
"""

new_content = content[:start_idx] + new_login_screen + "\n  " + content[end_idx:]

with open('public/command.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully replaced loginScreen")
