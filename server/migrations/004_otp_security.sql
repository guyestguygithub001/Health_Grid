-- Migration: 004_otp_security
-- Purpose: Adds columns to track failed OTP attempts, rate limiting, and brute-force lockouts.

ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS otp_failed_attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS otp_request_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS otp_last_requested_at TIMESTAMPTZ;
