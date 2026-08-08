import re

with open('server/patient-api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add crypto if not present
if "require('crypto')" not in content:
    content = content.replace("const { query }", "const crypto = require('crypto');\nconst { query }")

# Replace insecure Math.random with crypto.randomInt
content = content.replace(
    "const otp = String(Math.floor(100000 + Math.random() * 900000));",
    "const otp = crypto.randomInt(100000, 1000000).toString();"
)

# Replace the TODO comment about Termii with SendGrid/AWS SES
content = content.replace(
    "// TODO: Send OTP via Termii/Africa's Talking SMS in production",
    "// TODO: Integrate SendGrid, AWS SES (Email) or Termii (SMS) to deliver this OTP securely to the user."
)

with open('server/patient-api.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Updated OTP generation to be cryptographically secure.")
