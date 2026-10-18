import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugCtaSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    return (
        <MarketingClosingBand
            title={`Build a review routine for your ${study.industry.toLowerCase()} team.`}
            text="Start a 7-day free trial to explore the workflow at your own pace, with no annual contract."
            trackLocation="case-study-slug"
        />
    );
}
