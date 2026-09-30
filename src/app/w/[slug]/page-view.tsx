import { buildPlgMarketingUrl } from "@/lib/growth/plg-attribution";
import { notFound } from "next/navigation";
import { AccessError } from "@/components/public/access-error";
import { loadWidgetPageData } from "@/app/w/[slug]/load-widget-page-data";
import { WidgetPageContentSection } from "@/app/w/[slug]/widget-page-content-section";
import { parseWidgetConfig } from "@/lib/widgets/config";
import { ConfigurableReviewWidget } from "@/components/widgets/configurable-review-widget";

/**
 * Embeddable widget: loaded in third-party iframes without auth.
 * Uses service role only to read public review data (RLS requires org membership for anon).
 */
export default async function WidgetPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ type?: string | string[]; config?: string | string[] }>;
}) {
    const { slug } = await params;
    const resolvedSearch = searchParams ? await searchParams : undefined;
    const widgetType = (typeof resolvedSearch?.type === "string" ? resolvedSearch.type : "carousel").toLowerCase();
    const configured = resolvedSearch?.config !== undefined;
    const data = await loadWidgetPageData(slug, widgetType, configured);

    if (data.kind === "not-found") {
        notFound();
    }

    if (data.kind === "subscription") {
        return <AccessError type="subscription" businessName={data.businessName} />;
    }

    return configured ? <ConfigurableReviewWidget creditUrl={buildPlgMarketingUrl("widget")} config={parseWidgetConfig(resolvedSearch?.config)}
        data={{ ...data, reviews: data.formattedReviews }} /> : <WidgetPageContentSection {...data} />;
}
