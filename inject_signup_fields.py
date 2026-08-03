with open('server/patient-api.js','r',encoding='utf-8') as f:
    content = f.read()

old = """  // \u2500\u2500 POST /api/v2/patient/auth/signup \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  if (method === 'POST' && pathname === '/api/v2/patient/auth/signup') {
    const { name, phone, email, sex, dob } = body;
    if (!name || !phone) return sendJson(res, 400, { error: 'Name and phone are required' });

    // Check duplicate
    const exists = await query('SELECT id FROM patients WHERE phone = $1', [phone]);
    if (exists.rows.length > 0) return sendJson(res, 409, { error: 'Phone number already registered. Please log in.' });

    const { rows } = await query(`
      INSERT INTO patients (name, phone, email, sex, dob, facility_id, status)
      VALUES ($1, $2, $3, $4, $5, 'FAC-PLSH', 'active')
      RETURNING id, name, phone, email, sex, created_at
    `, [name, phone, email || null, sex || null, dob || null]);

    const patient = rows[0];

    // Create wallet automatically
    await query('INSERT INTO patient_wallets (patient_id, balance) VALUES ($1, 0.00)', [patient.id]);

    const token = issuePatientToken(patient);
    return sendJson(res, 201, { ok: true, patient, token });
  }"""

new = """  // \u2500\u2500 POST /api/v2/patient/auth/signup \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  if (method === 'POST' && pathname === '/api/v2/patient/auth/signup') {
    const {
      name, phone, email, sex, dob,
      marital_status, tribe, religion, occupation,
      address, community, lga,
      next_of_kin, next_of_kin_phone, next_of_kin_relationship
    } = body;

    if (!name || !name.trim()) return sendJson(res, 400, { error: 'Full name is required' });
    if (!phone || !phone.trim()) return sendJson(res, 400, { error: 'Phone number is required' });

    // Check duplicate
    const exists = await query('SELECT id FROM patients WHERE phone = $1', [phone.trim()]);
    if (exists.rows.length > 0) return sendJson(res, 409, { error: 'Phone number already registered. Please log in.' });

    const { rows } = await query(`
      INSERT INTO patients (
        name, phone, email, sex, dob,
        marital_status, tribe, religion, occupation,
        address, community, lga,
        next_of_kin, next_of_kin_phone, next_of_kin_relationship,
        facility_id, status
      )
      VALUES ($1,$2,$3,$4,$5, $6,$7,$8,$9, $10,$11,$12, $13,$14,$15, 'FAC-PLSH','active')
      RETURNING id, name, phone, email, sex, dob, created_at
    `, [
      name.trim(), phone.trim(), email || null, sex || null, dob || null,
      marital_status || null, tribe || null, religion || null, occupation || null,
      address || null, community || null, lga || null,
      next_of_kin || null, next_of_kin_phone || null, next_of_kin_relationship || null
    ]);

    const patient = rows[0];

    // Create wallet automatically on signup
    await query('INSERT INTO patient_wallets (patient_id, balance) VALUES ($1, 0.00)', [patient.id]);

    const token = issuePatientToken(patient);
    return sendJson(res, 201, { ok: true, patient, token });
  }"""

# Try LF first, then CRLF
if old in content:
    content = content.replace(old, new, 1)
    with open('server/patient-api.js','w',encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS (LF)')
else:
    old_cr = old.replace('\n','\r\n')
    new_cr = new.replace('\n','\r\n')
    if old_cr in content:
        content = content.replace(old_cr, new_cr, 1)
        with open('server/patient-api.js','w',encoding='utf-8') as f:
            f.write(content)
        print('SUCCESS (CRLF)')
    else:
        idx = content.find("auth/signup")
        print('NOT FOUND. Snippet at signup:', repr(content[max(0,idx-50):idx+300]))
