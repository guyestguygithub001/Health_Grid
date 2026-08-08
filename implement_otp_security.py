import re

with open('server/patient-api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update OTP Request route with rate limiting and lockout check
request_logic = """
    const { rows } = await query('SELECT id, name, locked_until, otp_request_count, otp_last_requested_at FROM patients WHERE phone = $1 OR email = $1', [contact]);
    if (rows.length === 0) return sendJson(res, 404, { error: 'No account found for this phone number or email.' });

    const patient = rows[0];

    // Check if account is locked
    if (patient.locked_until && new Date(patient.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(patient.locked_until) - new Date()) / 60000);
      return sendJson(res, 403, { error: `Account is temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minutes.` });
    }

    // Rate Limiting: Max 3 requests per 5 minutes
    let newRequestCount = patient.otp_request_count || 0;
    const now = new Date();
    if (patient.otp_last_requested_at) {
      const timeSinceLastRequest = now - new Date(patient.otp_last_requested_at);
      if (timeSinceLastRequest < 5 * 60 * 1000) {
        if (newRequestCount >= 3) {
           return sendJson(res, 429, { error: 'Too many OTP requests. Please wait 5 minutes before requesting a new code.' });
        }
        newRequestCount += 1;
      } else {
        newRequestCount = 1; // Reset counter after 5 minutes
      }
    } else {
      newRequestCount = 1;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await query('UPDATE patients SET otp_code = $1, otp_expires_at = $2, otp_request_count = $3, otp_last_requested_at = $4 WHERE id = $5', 
                [otp, expires, newRequestCount, now, patient.id]);
"""

content = re.sub(
    r"const \{ rows \} = await query\('SELECT id, name FROM patients WHERE phone = \$1 OR email = \$1', \[contact\]\);\s*if \(rows\.length === 0\) return sendJson\(res, 404, \{ error: 'No account found for this phone number\.' \}\);\s*const otp = crypto\.randomInt\(100000, 1000000\)\.toString\(\);\s*const expires = new Date\(Date\.now\(\) \+ 10 \* 60 \* 1000\); // 10 minutes\s*await query\('UPDATE patients SET otp_code = \$1, otp_expires_at = \$2 WHERE phone = \$3 OR email = \$3', \[otp, expires, contact\]\);",
    request_logic,
    content
)


# 2. Update OTP Verify route with brute-force lockout
verify_logic = """
    const { rows } = await query(
      'SELECT id, name, phone, email, sex, otp_code, otp_expires_at, locked_until, otp_failed_attempts FROM patients WHERE phone = $1 OR email = $1',
      [contact]
    );
    if (rows.length === 0) return sendJson(res, 404, { error: 'Patient not found' });

    const patient = rows[0];

    // Check if locked
    if (patient.locked_until && new Date(patient.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(patient.locked_until) - new Date()) / 60000);
      return sendJson(res, 403, { error: `Account is temporarily locked. Try again in ${minutesLeft} minutes.` });
    }

    if (patient.otp_code !== otp) {
      let attempts = (patient.otp_failed_attempts || 0) + 1;
      let updateQuery = 'UPDATE patients SET otp_failed_attempts = $1 WHERE id = $2';
      let params = [attempts, patient.id];
      let errorMsg = 'Invalid OTP code';

      if (attempts >= 5) {
        const lockoutTime = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        updateQuery = 'UPDATE patients SET otp_failed_attempts = $1, locked_until = $2 WHERE id = $3';
        params = [attempts, lockoutTime, patient.id];
        errorMsg = 'Too many failed attempts. Account locked for 15 minutes.';
      }
      
      await query(updateQuery, params);
      return sendJson(res, 401, { error: errorMsg });
    }

    if (new Date(patient.otp_expires_at) < new Date()) {
      return sendJson(res, 401, { error: 'OTP has expired. Request a new one.' });
    }

    // Success: Reset security columns
    await query('UPDATE patients SET otp_code = NULL, otp_expires_at = NULL, otp_failed_attempts = 0, locked_until = NULL, otp_request_count = 0 WHERE id = $1', [patient.id]);
"""

content = re.sub(
    r"const \{ rows \} = await query\(\s*'SELECT id, name, phone, email, sex, otp_code, otp_expires_at FROM patients WHERE phone = \$1 OR email = \$1',\s*\[contact\]\s*\);\s*if \(rows\.length === 0\) return sendJson\(res, 404, \{ error: 'Patient not found' \}\);\s*const patient = rows\[0\];\s*if \(patient\.otp_code !== otp\) return sendJson\(res, 401, \{ error: 'Invalid OTP code' \}\);\s*if \(new Date\(patient\.otp_expires_at\) < new Date\(\)\) return sendJson\(res, 401, \{ error: 'OTP has expired\. Request a new one\.' \}\);\s*await query\('UPDATE patients SET otp_code = NULL, otp_expires_at = NULL WHERE id = \$1', \[patient\.id\]\);",
    verify_logic,
    content
)

with open('server/patient-api.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Updated OTP logic with rate limiting and lockout.")
