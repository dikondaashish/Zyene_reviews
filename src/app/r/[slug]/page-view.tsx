import { notFound } from "next/navigation";
import { AccessError } from "@/components/public/access-error";
import { loadReviewPageData } from "./load-review-page-data";
import { ReviewPageFlowSection } from "./review-page-flow-section";

export default async function RequestPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ ref?: string }>;
}) {
    const { ref: requestId } = await searchParams;
    const { slug } = await params;
    const data = await loadReviewPageData(slug, requestId);

    if (data.kind === "not-found") {
        return notFound();
    }

    if (data.kind === "subscription") {
        return <AccessError type="subscription" businessName={data.businessName} />;
    }

    if (data.kind === "platform") {
        return <AccessError type="platform" businessName={data.businessName} />;
    }

    return <ReviewPageFlowSection {...data} />;
}
