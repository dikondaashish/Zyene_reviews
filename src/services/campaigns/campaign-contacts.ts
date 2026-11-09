import { normalizePhone, isValidEmail } from "@/lib/review-requests/send-outbound-types";
import type { createAdminClient } from "@/lib/db/supabase/admin";

export type CampaignContactInput = { customerId?: string; name?: string; phone?: string; email?: string };
export type CampaignContact = { customerId?: string; name?: string; phone?: string; email?: string };

/** E.164-ish phones have 8 to 15 digits; anything else Twilio rejects. */
function usablePhone(raw: string | undefined): string | undefined {
    const phone = normalizePhone(raw);
    const digits = phone?.replace(/\D/g, "") ?? "";
    return phone && digits.length >= 8 && digits.length <= 15 ? phone : undefined;
}

function usableEmail(raw: string | undefined): string | undefined {
    const email = raw?.trim().toLowerCase();
    return email && isValidEmail(email) ? email : undefined;
}

/**
 * Normalizes contacts the same way the dashboard and API sends do, so the stored
 * phone matches the duplicate check, the SMS opt-out list and Twilio's format
 * ("(555) 123-4567" → "+15551234567"). Contacts with nothing this campaign's
 * channel can use are returned as skipped instead of being queued to vanish.
 */
export function normalizeCampaignContacts(contacts: CampaignContactInput[], channel: string) {
    const usable: CampaignContact[] = [];
    let skipped = 0;
    for (const contact of contacts) {
        const phone = usablePhone(contact.phone);
        const email = usableEmail(contact.email);
        const reachable = channel === "sms" ? Boolean(phone) : channel === "email" ? Boolean(email) : Boolean(phone || email);
        if (!reachable) {
            skipped++;
            continue;
        }
        usable.push({
            ...(contact.customerId ? { customerId: contact.customerId } : {}),
            name: contact.name?.trim() || undefined,
            phone,
            email,
        });
    }
    return { usable, skipped };
}

function contactKey(contact: CampaignContact): string {
    return contact.phone ?? contact.email ?? "";
}

/**
 * Inngest drops a repeated event id for 24 hours. The id is "this contact's next
 * attempt in this campaign": a double-click repeats the same id and is dropped,
 * while a deliberate re-send after a skipped or failed attempt (one more request
 * row) gets a new id and runs. Contacts already sent to are still stopped by the
 * worker's duplicate check.
 */
export async function campaignContactEventIds(
    admin: ReturnType<typeof createAdminClient>,
    campaignId: string,
    contacts: CampaignContact[],
): Promise<string[]> {
    const phones = [...new Set(contacts.map((c) => c.phone).filter((v): v is string => Boolean(v)))];
    const emails = [...new Set(contacts.map((c) => c.email).filter((v): v is string => Boolean(v)))];
    const attempts = new Map<string, number>();
    const count = (value: string | null) => {
        if (value) attempts.set(value, (attempts.get(value) ?? 0) + 1);
    };
    if (phones.length) {
        const { data, error } = await admin.from("review_requests").select("customer_phone")
            .eq("campaign_id", campaignId).in("customer_phone", phones).limit(10_000);
        if (error) throw error;
        for (const row of data ?? []) count(row.customer_phone);
    }
    if (emails.length) {
        const { data, error } = await admin.from("review_requests").select("customer_email")
            .eq("campaign_id", campaignId).in("customer_email", emails).limit(10_000);
        if (error) throw error;
        for (const row of data ?? []) count(row.customer_email);
    }
    return contacts.map((contact) => {
        const key = contactKey(contact);
        const attempt = Math.max(attempts.get(contact.phone ?? "") ?? 0, attempts.get(contact.email ?? "") ?? 0);
        return `campaign:${campaignId}:contact:${key}:attempt:${attempt}`;
    });
}
