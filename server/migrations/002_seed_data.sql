-- ============================================================
-- Health Grid EHR - Seed Data v1
-- Migration: 002_seed_data.sql
-- ============================================================

-- Seed Facility
INSERT INTO facilities (id, name, type, lga, level, status)
VALUES
  ('FAC-PLSH', 'Plateau Specialist Hospital', 'Secondary Hospital', 'Jos North', 'Specialist', 'active'),
  ('FAC-JUTH', 'Jos University Teaching Hospital', 'Tertiary Hospital', 'Jos North', 'Referral', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Default Permissions
INSERT INTO role_permissions (role, allowed_views) VALUES
  ('admin',      ARRAY['all']),
  ('super_admin',ARRAY['all']),
  ('physician',  ARRAY['mpiView','encountersView','labsView','pharmacyView','recordsMainView']),
  ('nurse',      ARRAY['triageView','wardsView','pharmacyView']),
  ('pharmacist', ARRAY['pharmacyView'])
ON CONFLICT (role) DO NOTHING;

-- Seed Default Admin
INSERT INTO staff (id, name, role, username, password_hash, email, facility_id, status)
VALUES (
  'STF-ADMIN01',
  'System Admin',
  'admin',
  'admin',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
  'admin@healthgrid.ng',
  'FAC-PLSH',
  'active'
) ON CONFLICT (username) DO NOTHING;

-- Seed Doctors with specialties
INSERT INTO staff (id, name, role, specialty, username, password_hash, email, consultation_fee, bio, facility_id, status)
VALUES
  ('STF-DOC001', 'Dr. Amara Okafor', 'physician', 'General Practice', 'dr.okafor', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'a.okafor@healthgrid.ng', 3000.00, 'Experienced GP with 12 years in primary and preventive care.', 'FAC-PLSH', 'active'),
  ('STF-DOC002', 'Dr. Blessing Dashe', 'physician', 'Pediatrics', 'dr.dashe', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'b.dashe@healthgrid.ng', 4000.00, 'Board-certified pediatrician focused on child development and nutrition.', 'FAC-PLSH', 'active'),
  ('STF-DOC003', 'Dr. Christiana Pam', 'physician', 'Obstetrics & Gynecology', 'dr.pam', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'c.pam@healthgrid.ng', 5000.00, 'OB-GYN specialist with expertise in maternal health and high-risk pregnancies.', 'FAC-PLSH', 'active'),
  ('STF-DOC004', 'Dr. Emmanuel Mwanret', 'physician', 'Internal Medicine', 'dr.mwanret', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'e.mwanret@healthgrid.ng', 4500.00, 'Internist specializing in chronic diseases and complex multi-system conditions.', 'FAC-PLSH', 'active'),
  ('STF-DOC005', 'Dr. Fatima Abdullahi', 'physician', 'Dermatology', 'dr.abdullahi', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'f.abdullahi@healthgrid.ng', 3500.00, 'Dermatologist with special interest in skin disorders common in tropical climates.', 'FAC-PLSH', 'active'),
  ('STF-DOC006', 'Dr. Gabriel Nanle', 'physician', 'Cardiology', 'dr.nanle', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'g.nanle@healthgrid.ng', 6000.00, 'Cardiologist with 15 years experience in cardiac diagnostics and intervention.', 'FAC-JUTH', 'active'),
  ('STF-DOC007', 'Dr. Hannah Bitrus', 'physician', 'Ophthalmology', 'dr.bitrus', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'h.bitrus@healthgrid.ng', 3500.00, 'Eye specialist offering comprehensive vision care and surgical consultations.', 'FAC-JUTH', 'active')
ON CONFLICT (username) DO NOTHING;

-- Seed Doctor Schedules (Mon–Fri, 8am–5pm)
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_mins)
VALUES
  -- Mon-Fri for all doctors
  ('STF-DOC001', 1, '08:00', '17:00', 30), ('STF-DOC001', 2, '08:00', '17:00', 30), ('STF-DOC001', 3, '08:00', '17:00', 30), ('STF-DOC001', 4, '08:00', '17:00', 30), ('STF-DOC001', 5, '08:00', '13:00', 30),
  ('STF-DOC002', 1, '09:00', '17:00', 30), ('STF-DOC002', 2, '09:00', '17:00', 30), ('STF-DOC002', 3, '09:00', '17:00', 30), ('STF-DOC002', 4, '09:00', '17:00', 30), ('STF-DOC002', 5, '09:00', '13:00', 30),
  ('STF-DOC003', 1, '08:00', '16:00', 45), ('STF-DOC003', 2, '08:00', '16:00', 45), ('STF-DOC003', 3, '08:00', '16:00', 45), ('STF-DOC003', 4, '08:00', '16:00', 45),
  ('STF-DOC004', 1, '07:00', '15:00', 30), ('STF-DOC004', 2, '07:00', '15:00', 30), ('STF-DOC004', 3, '07:00', '15:00', 30), ('STF-DOC004', 4, '07:00', '15:00', 30), ('STF-DOC004', 5, '07:00', '12:00', 30),
  ('STF-DOC005', 1, '10:00', '18:00', 30), ('STF-DOC005', 2, '10:00', '18:00', 30), ('STF-DOC005', 3, '10:00', '18:00', 30), ('STF-DOC005', 4, '10:00', '18:00', 30),
  ('STF-DOC006', 1, '08:00', '14:00', 45), ('STF-DOC006', 2, '08:00', '14:00', 45), ('STF-DOC006', 3, '08:00', '14:00', 45), ('STF-DOC006', 4, '08:00', '14:00', 45), ('STF-DOC006', 5, '08:00', '12:00', 45),
  ('STF-DOC007', 1, '09:00', '17:00', 30), ('STF-DOC007', 2, '09:00', '17:00', 30), ('STF-DOC007', 4, '09:00', '17:00', 30), ('STF-DOC007', 5, '09:00', '13:00', 30)
ON CONFLICT DO NOTHING;

-- Seed Pharmacy Products
INSERT INTO pharmacy_products (name, category, description, price, stock_qty, unit, requires_rx)
VALUES
  ('Paracetamol 500mg', 'Analgesic', 'Pain relief and fever reducer', 150.00, 500, 'tablet (strip of 10)', false),
  ('Amoxicillin 500mg', 'Antibiotic', 'Broad-spectrum antibiotic', 800.00, 200, 'capsule (pack of 21)', true),
  ('Metformin 500mg', 'Antidiabetic', 'Blood sugar management for Type 2 Diabetes', 600.00, 150, 'tablet (pack of 30)', true),
  ('Lisinopril 10mg', 'Antihypertensive', 'Blood pressure management', 750.00, 100, 'tablet (pack of 28)', true),
  ('Vitamin C 1000mg', 'Supplement', 'Immune system support', 400.00, 300, 'tablet (pack of 30)', false),
  ('Ibuprofen 400mg', 'NSAID', 'Anti-inflammatory pain relief', 200.00, 400, 'tablet (strip of 10)', false),
  ('Multivitamin', 'Supplement', 'Daily multivitamin and mineral complex', 1200.00, 250, 'tablet (pack of 60)', false),
  ('Oral Rehydration Salt', 'ORS', 'Electrolyte replacement solution', 100.00, 600, 'sachet', false),
  ('Chloroquine 250mg', 'Antimalarial', 'Malaria treatment and prophylaxis', 350.00, 180, 'tablet (pack of 12)', false),
  ('Zinc Supplement 20mg', 'Supplement', 'Immune support and wound healing', 300.00, 220, 'tablet (pack of 30)', false)
ON CONFLICT DO NOTHING;

-- Seed default beds
INSERT INTO beds (id, facility_id, ward, status) VALUES
  ('A1', 'FAC-PLSH', 'Male Ward', 'available'), ('A2', 'FAC-PLSH', 'Male Ward', 'available'),
  ('A3', 'FAC-PLSH', 'Male Ward', 'available'), ('A4', 'FAC-PLSH', 'Male Ward', 'available'),
  ('F1', 'FAC-PLSH', 'Female Ward', 'available'), ('F2', 'FAC-PLSH', 'Female Ward', 'available'),
  ('F3', 'FAC-PLSH', 'Female Ward', 'available'), ('F4', 'FAC-PLSH', 'Female Ward', 'available'),
  ('P1', 'FAC-PLSH', 'Pediatric Ward', 'available'), ('P2', 'FAC-PLSH', 'Pediatric Ward', 'available'),
  ('ICU-1', 'FAC-PLSH', 'Intensive Care Unit', 'available'), ('ICU-2', 'FAC-PLSH', 'Intensive Care Unit', 'available')
ON CONFLICT (id) DO NOTHING;
