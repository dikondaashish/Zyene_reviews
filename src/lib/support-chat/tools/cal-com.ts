import { DEFAULT_CAL_COM_BOOKING_URL, getCalComEmbedUrlFromEnv } from "@/lib/enterprise/cal-com-embed";
import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";
import { logger } from "@/lib/logger";

/**
 * Demo booking inside the chat via Cal.com's public v2 API: the same event the
 * /demo page embeds, so availability and the calendar invite stay in Cal.com.
 */
const CAL_API = "https://api.cal.com/v2";

export function calEvent(): { username: string; eventTypeSlug: string; bookingUrl: string } {
    const bookingUrl = (getCalComEmbedUrlFromEnv() ?? DEFAULT_CAL_COM_BOOKING_URL).split("?")[0];
    try {
        const [username, eventTypeSlug] = new URL(bookingUrl).pathname.split("/").filter(Boolean);
        if (username && eventTypeSlug) return { username, eventTypeSlug, bookingUrl };
    } catch {
        // Fall through to the default event.
    }
    return { username: "zyenereviews", eventTypeSlug: "15min", bookingUrl: DEFAULT_CAL_COM_BOOKING_URL };
}

export interface DemoSlotDay {
    date: string;
    slots: string[];
}

/** Open start times for the next `days` days, in the visitor's time zone. */
export async function fetchDemoSlots(timeZone: string, days = 7): Promise<DemoSlotDay[]> {
    const { username, eventTypeSlug } = calEvent();
    const start = new Date();
    const end = new Date(start.getTime() + days * 86_400_000);
    const params = new URLSearchParams({
        username,
        eventTypeSlug,
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        timeZone,
    });
    const response = await fetchWithTimeout(`${CAL_API}/slots?${params}`, {
        headers: { "cal-api-version": "2024-09-04" },
        cache: "no-store",
    });
    if (!response.ok) {
        logger.warn({ status: response.status }, "[support-chat] Cal.com slots request failed");
        return [];
    }
    const data = (await response.json()) as { data?: Record<string, Array<{ start?: string }>> };
    const soonest = Date.now() + 2 * 3_600_000; // Leave at least two hours to prepare.
    return Object.entries(data.data ?? {})
        .map(([date, slots]) => ({
            date,
            slots: slots.map((s) => s.start ?? "").filter((s) => s && new Date(s).getTime() > soonest),
        }))
        .filter((day) => day.slots.length > 0)
        .slice(0, 5);
}

export interface DemoBookingInput {
    start: string;
    name: string;
    email: string;
    timeZone: string;
    notes?: string;
}

/** Books through Cal.com, which sends the calendar invite and confirmation email. */
export async function bookDemo(input: DemoBookingInput): Promise<{ ok: true; uid: string } | { ok: false; error: string }> {
    const { username, eventTypeSlug } = calEvent();
    const response = await fetchWithTimeout(`${CAL_API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "cal-api-version": "2024-08-13" },
        body: JSON.stringify({
            start: input.start,
            eventTypeSlug,
            username,
            attendee: { name: input.name, email: input.email, timeZone: input.timeZone, language: "en" },
            metadata: { source: "website-chat" },
            ...(input.notes ? { bookingFieldsResponses: { notes: input.notes } } : {}),
        }),
        cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as { status?: string; data?: { uid?: string }; error?: { message?: string } };
    if (!response.ok || data.status !== "success" || !data.data?.uid) {
        logger.warn({ status: response.status, error: data.error?.message }, "[support-chat] Cal.com booking failed");
        return { ok: false, error: "That time was just taken or couldn't be booked. Please pick another." };
    }
    return { ok: true, uid: data.data.uid };
}
