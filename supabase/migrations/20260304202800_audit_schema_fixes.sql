-- ============================================================
-- Audit Fix Migration: Schema Alignment & Missing Objects
-- FIX 2.2: Create invitations table
-- FIX 2.3: Rename opt_outs → sms_opt_outs + column phone → phone_number
-- FIX 2.4: Add missing campaign + review_request columns
-- FIX 2.5: Add RLS DELETE policies
-- ============================================================

-- -----------------------------------------------
-- FIX 2.2: Create invitations table
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    "email"           TEXT NOT NULL,
    "role"            VARCHAR(20) NOT NULL DEFAULT 'member'
                        CHECK (role IN ('admin','manager','member','viewer')),
    "token"           TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    "invited_by"      UUID REFERENCES users(id) ON DELETE SET NULL,
    "accepted_at"     TIMESTAMPTZ,
    "expires_at"      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, email)
);

ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_select ON invitations
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY invitations_insert ON invitations
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin')
        AND status = 'active'
    )
  );

CREATE POLICY invitations_delete ON invitations
  FOR DELETE USING (organization_id IN (SELECT get_user_org_ids()));

CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- -----------------------------------------------
-- FIX 2.3: Rename opt_outs → sms_opt_outs, phone → phone_number
-- -----------------------------------------------
ALTER TABLE IF EXISTS "public"."opt_outs" RENAME TO "sms_opt_outs";
ALTER TABLE IF EXISTS "public"."sms_opt_outs" RENAME COLUMN "phone" TO "phone_number";

-- -----------------------------------------------
-- FIX 2.4: Add missing campaign + review_request columns
-- -----------------------------------------------

-- Campaign columns for follow-up sequences
ALTER TABLE "public"."campaigns"
  ADD COLUMN IF NOT EXISTS "follow_up_enabled"     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "follow_up_delay_hours"  INT NOT NULL DEFAULT 72,
  ADD COLUMN IF NOT EXISTS "follow_up_template"     TEXT,
  ADD COLUMN IF NOT EXISTS "delay_minutes"          INT NOT NULL DEFAULT 0;

-- Review request columns for follow-up tracking
ALTER TABLE "public"."review_requests"
  ADD COLUMN IF NOT EXISTS "is_follow_up_sent" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "follow_up_sent_at" TIMESTAMPTZ;

-- Add status 'sending' and 'skipped' + 'processing' to campaigns if not present
-- (Postgres doesn't easily ALTER CHECK constraints, so we drop and re-add)
ALTER TABLE "public"."review_requests" DROP CONSTRAINT IF EXISTS review_requests_status_check;
ALTER TABLE "public"."review_requests"
  ADD CONSTRAINT review_requests_status_check
  CHECK (status IN ('queued','sending','sent','delivered','opened',
                    'clicked','review_left','failed','skipped'));

ALTER TABLE "public"."campaigns" DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE "public"."campaigns"
  ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('active','paused','completed','processing'));

-- -----------------------------------------------
-- FIX 2.5: Add RLS DELETE policies for user-owned tables
-- -----------------------------------------------

-- campaigns: org members can delete their campaigns
CREATE POLICY campaigns_delete ON campaigns
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- review_requests: org members can delete their requests
CREATE POLICY review_requests_delete ON review_requests
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- notification_preferences: users can delete their own preferences
CREATE POLICY notif_prefs_delete ON notification_preferences
  FOR DELETE USING (user_id = auth.uid());

-- organization_members: admins/owners can remove members
CREATE POLICY org_members_delete ON organization_members
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin')
        AND status = 'active'
    )
  );

-- customers: org members can delete customers
CREATE POLICY customers_delete ON customers
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- integrations: org members can delete integrations
CREATE POLICY integrations_delete ON integrations
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- ============================================================
-- DONE ✓
-- ============================================================
