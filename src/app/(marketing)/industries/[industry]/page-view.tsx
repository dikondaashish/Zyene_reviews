import { BreadcrumbJsonLd, IndustryLocalBusinessJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { INDUSTRY_MAP } from "@/lib/phase3/industry-data";
import { IndustriesIndustryHeroSection } from "./industries-industry-hero-section";
import { IndustriesIndustryPainPointsSection } from "./industries-industry-pain-points-section";
import { IndustriesIndustryHowZyeneSolvesItSection } from "./industries-industry-how-zyene-solves-it-section";
import { IndustriesIndustryUseCaseSection } from "./industries-industry-use-case-section";
import { IndustriesIndustryPricingReminderSection } from "./industries-industry-pricing-reminder-section";
import { IndustriesIndustryFinalCtaSection } from "./industries-industry-final-cta-section";

export default async function IndustryPage(
    { params }: { params: Promise<{ industry: string }> }
) {
    const { industry: slug } = await params;
        const data = INDUSTRY_MAP[slug];
        if (!data) notFound();

    return (
        <>
            <IndustryLocalBusinessJsonLd data={data} slug={slug} />
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://zyenereviews.com/" },
                                { name: "Industries", url: "https://zyenereviews.com/industries" },
                                { name: data.name, url: `https://zyenereviews.com/industries/${slug}` },
                            ]}
                        />
            <IndustriesIndustryHeroSection data={data} slug={slug} />
            <IndustriesIndustryPainPointsSection data={data} />
            <IndustriesIndustryHowZyeneSolvesItSection data={data} />
            <IndustriesIndustryUseCaseSection data={data} />
            <IndustriesIndustryPricingReminderSection data={data} />
            <IndustriesIndustryFinalCtaSection data={data} />
        </>
    );
}
