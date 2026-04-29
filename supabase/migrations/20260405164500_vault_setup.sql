-- ============================================================
-- Migration: Setup Private Vault Schema & Tables
-- ============================================================

-- 1. Create internal schema (private)
CREATE SCHEMA IF NOT EXISTS internal;

-- 2. Create vault_config table
CREATE TABLE IF NOT EXISTS internal.vault_config (
  id      TEXT PRIMARY KEY DEFAULT 'primary',
  key_val TEXT NOT NULL,
  CONSTRAINT single_row CHECK (id = 'primary')
);

-- 3. Insert the encryption key
-- Provided: VdKHWT2/rd4bEF7OtZmhDo65Xcci+6Ym+FhT/B/EyFY=
INSERT INTO internal.vault_config (id, key_val)
VALUES ('primary', 'VdKHWT2/rd4bEF7OtZmhDo65Xcci+6Ym+FhT/B/EyFY=')
ON CONFLICT (id) DO UPDATE SET key_val = EXCLUDED.key_val;

-- 4. Revoke access from PUBLIC and authenticated roles
REVOKE ALL ON SCHEMA internal FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA internal FROM PUBLIC;
GRANT USAGE ON SCHEMA internal TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA internal TO postgres, service_role;
