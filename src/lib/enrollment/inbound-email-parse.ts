/**
 * Pure helpers for invoice-copy email enrollment. Decides which recipients of a forwarded
 * invoice are customers. Anything that looks like staff, the business itself, the sender,
 * our own inbound address or a no-reply mailbox is never enrolled.
 */
export type ParsedAddress = { email: string; name: string | null };

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const NO_REPLY = /^(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce[s]?|notifications?)@/i;
export const MAX_RECIPIENTS_PER_EMAIL = 5;

export function parseAddress(raw: string | null | undefined): ParsedAddress | null {
    const value = (raw ?? "").trim();
    if (!value) return null;
    const match = /^(.*?)<([^>]+)>\s*$/.exec(value);
    const email = (match ? match[2] : value).trim().toLowerCase();
    if (!EMAIL.test(email)) return null;
    const name = match ? match[1].replace(/^["'\s]+|["'\s]+$/g, "").trim() || null : null;
    return { email, name: name ? name.slice(0, 200) : null };
}

/** Split an RFC 5322 address-list header ("A <a@x>, \"B, Jr\" <b@y>") into single addresses. */
export function splitAddressList(header: string | null | undefined): string[] {
    const parts: string[] = [];
    let current = "";
    let quoted = false;
    let angle = false;
    for (const ch of header ?? "") {
        if (ch === "\"") quoted = !quoted;
        else if (!quoted && ch === "<") angle = true;
        else if (!quoted && ch === ">") angle = false;
        if ((ch === "," || ch === ";") && !quoted && !angle) {
            if (current.trim()) parts.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
}

export function domainOf(email: string): string {
    return email.split("@")[1]?.toLowerCase() ?? "";
}

/** The business token from an address like reviews-<token>@<inboundDomain>. */
export function inboundToken(email: string, inboundDomain: string): string | null {
    const match = /^reviews-([a-z0-9]{16,40})@(.+)$/i.exec(email.trim());
    return match && match[2].toLowerCase() === inboundDomain.toLowerCase() ? match[1].toLowerCase() : null;
}

/** Allowed senders are exact emails or "@domain" entries (exact domain, no subdomains). */
export function senderAllowed(senderEmail: string, allowed: string[]): boolean {
    const sender = senderEmail.toLowerCase();
    return allowed.some((entry) => {
        const e = entry.trim().toLowerCase();
        return e.startsWith("@") ? domainOf(sender) === e.slice(1) : e === sender;
    });
}

export function normalizeAllowedSenders(entries: string[]): string[] {
    return [...new Set(entries.map((e) => e.trim().toLowerCase()).filter((e) =>
        (e.startsWith("@") && /^@[a-z0-9.-]+\.[a-z]{2,}$/.test(e)) || EMAIL.test(e)))].slice(0, 25);
}

export function pickCustomerRecipients(recipients: string[], context: {
    inboundDomain: string; senderEmail: string; allowedSenders: string[]; excludedEmails: string[];
}): ParsedAddress[] {
    const sender = context.senderEmail.toLowerCase();
    const excluded = new Set(context.excludedEmails.map((e) => e.toLowerCase()));
    const allowedDomains = context.allowedSenders.filter((e) => e.startsWith("@")).map((e) => e.slice(1).toLowerCase());
    const seen = new Set<string>();
    const result: ParsedAddress[] = [];
    for (const raw of recipients) {
        const parsed = parseAddress(raw);
        if (!parsed || seen.has(parsed.email)) continue;
        seen.add(parsed.email);
        const domain = domainOf(parsed.email);
        if (domain === context.inboundDomain.toLowerCase()) continue; // our inbound address
        if (parsed.email === sender || domain === domainOf(sender)) continue; // sender / their colleagues
        if (excluded.has(parsed.email) || senderAllowed(parsed.email, context.allowedSenders) || allowedDomains.includes(domain)) continue; // staff
        if (NO_REPLY.test(parsed.email)) continue;
        result.push(parsed);
        if (result.length >= MAX_RECIPIENTS_PER_EMAIL) break;
    }
    return result;
}
