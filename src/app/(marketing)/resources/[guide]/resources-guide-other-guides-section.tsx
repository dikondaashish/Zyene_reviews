import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { RESOURCE_GUIDES } from "@/lib/content/resource-data";

export function ResourcesGuideOtherGuidesSection({ otherGuides }: { otherGuides: typeof RESOURCE_GUIDES }) {
    if (otherGuides.length === 0) return null;
    return (
        <section className="marketing-section" aria-labelledby="resource-more-guides-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Keep reading</p>
                    <h2 id="resource-more-guides-heading">More free guides</h2>
                    <Link href="/resources" className="home-text-link">
                        All guides <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>
                <ul className="mi-cards">
                    {otherGuides.map((g) => (
                        <li key={g.slug} className="flex">
                            <Link href={`/resources/${g.slug}`} className="mi-card w-full">
                                <BookOpen size={20} aria-hidden="true" />
                                <h3>{g.title}</h3>
                                <span className="mi-card-meta">{g.readMinutes} min read</span>
                                <span className="home-text-link">
                                    Read guide <ArrowRight size={14} aria-hidden="true" />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
