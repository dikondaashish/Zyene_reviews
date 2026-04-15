import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { CompetitorAlertsForm } from "@/components/settings/competitor-alerts-form";
import { Target } from "lucide-react";
import { canManageCompetitorWatchSettings } from "@/lib/competitors/watch-access";

export const metadata = {
    title: "Competitor alerts - Zyene Reviews",
    description: "Thresholds for competitor monitoring alerts.",
};

export default async function CompetitorAlertsSettingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId } = await getActiveBusinessId();
    if (!businessId) {
        return (
            <BusinessContextEmptyState
                icon={Target}
                title="Add a business"
                description="Competitor alert settings apply to the business selected in the header."
            />
        );
    }

    const { data: member } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (!member || !canManageCompetitorWatchSettings(member.role)) {
        return (
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Competitor alerts</h3>
                <p className="text-sm text-muted-foreground">
                    Only business owners and admins can change these settings.
                </p>
            </div>
        );
    }

    const { data: settings, error } = await supabase
        .from("competitor_watch_settings")
        .select("rating_alert_delta, review_spike_threshold, email_alerts_enabled")
        .eq("business_id", businessId)
        .maybeSingle();

    if (error) {
        console.error("[competitor-alerts settings]", error);
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
                    When the daily competitor job detects a rating jump or review spike above these thresholds, we record
                    an alert and optionally email your team. Tune values for your market (noisy vs quiet competitors).
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
