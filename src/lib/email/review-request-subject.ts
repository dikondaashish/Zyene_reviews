/**
 * Subjects for 1:1 review-request mail.
 * Avoid "Quick question…" / heavy review-CTA wording — Gmail clusters those as bulk.
 */
export function reviewRequestSubject(businessName: string, isFollowUp = false): string {
    const name = (businessName || "").trim() || "us";
    if (isFollowUp) return `Following up on your visit to ${name}`;
    return `Thanks for stopping by ${name}`;
}
