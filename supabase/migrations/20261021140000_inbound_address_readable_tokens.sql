-- apply-plan: already-applied — applied to production 2026-10-21 via the Supabase MCP (recorded as version 20261021174042), before this PR merged.
-- Readable invoice-copy enrollment addresses: <business-slug>-<4-char code>@<inbound domain>
-- (e.g. willow-hair-studio-k7m2). Existing 16-40 char hex tokens stay valid and keep working.
ALTER TABLE public.business_inbound_addresses
  DROP CONSTRAINT IF EXISTS business_inbound_addresses_address_token_check;

ALTER TABLE public.business_inbound_addresses
  ADD CONSTRAINT business_inbound_addresses_address_token_check CHECK (
    address_token ~ '^[a-z0-9]{16,40}$'
    OR address_token ~ '^[a-z0-9]([a-z0-9-]{0,56}[a-z0-9])?-[a-z0-9]{4}$'
  );
