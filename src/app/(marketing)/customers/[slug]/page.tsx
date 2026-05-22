import { permanentRedirect } from "next/navigation";
import { CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";

export function generateStaticParams() {
    return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

export default async function CustomerCaseStudyRedirectPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    permanentRedirect(`/case-studies/${slug}`);
}
