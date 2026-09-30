import { notFound } from "next/navigation";
import { AccessError } from "@/components/public/access-error";
import { loadReviewPageData } from "./load-review-page-data";
import { ReviewPageFlowSection } from "./review-page-flow-section";

export default async function RequestPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ ref?: string; sig?: string }>;
}) {
    const data = await Promise.all([searchParams, params]).then(([{ ref: requestId, sig }, { slug }]) =>
        loadReviewPageData(slug, requestId, sig)
    );

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
