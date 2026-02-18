import { createAdminClient } from "@/lib/supabase/admin";
import { sendSMS } from "@/lib/twilio/send-sms";
import { sendEmail } from "@/lib/resend/send-email";
import { reviewAlertEmail } from "@/lib/resend/templates/review-alert-email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendReviewAlert(review: any) {
    // Logic: Urgency >= 7 OR Rating <= 2 -> SMS + Email
    // Urgency 4-6 -> Email only
    // Urgency 1-3 -> Daily Digest (Skip here)

    const urgency = review.urgency_score || 0;
    const rating = review.rating || 5;

    // Determine alert level
    const isHighUrgency = urgency >= 7 || rating <= 2;
    const isMediumUrgency = urgency >= 4 && urgency < 7;

    if (!isHighUrgency && !isMediumUrgency) return;

    const admin = createAdminClient();

    // 1. Get Organization ID from Business
    const { data: business } = await admin
        .from("businesses")
        .select("organization_id, name, slug")
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

    // 3. Get Notification Preferences & Emails for these users
    // Assuming foreign key relationship exists, otherwise fetch email separately
    const { data: prefs } = await admin
        .from("notification_preferences")
        .select(`
            *,
            users (
                email
            )
        `)
        .in("user_id", userIds);

    if (!prefs || prefs.length === 0) return;

    interface NotificationPreference {
        users: { email: string } | null;
        quiet_hours_start?: string | null;
        quiet_hours_end?: string | null;
        sms_enabled?: boolean;
        phone_number?: string | null;
        email_enabled?: boolean;
    }

    // 4. Send Alerts
    for (const rawPref of prefs) {
        const pref = rawPref as unknown as NotificationPreference;
        const userEmail = pref.users?.email;

        // Check Quiet Hours (Applies to SMS only? Or both? Usually accurate alerts ignore strict quiet hours, or just SMS. 
        // User didn't specify quiet hours for email. I'll apply to SMS only as email is less intrusive.)
        let inQuietHours = false;
        if (pref.quiet_hours_start && pref.quiet_hours_end) {
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTime = currentHours * 60 + currentMinutes;

            const [startH, startM] = pref.quiet_hours_start.split(":").map(Number);
            const [endH, endM] = pref.quiet_hours_end.split(":").map(Number);
            const startTime = startH * 60 + startM;
            const endTime = endH * 60 + endM;

            if (startTime < endTime) {
                inQuietHours = currentTime >= startTime && currentTime <= endTime;
            } else {
                inQuietHours = currentTime >= startTime || currentTime <= endTime;
            }
        }

        // --- SMS ALERT (High Urgency Only & SMS Enabled) ---
        if (isHighUrgency && pref.sms_enabled && pref.phone_number && !inQuietHours) {
            const snippet = review.text ? review.text.substring(0, 80) : "";
            const body = `⚠️ New ${rating}★ review for ${business.name}:\n"${snippet}..."\n— ${review.author_name}\nReply: ${APP_URL}/dashboard`;

            await sendSMS(pref.phone_number, body);
        }

        // --- EMAIL ALERT (High or Medium Urgency & Email Enabled) ---
        // Default to true if email_enabled is undefined (legacy records)
        const emailEnabled = pref.email_enabled !== false;

        if ((isHighUrgency || isMediumUrgency) && emailEnabled && userEmail) {
            const emailHtml = reviewAlertEmail({
                businessName: business.name,
                rating: rating,
                authorName: review.author_name,
                reviewText: review.text,
                urgencyScore: urgency,
                dashboardUrl: `${APP_URL}/dashboard`,
                settingsUrl: `${APP_URL}/settings/notifications`
            });

            await sendEmail({
                to: userEmail,
                subject: `New Review for ${business.name} (${rating}★)`,
                html: emailHtml
            });
        }
    }

    // Update alert_sent status
    await admin.from("reviews").update({
        alert_sent: true,
        alert_sent_at: new Date().toISOString()
    }).eq("id", review.id);
}
