import { cache } from "react";

import { getActiveBusinessId } from "@/lib/auth/business-context";
import { createClient } from "@/lib/db/supabase/server";
import { logger } from "@/lib/logger";
import { getSettingsAccess } from "@/lib/auth/settings-access";

async function loadSettingsAccessContext() {
  const supabase = await createClient();
  const [userResult, activeContext] = await Promise.all([supabase.auth.getUser(), getActiveBusinessId()]);
  const user = userResult.data.user;

  if (!user) {
    return {
      user: null,
      activeContext,
      organizationRole: null,
      businessRole: null,
      access: getSettingsAccess({ organizationRole: null, businessRole: null }),
    };
  }

  const [organizationMembership, businessMembership] = await Promise.all([
    activeContext.organization?.id
      ? supabase
          .from("organization_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("organization_id", activeContext.organization.id)
          .eq("status", "active")
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    activeContext.businessId
      ? supabase
          .from("business_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("business_id", activeContext.businessId)
          .eq("status", "active")
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (organizationMembership.error || businessMembership.error) {
    logger.error(
      { err: organizationMembership.error || businessMembership.error },
      "[Settings access] Membership lookup failed",
    );
  }

  const organizationRole = organizationMembership.data?.role ?? null;
  const businessRole = businessMembership.data?.role ?? null;

  return {
    user,
    activeContext,
    organizationRole,
    businessRole,
    access: getSettingsAccess({ organizationRole, businessRole }),
  };
}

/** Deduplicates membership reads across the dashboard, settings layout, and page. */
export const getSettingsAccessContext = cache(loadSettingsAccessContext);
