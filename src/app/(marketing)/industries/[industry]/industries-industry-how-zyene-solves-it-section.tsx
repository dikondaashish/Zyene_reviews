import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IndustryLeadVisual } from "@/components/marketing/industries/industry-lead-visual";
import type { IndustryData } from "@/lib/industries/industry-data";
import type { IndustryPageContent } from "@/lib/industries/industry-page-content";

/** The industry's lead workflow gets a product panel; the other solutions read as a quiet list beside it. */
export function IndustriesIndustryHowZyeneSolvesItSection({ data, content }: { data: IndustryData; content: IndustryPageContent }) {
    const { lead } = content;
    const rest = data.solutions.filter((_, i) => i !== lead.replacesSolution);

    return (
        <section className="marketing-section" aria-labelledby="ind-solve-heading">
            <div className="marketing-container">
                <div className="home-section-head">
                    <p className="marketing-eyebrow">How Zyene helps</p>
                    <h2 id="ind-solve-heading">{content.headings.solve}</h2>
                </div>
                <div className="ind-solve">
                    <article className="ind-solve-lead">
                        <div>
                            <h3>{lead.title}</h3>
                            <p>{lead.description}</p>
                            <Link href={lead.link.href} className="home-text-link">
                                {lead.link.label} <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                        <figure className="ind-solve-visual" aria-label={lead.visualLabel}>
                            <IndustryLeadVisual visual={lead.visual} />
                        </figure>
                    </article>
                    <ul className="ind-solve-list">
                        {rest.map((solution) => (
                            <li key={solution.title}>
                                <h3>{solution.title}</h3>
                                <p>{solution.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
