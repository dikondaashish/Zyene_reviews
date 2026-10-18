import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMPETITORS } from "@/lib/comparisons/competitor-data";

export function CompareCardsSection() {
    return (
        <section className="marketing-section" aria-labelledby="compare-cards-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Comparisons</p>
                    <h2 id="compare-cards-heading">Pick a comparison</h2>
                    <p>Each page has a full feature-by-feature breakdown, honest analysis, and pricing comparison.</p>
                </div>
                <ul className="mi-cards" data-cols="3">
                    {COMPETITORS.map((comp) => (
                        <li key={comp.slug} className="flex">
                            <Link href={`/compare/${comp.slug}`} className="mi-card w-full">
                                <h3>vs {comp.name}</h3>
                                <p className="mi-card-meta">{comp.name} pricing</p>
                                <p className="mi-card-value">{comp.price}</p>
                                {comp.priceNote ? <p className="mi-card-meta">{comp.priceNote}</p> : null}
                                <p>{comp.keyAngle}</p>
                                <span className="home-text-link">
                                    Read full comparison <ArrowRight size={14} aria-hidden="true" />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <p className="cmp-hub-aside">
                    <Link href="/blog/birdeye-pricing-breakdown-2026" className="home-text-link">
                        Birdeye pricing deep dive (2026) <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </p>
            </div>
        </section>
    );
}
