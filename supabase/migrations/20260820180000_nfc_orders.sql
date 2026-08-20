-- NFC hardware orders created by Stripe Checkout (one-time payment).
-- Written only by the service-role webhook; org members can read their own.

CREATE TABLE public.nfc_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 20),
  shipping_id TEXT NOT NULL CHECK (shipping_id IN ('standard', 'expedited')),
  amount_total_cents INTEGER NOT NULL CHECK (amount_total_cents >= 0),
  shipping_cents INTEGER NOT NULL CHECK (shipping_cents >= 0),
  customer_email TEXT,
  customer_name TEXT,
  shipping_name TEXT,
  shipping_address JSONB,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'fulfilled', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX nfc_orders_org_created_idx ON public.nfc_orders (organization_id, created_at DESC);
CREATE INDEX nfc_orders_business_idx ON public.nfc_orders (business_id);

ALTER TABLE public.nfc_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY nfc_orders_select_own_org
  ON public.nfc_orders FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT public.get_user_org_ids())
  );
