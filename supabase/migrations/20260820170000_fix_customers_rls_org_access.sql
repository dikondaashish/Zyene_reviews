-- Align customers SELECT with userCanAccessBusiness(): org members and business
-- members can read customer rows for their businesses.

DROP POLICY IF EXISTS customers_select_for_business_members ON public.customers;

CREATE POLICY customers_select_for_members
ON public.customers
FOR SELECT TO authenticated
USING (
  business_id IN (SELECT public.get_user_business_ids())
  OR business_id IN (
    SELECT b.id
    FROM public.businesses b
    INNER JOIN public.organization_members om
      ON om.organization_id = b.organization_id
     AND om.user_id = auth.uid()
     AND om.status = 'active'
  )
);
