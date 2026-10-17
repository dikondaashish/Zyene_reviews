import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function IndustriesCtaSection() {
    return (
        <MarketingClosingBand
            title="Turn everyday visits into a stronger reputation."
            text="Try Zyene free for 7 days. Plans start at $29.99 a month and you can cancel anytime."
            primaryLabel="Start free trial"
            secondary={{ label: "See pricing", href: "/pricing" }}
            image={{ src: "/images/industries/salons-candid-v2.webp", alt: "Hair stylist combing a client's hair in a neighborhood salon" }}
            trackLocation="industries-cta"
        />
    );
}
