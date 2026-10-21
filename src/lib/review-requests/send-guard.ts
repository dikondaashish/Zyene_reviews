import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeCustomerEmail, normalizeCustomerPhone } from "@/lib/customers/identity";
import { nextAllowedSendTime, quietHoursFromBusiness } from "@/lib/review-requests/quiet-hours";

/**
 * Single eligibility check for every customer-facing review-request send (campaigns,
 * reminders, scheduled, dashboard, bulk, API/Zapier, POS). Call it immediately before the
 * provider call so a channel switched off, an opt-out, or an unsubscribe also stops
 * messages that were queued earlier.
 */
export type GuardChannel = "sms" | "email";
export type BlockedChannel = { channel: GuardChannel; reason: string };

export type SendGuardBusiness = {
    id: string;
    timezone: string | null;
    review_request_sms_enabled: boolean | null;
    review_request_email_enabled: boolean | null;
    review_request_frequency_cap_days: number | null;
    review_request_quiet_hours_enabled: boolean | null;
    review_request_quiet_start: string | null;
    review_request_quiet_end: string | null;
};

export type SendGuardResult = {
    allowed: GuardChannel[];
    blocked: BlockedChannel[];
    /** Set when quiet hours are active: the caller must defer until this instant. */
    deferUntil: Date | null;
    business: SendGuardBusiness | null;
};

export const SEND_GUARD_BUSINESS_SELECT =
    "id, timezone, review_request_sms_enabled, review_request_email_enabled, review_request_frequency_cap_days, review_request_quiet_hours_enabled, review_request_quiet_start, review_request_quiet_end";

export type SendGuardInput = {
    businessId: string;
    channels: GuardChannel[];
    phone?: string | null;
    email?: string | null;
    /** "skip" only for reminders of a request that was already sent (same request, not a new ask). */
    frequencyCap: "apply" | "skip";
    now?: Date;
};

const DAY_MS = 86_400_000;

async function customerFlags(admin: SupabaseClient, businessId: string, phone?: string | null, email?: string | null) {
    const rows: { is_opted_out: boolean | null; tags: string[] | null; last_request_sent_at: string | null }[] = [];
    const keys = [["normalized_phone", phone ? normalizeCustomerPhone(phone) : null],
        ["normalized_email", email ? normalizeCustomerEmail(email) : null]] as const;
    for (const [column, value] of keys) {
        if (!value) continue;
        const { data, error } = await admin.from("customers")
            .select("is_opted_out, tags, last_request_sent_at")
            .eq("business_id", businessId).eq(column, value).limit(5);
        if (error) throw error;
        rows.push(...(data ?? []));
    }
    return rows;
}

export async function checkReviewRequestSend(admin: SupabaseClient, input: SendGuardInput): Promise<SendGuardResult> {
    const now = input.now ?? new Date();
    const { data: business, error } = await admin.from("businesses")
        .select(SEND_GUARD_BUSINESS_SELECT).eq("id", input.businessId).maybeSingle();
    if (error) throw error;
    const blocked: BlockedChannel[] = [];
    const block = (channel: GuardChannel, reason: string) => {
        if (!blocked.some((b) => b.channel === channel)) blocked.push({ channel, reason });
    };
    const channels = [...new Set(input.channels)];
    if (!business) {
        channels.forEach((c) => block(c, "Business not found"));
        return { allowed: [], blocked, deferUntil: null, business: null };
    }
    const biz = business as SendGuardBusiness;

    for (const channel of channels) {
        if (channel === "sms" && biz.review_request_sms_enabled === false) block("sms", "SMS review requests are turned off in settings");
        if (channel === "email" && biz.review_request_email_enabled === false) block("email", "Email review requests are turned off in settings");
        if (channel === "sms" && !input.phone) block("sms", "No phone number");
        if (channel === "email" && !input.email) block("email", "No email address");
    }

    if (channels.includes("sms") && input.phone) {
        const variants = [...new Set([input.phone, normalizeCustomerPhone(input.phone)].filter(Boolean))] as string[];
        // sms_opt_outs is keyed by phone_number (the live table has no id column).
        const { data: stop, error: stopError } = await admin.from("sms_opt_outs")
            .select("phone_number").in("phone_number", variants).limit(1);
        if (stopError) throw stopError;
        if (stop?.length) block("sms", "Customer replied STOP to SMS");
    }
    if (channels.includes("email") && input.email) {
        const { data: unsub, error: unsubError } = await admin.from("review_request_email_unsubscribes")
            .select("id").eq("business_id", biz.id).eq("email", normalizeCustomerEmail(input.email)).maybeSingle();
        if (unsubError) throw unsubError;
        if (unsub) block("email", "Customer unsubscribed from review request emails");
    }

    const customers = await customerFlags(admin, biz.id, input.phone, input.email);
    const capDays = biz.review_request_frequency_cap_days ?? 30;
    const lastSent = customers.map((c) => c.last_request_sent_at).filter(Boolean)
        .map((v) => new Date(v as string).getTime()).sort((a, b) => b - a)[0];
    for (const channel of channels) {
        if (customers.some((c) => c.is_opted_out)) block(channel, "Customer opted out of review requests");
        if (customers.some((c) => c.tags?.includes("zyene:test"))) block(channel, "Test contact");
        if (input.frequencyCap === "apply" && capDays > 0 && lastSent && now.getTime() - lastSent < capDays * DAY_MS) {
            block(channel, `Already asked within the last ${capDays} days`);
        }
    }

    const allowed = channels.filter((c) => !blocked.some((b) => b.channel === c));
    const deferUntil = allowed.length ? nextAllowedSendTime(now, quietHoursFromBusiness(biz)) : null;
    return { allowed, blocked, deferUntil, business: biz };
}

/** Human-readable summary for review_requests.error_message when nothing could be sent. */
export function blockedReason(blocked: BlockedChannel[]): string {
    return [...new Set(blocked.map((b) => b.reason))].join("; ") || "Not eligible";
}
