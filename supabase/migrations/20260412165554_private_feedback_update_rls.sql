-- Allow dashboard users (org members) to update private_feedback status.
-- API route uses the authenticated Supabase client; this policy replaces reliance on service role.

CREATE POLICY "Organization members can update their business private feedback"
ON public.private_feedback
FOR UPDATE
TO authenticated
USING (
    business_id IN (
        SELECT b.id
        FROM public.businesses b
        JOIN public.organization_members om ON b.organization_id = om.organization_id
        WHERE om.user_id = auth.uid()
    )
)
WITH CHECK (
    business_id IN (
        SELECT b.id
        FROM public.businesses b
        JOIN public.organization_members om ON b.organization_id = om.organization_id
        WHERE om.user_id = auth.uid()
    )
);
