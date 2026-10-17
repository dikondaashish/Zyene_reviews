import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getIndustryImage } from "@/lib/industries/industry-imagery";

const TRADES = [
    {
        slug: "hvac",
        title: "HVAC companies",
        description: "Seasonal review requests, private pricing follow-up, and a stronger profile for emergency calls.",
    },
    {
        slug: "plumbing",
        title: "Plumbing companies",
        description: "Turn completed repairs into Google reviews and keep billing surprises in a private conversation.",
    },
    {
        slug: "electricians",
        title: "Electricians",
        description: "Requests after panel upgrades and rewires, with private follow-up when a job needs a second look.",
    },
];

export function IndustriesHomeServicesTradesSection() {
    return (
        <section className="marketing-section" aria-labelledby="ind-trades-heading">
            <div className="marketing-container">
                <div className="home-section-head">
                    <p className="marketing-eyebrow">By trade</p>
                    <h2 id="ind-trades-heading">Pages for each trade.</h2>
                </div>
                <ul className="ind-dir-items" data-count="3">
                    {TRADES.map((trade) => {
                        const photo = getIndustryImage(trade.slug, trade.title);
                        return (
                            <li key={trade.slug}>
                                <Link href={`/industries/${trade.slug}`} className="ind-dir-link">
                                    <span className="ind-dir-photo">
                                        <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 100vw, 380px" />
                                    </span>
                                    <span className="ind-dir-name">
                                        {trade.title}
                                        <ArrowUpRight size={16} aria-hidden="true" />
                                    </span>
                                    <span className="ind-dir-line">{trade.description}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
