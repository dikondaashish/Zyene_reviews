import { redirect } from "next/navigation";
import { BillingClient } from "@/components/settings/billing-client";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { getSettingsAccessContext } from "@/lib/auth/settings-access-context";
import { loadBillingPageData } from "./load-billing-page-data";

export default async function BillingPage() {
  const { user, activeContext, access } = await getSettingsAccessContext();

  if (!user) redirect("/login");
  if (!access.billing) redirect("/settings/general");

  const activeOrganizationId = activeContext.organization?.id;
  if (!activeOrganizationId) {
    return <div className="p-4">No active organization found. Please contact support.</div>;
  }

  const data = await loadBillingPageData(user.id, activeOrganizationId);

  if (data.kind === "member-error") {
    return (
      <DashboardFetchError
        message="We could not load billing membership details. Check your connection and try again."
        retryHref="/settings/billing"
      />
    );
  }

  if (data.kind === "no-org") {
    return <div className="p-4">No organization found. Please contact support.</div>;
  }

  if (data.kind === "org-refresh-error") {
    return (
      <DashboardFetchError
        message="We could not load current billing details. Check your connection and try again."
        retryHref="/settings/billing"
      />
    );
  }

  return <BillingClient {...data.clientProps} />;
}
