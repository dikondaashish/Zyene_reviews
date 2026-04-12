import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendSMS } from "@/services/twilio/send-sms";
import { sendEmail } from "@/services/resend/send-email";
import { reviewAlertEmail } from "@/services/resend/templates/review-alert-email";
import type {
    NotificationPreference,
    ReviewAlertPayload,
} from "@/types/notifications";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendReviewAlert(review: ReviewAlertPayload) {
    console.log(`📡 Dispatching alert for business: ${review.business_id}`);
    
    // Logic: Urgency >= 7 OR Rating <= 2 -> SMS + Email
    const urgency = review.urgency_score || 0;
    const rating = review.rating || 5;
    const isPrivateFeedback = review.text?.startsWith("[PRIVATE FEEDBACK]");

    const admin = createAdminClient();

    // 1. Get Organization ID from Business
    const { data: business } = await admin
        .from("businesses")
        .select("organization_id, name, slug")
        .eq("id", review.business_id)
        .single();

    if (!business) {
        console.error("❌ Business not found for alert:", review.business_id);
        return;
    }

    console.log(`🏢 Organization ID: ${business.organization_id}`);

    // 2. Get Users in Organization
    const { data: members, error: membersErr } = await admin
        .from("organization_members")
        .select(`
            user_id,
            role,
            users (
                email,
                full_name
            )
        `)
        .eq("organization_id", business.organization_id)
        .eq("status", "active");

    if (membersErr || !members || members.length === 0) {
        console.error("❌ No active members found for organization:", business.organization_id);
        return;
    }

    console.log(`👥 Found ${members.length} organization members.`);

    const userIds = members.map(m => m.user_id);

    // 3. Get Notification Preferences for these users
    const { data: prefs, error: prefsErr } = await admin
        .from("notification_preferences")
        .select("*")
        .in("user_id", userIds)
        .eq("business_id", review.business_id);

    if (prefsErr) console.error("⚠️ Error fetching preferences:", prefsErr);

    // 4. Send Alerts
    // We iterate through members to ensure even those without a 'preference' record 
    // get a critical email if they are an owner/admin.
    for (const member of members) {
        const userEmail = (member.users as any)?.email;
        if (!userEmail) continue;

        // Try to find if this user has preferences set
        const userPref = prefs?.find(p => p.user_id === member.user_id);

        // -- EMAIL LOGIC --
        // Default to enabled if no preference record exists (Opt-out model)
        const emailEnabled = userPref ? (userPref.email_enabled !== false) : true;

        if (emailEnabled) {
            console.log(`📧 Sending email alert to: ${userEmail}`);
            const emailHtml = reviewAlertEmail({
                businessName: business.name,
                rating: rating,
                authorName: review.author_name || "a customer",
                reviewText: review.text || "No content provided",
                urgencyScore: urgency,
                dashboardUrl: `${APP_URL}/dashboard`,
                settingsUrl: `${APP_URL}/settings/notifications`,
                customerEmail: review.customer_email || undefined,
                customerPhone: review.customer_phone || undefined,
            });

            await sendEmail({
                to: userEmail,
                subject: `New Review for ${business.name} (${rating}★)`,
                html: emailHtml
            });
        } else {
            console.log(`⏭️ Skipping email for ${userEmail} (disabled in preferences)`);
        }

        // -- SMS LOGIC (per-user threshold + low-star override) --
        const smsThreshold = userPref?.min_urgency_for_sms ?? 7;
        const meetsSmsUrgency = urgency >= smsThreshold || rating <= 2;
        if (meetsSmsUrgency && userPref?.sms_enabled && userPref.sms_phone_number) {
            // Check Quiet Hours
            let inQuietHours = false;
            if (userPref.quiet_hours_start && userPref.quiet_hours_end) {
                const now = new Date();
                const currentHours = now.getHours();
                const currentMinutes = now.getMinutes();
                const currentTime = currentHours * 60 + currentMinutes;

                const [startH, startM] = userPref.quiet_hours_start.split(":").map(Number);
                const [endH, endM] = userPref.quiet_hours_end.split(":").map(Number);
                const startTime = startH * 60 + startM;
                const endTime = endH * 60 + endM;

                if (startTime < endTime) {
                    inQuietHours = currentTime >= startTime && currentTime <= endTime;
                } else {
                    inQuietHours = currentTime >= startTime || currentTime <= endTime;
                }
            }

            if (!inQuietHours) {
                console.log(`📱 Sending SMS alert to: ${userPref.sms_phone_number}`);
                const snippet = review.text ? review.text.substring(0, 80) : "";
                const author = review.author_name || "a customer";
                const body = `⚠️ New ${rating}★ review for ${business.name}:\n"${snippet}..."\n— ${author}\nReply: ${APP_URL}/dashboard`;
                await sendSMS(userPref.sms_phone_number, body);
            } else {
                console.log(`🌙 Skipping SMS for ${userPref.sms_phone_number} (Quiet Hours)`);
            }
        }
    }

    // 5. Update alert_sent status (ONLY for real reviews, not private feedback)
    if (!isPrivateFeedback) {
        console.log("📝 Updating review record as alert_sent...");
        await admin.from("reviews").update({
            alert_sent: true,
            alert_sent_at: new Date().toISOString()
        }).eq("id", review.id);
    } else {
        console.log("✅ Alert process finished for Private Feedback.");
    }
}
