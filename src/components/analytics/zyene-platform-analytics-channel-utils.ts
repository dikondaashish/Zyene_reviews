import type { ReviewRequest } from "@/components/analytics/zyene-platform-analytics-types";

export function hasDirectContact(r: ReviewRequest): boolean {
    return Boolean(r.customer_phone || r.customer_email || r.customer_name || r.campaign_id);
}

export function normalizedChannel(r: ReviewRequest): "email" | "sms" | "link" | "both" {
    if (r.channel === "both") return "both";
    if (r.channel === "sms" || r.channel === "link") return r.channel;
    // Backward-compatible: public-link/QR tracking rows may be stored as email/manual
    // without customer identity when legacy DB constraints block channel=link inserts.
    if (r.channel === "email" && !hasDirectContact(r)) return "link";
    return "email";
}

export function isRequestChannel(r: ReviewRequest): boolean {
    return (
        (r.channel === "email" || r.channel === "sms" || r.channel === "both") &&
        Boolean(r.customer_phone || r.customer_email || r.customer_name || r.campaign_id)
    );
}
