import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/social-proof/case-study-data";
import { CaseStudiesSlugHeaderSection } from "./case-studies-slug-header-section";
import { CaseStudiesSlugChallengeSection } from "./case-studies-slug-challenge-section";
import { CaseStudiesSlugApproachSection } from "./case-studies-slug-approach-section";
import { CaseStudiesSlugResultsSection } from "./case-studies-slug-results-section";
import { CaseStudiesSlugQuoteSection } from "./case-studies-slug-quote-section";
import { CaseStudiesSlugRelatedSection } from "./case-studies-slug-related-section";
import { CaseStudiesSlugCtaSection } from "./case-studies-slug-cta-section";

export default async function CaseStudyPage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const study = CASE_STUDY_MAP[slug];
    if (!study) notFound();

    const related = CASE_STUDY_SLUGS.filter((s) => s !== slug)
        .slice(0, 2)
        .map((s) => CASE_STUDY_MAP[s]);

    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://www.zyenereviews.com/" },
                                { name: "Case Studies", url: "https://www.zyenereviews.com/case-studies" },
                                { name: study.company, url: `https://www.zyenereviews.com/case-studies/${slug}` },
                            ]}
                        />
            <CaseStudiesSlugHeaderSection study={study} slug={slug} related={related} />
            <CaseStudiesSlugChallengeSection study={study} slug={slug} related={related} />
            <CaseStudiesSlugApproachSection study={study} slug={slug} related={related} />
            <CaseStudiesSlugResultsSection study={study} slug={slug} related={related} />
            <CaseStudiesSlugQuoteSection study={study} slug={slug} related={related} />
            <CaseStudiesSlugRelatedSection study={study} slug={slug} related={related} />
            <CaseStudiesSlugCtaSection study={study} slug={slug} related={related} />
        </>
    );
}
