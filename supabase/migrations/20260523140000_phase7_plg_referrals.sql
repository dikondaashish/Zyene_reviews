-- Phase 7: Referral program + free-tool lead capture

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_referred_by
    ON organizations (referred_by_user_id)
    WHERE referred_by_user_id IS NOT NULL;

COMMENT ON COLUMN organizations.referred_by_user_id IS 'Phase 7: referrer user id from ?ref= at signup';

CREATE TABLE IF NOT EXISTS referral_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    referee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    converted_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ,
    CONSTRAINT referral_conversions_referee_org_unique UNIQUE (referee_organization_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_conversions_referrer
    ON referral_conversions (referrer_user_id, status);

ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages referral_conversions"
    ON referral_conversions
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Extend marketing_subscribers for free-tool leads (same table, different sources)
COMMENT ON COLUMN marketing_subscribers.source IS 'newsletter, partners_page, tool_review_link, tool_reputation_score, tool_review_response, etc.';
