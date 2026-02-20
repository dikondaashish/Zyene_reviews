
-- Create private_feedback table
CREATE TABLE IF NOT EXISTS private_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    review_request_id UUID REFERENCES review_requests(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE private_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert feedback (public review flow)
CREATE POLICY "Anyone can insert feedback" 
ON private_feedback FOR INSERT 
TO public 
WITH CHECK (true);

-- Policy: Only business owners can view feedback for their business
CREATE POLICY "Business owners can view their feedback" 
ON private_feedback FOR SELECT 
TO authenticated 
USING (
    business_id IN (
        SELECT b.id
        FROM businesses b
        JOIN organization_members om ON b.organization_id = om.organization_id
        WHERE om.user_id = auth.uid()
    )
);
