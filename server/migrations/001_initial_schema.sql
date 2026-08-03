-- ============================================================
-- Health Grid EHR - PostgreSQL Schema v1
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── FACILITIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facilities (
  id          TEXT PRIMARY KEY DEFAULT 'FAC-' || substr(gen_random_uuid()::text, 1, 8),
  name        VARCHAR(255) NOT NULL,
  type        VARCHAR(100),
  lga         VARCHAR(100),
  level       VARCHAR(50),
  status      VARCHAR(50) DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STAFF (Doctors, Nurses, Pharmacists, Admins) ────────────
CREATE TABLE IF NOT EXISTS staff (
  id              TEXT PRIMARY KEY DEFAULT 'STF-' || substr(gen_random_uuid()::text, 1, 8),
  facility_id     TEXT REFERENCES facilities(id),
  name            VARCHAR(255) NOT NULL,
  role            VARCHAR(100) NOT NULL,  -- physician | nurse | pharmacist | admin | super_admin
  specialty       VARCHAR(100),           -- e.g. 'General Practice', 'Pediatrics', etc.
  email           VARCHAR(255) UNIQUE,
  phone           VARCHAR(50),
  username        VARCHAR(100) UNIQUE,
  password_hash   VARCHAR(255),
  avatar_url      TEXT,
  bio             TEXT,
  consultation_fee DECIMAL(10,2) DEFAULT 2000.00,
  status          VARCHAR(50) DEFAULT 'active',
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCTOR SCHEDULES (Working Hours per Weekday) ────────────
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id          SERIAL PRIMARY KEY,
  doctor_id   TEXT REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon...
  start_time  TIME NOT NULL DEFAULT '08:00',
  end_time    TIME NOT NULL DEFAULT '17:00',
  slot_duration_mins INT DEFAULT 30,
  is_active   BOOLEAN DEFAULT TRUE
);

-- ─── PATIENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id              TEXT PRIMARY KEY DEFAULT 'PT-' || substr(gen_random_uuid()::text, 1, 8),
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE,
  phone           VARCHAR(50),
  password_hash   VARCHAR(255),
  dob             DATE,
  sex             VARCHAR(20),
  blood_group     VARCHAR(10),
  genotype        VARCHAR(10),
  address         TEXT,
  lga             VARCHAR(100),
  community       VARCHAR(100),
  occupation      VARCHAR(100),
  insurance       VARCHAR(100) DEFAULT 'Private Pay',
  allergies       TEXT[],
  next_of_kin     VARCHAR(255),
  next_of_kin_phone VARCHAR(50),
  facility_id     TEXT REFERENCES facilities(id),
  otp_code        VARCHAR(6),
  otp_expires_at  TIMESTAMPTZ,
  status          VARCHAR(50) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_visit      DATE
);

-- ─── PATIENT WALLETS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_wallets (
  id          SERIAL PRIMARY KEY,
  patient_id  TEXT REFERENCES patients(id) ON DELETE CASCADE UNIQUE,
  balance     DECIMAL(12,2) DEFAULT 0.00,
  currency    VARCHAR(10) DEFAULT 'NGN',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WALLET TRANSACTIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id              SERIAL PRIMARY KEY,
  patient_id      TEXT REFERENCES patients(id),
  type            VARCHAR(20) NOT NULL, -- 'credit' | 'debit'
  amount          DECIMAL(12,2) NOT NULL,
  description     TEXT,
  reference       VARCHAR(100) UNIQUE,
  paystack_ref    VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'completed', -- 'pending' | 'completed' | 'failed'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── APPOINTMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id              TEXT PRIMARY KEY DEFAULT 'APT-' || substr(gen_random_uuid()::text, 1, 8),
  patient_id      TEXT REFERENCES patients(id),
  doctor_id       TEXT REFERENCES staff(id),
  facility_id     TEXT REFERENCES facilities(id),
  appointment_date DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  type            VARCHAR(30) DEFAULT 'in-person',  -- 'in-person' | 'chat' | 'video'
  reason          TEXT,
  specialty       VARCHAR(100),
  status          VARCHAR(30) DEFAULT 'pending',
  -- status flow: pending → confirmed → payment_due → paid → in_progress → completed | cancelled | declined
  doctor_notes    TEXT,
  patient_notes   TEXT,
  fee             DECIMAL(10,2),
  video_room_url  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── APPOINTMENT PAYMENTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointment_payments (
  id              SERIAL PRIMARY KEY,
  appointment_id  TEXT REFERENCES appointments(id),
  patient_id      TEXT REFERENCES patients(id),
  amount          DECIMAL(10,2) NOT NULL,
  method          VARCHAR(20) NOT NULL,  -- 'wallet' | 'paystack'
  paystack_ref    VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'success' | 'failed'
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHAT MESSAGES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id              SERIAL PRIMARY KEY,
  appointment_id  TEXT REFERENCES appointments(id),
  sender_type     VARCHAR(10) NOT NULL,  -- 'patient' | 'doctor'
  sender_id       TEXT NOT NULL,
  message         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ENCOUNTERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS encounters (
  id              TEXT PRIMARY KEY DEFAULT 'ENC-' || substr(gen_random_uuid()::text, 1, 8),
  patient_id      TEXT REFERENCES patients(id),
  doctor_id       TEXT REFERENCES staff(id),
  facility_id     TEXT REFERENCES facilities(id),
  appointment_id  TEXT REFERENCES appointments(id),
  encounter_date  TIMESTAMPTZ DEFAULT NOW(),
  type            VARCHAR(100),
  chief_complaint TEXT,
  history         TEXT,
  examination     TEXT,
  diagnosis       TEXT,
  icd_code        VARCHAR(20),
  plan            TEXT,
  status          VARCHAR(50) DEFAULT 'completed',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRESCRIPTIONS / ORDERS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY DEFAULT 'ORD-' || substr(gen_random_uuid()::text, 1, 8),
  encounter_id    TEXT REFERENCES encounters(id),
  patient_id      TEXT REFERENCES patients(id),
  doctor_id       TEXT REFERENCES staff(id),
  type            VARCHAR(20) NOT NULL,  -- 'medication' | 'lab' | 'radiology'
  item_name       VARCHAR(255),
  dosage          VARCHAR(100),
  instructions    TEXT,
  quantity        INT DEFAULT 1,
  status          VARCHAR(30) DEFAULT 'pending',
  result          TEXT,
  result_date     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PHARMACY PRODUCTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_products (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100),
  description     TEXT,
  price           DECIMAL(10,2) NOT NULL,
  stock_qty       INT DEFAULT 0,
  unit            VARCHAR(50) DEFAULT 'tablet',
  requires_rx     BOOLEAN DEFAULT FALSE,
  image_url       TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PHARMACY ORDERS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_orders (
  id              TEXT PRIMARY KEY DEFAULT 'PHO-' || substr(gen_random_uuid()::text, 1, 8),
  patient_id      TEXT REFERENCES patients(id),
  items           JSONB NOT NULL,  -- [{product_id, name, qty, price}]
  total_amount    DECIMAL(10,2) NOT NULL,
  delivery_address TEXT,
  payment_method  VARCHAR(20),
  payment_status  VARCHAR(20) DEFAULT 'pending',
  order_status    VARCHAR(30) DEFAULT 'pending',  -- pending | processing | dispatched | delivered
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ADMISSIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admissions (
  id              TEXT PRIMARY KEY DEFAULT 'ADM-' || substr(gen_random_uuid()::text, 1, 8),
  patient_id      TEXT REFERENCES patients(id),
  bed_id          TEXT,
  admitting_doctor_id TEXT REFERENCES staff(id),
  admission_date  TIMESTAMPTZ DEFAULT NOW(),
  discharge_date  TIMESTAMPTZ,
  reason          TEXT,
  diagnosis       TEXT,
  status          VARCHAR(50) DEFAULT 'admitted'
);

-- ─── BEDS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS beds (
  id              TEXT PRIMARY KEY,  -- e.g. 'A1', 'F1', 'ICU-1'
  facility_id     TEXT REFERENCES facilities(id),
  ward            VARCHAR(100),
  status          VARCHAR(30) DEFAULT 'available',
  patient_id      TEXT REFERENCES patients(id),
  admission_id    TEXT REFERENCES admissions(id),
  patient_name    VARCHAR(255)
);

-- ─── BILLING ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS billing (
  id              TEXT PRIMARY KEY DEFAULT 'BIL-' || substr(gen_random_uuid()::text, 1, 8),
  patient_id      TEXT REFERENCES patients(id),
  encounter_id    TEXT REFERENCES encounters(id),
  description     TEXT,
  amount          DECIMAL(10,2) NOT NULL,
  status          VARCHAR(20) DEFAULT 'unpaid',
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PERMISSIONS (RBAC) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  role            VARCHAR(50) PRIMARY KEY,
  allowed_views   TEXT[],
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES FOR PERFORMANCE ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_patient_id ON orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_patient_id ON wallet_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_appointment_id ON chat_messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
