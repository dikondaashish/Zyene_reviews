-- ============================================================
-- Zyene Ratings — Initial Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TRIGGER FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- -----------------------------------------------
-- 2a. organizations
-- -----------------------------------------------
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  type          VARCHAR(20) NOT NULL DEFAULT 'business'
                  CHECK (type IN ('business', 'agency')),

  -- Stripe billing
  stripe_customer_id     VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),

  -- Plan & limits
  plan          VARCHAR(50) NOT NULL DEFAULT 'free'
                  CHECK (plan IN ('free','starter','growth',
                                  'agency_starter','agency_pro','agency_scale')),
  plan_status   VARCHAR(20) NOT NULL DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  max_businesses              INT NOT NULL DEFAULT 1,
  max_team_members            INT NOT NULL DEFAULT 1,
  max_review_requests_per_month INT NOT NULL DEFAULT 10,
  max_ai_replies_per_month    INT NOT NULL DEFAULT 0,

  -- White-label / branding
  custom_domain  VARCHAR(255) UNIQUE,
  logo_url       TEXT,
  primary_color  VARCHAR(7) NOT NULL DEFAULT '#2563EB',
  support_email  VARCHAR(255),
  hide_powered_by BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- 2b. users (linked to auth.users)
-- -----------------------------------------------
CREATE TABLE users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      VARCHAR(255) NOT NULL,
  full_name  VARCHAR(255),
  avatar_url TEXT,
  phone      VARCHAR(50),
  timezone   VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- 2c. organization_members
-- -----------------------------------------------
CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner','admin','manager','member','viewer')),
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','invited','suspended')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (organization_id, user_id)
);

-- -----------------------------------------------
-- 2d. businesses
-- -----------------------------------------------
CREATE TABLE businesses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(100) NOT NULL,
  phone           VARCHAR(50),
  email           VARCHAR(255),
  website         VARCHAR(500),
  address_line1   VARCHAR(255),
  city            VARCHAR(100),
  state           VARCHAR(50),
  zip             VARCHAR(20),
  country         VARCHAR(2) NOT NULL DEFAULT 'US',
  timezone        VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
  category        VARCHAR(100) NOT NULL DEFAULT 'restaurant',

  -- Review-request settings
  review_request_delay_minutes    INT NOT NULL DEFAULT 120,
  review_request_min_amount_cents INT NOT NULL DEFAULT 1500,
  review_request_frequency_cap_days INT NOT NULL DEFAULT 30,
  review_request_sms_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  review_request_email_enabled    BOOLEAN NOT NULL DEFAULT FALSE,

  -- Cached metrics
  total_reviews  INT NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,

  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (organization_id, slug)
);

-- -----------------------------------------------
-- 2e. review_platforms
-- -----------------------------------------------
CREATE TABLE review_platforms (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform       VARCHAR(30) NOT NULL
                   CHECK (platform IN ('google','yelp','facebook')),
  external_id    VARCHAR(500),
  external_url   VARCHAR(1000),
  access_token   TEXT,
  refresh_token  TEXT,
  token_expires_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  sync_status    VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_reviews  INT NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (business_id, platform)
);

-- -----------------------------------------------
-- 2f. reviews
-- -----------------------------------------------
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform_id     UUID REFERENCES review_platforms(id) ON DELETE SET NULL,
  platform        VARCHAR(30) NOT NULL,
  external_id     VARCHAR(500),
  external_url    VARCHAR(1000),
  author_name     VARCHAR(255),
  author_avatar_url TEXT,

  rating          INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text            TEXT,

  -- AI analysis
  sentiment       VARCHAR(20) CHECK (sentiment IN ('positive','neutral','negative','mixed')),
  urgency_score   INT CHECK (urgency_score >= 1 AND urgency_score <= 10),
  themes          TEXT[],
  ai_summary      TEXT,

  -- Response tracking
  response_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (response_status IN ('pending','draft_ready','responded','ignored')),
  responded_at    TIMESTAMPTZ,
  response_text   TEXT,

  review_date     TIMESTAMPTZ NOT NULL,

  -- Alert tracking
  alert_sent      BOOLEAN NOT NULL DEFAULT FALSE,
  alert_sent_at   TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (business_id, platform, external_id)
);

-- -----------------------------------------------
-- 2g. campaigns
-- -----------------------------------------------
CREATE TABLE campaigns (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','paused','completed')),
  trigger_type   VARCHAR(20) NOT NULL DEFAULT 'manual'
                   CHECK (trigger_type IN ('manual','pos_payment','scheduled')),
  channel        VARCHAR(10) NOT NULL DEFAULT 'sms'
                   CHECK (channel IN ('sms','email','both')),
  sms_template   TEXT,
  email_subject  VARCHAR(255),
  email_template TEXT,

  -- Metrics
  total_sent             INT NOT NULL DEFAULT 0,
  total_opened           INT NOT NULL DEFAULT 0,
  total_clicked          INT NOT NULL DEFAULT 0,
  total_reviews_received INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- 2h. review_requests
-- -----------------------------------------------
CREATE TABLE review_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  customer_phone  VARCHAR(50),
  customer_email  VARCHAR(255),
  customer_name   VARCHAR(255),
  trigger_source  VARCHAR(20) NOT NULL DEFAULT 'manual'
                    CHECK (trigger_source IN ('manual','campaign','pos_square','zapier')),
  channel         VARCHAR(10) NOT NULL DEFAULT 'sms'
                    CHECK (channel IN ('sms','email')),
  status          VARCHAR(20) NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued','sent','delivered','opened',
                                      'clicked','review_left','failed')),

  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  opened_at       TIMESTAMPTZ,
  clicked_at      TIMESTAMPTZ,

  review_link     VARCHAR(500),
  review_left     BOOLEAN NOT NULL DEFAULT FALSE,
  error_message   TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_for   TIMESTAMPTZ
);

-- -----------------------------------------------
-- 2i. opt_outs
-- -----------------------------------------------
CREATE TABLE opt_outs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone        VARCHAR(50) NOT NULL UNIQUE,
  opted_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source       VARCHAR(50)
);

-- -----------------------------------------------
-- 2j. notification_preferences
-- -----------------------------------------------
CREATE TABLE notification_preferences (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sms_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  min_urgency_for_sms INT NOT NULL DEFAULT 7,
  digest_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  quiet_hours_start   TIME NOT NULL DEFAULT '22:00',
  quiet_hours_end     TIME NOT NULL DEFAULT '07:00',

  UNIQUE (user_id, business_id)
);

-- -----------------------------------------------
-- 2k. events (append-only audit log)
-- -----------------------------------------------
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_id     UUID REFERENCES businesses(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type      VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(50),
  entity_id       UUID,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- 2l. integrations (POS connections)
-- -----------------------------------------------
CREATE TABLE integrations (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id          UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform             VARCHAR(30) NOT NULL
                         CHECK (platform IN ('square','clover','toast','stripe','zapier')),
  access_token         TEXT,
  refresh_token        TEXT,
  external_merchant_id VARCHAR(255),
  webhook_secret       VARCHAR(255),
  api_key              VARCHAR(255),
  status               VARCHAR(20) NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','disconnected','error')),
  last_event_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. INDEXES
-- ============================================================

-- organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);

-- organization_members
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);

-- businesses
CREATE INDEX idx_businesses_org_id ON businesses(organization_id);
CREATE INDEX idx_businesses_slug ON businesses(organization_id, slug);

-- reviews
CREATE INDEX idx_reviews_business_date ON reviews(business_id, review_date DESC);
CREATE INDEX idx_reviews_business_rating ON reviews(business_id, rating);
CREATE INDEX idx_reviews_response_status ON reviews(business_id, response_status);
CREATE INDEX idx_reviews_sentiment ON reviews(business_id, sentiment);

-- review_platforms
CREATE INDEX idx_review_platforms_business ON review_platforms(business_id);

-- review_requests
CREATE INDEX idx_review_requests_business ON review_requests(business_id);
CREATE INDEX idx_review_requests_status ON review_requests(business_id, status);
CREATE INDEX idx_review_requests_scheduled ON review_requests(scheduled_for)
  WHERE scheduled_for IS NOT NULL AND status = 'queued';

-- campaigns
CREATE INDEX idx_campaigns_business ON campaigns(business_id);

-- events
CREATE INDEX idx_events_org_created ON events(organization_id, created_at DESC);
CREATE INDEX idx_events_business ON events(business_id, created_at DESC);
CREATE INDEX idx_events_type ON events(event_type);

-- integrations
CREATE INDEX idx_integrations_business ON integrations(business_id);

-- notification_preferences
CREATE INDEX idx_notif_prefs_user ON notification_preferences(user_id);


-- ============================================================
-- 4. TRIGGERS: updated_at
-- ============================================================

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_platforms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns               ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE opt_outs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations            ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 6. HELPER FUNCTION: get_user_org_ids()
-- Returns all organization IDs the current auth user belongs to
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
    AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- 7. RLS POLICIES
-- ============================================================

-- -----------------------------------------------
-- users: read/update own profile
-- -----------------------------------------------
CREATE POLICY users_select_own ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY users_insert_own ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- -----------------------------------------------
-- organizations: members can see their orgs
-- -----------------------------------------------
CREATE POLICY orgs_select_member ON organizations
  FOR SELECT USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY orgs_update_admin ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin')
        AND status = 'active'
    )
  );

-- -----------------------------------------------
-- organization_members: see own memberships
-- -----------------------------------------------
CREATE POLICY org_members_select ON organization_members
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY org_members_insert ON organization_members
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin')
        AND status = 'active'
    )
  );

-- -----------------------------------------------
-- businesses: members can see businesses in their orgs
-- -----------------------------------------------
CREATE POLICY businesses_select ON businesses
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY businesses_insert ON businesses
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY businesses_update ON businesses
  FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids()));

-- -----------------------------------------------
-- review_platforms: via business → org membership
-- -----------------------------------------------
CREATE POLICY review_platforms_select ON review_platforms
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- -----------------------------------------------
-- reviews: via business → org membership
-- -----------------------------------------------
CREATE POLICY reviews_select ON reviews
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY reviews_update ON reviews
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- -----------------------------------------------
-- campaigns: via business → org membership
-- -----------------------------------------------
CREATE POLICY campaigns_select ON campaigns
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY campaigns_insert ON campaigns
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY campaigns_update ON campaigns
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- -----------------------------------------------
-- review_requests: via business → org membership
-- -----------------------------------------------
CREATE POLICY review_requests_select ON review_requests
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY review_requests_insert ON review_requests
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- -----------------------------------------------
-- opt_outs: service-role only (no user access)
-- -----------------------------------------------
-- No user-facing policies; managed via service_role key

-- -----------------------------------------------
-- notification_preferences: own preferences
-- -----------------------------------------------
CREATE POLICY notif_prefs_select ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notif_prefs_insert ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY notif_prefs_update ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- -----------------------------------------------
-- events: via org membership
-- -----------------------------------------------
CREATE POLICY events_select ON events
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

-- -----------------------------------------------
-- integrations: via business → org membership
-- -----------------------------------------------
CREATE POLICY integrations_select ON integrations
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY integrations_insert ON integrations
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY integrations_update ON integrations
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- ============================================================
-- DONE ✓
-- ============================================================
