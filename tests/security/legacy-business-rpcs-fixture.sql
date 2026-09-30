-- Synthetic tables supporting the real historical RPC migrations.
ALTER TABLE public.organizations ADD COLUMN ai_replies_used_this_month integer DEFAULT 0;
ALTER TABLE public.reviews ADD COLUMN is_visible boolean DEFAULT true;
CREATE FUNCTION public.get_user_business_ids() RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT business_id FROM public.business_members WHERE user_id = auth.uid() AND status = 'active';
$$;
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES public.businesses,
  first_name text, last_name text, email text, phone text, tags text[], notes text,
  is_opted_out boolean DEFAULT false, total_requests_sent integer DEFAULT 0,
  visit_count integer DEFAULT 0, total_spend_cents bigint DEFAULT 0,
  last_request_sent_at timestamptz, last_visit_at timestamptz,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY legacy_customer_access ON public.customers FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_user_business_ids()))
  WITH CHECK (business_id IN (SELECT public.get_user_business_ids()));
CREATE TABLE public.aeo_prompts (id uuid PRIMARY KEY);
-- Unused cron helpers let the historical privilege migration execute unchanged.
CREATE FUNCTION public.acquire_competitor_watch_lock() RETURNS boolean LANGUAGE sql AS $$ SELECT true; $$;
CREATE FUNCTION public.release_competitor_watch_lock() RETURNS void LANGUAGE sql AS $$ SELECT; $$;
CREATE FUNCTION public.increment_customer_requests(uuid, text, text, text) RETURNS void LANGUAGE sql AS $$ SELECT; $$;
