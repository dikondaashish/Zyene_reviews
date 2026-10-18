import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function CompareCtaSection() {
    return (
        <MarketingClosingBand
            title="Ready to switch - or start fresh?"
            text="Try Zyene Reviews free for 7 days. Full access, card required; your selected plan bills automatically after the trial unless you cancel. Cancel before day 7 and pay nothing."
            image={{ src: "/images/industries/auto-repair-candid-v2.webp", alt: "Mechanic working with tools beneath an open car bonnet" }}
            trackLocation="compare-cta"
        />
    );
}
