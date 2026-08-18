import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";
import { isLiveCrawlingEnabled } from "@/lib/features/aeo-surfaces";
import { computeRenderingDelta } from "@/services/aeo/technical-audit/rendering-delta";
import { renderVisibleText } from "@/services/aeo/technical-audit/headless-renderer";
import { fetchPageSpeed } from "@/services/aeo/technical-audit/pagespeed";
import { PageDiagnosticStore } from "@/services/aeo/technical-audit/page-diagnostic-store";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { listSearchConsoleProperties } from "@/services/google/search-console";
import { inspectSearchConsoleUrl } from "@/services/google/url-inspection";

export const aeoPageDiagnosticWorker = inngest.createFunction(
    { id: "aeo-page-diagnostic-worker", concurrency: { key: "event.data.businessId", limit: 2 }, retries: 1 },
    { event: "aeo/page-diagnostic.requested" },
    async ({ event, step }) => {
        if (!isLiveCrawlingEnabled()) return { skipped: "live_crawling_disabled" as const };
        const { pageId, url, businessId } = event.data;
        const admin = createAdminClient();
        const store = new PageDiagnosticStore(admin);
        const rawHtml = await store.loadRawHtml(pageId);

        const render = rawHtml ? await step.run("render-delta", async () => {
            try { return computeRenderingDelta(rawHtml, await renderVisibleText(url)); }
            catch (error) { logger.warn({ err: error, url }, "AEO headless render failed"); return null; }
        }) : null;
        const speed = await step.run("pagespeed", async () => {
            try { return await fetchPageSpeed(url); }
            catch (error) { logger.warn({ err: error, url }, "AEO PageSpeed request failed"); return null; }
        });
        const index = await step.run("url-inspection", () => inspectIfConnected(admin, businessId, url));
        await step.run("persist-diagnostics", () => store.persist({ businessId, pageId, url, render, speed, index }));
        return { pageId, rendered: Boolean(render), pageSpeed: Boolean(speed), indexStatus: index?.status ?? "not_checked" };
    }
);

async function inspectIfConnected(admin: ReturnType<typeof createAdminClient>, businessId: string, url: string) {
    const platform = await admin.from("review_platforms").select("id, granted_scopes")
        .eq("business_id", businessId).eq("platform", "google").limit(1).maybeSingle();
    if (platform.error || !platform.data) return null;
    const token = await getValidGoogleToken(platform.data.id);
    if (!token.accessToken) return null;
    const properties = await listSearchConsoleProperties(token.accessToken, platform.data.granted_scopes);
    if (!properties.ok) return null;
    const site = properties.data.find((entry) => belongsToProperty(url, entry.siteUrl));
    if (!site) return null;
    return inspectSearchConsoleUrl({ accessToken: token.accessToken, grantedScopes: platform.data.granted_scopes, inspectionUrl: url, siteUrl: site.siteUrl });
}

function belongsToProperty(url: string, property: string): boolean {
    if (property.startsWith("sc-domain:")) return new URL(url).hostname.endsWith(property.slice(10));
    return url.startsWith(property);
}
