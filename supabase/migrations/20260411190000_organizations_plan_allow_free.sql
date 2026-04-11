-- Stripe webhook sets plan to 'free' on subscription cancel; trial UI also references 'free'.
-- The previous CHECK omitted 'free', which could make those updates fail.

ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;

ALTER TABLE public.organizations ADD CONSTRAINT organizations_plan_check CHECK (
    (plan)::text = ANY (
        ARRAY[
            ('none'::character varying)::text,
            ('free'::character varying)::text,
            ('starter'::character varying)::text,
            ('starter_monthly'::character varying)::text,
            ('starter_yearly'::character varying)::text,
            ('professional_monthly'::character varying)::text,
            ('professional_yearly'::character varying)::text,
            ('enterprise'::character varying)::text,
            ('growth'::character varying)::text,
            ('agency_starter'::character varying)::text,
            ('agency_pro'::character varying)::text,
            ('agency_scale'::character varying)::text
        ]
    )
);
