import { getReviewCaptureOrigin } from "@/config/env";

export type CampaignPreviewContext = { businessName: string; slug: string; timezone: string };

/** Preview only: the recipient name and request tracking link are personalized at send time. */
export function renderCampaignPreview(template: string, context: CampaignPreviewContext): string {
    const values: Record<string, string> = {
        customer_name: "Sample customer",
        business_name: context.businessName,
        review_link: `${getReviewCaptureOrigin()}/${encodeURIComponent(context.slug)}`,
    };
    return template.replace(/\{(customer_name|business_name|review_link)\}/g, (_, key: string) => values[key]);
}
