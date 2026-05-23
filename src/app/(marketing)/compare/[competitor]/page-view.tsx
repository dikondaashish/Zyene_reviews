import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { COMPETITOR_MAP } from "@/lib/phase3/competitor-data";
import { CompareCompetitorHeroSection } from "./compare-competitor-hero-section";
import { CompareCompetitorQuickComparisonTableSection } from "./compare-competitor-quick-comparison-table-section";
import { CompareCompetitorWhereEachWinsSection } from "./compare-competitor-where-each-wins-section";
import { CompareCompetitorFullFeatureBreakdownSection } from "./compare-competitor-full-feature-breakdown-section";
import { CompareCompetitorWhoShouldUseWhichSection } from "./compare-competitor-who-should-use-which-section";
import { CompareCompetitorOtherComparisonsSection } from "./compare-competitor-other-comparisons-section";
import { CompareCompetitorFinalCtaSection } from "./compare-competitor-final-cta-section";

export default async function CompetitorPage(
    { params }: { params: Promise<{ competitor: string }> }
) {
    const { competitor: slug } = await params;
    const data = COMPETITOR_MAP[slug];
    if (!data) notFound();

    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://zyenereviews.com/" },
                                { name: "Compare", url: "https://zyenereviews.com/compare" },
                                { name: `Zyene vs ${data.name}`, url: `https://zyenereviews.com/compare/${slug}` },
                            ]}
                        />
            <CompareCompetitorHeroSection data={data} />
            <CompareCompetitorQuickComparisonTableSection data={data} />
            <CompareCompetitorWhereEachWinsSection data={data} />
            <CompareCompetitorFullFeatureBreakdownSection data={data} />
            <CompareCompetitorWhoShouldUseWhichSection data={data} />
            <CompareCompetitorOtherComparisonsSection data={data} slug={slug} />
            <CompareCompetitorFinalCtaSection data={data} />
        </>
    );
}
