import { notFound } from "next/navigation";
import { AccessError } from "@/components/public/access-error";
import { loadWidgetPageData } from "./load-widget-page-data";
import { WidgetPageContentSection } from "./widget-page-content-section";

/**
 * Embeddable widget: loaded in third-party iframes without auth.
 * Uses service role only to read public review data (RLS requires org membership for anon).
 */
export default async function WidgetPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ type?: string }>;
}) {
    const { slug } = await params;
    const resolvedSearch = searchParams ? await searchParams : undefined;
    const widgetType = (resolvedSearch?.type || "carousel").toLowerCase();
    const data = await loadWidgetPageData(slug, widgetType);

    if (data.kind === "not-found") {
        notFound();
    }

    if (data.kind === "subscription") {
        return <AccessError type="subscription" businessName={data.businessName} />;
    }

    return <WidgetPageContentSection {...data} />;
}
