/**
 * `pending` means we never built the check. `unavailable` means we built it,
 * asked Google, and got nothing back this load. `not-applicable` means the
 * check was run and genuinely does not apply to this business — a storefront
 * that never travels to customers has no service area to declare.
 *
 * The three are kept distinct because only `pending` is a gap in the product;
 * the other two are real audit outcomes. None of them count toward the score.
 */
export type AuditStatus = "pass" | "fail" | "pending" | "unavailable" | "not-applicable";

export type AuditItem = {
    id: string;
    label: string;
    status: AuditStatus;
    detail: string;
};

/** Only pass/fail rows are scored; everything else is reported separately. */
export function isScoredAudit(item: AuditItem): boolean {
    return item.status === "pass" || item.status === "fail";
}

export type AuditFixAction = {
    href: string;
    label: string;
};

export function getAuditFixAction(auditId: string): AuditFixAction {
    switch (auditId) {
        case "business-description":
            return { href: "/google-seo-aeo#description-optimizer", label: "Optimize" };
        case "review-frequency":
            return { href: "/campaigns", label: "Create campaign" };
        case "google-rating":
            return { href: "/requests", label: "Request reviews" };
        case "review-replies":
            return { href: "/reviews", label: "Reply now" };
        case "profile-performance":
            return { href: "/analytics", label: "View analytics" };
        case "images":
            return { href: "/settings/business-information#photos", label: "Add photos" };
        case "post-frequency":
            return { href: "/settings/business-information#posts", label: "Manage posts" };
        case "post-keywords":
            return { href: "/settings/business-information#posts", label: "Optimize posts" };
        case "services-list":
            return { href: "/settings/business-information#services", label: "Update services" };
        case "service-descriptions":
            return { href: "/settings/business-information#services", label: "Edit descriptions" };
        case "service-area":
            return { href: "/settings/business-information#service-area", label: "Edit area" };
        default:
            return { href: "/settings/business-information", label: "Fix" };
    }
}

export function calcKeywordCoverage(description: string, keywords: string[]): number {
    const low = description.toLowerCase();
    return keywords.filter((k) => low.includes(k.toLowerCase())).length;
}
