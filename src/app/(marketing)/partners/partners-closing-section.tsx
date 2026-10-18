import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function PartnersClosingSection() {
    return (
        <MarketingClosingBand
            title="Ready to grow with Zyene?"
            text="Tell us about the businesses you serve, and we will walk you through how Zyene fits their review routine."
            primaryLabel="Book a demo"
            primaryHref="/demo"
            secondary={{ label: "Explore the agency program", href: "/agencies" }}
            image={{ src: "/images/industries/salons-candid-v2.webp", alt: "Hair stylist combing a client's hair in a neighborhood salon" }}
            trackLocation="partners-final"
        />
    );
}
