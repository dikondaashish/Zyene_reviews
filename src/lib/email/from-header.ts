/**
 * RFC 5322 "specials": an unquoted display name containing any of these is not a
 * plain phrase. A comma splits the header into two mailboxes ("Smith, Jones & Co"),
 * parentheses become a comment, a colon starts a group, so the provider rejects or
 * misreads the From line and every email for that business fails.
 * A period is left alone: the obsolete phrase syntax allows it and every provider
 * accepts "Dr. Ann" or "Co." unquoted, as these names have always been sent.
 */
const RFC5322_SPECIALS = /[()<>[\]:;@\\,"]/;

/** `Display Name <mailbox>`, quoting the display name only when it needs it. */
export function formatFromAddress(displayName: string, mailbox: string): string {
    const display = displayName.replace(/[\r\n]/g, " ").trim();
    if (!display) return mailbox;
    if (!RFC5322_SPECIALS.test(display)) return `${display} <${mailbox}>`;
    return `"${display.replace(/["\\]/g, "\\$&")}" <${mailbox}>`;
}
