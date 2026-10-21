import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { emailLayout, emailButton } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";
import { sendEmail } from "@/services/resend/send-email";
import { listDesignatedApprovers } from "@/services/reviews/reply-rules";

const MANAGER_ROLES = ["owner", "admin", "manager", "ORG_OWNER", "ORG_ADMIN", "ORG_MANAGER"];

/** Designated approvers, or (when none are set) the business's owners/admins/managers. */
export async function approverUserIds(admin: SupabaseClient, businessId: string): Promise<string[]> {
    const designated = await listDesignatedApprovers(admin, businessId);
    if (designated.length) return designated;
    const { data: business } = await admin.from("businesses").select("organization_id").eq("id", businessId).maybeSingle();
    if (!business) return [];
    const [{ data: org }, { data: members }] = await Promise.all([
        admin.from("organization_members").select("user_id, role").eq("organization_id", business.organization_id).eq("status", "active"),
        admin.from("business_members").select("user_id, role").eq("business_id", businessId).eq("status", "active"),
    ]);
    const ids = [...(org ?? []), ...(members ?? [])].filter((m) => MANAGER_ROLES.includes(m.role as string)).map((m) => m.user_id as string);
    return [...new Set(ids)];
}

function appOrigin(): string {
    return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Email approvers that a reply is waiting. Idempotent per draft (Resend idempotency key). */
export async function notifyReplyApprovers(admin: SupabaseClient, businessId: string, draftId: string): Promise<number> {
    const userIds = await approverUserIds(admin, businessId);
    if (!userIds.length) return 0;
    const [{ data: users }, { data: business }, { data: draft }] = await Promise.all([
        admin.from("users").select("id, email").in("id", userIds),
        admin.from("businesses").select("name").eq("id", businessId).maybeSingle(),
        admin.from("review_reply_drafts").select("rating").eq("id", draftId).eq("business_id", businessId).maybeSingle(),
    ]);
    const name = (business?.name as string | undefined) || "your business";
    const link = `${appOrigin()}/reviews/approvals`;
    const html = emailLayout({
        title: "A review reply needs your approval",
        preheader: `A reply to a ${draft?.rating ?? ""}-star review for ${name} is waiting.`,
        bodyHtml: `<p>A reply to a new ${escapeHtml(String(draft?.rating ?? ""))}-star review for <strong>${escapeHtml(name)}</strong> is ready. Nothing is posted until someone approves it.</p>${emailButton("Review and approve", link)}`,
    });
    let sent = 0;
    for (const user of users ?? []) {
        if (!user.email) continue;
        const result = await sendEmail({
            to: user.email as string, subject: `Approve a review reply for ${name}`, html,
            idempotencyKey: `reply-approval/${draftId}/${user.id}`,
        });
        if (result.sent) sent++;
        else logger.warn({ draftId, userId: user.id }, "[reply-approval] notification not sent");
    }
    return sent;
}
