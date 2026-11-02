import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { resourceImage } from "@/components/marketing/resource-imagery";
import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import { CampaignsTemplatesVisual } from "@/components/marketing/feature-landing/visuals/review-campaigns-visuals";
import { RESOURCE_GUIDES } from "@/lib/content/resource-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export default function ResourcesHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Resources", url: "https://www.zyenereviews.com/resources" },
                ]}
            />

            <LandingHero
                eyebrow="The resource library"
                title="Small steps. A stronger local presence."
                description="Go deeper with practical guides to Google reviews, local SEO, and customer feedback. Free to read, ready to use."
                media={{ kind: "product", label: "Review request templates in Zyene", node: <div className="mi-visual"><CampaignsTemplatesVisual /></div> }}
            />

            <section className="marketing-section" aria-labelledby="resources-guides-heading">
                <div className="marketing-container">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">Free guides</p>
                        <h2 id="resources-guides-heading">Guides you can put to work this week.</h2>
                    </div>
                    <ul className="mi-cards" data-cols="2">
                        {RESOURCE_GUIDES.map((guide) => {
                            const image = resourceImage(guide.slug);
                            return (
                                <li key={guide.slug} className="flex">
                                    <Link href={`/resources/${guide.slug}`} className="mi-card mi-photo-card w-full">
                                        <div className="resource-photo">
                                            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 767px) 100vw, 45vw" />
                                        </div>
                                        <div className="mi-photo-card-body">
                                            <span className="mi-card-meta inline-flex items-center gap-1.5">
                                                <Clock size={14} aria-hidden="true" /> {guide.readMinutes} min read
                                            </span>
                                            <h3>{guide.title}</h3>
                                            <p>{guide.excerpt}</p>
                                            <span className="home-text-link">
                                                Read guide <ArrowRight size={14} aria-hidden="true" />
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby="resources-blog-heading">
                <div className="marketing-container">
                    <div className="mi-panel">
                        <h2 id="resources-blog-heading">Looking for shorter reads?</h2>
                        <p>Visit our blog for practical posts on Google reviews, local SEO, and reputation management.</p>
                        <div className="mi-panel-foot">
                            <Link href="/blog" className="home-text-link">
                                Browse the blog <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingClosingBand
                title="Ready to put this into practice?"
                text="Zyene Reviews automates review collection, AI replies, competitor tracking, and more. 7-day free trial, card required; your selected plan bills automatically after the trial unless you cancel."
                image={{ src: "/marketing/home/storefront-candid-v2.webp", alt: "Customers at outdoor tables in front of a small local café" }}
                trackLocation="resources-cta"
                headingId="resources-final-heading"
            />
        </>
    );
}
