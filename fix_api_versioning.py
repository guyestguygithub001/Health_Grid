import re

# 1. Update server.js
with open('server/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('pathname === "/api/legal/audit-matrix"', 'pathname === "/api/v2/legal/audit-matrix"')
content = content.replace('pathname === "/api/stream"', 'pathname === "/api/v2/stream"')

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update frontend files
def update_frontend(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            c = f.read()
        
        c = c.replace("'/api/legal/audit-matrix'", "'/api/v2/legal/audit-matrix'")
        c = c.replace('"/api/legal/audit-matrix"', '"/api/v2/legal/audit-matrix"')
        c = c.replace("'/api/stream'", "'/api/v2/stream'")
        c = c.replace('"/api/stream"', '"/api/v2/stream"')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(c)
    except FileNotFoundError:
        pass

for f in ['public/legal.html', 'public/security.html', 'public/emr.html', 'public/portal.html', 'public/command.html']:
    update_frontend(f)

print("SUCCESS: API versioning corrected.")
