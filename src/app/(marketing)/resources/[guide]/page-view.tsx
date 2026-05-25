import { BreadcrumbJsonLd, FAQPageJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { RESOURCE_MAP, RESOURCE_GUIDES } from "@/lib/phase4/resource-data";
import { ResourcesGuideGuideHeaderSection } from "./resources-guide-guide-header-section";
import { ResourcesGuideContentSidebarSection } from "./resources-guide-content-sidebar-section";
import { ResourcesGuideOtherGuidesSection } from "./resources-guide-other-guides-section";

export default async function ResourceGuidePage(
    { params }: { params: Promise<{ guide: string }> }
) {
    const { guide: slug } = await params;
    const resource = RESOURCE_MAP[slug];
    if (!resource) notFound();

    const otherGuides = RESOURCE_GUIDES.filter((g) => g.slug !== slug).slice(0, 3);

    const faqs = resource.faqs ?? [];

    return (
        <>
            {faqs.length > 0 ? <FAQPageJsonLd faqs={faqs} /> : null}
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Resources", url: "https://zyenereviews.com/resources" },
                    { name: resource.title, url: `https://zyenereviews.com/resources/${slug}` },
                ]}
            />
            <ResourcesGuideGuideHeaderSection resource={resource} />
            <ResourcesGuideContentSidebarSection resource={resource} otherGuides={otherGuides} />
            <ResourcesGuideOtherGuidesSection otherGuides={otherGuides} />
        </>
    );
}
