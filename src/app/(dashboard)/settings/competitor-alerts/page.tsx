import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { CompetitorAlertsForm } from "@/components/settings/competitor-alerts-form";
import { getSettingsAccessContext } from "@/lib/auth/settings-access-context";

export const metadata = {
  title: "Competitor alerts",
  description: "Thresholds for competitor monitoring alerts.",
};

export default async function CompetitorAlertsSettingsPage() {
  const { user, activeContext, access } = await getSettingsAccessContext();
  if (!user) redirect("/login");
  if (!access.competitorAlerts) redirect("/settings/general");
  const businessId = activeContext.businessId;
  if (!businessId) redirect("/settings/general");

  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("competitor_watch_settings")
    .select("rating_alert_delta, review_spike_threshold, email_alerts_enabled")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) {
    logger.error({ err: error }, "[competitor-alerts settings]");
    return (
      <DashboardFetchError
        message="Could not load competitor alert settings."
        retryHref="/settings/competitor-alerts"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Competitor alerts</h3>
        <p className="text-sm text-muted-foreground max-w-xl">
          When the daily competitor job detects a rating jump or review spike
          above these thresholds, we record an alert and optionally email your
          team. Tune values for your market (noisy vs quiet competitors).
        </p>
      </div>
      <CompetitorAlertsForm
        businessId={businessId}
        initialRatingDelta={Number(settings?.rating_alert_delta ?? 0.2)}
        initialReviewSpike={Number(settings?.review_spike_threshold ?? 20)}
        initialEmailEnabled={settings?.email_alerts_enabled !== false}
      />
    </div>
  );
}
