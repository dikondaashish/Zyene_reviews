import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RESOURCE_MAP, RESOURCE_GUIDES } from "@/lib/content/resource-data";
import { SIGNUP_URL } from "@/config/env";

/** Quiet guide sidebar: hairline rule, "On this page" list, then secondary links (desktop only). */
export function ResourcesGuideSidebar({ resource, otherGuides }: { resource: (typeof RESOURCE_MAP)[string]; otherGuides: typeof RESOURCE_GUIDES }) {
    const hasToc = resource.tableOfContents.length > 0;
    return (
        <aside className="mi-read-aside" data-toc={hasToc ? "true" : "false"}>
            {hasToc && (
                <nav aria-labelledby="resource-toc-heading">
                    <h2 id="resource-toc-heading">On this page</h2>
                    <ol className="mi-read-links">
                        {resource.tableOfContents.map((item) => (
                            <li key={item.anchor}>
                                <a href={`#${item.anchor}`}>{item.label}</a>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            {resource.slug === "review-request-templates" ? (
                <div className="max-lg:hidden">
                    <h2>Full swipe file</h2>
                    <p>Email the complete pack - practical templates for customer feedback outreach.</p>
                    <a href="#resource-lead-capture" className="home-text-link">
                        Get the 20 templates <ArrowRight size={14} aria-hidden="true" />
                    </a>
                </div>
            ) : null}

            <div className="max-lg:hidden">
                <h2>Try Zyene free</h2>
                <p>Pair the guide with SMS/email requests, AI reply tools and competitor review snapshots. Starter: $29.99/month. Card required for an eligible trial; automatic billing unless cancelled.</p>
                <Link href={SIGNUP_URL} className="home-text-link" data-track="trial" data-track-location="guide-sidebar">
                    Start 7-day free trial <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </div>

            {otherGuides.length > 0 && (
                <nav className="max-lg:hidden" aria-labelledby="resource-sidebar-guides-heading">
                    <h2 id="resource-sidebar-guides-heading">Other guides</h2>
                    <ul className="mi-read-links">
                        {otherGuides.map((g) => (
                            <li key={g.slug}>
                                <Link href={`/resources/${g.slug}`}>{g.title}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </aside>
    );
}
