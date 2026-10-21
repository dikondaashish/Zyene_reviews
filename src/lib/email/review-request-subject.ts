/**
 * Subjects for 1:1 review-request mail.
 * Avoid "Quick question…" / heavy review-CTA wording - Gmail clusters those as bulk.
 * Leading with the customer's first name reads as a personal note in the inbox.
 */
function subjectFirstName(customerName?: string | null): string {
    const first = (customerName || "").trim().split(/\s+/)[0] || "";
    // Only plain names: no placeholder, digits, links or symbols in a header line.
    if (!first || first.toLowerCase() === "there" || first.length > 30) return "";
    return /^[\p{L}][\p{L}'’-]*$/u.test(first) ? first : "";
}

export function reviewRequestSubject(businessName: string, isFollowUp = false, customerName?: string | null): string {
    const name = (businessName || "").trim() || "us";
    const first = subjectFirstName(customerName);
    if (isFollowUp) return first ? `${first}, following up on your visit to ${name}` : `Following up on your visit to ${name}`;
    return first ? `${first}, thanks for stopping by ${name}` : `Thanks for stopping by ${name}`;
}
