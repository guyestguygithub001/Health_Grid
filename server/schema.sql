-- server/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for Facilities
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    lga VARCHAR(100),
    level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active'
);

-- Table for Staff (Users)
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP
);

-- Table for Patients
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE,
    gender VARCHAR(20),
    phone VARCHAR(50),
    address TEXT,
    blood_group VARCHAR(10),
    genotype VARCHAR(10),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

-- Table for Encounters
CREATE TABLE IF NOT EXISTS encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    staff_id UUID REFERENCES staff(id),
    facility_id UUID REFERENCES facilities(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(100),
    notes TEXT,
    diagnosis TEXT,
    status VARCHAR(50) DEFAULT 'completed'
);

-- Table for Beds (Wards)
CREATE TABLE IF NOT EXISTS beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id),
    ward_name VARCHAR(100),
    bed_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available'
);

-- Table for Admissions
CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    bed_id UUID REFERENCES beds(id),
    admitting_doctor_id UUID REFERENCES staff(id),
    admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discharge_date TIMESTAMP,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'admitted'
);

-- Table for Lab Orders & Results
CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id),
    patient_id UUID REFERENCES patients(id),
    ordering_staff_id UUID REFERENCES staff(id),
    test_name VARCHAR(255) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result TEXT,
    result_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Table for Billing & Claims
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    encounter_id UUID REFERENCES encounters(id),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date_issued TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_paid TIMESTAMP,
    status VARCHAR(50) DEFAULT 'unpaid',
    claim_id VARCHAR(100)
);
