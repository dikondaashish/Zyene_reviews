import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { NotificationForm } from "../../../../components/settings/notification-form";

export default async function NotificationSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Notification Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Configure how and when you want to be alerted about new reviews.
                </p>
            </div>
            <NotificationForm 
                initialPrefs={prefs || {
                    user_id: user.id,
                    email_enabled: true,
                    sms_enabled: false,
                    digest_enabled: false,
                    email_frequency: "instant",
                    min_rating_threshold: 1,
                    min_urgency_for_sms: 7,
                    quiet_hours_start: "22:00",
                    quiet_hours_end: "08:00",
                    sms_phone_number: null,
                    id: "",
                    business_id: ""
                }} 
                userId={user.id} 
            />
        </div>
    );
}
