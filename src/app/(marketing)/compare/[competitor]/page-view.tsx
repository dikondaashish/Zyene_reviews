import { MarketingFaqSection } from "@/components/marketing/marketing-faq-section";
import { BreadcrumbJsonLd, FAQPageJsonLd, WebPageJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { COMPETITOR_MAP } from "@/lib/comparisons/competitor-data";
import { CompareCompetitorHeroSection } from "./compare-competitor-hero-section";
import { CompareCompetitorDifferencesSection } from "./compare-competitor-differences-section";
import { CompareCompetitorVisualSection } from "./compare-competitor-visual-section";
import { CompareCompetitorQuickComparisonTableSection } from "./compare-competitor-quick-comparison-table-section";
import { CompareCompetitorFullFeatureBreakdownSection } from "./compare-competitor-full-feature-breakdown-section";
import { CompareCompetitorWhoShouldUseWhichSection } from "./compare-competitor-who-should-use-which-section";
import { CompareCompetitorSwitchingSection } from "./compare-competitor-switching-section";
import { CompareCompetitorOtherComparisonsSection } from "./compare-competitor-other-comparisons-section";
import { CompareCompetitorFinalCtaSection } from "./compare-competitor-final-cta-section";

export default async function CompetitorPage(
    { params }: { params: Promise<{ competitor: string }> }
) {
    const { competitor: slug } = await params;
    const data = COMPETITOR_MAP[slug];
    if (!data) notFound();

    const pageUrl = `https://www.zyenereviews.com/compare/${slug}`;

    return (
        <>
            <WebPageJsonLd name={data.metaTitle} description={data.metaDescription} url={pageUrl} />
            {/* Same array feeds the visible FAQ below, so schema and page text always match. */}
            <FAQPageJsonLd faqs={data.faqs} />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Compare", url: "https://www.zyenereviews.com/compare" },
                    { name: `Zyene Reviews vs ${data.name}`, url: pageUrl },
                ]}
            />
            <CompareCompetitorHeroSection data={data} />
            <CompareCompetitorDifferencesSection data={data} />
            <CompareCompetitorVisualSection data={data} />
            <CompareCompetitorQuickComparisonTableSection data={data} />
            <CompareCompetitorFullFeatureBreakdownSection data={data} />
            <CompareCompetitorWhoShouldUseWhichSection data={data} />
            <CompareCompetitorSwitchingSection data={data} />
            <MarketingFaqSection faqs={data.faqs} headingId={`compare-${slug}-faq-heading`} title={`Questions about ${data.name} vs Zyene Reviews`} />
            <CompareCompetitorOtherComparisonsSection data={data} />
            <CompareCompetitorFinalCtaSection data={data} />
        </>
    );
}
