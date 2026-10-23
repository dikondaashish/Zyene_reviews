import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { REVIEW_RESPONSE_SOURCE_ZYENE, REVIEW_RESPONSE_SOURCE_ZYENE_AUTO } from "@/lib/reviews/response-source";
import type { CalendarEvent, CalendarMonth } from "@/lib/automations/activity-calendar";

const ROW_CAP = 1000;
const firstName = (name: string | null | undefined, fallback: string) => (name || "").trim().split(/\s+/)[0] || fallback;
const channelText = (channel: unknown) => (channel === "sms" ? "text" : channel === "email" ? "email" : "text and email");
// Embedded rows arrive as an object or a one-item array depending on the relationship.
const one = <T,>(value: unknown): T | null => ((Array.isArray(value) ? value[0] : value) as T | undefined) ?? null;

/** One month of calendar events, read with the caller's RLS client. Fails soft to an empty month. */
export async function loadActivityCalendar(supabase: SupabaseClient, businessId: string, month: CalendarMonth): Promise<{ events: CalendarEvent[]; capped: boolean }> {
    const { fromIso, toIso } = month;
    try {
        const [messages, scheduled, replies, reviews] = await Promise.all([
            supabase.from("review_request_messages").select("id, step, channel, status, created_at, review_requests(customer_name)")
                .eq("business_id", businessId).in("status", ["sent", "delivered"])
                .gte("created_at", fromIso).lt("created_at", toIso).limit(ROW_CAP),
            supabase.from("review_requests").select("id, customer_name, channel, scheduled_for")
                .eq("business_id", businessId).eq("status", "queued")
                .gte("scheduled_for", fromIso).lt("scheduled_for", toIso).limit(ROW_CAP),
            supabase.from("reviews").select("id, author_name, rating, responded_at, response_source")
                .eq("business_id", businessId).in("response_source", [REVIEW_RESPONSE_SOURCE_ZYENE, REVIEW_RESPONSE_SOURCE_ZYENE_AUTO])
                .gte("responded_at", fromIso).lt("responded_at", toIso).limit(ROW_CAP),
            supabase.from("reviews").select("id, author_name, rating, review_date, platform")
                .eq("business_id", businessId).eq("is_visible", true)
                .gte("review_date", fromIso).lt("review_date", toIso).limit(ROW_CAP),
        ]);
        const events: CalendarEvent[] = [];
        for (const m of messages.data ?? []) {
            const who = firstName(one<{ customer_name: string | null }>(m.review_requests)?.customer_name, "a customer");
            const reminder = Number(m.step) > 1;
            events.push({ id: `msg-${m.id}`, kind: reminder ? "reminder" : "request", at: m.created_at as string,
                title: reminder ? `Reminder to ${who}` : `Asked ${who} for a review`,
                detail: `By ${channelText(m.channel)}${m.status === "delivered" ? " · delivered" : ""}` });
        }
        for (const r of scheduled.data ?? []) {
            if (!r.scheduled_for) continue;
            events.push({ id: `sched-${r.id}`, kind: "scheduled", at: r.scheduled_for as string,
                title: `Will ask ${firstName(r.customer_name as string | null, "a customer")}`, detail: `By ${channelText(r.channel)}` });
        }
        for (const r of replies.data ?? []) {
            if (!r.responded_at) continue;
            const auto = r.response_source === REVIEW_RESPONSE_SOURCE_ZYENE_AUTO;
            events.push({ id: `reply-${r.id}`, kind: auto ? "auto-reply" : "reply", at: r.responded_at as string,
                title: `Replied to ${firstName(r.author_name as string | null, "a reviewer")}${r.rating ? ` (${r.rating}★)` : ""}`,
                detail: auto ? "Posted automatically" : "Posted from Zyene" });
        }
        for (const r of reviews.data ?? []) {
            if (!r.review_date) continue;
            events.push({ id: `review-${r.id}`, kind: "review", at: r.review_date as string,
                title: `${r.rating ? `${r.rating}★ ` : ""}review from ${firstName(r.author_name as string | null, "a customer")}`,
                detail: r.platform === "google" ? "On Google" : r.platform ? `On ${String(r.platform)}` : undefined });
        }
        const capped = [messages, scheduled, replies, reviews].some((res) => (res.data?.length ?? 0) >= ROW_CAP);
        return { events, capped };
    } catch (err) {
        logger.warn({ err, businessId }, "[automations] activity calendar load failed");
        return { events: [], capped: false };
    }
}
