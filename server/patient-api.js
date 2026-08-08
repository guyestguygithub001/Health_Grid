/**
 * Health Grid EHR — Patient Portal API v2
 * ==========================================
 * All endpoints versioned under /api/v2/patient/*
 * Following RESTful conventions throughout.
 *
 * Auth: JWT tokens issued on login, verified via Bearer header.
 */

const jwt  = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { query } = require('./db-postgres');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error('FATAL: JWT_SECRET environment variable is missing.'); throw new Error('Missing critical environment variables'); }
const PAYSTACK_SK = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SK) console.warn('WARNING: PAYSTACK_SECRET_KEY is missing. Payments will fail.');
const SALT_ROUNDS = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'X-API-Version': '2' });
  res.end(JSON.stringify(body));
}

function issuePatientToken(patient) {
  return jwt.sign(
    { sub: patient.id, name: patient.name, phone: patient.phone, type: 'patient' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function verifyPatientToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    if (decoded.type !== 'patient') return null;
    return decoded;
  } catch {
    return null;
  }
}

// Generate time slots for a doctor on a given date
function generateSlots(scheduleRow, existingSlots) {
  const { start_time, end_time, slot_duration_mins } = scheduleRow;
  const slots = [];

  const [sh, sm] = start_time.split(':').map(Number);
  const [eh, em] = end_time.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMins = eh * 60 + em;

  while (cur + slot_duration_mins <= endMins) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0');
    const m = String(cur % 60).padStart(2, '0');
    const slotTime = `${h}:${m}`;
    const endH = String(Math.floor((cur + slot_duration_mins) / 60)).padStart(2, '0');
    const endM = String((cur + slot_duration_mins) % 60).padStart(2, '0');
    const slotEnd = `${endH}:${endM}`;

    const isBooked = existingSlots.some(s =>
      s.start_time.slice(0, 5) === slotTime && ['pending', 'confirmed', 'paid', 'in_progress'].includes(s.status)
    );

    slots.push({ start: slotTime, end: slotEnd, available: !isBooked });
    cur += slot_duration_mins;
  }
  return slots;
}

// ─── Route Handler ────────────────────────────────────────────────────────────
async function handlePatientApi(req, res, url, body) {
  const pathname = url.pathname;
  const method   = req.method;

  // ── POST /api/v2/patient/auth/signup ─────────────────────────────────────
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
    const exists = await query('SELECT id FROM patients WHERE phone = $1 OR email = $1', [phone.trim()]);
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
  }

  // ── POST /api/v2/patients (MPI Registration) ──────────────────────────────
  if (method === 'POST' && pathname === '/api/v2/patients') {
    const { name, phone, sex, age, dob, religion, nationality, tribe, lga, insurance } = body;
    
    // Minimal validation for MPI fallback
    if (!name || !name.trim()) return sendJson(res, 400, { error: 'Full name is required' });

    const { rows } = await query(`
      INSERT INTO patients (
        name, phone, sex, dob, religion, nationality, tribe, lga, facility_id, status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8, 'FAC-PLSH','active')
      RETURNING id, name, phone, sex, dob, created_at
    `, [
      name.trim(), phone || null, sex || null, dob || null, 
      religion || null, nationality || null, tribe || null, lga || null
    ]);

    const patient = rows[0];
    patient.age = age; // Keep age in memory for frontend UI
    return sendJson(res, 201, patient);
  }

  // ── POST /api/v2/patient/auth/otp/request ─────────────────────────────────
  if (method === 'POST' && pathname === '/api/v2/patient/auth/otp/request') {
    const contact = body.contact || body.phone;
    if (!contact) return sendJson(res, 400, { error: 'Phone or Email is required' });

    const { rows } = await query('SELECT id, name FROM patients WHERE phone = $1 OR email = $1 OR email = $1', [contact]);
    if (rows.length === 0) return sendJson(res, 404, { error: 'No account found for this phone number.' });

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await query('UPDATE patients SET otp_code = $1, otp_expires_at = $2 WHERE phone = $3 OR email = $3', [otp, expires, contact]);

    // TODO: Integrate SendGrid, AWS SES (Email) or Termii (SMS) to deliver this OTP securely to the user.
    console.log(`[OTP] Code for ${contact}: ${otp}`);

    return sendJson(res, 200, {
      ok: true,
      message: 'OTP sent successfully.',
      // In dev mode, return OTP so you can test without SMS
      ...(process.env.NODE_ENV !== 'production' ? { dev_otp: otp } : {})
    });
  }

  // ── POST /api/v2/patient/auth/otp/verify ─────────────────────────────────
  if (method === 'POST' && pathname === '/api/v2/patient/auth/otp/verify') {
    const contact = body.contact || body.phone;
    const { otp } = body;
    if (!contact || !otp) return sendJson(res, 400, { error: 'Phone/Email and OTP are required' });

    
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


    const token = issuePatientToken(patient);
    return sendJson(res, 200, { ok: true, patient, token });
  }

  // ── GET /api/v2/patient/me ────────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/v2/patient/me') {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const { rows } = await query(`
      SELECT p.id, p.name, p.phone, p.email, p.sex, p.dob, p.blood_group, p.genotype,
             p.address, p.lga, p.allergies, p.next_of_kin, p.created_at,
             w.balance as wallet_balance
      FROM patients p
      LEFT JOIN patient_wallets w ON w.patient_id = p.id
      WHERE p.id = $1
    `, [user.sub]);

    if (rows.length === 0) return sendJson(res, 404, { error: 'Patient not found' });
    return sendJson(res, 200, { patient: rows[0] });
  }

  // ── GET /api/v2/patient/doctors?specialty=&date= ─────────────────────────
  if (method === 'GET' && pathname === '/api/v2/patient/doctors') {
    const specialty = url.searchParams.get('specialty') || '';
    const date = url.searchParams.get('date') || '';

    let sql = `
      SELECT s.id, s.name, s.specialty, s.bio, s.consultation_fee, s.avatar_url,
             f.name as facility_name,
             ARRAY(
               SELECT day_of_week FROM doctor_schedules
               WHERE doctor_id = s.id AND is_active = true
             ) as working_days
      FROM staff s
      LEFT JOIN facilities f ON f.id = s.facility_id
      WHERE s.role = 'physician' AND s.status = 'active'
    `;
    const params = [];

    if (specialty) {
      params.push(`%${specialty}%`);
      sql += ` AND s.specialty ILIKE $${params.length}`;
    }

    sql += ' ORDER BY s.name';

    const { rows } = await query(sql, params);
    return sendJson(res, 200, { doctors: rows });
  }

  // ── GET /api/v2/patient/doctors/:doctorId/slots?date=YYYY-MM-DD ──────────
  const slotsMatch = pathname.match(/^\/api\/v2\/patient\/doctors\/([^/]+)\/slots$/);
  if (method === 'GET' && slotsMatch) {
    const doctorId = slotsMatch[1];
    const date = url.searchParams.get('date');
    if (!date) return sendJson(res, 400, { error: 'date parameter required (YYYY-MM-DD)' });

    const dayOfWeek = new Date(date).getDay();

    const schedule = await query(
      'SELECT * FROM doctor_schedules WHERE doctor_id = $1 AND day_of_week = $2 AND is_active = true',
      [doctorId, dayOfWeek]
    );

    if (schedule.rows.length === 0) {
      return sendJson(res, 200, { slots: [], message: 'Doctor not available on this day' });
    }

    const booked = await query(
      'SELECT start_time, status FROM appointments WHERE doctor_id = $1 AND appointment_date = $2',
      [doctorId, date]
    );

    const slots = generateSlots(schedule.rows[0], booked.rows);
    return sendJson(res, 200, { slots, date, doctor_id: doctorId });
  }

  // ── POST /api/v2/patient/appointments ────────────────────────────────────
  if (method === 'POST' && pathname === '/api/v2/patient/appointments') {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const { doctor_id, appointment_date, start_time, end_time, type, reason, specialty } = body;
    if (!doctor_id || !appointment_date || !start_time) {
      return sendJson(res, 400, { error: 'doctor_id, appointment_date, and start_time are required' });
    }

    // Check the slot is still free
    const conflict = await query(
      `SELECT id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND start_time = $3
       AND status NOT IN ('cancelled', 'declined')`,
      [doctor_id, appointment_date, start_time]
    );
    if (conflict.rows.length > 0) return sendJson(res, 409, { error: 'This time slot is no longer available.' });

    // Get doctor's fee
    const doc = await query('SELECT consultation_fee, name FROM staff WHERE id = $1', [doctor_id]);
    const fee = doc.rows[0]?.consultation_fee || 2000;

    const { rows } = await query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, start_time, end_time, type, reason, specialty, fee, status, facility_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'FAC-PLSH')
      RETURNING *
    `, [user.sub, doctor_id, appointment_date, start_time, end_time || null, type || 'in-person', reason || '', specialty || '', fee]);

    const appointment = rows[0];
    appointment.doctor_name = doc.rows[0]?.name;

    return sendJson(res, 201, { ok: true, appointment });
  }

  // ── GET /api/v2/patient/appointments ─────────────────────────────────────
  if (method === 'GET' && pathname === '/api/v2/patient/appointments') {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const { rows } = await query(`
      SELECT a.*, s.name as doctor_name, s.specialty as doctor_specialty, s.avatar_url as doctor_avatar,
             f.name as facility_name,
             p.name as payment_status_label
      FROM appointments a
      LEFT JOIN staff s ON s.id = a.doctor_id
      LEFT JOIN facilities f ON f.id = a.facility_id
      LEFT JOIN appointment_payments p ON p.appointment_id = a.id AND p.status = 'success'
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `, [user.sub]);

    return sendJson(res, 200, { appointments: rows });
  }

  // ── GET /api/v2/patient/appointments/:id ─────────────────────────────────
  const apptMatch = pathname.match(/^\/api\/v2\/patient\/appointments\/([^/]+)$/);
  if (method === 'GET' && apptMatch) {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const { rows } = await query(`
      SELECT a.*, s.name as doctor_name, s.specialty, s.bio as doctor_bio, s.consultation_fee
      FROM appointments a
      LEFT JOIN staff s ON s.id = a.doctor_id
      WHERE a.id = $1 AND a.patient_id = $2
    `, [apptMatch[1], user.sub]);

    if (rows.length === 0) return sendJson(res, 404, { error: 'Appointment not found' });
    return sendJson(res, 200, { appointment: rows[0] });
  }

  // ── PATCH /api/v2/patient/appointments/:id/cancel ─────────────────────────
  const cancelMatch = pathname.match(/^\/api\/v2\/patient\/appointments\/([^/]+)\/cancel$/);
  if (method === 'PATCH' && cancelMatch) {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const { rows } = await query(
      `UPDATE appointments SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND patient_id = $2 AND status IN ('pending', 'confirmed')
       RETURNING id, status`,
      [cancelMatch[1], user.sub]
    );
    if (rows.length === 0) return sendJson(res, 400, { error: 'Cannot cancel this appointment.' });
    return sendJson(res, 200, { ok: true, appointment: rows[0] });
  }

  // ── GET /api/v2/patient/wallet ────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/v2/patient/wallet') {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const wallet = await query('SELECT * FROM patient_wallets WHERE patient_id = $1', [user.sub]);
    const transactions = await query(
      'SELECT * FROM wallet_transactions WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 20',
      [user.sub]
    );

    return sendJson(res, 200, {
      wallet: wallet.rows[0] || { balance: '0.00', currency: 'NGN' },
      transactions: transactions.rows
    });
  }

  // ── POST /api/v2/patient/wallet/fund/initiate ─────────────────────────────
  if (method === 'POST' && pathname === '/api/v2/patient/wallet/fund/initiate') {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
    const { amount_kobo, email } = body;
    if (!amount_kobo || amount_kobo < 10000) {
      return sendJson(res, 400, { error: 'Minimum funding amount is ₦100 (10000 kobo)' });
    }

    if (!PAYSTACK_SK) {
      // Demo mode: simulate successful funding
      const amount_naira = amount_kobo / 100;
      const ref = 'DEMO-' + Date.now();
      await query(
        `INSERT INTO wallet_transactions (patient_id, type, amount, description, reference, status)
         VALUES ($1, 'credit', $2, 'Wallet top-up (demo)', $3, 'completed')`,
        [user.sub, amount_naira, ref]
      );
      await query(
        `INSERT INTO patient_wallets (patient_id, balance) VALUES ($1, $2)
         ON CONFLICT (patient_id) DO UPDATE SET balance = patient_wallets.balance + $2, updated_at = NOW()`,
        [user.sub, amount_naira]
      );
      return sendJson(res, 200, { ok: true, demo_mode: true, message: `₦${amount_naira} added to wallet (demo mode)`, reference: ref });
    }

    // Paystack: Initialize transaction
    const patientRow = await query('SELECT email, phone FROM patients WHERE id = $1', [user.sub]);
    const patientEmail = email || patientRow.rows[0]?.email || `patient_${user.sub}@healthgrid.ng`;
    const ref = `HG-WLT-${user.sub}-${Date.now()}`;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAYSTACK_SK}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: patientEmail, amount: amount_kobo, reference: ref, callback_url: '/portal.html' })
    });
    const psData = await paystackRes.json();
    if (!psData.status) return sendJson(res, 500, { error: psData.message });

    await query(
      `INSERT INTO wallet_transactions (patient_id, type, amount, description, reference, paystack_ref, status)
       VALUES ($1, 'credit', $2, 'Wallet top-up', $3, $3, 'pending')`,
      [user.sub, amount_kobo / 100, ref]
    );

    return sendJson(res, 200, { ok: true, authorization_url: psData.data.authorization_url, reference: ref });
  }

  // ── POST /api/v2/patient/wallet/fund/verify ───────────────────────────────
  if (method === 'POST' && pathname === '/api/v2/patient/wallet/fund/verify') {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
    const { reference } = body;
    if (!reference) return sendJson(res, 400, { error: 'reference is required' });

    // Check already processed
    const txn = await query('SELECT * FROM wallet_transactions WHERE reference = $1 AND patient_id = $2', [reference, user.sub]);
    if (txn.rows.length === 0) return sendJson(res, 404, { error: 'Transaction not found' });
    if (txn.rows[0].status === 'completed') return sendJson(res, 200, { ok: true, message: 'Already processed' });

    if (!PAYSTACK_SK) return sendJson(res, 400, { error: 'Paystack not configured' });

    const verRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SK}` }
    });
    const verData = await verRes.json();

    if (!verData.status || verData.data.status !== 'success') {
      return sendJson(res, 400, { error: 'Payment not successful' });
    }

    const amount = verData.data.amount / 100;
    await query('UPDATE wallet_transactions SET status = $1 WHERE reference = $2', ['completed', reference]);
    await query(
      `INSERT INTO patient_wallets (patient_id, balance) VALUES ($1, $2)
       ON CONFLICT (patient_id) DO UPDATE SET balance = patient_wallets.balance + $2, updated_at = NOW()`,
      [user.sub, amount]
    );

    return sendJson(res, 200, { ok: true, amount_credited: amount });
  }

  // ── POST /api/v2/patient/appointments/:id/pay/wallet ─────────────────────
  const payWalletMatch = pathname.match(/^\/api\/v2\/patient\/appointments\/([^/]+)\/pay\/wallet$/);
  if (method === 'POST' && payWalletMatch) {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const apptId = payWalletMatch[1];
    const appt = await query('SELECT * FROM appointments WHERE id = $1 AND patient_id = $2', [apptId, user.sub]);
    if (appt.rows.length === 0) return sendJson(res, 404, { error: 'Appointment not found' });

    const appointment = appt.rows[0];
    if (!['confirmed', 'payment_due'].includes(appointment.status)) {
      return sendJson(res, 400, { error: 'This appointment is not awaiting payment.' });
    }

    const wallet = await query('SELECT balance FROM patient_wallets WHERE patient_id = $1', [user.sub]);
    const balance = parseFloat(wallet.rows[0]?.balance || 0);
    const fee = parseFloat(appointment.fee);

    if (balance < fee) {
      return sendJson(res, 402, { error: `Insufficient wallet balance. Need ₦${fee}, have ₦${balance.toFixed(2)}` });
    }

    // Deduct from wallet
    await query('UPDATE patient_wallets SET balance = balance - $1, updated_at = NOW() WHERE patient_id = $2', [fee, user.sub]);

    const ref = `HG-APT-WLT-${apptId}-${Date.now()}`;
    await query(
      `INSERT INTO wallet_transactions (patient_id, type, amount, description, reference, status)
       VALUES ($1, 'debit', $2, $3, $4, 'completed')`,
      [user.sub, fee, `Payment for appointment ${apptId}`, ref]
    );
    await query(
      `INSERT INTO appointment_payments (appointment_id, patient_id, amount, method, status, paid_at)
       VALUES ($1, $2, $3, 'wallet', 'success', NOW())`,
      [apptId, user.sub, fee]
    );
    await query('UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2', ['paid', apptId]);

    return sendJson(res, 200, { ok: true, message: 'Payment successful! Your appointment is confirmed.', reference: ref });
  }

  // ── POST /api/v2/patient/appointments/:id/pay/paystack/initiate ───────────
  const payPSMatch = pathname.match(/^\/api\/v2\/patient\/appointments\/([^/]+)\/pay\/paystack\/initiate$/);
  if (method === 'POST' && payPSMatch) {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const apptId = payPSMatch[1];
    const appt = await query(`
      SELECT a.*, p.email FROM appointments a
      LEFT JOIN patients p ON p.id = a.patient_id
      WHERE a.id = $1 AND a.patient_id = $2
    `, [apptId, user.sub]);
    if (appt.rows.length === 0) return sendJson(res, 404, { error: 'Appointment not found' });

    const appointment = appt.rows[0];
    const ref = `HG-APT-PS-${apptId}-${Date.now()}`;
    const amountKobo = Math.round(parseFloat(appointment.fee) * 100);
    const email = appointment.email || `patient_${user.sub}@healthgrid.ng`;

    if (!PAYSTACK_SK) {
      // Demo mode
      await query(
        `INSERT INTO appointment_payments (appointment_id, patient_id, amount, method, paystack_ref, status, paid_at)
         VALUES ($1, $2, $3, 'paystack', $4, 'success', NOW())`,
        [apptId, user.sub, appointment.fee, ref]
      );
      await query('UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2', ['paid', apptId]);
      return sendJson(res, 200, { ok: true, demo_mode: true, message: 'Payment simulated (demo mode). Appointment confirmed!', reference: ref });
    }

    const psRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAYSTACK_SK}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount: amountKobo, reference: ref, metadata: { appointment_id: apptId, patient_id: user.sub } })
    });
    const psData = await psRes.json();
    if (!psData.status) return sendJson(res, 500, { error: psData.message });

    return sendJson(res, 200, { ok: true, authorization_url: psData.data.authorization_url, reference: ref });
  }

  // ── GET /api/v2/patient/chat/:appointmentId ───────────────────────────────
  const chatGetMatch = pathname.match(/^\/api\/v2\/patient\/chat\/([^/]+)$/);
  if (method === 'GET' && chatGetMatch) {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const { rows } = await query(
      'SELECT * FROM chat_messages WHERE appointment_id = $1 ORDER BY created_at ASC',
      [chatGetMatch[1]]
    );
    await query(
      `UPDATE chat_messages SET is_read = true WHERE appointment_id = $1 AND sender_type = 'doctor'`,
      [chatGetMatch[1]]
    );
    return sendJson(res, 200, { messages: rows });
  }

  // ── POST /api/v2/patient/chat/:appointmentId ──────────────────────────────
  const chatPostMatch = pathname.match(/^\/api\/v2\/patient\/chat\/([^/]+)$/);
  if (method === 'POST' && chatPostMatch) {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const { message } = body;
    if (!message?.trim()) return sendJson(res, 400, { error: 'Message cannot be empty' });

    const { rows } = await query(`
      INSERT INTO chat_messages (appointment_id, sender_type, sender_id, message)
      VALUES ($1, 'patient', $2, $3)
      RETURNING *
    `, [chatPostMatch[1], user.sub, message.trim()]);

    return sendJson(res, 201, { ok: true, message: rows[0] });
  }

  // ── GET /api/v2/patient/orders ────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/v2/patient/orders') {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const { rows } = await query(`
      SELECT o.*, s.name as doctor_name FROM orders o
      LEFT JOIN staff s ON s.id = o.doctor_id
      WHERE o.patient_id = $1
      ORDER BY o.created_at DESC
    `, [user.sub]);

    return sendJson(res, 200, { orders: rows });
  }

  // ── GET /api/v2/patient/pharmacy/products ─────────────────────────────────
  if (method === 'GET' && pathname === '/api/v2/patient/pharmacy/products') {
    const cat = url.searchParams.get('category') || '';
    let sql = 'SELECT * FROM pharmacy_products WHERE is_active = true';
    const params = [];
    if (cat) { params.push(`%${cat}%`); sql += ` AND category ILIKE $${params.length}`; }
    sql += ' ORDER BY category, name';
    const { rows } = await query(sql, params);
    return sendJson(res, 200, { products: rows });
  }

  // ── POST /api/v2/patient/pharmacy/order ───────────────────────────────────
  if (method === 'POST' && pathname === '/api/v2/patient/pharmacy/order') {
    const user = verifyPatientToken(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });

    const { items, delivery_address, payment_method } = body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendJson(res, 400, { error: 'No items in order' });
    }

    const total = items.reduce((sum, i) => sum + (i.price * i.qty), 0);

    const { rows } = await query(`
      INSERT INTO pharmacy_orders (patient_id, items, total_amount, delivery_address, payment_method)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user.sub, JSON.stringify(items), total, delivery_address || '', payment_method || 'wallet']);

    return sendJson(res, 201, { ok: true, order: rows[0] });
  }

  // ── (Doctor-side) GET /api/v2/doctor/appointments ─────────────────────────
  // This is used by EMR for the doctor's incoming appointment requests
  if (method === 'GET' && pathname === '/api/v2/doctor/appointments') {
    // Staff auth via existing staff_token header
    const doctorId = url.searchParams.get('doctor_id');
    const status   = url.searchParams.get('status') || 'pending';

    const { rows } = await query(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.sex as patient_sex
      FROM appointments a
      LEFT JOIN patients p ON p.id = a.patient_id
      WHERE a.doctor_id = $1 AND a.status = $2
      ORDER BY a.appointment_date ASC, a.start_time ASC
    `, [doctorId, status]);

    return sendJson(res, 200, { appointments: rows });
  }

  // ── (Doctor-side) PATCH /api/v2/doctor/appointments/:id ──────────────────
  const doctorApptMatch = pathname.match(/^\/api\/v2\/doctor\/appointments\/([^/]+)$/);
  if (method === 'PATCH' && doctorApptMatch) {
    const apptId = doctorApptMatch[1];
    const { action, doctor_notes } = body; // action: 'confirm' | 'decline'

    if (!['confirm', 'decline'].includes(action)) {
      return sendJson(res, 400, { error: 'action must be "confirm" or "decline"' });
    }

    const newStatus = action === 'confirm' ? 'payment_due' : 'declined';
    const { rows } = await query(
      `UPDATE appointments SET status = $1, doctor_notes = COALESCE($2, doctor_notes), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [newStatus, doctor_notes || null, apptId]
    );

    if (rows.length === 0) return sendJson(res, 404, { error: 'Appointment not found' });
    return sendJson(res, 200, { ok: true, appointment: rows[0] });
  }

  return null; // Route not matched → caller handles 404
}

module.exports = { handlePatientApi };
