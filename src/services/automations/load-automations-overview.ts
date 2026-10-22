import type { SupabaseClient } from "@supabase/supabase-js";
import { countPendingReplyDrafts } from "@/services/reviews/reply-drafts-load";

export type OverviewSettings = {
    smsEnabled: boolean; emailEnabled: boolean; quietHoursEnabled: boolean; quietStart: string; quietEnd: string;
    timezone: string | null; replyRulesEnabled: boolean; autoReplyEnabled: boolean; hasSlug: boolean;
};
/** `tone` lets the UI colour a delivery result without parsing its text. */
export type OverviewItem = { id: string; title: string; detail: string | null; at: string | null; tone?: "good" | "bad" | "neutral" };
export type ActionNeeded = { title: string; href: string };
export type AutomationsOverview = {
    settings: OverviewSettings;
    counts: { activeCampaigns: number; activeReminders: number; upcoming: number; activeImports: number; pendingApprovals: number; failures7d: number };
    upcoming: OverviewItem[]; recent: OverviewItem[]; failures: OverviewItem[]; actions: ActionNeeded[];
};

const WEEK_MS = 7 * 86_400_000;
const channelLabel = (channel: unknown) => (channel === "sms" ? "Text" : channel === "email" ? "Email" : String(channel));
const BAD_STATUSES = new Set(["failed", "undelivered", "bounced", "complained"]);
const STATUS_TEXT: Record<string, string> = {
    sent: "Sent", delivered: "Delivered", failed: "Failed", undelivered: "Not delivered", bounced: "Bounced", complained: "Marked as spam", claimed: "Sending",
};

export async function loadAutomationsOverview(admin: SupabaseClient, businessId: string, now = new Date()): Promise<AutomationsOverview> {
    const weekAgo = new Date(now.getTime() - WEEK_MS).toISOString();
    const weekAhead = new Date(now.getTime() + WEEK_MS).toISOString();
    const [biz, campaigns, reminders, upcoming, recent, failures, imports, approvals] = await Promise.all([
        admin.from("businesses").select("slug, timezone, review_request_sms_enabled, review_request_email_enabled, review_request_quiet_hours_enabled, review_request_quiet_start, review_request_quiet_end, reply_rules_enabled, auto_reply_enabled").eq("id", businessId).maybeSingle(),
        admin.from("campaigns").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("status", "active"),
        admin.from("review_requests").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("drip_status", "active"),
        admin.from("review_requests").select("id, customer_name, channel, scheduled_for, deferred_reason", { count: "exact" })
            .eq("business_id", businessId).eq("status", "queued").lte("scheduled_for", weekAhead).order("scheduled_for").limit(8),
        admin.from("review_request_messages").select("id, channel, step, status, created_at, review_requests(customer_name)")
            .eq("business_id", businessId).order("created_at", { ascending: false }).limit(12),
        admin.from("review_requests").select("id, customer_name, channel, status, error_message, created_at", { count: "exact" })
            .eq("business_id", businessId).in("status", ["failed", "skipped"]).gte("created_at", weekAgo).order("created_at", { ascending: false }).limit(8),
        admin.from("enrollment_imports").select("id, status").eq("business_id", businessId).in("status", ["active", "paused"]),
        countPendingReplyDrafts(admin, businessId),
    ]);
    const b = (biz.data ?? {}) as Record<string, unknown>;
    const settings: OverviewSettings = {
        smsEnabled: b.review_request_sms_enabled !== false, emailEnabled: b.review_request_email_enabled !== false,
        quietHoursEnabled: Boolean(b.review_request_quiet_hours_enabled),
        quietStart: String(b.review_request_quiet_start ?? "21:00").slice(0, 5), quietEnd: String(b.review_request_quiet_end ?? "08:00").slice(0, 5),
        timezone: (b.timezone as string | null) ?? null, replyRulesEnabled: Boolean(b.reply_rules_enabled),
        autoReplyEnabled: Boolean(b.auto_reply_enabled), hasSlug: Boolean(b.slug),
    };
    const name = (row: { customer_name?: string | null }) => row.customer_name || "Customer";
    const pausedImports = (imports.data ?? []).filter((i) => i.status === "paused").length;
    const actions: ActionNeeded[] = [];
    if (!settings.hasSlug) actions.push({ title: "Set your public review page link so requests can be sent", href: "/settings/public-profile" });
    if (approvals > 0) actions.push({ title: `${approvals} review repl${approvals === 1 ? "y is" : "ies are"} waiting for approval`, href: "/reviews/approvals" });
    if ((campaigns.count ?? 0) > 0 && !settings.smsEnabled && !settings.emailEnabled) {
        actions.push({ title: "Both SMS and email are off, so active campaigns can't send", href: "/settings/business-information" });
    }
    if ((failures.count ?? 0) > 0) actions.push({ title: `${failures.count} message${failures.count === 1 ? "" : "s"} failed or ${failures.count === 1 ? "was" : "were"} skipped this week`, href: "/requests" });
    if (pausedImports) actions.push({ title: `${pausedImports} customer import${pausedImports === 1 ? " is" : "s are"} paused`, href: "/campaigns" });

    return {
        settings,
        counts: {
            activeCampaigns: campaigns.count ?? 0, activeReminders: reminders.count ?? 0, upcoming: upcoming.count ?? 0,
            activeImports: (imports.data ?? []).filter((i) => i.status === "active").length, pendingApprovals: approvals, failures7d: failures.count ?? 0,
        },
        upcoming: (upcoming.data ?? []).map((r) => ({ id: r.id, title: `${name(r)} · ${channelLabel(r.channel)}`, detail: r.deferred_reason ?? null, at: r.scheduled_for })),
        recent: (recent.data ?? []).map((m) => {
            const req = (Array.isArray(m.review_requests) ? m.review_requests[0] : m.review_requests) as { customer_name?: string | null } | null;
            const step = m.step === 1 ? "Request" : `Reminder ${Number(m.step) - 1}`;
            return { id: m.id, title: `${step} to ${name(req ?? {})} · ${channelLabel(m.channel)}`, detail: STATUS_TEXT[m.status as string] ?? String(m.status), at: m.created_at,
                tone: BAD_STATUSES.has(m.status as string) ? "bad" : m.status === "delivered" ? "good" : "neutral" };
        }),
        failures: (failures.data ?? []).map((r) => ({ id: r.id, title: `${name(r)} · ${r.status === "skipped" ? "Skipped" : "Failed"}`, detail: r.error_message ?? null, at: r.created_at })),
        actions,
    };
}
