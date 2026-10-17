import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IndustryAutoReplyVisual } from "@/components/marketing/industries/industry-auto-reply-visual";
import type { IndustryData } from "@/lib/industries/industry-data";

/** The reply solution gets a product panel; the others read as a quiet list beside it. */
export function IndustriesIndustryHowZyeneSolvesItSection({ data }: { data: IndustryData }) {
    const leadIndex = Math.max(0, data.solutions.findIndex((s) => /repl/i.test(s.title)));
    const lead = data.solutions[leadIndex];
    const rest = data.solutions.filter((_, i) => i !== leadIndex);

    return (
        <section className="marketing-section" aria-labelledby="ind-solve-heading">
            <div className="marketing-container">
                <div className="home-section-head">
                    <p className="marketing-eyebrow">How Zyene helps</p>
                    <h2 id="ind-solve-heading">Built around your working day.</h2>
                </div>
                <div className="ind-solve">
                    <article className="ind-solve-lead">
                        <div>
                            <h3>{lead.title}</h3>
                            <p>{lead.description}</p>
                            <Link href="/features/ai-replies" className="home-text-link">
                                AI drafts and automatic replies <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                        <IndustryAutoReplyVisual />
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
