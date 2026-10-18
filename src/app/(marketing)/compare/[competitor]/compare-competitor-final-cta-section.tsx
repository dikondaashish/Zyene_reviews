import type { CompetitorData } from "@/lib/comparisons/competitor-data";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function CompareCompetitorFinalCtaSection({ data }: { data: CompetitorData }) {
    return (
        <MarketingClosingBand
            title="Try Zyene Reviews free for 7 days"
            text={`No annual contract. Card required. Your selected plan bills automatically after the trial unless you cancel. Cancel before day 7 and pay nothing. Already using ${data.name}? We can help you plan the move.`}
            image={{ src: "/marketing/home/cafe-conversation.webp", alt: "A barista talking with a customer at work" }}
            trackLocation="competitor-cta"
        />
    );
}
