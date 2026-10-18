import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function AgenciesSection6Section() {
    return (
        <MarketingClosingBand
            title="Ready to talk about your clients?"
            text="Tell us about your client roster, and we will walk you through branded review flows, white-label options and pricing."
            primaryLabel="Book a demo"
            primaryHref="/demo"
            secondary={{ label: "Start 7-day free trial", href: "/signup" }}
            image={{ src: "/marketing/home/hero-local-owner.webp", alt: "A shop owner smiling at his phone behind the pastry counter of a small bakery" }}
            trackLocation="agencies-final"
        />
    );
}
