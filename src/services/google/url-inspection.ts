import { grantIncludesSearchConsole } from "./oauth-scopes";

export type IndexStatus = "indexed" | "discovered_not_indexed" | "crawled_not_indexed" | "excluded" | "unknown" | "not_checked";
export type InspectionIndexResult = { verdict?: string; coverageState?: string; robotsTxtState?: string; indexingState?: string; lastCrawlTime?: string };

export function classifyIndexStatus(result: InspectionIndexResult): IndexStatus {
    const coverage = result.coverageState?.toLowerCase() ?? "";
    if (result.verdict === "PASS" || /submitted and indexed|indexed, not submitted/.test(coverage)) return "indexed";
    if (coverage.includes("discovered") && coverage.includes("not indexed")) return "discovered_not_indexed";
    if (coverage.includes("crawled") && coverage.includes("not indexed")) return "crawled_not_indexed";
    if (result.verdict === "FAIL" || /excluded|blocked|duplicate|redirect|not found|noindex/.test(coverage)) return "excluded";
    return "unknown";
}

export async function inspectSearchConsoleUrl(input: {
    accessToken: string;
    grantedScopes: string | null;
    inspectionUrl: string;
    siteUrl: string;
}): Promise<{ status: IndexStatus; verdict: string; payload: Record<string, unknown> }> {
    if (!grantIncludesSearchConsole(input.grantedScopes)) {
        return { status: "not_checked", verdict: "scope_not_granted", payload: {} };
    }
    const response = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
        method: "POST",
        headers: { Authorization: `Bearer ${input.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionUrl: input.inspectionUrl, siteUrl: input.siteUrl, languageCode: "en-US" }),
        signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`URL Inspection HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    const payload = await response.json() as { inspectionResult?: { indexStatusResult?: InspectionIndexResult } };
    const result = payload.inspectionResult?.indexStatusResult ?? {};
    return { status: classifyIndexStatus(result), verdict: result.coverageState ?? result.verdict ?? "Unknown", payload: payload as Record<string, unknown> };
}
