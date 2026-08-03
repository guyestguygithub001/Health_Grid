-- Migration 003: Extended patient demographic fields for intake registration
-- Adds: tribe/ethnicity, religion, marital_status, next_of_kin_relationship

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS tribe              VARCHAR(100),
  ADD COLUMN IF NOT EXISTS religion           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS marital_status     VARCHAR(50),
  ADD COLUMN IF NOT EXISTS next_of_kin_relationship VARCHAR(50);
