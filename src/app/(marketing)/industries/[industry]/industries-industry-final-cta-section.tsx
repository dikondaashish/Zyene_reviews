import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import type { IndustryData } from "@/lib/industries/industry-data";

const NEXT_LINKS = [
    { label: "See all features", href: "/features" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Other industries", href: "/industries" },
];

export function IndustriesIndustryFinalCtaSection({ data }: { data: IndustryData }) {
    return (
        <MarketingClosingBand
            title={data.ctaJoinCopy}
            text="Try it free for 7 days. Card required. Your plan bills after the trial unless you cancel before day 7."
            primaryLabel="Start free trial"
            secondary={{ label: "Book a demo", href: "/demo" }}
            trackLocation="industry-cta"
            aside={
                <nav aria-label="Keep exploring" className="ind-final-links">
                    {NEXT_LINKS.map((link) => (
                        <Link key={link.href} href={link.href}>
                            {link.label} <ArrowUpRight size={18} aria-hidden="true" />
                        </Link>
                    ))}
                </nav>
            }
        />
    );
}
