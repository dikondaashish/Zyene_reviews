import { IndustryWorkflowSection } from "@/components/marketing/industry-workflow-section";
import { MarketingFaqSection } from "@/components/marketing/marketing-faq-section";
import { BreadcrumbJsonLd, FAQPageJsonLd, IndustryLocalBusinessJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { INDUSTRY_MAP } from "@/lib/industries/industry-data";
import { INDUSTRY_PAGE_CONTENT } from "@/lib/industries/industry-page-content";
import { IndustriesIndustryHeroSection } from "./industries-industry-hero-section";
import { IndustriesIndustryPainPointsSection } from "./industries-industry-pain-points-section";
import { IndustriesIndustryHowZyeneSolvesItSection } from "./industries-industry-how-zyene-solves-it-section";
import { IndustriesIndustryUseCaseSection } from "./industries-industry-use-case-section";
import { IndustriesIndustryRelatedFeaturesSection } from "./industries-industry-related-features-section";
import { IndustriesIndustryPricingReminderSection } from "./industries-industry-pricing-reminder-section";
import { IndustriesIndustryFinalCtaSection } from "./industries-industry-final-cta-section";
import { IndustriesHomeServicesTradesSection } from "./industries-home-services-trades-section";

export default async function IndustryPage(
    { params }: { params: Promise<{ industry: string }> }
) {
    const { industry: slug } = await params;
    const data = INDUSTRY_MAP[slug];
    const content = INDUSTRY_PAGE_CONTENT[slug];
    if (!data || !content) notFound();

    return (
        <div className="ind-page">
            <IndustryLocalBusinessJsonLd data={data} slug={slug} />
            {/* Same array feeds the visible FAQ below, so schema and page text always match. */}
            <FAQPageJsonLd faqs={content.faqs} />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Industries", url: "https://www.zyenereviews.com/industries" },
                    { name: data.name, url: `https://www.zyenereviews.com/industries/${slug}` },
                ]}
            />
            <IndustriesIndustryHeroSection data={data} slug={slug} />
            <IndustriesIndustryPainPointsSection data={data} content={content} />
            <IndustriesIndustryHowZyeneSolvesItSection data={data} content={content} />
            {slug === "home-services" ? <IndustriesHomeServicesTradesSection /> : null}
            <IndustriesIndustryUseCaseSection data={data} content={content} />
            <IndustryWorkflowSection slug={slug} />
            <IndustriesIndustryRelatedFeaturesSection data={data} content={content} />
            <MarketingFaqSection faqs={content.faqs} headingId="ind-faq-heading" title={content.headings.faq} />
            <IndustriesIndustryPricingReminderSection heading={content.headings.pricing} />
            <IndustriesIndustryFinalCtaSection data={data} />
        </div>
    );
}
