-- Migration 005: Add nationality and ethnicity for MPI fallback support
ALTER TABLE patients ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS ethnicity VARCHAR(100);
