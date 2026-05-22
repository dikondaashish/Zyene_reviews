import { permanentRedirect } from "next/navigation";
import { CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";

export function generateStaticParams() {
    return CASE_STUDY_SLUGS.map((customerId) => ({ customerId }));
}

export default async function CustomerCaseStudyRedirectPage({
    params,
}: {
    params: Promise<{ customerId: string }>;
}) {
    const { customerId } = await params;
    permanentRedirect(`/case-studies/${customerId}`);
}
