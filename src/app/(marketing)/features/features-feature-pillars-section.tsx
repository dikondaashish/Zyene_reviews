import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { FEATURE_CATEGORIES, featurePillarsByCategory } from "@/lib/growth/feature-pillars";
import { FEATURE_NAV_ICONS } from "@/app/(marketing)/marketing-layout-nav-product-groups";

/** /features index: every feature page, grouped the way the app is used. */
export function FeaturesFeaturePillarsSection() {
    return (
        <section className="marketing-section" aria-labelledby="features-groups-heading">
            <div className="marketing-container">
                <div className="marketing-section-heading">
                    <h2 id="features-groups-heading">Every review moment.<br />One connected routine.</h2>
                    <p>Each feature has its own page with the full workflow, the details and answers to common questions.</p>
                </div>
                <div className="features-groups">
                    {FEATURE_CATEGORIES.map((category, index) => (
                        <section key={category.id} id={category.id} className="features-group" aria-labelledby={`features-group-${category.id}`}>
                            <header>
                                <span className="features-group-index">{String(index + 1).padStart(2, "0")}</span>
                                <h3 id={`features-group-${category.id}`}>{category.label}</h3>
                                <p>{category.description}</p>
                            </header>
                            <ul className="features-group-grid">
                                {featurePillarsByCategory(category.id).map((page) => {
                                    const Icon = FEATURE_NAV_ICONS[page.slug];
                                    return (
                                        <li key={page.slug}>
                                            <Link href={`/features/${page.slug}`} className="features-card">
                                                <span className="features-card-icon" aria-hidden="true"><Icon size={20} /></span>
                                                <h4>{page.navLabel}</h4>
                                                <p>{page.tagline}</p>
                                                <ul>
                                                    {page.bullets.slice(0, 3).map((bullet) => (
                                                        <li key={bullet}><Check size={14} aria-hidden="true" />{bullet}</li>
                                                    ))}
                                                </ul>
                                                <span className="features-card-link">Explore <ArrowRight size={15} aria-hidden="true" /></span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </section>
    );
}
