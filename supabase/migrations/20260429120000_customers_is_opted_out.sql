-- Per-customer marketing opt-out (UI + request eligibility). Distinct from sms_opt_outs (carrier-level).
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS is_opted_out boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_customers_business_opted_out
    ON public.customers (business_id)
    WHERE is_opted_out = true;
