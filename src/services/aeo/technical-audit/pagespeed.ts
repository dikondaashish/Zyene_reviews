export type PageSpeedDiagnostic = {
    lcpMs: number | null;
    cls: number | null;
    inpMs: number | null;
    performanceScore: number | null;
    basis: "field" | "lab" | "unavailable";
    sourcePayload: Record<string, unknown>;
};

type PsiPayload = {
    loadingExperience?: { metrics?: Record<string, { percentile?: number }> };
    lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: Record<string, { numericValue?: number }>;
    };
};

export function parsePageSpeedResult(payload: PsiPayload): PageSpeedDiagnostic {
    const field = payload.loadingExperience?.metrics ?? {};
    const audits = payload.lighthouseResult?.audits ?? {};
    const fieldLcp = field.LARGEST_CONTENTFUL_PAINT_MS?.percentile;
    const fieldCls = field.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile;
    const fieldInp = field.INTERACTION_TO_NEXT_PAINT?.percentile;
    const hasField = fieldLcp !== undefined || fieldCls !== undefined || fieldInp !== undefined;
    const score = payload.lighthouseResult?.categories?.performance?.score;
    return {
        lcpMs: fieldLcp ?? audits["largest-contentful-paint"]?.numericValue ?? null,
        cls: fieldCls !== undefined ? fieldCls / 100 : audits["cumulative-layout-shift"]?.numericValue ?? null,
        inpMs: fieldInp ?? audits["interaction-to-next-paint"]?.numericValue ?? null,
        performanceScore: score === undefined ? null : Math.round(score * 100),
        basis: hasField ? "field" : payload.lighthouseResult ? "lab" : "unavailable",
        sourcePayload: {
            fieldMetrics: field,
            lighthouseVersion: (payload as { lighthouseResult?: { lighthouseVersion?: string } }).lighthouseResult?.lighthouseVersion ?? null,
        },
    };
}

async function requestPageSpeed(url: string, apiKey?: string): Promise<Response> {
    const endpoint = new URL("https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("strategy", "mobile");
    endpoint.searchParams.append("category", "performance");
    if (apiKey?.trim()) endpoint.searchParams.set("key", apiKey.trim());
    return fetch(endpoint, { signal: AbortSignal.timeout(90_000) });
}

export async function fetchPageSpeed(url: string, apiKey = process.env.GOOGLE_API_KEY): Promise<PageSpeedDiagnostic> {
    const configuredKey = apiKey?.trim();
    let response = await requestPageSpeed(url, configuredKey);
    if (response.status === 403 && configuredKey) {
        response = await requestPageSpeed(url);
    }
    if (!response.ok) throw new Error(`PageSpeed HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    return parsePageSpeedResult(await response.json() as PsiPayload);
}
