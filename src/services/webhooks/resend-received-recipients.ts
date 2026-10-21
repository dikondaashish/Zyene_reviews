import { splitAddressList } from "@/lib/enrollment/inbound-email-parse";

/**
 * Resend's `email.received` payload lists only recipients on the receiving domain in `to`/`cc`,
 * so the customer on an invoice copy is missing there. The received-email API keeps the original
 * To/Cc headers; read the full recipient list from them. Returns null when no API key is set.
 * Throws on API failure so the webhook can be retried.
 */
export async function fetchReceivedRecipients(emailId: string): Promise<string[] | null> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) return null;
    const response = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
    });
    if (!response.ok) throw new Error(`Resend received-email lookup failed (${response.status})`);
    const body = (await response.json()) as { headers?: Record<string, unknown> | null };
    const headers = body.headers ?? {};
    return ["to", "cc"].flatMap((name) => {
        const value = headers[name];
        const values = Array.isArray(value) ? value : [value];
        return values.flatMap((v) => (typeof v === "string" ? splitAddressList(v) : []));
    });
}
