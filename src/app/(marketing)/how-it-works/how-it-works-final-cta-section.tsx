import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function HowItWorksFinalCtaSection() {
    return (
        <MarketingClosingBand
            title="Ready to try it yourself?"
            text="7-day free trial with full access to every feature. Card required. Your selected plan bills automatically after the trial unless you cancel. Cancel anytime before day 7."
            image={{ src: "/images/industries/salons-candid-v2.webp", alt: "Hair stylist combing a client's hair in a neighborhood salon" }}
            trackLocation="how-it-works-cta"
        />
    );
}
