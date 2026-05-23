export type AuditItem = {
    id: string;
    label: string;
    status: "pass" | "fail" | "pending";
    detail: string;
};

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
