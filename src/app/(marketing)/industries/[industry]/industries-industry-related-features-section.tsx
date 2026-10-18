import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { IndustryData } from "@/lib/industries/industry-data";
import type { IndustryPageContent } from "@/lib/industries/industry-page-content";
import { FEATURE_PILLAR_MAP } from "@/lib/growth/feature-pillars";

/** Lowercases ordinary words but keeps acronyms: "HVAC Companies" -> "HVAC companies". */
function sentenceCase(name: string): string {
    return name.replace(/\b([A-Z])([a-z])/g, (_, first: string, rest: string) => first.toLowerCase() + rest);
}

/** The 2-3 feature pages most relevant to this industry. Feature pages link back via relatedPillars. */
export function IndustriesIndustryRelatedFeaturesSection({ data, content }: { data: IndustryData; content: IndustryPageContent }) {
    return (
        <section className="marketing-section fl-related" aria-labelledby="ind-features-heading">
            <div className="marketing-container">
                <div className="home-section-head">
                    <p className="marketing-eyebrow">Features</p>
                    <h2 id="ind-features-heading">What {sentenceCase(data.name)} use most</h2>
                </div>
                <ul className="fl-related-list">
                    {content.relatedPillars.map((slug) => {
                        const page = FEATURE_PILLAR_MAP[slug];
                        return (
                            <li key={slug}>
                                <Link href={`/features/${slug}`} className="fl-related-link">
                                    <h3>{page.navLabel}</h3>
                                    <p>{page.tagline}</p>
                                    <span className="home-text-link">
                                        Learn more<span className="sr-only">: {page.navLabel}</span> <ArrowRight size={14} aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
