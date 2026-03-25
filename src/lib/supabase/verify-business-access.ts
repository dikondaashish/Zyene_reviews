import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Verifies if a user has access to a business either via business_members 
 * OR via organization_members of the owning organization.
 */
export async function userCanAccessBusiness(
  supabase: SupabaseClient, 
  userId: string, 
  businessId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("businesses")
    .select(`
        id,
        organizations!inner (
            organization_members!inner (
                user_id
            )
        )
    `)
    .eq("id", businessId)
    .eq("organizations.organization_members.user_id", userId)
    .single();

  if (data && !error) return true;

  // Fallback: check business_members
  const { data: businessMember } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .single();

  return !!businessMember;
}
