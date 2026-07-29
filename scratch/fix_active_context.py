import re

with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = r'<p[^>]*>Active Context</p>\s*<select id="roleSelector".*?</select>'

new_context_block = """<p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Active Context</p>
            <div id="activeRoleDisplay" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; color: #0f172a; font-weight: 700; font-size: 13px; margin-bottom: 8px;">
                Role Loading...
            </div>
            <button id="emrSignupBtn" onclick="document.getElementById('emrSignupModal').style.display='flex'" style="width: 100%; padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
                Register Staff
            </button>"""

if re.search(pattern, html, flags=re.DOTALL):
    html = re.sub(pattern, new_context_block, html, flags=re.DOTALL)
    print("Replaced Active Context block via regex!")
else:
    print("Still could not find Active Context block with regex.")

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(html)
