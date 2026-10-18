import Link from "next/link";
import { ContentRenderer } from "@/components/marketing/content-renderer";
import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import { RESOURCE_MAP, RESOURCE_GUIDES } from "@/lib/content/resource-data";
import { SIGNUP_URL } from "@/config/env";
import { ResourcesGuideSidebar } from "./resources-guide-sidebar";

export function ResourcesGuideContentSidebarSection({ resource, otherGuides }: { resource: (typeof RESOURCE_MAP)[string]; otherGuides: typeof RESOURCE_GUIDES }) {
    const internalLinks = resource.internalLinks ?? [];
    return (
        <section className="marketing-section mi-section-tight">
            <div className="marketing-container mi-read">
                <ResourcesGuideSidebar resource={resource} otherGuides={otherGuides} />

                <article className="mi-read-main">
                    {resource.openingSummary ? <MarketingGeoSummary>{resource.openingSummary}</MarketingGeoSummary> : null}

                    {resource.slug === "review-request-templates" ? (
                        <p className="text-muted-foreground">
                            Want the full pack in your inbox?{" "}
                            <a href="#resource-lead-capture" className="mi-inline-link">
                                Get the 20 templates by email
                            </a>
                            — browse a sample of the templates below.
                        </p>
                    ) : null}

                    <ContentRenderer sections={resource.body} />

                    {internalLinks.length > 0 ? (
                        <nav className="mi-read-related" aria-labelledby="resource-related-heading">
                            <h2 id="resource-related-heading">Related</h2>
                            <ul className="mi-chips">
                                {internalLinks.map((link) => {
                                    const isSignup = link.href === "/signup" || link.href === SIGNUP_URL;
                                    return (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href === "/signup" ? SIGNUP_URL : link.href}
                                                {...(isSignup ? { "data-track": "trial", "data-track-location": "guide-related" } : {})}
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    ) : null}
                </article>
            </div>
        </section>
    );
}
