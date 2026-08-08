import re

with open("public/command.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the buttons
old_buttons = r"""<div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">\s*<button onclick="enterEhrModule\(\)" class="module-btn" style="background:#fff; color:#1e3a8a; border:none; padding:16px 36px; font-weight:700; border-radius:50px; cursor:pointer; font-size:16px; box-shadow: 0 8px 30px rgba\(0,0,0,0\.2\);">EHR / PHC Module</button>\s*<button onclick="window\.location\.href='/emr\.html'" class="module-btn" style="background:rgba\(255,255,255,0\.12\); border:1px solid rgba\(255,255,255,0\.4\); color:#fff; padding:16px 36px; font-weight:600; border-radius:50px; cursor:pointer; font-size:16px; backdrop-filter: blur\(8px\);">🖥️ EMR Module</button>\s*</div>"""

new_buttons = """<div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <button onclick="enterEhrModule()" class="module-btn" style="background:#fff; color:#1e3a8a; border:none; padding:16px 36px; font-weight:700; border-radius:50px; cursor:pointer; font-size:16px; box-shadow: 0 8px 30px rgba(0,0,0,0.2);">EHR Module</button>
        <button onclick="enterPhcModule()" class="module-btn" style="background:#fff; color:#059669; border:none; padding:16px 36px; font-weight:700; border-radius:50px; cursor:pointer; font-size:16px; box-shadow: 0 8px 30px rgba(0,0,0,0.2);">PHC Module</button>
        <button onclick="window.location.href='/emr.html'" class="module-btn" style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.4); color:#fff; padding:16px 36px; font-weight:600; border-radius:50px; cursor:pointer; font-size:16px; backdrop-filter: blur(8px);">🖥️ EMR Module</button>
      </div>"""

content = re.sub(old_buttons, new_buttons, content)

# Add enterPhcModule function
old_enter_ehr = r"""function enterEhrModule\(\) \{\s*document\.getElementById\('landingScreen'\)\.style\.display = 'none';\s*document\.getElementById\('ehrAppShell'\)\.style\.display = 'flex';\s*switchAppRole\('admin'\);\s*// default to admin\s*switchEhrView\('phcWorkflowView'\);\s*\}"""

new_enter_functions = """function enterEhrModule() {
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        switchAppRole('admin'); 
        switchEhrView('mpiView');
      }
      
      function enterPhcModule() {
        document.getElementById('landingScreen').style.display = 'none';
        document.getElementById('ehrAppShell').style.display = 'flex';
        switchAppRole('admin'); 
        switchEhrView('phcWorkflowView');
      }"""

content = re.sub(old_enter_ehr, new_enter_functions, content)

with open("public/command.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Buttons restored!")
