import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { INDUSTRY_MAP } from "@/lib/industries/industry-data";
import { INDUSTRY_GROUPS, getIndustryHeroCopy } from "@/lib/industries/industry-hero-copy";
import { getIndustryImage } from "@/lib/industries/industry-imagery";

/** Grouped directory: each group gets as many photos as it has industries, so no two rows look alike. */
export function IndustriesIndustryGridSection() {
    return (
        <section id="industry-grid" className="marketing-section" aria-labelledby="industry-grid-heading">
            <div className="marketing-container">
                <div className="home-section-head">
                    <p className="marketing-eyebrow">Industries</p>
                    <h2 id="industry-grid-heading">Pick the one that sounds like your week.</h2>
                </div>
                <div className="ind-dir">
                    {INDUSTRY_GROUPS.map((group) => (
                        <div key={group.label} className="ind-dir-group">
                            <div className="ind-dir-label">
                                <h3>{group.label}</h3>
                                <p>{group.text}</p>
                            </div>
                            <ul className="ind-dir-items" data-count={group.slugs.length}>
                                {group.slugs.map((slug) => {
                                    const industry = INDUSTRY_MAP[slug];
                                    if (!industry) return null;
                                    const photo = getIndustryImage(slug, industry.name);
                                    const copy = getIndustryHeroCopy(slug, industry.name, industry.heroSub);
                                    return (
                                        <li key={slug}>
                                            <Link href={`/industries/${slug}`} className="ind-dir-link">
                                                <span className="ind-dir-photo">
                                                    <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 420px" />
                                                </span>
                                                <span className="ind-dir-name">
                                                    {industry.name}
                                                    <ArrowUpRight size={16} aria-hidden="true" />
                                                </span>
                                                <span className="ind-dir-line">{copy.headline}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
