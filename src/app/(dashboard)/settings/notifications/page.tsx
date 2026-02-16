import { createClient } from "@/lib/supabase/server";
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
            <NotificationForm initialPrefs={prefs} userId={user.id} />
        </div>
    );
}
