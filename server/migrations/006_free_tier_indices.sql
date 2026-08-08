-- Migration 006: Zero-Cost Optimization (Free Tier Indices)
-- Purpose: Drastically reduce CPU usage for common queries on 0.25 vCPU instances

CREATE INDEX IF NOT EXISTS idx_patients_contact ON patients(phone, email);
CREATE INDEX IF NOT EXISTS idx_patients_regional ON patients(lga, status);
CREATE INDEX IF NOT EXISTS idx_encounters_lookup ON encounters(patient_id, created_at DESC);
