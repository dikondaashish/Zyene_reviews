-- Migration: 20260219155000_create_invitations
-- Description: Create invitations table which was missing from initial schema

CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    token VARCHAR(100) NOT NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "View invitations for own org" ON invitations
    FOR SELECT USING (
        organization_id IN (SELECT get_user_org_ids())
    );

CREATE POLICY "Manage invitations for own org" ON invitations
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('ORG_OWNER', 'ORG_MANAGER', 'owner', 'admin')
        )
    );
