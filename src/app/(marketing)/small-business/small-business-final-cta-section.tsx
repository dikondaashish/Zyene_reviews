import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function SmallBusinessFinalCtaSection() {
    return (
        <MarketingClosingBand
            title="Ready to build a steady review routine?"
            text="Start with Starter for one location, or Professional for up to three. Larger groups can look at Enterprise."
            image={{ src: "/marketing/home/cafe-owner-feedback-candid-v2.webp", alt: "A café owner in an apron reading something on a tablet behind the counter" }}
            trackLocation="small-business-final"
        />
    );
}
