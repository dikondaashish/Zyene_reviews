-- Create competitors table
CREATE TABLE competitors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    google_url TEXT,
    average_rating NUMERIC(3,1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view competitors for their businesses"
    ON competitors FOR SELECT
    USING (
        business_id IN (
            SELECT business_id FROM business_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage competitors for their businesses"
    ON competitors FOR ALL
    USING (
        business_id IN (
            SELECT business_id FROM business_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
