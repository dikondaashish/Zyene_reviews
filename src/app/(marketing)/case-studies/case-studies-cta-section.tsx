import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function CaseStudiesCtaSection() {
    return (
        <MarketingClosingBand
            title="Ready to build your own review routine?"
            text="Start a 7-day free trial to explore requests, AI-assisted replies, and local review insights. No annual contract."
            image={{ src: "/images/industries/dental-candid-v2.webp", alt: "Dental team preparing instruments beside an empty treatment chair" }}
            trackLocation="case-studies-cta"
        />
    );
}
