import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendEmail } from "@/services/resend/send-email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export type CompetitorAlertEmailPayload = {
    businessId: string;
    title: string;
    summary: string;
    eventType: string;
};

/**
 * Sends competitor threshold alert emails to org members who have email enabled
 * (notification_preferences), mirroring review-alert behavior.
 */
export async function sendCompetitorAlertEmail(payload: CompetitorAlertEmailPayload): Promise<void> {
    const admin = createAdminClient();

    const { data: business } = await admin
        .from("businesses")
        .select("organization_id, name")
        .eq("id", payload.businessId)
        .maybeSingle();

    if (!business?.organization_id) {
        console.error("[competitor-alert-email] Business not found:", payload.businessId);
        return;
    }

    const { data: members, error: membersErr } = await admin
        .from("organization_members")
        .select(
            `
            user_id,
            users (
                email
            )
        `
        )
        .eq("organization_id", business.organization_id)
        .eq("status", "active");

    if (membersErr || !members?.length) {
        console.error("[competitor-alert-email] No members:", membersErr);
        return;
    }

    const userIds = members.map((m) => m.user_id);
    const { data: prefs } = await admin
        .from("notification_preferences")
        .select("user_id, email_enabled")
        .in("user_id", userIds)
        .eq("business_id", payload.businessId);

    const businessName = business.name || "Your business";
    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 560px;">
        <h2 style="margin: 0 0 12px;">${escapeHtml(payload.title)}</h2>
        <p style="color: #444; line-height: 1.5;">${escapeHtml(payload.summary)}</p>
        <p style="margin-top: 16px;">
          <a href="${APP_URL}/competitors" style="color: #ff4f00;">Open Competitor Monitoring</a>
          ·
          <a href="${APP_URL}/settings/competitor-alerts" style="color: #666;">Alert settings</a>
        </p>
      </div>
    `;

    for (const member of members) {
        const email = (member.users as { email?: string } | null)?.email;
        if (!email) continue;
        const pref = prefs?.find((p) => p.user_id === member.user_id);
        const emailEnabled = pref ? pref.email_enabled !== false : true;
        if (!emailEnabled) continue;

        await sendEmail({
            to: email,
            subject: `[${businessName}] ${payload.title}`,
            html,
            text: `${payload.title}\n\n${payload.summary}\n\n${APP_URL}/competitors`,
        });
    }
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
