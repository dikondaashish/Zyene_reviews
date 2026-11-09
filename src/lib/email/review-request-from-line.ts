/**
 * Browser-safe From-line formatting for review-request email. The sender service and the
 * settings preview both use it, so the preview shows exactly what customers will see.
 */

import { formatFromAddress } from "@/lib/email/from-header";

/** Which Resend account delivers review requests, and its configured From line. */
export type ReviewRequestSender = { kind: "collect" | "primary"; from: string };

/** "Willow Hair Studio" → "willow-hair-studio" (falls back to "hello"). */
export function mailboxLocalPart(businessName?: string | null): string {
    const local = (businessName || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/, "");
    return local || "hello";
}

const clean = (value?: string | null) => (value || "").replace(/["<>\r\n]/g, "").trim();

/**
 * collect: "Sam at Willow Hair Studio <willow-hair-studio@send.collectratings.com>", or just the
 * business name when no sender is set. primary: "Sam <hello@zyenereviews.com>" on the shared mailbox.
 * Display names with RFC 5322 specials (e.g. "Smith, Jones & Co") are quoted so the header stays valid.
 */
export function reviewRequestFromLine(sender: ReviewRequestSender, businessName?: string | null, senderName?: string | null): string {
    const biz = clean(businessName);
    const person = clean(senderName);
    if (sender.kind === "primary") {
        const mailbox = sender.from.match(/<([^>]+)>/)?.[1];
        const display = person || biz;
        return display && mailbox ? formatFromAddress(display.slice(0, 78), mailbox) : sender.from;
    }
    const domain = sender.from.match(/<[^@>]+@([^>]+)>/)?.[1];
    if (!biz || !domain) return sender.from;
    const display = (person ? `${person} at ${biz}` : biz).slice(0, 78);
    return formatFromAddress(display, `${mailboxLocalPart(biz)}@${domain}`);
}
