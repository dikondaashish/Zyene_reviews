import Link from "next/link";
import { SIGNUP_URL } from "@/config/env";
import { COMPARE_HUB_RESOURCE_LINKS } from "./compare-hub-content";

export function CompareHubLinksSection() {
    return (
        <section className="marketing-section" aria-labelledby="compare-resources-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Keep researching</p>
                    <h2 id="compare-resources-heading">Compare pages &amp; buyer guides</h2>
                    <p>Drill into each competitor, then validate pricing and workflows on your own quote.</p>
                </div>
                <nav aria-label="Compare hub related links" className="mi-chips">
                    {COMPARE_HUB_RESOURCE_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href === "/signup" ? SIGNUP_URL : link.href}
                            {...(link.href === "/signup" ? { "data-track": "trial", "data-track-location": "compare-resources" } : {})}
                        >
                            {link.href === "/signup" ? "Start 7-day free trial" : link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </section>
    );
}
