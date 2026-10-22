import { getReviewCaptureOrigin } from "@/config/env";

export type CampaignPreviewContext = {
    businessName: string;
    slug: string;
    timezone: string;
    /** Valid Support Email that customer replies go to; null when none is set. */
    replyEmail?: string | null;
};

/** Preview only: the recipient name and request tracking link are personalized at send time. */
export function renderCampaignPreview(template: string, context: CampaignPreviewContext): string {
    const values: Record<string, string> = {
        first_name: "Alex",
        customer_name: "Alex Sample",
        business_name: context.businessName,
        review_link: `${getReviewCaptureOrigin()}/${encodeURIComponent(context.slug)}`,
    };
    return template.replace(/\{(first_name|customer_name|business_name|review_link)\}/g, (_, key: string) => values[key]);
}
