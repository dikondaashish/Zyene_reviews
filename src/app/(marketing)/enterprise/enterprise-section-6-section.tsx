import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function EnterpriseSection6Section() {
    return (
        <MarketingClosingBand
            title="Ready to talk about your locations?"
            text="Tell us about your locations and team, and we will walk you through a rollout that fits."
            primaryLabel="Book a demo"
            primaryHref="/demo"
            secondary={{ label: "Start 7-day free trial", href: "/signup" }}
            image={{ src: "/images/industries/restaurant-guests.webp", alt: "Guests sharing a meal and conversation at a restaurant" }}
            trackLocation="enterprise-final"
        />
    );
}
