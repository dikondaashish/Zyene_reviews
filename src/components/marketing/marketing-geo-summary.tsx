import type { ReactNode } from "react";

/** GEO-style key takeaway block (compare pages, case studies): a calm white card. */
export function MarketingGeoSummary({
    children,
    label = "Key takeaway",
    className = "",
}: {
    children: ReactNode;
    label?: string;
    className?: string;
}) {
    return (
        <p className={`mi-takeaway${className ? ` ${className}` : ""}`} data-geo-summary="">
            <span className="mi-takeaway-label">{label}<span className="sr-only">: </span></span>
            {children}
        </p>
    );
}
