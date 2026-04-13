-- Align invitations.role CHECK with app + business_members invite roles.
-- Fixes "violates check constraint invitations_role_check" when role is valid in app
-- but DB still has a legacy or mismatched CHECK.

UPDATE public.invitations
SET role = lower(btrim(role))
WHERE role IS NOT NULL;

UPDATE public.invitations
SET role = 'member'
WHERE role NOT IN ('admin', 'manager', 'member', 'viewer');

ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_role_check;

ALTER TABLE public.invitations
  ADD CONSTRAINT invitations_role_check
  CHECK (role IN ('admin', 'manager', 'member', 'viewer'));
