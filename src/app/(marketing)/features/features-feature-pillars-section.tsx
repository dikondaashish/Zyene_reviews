import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FEATURE_CATEGORIES, featurePillarsByCategory } from "@/lib/growth/feature-pillars";

/** /features index: every feature page, grouped the way the app is used. */
export function FeaturesFeaturePillarsSection() {
    return (
        <section className="marketing-section" aria-labelledby="features-groups-heading">
            <div className="marketing-container">
                <h2 id="features-groups-heading" className="fl-section-title">Every review moment, one connected routine.</h2>
                <div className="features-groups">
                    {FEATURE_CATEGORIES.map((category) => (
                        <section key={category.id} id={category.id} className="features-group" aria-labelledby={`features-group-${category.id}`}>
                            <header>
                                <h3 id={`features-group-${category.id}`}>{category.label}</h3>
                                <p>{category.description}</p>
                            </header>
                            <ul className="features-group-list">
                                {featurePillarsByCategory(category.id).map((page) => (
                                    <li key={page.slug}>
                                        <Link href={`/features/${page.slug}`} className="features-link">
                                            <h4>{page.navLabel} <ArrowRight size={15} aria-hidden="true" /></h4>
                                            <p>{page.tagline}</p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </section>
    );
}
