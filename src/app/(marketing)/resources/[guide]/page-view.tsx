import { BreadcrumbJsonLd, FAQPageJsonLd, HowToJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { RESOURCE_MAP, RESOURCE_GUIDES } from "@/lib/phase4/resource-data";
import { ResourcesGuideGuideHeaderSection } from "./resources-guide-guide-header-section";
import { ResourcesGuideContentSidebarSection } from "./resources-guide-content-sidebar-section";
import { ResourcesGuideOtherGuidesSection } from "./resources-guide-other-guides-section";
import { ResourcesGuideTemplatePackLeadSection } from "./resources-guide-template-pack-lead-section";
import { LocalSeoChecklistPageAnalytics } from "@/components/marketing/local-seo-checklist-page-analytics";
import { TemplatePackPageAnalytics } from "@/components/marketing/template-pack-page-analytics";

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
            <ResourcesGuideOtherGuidesSection otherGuides={otherGuides} />
        </>
    );
}
