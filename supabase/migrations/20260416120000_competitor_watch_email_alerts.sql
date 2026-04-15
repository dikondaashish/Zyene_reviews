-- Optional email notifications when competitor threshold alerts fire.

ALTER TABLE public.competitor_watch_settings
  ADD COLUMN IF NOT EXISTS email_alerts_enabled BOOLEAN NOT NULL DEFAULT true;
