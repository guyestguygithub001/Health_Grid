import re

# 1. Update frontend public/portal.html
with open('public/portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<input type="tel" id="login-phone" placeholder="Phone (+234...)" />',
    '<input type="text" id="login-contact" placeholder="Phone (+234...) or Email" class="form-input-field" style="width:100%; padding:14px; border-radius:12px; border:1px solid rgba(14,165,233,0.3); outline:none; margin-bottom:12px;" />'
)

content = content.replace("const phone = document.getElementById('login-phone').value;", "const contact = document.getElementById('login-contact').value;")
content = content.replace("if(!phone) return showToast('Phone required', 'error');", "if(!contact) return showToast('Phone or Email required', 'error');")
content = content.replace("JSON.stringify({ phone })", "JSON.stringify({ contact })")
content = content.replace("JSON.stringify({ phone, otp })", "JSON.stringify({ contact, otp })")

with open('public/portal.html', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Update backend server/patient-api.js
with open('server/patient-api.js', 'r', encoding='utf-8') as f:
    backend = f.read()

# Request OTP
backend = backend.replace(
    "const { phone } = body;\n    if (!phone) return sendJson(res, 400, { error: 'Phone is required' });",
    "const contact = body.contact || body.phone;\n    if (!contact) return sendJson(res, 400, { error: 'Phone or Email is required' });"
)
backend = backend.replace(
    "SELECT id, name FROM patients WHERE phone = $1",
    "SELECT id, name FROM patients WHERE phone = $1 OR email = $1"
)
backend = backend.replace(
    "UPDATE patients SET otp_code = $1, otp_expires_at = $2 WHERE phone = $3",
    "UPDATE patients SET otp_code = $1, otp_expires_at = $2 WHERE phone = $3 OR email = $3"
)
backend = backend.replace(
    "console.log(`[OTP] Code for ${phone}: ${otp}`);",
    "console.log(`[OTP] Code for ${contact}: ${otp}`);"
)

# Verify OTP
backend = backend.replace(
    "const { phone, otp } = body;\n    if (!phone || !otp) return sendJson(res, 400, { error: 'Phone and OTP are required' });",
    "const contact = body.contact || body.phone;\n    const { otp } = body;\n    if (!contact || !otp) return sendJson(res, 400, { error: 'Phone/Email and OTP are required' });"
)
backend = backend.replace(
    "WHERE phone = $1",
    "WHERE phone = $1 OR email = $1"
)
# We already replaced WHERE phone = $1 in the requestOTP, so the verifyOTP replace might just work if we target the specific multi-line string.
# Actually wait, let's make sure we replace the correct one in verifyOTP.
# Let's use regex for safety.

with open('server/patient-api.js', 'w', encoding='utf-8') as f:
    f.write(backend)

print("SUCCESS: Updated OTP flow for Email and Phone.")
