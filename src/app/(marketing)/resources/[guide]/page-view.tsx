import { ArticleJsonLd, BreadcrumbJsonLd, FAQPageJsonLd, HowToJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { RESOURCE_MAP, RESOURCE_GUIDES } from "@/lib/content/resource-data";
import { ResourcesGuideGuideHeaderSection } from "./resources-guide-guide-header-section";
import { ResourcesGuideContentSidebarSection } from "./resources-guide-content-sidebar-section";
import { ResourcesGuideOtherGuidesSection } from "./resources-guide-other-guides-section";
import { ResourcesGuideTemplatePackLeadSection } from "./resources-guide-template-pack-lead-section";
import { LocalSeoChecklistPageAnalytics } from "@/components/marketing/local-seo-checklist-page-analytics";
import { TemplatePackPageAnalytics } from "@/components/marketing/template-pack-page-analytics";
import { MarketingFaqSection } from "@/components/marketing/marketing-faq-section";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export default async function ResourceGuidePage(
    { params }: { params: Promise<{ guide: string }> }
) {
    const { guide: slug } = await params;
    const resource = RESOURCE_MAP[slug];
    if (!resource) notFound();

    const otherGuides = RESOURCE_GUIDES.filter((g) => g.slug !== slug).slice(0, 3);

    const faqs = resource.faqs ?? [];
    const howToSteps = resource.howToSteps ?? [];

    return (
        <>
            <ArticleJsonLd resource={resource} />
            {faqs.length > 0 ? <FAQPageJsonLd faqs={faqs} /> : null}
            {howToSteps.length > 0 ? (
                <HowToJsonLd
                    name={resource.title}
                    description={resource.excerpt}
                    steps={howToSteps}
                />
            ) : null}
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Resources", url: "https://www.zyenereviews.com/resources" },
                    { name: resource.title, url: `https://www.zyenereviews.com/resources/${slug}` },
                ]}
            />
            <ResourcesGuideGuideHeaderSection resource={resource} />
            {slug === "review-request-templates" ? <TemplatePackPageAnalytics /> : null}
            {slug === "local-seo-checklist" ? <LocalSeoChecklistPageAnalytics /> : null}
            {resource.resourceLabel ? (
                <ResourcesGuideTemplatePackLeadSection resource={resource} />
            ) : null}
            <ResourcesGuideContentSidebarSection resource={resource} otherGuides={otherGuides} />
            <MarketingFaqSection faqs={faqs} headingId="resource-guide-faq-heading" />
            <ResourcesGuideOtherGuidesSection otherGuides={otherGuides} />
            <MarketingClosingBand
                title="Put this guide into practice with Zyene"
                text="Automate review collection, AI replies, and reputation protection. 7-day free trial, card required; your selected plan bills automatically after the trial unless you cancel."
                image={{ src: "/marketing/home/cafe-owner-feedback-candid-v2.webp", alt: "A café owner in an apron reading something on a tablet behind the counter" }}
                trackLocation="guide-footer"
                headingId="resource-guide-final-heading"
            />
        </>
    );
}
