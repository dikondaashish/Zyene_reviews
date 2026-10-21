import { randomInt } from "node:crypto";

/**
 * Per-business invoice-copy enrollment addresses.
 *
 *   current: <slug>-<code>@<INBOUND_EMAIL_DOMAIN>    e.g. willow-hair-studio-k7m2@in.zyenereviews.com
 *   legacy:  reviews-<hex token>@<domain>            (still accepted, never issued)
 *
 * The name makes the address easy to recognise; the random code keeps it unguessable,
 * because invoicing tools (QuickBooks, Square) send from addresses shared by all their users.
 */
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o, 1/l/i look-alikes
const CODE_LENGTH = 4;
const MAX_NAME_LENGTH = 58; // local part stays within 64 chars
const LEGACY_LOCAL = /^reviews-([a-z0-9]{16,40})$/;
const CURRENT_LOCAL = /^([a-z0-9](?:[a-z0-9-]{0,56}[a-z0-9])?-[a-z0-9]{4})$/;
const LEGACY_TOKEN = /^[a-z0-9]{16,40}$/;

/** Domain new addresses are shown on, plus older domains that still receive (comma list). */
export function inboundDomains(): string[] {
    const primary = process.env.INBOUND_EMAIL_DOMAIN?.trim().toLowerCase();
    const legacy = (process.env.INBOUND_EMAIL_LEGACY_DOMAINS ?? "").split(",").map((d) => d.trim().toLowerCase());
    return [...new Set([primary, ...legacy].filter((d): d is string => Boolean(d)))];
}

/** "Willow Hair Studio!" / slug → "willow-hair-studio-k7m2". */
export function newAddressToken(slugOrName: string): string {
    const name = slugOrName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        .slice(0, MAX_NAME_LENGTH).replace(/-+$/, "") || "reviews";
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    return `${name}-${code}`;
}

export function formatInboundAddress(token: string, domain: string): string {
    return LEGACY_TOKEN.test(token) ? `reviews-${token}@${domain}` : `${token}@${domain}`;
}

/** The stored token for an address on one of our inbound domains, or null. */
export function inboundToken(email: string, domains: string | string[]): string | null {
    const [local, domain] = email.trim().toLowerCase().split("@");
    const accepted = (Array.isArray(domains) ? domains : [domains]).map((d) => d.toLowerCase());
    if (!local || !domain || !accepted.includes(domain)) return null;
    return LEGACY_LOCAL.exec(local)?.[1] ?? CURRENT_LOCAL.exec(local)?.[1] ?? null;
}
