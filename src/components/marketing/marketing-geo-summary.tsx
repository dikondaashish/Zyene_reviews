import type { ReactNode } from "react";

/** GEO-style key takeaway block (compare pages, case studies). */
export function MarketingGeoSummary({
    children,
    label = "Key takeaway",
}: {
    children: ReactNode;
    label?: string;
}) {
    return (
        <p
            className="text-sm text-foreground leading-relaxed rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-left"
            data-geo-summary=""
        >
            <span className="sr-only">{label}: </span>
            {children}
        </p>
    );
}
