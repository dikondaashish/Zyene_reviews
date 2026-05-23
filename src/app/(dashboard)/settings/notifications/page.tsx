import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { NotificationForm } from "@/components/settings/notification-form";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { Bell } from "lucide-react";

export default async function NotificationSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
        return null; // Satisfy TS compiler
    }

    const { businessId } = await getActiveBusinessId();
    if (!businessId) {
        return (
            <BusinessContextEmptyState
                icon={Bell}
                title="Add a business for notification settings"
                description="Email and SMS preferences are saved per business. Create a location first, then configure alerts for that business."
            />
        );
    }

    const [{ data: prefs, error: prefsError }, { data: profile, error: profileError }] = await Promise.all([
        supabase
            .from("notification_preferences")
            .select("*")
            .eq("user_id", user.id)
            .eq("business_id", businessId)
            .maybeSingle(),
        supabase.from("users").select("phone").eq("id", user.id).maybeSingle(),
    ]);

    if (prefsError || (profileError && profileError.code !== "PGRST116")) {
        logger.error({ err: prefsError || profileError }, "[Notification settings] Fetch failed:");
        return (
            <DashboardFetchError
                message="We could not load notification settings. Check your connection and try again."
                retryHref="/settings/notifications"
            />
        );
    }

    const profilePhone = profile?.phone?.trim() || null;
    const mergedPrefs = prefs
        ? {
              ...prefs,
              sms_phone_number: prefs.sms_phone_number?.trim() || profilePhone,
          }
        : {
              user_id: user.id,
              email_enabled: true,
              sms_enabled: true,
              digest_enabled: true,
              email_frequency: "instant",
              min_rating_threshold: 1,
              min_urgency_for_sms: 7,
              quiet_hours_start: "22:00",
              quiet_hours_end: "08:00",
              sms_phone_number: profilePhone,
              id: "",
              business_id: businessId,
          };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Notification Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Configure how and when you want to be alerted about new reviews.
                </p>
                <p className="text-xs text-muted-foreground mt-2 max-w-lg">
                    If you signed up with Google, add your mobile number below (and turn on SMS alerts) to receive
                    urgent review texts—Google sign-up doesn&apos;t collect your phone.
                </p>
            </div>
            <NotificationForm
                businessId={businessId}
                key={businessId}
                initialPrefs={mergedPrefs}
                userId={user.id}
            />
        </div>
    );
}
