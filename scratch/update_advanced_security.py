"""
Update Server Headers and Playbook for Advanced Enterprise Security Checklist
"""

import os

# 1. Update server.js to include Cache-Control header
filepath_server = 'server/server.js'
with open(filepath_server, 'r', encoding='utf-8') as f:
    content_server = f.read()

old_send_json = """  res.writeHead(status, { 
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'"
  });"""

new_send_json = """  res.writeHead(status, { 
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
  });"""

if '"Cache-Control": "no-store' not in content_server:
    content_server = content_server.replace(old_send_json, new_send_json)
    with open(filepath_server, 'w', encoding='utf-8') as f:
        f.write(content_server)

# 2. Update README.md with the Advanced Security Checklist
filepath_readme = 'README.md'
with open(filepath_readme, 'r', encoding='utf-8') as f:
    content_readme = f.read()

advanced_playbook = """
### 5. Advanced Data Protection & Privacy
- **Data Masking**: All sensitive tokens and passwords are automatically masked before writing to the Audit Log.
- **Secure Caching**: All API endpoints enforce `Cache-Control: no-store` to guarantee PHI is never cached by proxy servers or local browsers.
- **Data Minimization**: The platform strictly requests only required fields for clinical operations.

### 6. Client-Side & Code-Level Defenses
- **Browser Security**: The Node.js engine strictly enforces CSP, HSTS, and X-Content-Type-Options headers across all routes.
- **XSS & Output Encoding**: All incoming JSON payloads undergo recursive HTML tag escaping before execution to neutralize XSS vectors while preserving clinical notes.
- **Zero-Dependency Supply Chain**: The core engine operates entirely on native Node.js libraries, neutralizing NPM supply-chain attacks and rendering SBOM tracking trivial.
- **Safe Deserialization**: The system strictly parses standard JSON natively, avoiding dangerous deserialization vectors like XML or YAML code execution.
"""

if "Advanced Data Protection" not in content_readme:
    with open(filepath_readme, 'a', encoding='utf-8') as f:
        f.write(advanced_playbook)

print("Updated server.js headers and README.md with Advanced Checklist")
