import { getActiveBusinessId } from "@/lib/auth/business-context";
import { createAdminClient } from "@/lib/db/supabase/admin";

export type ActiveBillingMember = {
  organization_id: string;
  role: string;
  organizations: {
    id: string;
    name: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    referred_by_user_id: string | null;
  } | null;
};

export type ActiveBillingMemberResult =
  | { kind: "no-active-organization" }
  | {
      kind: "ok";
      admin: ReturnType<typeof createAdminClient>;
      member: ActiveBillingMember | null;
    };

/** Resolves billing membership against the organization selected in the app header. */
export async function loadActiveBillingMember(userId: string): Promise<ActiveBillingMemberResult> {
  const { organization } = await getActiveBusinessId({ skipCache: true });
  if (!organization?.id) return { kind: "no-active-organization" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organization_members")
    .select("organization_id, role, organizations(*)")
    .eq("user_id", userId)
    .eq("organization_id", organization.id)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return {
    kind: "ok",
    admin,
    member: data as unknown as ActiveBillingMember | null,
  };
}
