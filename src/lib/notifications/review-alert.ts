import { createAdminClient } from "@/lib/supabase/admin";
import { sendSMS } from "@/lib/twilio/send-sms";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendReviewAlert(review: any) {
    // Logic: Urgency >= 7 OR Rating <= 2
    const urgency = review.urgency_score || 0;
    const rating = review.rating || 5;

    // Check if worthy of alert (Hardcoded baseline, can be overridden by user prefs)
    const isUrgent = urgency >= 7 || rating <= 2;

    if (!isUrgent) return;

    const admin = createAdminClient();

    // Get Business Owner(s)
    // Link: review.business_id -> businesses -> organizations -> organization_members -> users -> notification_preferences
    // Complex query.

    // 1. Get Organization ID from Business
    const { data: business } = await admin
        .from("businesses")
        .select("organization_id, name")
        .eq("id", review.business_id)
        .single();

    if (!business) return;

    // 2. Get Users in Organization
    const { data: members } = await admin
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", business.organization_id);

    if (!members || members.length === 0) return;

    const userIds = members.map(m => m.user_id);

    // 3. Get Notification Preferences for these users
    const { data: prefs } = await admin
        .from("notification_preferences")
        .select("*")
        .in("user_id", userIds)
        .eq("sms_enabled", true);

    if (!prefs || prefs.length === 0) return;

    // 4. Send Alerts
    for (const pref of prefs) {
        // User specific urgency threshold
        const userThreshold = pref.min_urgency_score || 7;
        // If rating is low (<=2), it's always urgent regardless of score? 
        // Or strictly follow score? User requirement says: "If review.urgency_score >= 7 (or rating <= 2)"
        // But user pref says "Minimum urgency".
        // I'll stick to: If (urgency >= userThreshold OR rating <= 2)

        if (urgency >= userThreshold || rating <= 2) {
            // Check Quiet Hours
            if (pref.quiet_hours_start && pref.quiet_hours_end) {
                const now = new Date();
                const currentHours = now.getHours();
                const currentMinutes = now.getMinutes();
                const currentTime = currentHours * 60 + currentMinutes;

                const [startH, startM] = pref.quiet_hours_start.split(":").map(Number);
                const [endH, endM] = pref.quiet_hours_end.split(":").map(Number);
                const startTime = startH * 60 + startM;
                const endTime = endH * 60 + endM;

                // Handle crossover midnight (e.g. 22:00 to 07:00)
                let inQuietHours = false;
                if (startTime < endTime) {
                    inQuietHours = currentTime >= startTime && currentTime <= endTime;
                } else {
                    // Crossover
                    inQuietHours = currentTime >= startTime || currentTime <= endTime;
                }

                if (inQuietHours) {
                    console.log(`[Alert] Skipped for user ${pref.user_id} due to quiet hours.`);
                    continue;
                }
            }

            if (pref.phone_number) {
                const snippet = review.content ? review.content.substring(0, 80) : "";
                const body = `⚠️ New ${rating}★ review for ${business.name}:\n"${snippet}..."\n— ${review.author_name}\nReply: ${APP_URL}/reviews`;

                const result = await sendSMS(pref.phone_number, body);

                if (result.sent) {
                    await admin.from("reviews").update({
                        alert_sent: true,
                        alert_sent_at: new Date().toISOString()
                    }).eq("id", review.id);
                }
            }
        }
    }
}
